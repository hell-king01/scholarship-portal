-- Run this script in your Supabase SQL Editor to enable Provider & Admin roles

-- 1. Create a table for provider verifications
CREATE TABLE IF NOT EXISTS public.provider_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    organization_name text NOT NULL,
    contact_email text,
    document_url text, -- URL to 80G/12A or NGO registration
    status text DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix permissions for verifications
ALTER TABLE public.provider_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own verification" ON public.provider_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own verification" ON public.provider_verifications FOR SELECT USING (auth.uid() = user_id);
-- Note: Admins can do everything, but we'll assume admin logic is handled server-side or via an admin policy check if RLS is strict. 
-- For simplicity, let's allow all reads for now if the user is an admin.
CREATE POLICY "Admins can read all verifications" ON public.provider_verifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Add creator and specific flags to scholarships
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 3. Create applications table for internal direct-apply
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.profiles(id) NOT NULL,
    scholarship_id uuid REFERENCES public.scholarships(id) NOT NULL,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    submitted_documents jsonb DEFAULT '{}'::jsonb, -- e.g. {"Aadhar": "url...", "Income": "url..."}
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applications Permissions
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can insert applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can read own applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);

-- 4. Automatically give Admins & Providers access to applications they own
CREATE POLICY "Providers can view applications for their scholarships" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = scholarship_id AND s.created_by = auth.uid())
);
CREATE POLICY "Admins can view all applications" ON public.applications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enable RLS on profile modifications so Admins can update roles
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
