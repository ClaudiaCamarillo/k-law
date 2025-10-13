'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [calculosHoy, setCalculosHoy] = useState(0)
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      {/* Golden Top Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '122px',
        backgroundColor: '#C5A770',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Thin Black Line */}
      <div style={{
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        height: '1.5px',
        backgroundColor: '#1C1C1C',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Elegant Header */}
      <div className="relative py-8 md:py-12" style={{ zIndex: 2 }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1C1C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative z-10 text-center px-6">
          <div className="mb-4" style={{ position: 'relative', zIndex: 10, marginTop: '-47px' }}>
            <img 
              src="/LOGO-KLAW.gif" 
              alt="K-LAW Logo" 
              className="mx-auto cursor-pointer"
              style={{ 
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '599px',
                maxHeight: '240px',
                position: 'relative',
                zIndex: 10
              }}
              onClick={() => router.push('/')}
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontWeight: '800',
            color: '#1C1C1C',
            letterSpacing: '-0.02em'
          }}>
            Calculadoras Jurídicas
          </h1>
          <p className="text-sm md:text-base" style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Calcula plazos y términos legales con precisión
          </p>
        </div>
      </div>

      {/* Navigation and Status */}
      <div className="px-6 pb-6 text-center" style={{ position: 'relative', zIndex: 5 }}>
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 md:gap-6 mb-6 flex-wrap">
          <button
            className="px-5 py-2 transition-all duration-300"
            style={{
              backgroundColor: '#1C1C1C',
              color: '#F4EFE8',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '1.5px solid #1C1C1C',
              letterSpacing: '0.02em',
              borderRadius: '30px'
            }}
          >
            📊 Calculadoras
          </button>
          <button
            onClick={() => router.push('/documentos')}
            className="px-5 py-2 transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#1C1C1C',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '1.5px solid #1C1C1C',
              letterSpacing: '0.02em',
              borderRadius: '30px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1C1C1C';
              e.currentTarget.style.color = '#F4EFE8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1C1C1C';
            }}
          >
            📄 Documentos
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#C5A770',
              color: '#1C1C1C',
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
            className="px-5 py-2 transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#1C1C1C',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '1.5px solid #1C1C1C',
              letterSpacing: '0.02em',
              borderRadius: '30px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1C1C1C';
              e.currentTarget.style.color = '#F4EFE8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1C1C1C';
            }}
          >
            🛍️ Tienda
          </button>
          <button
            onClick={() => router.push('/legislacion')}
            className="px-5 py-2 transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#1C1C1C',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              border: '1.5px solid #1C1C1C',
              letterSpacing: '0.02em',
              borderRadius: '30px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1C1C1C';
              e.currentTarget.style.color = '#F4EFE8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1C1C1C';
            }}
          >
            📖 Legislación
          </button>
        </div>
        
        {/* Plan Status */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {plan === 'free' ? (
            <>
              <span style={{ 
                backgroundColor: 'transparent',
                color: '#1C1C1C',
                border: '1px solid #1C1C1C',
                padding: '0.5rem 1.5rem', 
                borderRadius: '20px', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                fontFamily: 'Inter, sans-serif' 
              }}>
                Plan Gratuito
              </span>
              <span style={{ 
                color: '#3D3D3D', 
                fontSize: '0.875rem', 
                fontFamily: 'Inter, sans-serif' 
              }}>
                {calculosHoy}/3 cálculos usados hoy
              </span>
            </>
          ) : (
            <span style={{ 
              backgroundColor: '#C5A770', 
              color: '#1C1C1C', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '20px', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              fontFamily: 'Inter, sans-serif', 
              letterSpacing: '0.02em'
            }}>
              CUENTA PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Calculators Grid */}
      <div className="flex-1 px-6 pb-8" style={{ position: 'relative', zIndex: 5 }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculadoras.map((calc) => (
            <button
              key={calc.id}
              onClick={() => handleCalculadoraClick(calc)}
              className="relative group transition-all duration-300 transform hover:scale-[1.02] text-left"
              style={{ minHeight: '200px' }}
            >
              <div 
                className="h-full p-6 transition-all duration-300"
                style={{ 
                  backgroundColor: 'transparent',
                  border: '2px solid #C5A770',
                  cursor: 'pointer',
                  borderRadius: '30px'
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">{calc.icono}</div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: '#1C1C1C', 
                    marginBottom: '0.5rem', 
                    fontFamily: 'Playfair Display, serif' 
                  }}>
                    {calc.nombre}
                  </h3>
                  <p style={{ 
                    color: '#3D3D3D', 
                    fontSize: '0.875rem', 
                    fontFamily: 'Inter, sans-serif', 
                    flex: 1,
                    fontWeight: '300'
                  }}>
                    {calc.descripcion}
                  </p>
                  
                  {calc.premium && plan === 'free' ? (
                    <div className="mt-4 flex items-center gap-2">
                      <span style={{ fontSize: '1rem' }}>🔒</span>
                      <span style={{ 
                        color: '#C5A770', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>Premium</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2">
                      <span style={{ 
                        color: '#1C1C1C', 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>Disponible →</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Button */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => router.push('/perfil')}
          className="transition-all duration-300"
          style={{
            backgroundColor: 'transparent',
            color: '#1C1C1C',
            border: '1.5px solid #1C1C1C',
            padding: '0.5rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.875rem',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1C1C1C';
            e.currentTarget.style.color = '#F4EFE8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#1C1C1C';
          }}
        >
          Mi Perfil
        </button>
      </div>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'transparent', 
        padding: '2rem 0', 
        borderTop: '1px solid #E5E5E5' 
      }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ 
            color: '#3D3D3D', 
            fontSize: '0.875rem', 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '300'
          }}>
            {plan === 'free' && '¿Necesitas más cálculos? '}
            <button 
              onClick={() => router.push('/')}
              style={{ 
                color: '#C5A770', 
                fontWeight: '500', 
                textDecoration: 'underline', 
                cursor: 'pointer' 
              }}
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
              <h2 className="text-xl md:text-2xl" style={{ 
                fontWeight: '700', 
                color: '#1C1C1C', 
                marginBottom: '1rem', 
                fontFamily: 'Playfair Display, serif' 
              }}>
                {selectedCalculadora ? 'Calculadora Premium' : 'Límite Alcanzado'}
              </h2>
              <p className="text-sm md:text-base" style={{ 
                color: '#3D3D3D', 
                marginBottom: '2rem', 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300'
              }}>
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
                    backgroundColor: 'transparent', 
                    color: '#1C1C1C', 
                    borderRadius: '25px', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    fontFamily: 'Inter, sans-serif',
                    border: '1.5px solid #1C1C1C',
                    cursor: 'pointer',
                    letterSpacing: '0.02em'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => router.push('/')}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#1C1C1C', 
                    color: '#F4EFE8', 
                    borderRadius: '25px', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    fontFamily: 'Inter, sans-serif',
                    border: '1.5px solid #1C1C1C',
                    cursor: 'pointer',
                    letterSpacing: '0.02em'
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = '#C5A770';
                    e.currentTarget.style.borderColor = '#C5A770';
                    e.currentTarget.style.color = '#1C1C1C';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = '#1C1C1C';
                    e.currentTarget.style.borderColor = '#1C1C1C';
                    e.currentTarget.style.color = '#F4EFE8';
                  }}
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