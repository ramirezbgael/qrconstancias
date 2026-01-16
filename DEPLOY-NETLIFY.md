# 🚀 Desplegar en Netlify

Guía paso a paso para desplegar el sistema de constancias en Netlify.

## 📋 Requisitos Previos

1. ✅ Cuenta en [Netlify](https://www.netlify.com) (gratuita)
2. ✅ Código en un repositorio Git (GitHub, GitLab, o Bitbucket)
3. ✅ Proyecto de Supabase configurado y funcionando

## 🛠️ Paso 1: Preparar el Repositorio

### 1.1 Subir a GitHub/GitLab/Bitbucket

Si aún no tienes tu código en un repositorio:

```bash
# Inicializar repositorio (si no existe)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Sistema de constancias Protección Civil"

# Agregar remoto (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/tu-repo.git

# Subir código
git push -u origin main
```

### 1.2 Verificar .gitignore

Asegúrate de que `.gitignore` incluya `.env.local` para no subir credenciales:

```
.env*.local
.env
```

## 🌐 Paso 2: Desplegar en Netlify

### Opción A: Desde el Dashboard de Netlify (RECOMENDADO)

1. **Inicia sesión en Netlify:**
   - Ve a [app.netlify.com](https://app.netlify.com)
   - Inicia sesión con GitHub/GitLab/Bitbucket

2. **Conecta tu repositorio:**
   - Haz clic en **"Add new site"** > **"Import an existing project"**
   - Autoriza Netlify para acceder a tu repositorio
   - Selecciona el repositorio de tu proyecto

3. **Configura el build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (Netlify lo detectará automáticamente)
   - No es necesario cambiar nada, Netlify detecta Next.js automáticamente

4. **Configura variables de entorno:**
   - Antes de hacer deploy, haz clic en **"Show advanced"** > **"New variable"**
   - Agrega estas variables (las mismas de tu `.env.local`):
   
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
     SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
     ```
   
   ⚠️ **IMPORTANTE:** No incluyas comillas en los valores

5. **Haz deploy:**
   - Haz clic en **"Deploy site"**
   - Espera a que termine el build (puede tardar 2-5 minutos)

### Opción B: Con Netlify CLI

```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# Login en Netlify
netlify login

# Inicializar proyecto
netlify init

# Seguir las instrucciones:
# - Create & configure a new site
# - Seleccionar tu equipo
# - Build command: npm run build
# - Publish directory: .next

# Configurar variables de entorno
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://tu-proyecto.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "tu_clave_anonima"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "tu_service_role_key"

# Hacer deploy
netlify deploy --prod
```

## 🔧 Paso 3: Configurar URL Base para PDFs

Después del deploy, necesitas actualizar la URL base en tu código para que los PDFs generen correctamente el QR con la URL de producción.

### Opción 1: Variable de entorno (RECOMENDADO)

1. Agrega una variable de entorno en Netlify:
   ```
   NEXT_PUBLIC_APP_URL=https://tu-sitio.netlify.app
   ```

2. Actualiza el código para usar esta variable cuando esté disponible.

### Opción 2: Actualizar manualmente el código

Si prefieres hardcodear la URL, modifica `lib/constancias.ts` para usar la URL de Netlify en producción.

## ✅ Paso 4: Verificar que Funciona

1. **Abre tu sitio desplegado:**
   - Netlify te dará una URL como: `https://random-name-123.netlify.app`
   - Puedes personalizarla en **Site settings** > **Domain management**

2. **Prueba el sistema:**
   - Ve a `https://tu-sitio.netlify.app/admin`
   - Inicia sesión con tu usuario administrador
   - Crea una constancia de prueba
   - Verifica que el PDF se descargue correctamente

3. **Verifica el QR:**
   - Descarga un PDF generado en producción
   - Escanea el QR code
   - Debe apuntar a `https://tu-sitio.netlify.app/validar/[folio]`

## 🔒 Paso 5: Configurar Dominio Personalizado (Opcional)

1. En Netlify: **Site settings** > **Domain management**
2. Haz clic en **"Add custom domain"**
3. Sigue las instrucciones para configurar tu dominio

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Netlify para ver el error específico
- Asegúrate de que `netlify.toml` esté configurado correctamente

### Error: "Missing environment variables"
- Verifica que todas las variables de entorno estén configuradas
- Reinicia el deploy después de agregar variables
- Las variables deben empezar con `NEXT_PUBLIC_` para estar disponibles en el cliente

### PDFs no se generan correctamente
- Verifica que `NEXT_PUBLIC_APP_URL` esté configurada con la URL de Netlify
- Revisa la consola del navegador para ver errores
- Asegúrate de que las credenciales de Supabase sean correctas

### QR code apunta a localhost
- Esto ocurre si `baseUrl` en el código usa `window.location.origin` y no hay variable de entorno
- Configura `NEXT_PUBLIC_APP_URL` en Netlify

## 📝 Notas Importantes

- **Builds automáticos:** Cada vez que hagas push a tu rama principal, Netlify hará un deploy automático
- **Variables de entorno:** Nunca subas `.env.local` al repositorio, siempre usa las variables de Netlify
- **URLs de Supabase:** Asegúrate de que las URLs en Supabase permitan el dominio de Netlify (si aplica)

## 🔗 Enlaces Útiles

- [Documentación de Netlify](https://docs.netlify.com/)
- [Next.js en Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
