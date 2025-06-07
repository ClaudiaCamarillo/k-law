import Link from 'next/link'

export default function Recursos() {
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
        <h1 className="text-4xl font-bold text-center mb-16">Recursos Jurídicos</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Guías de Amparo</h2>
            <p className="text-gray-600 mb-4">Documentación completa sobre procedimientos de amparo</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Jurisprudencias</h2>
            <p className="text-gray-600 mb-4">Base de datos de jurisprudencias actualizadas</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Formatos Legales</h2>
            <p className="text-gray-600 mb-4">Plantillas y formatos para diversos recursos</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Legislación</h2>
            <p className="text-gray-600 mb-4">Leyes y códigos federales actualizados</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Tutoriales</h2>
            <p className="text-gray-600 mb-4">Videos y guías paso a paso</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Blog Jurídico</h2>
            <p className="text-gray-600 mb-4">Artículos y análisis de expertos</p>
            <span className="text-blue-600">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
