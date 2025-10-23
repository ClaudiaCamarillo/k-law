'use client'

import { useRouter } from 'next/navigation'
// import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

// Inicializar Stripe - no es necesario aquí
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Home() {
  const router = useRouter()

  const seleccionarPlan = async (plan: 'free' | 'premium') => {
    try {
      // Guardar el plan seleccionado (solo en el cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPlan', plan)
      }
      
      // TEMPORALMENTE DESACTIVADO: Redirigir a Auth0 para registro/login
      // window.location.href = `/api/auth/login?returnTo=/seleccionar-usuario?plan=${plan}`
      
      // ACCESO DIRECTO TEMPORAL para validación
      router.push('/calculadoras')
    } catch (error) {
      console.error('Error al seleccionar plan:', error)
      // Redirigir directamente si hay error
      router.push('/calculadoras')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      {/* Golden Strip */}
      <div style={{ 
        backgroundColor: '#C5A770', 
        height: '80px',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1
      }} className="md:h-[120px]" />
      
      {/* Elegant Header */}
      <div className="relative py-2 md:py-8 px-4" style={{ zIndex: 2 }}>
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
        
        <div className="relative text-center px-2 md:px-6" style={{ paddingTop: '10px', zIndex: 10, position: 'relative' }}>
          <div className="mb-2" style={{ marginTop: '-20px' }}>
            <img 
              src="/LOGO-KLAW.gif" 
              alt="K-LAW Logo" 
              className="mx-auto w-auto h-auto max-w-[160px] max-h-[60px] sm:max-w-[200px] sm:max-h-[80px] md:max-w-[400px] md:max-h-[150px] lg:max-w-[640px] lg:max-h-[240px]"
              style={{ 
                display: 'block',
                position: 'relative',
                zIndex: 20
              }}
            />
          </div>
          <p className="text-sm md:text-base" style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Soluciones Jurídicas Inteligentes
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-4">
        <div className="w-full max-w-5xl">
          {/* Tienda Button */}
          <div className="text-center mb-6">
            <button
              onClick={() => router.push('/tienda')}
              className="px-6 py-2 transition-all duration-300"
              style={{
                backgroundColor: 'transparent',
                color: '#1C1C1C',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                border: '1.5px solid #1C1C1C',
                letterSpacing: '0.02em',
                borderRadius: '30px',
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
              🛍️ Ir a la Tienda
            </button>
          </div>
          {/* Section Title */}
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-2" style={{ 
              fontFamily: 'Playfair Display, serif',
              fontWeight: '700',
              color: '#1C1C1C',
              letterSpacing: '-0.01em'
            }}>
              Selecciona tu Plan
            </h2>
            <p className="text-base md:text-lg" style={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '300'
            }}>
              Elige la opción que mejor se adapte a tus necesidades
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="group">
              <div className="h-full flex flex-col p-5 md:p-6 transition-all duration-300" 
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E5E5E5',
                  boxShadow: '0 4px 20px rgba(28, 28, 28, 0.05)'
                }}>
                <div className="flex-1">
                  <div className="mb-3">
                    <h3 className="text-lg md:text-xl mb-1" style={{ 
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: '700',
                      color: '#1C1C1C'
                    }}>
                      Plan Gratuito
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl md:text-3xl" style={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: '700',
                        color: '#1C1C1C'
                      }}>$0</span>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#3D3D3D',
                        fontWeight: '300'
                      }}>MXN</span>
                    </div>
                    <p className="text-sm" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: '#3D3D3D',
                      fontWeight: '300',
                      lineHeight: '1.6'
                    }}>
                      Ideal para comenzar a explorar nuestras herramientas
                    </p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>3 cálculos diarios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>Calculadoras básicas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M8 8L12 12M12 8L8 12" stroke="#3D3D3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#3D3D3D',
                        fontWeight: '300'
                      }}>Sin historial</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    console.log('Botón Gratis clickeado')
                    seleccionarPlan('free')
                  }}
                  className="w-full py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: '1.5px solid #1C1C1C',
                    color: '#1C1C1C',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    fontSize: '15px',
                    letterSpacing: '0.02em'
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
                  Comenzar Gratis
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="group relative">
              <div className="absolute top-2 right-4 z-10">
                <span className="px-4 py-1.5 text-xs rounded-full" style={{ 
                  backgroundColor: '#C5A770',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Recomendado
                </span>
              </div>
              <div className="h-full flex flex-col p-5 md:p-6 transition-all duration-300" 
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '2px solid #C5A770',
                  boxShadow: '0 8px 30px rgba(197, 167, 112, 0.15)'
                }}>
                <div className="flex-1">
                  <div className="mb-3">
                    <h3 className="text-lg md:text-xl mb-1" style={{ 
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: '700',
                      color: '#1C1C1C'
                    }}>
                      Plan Premium
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl md:text-3xl" style={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: '700',
                        color: '#1C1C1C'
                      }}>$299</span>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#3D3D3D',
                        fontWeight: '300'
                      }}>MXN/mes</span>
                    </div>
                    <p className="text-sm" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: '#3D3D3D',
                      fontWeight: '300',
                      lineHeight: '1.6'
                    }}>
                      Acceso completo a todas las funcionalidades
                    </p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#C5A770" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>Cálculos ilimitados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#C5A770" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>Todas las calculadoras</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#C5A770" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>Historial completo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="10" cy="10" r="10" fill="#F4EFE8"/>
                        <path d="M14 7L8.5 12.5L6 10" stroke="#C5A770" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs md:text-sm" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C',
                        fontWeight: '400'
                      }}>Acceso a formatos</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    console.log('Botón Premium clickeado')
                    seleccionarPlan('premium')
                  }}
                  className="w-full py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  style={{ 
                    backgroundColor: '#C5A770',
                    border: '1.5px solid #C5A770',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: '15px',
                    letterSpacing: '0.02em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B39760';
                    e.currentTarget.style.borderColor = '#B39760';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#C5A770';
                    e.currentTarget.style.borderColor = '#C5A770';
                  }}
                >
                  Comenzar Premium
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center mt-16">
            <p className="text-sm" style={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '300'
            }}>
              Cancela cuando quieras • Precios en MXN incluyen IVA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}