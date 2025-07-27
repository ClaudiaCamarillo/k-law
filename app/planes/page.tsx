'use client'

import { useRouter } from 'next/navigation'

export default function PlanesPage() {
  const router = useRouter()

  const seleccionarPlan = (plan: 'free' | 'premium') => {
    if (plan === 'free') {
      // Ir directo a selección de tipo de usuario
      router.push('/')
    } else {
      // En el futuro, aquí iría a la página de pago
      alert('Próximamente: Integración con pasarela de pago')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #0f1f33 100%)' }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-white font-bold mb-3" style={{ fontSize: '32px' }}>
              Elige tu Plan
            </h1>
            <p className="text-gray-300 text-sm">
              Comienza gratis o desbloquea todo el potencial
            </p>
          </div>

          {/* Plans Container */}
          <div className="flex flex-row gap-6 justify-center items-stretch">
            {/* Free Plan Card */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-sm">
              <div className="text-center">
                <div className="text-5xl mb-4">⚖️</div>
                <h2 className="text-xl font-bold text-white mb-2">K-LAW Free</h2>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-gray-300 text-lg ml-1">MXN</span>
                </div>
                <ul className="text-left text-gray-200 text-sm space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>3 cálculos por día</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Calculadoras básicas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Sin guardar histórico</span>
                  </li>
                </ul>
                <button
                  onClick={() => seleccionarPlan('free')}
                  className="w-full py-4 border-2 border-white text-white font-medium rounded-full text-lg hover:bg-white/10 transition-all"
                >
                  Comenzar Gratis
                </button>
              </div>
            </div>

            {/* Premium Plan Card */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500 w-full max-w-sm" style={{ borderColor: '#4a90e2' }}>
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs px-4 py-1 rounded-full font-medium" style={{ background: '#4a90e2' }}>
                  MÁS POPULAR
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-4">👑</div>
                <h2 className="text-xl font-bold text-white mb-2">K-LAW Premium</h2>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">$299</span>
                  <span className="text-gray-300 text-lg ml-1">MXN/mes</span>
                </div>
                <ul className="text-left text-gray-200 text-sm space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Cálculos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Todas las calculadoras</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Histórico completo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Exportar PDF</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Soporte prioritario</span>
                  </li>
                </ul>
                <button
                  onClick={() => seleccionarPlan('premium')}
                  className="w-full py-4 text-white font-medium rounded-full text-lg transition-all hover:opacity-90"
                  style={{ background: '#4a90e2' }}
                >
                  Comenzar Prueba
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-8">
            Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  )
}