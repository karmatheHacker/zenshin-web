import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

(async () => {
    console.log("⚠️ Clearing 'downloads' table...");

    // Deleting all rows by checking a timestamp
    const { error } = await supabase
        .from('downloads')
        .delete()
        .gt('created_at', '1970-01-01T00:00:00.000Z');

    if (error) {
        console.error("Error clearing table:", error.message);
    } else {
        console.log("✅ 'downloads' table cleared. Count should be 0.");
    }
})();
