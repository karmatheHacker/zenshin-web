import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Configuration ---
const DURATION_MS = 10000;
const CONCURRENCY_LEVELS = [10, 50, 100]; // Higher concurrency for writes

// --- Env Loader ---
const envPath = path.resolve(__dirname, '../.env');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) env[key.trim()] = val.trim();
    });
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// --- Write Benchmark ---

async function runBenchmark(concurrency) {
    console.log(`\n--- Testing Write Capacity: ${concurrency} Concurrent Users ---`);
    let successfulOps = 0;
    let failedOps = 0;

    const startTime = Date.now();
    const activeWorkers = [];

    // Create a dummy release ID to avoid foreign key errors if they exist, 
    // or we assume the table lets us insert null or we grab one.
    // For this test, we accept we might get FK errors, but measuring the *attempt* latency is also valid.
    // Ideally, we fetch one valid ID first.
    let releaseId = null;
    const { data } = await supabase.from('apk_releases').select('id').limit(1).single();
    if (data) releaseId = data.id;

    for (let i = 0; i < concurrency; i++) {
        activeWorkers.push((async () => {
            while (Date.now() - startTime < DURATION_MS) {
                try {
                    const { error } = await supabase.from('downloads').insert([{
                        release_id: releaseId // can be null if table allows
                    }]);

                    if (error) throw error;
                    successfulOps++;
                } catch (e) {
                    failedOps++;
                }
            }
        })());
    }

    await Promise.all(activeWorkers);

    const durationSec = (Date.now() - startTime) / 1000;
    const rps = successfulOps / durationSec;

    console.log(`Results: ${rps.toFixed(2)} Writes/Sec (Downloads/Sec)`);
    if (failedOps > 0) console.log(`Errors: ${failedOps}`);
    return rps;
}

(async () => {
    console.log("Starting Write-Only Stress Test (Download Simulation)...");
    for (const users of CONCURRENCY_LEVELS) {
        await runBenchmark(users);
        await new Promise(r => setTimeout(r, 1000));
    }
})();
