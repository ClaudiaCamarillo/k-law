'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Recurso {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  disponible: boolean;
  premium?: boolean;
  nuevo?: boolean;
}

const recursos: Recurso[] = [
  {
    id: 'revision',
    nombre: 'Revisión',
    descripcion: 'Recursos de revisión principal y adhesiva',
    icono: '📄',
    color: 'bg-blue-500',
    disponible: true
  },
  {
    id: 'revision-fiscal',
    nombre: 'Revisión Fiscal',
    descripcion: 'Cálculo de plazos para revisión fiscal',
    icono: '💰',
    color: 'bg-green-500',
    disponible: true,
    premium: true
  },
  {
    id: 'queja',
    nombre: 'Queja',
    descripcion: 'Recursos de queja ante tribunales',
    icono: '⚖️',
    color: 'bg-purple-500',
    disponible: true,
    premium: true
  },
  {
    id: 'inconformidad',
    nombre: 'Inconformidad',
    descripcion: 'Cálculo para recursos de inconformidad',
    icono: '❗',
    color: 'bg-red-500',
    disponible: true,
    premium: true
  },
  {
    id: 'reclamacion',
    nombre: 'Reclamación',
    descripcion: 'Plazos para recursos de reclamación',
    icono: '📋',
    color: 'bg-yellow-500',
    disponible: true,
    premium: true
  },
  {
    id: 'amparo-indirecto',
    nombre: 'Amparo Indirecto',
    descripcion: 'Cálculo de términos en amparo indirecto',
    icono: '🛡️',
    color: 'bg-indigo-500',
    disponible: true,
    premium: true,
    nuevo: true
  },
  {
    id: 'amparo-directo',
    nombre: 'Amparo Directo',
    descripcion: 'Plazos para amparo directo',
    icono: '⚡',
    color: 'bg-pink-500',
    disponible: true,
    premium: true,
    nuevo: true
  }
];

export default function Recursos() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState('gratis') // Simulación - después vendrá de la DB

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage o contexto
    const savedUserType = localStorage.getItem('userType')
    if (!savedUserType) {
      router.push('/usuario')
    } else {
      setUserType(savedUserType)
    }
  }, [])

  const handleSelectResource = (recursoId: string, isPremium: boolean) => {
    if (isPremium && userPlan === 'gratis') {
      // Mostrar modal de upgrade
      alert('Esta función requiere un plan premium. ¡Mejora tu plan para acceder!')
      router.push('/pricing')
      return
    }

    // Guardar selección
    localStorage.setItem('currentResource', recursoId)
    
    // Navegar a la calculadora correspondiente
    if (recursoId === 'revision') {
      router.push('/calculadora')
    } else {
      // Navegar a la calculadora específica cuando estén implementadas
      router.push(`/calculadoras/${recursoId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navegación */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/usuario')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Cambiar tipo de usuario
              </button>
              <h1 className="text-2xl font-bold text-blue-900">
                LegalCompute Pro
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {userType === 'litigante' ? '⚖️ Litigante' : '🏛️ Servidor Público'}
              </span>
              <Link 
                href="/pricing" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
              >
                {userPlan === 'gratis' ? '🚀 Mejorar Plan' : '💎 Plan Premium'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Selecciona el tipo de recurso
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el cálculo que necesitas realizar. Cada herramienta está optimizada para sus plazos específicos.
          </p>
        </div>

        {/* Grid de recursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recursos.map((recurso) => (
            <div
              key={recurso.id}
              className={`relative transform transition-all duration-300 ${
                hoveredCard === recurso.id ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredCard(recurso.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Badge de nuevo */}
              {recurso.nuevo && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                    NUEVO
                  </span>
                </div>
              )}

              {/* Card */}
              <button
                onClick={() => handleSelectResource(recurso.id, recurso.premium || false)}
                className={`w-full h-full p-6 rounded-2xl text-white relative overflow-hidden ${
                  recurso.premium && userPlan === 'gratis' 
                    ? 'opacity-90' 
                    : 'hover:shadow-2xl'
                } transition-all duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${
                    recurso.id === 'revision' ? '#3B82F6' : 
                    recurso.id === 'revision-fiscal' ? '#10B981' :
                    recurso.id === 'queja' ? '#8B5CF6' :
                    recurso.id === 'inconformidad' ? '#EF4444' :
                    recurso.id === 'reclamacion' ? '#F59E0B' :
                    recurso.id === 'amparo-indirecto' ? '#6366F1' :
                    '#EC4899'
                  } 0%, ${
                    recurso.id === 'revision' ? '#2563EB' : 
                    recurso.id === 'revision-fiscal' ? '#059669' :
                    recurso.id === 'queja' ? '#7C3AED' :
                    recurso.id === 'inconformidad' ? '#DC2626' :
                    recurso.id === 'reclamacion' ? '#D97706' :
                    recurso.id === 'amparo-indirecto' ? '#4F46E5' :
                    '#DB2777'
                  } 100%)`
                }}
              >
                {/* Icono de premium */}
                {recurso.premium && userPlan === 'gratis' && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
                      PREMIUM
                    </span>
                  </div>
                )}

                {/* Contenido */}
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{recurso.icono}</div>
                  <h3 className="text-xl font-bold mb-2">{recurso.nombre}</h3>
                  <p className="text-sm opacity-90">{recurso.descripcion}</p>
                </div>

                {/* Efecto de hover */}
                <div className={`absolute inset-0 bg-white opacity-0 ${
                  hoveredCard === recurso.id ? 'opacity-10' : ''
                } transition-opacity duration-300`} />
              </button>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            {userPlan === 'gratis' ? (
              <>
                🔒 Los recursos marcados como PREMIUM requieren una suscripción.{' '}
                <Link href="/pricing" className="text-blue-600 hover:underline font-semibold">
                  Ver planes disponibles
                </Link>
              </>
            ) : (
              <>
                ✨ Tienes acceso completo a todas las calculadoras.{' '}
                <span className="text-green-600 font-semibold">Plan {userPlan}</span>
              </>
            )}
          </p>
        </div>

        {/* Stats o información adicional */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <p className="text-gray-600">Precisión en cálculos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
            <p className="text-gray-600">Disponibilidad</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">+5000</div>
            <p className="text-gray-600">Usuarios activos</p>
          </div>
        </div>
      </div>
    </div>
  )
}