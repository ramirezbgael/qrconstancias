-- Aceptar calificaciones con decimales (ej. 9.2) o texto
-- Quitar CHECK que exigen integer antes de cambiar tipo a TEXT.

-- 1) Quitar restricciones CHECK que usan calificacion (evita error "text >= integer")
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'constancias' AND c.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE constancias DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- 2) Cambiar tipo de columna
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'constancias' AND column_name = 'calificacion'
  ) THEN
    ALTER TABLE constancias
      ALTER COLUMN calificacion TYPE TEXT USING calificacion::TEXT;
  ELSE
    ALTER TABLE constancias ADD COLUMN calificacion TEXT;
  END IF;
END $$;
