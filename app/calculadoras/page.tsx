import Link from 'next/link'

export default function Calculadoras() {
  const calculadoras = [
    {
      titulo: 'Recursos de Revisión',
      descripcion: 'Calcula plazos para recursos de revisión principal y adhesivo',
      link: '/calculadoras/revision',
      disponible: true
    },
    {
      titulo: 'Amparo Directo',
      descripcion: 'Calcula plazos para demandas de amparo directo',
      link: '/calculadoras/amparo-directo',
      disponible: false
    },
    {
      titulo: 'Amparo Indirecto',
      descripcion: 'Calcula plazos para demandas de amparo indirecto',
      link: '/calculadoras/amparo-indirecto',
      disponible: false
    },
    {
      titulo: 'Recurso de Inconformidad',
      descripcion: 'Calcula plazos para recursos de inconformidad',
      link: '/calculadoras/inconformidad',
      disponible: false
    },
    {
      titulo: 'Recurso de Queja',
      descripcion: 'Calcula plazos para recursos de queja',
      link: '/calculadoras/recurso-de-queja',
      disponible: false
    },
    {
      titulo: 'Recurso de Reclamación',
      descripcion: 'Calcula plazos para recursos de reclamación',
      link: '/calculadoras/recurso-de-reclamacion',
      disponible: false
    },
    {
      titulo: 'Revisión Fiscal',
      descripcion: 'Calcula plazos para recursos de revisión fiscal',
      link: '/calculadoras/revision-fiscal',
      disponible: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              LegalCompute Pro
            </Link>
            <div className="text-sm text-gray-600">
              Plan Gratuito
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Calculadoras de Plazos Jurídicos</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculadoras.map((calc, index) => (
            <div key={index} className={`bg-white rounded-lg shadow p-6 ${!calc.disponible ? 'opacity-60' : ''}`}>
              <h2 className="text-xl font-semibold mb-2">{calc.titulo}</h2>
              <p className="text-gray-600 mb-4">{calc.descripcion}</p>
              {calc.disponible ? (
                <Link href={calc.link} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Usar Calculadora
                </Link>
              ) : (
                <span className="inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                  Próximamente
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}