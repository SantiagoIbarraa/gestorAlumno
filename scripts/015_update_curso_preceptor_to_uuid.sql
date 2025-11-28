-- Update curso table to use UUID for id_preceptor instead of INTEGER
-- This allows courses to reference preceptors from auth.users (UUID) instead of the old preceptor table (INTEGER)

-- First, clear any existing preceptor assignments since we're changing the data type
UPDATE curso SET id_preceptor = NULL;

-- Drop the old foreign key constraint if it exists
ALTER TABLE curso DROP CONSTRAINT IF EXISTS curso_id_preceptor_fkey;

-- Change the column type from INTEGER to UUID
ALTER TABLE curso ALTER COLUMN id_preceptor TYPE UUID USING NULL;

-- Add a foreign key constraint to auth.users
-- Note: This assumes you want to enforce referential integrity with auth.users
-- If you don't want this constraint, you can skip this step
ALTER TABLE curso 
ADD CONSTRAINT curso_id_preceptor_fkey 
FOREIGN KEY (id_preceptor) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'curso' AND column_name = 'id_preceptor';
