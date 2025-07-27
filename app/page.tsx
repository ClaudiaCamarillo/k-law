'use client'

import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Home() {
  const router = useRouter()

  const seleccionarPlan = async (plan: 'free' | 'premium') => {
    // Guardar el plan seleccionado
    localStorage.setItem('userPlan', plan)
    
    // Redirigir a Auth0 para registro/login
    // Ambos planes (free y premium) requieren autenticación
    window.location.href = `/api/auth/login?returnTo=/seleccionar-usuario?plan=${plan}`
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
      
      {/* Hero Section */}
      <div className="flex-shrink-0" style={{ 
        background: 'linear-gradient(135deg, #1A1A2E 0%, #0f1f33 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative z-10 py-6 md:py-8 text-center">
          <h1 className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#c9a961', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>K-LAW</h1>
          <p className="text-white text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
            Soluciones Jurídicas Inteligentes
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-3 md:mb-4 flex-shrink-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl" style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#111827', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
              Elige tu Plan
            </h1>
            <p className="text-xs md:text-sm lg:text-base" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
              Comienza gratis o desbloquea todo el potencial
            </p>
          </div>

          {/* Plans Container */}
          <div className="flex-1 flex flex-col md:flex-row justify-center items-stretch gap-3 md:gap-4 overflow-y-auto">
            {/* Free Plan Card */}
            <div className="relative w-full md:max-w-[350px] md:hover:scale-105 transition-all duration-300">
              <div className="h-full flex flex-col" style={{ backgroundColor: '#f9fafb', borderRadius: '16px', padding: '1.25rem md:1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                <div className="text-center flex-shrink-0">
                  <h2 className="text-lg md:text-xl" style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem', fontFamily: 'Montserrat, sans-serif' }}>Free</h2>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#111827', fontFamily: 'Montserrat, sans-serif' }}>$0</span>
                    <span className="text-xs md:text-sm" style={{ color: '#666', marginLeft: '0.25rem', fontFamily: 'Inter, sans-serif' }}>MXN</span>
                  </div>
                  <p className="text-xs md:text-sm" style={{ color: '#666', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Perfecto para comenzar</p>
                </div>
                
                <ul className="flex-1 min-h-0" style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0' }}>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#16a34a"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#333333', fontFamily: 'Inter, sans-serif' }}>3 cálculos por día</span>
                  </li>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#16a34a"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#333333', fontFamily: 'Inter, sans-serif' }}>Calculadoras básicas</span>
                  </li>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 11h-4v4H9v-4H5V9h4V5h2v4h4v2z" fill="#ef4444" transform="rotate(45 10 10)"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>Sin guardar histórico</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => seleccionarPlan('free')}
                  className="w-full text-xs md:text-sm flex-shrink-0"
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#ffffff', color: '#1A1A2E', borderRadius: '10px', fontWeight: '600', fontFamily: 'Inter, sans-serif', border: '2px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#1A1A2E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  Comenzar Gratis
                </button>
              </div>
            </div>

            {/* Premium Plan Card */}
            <div className="relative w-full md:max-w-[350px] md:hover:scale-105 transition-all duration-300">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs" style={{ backgroundColor: '#c9a961', color: '#1A1A2E', padding: '0.2rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}>
                MÁS POPULAR
              </div>
              <div className="h-full flex flex-col" style={{ backgroundColor: '#1A1A2E', borderRadius: '16px', padding: '1.25rem md:1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '2px solid #c9a961' }}>
                <div className="text-center flex-shrink-0">
                  <h2 className="text-lg md:text-xl" style={{ fontWeight: '700', color: '#c9a961', marginBottom: '0.25rem', fontFamily: 'Montserrat, sans-serif' }}>Premium</h2>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#ffffff', fontFamily: 'Montserrat, sans-serif' }}>$299</span>
                    <span className="text-xs md:text-sm" style={{ color: '#c9a961', marginLeft: '0.25rem', fontFamily: 'Inter, sans-serif' }}>MXN/mes</span>
                  </div>
                  <p className="text-xs md:text-sm" style={{ color: '#ffffff', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>Todo el poder de K-LAW</p>
                </div>
                
                <ul className="flex-1 min-h-0" style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0' }}>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#c9a961"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>Cálculos ilimitados</span>
                  </li>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#c9a961"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>Todas las calculadoras</span>
                  </li>
                  <li className="py-1.5 md:py-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#c9a961"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>Histórico completo</span>
                  </li>
                  <li className="py-1.5 md:py-2 hidden sm:flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#c9a961"/>
                    </svg>
                    <span className="text-xs md:text-sm" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>Formatos de demanda</span>
                  </li>
                </ul>
                <button
                  onClick={() => seleccionarPlan('premium')}
                  className="w-full text-xs md:text-sm flex-shrink-0"
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#c9a961', color: '#1A1A2E', borderRadius: '10px', fontWeight: '700', fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8975a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c9a961'; }}
                >
                  Comenzar Prueba
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-2 md:mt-3 flex-shrink-0">
            <p className="text-xs" style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>
              Cancela cuando quieras • Precios incluyen IVA
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}