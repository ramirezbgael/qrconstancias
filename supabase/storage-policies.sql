-- ============================================
-- Políticas de Storage para Bucket 'constancias'
-- ============================================
-- 
-- IMPORTANTE: 
-- 1. PRIMERO ejecuta `supabase/crear-bucket.sql` para crear el bucket
-- 2. DESPUÉS ejecuta este archivo para configurar las políticas RLS

-- Si prefieres crear el bucket desde la UI de Supabase:
-- Ve a Storage > New bucket > Nombre: 'constancias' > Public: NO

-- ============================================
-- POLÍTICAS RLS PARA STORAGE
-- ============================================
-- Nota: Eliminamos las políticas existentes antes de crearlas para evitar errores

-- Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden subir PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar PDFs" ON storage.objects;

-- Política: Permitir INSERT solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden subir PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'constancias');

-- Política: Permitir SELECT (lectura) público para descargar PDFs
CREATE POLICY "Lectura pública de PDFs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'constancias');

-- Política: Permitir UPDATE solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden actualizar PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'constancias');

-- Política: Permitir DELETE solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden eliminar PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'constancias');
