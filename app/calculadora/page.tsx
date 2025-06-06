// INSTRUCCIONES:
// 1. En VS Code, abre el archivo: app/page.tsx
// 2. Borra TODO el contenido
// 3. Pega este código completo

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navegación */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">
              LegalCompute Pro
            </h1>
            <div className="space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Calcula Plazos Legales en Segundos
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            La herramienta más precisa para calcular términos procesales en materia de amparo
          </p>
          <Link href="/calculadora" className="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 inline-block">
            Probar Gratis
          </Link>
        </div>
      </div>

      {/* Características */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir LegalCompute Pro?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-2">Rápido y Preciso</h4>
              <p className="text-gray-600">
                Cálculos instantáneos con 100% de precisión en plazos procesales
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-4xl mb-4">📅</div>
              <h4 className="text-xl font-semibold mb-2">Días Inhábiles Actualizados</h4>
              <p className="text-gray-600">
                Base de datos actualizada con todos los días inhábiles oficiales
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-4xl mb-4">📄</div>
              <h4 className="text-xl font-semibold mb-2">Genera Textos Legales</h4>
              <p className="text-gray-600">
                Textos listos para incluir en tus promociones y resoluciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Planes y Precios
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Gratis */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-2">Gratis</h4>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/mes</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  5 cálculos por mes
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Recursos de revisión
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">✗</span>
                  Exportar PDF
                </li>
              </ul>
              <Link href="/registro" className="block text-center bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Litigante */}
            <div className="bg-blue-600 text-white rounded-lg p-6 transform scale-105 shadow-xl">
              <div className="bg-blue-500 text-xs uppercase px-2 py-1 rounded inline-block mb-2">
                Más Popular
              </div>
              <h4 className="text-xl font-semibold mb-2">Litigante</h4>
              <p className="text-3xl font-bold mb-4">$199<span className="text-sm font-normal">/mes</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  100 cálculos por mes
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Todos los recursos
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Exportar PDF
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Soporte prioritario
                </li>
              </ul>
              <Link href="/registro" className="block text-center bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100">
                Elegir Plan
              </Link>
            </div>

            {/* Plan Despacho */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-2">Despacho</h4>
              <p className="text-3xl font-bold mb-4">$599<span className="text-sm font-normal">/mes</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Cálculos ilimitados
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  5 usuarios
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  API access
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Plantillas personalizadas
                </li>
              </ul>
              <Link href="/registro" className="block text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800">
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 LegalCompute Pro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}