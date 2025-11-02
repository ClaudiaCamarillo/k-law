'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function SeleccionarUsuarioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Verificar el plan del usuario
    const plan = searchParams.get('plan')
    if (plan) {
      localStorage.setItem('userPlan', plan)
      
      // TEMPORALMENTE DESHABILITADO - Activar premium sin pago para fase de validación
      if (plan === 'premium') {
        // Activar premium directamente sin pago
        localStorage.setItem('userPlan', 'premium')
        setShowSuccess(true)
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => setShowSuccess(false), 5000)
        return
      }
      
      /* CÓDIGO STRIPE TEMPORALMENTE DESHABILITADO
      // Si es premium, redirigir a Stripe checkout
      if (plan === 'premium') {
        // Crear sesión de checkout
        fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: 'price_1RlToNFmPABul6hgT2sCt5EC',
          }),
        })
        .then(res => res.json())
        .then(async data => {
          if (data.sessionId) {
            // Redirigir a Stripe
            const stripe = await stripePromise
            if (stripe) {
              stripe.redirectToCheckout({ sessionId: data.sessionId })
            }
          }
        })
        .catch(err => {
          console.error('Error:', err)
          alert('Error al procesar el pago. Por favor intenta de nuevo.')
        })
        return
      }
      */
    }
    
    // Verificar si viene de un pago exitoso
    if (searchParams.get('payment') === 'success' || searchParams.get('from') === 'pago-exitoso') {
      setShowSuccess(true)
      localStorage.setItem('userPlan', 'premium')
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const handleSelectUser = (tipo: 'litigante' | 'servidor') => {
    try {
      console.log('=== INICIO handleSelectUser ===')
      console.log('Usuario seleccionado:', tipo)
      console.log('Plan actual:', localStorage.getItem('userPlan'))
      
      setSelectedType(tipo)
      
      // Guardar en localStorage
      localStorage.setItem('tipoUsuario', tipo)
      console.log('Tipo de usuario guardado:', localStorage.getItem('tipoUsuario'))
      
      // Navegar directamente sin delay para probar
      console.log('Intentando navegar a /calculadoras...')
      
      // Intentar múltiples métodos de navegación
      try {
        router.push('/calculadoras')
      } catch (routerError) {
        console.error('Error con router.push:', routerError)
        // Fallback: usar window.location
        window.location.href = '/calculadoras'
      }
      
      console.log('=== FIN handleSelectUser ===')
    } catch (error) {
      console.error('Error en handleSelectUser:', error)
      alert('Error al seleccionar usuario: ' + error)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      {/* Success Message */}
      {showSuccess && (
        <div style={{ 
          position: 'fixed', 
          top: '140px', 
          left: 0, 
          right: 0, 
          backgroundColor: 'transparent', 
          padding: '1.5rem', 
          textAlign: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem', 
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#C5A770"/>
            </svg>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '1.125rem', 
              color: '#C5A770', 
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>¡Pago exitoso! Ahora eres usuario Premium</span>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={handleBack}
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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
          ← Volver
        </button>
      </div>

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
          <div className="mb-4" style={{ position: 'relative', zIndex: 10, marginTop: '-82px' }}>
            <img 
              src="/LOGO-KLAW.gif" 
              alt="K-LAW Logo" 
              className="mx-auto"
              style={{ 
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '599px',
                maxHeight: '240px',
                position: 'relative',
                zIndex: 10
              }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontWeight: '800',
            color: '#1C1C1C',
            letterSpacing: '-0.02em'
          }}>
            ¿Quién eres?
          </h1>
          <p className="text-sm md:text-base" style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Personaliza tu experiencia según tu perfil profesional
          </p>
        </div>
      </div>

      {/* Botón de prueba */}
      <div style={{ position: 'fixed', top: '200px', right: '20px', zIndex: 9999 }}>
        <button 
          onClick={() => {
            console.log('BOTÓN DE PRUEBA CLICKEADO')
            alert('Botón de prueba funcionando!')
            localStorage.setItem('tipoUsuario', 'servidor')
            localStorage.setItem('userPlan', 'premium')
            window.location.href = '/calculadoras'
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#C5A770',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          BYPASS: Ir como Servidor Premium
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8" style={{ position: 'relative', zIndex: 5 }}>
        <div className="w-full max-w-4xl">
          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 justify-center">
            {/* Litigante Card */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Click en botón litigante')
                handleSelectUser('litigante')
              }}
              className="group transition-all duration-300 transform hover:scale-[1.02]"
              type="button"
            >
              <div 
                className="h-full p-6 md:p-8 transition-all duration-300"
                style={{ 
                  backgroundColor: selectedType === 'litigante' ? '#1C1C1C' : 'transparent',
                  border: '2px solid #C5A770',
                  borderRadius: '30px',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
              >
                <div className="text-center mb-6">
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    margin: '0 auto 1.5rem', 
                    backgroundColor: selectedType === 'litigante' ? '#C5A770' : '#1C1C1C', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M7 8V6a5 5 0 0110 0v2h3a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h3zm2 0h6V6a3 3 0 00-6 0v2zm-4 2v10h14V10H5zm7 2a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" 
                        fill={selectedType === 'litigante' ? '#1C1C1C' : '#F4EFE8'}/>
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl mb-2" style={{ 
                    fontWeight: '700', 
                    color: selectedType === 'litigante' ? '#C5A770' : '#1C1C1C', 
                    fontFamily: 'Playfair Display, serif' 
                  }}>
                    Litigante
                  </h2>
                  <p className="text-sm md:text-base" style={{ 
                    color: selectedType === 'litigante' ? '#F4EFE8' : '#3D3D3D', 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '300'
                  }}>
                    Abogado en práctica privada
                  </p>
                </div>
                <ul className="flex-1 space-y-4" style={{ textAlign: 'left' }}>
                  {['Cálculos para tus casos', 'Notificaciones de vencimientos', 'Formatos de demandas y contratos'].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill={selectedType === 'litigante' ? '#C5A770' : '#F4EFE8'}/>
                        <path d="M14 7L8.5 12.5L6 10" stroke={selectedType === 'litigante' ? '#1C1C1C' : '#1C1C1C'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm" style={{ 
                        color: selectedType === 'litigante' ? '#F4EFE8' : '#1C1C1C', 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '400'
                      }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>

            {/* Servidor Público Card */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Click en botón servidor público')
                handleSelectUser('servidor')
              }}
              className="group transition-all duration-300 transform hover:scale-[1.02]"
              type="button"
            >
              <div 
                className="h-full p-6 md:p-8 transition-all duration-300"
                style={{ 
                  backgroundColor: selectedType === 'servidor' ? '#1C1C1C' : 'transparent',
                  border: '2px solid #C5A770',
                  borderRadius: '30px',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
              >
                <div className="text-center mb-6">
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    margin: '0 auto 1.5rem', 
                    backgroundColor: selectedType === 'servidor' ? '#C5A770' : '#1C1C1C', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v9.82c0 4.28-2.88 8.3-7 9.63V11h-2v8.63c-4.12-1.33-7-5.35-7-9.63V8.18l8-4z" 
                        fill={selectedType === 'servidor' ? '#1C1C1C' : '#F4EFE8'}/>
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl mb-2" style={{ 
                    fontWeight: '700', 
                    color: selectedType === 'servidor' ? '#C5A770' : '#1C1C1C', 
                    fontFamily: 'Playfair Display, serif' 
                  }}>
                    Servidor Público
                  </h2>
                  <p className="text-sm md:text-base" style={{ 
                    color: selectedType === 'servidor' ? '#F4EFE8' : '#3D3D3D', 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '300'
                  }}>
                    Funcionario judicial
                  </p>
                </div>
                <ul className="flex-1 space-y-4" style={{ textAlign: 'left' }}>
                  {['Texto para resolución', 'Calendarios con identificadores'].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill={selectedType === 'servidor' ? '#C5A770' : '#F4EFE8'}/>
                        <path d="M14 7L8.5 12.5L6 10" stroke={selectedType === 'servidor' ? '#1C1C1C' : '#1C1C1C'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm" style={{ 
                        color: selectedType === 'servidor' ? '#F4EFE8' : '#1C1C1C', 
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '400'
                      }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SeleccionarUsuarioPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SeleccionarUsuarioContent />
    </Suspense>
  )
}