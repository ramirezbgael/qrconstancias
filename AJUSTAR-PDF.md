# Ajustar Coordenadas del PDF

## ⚠️ Importante

La función `generateConstanciaPDF` en `lib/pdf.ts` usa coordenadas aproximadas para colocar los datos en la plantilla PDF. **Necesitas ajustar estas coordenadas** según la posición real de los campos en tu plantilla `public/constancia.pdf`.

## 🔧 Cómo Ajustar las Coordenadas

1. Abre `lib/pdf.ts`
2. Busca la función `generateConstanciaPDF`
3. Encuentra las secciones donde se dibujan los textos:
   - Nombre completo
   - Curso
   - Fecha
   - Calificación
   - Folio

4. Ajusta las coordenadas `x` y `y` según la posición en tu PDF:
   ```typescript
   page.drawText(data.nombreCompleto, {
     x: 100,  // ← Ajustar según posición horizontal
     y: height - 200,  // ← Ajustar según posición vertical
     size: 12,
     font: helveticaFont,
     color: darkGray,
   })
   ```

## 📐 Sistema de Coordenadas PDF

- **Origen (0,0)**: Esquina inferior izquierda
- **X**: Aumenta hacia la derecha
- **Y**: Aumenta hacia arriba
- **width**: Ancho de la página (595 puntos para A4)
- **height**: Alto de la página (842 puntos para A4)

## 🛠️ Herramientas para Encontrar Coordenadas

1. **Usar un editor PDF** que muestre coordenadas (como Adobe Acrobat)
2. **Probar y ajustar**: Genera un PDF de prueba y ajusta las coordenadas hasta que quede bien
3. **Usar herramientas de desarrollo PDF**: Algunas librerías permiten inspeccionar coordenadas

## 📝 Campos que Necesitan Coordenadas

- **Nombre completo**: "QUE SE OTORGA A" + nombre
- **Curso**: "Por haber participado en los cursos de:" + curso
- **Fecha**: Campo de fecha
- **Calificación**: En la tabla de calificación
- **Folio/Registro**: Campo de registro
- **QR Code**: Posición del código QR

## 💡 Tip

Puedes usar valores negativos para `y` si necesitas medir desde arriba:
```typescript
y: height - 200  // 200 puntos desde arriba
```

O medir desde abajo:
```typescript
y: 200  // 200 puntos desde abajo
```
