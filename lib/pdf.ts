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
    const templateUrl = typeof window !== 'undefined' 
      ? '/constancia.pdf' 
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/constancia.pdf`
    
    const response = await fetch(templateUrl)
    if (!response.ok) {
      throw new Error('No se pudo cargar la plantilla PDF')
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
  // Usar Helvetica-Bold para textos principales (más bonita y legible)

  // Colores
  const darkGray = rgb(0, 0, 0)
  const lightGray = rgb(0.5, 0.5, 0.5)

  // Coordenadas ajustadas según la plantilla
  // Basadas en el PDF: constancia.pdf
  // Conversión aproximada: 1 cm ≈ 28 puntos, 0.5 cm ≈ 14 puntos
  
  // Nombre completo - medio centímetro abajo (14 puntos) y uno a la derecha (28 puntos), un poquito más grande
  page.drawText(data.nombreCompleto, {
    x: 100 + 28, // Uno a la derecha (28 puntos = 1 cm)
    y: height - 180 - 14, // Medio centímetro abajo (14 puntos = 0.5 cm)
    size: 16, // Un poquito más grande (de 15 a 16)
    font: helveticaBold, // Negrita
    color: darkGray,
  })

  // Curso - dos centímetros abajo (56 puntos) y uno a la derecha (28 puntos), medio cm más abajo, más grande
  page.drawText(data.curso, {
    x: 100 + 28, // Uno a la derecha
    y: height - 240 - 56 + 14 - 14, // Dos centímetros abajo, medio cm arriba, medio cm más abajo = neto igual
    size: 15, // Más grande (de 13 a 15)
    font: helveticaBold, // Negrita para mejor legibilidad
    color: darkGray,
  })

  // Fecha - 2 centímetros arriba (56 puntos) y 2 centímetros a la izquierda (56 puntos), 1 cm más abajo, más grande
  page.drawText(formatDate(data.fecha), {
    x: 100 + 140 - 56, // 5 cm a la derecha menos 2 cm a la izquierda = neto 3 cm a la derecha
    y: height - 290 - 84 + 56 - 28, // 3 cm abajo menos 2 cm arriba menos 1 cm más abajo = neto 2 cm abajo
    size: 14, // Más grande (de 12 a 14)
    font: helveticaBold, // Negrita
    color: darkGray,
  })

  // Calificación (si existe) - dos centímetros abajo (56 puntos) y 2 cm a la derecha (56 puntos), medio cm arriba, más grande
  if (data.calificacion) {
    page.drawText(data.calificacion, {
      x: 350 - 196 + 56, // 7 cm a la izquierda + 2 cm a la derecha = neto 5 cm a la izquierda
      y: height - 360 - 56 + 14, // Dos centímetros abajo, medio cm arriba (14 puntos = 0.5 cm)
      size: 16, // Más grande (de 13 a 16)
      font: helveticaBold, // Negrita
      color: darkGray,
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

  page.drawText(data.curso, {
    x: 100,
    y: height - 250,
    size: 12,
    font: helveticaFont,
    color: darkGray,
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
 * Formatear fecha para mostrar
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
