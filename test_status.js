import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const VITE_SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function testStatuses() {
    const testStatuses = [
        'draft', 'applied', 'submitted', 'pending', 'pending_verification', 'in_progress', 'under_review', 'verified', 'approved', 'disbursed', 'rejected', 'processing'
    ];

    const results = {};

    for (const s of testStatuses) {
        const res = await fetch(`${VITE_SUPABASE_URL}/rest/v1/applications`, {
            method: 'POST',
            headers: {
                'apikey': VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: '00000000-0000-0000-0000-000000000000',
                scholarship_id: '00000000-0000-0000-0000-000000000000',
                status: s
            })
        });

        if (!res.ok) {
            const text = await res.text();
            if (text.includes('23514')) {
                results[s] = 'Constraint violation';
            } else if (text.includes('42501') || text.includes('PGRST')) {
                results[s] = 'Allowed';
            } else {
                results[s] = text;
            }
        } else {
            results[s] = 'Success';
        }
    }

    fs.writeFileSync('out.json', JSON.stringify(results, null, 2));
}

testStatuses();
