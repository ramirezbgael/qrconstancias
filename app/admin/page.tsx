'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkSession, signIn, signOut } from '@/lib/auth'
import FormularioConstancia from '@/components/FormularioConstancia'
import CargaMasiva from '@/components/CargaMasiva'
import ListaConstancias from '@/components/ListaConstancias'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'manual' | 'masiva' | 'lista'>('manual')

  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    const { session } = await checkSession()
    setIsAuthenticated(!!session)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await signIn(email, password)

    if (loginError) {
      setError('Credenciales inválidas')
      setLoading(false)
    } else {
      setIsAuthenticated(true)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setIsAuthenticated(false)
    router.push('/')
  }

  // Mostrar formulario de login si no está autenticado
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Acceso 
            
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-gray-900"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Mostrar panel de administración si está autenticado
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Panel de Administración
              </h1>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Alta Manual
              </button>
              <button
                onClick={() => setActiveTab('masiva')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'masiva'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Carga Masiva
              </button>
              <button
                onClick={() => setActiveTab('lista')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lista'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ver Constancias
              </button>
            </nav>
          </div>

          {/* Contenido de tabs */}
          {activeTab === 'manual' && <FormularioConstancia />}
          {activeTab === 'masiva' && <CargaMasiva />}
          {activeTab === 'lista' && <ListaConstancias />}
        </main>
      </div>
    )
  }

  // Cargando
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verificando sesión...</p>
      </div>
    </div>
  )
}
