-- ============================================
-- Sistema de Constancias de Protección Civil
-- ============================================

-- Crear tabla de constancias
CREATE TABLE IF NOT EXISTS constancias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    curso TEXT NOT NULL,
    duracion_horas INTEGER NOT NULL,
    fecha TEXT NOT NULL,  -- YYYY-MM-DD o texto libre (ej. "21 y 22 de feb")
    calificacion TEXT,   -- ej. "89", "9.2", "Aprobado"
    observaciones TEXT,
    pdf_url TEXT,
    qr_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_constancias_folio ON constancias(folio);
CREATE INDEX IF NOT EXISTS idx_constancias_created_at ON constancias(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE constancias ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================
-- (DROP IF EXISTS permite re-ejecutar este script sin error)

DROP POLICY IF EXISTS "Solo usuarios autenticados pueden insertar constancias" ON constancias;
-- Política: Solo usuarios autenticados pueden INSERTAR constancias
CREATE POLICY "Solo usuarios autenticados pueden insertar constancias"
    ON constancias
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura pública por folio" ON constancias;
-- Política: Lectura pública por folio
CREATE POLICY "Lectura pública por folio"
    ON constancias
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar" ON constancias;
-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Solo usuarios autenticados pueden actualizar"
    ON constancias
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar" ON constancias;
-- Política: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Solo usuarios autenticados pueden eliminar"
    ON constancias
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- FUNCIÓN AUXILIAR: Generar folio automático
-- ============================================
-- Nota: Esta función se puede usar desde la aplicación
-- Formato: PC-YYYY-XXXXX
-- Ejemplo: PC-2024-00001

-- Función para obtener el próximo número de folio
CREATE OR REPLACE FUNCTION obtener_proximo_folio()
RETURNS TEXT AS $$
DECLARE
    anio_actual INTEGER;
    numero_secuencial INTEGER;
    folio_generado TEXT;
BEGIN
    -- Obtener año actual
    anio_actual := EXTRACT(YEAR FROM NOW());
    
    -- Contar constancias del año actual
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(folio FROM 'PC-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO numero_secuencial
    FROM constancias
    WHERE folio LIKE 'PC-' || anio_actual || '-%';
    
    -- Formatear folio: PC-YYYY-XXXXX (5 dígitos)
    folio_generado := 'PC-' || anio_actual || '-' || LPAD(numero_secuencial::TEXT, 5, '0');
    
    RETURN folio_generado;
END;
$$ LANGUAGE plpgsql;
