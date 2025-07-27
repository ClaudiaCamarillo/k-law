import Link from 'next/link'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              LegalCompute Pro
            </Link>
            <Link href="/calculadoras" className="text-gray-600 hover:text-gray-900">
              Volver a calculadoras
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-16">Planes y Precios</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4">Plan Gratuito</h2>
            <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/mes</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">✓ 5 cálculos por mes</li>
              <li className="flex items-center">✓ Calculadora de revisión</li>
              <li className="flex items-center">✓ Exportar resultados</li>
            </ul>
            <button className="w-full bg-gray-300 text-gray-700 py-2 rounded cursor-not-allowed">
              Plan Actual
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-8 border-2 border-blue-500">
            <h2 className="text-2xl font-bold mb-4">Plan Pro</h2>
            <p className="text-4xl font-bold mb-6">$299<span className="text-lg text-gray-600">/mes</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">✓ Cálculos ilimitados</li>
              <li className="flex items-center">✓ Todas las calculadoras</li>
              <li className="flex items-center">✓ Soporte prioritario</li>
              <li className="flex items-center">✓ Historial de cálculos</li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Actualizar
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-4">Plan Empresa</h2>
            <p className="text-4xl font-bold mb-6">$999<span className="text-lg text-gray-600">/mes</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">✓ Todo de Pro</li>
              <li className="flex items-center">✓ Usuarios ilimitados</li>
              <li className="flex items-center">✓ API personalizada</li>
              <li className="flex items-center">✓ Soporte dedicado</li>
            </ul>
            <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
              Contactar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}