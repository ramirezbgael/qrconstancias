# Configurar Netlify para Ignorar Variables NEXT_PUBLIC_*

Netlify escanea automáticamente el código en busca de secretos. Las variables que empiezan con `NEXT_PUBLIC_` en Next.js están **diseñadas para ser públicas** y aparecerán en el build, lo cual es normal.

## ✅ Solución: Agregar Variable de Entorno en Netlify

### Opción 1: Desde el Dashboard (RECOMENDADO)

1. Ve a tu sitio en Netlify
2. **Site settings** > **Build & deploy** > **Environment**
3. Haz clic en **"Edit variables"** o **"Add variable"**
4. Agrega esta variable:

   **Key**: `NETLIFY_SECRETS_IGNORE`
   
   **Value**: `NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Guarda y haz un nuevo deploy

### Opción 2: Ya está en netlify.toml

Ya agregué `NETLIFY_SECRETS_IGNORE` en `netlify.toml`, pero a veces Netlify ignora esta configuración en el archivo. Es mejor agregarla manualmente en el dashboard.

## 🔒 Importante sobre Seguridad

### ✅ Variables que DEBEN ser públicas (están bien en el build):
- `NEXT_PUBLIC_SUPABASE_URL` - URL pública de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima (diseñada para ser pública)
- `NEXT_PUBLIC_APP_URL` - URL de tu sitio

### ❌ Variables que NUNCA deben aparecer en el build:
- `SUPABASE_SERVICE_ROLE_KEY` - Esta debe estar solo como variable de entorno, nunca en el código
- Cualquier token o clave privada

## 📝 Verificar que Funciona

Después de agregar `NETLIFY_SECRETS_IGNORE`:

1. Haz un nuevo deploy
2. Revisa los logs de build
3. Ya no deberías ver warnings sobre `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Si el Build Sigue Fallando

Si el build falla por otra razón (no solo los warnings):

1. Revisa los logs completos de build
2. Busca errores que digan "Error:" o "Failed:"
3. Asegúrate de que todas las variables de entorno estén configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (opcional, pero recomendado)
