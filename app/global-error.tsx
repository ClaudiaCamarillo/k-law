'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'sans-serif' }}>
              Error de aplicación
            </h2>
            <p className="mb-4" style={{ color: '#3D3D3D', fontFamily: 'sans-serif' }}>
              Ha ocurrido un error inesperado
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-full"
              style={{ 
                backgroundColor: '#C5A770',
                color: '#FFFFFF',
                fontFamily: 'sans-serif',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}