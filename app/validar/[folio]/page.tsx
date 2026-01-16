'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerConstanciaPorFolio } from '@/lib/constancias'
import type { Constancia } from '@/lib/constancias'

export default function ValidarFolioPage() {
  const params = useParams()
  const router = useRouter()
  const folio = params.folio as string
  const [constancia, setConstancia] = useState<Constancia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (folio) {
      cargarConstancia()
    }
  }, [folio])

  const cargarConstancia = async () => {
    setLoading(true)
    setError(null)

    const { constancia: data, error: err } = await obtenerConstanciaPorFolio(folio)

    if (err || !data) {
      setError('Constancia no encontrada o folio inválido')
      setConstancia(null)
    } else {
      setConstancia(data)
    }

    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando constancia...</p>
        </div>
      </div>
    )
  }

  if (error || !constancia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Constancia no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            El folio <strong>{folio}</strong> no existe en nuestros registros.
          </p>
          <div className="space-y-2">
            <Link
              href="/validar"
              className="block w-full btn-primary"
            >
              Verificar otro folio
            </Link>
            <Link
              href="/"
              className="block w-full btn-secondary"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/validar"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Verificar otro folio
        </Link>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Encabezado */}
          <div className="text-center mb-8 pb-6 border-b">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              CONSTANCIA VERIFICADA
            </h1>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">VÁLIDA</span>
            </div>
          </div>

          {/* Información de la constancia */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-500">Folio</label>
              <p className="text-lg font-semibold text-gray-800">{constancia.folio}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-lg text-gray-800">{constancia.nombre_completo}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Curso</label>
              <p className="text-lg text-gray-800">{constancia.curso}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Duración</label>
                <p className="text-lg text-gray-800">{constancia.duracion_horas} horas</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha</label>
                <p className="text-lg text-gray-800">{formatDate(constancia.fecha)}</p>
              </div>
            </div>

            {constancia.observaciones && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observaciones</label>
                <p className="text-lg text-gray-800">{constancia.observaciones}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Emisión</label>
              <p className="text-lg text-gray-800">
                {new Date(constancia.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Descargar PDF */}
          {constancia.pdf_url && (
            <div className="mb-6">
              <a
                href={constancia.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descargar PDF
              </a>
            </div>
          )}

          {/* Texto legal */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Información Legal:</strong> Esta constancia ha sido verificada y es válida según
              nuestros registros oficiales. La información mostrada corresponde exactamente a la
              registrada en nuestra base de datos al momento de la emisión. Esta verificación
              se realiza únicamente con el folio proporcionado y no incluye listados completos
              de constancias emitidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
