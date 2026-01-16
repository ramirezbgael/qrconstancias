-- ============================================
-- Crear Bucket 'constancias' en Supabase Storage
-- ============================================
-- 
-- IMPORTANTE: Ejecuta este SQL PRIMERO antes de las políticas
-- Este script crea el bucket si no existe

-- Verificar si el bucket existe y crearlo si no
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'constancias',
  'constancias',
  false, -- Privado
  5242880, -- 5MB en bytes (puede ser NULL para sin límite)
  ARRAY['application/pdf'] -- Solo PDFs
)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Verificar que se creó correctamente
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'constancias';

-- Si ves una fila con id='constancias', el bucket existe correctamente
