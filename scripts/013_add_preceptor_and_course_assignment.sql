-- 1. Update users table check constraint to include 'preceptor'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'alumno', 'profesor', 'preceptor'));

-- 2. Create preceptor table
CREATE TABLE IF NOT EXISTS preceptor (
  id_preceptor SERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  genero VARCHAR(20),
  email VARCHAR(30) NOT NULL,
  direccion VARCHAR(50),
  telefono INTEGER
);

-- 3. Add id_preceptor to curso table
ALTER TABLE curso ADD COLUMN IF NOT EXISTS id_preceptor INTEGER REFERENCES preceptor(id_preceptor);

-- 4. Insert example preceptor (optional, for testing)
INSERT INTO preceptor (nombre, genero, email, direccion, telefono)
VALUES ('Preceptor Ejemplo', 'M', 'preceptor@test.com', 'Calle Falsa 123', 12345678)
ON CONFLICT DO NOTHING;
