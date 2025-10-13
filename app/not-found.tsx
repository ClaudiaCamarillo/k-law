import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold mb-4" style={{ 
          color: '#C5A770',
          fontFamily: 'Playfair Display, serif'
        }}>
          404
        </h1>
        <h2 className="text-2xl font-bold mb-4" style={{ 
          color: '#1C1C1C',
          fontFamily: 'Playfair Display, serif'
        }}>
          Página no encontrada
        </h2>
        <p className="mb-8" style={{ 
          color: '#3D3D3D',
          fontFamily: 'Inter, sans-serif'
        }}>
          La página que buscas no existe
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full"
          style={{ 
            backgroundColor: 'transparent',
            border: '1.5px solid #1C1C1C',
            color: '#1C1C1C',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            textDecoration: 'none'
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}