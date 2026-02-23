/**
 * Utilidades para procesar archivos Excel
 */
import * as XLSX from 'xlsx'

export interface ExcelRow {
  nombre: string
  curso: string
  horas: number
  fecha: string
  calificacion?: string
}

export interface ExcelValidationResult {
  valid: boolean
  errors: string[]
  rows: ExcelRow[]
}

/**
 * Validar y parsear archivo Excel
 * @param file - Archivo Excel a procesar
 * @returns Promise con los datos validados
 */
export async function procesarExcel(
  file: File
): Promise<ExcelValidationResult> {
  const errors: string[] = []
  const rows: ExcelRow[] = []
  
  try {
    // Leer archivo como buffer
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Obtener primera hoja
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        valid: false,
        errors: ['El archivo Excel no contiene hojas'],
        rows: [],
      }
    }
    
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: ['nombre', 'curso', 'horas', 'fecha', 'calificacion'],
      range: 1, // Saltar primera fila (encabezados)
    }) as any[]
    
    // Validar cada fila
    jsonData.forEach((row, index) => {
      const rowNumber = index + 2 // +2 porque empezamos en fila 2 (1 es encabezado)
      const rowErrors: string[] = []
      
      // Validar nombre
      if (!row.nombre || typeof row.nombre !== 'string' || row.nombre.trim() === '') {
        rowErrors.push(`Fila ${rowNumber}: Nombre requerido`)
      }
      
      // Validar curso
      if (!row.curso || typeof row.curso !== 'string' || row.curso.trim() === '') {
        rowErrors.push(`Fila ${rowNumber}: Curso requerido`)
      }
      
      // Validar horas
      const horas = typeof row.horas === 'number' ? row.horas : parseInt(row.horas)
      if (isNaN(horas) || horas <= 0) {
        rowErrors.push(`Fila ${rowNumber}: Horas debe ser un número válido mayor a 0`)
      }
      
      // Fecha: aceptar string libre (ej. "21 y 22 de feb") o fecha parseable
      let fechaValor: string
      if (row.fecha === undefined || row.fecha === null || String(row.fecha).trim() === '') {
        rowErrors.push(`Fila ${rowNumber}: Fecha requerida`)
        fechaValor = ''
      } else if (typeof row.fecha === 'number') {
        // Excel almacena fechas como números (días desde 1900-01-01)
        const d = XLSX.SSF.parse_date_code(row.fecha)
        if (d) {
          fechaValor = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
        } else {
          fechaValor = String(row.fecha).trim()
        }
      } else {
        const str = String(row.fecha).trim()
        const asDate = new Date(str)
        if (!isNaN(asDate.getTime())) {
          fechaValor = asDate.toISOString().split('T')[0]
        } else {
          // Texto libre: "21 y 22 de feb", etc.
          fechaValor = str
        }
      }
      
      // Si hay errores, agregarlos a la lista
      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else {
        // Fila válida, agregar a la lista
        rows.push({
          nombre: String(row.nombre).trim(),
          curso: String(row.curso).trim(),
          horas: horas,
          fecha: fechaValor,
          calificacion: row.calificacion ? String(row.calificacion).trim() : undefined,
        })
      }
    })
    
    // Si no hay filas válidas
    if (rows.length === 0 && errors.length === 0) {
      errors.push('No se encontraron filas válidas en el archivo')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      rows,
    }
  } catch (error: any) {
    return {
      valid: false,
      errors: [`Error procesando archivo: ${error.message}`],
      rows: [],
    }
  }
}
