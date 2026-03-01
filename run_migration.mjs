// run_migration.mjs - Runs the provider/admin schema migration
// Uses direct PostgreSQL connection via supabase service role

import { createClient } from '@supabase/supabase-js';

// Read from env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Run each migration statement individually
const migrations = [
    // 1. provider_verifications table
    `CREATE TABLE IF NOT EXISTS public.provider_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    organization_name text NOT NULL,
    contact_email text,
    document_url text,
    status text DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
    created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
  )`,

    // 2. Add columns to scholarships
    `ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS created_by uuid`,
    `ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false`,
    `ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'`,

    // 3. applications table
    `CREATE TABLE IF NOT EXISTS public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL,
    scholarship_id uuid NOT NULL,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    submitted_documents jsonb DEFAULT '{}'::jsonb,
    notes text,
    created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
  )`,

    // 4. single_girl_child and orphan_single_parent on profiles
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS single_girl_child boolean DEFAULT false`,
    `ALTER TABLE public.orphan_single_parent ADD COLUMN IF NOT EXISTS orphan_single_parent boolean DEFAULT false`,
];

console.log(`Connecting to: ${SUPABASE_URL}`);

// Unfortunately supabase-js REST API doesn't support raw DDL.
// We need to print the SQL so user can run it, or use the management API.
// Let's use the Supabase Management API to run the migration.

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0]; // vemskadgdfktywjodxop
console.log(`Project ref: ${PROJECT_REF}`);
console.log('\nsupabase-js cannot run DDL directly via REST. Migration must be run via Supabase Dashboard SQL Editor or service_role key direct postgres connection.');
console.log('\nPlease run the following SQL in your Supabase Dashboard SQL Editor:');
console.log('');
console.log('--- COPY FROM BELOW ---');
for (const stmt of migrations) {
    console.log(stmt + ';\n');
}
