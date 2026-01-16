'use client'

import { useState } from 'react'
import { procesarExcel } from '@/lib/excel'
import { crearConstanciasMasivas } from '@/lib/constancias'
import type { ExcelRow } from '@/lib/excel'

export default function CargaMasiva() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ExcelRow[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validar extensión
    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls')
    ) {
      setErrors(['Por favor selecciona un archivo Excel (.xlsx o .xls)'])
      return
    }

    setFile(selectedFile)
    setErrors([])
    setSuccess(null)
    setPreview(null)

    // Procesar y validar
    setLoading(true)
    const result = await procesarExcel(selectedFile)
    setLoading(false)

    if (!result.valid) {
      setErrors(result.errors)
    } else {
      setPreview(result.rows)
    }
  }

  const handleUpload = async () => {
    if (!preview || preview.length === 0) {
      setErrors(['No hay datos válidos para procesar'])
      return
    }

    setProcessing(true)
    setErrors([])
    setSuccess(null)

    try {
      // Obtener URL base (usa variable de entorno en producción, o window.location.origin en desarrollo)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      // Convertir datos de Excel a formato de constancia
      const constancias = preview.map((row) => ({
        nombre_completo: row.nombre,
        curso: row.curso,
        duracion_horas: row.horas,
        fecha: row.fecha,
        observaciones: undefined,
      }))

      const { exitosas, errores } = await crearConstanciasMasivas(
        constancias,
        baseUrl
      )

      if (errores.length > 0) {
        setErrors([
          `Se procesaron ${exitosas} constancias exitosamente. Errores: ${errores.length}`,
          ...errores.map((e) => `Error: ${e.error.message || 'Desconocido'}`),
        ])
      } else {
        setSuccess(`¡Éxito! Se crearon ${exitosas} constancias correctamente.`)
        setFile(null)
        setPreview(null)
        // Limpiar input
        const input = document.getElementById('excel-file') as HTMLInputElement
        if (input) input.value = ''
      }
    } catch (err: any) {
      setErrors([`Error al procesar: ${err.message}`])
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Carga Masiva de Constancias
      </h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          El archivo Excel debe contener las siguientes columnas (en ese orden):
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
          <li><strong>nombre</strong> - Nombre completo del participante</li>
          <li><strong>curso</strong> - Nombre del curso</li>
          <li><strong>horas</strong> - Duración en horas (número)</li>
          <li><strong>fecha</strong> - Fecha del curso (formato fecha Excel o texto)</li>
        </ul>
        <p className="text-xs text-gray-500">
          La primera fila debe contener los encabezados. Las filas con datos
          inválidos serán omitidas.
        </p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="excel-file" className="form-label">
          Seleccionar archivo Excel
        </label>
        <input
          id="excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="form-input"
          disabled={loading || processing}
        />
        {loading && (
          <p className="mt-2 text-sm text-gray-600">Validando archivo...</p>
        )}
      </div>

      {preview && preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vista Previa ({preview.length} registros válidos)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Curso
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Horas
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {row.nombre}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {row.curso}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {row.horas}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {row.fecha}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="mt-2 text-sm text-gray-500">
                Mostrando 10 de {preview.length} registros
              </p>
            )}
          </div>
        </div>
      )}

      {preview && preview.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={processing}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing
            ? `Procesando ${preview.length} constancias...`
            : `Crear ${preview.length} Constancias`}
        </button>
      )}
    </div>
  )
}
