# Configurar Supabase Storage - Solución Error 404 "Bucket not found"

## ⚠️ Error
Si recibes el error: `{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}`

Significa que el bucket de Storage no está creado o no tiene el nombre correcto.

## ✅ Solución: Crear el Bucket

Tienes **DOS OPCIONES** para crear el bucket:

### 🔧 Opción A: Crear con SQL (MÁS RÁPIDO)

1. Ve a **SQL Editor** en Supabase
2. Abre y ejecuta el archivo `supabase/crear-bucket.sql`
3. Deberías ver una fila con el bucket creado
4. Luego ejecuta `supabase/storage-policies.sql` para las políticas

### 🖱️ Opción B: Crear desde la Interfaz (MANUAL)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en el botón **New bucket** (o **Nuevo bucket**)

**Configura el bucket con estos valores exactos:**

**Nombre del bucket:**
```
constancias
```
⚠️ **IMPORTANTE**: El nombre debe ser exactamente `constancias` (en minúsculas, sin espacios)

**Opciones:**
- ✅ **Public bucket**: NO (desactivado - debe ser privado)
- ✅ **File size limit**: 5242880 (5MB en bytes) o puedes dejarlo vacío
- ✅ **Allowed MIME types**: `application/pdf`

Haz clic en **Create bucket** (Crear bucket)

### Paso 3: Configurar Políticas RLS del Bucket

Después de crear el bucket, necesitas ejecutar las políticas RLS:

1. Ve a **SQL Editor** en Supabase
2. Copia y pega todo el contenido del archivo `supabase/storage-policies.sql`
3. Haz clic en **Run** (Ejecutar)

### Paso 4: Verificar que Funciona

Una vez creado el bucket y ejecutadas las políticas:

1. Regresa a tu aplicación
2. Intenta crear una constancia nuevamente
3. El error debería desaparecer

## 🔍 Verificación

Para verificar que el bucket existe:

1. Ve a **Storage** en Supabase
2. Deberías ver el bucket `constancias` en la lista
3. Al hacer clic en él, deberías ver la carpeta vacía (o con PDFs si ya creaste constancias)

## 🐛 Si el Error Persiste

### Verifica el nombre del bucket:
- Debe ser exactamente `constancias` (minúsculas)
- No debe tener espacios ni caracteres especiales
- No debe ser `Constancias` ni `CONSTANCIAS`

### Verifica las políticas RLS:
- Ejecuta nuevamente `supabase/storage-policies.sql` en SQL Editor
- Verifica que no haya errores al ejecutar

### Verifica las variables de entorno:
- Asegúrate de que `.env.local` tiene las credenciales correctas
- Reinicia el servidor de desarrollo: `npm run dev`

## 📝 Notas

- El bucket debe crearse manualmente desde la interfaz de Supabase
- Las políticas RLS deben ejecutarse después de crear el bucket
- Los PDFs se almacenan directamente en la raíz del bucket con el nombre: `PC-YYYY-XXXXX.pdf`
