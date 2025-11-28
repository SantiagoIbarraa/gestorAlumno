-- Add requested_admin column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS requested_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow users to update their own requested_admin status
-- (Assuming existing policies might need adjustment, but let's start with the column)
