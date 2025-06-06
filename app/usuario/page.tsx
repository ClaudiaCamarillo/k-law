'use client'

import { useRouter } from 'next/navigation'

export default function SeleccionUsuario() {
  const router = useRouter()

  const handleSelectUser = (tipo: 'litigante' | 'servidor') => {
    // Guardar en localStorage
    localStorage.setItem('userType', tipo)
    // Navegar a selección de recursos
    router.push('/recursos')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          LegalCompute Pro
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Selecciona tu perfil para continuar
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => handleSelectUser('litigante')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400"
          >
            <div className="text-blue-600 text-5xl mb-4">⚖️</div>
            <h2 className="text-2xl font-bold mb-2">Soy Litigante</h2>
            <p className="text-gray-600">
              Cálculo rápido de plazos con fechas en formato numérico
            </p>
          </button>
          
          <button
            onClick={() => handleSelectUser('servidor')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-400"
          >
            <div className="text-green-600 text-5xl mb-4">🏛️</div>
            <h2 className="text-2xl font-bold mb-2">Soy Servidor Público</h2>
            <p className="text-gray-600">
              Texto completo para resoluciones con calendario visual
            </p>
          </button>
        </div>
        
        <div className="text-center mt-12">
          <a href="/pricing" className="text-blue-600 hover:underline">
            Ver planes de suscripción →
          </a>
        </div>
      </div>
    </div>
  )
}