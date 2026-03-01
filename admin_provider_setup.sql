-- 1. Create the Provider Table exactly as you described
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id uuid not null,
  email text not null,         -- Added for your reference
  password text not null,      -- Added for your reference
  organization_name text not null,
  organization_type text null,
  website_url text null,
  contact_email text null,
  contact_phone text null,
  is_verified boolean null default false,
  verification_documents jsonb null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint provider_profiles_pkey primary key (id),
  constraint provider_profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

-- 2. Simplified Scholarships link
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Enable RLS and add policies for Scholarships so providers can insert
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read scholarships" ON public.scholarships;
CREATE POLICY "Allow read scholarships" ON public.scholarships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow provider to insert scholarships" ON public.scholarships;
CREATE POLICY "Allow provider to insert scholarships" ON public.scholarships FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow provider to update scholarships" ON public.scholarships;
CREATE POLICY "Allow provider to update scholarships" ON public.scholarships FOR UPDATE USING (auth.uid() = created_by);

-- 3. Simplified Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) NOT NULL,
    scholarship_id uuid REFERENCES public.scholarships(id) NOT NULL,
    status text DEFAULT 'submitted'
);

-- Basic Policies
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update" ON public.provider_profiles FOR UPDATE USING (auth.uid() = id);
