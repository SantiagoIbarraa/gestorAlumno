-- Enable RLS on alumno table
ALTER TABLE public.alumno ENABLE ROW LEVEL SECURITY;

-- Policy for Admins: Full Access
CREATE POLICY "Admins can do everything on alumno"
ON public.alumno
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy for Students: View their own data (optional but good practice)
-- Assuming user_id in alumno table matches auth.uid()
CREATE POLICY "Students can view their own profile"
ON public.alumno
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Policy for Professors: View all students (optional, adjust as needed)
-- For now, let's just ensure admins can work.
