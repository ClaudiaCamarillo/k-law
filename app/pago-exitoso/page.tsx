'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PagoExitoso() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Marcar como usuario premium
    localStorage.setItem('userPlan', 'premium')
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/seleccionar-usuario?from=pago-exitoso')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
      
      {/* Navigation */}
      <nav className="flex-shrink-0" style={{ backgroundColor: '#0A1628', padding: '1rem 0', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#C9A961', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}>K-LAW</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          {/* Success Icon Container */}
          <div style={{ 
            width: '120px', 
            height: '120px', 
            margin: '0 auto 2rem', 
            backgroundColor: '#C9A961', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(201, 169, 97, 0.3)',
            position: 'relative'
          }}>
            {/* Animated Ring */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              border: '3px solid #C9A961',
              borderRadius: '50%',
              opacity: 0.3,
              animation: 'pulse 2s infinite'
            }} />
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#0A1628" strokeWidth="2"/>
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4" style={{ 
            fontWeight: '700', 
            color: '#0A1628', 
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.02em'
          }}>
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-lg md:text-xl mb-8" style={{ 
            color: '#6b7280', 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            lineHeight: '1.6'
          }}>
            Bienvenido a <span style={{ color: '#C9A961', fontWeight: '600' }}>K-LAW Premium</span>.
            <br className="hidden md:block" />
            Ahora tienes acceso ilimitado a todas las funciones.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#C9A961"/>
              </svg>
              <span className="text-sm" style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>Cálculos ilimitados</span>
            </div>
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#C9A961"/>
              </svg>
              <span className="text-sm" style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>Todas las calculadoras</span>
            </div>
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#C9A961"/>
              </svg>
              <span className="text-sm" style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>Histórico completo</span>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ 
            backgroundColor: '#F5F5F5', 
            borderRadius: '12px', 
            padding: '1rem 2rem',
            display: 'inline-block'
          }}>
            <p className="text-sm" style={{ 
              color: '#6b7280', 
              fontFamily: 'Inter, sans-serif' 
            }}>
              Redirigiendo en <span style={{ 
                fontWeight: '600', 
                color: '#0A1628',
                fontSize: '1.125rem'
              }}>{countdown}</span> segundos...
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}