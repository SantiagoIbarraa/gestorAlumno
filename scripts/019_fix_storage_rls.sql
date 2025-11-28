-- Fix Storage RLS policies for student-documents bucket

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop ALL existing policies for this bucket to start fresh
-- We do NOT run "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;" because it causes ownership errors.
-- It is enabled by default on Supabase storage.

DROP POLICY IF EXISTS "Authenticated users can upload student documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view student documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update student documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete student documents" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_3" ON storage.objects;

-- 3. Create comprehensive policies

-- Allow authenticated users to upload (INSERT)
CREATE POLICY "Authenticated users can upload student documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'student-documents' );

-- Allow authenticated users to update (UPDATE)
CREATE POLICY "Authenticated users can update student documents"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'student-documents' );

-- Allow authenticated users to delete (DELETE)
CREATE POLICY "Authenticated users can delete student documents"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'student-documents' );

-- Allow public to view (SELECT)
CREATE POLICY "Public can view student documents"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'student-documents' );

-- Allow authenticated users to view (SELECT)
CREATE POLICY "Authenticated users can view student documents"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'student-documents' );
