import Link from 'next/link'

export default function Usuario() {
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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-16">Mi Cuenta</h1>
        
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Información del Usuario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg">usuario@ejemplo.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <p className="mt-1 text-lg">Plan Gratuito</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cálculos este mes</label>
                <p className="mt-1 text-lg">3 de 5</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-xl font-bold mb-4">Historial de Cálculos</h3>
            <p className="text-gray-600">El historial estará disponible próximamente.</p>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/pricing" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Actualizar Plan
            </Link>
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
