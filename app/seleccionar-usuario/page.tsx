'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { loadStripe } from '@stripe/stripe-js'

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
    }
    
    // Verificar si viene de un pago exitoso
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true)
      localStorage.setItem('userPlan', 'premium')
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const handleSelectUser = (tipo: 'litigante' | 'servidor') => {
    setSelectedType(tipo)
    // Guardar en localStorage
    localStorage.setItem('tipoUsuario', tipo)
    // Pequeño delay para mostrar la selección antes de navegar
    setTimeout(() => {
      router.push('/calculadoras')
    }, 200)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
      
      {/* Success Message */}
      {showSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#C9A961', padding: '1.5rem', textAlign: 'center', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#0A1628"/>
            </svg>
            <span style={{ fontWeight: '600', fontSize: '1.125rem', color: '#0A1628', fontFamily: 'Inter, sans-serif' }}>¡Pago exitoso! Ahora eres usuario Premium</span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-shrink-0" style={{ backgroundColor: '#0A1628', padding: '1rem 0', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-sm md:text-base"
            style={{ color: '#C9A961', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            ← <span className="hidden sm:inline">Volver</span>
          </button>
          <div style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
            <span className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#C9A961', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}>K-LAW</span>
          </div>
          <div style={{ width: '80px' }}></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 overflow-y-auto">
        <div className="w-full max-w-5xl">
          {/* Header Text */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl" style={{ fontWeight: '700', marginBottom: '0.75rem', color: '#0A1628', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
              ¿Quién eres?
            </h1>
            <p className="text-base md:text-lg lg:text-xl" style={{ color: '#6b7280', fontSize: '1.125rem', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
              Personaliza tu experiencia según tu perfil profesional
            </p>
          </div>

          {/* User Type Cards */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-6 lg:gap-8">
            {/* Litigante Card */}
            <button
              onClick={() => handleSelectUser('litigante')}
              className="relative w-full md:max-w-[450px] transform transition-all duration-300 md:hover:scale-105"
              style={{ textAlign: 'left' }}
            >
              <div className="h-full" style={{ backgroundColor: selectedType === 'litigante' ? '#0A1628' : '#F5F5F5', borderRadius: '20px', padding: '2rem md:2.5rem lg:3rem', boxShadow: selectedType === 'litigante' ? '0 20px 60px rgba(10,22,40,0.3)' : '0 10px 40px rgba(0,0,0,0.06)', border: selectedType === 'litigante' ? '2px solid #C9A961' : '1px solid #e5e7eb', minHeight: '400px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                <div className="text-center mb-4 md:mb-6">
                  <div style={{ width: '70px', height: '70px', margin: '0 auto 1.5rem', backgroundColor: selectedType === 'litigante' ? '#C9A961' : '#0A1628', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M7 8V6a5 5 0 0110 0v2h3a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h3zm2 0h6V6a3 3 0 00-6 0v2zm-4 2v10h14V10H5zm7 2a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" fill={selectedType === 'litigante' ? '#0A1628' : '#FFFFFF'}/>
                    </svg>
                  </div>
                  <h2 className="text-xl md:text-2xl" style={{ fontWeight: '700', color: selectedType === 'litigante' ? '#C9A961' : '#0A1628', marginBottom: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>Litigante</h2>
                  <p className="text-sm md:text-base" style={{ color: selectedType === 'litigante' ? '#F5F5F5' : '#6b7280', fontFamily: 'Inter, sans-serif' }}>Abogado en práctica privada</p>
                </div>
                <ul className="flex-1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li className="py-3 md:py-4" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill={selectedType === 'litigante' ? '#C9A961' : '#16a34a'}/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: selectedType === 'litigante' ? '#FFFFFF' : '#374151', fontFamily: 'Inter, sans-serif' }}>Cálculos para tus casos</span>
                  </li>
                  <li className="py-3 md:py-4" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill={selectedType === 'litigante' ? '#C9A961' : '#16a34a'}/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: selectedType === 'litigante' ? '#FFFFFF' : '#374151', fontFamily: 'Inter, sans-serif' }}>Notificaciones de vencimientos</span>
                  </li>
                  <li className="py-3 md:py-4" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill={selectedType === 'litigante' ? '#C9A961' : '#16a34a'}/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: selectedType === 'litigante' ? '#FFFFFF' : '#374151', fontFamily: 'Inter, sans-serif' }}>Formatos de demandas y contratos</span>
                  </li>
                </ul>
              </div>
            </button>

            {/* Servidor Público Card */}
            <button
              onClick={() => handleSelectUser('servidor')}
              className="relative w-full md:max-w-[450px] transform transition-all duration-300 md:hover:scale-105"
              style={{ textAlign: 'left' }}
            >
              <div className="h-full" style={{ backgroundColor: selectedType === 'servidor' ? '#0A1628' : '#F5F5F5', borderRadius: '20px', padding: '2rem md:2.5rem lg:3rem', boxShadow: selectedType === 'servidor' ? '0 20px 60px rgba(10,22,40,0.3)' : '0 10px 40px rgba(0,0,0,0.06)', border: selectedType === 'servidor' ? '2px solid #C9A961' : '1px solid #e5e7eb', minHeight: '400px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                <div className="text-center mb-4 md:mb-6">
                  <div style={{ width: '70px', height: '70px', margin: '0 auto 1.5rem', backgroundColor: selectedType === 'servidor' ? '#C9A961' : '#0A1628', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v9.82c0 4.28-2.88 8.3-7 9.63V11h-2v8.63c-4.12-1.33-7-5.35-7-9.63V8.18l8-4z" fill={selectedType === 'servidor' ? '#0A1628' : '#FFFFFF'}/>
                    </svg>
                  </div>
                  <h2 className="text-xl md:text-2xl" style={{ fontWeight: '700', color: selectedType === 'servidor' ? '#C9A961' : '#0A1628', marginBottom: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>Servidor Público</h2>
                  <p className="text-sm md:text-base" style={{ color: selectedType === 'servidor' ? '#F5F5F5' : '#6b7280', fontFamily: 'Inter, sans-serif' }}>Funcionario judicial</p>
                </div>
                <ul className="flex-1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li className="py-3 md:py-4" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill={selectedType === 'servidor' ? '#C9A961' : '#16a34a'}/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: selectedType === 'servidor' ? '#FFFFFF' : '#374151', fontFamily: 'Inter, sans-serif' }}>Texto para resolución</span>
                  </li>
                  <li className="py-3 md:py-4" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill={selectedType === 'servidor' ? '#C9A961' : '#16a34a'}/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: selectedType === 'servidor' ? '#FFFFFF' : '#374151', fontFamily: 'Inter, sans-serif' }}>Calendarios con identificadores</span>
                  </li>
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