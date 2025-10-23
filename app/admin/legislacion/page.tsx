'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { obtenerLeyesDeStorage, limpiarStorage } from '@/legislacion/storage'

export default function AdminLegislacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [leyesFederales, setLeyesFederales] = useState(obtenerLeyesDeStorage())

  useEffect(() => {
    // Verificación simple de admin
    const adminParam = searchParams.get('admin')
    if (adminParam !== 'true') {
      router.push('/')
    } else {
      setIsAuthorized(true)
    }
  }, [searchParams, router])

  const handleLimpiarDatos = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos guardados?')) {
      limpiarStorage()
      setLeyesFederales(obtenerLeyesDeStorage())
      alert('Datos limpiados correctamente')
    }
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/legislacion')}
              className="mb-6 text-sm transition-colors duration-300"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#3D3D3D',
                fontWeight: '400'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C5A770'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3D3D3D'}
            >
              ← Volver a legislación
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl mb-2" style={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: '700',
                  color: '#1C1C1C',
                  letterSpacing: '-0.01em'
                }}>
                  Administración de Legislación
                </h1>
                <p className="text-base" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3D3D3D',
                  fontWeight: '300'
                }}>
                  Gestiona el contenido de las leyes federales
                </p>
              </div>
              
              <button
                onClick={handleLimpiarDatos}
                className="px-4 py-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: '#FF5722',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E64A19'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF5722'
                }}
              >
                Limpiar datos
              </button>
            </div>
          </div>

          {/* Lista de leyes */}
          <div className="space-y-4">
            {leyesFederales.map(ley => {
              const tieneContenido = ley.articulos.length > 0
              
              return (
                <div
                  key={ley.id}
                  className="bg-white rounded-xl p-6 flex items-center justify-between"
                  style={{
                    border: '1px solid #E5E5E5'
                  }}
                >
                  <div className="flex-1">
                    <h3 className="text-lg mb-1" style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: '600',
                      color: '#1C1C1C'
                    }}>
                      {ley.nombre}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: '#F4EFE8',
                          color: '#3D3D3D',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}
                      >
                        {ley.categoria}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: tieneContenido ? '#4CAF50' : '#FF5722',
                          fontWeight: '500'
                        }}
                      >
                        {tieneContenido ? `${ley.articulos.length} artículos` : 'Sin contenido'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/legislacion/${ley.id}?admin=true`}
                    className="px-6 py-2 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #C5A770',
                      color: '#C5A770',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      fontSize: '14px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#C5A770'
                      e.currentTarget.style.color = '#FFFFFF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#C5A770'
                    }}
                  >
                    Editar
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}