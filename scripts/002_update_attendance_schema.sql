-- Migration: Update asistencia table for new requirements

-- 1. Add 'estado' column
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS estado VARCHAR(20);

-- 2. Migrate existing data (if any)
-- If 'presente' was true, set 'estado' to 'Presente', else 'Ausente'
UPDATE asistencia SET estado = CASE WHEN presente = true THEN 'Presente' ELSE 'Ausente' END WHERE estado IS NULL;

-- 3. Drop 'presente' column
ALTER TABLE asistencia DROP COLUMN IF EXISTS presente;

-- 4. Add check constraint for valid values
ALTER TABLE asistencia ADD CONSTRAINT check_estado CHECK (estado IN ('Presente', 'Ausente', 'Justificado'));
