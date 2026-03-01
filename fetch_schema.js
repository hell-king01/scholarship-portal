import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const VITE_SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function fetchSchema() {
    const getRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/?apikey=${VITE_SUPABASE_ANON_KEY}`);
    const data = await getRes.json();

    if (data && data.definitions && data.definitions.applications) {
        console.log(JSON.stringify(data.definitions.applications, null, 2));
    } else {
        for (const k in data.definitions) {
            if (k.includes('app')) console.log(k);
        }
        console.log("No explicit enum in definition?");
        fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
    }
}

fetchSchema();
