'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { obtenerLeyPorId } from '@/legislacion/storage'
import { useState, useEffect } from 'react'

export default function LeyDetallePage() {
  const router = useRouter()
  const params = useParams()
  const leyId = params.leyId as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar la ley por ID desde localStorage
  const ley = obtenerLeyPorId(leyId)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
        <div className="text-center">
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D'
          }}>
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  if (!ley) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
        <div className="text-center">
          <h1 className="text-2xl mb-4" style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            color: '#1C1C1C'
          }}>
            Ley no encontrada
          </h1>
          <button
            onClick={() => router.push('/legislacion')}
            className="px-6 py-2 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              color: '#1C1C1C',
              border: '1.5px solid #1C1C1C',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1C1C1C';
              e.currentTarget.style.color = '#F4EFE8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1C1C1C';
            }}
          >
            Volver a legislación
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Contenido principal */}
      <div className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Botón regresar */}
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
            ← Regresar a legislación
          </button>

          {/* Tarjeta principal con borde negro */}
          <div className="bg-white rounded-2xl p-8 md:p-12" style={{
            border: '2px solid #1C1C1C'
          }}>
            {/* Nombre de la ley como título principal */}
            <h1 className="text-3xl md:text-4xl mb-4" style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: '700',
              color: '#1C1C1C',
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}>
              {ley.nombre}
            </h1>

            {/* Fecha de última reforma */}
            <p className="text-base mb-8" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '400'
            }}>
              Fecha de última reforma: {
                mounted && typeof ley.fechaUltimaReforma === 'string' 
                  ? ley.fechaUltimaReforma 
                  : "Sin fecha"
              }
            </p>

            {/* Separador */}
            <div className="border-t border-gray-300 my-8"></div>

            {/* Contenido de artículos o mensaje temporal */}
            {ley.articulos.length > 0 ? (
              <div className="py-8">
                <h2 className="text-2xl mb-6" style={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: '600',
                  color: '#1C1C1C'
                }}>
                  Artículos ({ley.articulos.length})
                </h2>
                
                {/* Separar artículos normales y transitorios */}
                {(() => {
                  const articulosNormales = ley.articulos.filter(a => !a.esTransitorio)
                  const articulosTransitorios = ley.articulos.filter(a => a.esTransitorio)
                  
                  return (
                    <>
                      {/* Artículos normales */}
                      <div className="space-y-6">
                        {articulosNormales.map((articulo, index) => (
                          <div key={`normal-${index}`} className="pb-6 border-b border-gray-200 last:border-0">
                            <div className="mb-2">
                              <h3 className="text-lg font-semibold" style={{
                                fontFamily: 'Inter, sans-serif',
                                color: '#1C1C1C'
                              }}>
                                Artículo {articulo.numero}
                              </h3>
                              {articulo.tituloCapitulo && (
                                <p className="text-sm mt-1" style={{
                                  fontFamily: 'Inter, sans-serif',
                                  color: '#C5A770',
                                  fontWeight: '500'
                                }}>
                                  {articulo.tituloCapitulo}
                                </p>
                              )}
                            </div>
                            <div className="text-base" style={{
                              fontFamily: 'Inter, sans-serif',
                              color: '#3D3D3D',
                              fontWeight: '300',
                              whiteSpace: 'pre-line',
                              textAlign: 'justify',
                              lineHeight: '1.8'
                            }}>
                              {articulo.texto}
                            </div>
                            {articulo.notasReforma && articulo.notasReforma.length > 0 && (
                              <div style={{
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px dashed #E5E5E5'
                              }}>
                                {articulo.notasReforma.map((nota, idx) => (
                                  <div key={idx} style={{
                                    textAlign: 'right',
                                    fontStyle: 'italic',
                                    fontSize: '0.875rem',
                                    color: '#666',
                                    marginTop: idx > 0 ? '4px' : '0',
                                    fontFamily: 'Inter, sans-serif'
                                  }}>
                                    {nota}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Sección de Transitorios */}
                      {articulosTransitorios.length > 0 && (
                        <>
                          <div className="mt-12 mb-8 p-4 rounded-lg" style={{
                            backgroundColor: '#F4EFE8',
                            border: '2px solid #C5A770'
                          }}>
                            <h2 className="text-xl text-center" style={{
                              fontFamily: 'Playfair Display, serif',
                              fontWeight: '700',
                              color: '#C5A770',
                              letterSpacing: '0.05em'
                            }}>
                              ARTÍCULOS TRANSITORIOS
                            </h2>
                          </div>
                          
                          <div className="space-y-6">
                            {articulosTransitorios.map((articulo, index) => (
                              <div key={`trans-${index}`} className="pb-6 border-b border-gray-200 last:border-0">
                                <div className="mb-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold" style={{
                                      fontFamily: 'Inter, sans-serif',
                                      color: '#1C1C1C'
                                    }}>
                                      Artículo {articulo.numero} Transitorio
                                    </h3>
                                    <span className="px-2 py-1 rounded-full text-xs" style={{
                                      backgroundColor: '#C5A770',
                                      color: '#FFFFFF',
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: '600'
                                    }}>
                                      TRANSITORIO
                                    </span>
                                  </div>
                                </div>
                                <div className="text-base" style={{
                                  fontFamily: 'Inter, sans-serif',
                                  color: '#3D3D3D',
                                  fontWeight: '300',
                                  whiteSpace: 'pre-line',
                                  textAlign: 'justify',
                                  lineHeight: '1.8'
                                }}>
                                  {articulo.texto}
                                </div>
                                {articulo.notasReforma && articulo.notasReforma.length > 0 && (
                                  <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px dashed #E5E5E5'
                                  }}>
                                    {articulo.notasReforma.map((nota, idx) => (
                                      <div key={idx} style={{
                                        textAlign: 'right',
                                        fontStyle: 'italic',
                                        fontSize: '0.875rem',
                                        color: '#666',
                                        marginTop: idx > 0 ? '4px' : '0',
                                        fontFamily: 'Inter, sans-serif'
                                      }}>
                                        {nota}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="py-12">
                <p className="text-lg text-center" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3D3D3D',
                  fontWeight: '300'
                }}>
                  Los artículos de esta ley se cargarán próximamente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}