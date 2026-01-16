'use client'

import { useState } from 'react'
import { crearConstancia } from '@/lib/constancias'
import type { NuevaConstancia } from '@/lib/constancias'

export default function FormularioConstancia() {
  const [formData, setFormData] = useState<NuevaConstancia>({
    nombre_completo: '',
    curso: '',
    duracion_horas: 0,
    fecha: new Date().toISOString().split('T')[0],
    calificacion: '',
    observaciones: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duracion_horas' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Obtener URL base (usa variable de entorno en producción, o window.location.origin en desarrollo)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const { constancia, error: createError } = await crearConstancia(
        formData,
        baseUrl
      )

      if (createError) {
        setError(`Error al crear constancia: ${createError.message || 'Error desconocido'}`)
      } else {
        setSuccess(
          `¡Constancia creada exitosamente! Folio: ${constancia.folio}`
        )
        // Limpiar formulario
        setFormData({
          nombre_completo: '',
          curso: '',
          duracion_horas: 0,
          fecha: new Date().toISOString().split('T')[0],
          calificacion: '',
          observaciones: '',
        })
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Alta Manual de Constancia
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre_completo" className="form-label">
            Nombre Completo *
          </label>
          <input
            id="nombre_completo"
            name="nombre_completo"
            type="text"
            value={formData.nombre_completo}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="curso" className="form-label">
            Curso *
          </label>
          <input
            id="curso"
            name="curso"
            type="text"
            value={formData.curso}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="duracion_horas" className="form-label">
              Duración (horas) *
            </label>
            <input
              id="duracion_horas"
              name="duracion_horas"
              type="number"
              min="1"
              value={formData.duracion_horas || ''}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="fecha" className="form-label">
              Fecha *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="calificacion" className="form-label">
            Calificación (opcional)
          </label>
          <input
            id="calificacion"
            name="calificacion"
            type="text"
            value={formData.calificacion || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 95, Aprobado, Excelente"
          />
        </div>

        <div>
          <label htmlFor="observaciones" className="form-label">
            Observaciones (opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="form-input"
            rows={3}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando constancia...' : 'Generar Constancia'}
          </button>
        </div>
      </form>
    </div>
  )
}
