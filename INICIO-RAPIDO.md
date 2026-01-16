# Inicio Rápido - Sistema de Constancias

## 📦 Paso 1: Instalar dependencias

```bash
npm install
```

## 🔧 Paso 2: Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)

2. **Ejecuta el esquema SQL:**
   - Ve a **SQL Editor** en Supabase
   - Copia y ejecuta todo el contenido de `supabase/schema.sql`

3. **Crea el bucket de Storage (IMPORTANTE):**
   - Ve a **Storage** en Supabase
   - Haz clic en **New bucket**
   - **Nombre**: `constancias` (exactamente así, en minúsculas)
   - Configuración:
     - ❌ Public bucket: NO (debe estar desactivado)
     - 📏 File size limit: 5242880 (5MB) o déjalo vacío
     - 📄 Allowed MIME types: `application/pdf`
   - Haz clic en **Create bucket**
   
   ⚠️ **Si recibes error 404 "Bucket not found"**, consulta `CONFIGURAR-STORAGE.md`

4. **Ejecuta las políticas de Storage:**
   - Ve a **SQL Editor** en Supabase
   - Copia y ejecuta todo el contenido de `supabase/storage-policies.sql`

## 🔑 Paso 3: Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**Dónde encontrar las credenciales:**
- En Supabase: **Settings > API**
- URL: Project URL
- Anon Key: anon/public key
- Service Role Key: service_role key (¡manténla secreta!)

## 👤 Paso 4: Crear usuario administrador

1. En Supabase, ve a **Authentication > Users**
2. Haz clic en **Add user** > **Create new user**
3. Ingresa:
   - Email: `admin@tudominio.com`
   - Password: `tu_contraseña_segura`
4. Guarda estas credenciales

## 🚀 Paso 5: Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## ✅ Paso 6: Probar el sistema

1. Ve a `/admin`
2. Inicia sesión con las credenciales del administrador
3. Crea una constancia de prueba desde "Alta Manual"
4. Ve a `/validar` y verifica la constancia con el folio generado

## 📊 Generar archivo Excel de ejemplo

```bash
npm run generar-excel
```

Esto creará `ejemplo-constancias.xlsx` con datos de ejemplo para probar la carga masiva.

## 🎉 ¡Listo!

Ya tienes el sistema funcionando. Consulta el `README.md` para más detalles sobre el uso y funcionalidades.
