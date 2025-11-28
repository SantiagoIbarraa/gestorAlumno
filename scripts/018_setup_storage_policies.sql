-- 1. Create the bucket 'student-documents' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload files
-- We drop it first to avoid "policy already exists" errors if re-running
DROP POLICY IF EXISTS "Authenticated users can upload student documents" ON storage.objects;

CREATE POLICY "Authenticated users can upload student documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'student-documents' );

-- 4. Policy: Allow public access to view/download files
-- Required for getPublicUrl to work without signed tokens
DROP POLICY IF EXISTS "Public can view student documents" ON storage.objects;

CREATE POLICY "Public can view student documents"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'student-documents' );

-- 5. Policy: Allow authenticated users to update/delete (optional, for future use)
DROP POLICY IF EXISTS "Authenticated users can update student documents" ON storage.objects;

CREATE POLICY "Authenticated users can update student documents"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'student-documents' );

DROP POLICY IF EXISTS "Authenticated users can delete student documents" ON storage.objects;

CREATE POLICY "Authenticated users can delete student documents"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'student-documents' );
