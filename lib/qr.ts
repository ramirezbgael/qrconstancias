/**
 * Utilidades para generar códigos QR
 */
import QRCode from 'qrcode'

/**
 * Generar código QR como imagen base64
 * @param url - URL a codificar en el QR
 * @returns Promise<string> - Imagen en formato base64
 */
export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generando QR:', error)
    throw new Error('Error al generar código QR')
  }
}

/**
 * Generar código QR como buffer (para PDF)
 * @param url - URL a codificar en el QR
 * @returns Promise<Buffer> - Buffer de la imagen
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeBuffer
  } catch (error) {
    console.error('Error generando QR buffer:', error)
    throw new Error('Error al generar código QR')
  }
}

/**
 * Generar código QR como Data URL (para PDF usando fetch)
 * @param url - URL a codificar en el QR
 * @returns Promise<string> - Data URL de la imagen
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generando QR Data URL:', error)
    throw new Error('Error al generar código QR')
  }
}
