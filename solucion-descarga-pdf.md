# Solución Error 400 al Descargar PDF

## ⚠️ Problema
Error 400 al intentar descargar el PDF significa que el bucket está configurado como **privado**, pero estamos usando URLs públicas que requieren autenticación.

## ✅ Solución Rápida: Hacer el Bucket Público

### Opción 1: Desde la Interfaz de Supabase (RECOMENDADO)

1. Ve a **Storage** en Supabase
2. Haz clic en el bucket `constancias`
3. Haz clic en **Edit bucket** (editar bucket)
4. Activa la opción **Public bucket** (marcar como público)
5. Guarda los cambios

**Nota**: Aunque el bucket sea público, las políticas RLS siguen protegiendo el acceso. Solo se permite la lectura pública gracias a la política "Lectura pública de PDFs".

### Opción 2: Con SQL

Ejecuta este SQL en **SQL Editor**:

```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'constancias';
```

## 🔒 Seguridad

Aunque el bucket sea público:
- ✅ Las políticas RLS siguen activas
- ✅ Solo se puede leer (SELECT) - gracias a la política pública
- ✅ No se puede subir, editar o eliminar sin autenticación
- ✅ Los PDFs solo son accesibles si conoces la URL exacta (con el folio)

## ✅ Verificar

Después de hacer el bucket público:

1. Intenta descargar un PDF nuevamente
2. Debería funcionar sin errores 400

## 📝 Nota

Si prefieres mantener el bucket privado y usar URLs firmadas temporales, eso requeriría cambios más complejos en el código. Para este caso de uso (PDFs públicos verificables por folio), hacer el bucket público es la solución más simple y eficiente.
