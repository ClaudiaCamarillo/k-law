'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// import { useUser } from '@auth0/nextjs-auth0/client'

interface Calculadora {
  id: string
  nombre: string
  descripcion: string
  icono: string
  ruta: string
  premium: boolean
}

export default function CalculadorasPage() {
  const router = useRouter()
  // const { user, error, isLoading } = useUser()
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [calculosHoy, setCalculosHoy] = useState(2)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedCalculadora, setSelectedCalculadora] = useState<Calculadora | null>(null)

  const calculadoras: Calculadora[] = [
    { id: '1', nombre: 'Amparo Directo', descripcion: 'Calcula plazos para amparo directo', icono: '⚖️', ruta: '/calculadoras/amparo-directo', premium: false },
    { id: '2', nombre: 'Amparo Indirecto', descripcion: 'Plazos para amparo indirecto', icono: '📋', ruta: '/calculadoras/amparo-indirecto', premium: false },
    { id: '3', nombre: 'Recurso de Revisión', descripcion: 'Términos para recursos de revisión', icono: '🔄', ruta: '/calculadoras/revision', premium: false },
    { id: '4', nombre: 'Recurso de Queja', descripcion: 'Calcula plazos de queja', icono: '⚡', ruta: '/calculadoras/recurso-de-queja', premium: true },
    { id: '5', nombre: 'Recurso de Reclamación', descripcion: 'Plazos para reclamaciones', icono: '📝', ruta: '/calculadoras/recurso-de-reclamacion', premium: true },
    { id: '6', nombre: 'Recurso de Inconformidad', descripcion: 'Términos de inconformidad', icono: '❗', ruta: '/calculadoras/inconformidad', premium: true },
    { id: '7', nombre: 'Revisión Fiscal', descripcion: 'Plazos para revisión fiscal', icono: '💰', ruta: '/calculadoras/revision-fiscal', premium: true }
  ]

  useEffect(() => {
    const tipo = localStorage.getItem('tipoUsuario')
    const userPlan = localStorage.getItem('userPlan') || 'free'
    setTipoUsuario(tipo)
    setPlan(userPlan as 'free' | 'premium')
  }, [])

  const handleCalculadoraClick = (calculadora: Calculadora) => {
    if (plan === 'free' && calculadora.premium) {
      setSelectedCalculadora(calculadora)
      setShowUpgradeModal(true)
      return
    }

    if (plan === 'free' && calculosHoy >= 3) {
      setShowUpgradeModal(true)
      return
    }

    router.push(calculadora.ruta)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
      
      {/* Navigation */}
      <nav style={{ backgroundColor: '#1A1A2E', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#c9a961', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}>K-LAW</span>
            </div>
            <button 
              onClick={() => router.push('/perfil')}
              className="text-white hover:text-gray-300 transition-colors"
              style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}
            >
              Mi Perfil
            </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="px-6 py-8 text-center">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1A1A2E', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
          Calculadoras Jurídicas
        </h1>
        <p style={{ color: '#666', fontSize: '1.125rem', fontFamily: 'Inter, sans-serif', fontWeight: '400', marginBottom: '2rem' }}>
          Calcula plazos y términos legales con precisión
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <button
            className="px-5 py-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: '#0A1628',
              color: '#C9A961',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '2px solid #0A1628',
              cursor: 'pointer'
            }}
          >
            📊 Calculadoras
          </button>
          <button
            onClick={() => router.push('/documentos')}
            className="px-5 py-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#0A1628',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C9A961';
              e.currentTarget.style.color = '#C9A961';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#0A1628';
            }}
          >
            📄 Documentos
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#ef4444',
              color: '#FFFFFF',
              fontSize: '0.6rem',
              fontWeight: '700',
              padding: '0.15rem 0.4rem',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              NUEVO
            </span>
          </button>
          <button
            onClick={() => router.push('/tienda')}
            className="px-5 py-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#0A1628',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C9A961';
              e.currentTarget.style.color = '#C9A961';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#0A1628';
            }}
          >
            🛍️ Tienda
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#16a34a',
              color: '#FFFFFF',
              fontSize: '0.6rem',
              fontWeight: '700',
              padding: '0.15rem 0.4rem',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              HOT
            </span>
          </button>
        </div>
        
        {/* Plan Status */}
        <div className="flex items-center justify-center gap-4">
          {plan === 'free' ? (
            <>
              <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.5rem 1.5rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Plan Gratuito
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                {calculosHoy}/3 cálculos usados hoy
              </span>
            </>
          ) : (
            <span style={{ backgroundColor: '#c9a961', color: '#1A1A2E', padding: '0.5rem 1.5rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(201, 169, 97, 0.3)' }}>
              CUENTA PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Calculators Grid */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculadoras.map((calc) => (
            <button
              key={calc.id}
              onClick={() => handleCalculadoraClick(calc)}
              className="relative group transition-all duration-300 hover:scale-105 text-left"
              style={{ minHeight: '200px' }}
            >
              <div 
                className="h-full p-6 rounded-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: calc.premium && plan === 'free' ? '#f9fafb' : '#ffffff',
                  border: calc.premium && plan === 'free' ? '2px solid #e5e7eb' : '2px solid transparent',
                  boxShadow: calc.premium && plan === 'free' ? '0 4px 20px rgba(0,0,0,0.05)' : '0 8px 30px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={(e) => {
                  if (!(calc.premium && plan === 'free')) {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    e.currentTarget.style.border = '2px solid #c9a961';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(calc.premium && plan === 'free')) {
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.border = '2px solid transparent';
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">{calc.icono}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                    {calc.nombre}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', flex: 1 }}>
                    {calc.descripcion}
                  </p>
                  
                  {calc.premium && plan === 'free' ? (
                    <div className="mt-4 flex items-center gap-2">
                      <span style={{ fontSize: '1rem' }}>🔒</span>
                      <span style={{ color: '#c9a961', fontSize: '0.875rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Premium</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2">
                      <span style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Disponible →</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#f9fafb', padding: '2rem 0', marginTop: '4rem' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
            {plan === 'free' && '¿Necesitas más cálculos? '}
            <button 
              onClick={() => router.push('/')}
              style={{ color: '#c9a961', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {plan === 'free' ? 'Actualiza a Premium' : 'Gestionar suscripción'}
            </button>
          </p>
        </div>
      </footer>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4" 
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-xl md:text-2xl" style={{ fontWeight: '700', color: '#1A1A2E', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
                {selectedCalculadora ? 'Calculadora Premium' : 'Límite Alcanzado'}
              </h2>
              <p className="text-sm md:text-base" style={{ color: '#6b7280', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>
                {selectedCalculadora 
                  ? `La calculadora "${selectedCalculadora.nombre}" requiere una cuenta Premium.`
                  : 'Has alcanzado el límite diario de 3 cálculos gratuitos.'
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#f3f4f6', 
                    color: '#374151', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => router.push('/')}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#c9a961', 
                    color: '#1A1A2E', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8975a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c9a961'; }}
                >
                  Ver Planes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}