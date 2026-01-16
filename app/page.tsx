import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Sistema de Constancias
        </h1>
        <h2 className="text-xl text-gray-600 mb-8">
          Protección Civil
        </h2>
        
        <div className="space-y-4">
          <Link
            href="/admin"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Panel de Administración
          </Link>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            ¿Tienes un folio para verificar?
          </p>
          
          <Link
            href="/validar"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Verificar Constancia
          </Link>
        </div>
      </div>
    </div>
  )
}
