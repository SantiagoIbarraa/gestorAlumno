-- Ensure documento_url column exists in historial_alumnos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'historial_alumnos'
        AND column_name = 'documento_url'
    ) THEN
        ALTER TABLE historial_alumnos ADD COLUMN documento_url TEXT;
    END IF;
END $$;
