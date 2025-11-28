-- Ensure preceptor table exists and has correct permissions
-- This script fixes the PGRST205 error by ensuring the table is present and accessible

-- 1. Create preceptor table if it doesn't exist
CREATE TABLE IF NOT EXISTS preceptor (
  id_preceptor SERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  genero VARCHAR(20),
  email VARCHAR(30) NOT NULL,
  direccion VARCHAR(50),
  telefono INTEGER
);

-- 2. Add id_preceptor to curso table if not exists
ALTER TABLE curso ADD COLUMN IF NOT EXISTS id_preceptor INTEGER REFERENCES preceptor(id_preceptor);

-- 3. Grant permissions to roles
GRANT ALL ON preceptor TO postgres;
GRANT ALL ON preceptor TO service_role;
GRANT SELECT ON preceptor TO anon;
GRANT SELECT ON preceptor TO authenticated;

-- 4. Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE preceptor_id_preceptor_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE preceptor_id_preceptor_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE preceptor_id_preceptor_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE preceptor_id_preceptor_seq TO authenticated;

-- 5. Force schema cache reload (this is a trick, usually creating a table triggers it, but we can try to notify)
NOTIFY pgrst, 'reload schema';
