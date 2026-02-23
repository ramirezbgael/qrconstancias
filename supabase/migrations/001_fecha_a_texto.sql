-- Permitir fechas como texto libre (ej. "21 y 22 de feb") además de YYYY-MM-DD
-- Ejecutar en SQL Editor de Supabase si ya tienes la tabla constancias creada.

ALTER TABLE constancias
  ALTER COLUMN fecha TYPE TEXT USING fecha::TEXT;

COMMENT ON COLUMN constancias.fecha IS 'Fecha del curso: YYYY-MM-DD o texto libre (ej. 21 y 22 de feb)';
