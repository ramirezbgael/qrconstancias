'use client'

import { useEffect, useState } from 'react'
import { listarConstancias, regenerarPDFConstancia, actualizarConstancia, actualizarQrUrlConstancia } from '@/lib/constancias'
import type { Constancia, ConstanciaEditable } from '@/lib/constancias'

export default function ListaConstancias() {
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerandoFolio, setRegenerandoFolio] = useState<string | null>(null)
  const [reparandoFolio, setReparandoFolio] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [editingConstancia, setEditingConstancia] = useState<Constancia | null>(null)
  const [editForm, setEditForm] = useState<ConstanciaEditable | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarConstancias()
  }, [])

  const cargarConstancias = async () => {
    setLoading(true)
    setError(null)

    const { constancias: data, error: err } = await listarConstancias()

    if (err) {
      setError(`Error al cargar constancias: ${err.message}`)
    } else {
      setConstancias(data)
    }

    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleRegenerarPDF = async (constancia: Constancia) => {
    setRegenerandoFolio(constancia.folio)
    setMensaje(null)
    setError(null)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const { error: err } = await regenerarPDFConstancia(constancia, baseUrl)
    setRegenerandoFolio(null)
    if (err) {
      setError(`Error al regenerar PDF (${constancia.folio}): ${err.message || 'Desconocido'}`)
    } else {
      setMensaje(`PDF de ${constancia.folio} regenerado con el formato actual.`)
      cargarConstancias()
    }
  }

  const handleRepararQR = async (constancia: Constancia) => {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    if (!appUrl || appUrl.includes('localhost')) {
      setError(
        'No se pudo determinar el dominio público. Configura NEXT_PUBLIC_APP_URL (ej. https://gmorivera.com) en producción.'
      )
      return
    }
    const fixed = `${appUrl.replace(/\/+$/, '')}/validar/${constancia.folio}`
    setReparandoFolio(constancia.folio)
    setMensaje(null)
    setError(null)
    const { error: errUpdate } = await actualizarQrUrlConstancia(constancia.id, fixed)
    if (errUpdate) {
      setReparandoFolio(null)
      setError(`Error al reparar QR (${constancia.folio}): ${errUpdate.message || 'Desconocido'}`)
      return
    }
    // Regenerar PDF usando el qr_url corregido (sin cambiar folio)
    const { error: errPdf } = await regenerarPDFConstancia({ ...constancia, qr_url: fixed }, appUrl)
    setReparandoFolio(null)
    if (errPdf) {
      setError(`Error al regenerar PDF (${constancia.folio}): ${errPdf.message || 'Desconocido'}`)
    } else {
      setMensaje(`QR reparado y PDF regenerado para ${constancia.folio}.`)
      cargarConstancias()
    }
  }

  const openEdit = (constancia: Constancia) => {
    setEditingConstancia(constancia)
    setEditForm({
      nombre_completo: constancia.nombre_completo,
      curso: constancia.curso,
      duracion_horas: constancia.duracion_horas,
      fecha: constancia.fecha,
      calificacion: constancia.calificacion ?? '',
      observaciones: constancia.observaciones ?? '',
    })
    setError(null)
  }

  const closeEdit = () => {
    setEditingConstancia(null)
    setEditForm(null)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editForm) return
    const { name, value } = e.target
    setEditForm((prev) => prev ? {
      ...prev,
      [name]: name === 'duracion_horas' ? parseInt(value, 10) || 0 : value,
    } : null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingConstancia || !editForm) return
    setSaving(true)
    setError(null)
    const { error: err } = await actualizarConstancia(editingConstancia.id, {
      ...editForm,
      calificacion: editForm.calificacion || undefined,
      observaciones: editForm.observaciones || undefined,
    })
    setSaving(false)
    if (err) {
      setError(`Error al guardar: ${err.message || 'Desconocido'}`)
      return
    }
    setMensaje(`Constancia ${editingConstancia.folio} actualizada. El folio y el enlace no cambian.`)
    closeEdit()
    cargarConstancias()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando constancias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Lista de Constancias ({constancias.length})
        </h2>
        <button
          onClick={cargarConstancias}
          className="btn-secondary text-sm"
        >
          Actualizar
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {constancias.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay constancias registradas aún.
        </div>
      ) : (
        <div className="overflow-x-hidden">
          <table className="w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="w-[22%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emitida</th>
                <th className="w-[28%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {constancias.map((constancia) => (
                <tr key={constancia.id}>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 align-top">
                    {constancia.folio}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 align-top break-words">
                    {constancia.nombre_completo}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 align-top break-words">
                    {constancia.curso}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500 align-top">
                    {formatDate(constancia.fecha)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500 align-top">
                    {formatDate(constancia.created_at)}
                  </td>
                  <td className="px-3 py-3 text-sm align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(constancia)}
                        className="px-2 py-1 text-xs font-medium rounded border border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        title="Editar datos (el folio y el enlace no cambian)"
                      >
                        Editar
                      </button>
                      {constancia.pdf_url ? (
                        <a
                          href={`${constancia.pdf_url}?v=${Date.now()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">Sin PDF</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRegenerarPDF(constancia)}
                        disabled={regenerandoFolio !== null}
                        className="px-2 py-1 text-xs font-medium rounded border border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerar PDF con el formato actual"
                      >
                        {regenerandoFolio === constancia.folio ? 'Regenerando…' : 'Regenerar PDF'}
                      </button>
                      {(!constancia.qr_url || constancia.qr_url.includes('localhost')) && (
                        <button
                          type="button"
                          onClick={() => handleRepararQR(constancia)}
                          disabled={reparandoFolio !== null}
                          className="px-2 py-1 text-xs font-medium rounded border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reparar QR (solo si apunta a localhost)"
                        >
                          {reparandoFolio === constancia.folio ? 'Reparando…' : 'Reparar QR'}
                        </button>
                      )}
                      <a
                        href={`/validar/${constancia.folio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        Verificar
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar constancia */}
      {editingConstancia && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Editar constancia</h3>
              <p className="text-sm text-gray-500 mb-4">
                Folio: <strong>{editingConstancia.folio}</strong> (no se modifica; el QR y el enlace de verificación se mantienen).
              </p>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={editForm.nombre_completo}
                    onChange={handleEditChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                  <input
                    type="text"
                    name="curso"
                    value={editForm.curso}
                    onChange={handleEditChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                    <input
                      type="number"
                      name="duracion_horas"
                      min={1}
                      value={editForm.duracion_horas}
                      onChange={handleEditChange}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="text"
                      name="fecha"
                      value={editForm.fecha}
                      onChange={handleEditChange}
                      className="form-input w-full"
                      placeholder="ej. 20 Y 21 FEB 2026"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (opcional)</label>
                  <input
                    type="text"
                    name="calificacion"
                    value={editForm.calificacion}
                    onChange={handleEditChange}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
                  <textarea
                    name="observaciones"
                    value={editForm.observaciones}
                    onChange={handleEditChange}
                    className="form-input w-full"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button type="button" onClick={closeEdit} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
