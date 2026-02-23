/**
 * Utilidades para generar PDFs de constancias
 * Usa una plantilla base y rellena los campos
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { generateQRCodeDataURL } from './qr'

export interface ConstanciaData {
  folio: string
  nombreCompleto: string
  curso: string
  duracionHoras: number
  fecha: string
  calificacion?: string
  observaciones?: string
}

/**
 * Generar PDF de constancia usando la plantilla base
 * @param data - Datos de la constancia
 * @param baseUrl - URL base de la aplicación (para el QR)
 * @returns Promise<Uint8Array> - PDF generado
 */
export async function generateConstanciaPDF(
  data: ConstanciaData,
  baseUrl: string
): Promise<Uint8Array> {
  // Cargar la plantilla PDF
  // En Next.js, siempre cargamos desde la ruta pública (funciona en cliente y servidor)
  let templateBytes: Uint8Array

  try {
    // Cargar desde la ruta pública
    // En el cliente: usar ruta relativa
    // En el servidor: usar baseUrl si está disponible, sino ruta relativa
    const templateUrl = typeof window !== 'undefined' 
      ? '/constancia.pdf' 
      : (baseUrl ? `${baseUrl}/constancia.pdf` : '/constancia.pdf')
    
    const response = await fetch(templateUrl)
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla PDF: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    templateBytes = new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error cargando plantilla PDF:', error)
    // Fallback: crear PDF desde cero si no se puede cargar la plantilla
    return await generateConstanciaPDFFromScratch(data, baseUrl)
  }

  // Cargar el PDF existente
  const pdfDoc = await PDFDocument.load(templateBytes)
  const pages = pdfDoc.getPages()
  const page = pages[0]
  const { width, height } = page.getSize()

  // Obtener fuentes
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // Cargar Poppins desde un CDN que proporcione TTF
  // Nota: pdf-lib requiere fuentes en formato TTF, no WOFF2
  let poppinsBold: any = helveticaBold // Fallback por defecto
  try {
    // Intentar cargar Poppins Bold desde un servicio que proporcione TTF
    // Usando GitHub como CDN para el archivo TTF de Poppins
    const poppinsBoldUrl = 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf'
    const poppinsBoldResponse = await fetch(poppinsBoldUrl)
    if (poppinsBoldResponse.ok) {
      const poppinsBoldArrayBuffer = await poppinsBoldResponse.arrayBuffer()
      poppinsBold = await pdfDoc.embedFont(new Uint8Array(poppinsBoldArrayBuffer))
      console.log('Poppins Bold cargado exitosamente')
    } else {
      console.warn('No se pudo cargar Poppins, usando Helvetica como fallback')
    }
  } catch (error) {
    console.warn('Error cargando Poppins, usando Helvetica como fallback:', error)
    // Fallback a Helvetica si no se puede cargar Poppins
  }

  // Colores
  const darkGray = rgb(0, 0, 0)
  const lightGray = rgb(0.5, 0.5, 0.5)
  const blue = rgb(0.13, 0.35, 0.58) // Azul tipo Microsoft Word (#216994) para todos los textos

  // Coordenadas ajustadas según la plantilla
  // Basadas en el PDF: constancia.pdf
  // Conversión aproximada: 1 cm ≈ 28 puntos, 0.5 cm ≈ 14 puntos
  
  // Marca de agua detrás del nombre - dibujar ANTES del nombre para que quede detrás
  const watermarkText = 'GMORIVERA'
  const watermarkSize = 60 // Tamaño grande para la marca de agua
  const watermarkX = 100 + 28 // Misma posición X que el nombre
  const watermarkY = height - 180 - 14 // Misma posición Y que el nombre
  
  // Calcular el ancho del texto para centrarlo mejor
  const nombreWidth = poppinsBold.widthOfTextAtSize(data.nombreCompleto, 16 * 1.15)
  const watermarkWidth = poppinsBold.widthOfTextAtSize(watermarkText, watermarkSize)
  
  // Calcular el centro del nombre para posicionar la marca de agua
  const centerX = watermarkX + nombreWidth / 2
  
  // Dibujar marca de agua con opacidad muy baja (sin rotación por simplicidad)
  // La marca de agua se dibuja detrás del nombre (antes de dibujar el nombre)
  page.drawText(watermarkText, {
    x: centerX - watermarkWidth / 2 + 56, // Centrar respecto al nombre + 2 cm a la derecha (56 puntos)
    y: watermarkY - 10, // Ligeramente más abajo que el nombre
    size: watermarkSize,
    font: poppinsBold,
    color: rgb(0.13, 0.35, 0.58), // Mismo azul pero con opacidad
    opacity: 0.08, // Opacidad muy baja para que sea sutil
  })
  
  // Nombre completo - medio centímetro abajo (14 puntos) y uno a la derecha (28 puntos), al 115%, Times New Roman, azul
  page.drawText(data.nombreCompleto, {
    x: 100 + 28, // Uno a la derecha (28 puntos = 1 cm)
    y: height - 180 - 14, // Medio centímetro abajo (14 puntos = 0.5 cm)
    size: 16 * 1.15, // 115% del tamaño original (18.4)
    font: poppinsBold, // Poppins negrita
    color: blue, // Azul
  })

  // Curso - si es muy largo, reducir tamaño y poner en 2 renglones (ancho limitado para que no se salga)
  // Medio centímetro más arriba (14 pt) para que no se corte con el recuadro
  const cursoY = height - 240 - 56 + 14 - 14 + 14
  const cursoX = 100 + 28
  const cursoSizeNormal = 14 * 1.45   // 145% (≈20.3)
  const cursoSizeReducido = 10 * 1.45 // 145% (≈14.5)
  const cursoMaxWidth = 260 // ~9 cm para que quepa en el recuadro
  const { lines: cursoLines, fontSize: cursoFontSize } = wrapCursoEnDosLineas(
    data.curso,
    poppinsBold,
    cursoSizeNormal,
    cursoSizeReducido,
    cursoMaxWidth
  )
  const cursoLineHeight = cursoFontSize * 1.3
  cursoLines.forEach((line, i) => {
    page.drawText(line, {
      x: cursoX,
      y: cursoY - i * cursoLineHeight,
      size: cursoFontSize,
      font: poppinsBold,
      color: blue,
    })
  })

  // Duración en horas - después del curso, dos centímetros abajo y uno a la izquierda, Times New Roman, azul
  const duracionTexto = `Duración: ${data.duracionHoras} horas`
  page.drawText(duracionTexto, {
    x: 100 + 28 - 28, // Uno a la izquierda (restar 28 puntos = 1 cm)
    y: height - 240 - 56 + 14 - 14 - 30 - 56, // Dos centímetros abajo (restar 56 puntos = 2 cm)
    size: 14,
    font: poppinsBold, // Poppins negrita
    color: blue, // Azul
  })

  // Fecha: "Fecha: " + valor; 2 cm más a la izquierda (56 pt)
  page.drawText(`Fecha: ${formatDate(data.fecha)}`, {
    x: 100 + 140 - 56 - 56, // 2 cm más a la izquierda que antes
    y: height - 290 - 84 + 56 - 28 + 11 - 6,
    size: 14 * 1.40, // 140%
    font: poppinsBold,
    color: blue,
  })

  // Calificación (si existe) - dos centímetros abajo (56 puntos) y 2 cm a la derecha (56 puntos), medio cm arriba, 0.2 cm más abajo, al 120%, Times New Roman, azul
  if (data.calificacion) {
    page.drawText(data.calificacion, {
      x: 350 - 196 + 56, // 7 cm a la izquierda + 2 cm a la derecha = neto 5 cm a la izquierda
      y: height - 360 - 56 + 14 - 6, // Dos centímetros abajo, medio cm arriba, 0.2 cm más abajo (6 puntos ≈ 0.2 cm)
      size: 16 * 1.20, // 120% del tamaño original (19.2)
      font: poppinsBold, // Poppins negrita
      color: blue, // Azul
    })
  }

  // Folio (para el registro) - 1 centímetro arriba (28 puntos)
  page.drawText(data.folio, {
    x: 100,
    y: height - 480 + 28, // 1 centímetro arriba (28 puntos = 1 cm)
    size: 10,
    font: helveticaFont,
    color: lightGray,
  })

  // Generar QR
  const verificationUrl = `${baseUrl}/validar/${data.folio}`
  const qrDataURL = await generateQRCodeDataURL(verificationUrl)
  const qrResponse = await fetch(qrDataURL)
  const qrArrayBuffer = await qrResponse.arrayBuffer()
  const qrImage = await pdfDoc.embedPng(qrArrayBuffer)

  // Agregar QR en el recuadro blanco central - 5 centímetros abajo (140 puntos) y 3 cm a la izquierda (84 puntos), 2 cm más abajo, 1 cm más arriba
  // El recuadro blanco está casi al centro, parte inferior derecha-central
  // QR al 122% del tamaño original
  // 2 milímetros a la derecha (≈6 puntos) y 2 milímetros abajo (≈6 puntos)
  const qrSize = 130 * 1.22 // 122% = 158.6 puntos
  const qrX = width / 2 - qrSize / 2 + 80 - 84 + 6 // Centrado con desplazamiento, menos 3 cm a la izquierda + 2 mm a la derecha (6 puntos ≈ 2 mm)
  const qrY = height / 2 - 80 - 140 - 56 + 28 - 6 // 5 centímetros abajo + 2 cm más abajo - 1 cm más arriba - 2 mm más abajo = neto 6 cm + 2 mm abajo

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  })

  // Guardar PDF modificado
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Generar PDF desde cero (fallback si no se puede cargar la plantilla)
 */
async function generateConstanciaPDFFromScratch(
  data: ConstanciaData,
  baseUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const darkGray = rgb(0.2, 0.2, 0.2)

  // Título
  page.drawText('CONSTANCIA', {
    x: width / 2 - 50,
    y: height - 80,
    size: 20,
    font: helveticaBold,
    color: darkGray,
  })

  // Nombre
  page.drawText(`QUE SE OTORGA A`, {
    x: 100,
    y: height - 150,
    size: 12,
    font: helveticaFont,
    color: darkGray,
  })

  page.drawText(data.nombreCompleto, {
    x: 100,
    y: height - 180,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  })

  // Curso
  page.drawText('Por haber participado en los cursos de:', {
    x: 100,
    y: height - 220,
    size: 12,
    font: helveticaFont,
    color: darkGray,
  })

  const fallbackCurso = wrapCursoEnDosLineas(
    data.curso,
    helveticaFont,
    12,
    10,
    320
  )
  fallbackCurso.lines.forEach((line, i) => {
    page.drawText(line, {
      x: 100,
      y: height - 250 - i * (fallbackCurso.fontSize * 1.25),
      size: fallbackCurso.fontSize,
      font: helveticaFont,
      color: darkGray,
    })
  })

  // Fecha
  page.drawText(`Fecha: ${formatDate(data.fecha)}`, {
    x: 100,
    y: height - 290,
    size: 12,
    font: helveticaFont,
    color: darkGray,
  })

  // Calificación
  if (data.calificacion) {
    page.drawText('CALIFICACION', {
      x: 100,
      y: height - 330,
      size: 12,
      font: helveticaBold,
      color: darkGray,
    })
    page.drawText(data.calificacion, {
      x: 300,
      y: height - 330,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    })
  }

  // Folio
  page.drawText(`Registro: ${data.folio}`, {
    x: 100,
    y: height - 380,
    size: 10,
    font: helveticaFont,
    color: darkGray,
  })

  // QR
  const verificationUrl = `${baseUrl}/validar/${data.folio}`
  const qrDataURL = await generateQRCodeDataURL(verificationUrl)
  const qrResponse = await fetch(qrDataURL)
  const qrArrayBuffer = await qrResponse.arrayBuffer()
  const qrImage = await pdfDoc.embedPng(qrArrayBuffer)

  page.drawImage(qrImage, {
    x: width - 150,
    y: 50,
    width: 100,
    height: 100,
  })

  return await pdfDoc.save()
}

/**
 * Dividir texto en hasta 2 líneas que quepan en maxWidth (en puntos).
 * Devuelve { lines, fontSize }.
 */
function wrapCursoEnDosLineas(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  sizeNormal: number,
  sizeReducido: number,
  maxWidth: number
): { lines: string[]; fontSize: number } {
  const w = font.widthOfTextAtSize(text, sizeNormal)
  if (w <= maxWidth) return { lines: [text], fontSize: sizeNormal }
  const words = text.trim().split(/\s+/)
  if (words.length <= 1) return { lines: [text], fontSize: sizeReducido }
  let line1 = ''
  let line2 = ''
  for (let i = 0; i < words.length; i++) {
    const candidate = line1 ? line1 + ' ' + words[i] : words[i]
    if (font.widthOfTextAtSize(candidate, sizeReducido) <= maxWidth) {
      line1 = candidate
    } else {
      line2 = words.slice(i).join(' ')
      break
    }
  }
  if (!line2) return { lines: [line1], fontSize: sizeReducido }
  if (!line1) return { lines: [text], fontSize: sizeReducido } // una palabra muy larga
  return { lines: [line1, line2], fontSize: sizeReducido }
}

/**
 * Formatear fecha para mostrar. Si no es una fecha válida (ej. "21 y 22 de feb"), devuelve el string tal cual.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
