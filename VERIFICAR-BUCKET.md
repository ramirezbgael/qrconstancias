# 🔍 Verificar que el Bucket Existe

## Paso 1: Verificar en Supabase Dashboard

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Storage** en el menú lateral
3. Deberías ver una lista de buckets

## ❓ ¿Ves el bucket "constancias"?

### ✅ Si SÍ lo ves:
- Haz clic en el bucket `constancias`
- Verifica que puedas ver su contenido (incluso si está vacío)
- Si no puedes acceder, puede ser un problema de permisos

### ❌ Si NO lo ves:
**Necesitas crear el bucket manualmente:**

1. En la página de Storage, haz clic en **New bucket** o **Create bucket**
2. **Nombre**: Escribe exactamente: `constancias`
   - ⚠️ Debe estar en **minúsculas**
   - ⚠️ Sin espacios
   - ⚠️ Sin caracteres especiales
3. **Public bucket**: Desactivado (NO debe estar marcado)
4. **File size limit**: `5242880` (5MB) o déjalo vacío
5. **Allowed MIME types**: `application/pdf`
6. Haz clic en **Create bucket** o **Save**

## Paso 2: Verificar el nombre exacto

Si creaste el bucket con un nombre diferente, tienes dos opciones:

### Opción A: Renombrar el bucket (desde Supabase)
- No se puede renombrar directamente
- Necesitas eliminarlo y crear uno nuevo con el nombre correcto

### Opción B: Cambiar el código para usar tu nombre
Si el bucket tiene otro nombre (ej: `Constancias`, `CONSTANCIAS`, `constancias-pdfs`), necesitas cambiar el código en:
- `lib/constancias.ts` (líneas donde dice `.from('constancias')`)
- Busca todas las referencias a `'constancias'` y cámbialas por tu nombre

## Paso 3: Verificar con SQL

Puedes verificar que el bucket existe ejecutando esto en SQL Editor:

```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'constancias';
```

Deberías ver una fila con:
- `id`: `constancias`
- `name`: `constancias`
- `public`: `false`

Si no ves ninguna fila, el bucket NO existe y necesitas crearlo.

## 🔧 Solución Rápida

1. Ve a **Storage** en Supabase
2. Si no ves `constancias` en la lista, créalo siguiendo los pasos arriba
3. Asegúrate de que el nombre sea exactamente `constancias` (minúsculas)
4. Después de crearlo, ejecuta nuevamente `supabase/storage-policies.sql`
5. Intenta crear una constancia de nuevo
