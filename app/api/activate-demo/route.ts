import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  
  if (code === 'PRUEBA2024') {
    const response = NextResponse.json({ success: true })
    
    // Crear cookie de demo por 7 días
    response.cookies.set('demo_mode', 'active', {
      maxAge: 60 * 60 * 24 * 7, // 7 días
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    })
    
    return response
  }
  
  return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
}
