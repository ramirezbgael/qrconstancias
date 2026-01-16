# Sistema de Constancias de Protección Civil

Sistema completo para emitir y verificar constancias de cursos de Protección Civil mediante códigos QR.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilos**: Tailwind CSS
- **Generación PDF**: pdf-lib
- **Códigos QR**: qrcode
- **Procesamiento Excel**: xlsx

## 📋 Características

- ✅ Autenticación con Supabase Auth (un solo administrador)
- ✅ Panel de administración con rutas protegidas
- ✅ Alta manual de constancias con generación automática de folios
- ✅ Carga masiva desde archivos Excel (.xlsx)
- ✅ Generación automática de PDFs con código QR
- ✅ Página pública de verificación por folio
- ✅ Row Level Security (RLS) configurado
- ✅ Almacenamiento de PDFs en Supabase Storage

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
cd QR
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido del archivo `supabase/schema.sql`
3. Ve a **Storage** y crea un bucket llamado `constancias` con las siguientes configuraciones:
   - **Public bucket**: No (privado)
   - **File size limit**: 5MB
   - **Allowed MIME types**: application/pdf

4. Ejecuta las políticas RLS del bucket:
   - Ve a **SQL Editor** y ejecuta el contenido del archivo `supabase/storage-policies.sql`
   - Esto configura automáticamente las políticas:
     - **INSERT**: Solo usuarios autenticados
     - **SELECT**: Público (para permitir descargar PDFs)
     - **UPDATE/DELETE**: Solo usuarios autenticados

### 4. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

**Nota**: Encuentra estas credenciales en tu proyecto de Supabase:
- URL y Anon Key: **Settings > API**
- Service Role Key: **Settings > API** (mantén esta clave secreta)

### 5. Crear usuario administrador

1. Ve a **Authentication > Users** en Supabase
2. Haz clic en **Add user** > **Create new user**
3. Ingresa el email y contraseña del administrador
4. Guarda estas credenciales para iniciar sesión en `/admin`

## 🚦 Uso

### Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Producción

#### Vercel (recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno en **Settings > Environment Variables**
3. Despliega

#### Build manual

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
QR/
├── app/
│   ├── admin/              # Panel de administración
│   ├── validar/            # Verificación pública
│   │   └── [folio]/        # Verificación por folio
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página de inicio
├── components/
│   ├── FormularioConstancia.tsx  # Formulario de alta manual
│   ├── CargaMasiva.tsx           # Carga masiva Excel
│   └── ListaConstancias.tsx      # Lista de constancias
├── lib/
│   ├── supabaseClient.ts   # Cliente de Supabase
│   ├── auth.ts             # Utilidades de autenticación
│   ├── constancias.ts      # Gestión de constancias
│   ├── qr.ts               # Generación de QR
│   ├── pdf.ts              # Generación de PDF
│   └── excel.ts            # Procesamiento de Excel
├── supabase/
│   └── schema.sql          # Esquema de base de datos
└── public/
    └── plantillas/         # Plantillas (opcional)
```

## 📝 Uso del Sistema

### Panel de Administración (`/admin`)

1. **Iniciar sesión** con las credenciales del administrador
2. **Alta Manual**: Completa el formulario y genera una constancia individual
3. **Carga Masiva**: Sube un archivo Excel con múltiples constancias
4. **Ver Constancias**: Lista todas las constancias emitidas

### Formato del Excel para Carga Masiva

El archivo Excel debe tener estas columnas (en orden):

| nombre | curso | horas | fecha |
|--------|-------|-------|-------|
| Juan Pérez | Primeros Auxilios | 8 | 2024-01-15 |
| María García | Evacuación | 4 | 2024-01-20 |

**Requisitos**:
- La primera fila debe contener los encabezados
- `nombre`: Texto (requerido)
- `curso`: Texto (requerido)
- `horas`: Número entero (requerido)
- `fecha`: Fecha válida en formato Excel o texto (requerido)

Para generar un archivo Excel de ejemplo, ejecuta:

```bash
npm install  # Si aún no instalaste las dependencias
npm run generar-excel
```

Esto creará el archivo `ejemplo-constancias.xlsx` en la raíz del proyecto.

### Verificación Pública (`/validar/[folio]`)

Cualquier persona puede verificar una constancia ingresando el folio:
- Formato de folio: `PC-YYYY-XXXXX` (ej: `PC-2024-00001`)
- Muestra información completa de la constancia
- Permite descargar el PDF

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Solo usuarios autenticados pueden crear/editar/eliminar constancias
- Lectura pública solo por folio específico (no se permiten listados)
- Variables de entorno para credenciales sensibles
- Service Role Key solo se usa en el servidor

## 📄 Formato de Folio

Los folios se generan automáticamente con el formato:

```
PC-YYYY-XXXXX
```

Donde:
- `PC`: Prefijo fijo (Protección Civil)
- `YYYY`: Año actual
- `XXXXX`: Número secuencial de 5 dígitos (ej: 00001, 00002, ...)

## 🐛 Solución de Problemas

### Error: "Missing Supabase credentials"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo `.env.local` existe en la raíz del proyecto

### Error al subir PDFs
- Verifica que el bucket `constancias` existe en Supabase Storage
- Verifica las políticas RLS del bucket
- Verifica que el tamaño del PDF no exceda el límite configurado

### Error al generar folios
- Verifica que la función `obtener_proximo_folio()` fue creada en Supabase
- Revisa los logs de Supabase para más detalles

### Las constancias no se pueden verificar
- Verifica que las políticas RLS permiten SELECT público
- Verifica que el folio existe en la base de datos

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de pdf-lib](https://pdf-lib.js.org/)

## 📝 Licencia

Este proyecto es de uso interno para Protección Civil.

---

**Desarrollado con ❤️ para Protección Civil**
