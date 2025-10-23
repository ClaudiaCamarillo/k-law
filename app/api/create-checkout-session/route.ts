import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json()

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/seleccionar-usuario?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      // Configuración para México
      locale: 'es-419',
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Error creando sesión de Stripe:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Error al crear la sesión de pago',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
