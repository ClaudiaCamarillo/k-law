import { NextRequest, NextResponse } from 'next/server'
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  
  // Permitir acceso a la página de demo sin autenticación
  if (url.pathname === '/demo' || url.pathname === '/api/activate-demo') {
    return NextResponse.next()
  }
  
  // Verificar si tiene cookie de demo activa
  const demoMode = request.cookies.get('demo_mode')
  if (demoMode?.value === 'active') {
    // Verificar que la cookie no haya expirado manualmente
    return NextResponse.next()
  }
  
  // Si no es demo, usar Auth0 normal
  const authMiddleware = withMiddlewareAuthRequired()
  return authMiddleware(request)
}

export const config = {
  matcher: [
    '/calculadoras/:path*',
    '/seleccionar-usuario',
    '/api/analizar-ley',
    '/api/create-checkout-session',
    '/demo',
    '/api/activate-demo'
  ]
}
