/**
 * Utilidades para generar PDFs de constancias
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { generateQRCodeDataURL } from './qr'

export interface ConstanciaData {
  folio: string
  nombreCompleto: string
  curso: string
  duracionHoras: number
  fecha: string
  observaciones?: string
}

/**
 * Generar PDF de constancia
 * @param data - Datos de la constancia
 * @param baseUrl - URL base de la aplicación (para el QR)
 * @returns Promise<Uint8Array> - PDF generado
 */
export async function generateConstanciaPDF(
  data: ConstanciaData,
  baseUrl: string
): Promise<Uint8Array> {
  // Crear nuevo documento PDF
  const pdfDoc = await PDFDocument.create()
  
  // Agregar una página
  const page = pdfDoc.addPage([595, 842]) // A4 en puntos (210mm x 297mm)
  const { width, height } = page.getSize()
  
  // Fuentes
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // Colores
  const primaryColor = rgb(0.2, 0.4, 0.8)
  const darkGray = rgb(0.2, 0.2, 0.2)
  const lightGray = rgb(0.7, 0.7, 0.7)
  
  // Título principal
  page.drawText('CONSTANCIA DE PARTICIPACIÓN', {
    x: width / 2 - 150,
    y: height - 80,
    size: 24,
    font: helveticaBold,
    color: primaryColor,
  })
  
  // Subtítulo
  page.drawText('PROTECCIÓN CIVIL', {
    x: width / 2 - 70,
    y: height - 110,
    size: 18,
    font: helveticaBold,
    color: darkGray,
  })
  
  // Línea separadora
  page.drawLine({
    start: { x: 100, y: height - 130 },
    end: { x: width - 100, y: height - 130 },
    thickness: 2,
    color: primaryColor,
  })
  
  // Texto principal
  const textY = height - 200
  const lineHeight = 25
  const fontSize = 12
  
  page.drawText('Por medio de la presente se hace constar que:', {
    x: 100,
    y: textY,
    size: fontSize,
    font: helveticaFont,
    color: darkGray,
  })
  
  // Nombre completo
  page.drawText('Nombre completo:', {
    x: 100,
    y: textY - lineHeight * 2,
    size: fontSize,
    font: helveticaBold,
    color: darkGray,
  })
  
  page.drawText(data.nombreCompleto, {
    x: 100,
    y: textY - lineHeight * 3,
    size: fontSize + 2,
    font: helveticaFont,
    color: darkGray,
  })
  
  // Curso
  page.drawText('Curso:', {
    x: 100,
    y: textY - lineHeight * 4.5,
    size: fontSize,
    font: helveticaBold,
    color: darkGray,
  })
  
  page.drawText(data.curso, {
    x: 100,
    y: textY - lineHeight * 5.5,
    size: fontSize + 2,
    font: helveticaFont,
    color: darkGray,
  })
  
  // Duración
  page.drawText(`Duración: ${data.duracionHoras} horas`, {
    x: 100,
    y: textY - lineHeight * 7,
    size: fontSize,
    font: helveticaFont,
    color: darkGray,
  })
  
  // Fecha
  page.drawText(`Fecha: ${formatDate(data.fecha)}`, {
    x: 100,
    y: textY - lineHeight * 8,
    size: fontSize,
    font: helveticaFont,
    color: darkGray,
  })
  
  // Observaciones (si existen)
  if (data.observaciones) {
    page.drawText('Observaciones:', {
      x: 100,
      y: textY - lineHeight * 9.5,
      size: fontSize,
      font: helveticaBold,
      color: darkGray,
    })
    
    const obsLines = wrapText(data.observaciones, 70)
    obsLines.forEach((line, index) => {
      page.drawText(line, {
        x: 100,
        y: textY - lineHeight * (10.5 + index),
        size: fontSize - 1,
        font: helveticaFont,
        color: darkGray,
      })
    })
  }
  
  // Folio
  page.drawText(`Folio: ${data.folio}`, {
    x: 100,
    y: textY - lineHeight * 12,
    size: fontSize - 2,
    font: helveticaFont,
    color: lightGray,
  })
  
  // Generar QR
  const verificationUrl = `${baseUrl}/validar/${data.folio}`
  const qrDataURL = await generateQRCodeDataURL(verificationUrl)
  // Convertir data URL a Uint8Array para embedPng
  const qrResponse = await fetch(qrDataURL)
  const qrArrayBuffer = await qrResponse.arrayBuffer()
  const qrImage = await pdfDoc.embedPng(qrArrayBuffer)
  
  // Agregar QR en la esquina inferior derecha
  const qrSize = 120
  const qrX = width - qrSize - 50
  const qrY = 100
  
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  })
  
  // Texto del QR
  page.drawText('Verificar en:', {
    x: qrX,
    y: qrY - 15,
    size: 8,
    font: helveticaFont,
    color: lightGray,
  })
  
  // Firma y sello (área reservada)
  const firmaY = 200
  page.drawText('_________________________', {
    x: width / 2 - 100,
    y: firmaY,
    size: fontSize,
    font: helveticaFont,
    color: darkGray,
  })
  
  page.drawText('Firma y Sello', {
    x: width / 2 - 40,
    y: firmaY - 20,
    size: fontSize - 2,
    font: helveticaFont,
    color: lightGray,
  })
  
  // Texto legal en la parte inferior
  const legalText = 'Esta constancia es un documento oficial emitido electrónicamente. ' +
    'Puede ser verificada mediante el código QR o ingresando el folio en el sitio web oficial. ' +
    'Cualquier modificación invalida este documento.'
  
  const legalLines = wrapText(legalText, 80)
  legalLines.forEach((line, index) => {
    page.drawText(line, {
      x: 50,
      y: 50 - (index * 10),
      size: 7,
      font: helveticaFont,
      color: lightGray,
      maxWidth: width - 100,
    })
  })
  
  // Generar PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
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

/**
 * Envolver texto en líneas
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  
  return lines
}
