/**
 * Utilidades para gestionar constancias en Supabase
 */
import { supabase } from './supabaseClient'
import { createAdminClient } from './supabaseClient'
import { generateConstanciaPDF } from './pdf'

export interface Constancia {
  id: string
  folio: string
  nombre_completo: string
  curso: string
  duracion_horas: number
  fecha: string
  calificacion?: string
  observaciones?: string
  pdf_url?: string
  qr_url?: string
  created_at: string
}

export interface NuevaConstancia {
  nombre_completo: string
  curso: string
  duracion_horas: number
  fecha: string
  calificacion?: string
  observaciones?: string
}

/**
 * Generar próximo folio automático
 */
export async function generarFolio(): Promise<string> {
  const { data, error } = await supabase.rpc('obtener_proximo_folio')
  
  if (error) {
    console.error('Error generando folio:', error)
    // Fallback: generar folio manualmente
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    return `PC-${year}-${random}`
  }
  
  return data as string
}

/**
 * Crear nueva constancia y generar PDF
 */
export async function crearConstancia(
  datos: NuevaConstancia,
  baseUrl: string
): Promise<{ constancia: Constancia; error: any }> {
  try {
    // Generar folio
    const folio = await generarFolio()
    
    // Generar PDF
    const pdfBytes = await generateConstanciaPDF(
      {
        folio,
        nombreCompleto: datos.nombre_completo,
        curso: datos.curso,
        duracionHoras: datos.duracion_horas,
        fecha: datos.fecha,
        calificacion: datos.calificacion,
        observaciones: datos.observaciones,
      },
      baseUrl
    )
    
    // Subir PDF a Supabase Storage
    const fileName = `${folio}.pdf`
    const filePath = fileName // Almacenar directamente en la raíz del bucket
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('constancias')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })
    
    if (uploadError) {
      console.error('Error subiendo PDF:', uploadError)
      
      // Si el error es que no existe el bucket, proporcionar mensaje más claro
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        return { 
          constancia: null as any, 
          error: {
            ...uploadError,
            message: 'Error: El bucket "constancias" no existe en Supabase Storage. Por favor, créalo desde el panel de Supabase. Consulta CONFIGURAR-STORAGE.md para más información.'
          }
        }
      }
      
      return { constancia: null as any, error: uploadError }
    }
    
    // Obtener URL pública del PDF
    // Si el bucket es privado, necesitamos generar una signed URL temporal
    // O hacer el bucket público en Supabase
    const { data: urlData } = supabase.storage
      .from('constancias')
      .getPublicUrl(filePath)
    
    const pdfUrl = urlData.publicUrl
    
    // Insertar constancia en la base de datos
    const { data: constancia, error: insertError } = await supabase
      .from('constancias')
      .insert({
        folio,
        nombre_completo: datos.nombre_completo,
        curso: datos.curso,
        duracion_horas: datos.duracion_horas,
        fecha: datos.fecha,
        calificacion: datos.calificacion || null,
        observaciones: datos.observaciones || null,
        pdf_url: pdfUrl,
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error insertando constancia:', insertError)
      // Intentar eliminar el PDF subido si falla la inserción
      await supabase.storage.from('constancias').remove([filePath])
      return { constancia: null as any, error: insertError }
    }
    
    return { constancia, error: null }
  } catch (error: any) {
    console.error('Error creando constancia:', error)
    return { constancia: null as any, error }
  }
}

/**
 * Crear múltiples constancias (carga masiva)
 */
export async function crearConstanciasMasivas(
  datos: NuevaConstancia[],
  baseUrl: string
): Promise<{ exitosas: number; errores: any[] }> {
  const errores: any[] = []
  let exitosas = 0
  
  // Procesar cada constancia de forma secuencial para evitar condiciones de carrera
  for (let i = 0; i < datos.length; i++) {
    const dato = datos[i]
    
    // Crear una copia del dato para evitar problemas de referencia
    const datoCopia: NuevaConstancia = {
      nombre_completo: dato.nombre_completo,
      curso: dato.curso,
      duracion_horas: dato.duracion_horas,
      fecha: dato.fecha,
      calificacion: dato.calificacion,
      observaciones: dato.observaciones,
    }
    
    console.log(`Procesando constancia ${i + 1}/${datos.length}: ${datoCopia.nombre_completo}`)
    
    const { constancia, error } = await crearConstancia(datoCopia, baseUrl)
    
    if (error) {
      console.error(`Error creando constancia ${i + 1}:`, error)
      errores.push({ datos: datoCopia, error })
    } else {
      console.log(`Constancia ${i + 1} creada exitosamente con folio: ${constancia.folio}`)
      exitosas++
    }
    
    // Pequeño delay para evitar problemas de concurrencia en la base de datos
    if (i < datos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return { exitosas, errores }
}

/**
 * Obtener constancia por folio (pública)
 */
export async function obtenerConstanciaPorFolio(
  folio: string
): Promise<{ constancia: Constancia | null; error: any }> {
  const { data, error } = await supabase
    .from('constancias')
    .select('*')
    .eq('folio', folio)
    .single()
  
  return { constancia: data as Constancia | null, error }
}

/**
 * Listar todas las constancias (solo admin)
 */
export async function listarConstancias(): Promise<{
  constancias: Constancia[]
  error: any
}> {
  const { data, error } = await supabase
    .from('constancias')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { constancias: (data as Constancia[]) || [], error }
}
