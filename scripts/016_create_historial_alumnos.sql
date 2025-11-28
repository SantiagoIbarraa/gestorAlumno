-- Create table for student change history
-- This table will track all modifications and deletions of students

CREATE TABLE IF NOT EXISTS historial_alumnos (
    id_historial SERIAL PRIMARY KEY,
    id_alumno INTEGER NOT NULL,
    tipo_cambio VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('modificacion', 'baja', 'alta')),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    motivo TEXT,
    documento_url TEXT,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by student
CREATE INDEX IF NOT EXISTS idx_historial_alumnos_id_alumno ON historial_alumnos(id_alumno);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_historial_alumnos_created_at ON historial_alumnos(created_at DESC);

-- Add RLS policies
ALTER TABLE historial_alumnos ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all history
CREATE POLICY "Admins can view all history"
ON historial_alumnos
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Allow admins to insert history records
CREATE POLICY "Admins can insert history"
ON historial_alumnos
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.id = auth.uid()
        AND user_roles.role = 'admin'
    )
);
