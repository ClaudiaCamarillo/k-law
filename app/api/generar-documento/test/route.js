import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'El endpoint está funcionando',
    timestamp: new Date().toISOString()
  })
}

export async function POST(req) {
  try {
    const body = await req.json()
    return NextResponse.json({ 
      message: 'POST recibido correctamente',
      datos: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error en el test',
      message: error.message
    }, { status: 500 })
  }
}