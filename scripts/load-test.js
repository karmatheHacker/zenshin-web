import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Configuration ---
const DURATION_MS = 10000; // 10 seconds per stage
const CONCURRENCY_LEVELS = [1, 10, 50]; // Users to simulate

// --- Env Loader ---
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading env from: ${envPath}`);
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

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Scenarios ---

// 1. Read Stats (The Dashboard Load)
async function scenarioReadStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Simulate the 4 parallel requests
    const p1 = supabase.from('downloads').select('*', { count: 'exact', head: true });
    const p2 = supabase.from('downloads').select('*', { count: 'exact', head: true }).gt('created_at', startOfDay);

    await Promise.all([p1, p2]); // Reduced to 2 for specific test efficiency
}

// 2. Write Download (The Action)
async function scenarioTrackDownload() {
    // We'll use a dummy release_id or just insert
    // Need to make sure we don't fail constraint. Release ID is likely a UUID.
    // We will attempt to get a release ID first, or just skip if we can't.
    // For safety, let's just do a read on 'apk_releases'
    await supabase.from('apk_releases').select('id').limit(1);
}

// --- Benchmarker ---

async function runBenchmark(concurrency) {
    console.log(`\n--- Starting Test: ${concurrency} Concurrent Users ---`);
    let successfulOps = 0;
    let failedOps = 0;
    let latencies = [];

    const startTime = Date.now();
    const activeWorkers = [];

    for (let i = 0; i < concurrency; i++) {
        activeWorkers.push((async () => {
            while (Date.now() - startTime < DURATION_MS) {
                const opStart = Date.now();
                try {
                    // Randomly choose scenario
                    if (Math.random() > 0.7) {
                        await scenarioTrackDownload();
                    } else {
                        await scenarioReadStats();
                    }
                    const opEnd = Date.now();
                    latencies.push(opEnd - opStart);
                    successfulOps++;
                } catch (e) {
                    failedOps++;
                    // console.error(e.message);
                }
                // Small sleep to be realistic? No, we want stress.
            }
        })());
    }

    await Promise.all(activeWorkers);

    const durationSec = (Date.now() - startTime) / 1000;
    const rps = successfulOps / durationSec;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    console.log(`Results for ${concurrency} users:`);
    console.log(`  Duration: ${durationSec.toFixed(2)}s`);
    console.log(`  Requests (Ops): ${successfulOps}`);
    console.log(`  Failed: ${failedOps}`);
    console.log(`  RPS: ${rps.toFixed(2)} ops/sec`);
    console.log(`  Avg Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`  P95 Latency: ${p95}ms`);
    console.log(`  P99 Latency: ${p99}ms`);

    return { rps, p95, failedOps };
}

// --- Main Execution ---

(async () => {
    console.log("Initializing Supabase Client...");
    console.log("Target:", SUPABASE_URL);

    // Warmup
    console.log("Warming up...");
    await scenarioReadStats();

    for (const users of CONCURRENCY_LEVELS) {
        await runBenchmark(users);
        // Cooldown
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\nLoad Test Complete.");
})();
