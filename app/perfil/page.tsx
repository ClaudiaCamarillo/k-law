'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PerfilPage() {
  const { user, error, isLoading } = useUser()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [userType, setUserType] = useState<string>('')

  useEffect(() => {
    // Obtener plan y tipo de usuario del localStorage
    const plan = localStorage.getItem('userPlan') || 'free'
    const tipo = localStorage.getItem('tipoUsuario') || ''
    setCurrentPlan(plan)
    setUserType(tipo)
  }, [])

  const handleUpgradeToPremium = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RlToNFmPABul6hgT2sCt5EC',
        }),
      })

      const data = await response.json()
      
      if (data.sessionId) {
        const stripe = await stripePromise
        if (stripe) {
          stripe.redirectToCheckout({ sessionId: data.sessionId })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la actualización. Por favor intenta de nuevo.')
    }
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-2xl" style={{ color: '#808080' }}>Cargando...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-2xl" style={{ color: '#808080' }}>{error.message}</div>

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #0f1f33 100%)' }}>
      {/* Header */}
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="text-4xl hover:opacity-70 transition-opacity"
          style={{ color: '#808080' }}
        >
          ‹
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          {/* Page Title */}
          <h1 className="font-bold text-6xl mb-8 text-center" style={{ color: '#808080' }}>Mi Perfil</h1>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6">
            <h2 className="text-4xl font-semibold mb-4" style={{ color: '#808080' }}>Información de la Cuenta</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-2xl" style={{ color: '#808080', opacity: 0.7 }}>Correo electrónico</p>
                <p className="text-3xl" style={{ color: '#808080' }}>{user?.email || 'No disponible'}</p>
              </div>

              <div>
                <p className="text-2xl" style={{ color: '#808080', opacity: 0.7 }}>Tipo de usuario</p>
                <p className="text-3xl capitalize" style={{ color: '#808080' }}>
                  {userType === 'litigante' ? '💼 Litigante' : userType === 'servidor' ? '🏛️ Servidor Público' : 'No seleccionado'}
                </p>
              </div>

              <div>
                <p className="text-2xl" style={{ color: '#808080', opacity: 0.7 }}>Plan actual</p>
                <p className="text-3xl" style={{ color: '#808080' }}>
                  {currentPlan === 'premium' ? '⭐ Premium' : '🆓 Gratuito'}
                </p>
              </div>
            </div>
          </div>

          {/* Plan Upgrade Card - Only show if user is on free plan */}
          {currentPlan === 'free' && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl p-8 mb-6 border-2 border-yellow-500/30">
              <h2 className="text-4xl font-semibold mb-4" style={{ color: '#808080' }}>Actualizar a Premium</h2>
              
              <ul className="text-2xl space-y-2 mb-6" style={{ color: '#808080' }}>
                <li>✓ Cálculos ilimitados</li>
                <li>✓ Todas las calculadoras especializadas</li>
                <li>✓ Historial completo de cálculos</li>
                <li>✓ Formatos de demandas y contratos</li>
                <li>✓ Recordatorios automáticos para litigantes</li>
              </ul>

              <div className="flex justify-center">
                <button
                  onClick={handleUpgradeToPremium}
                  className="w-1/4 py-48 text-4xl font-semibold rounded-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#D3D3D3', color: '#000000' }}
                >
                  Actualizar a Premium - $299 MXN/mes
                </button>
              </div>
            </div>
          )}

          {/* Premium Benefits - Only show if user is premium */}
          {currentPlan === 'premium' && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-8 mb-6 border-2 border-purple-500/30">
              <h2 className="text-4xl font-semibold mb-4" style={{ color: '#808080' }}>Beneficios Premium Activos</h2>
              
              <ul className="text-2xl space-y-2" style={{ color: '#808080' }}>
                <li>✓ Acceso completo a todas las funciones</li>
                <li>✓ Soporte prioritario</li>
                <li>✓ Actualizaciones automáticas</li>
                <li>✓ Sin límites de uso</li>
              </ul>

              <p className="text-xl mt-4" style={{ color: '#808080', opacity: 0.7 }}>
                Tu suscripción se renovará automáticamente. Puedes cancelar en cualquier momento.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-64" style={{ marginTop: '1.8rem' }}>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/calculadoras')}
                className="w-1/4 py-48 text-4xl font-medium rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D3D3D3', color: '#000000' }}
              >
                Ir a Calculadoras
              </button>
            </div>

            <div className="flex justify-center mb-32" style={{ marginTop: '2.13rem' }}>
              <button
                onClick={handleLogout}
                className="w-1/4 py-48 text-4xl font-medium rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D3D3D3', color: '#000000' }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}