'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ValidarPage() {
  const router = useRouter()
  const [folio, setFolio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folio.trim()) {
      router.push(`/validar/${folio.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Verificar Constancia
        </h1>
        <p className="text-gray-600 mb-6">
          Ingresa el folio de la constancia que deseas verificar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folio" className="form-label">
              Folio de la Constancia
            </label>
            <input
              id="folio"
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value.toUpperCase())}
              className="form-input"
              placeholder="PC-2024-00001"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    </div>
  )
}
