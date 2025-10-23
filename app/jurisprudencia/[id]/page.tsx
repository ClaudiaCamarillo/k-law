'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sjfClient } from '@/lib/sjf/api-client'
import { Tesis, ErrorSJF } from '@/lib/sjf/types'
import { 
  copiarAlPortapapeles,
  obtenerIconoMateria,
  formatearFecha,
  generarUrlCompartir
} from '@/lib/sjf/utils'

interface Props {
  params: { id: string }
}

export default function DetalleTesisPage({ params }: Props) {
  const router = useRouter()
  const [tesis, setTesis] = useState<Tesis | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [copiadoExitoso, setCopiadoExitoso] = useState(false)

  useEffect(() => {
    // Cargar favoritos del localStorage
    const favoritosGuardados = localStorage.getItem('k-law-favoritos-jurisprudencia')
    if (favoritosGuardados) {
      setFavoritos(new Set(JSON.parse(favoritosGuardados)))
    }

    cargarTesis()
  }, [params.id])

  const cargarTesis = async () => {
    try {
      setCargando(true)
      setError(null)
      const tesisData = await sjfClient.obtener_tesis_por_id(params.id)
      setTesis(tesisData)
    } catch (err) {
      const errorSJF = err as ErrorSJF
      setError(errorSJF.mensaje || 'Error al cargar la tesis')
    } finally {
      setCargando(false)
    }
  }

  const toggleFavorito = () => {
    if (!tesis) return
    
    const nuevosFavoritos = new Set(favoritos)
    if (nuevosFavoritos.has(tesis.id)) {
      nuevosFavoritos.delete(tesis.id)
    } else {
      nuevosFavoritos.add(tesis.id)
    }
    setFavoritos(nuevosFavoritos)
    localStorage.setItem('k-law-favoritos-jurisprudencia', JSON.stringify([...nuevosFavoritos]))
  }

  const copiarTesis = async () => {
    if (!tesis) return
    
    const texto = `${tesis.rubro}\n\n${tesis.texto}\n\nFuente: ${tesis.fuente}\nRegistro: ${tesis.registro_digital}`
    const exito = await copiarAlPortapapeles(texto)
    
    if (exito) {
      setCopiadoExitoso(true)
      setTimeout(() => setCopiadoExitoso(false), 2000)
    }
  }

  const compartirTesis = async () => {
    if (!tesis) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tesis.rubro,
          text: `${tesis.rubro}\n\n${tesis.texto.substring(0, 200)}...`,
          url: generarUrlCompartir(tesis)
        })
      } catch (err) {
        // Fallback al copiar URL
        copiarAlPortapapeles(generarUrlCompartir(tesis))
      }
    } else {
      // Fallback para navegadores sin Web Share API
      copiarAlPortapapeles(generarUrlCompartir(tesis))
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚖️</div>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#3D3D3D' }}>
            Cargando tesis...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1C1C' }}>
            Error al cargar la tesis
          </h2>
          <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#3D3D3D' }}>
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: '#1C1C1C',
              color: '#F4EFE8',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  if (!tesis) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#3D3D3D' }}>
            Tesis no encontrada
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm transition-colors duration-300"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C5A770'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3D3D3D'}
          >
            ← Volver a resultados
          </button>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={toggleFavorito}
              className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: favoritos.has(tesis.id) ? '#C5A770' : 'white',
                color: favoritos.has(tesis.id) ? 'white' : '#1C1C1C',
                border: `1px solid ${favoritos.has(tesis.id) ? '#C5A770' : '#E5E5E5'}`,
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {favoritos.has(tesis.id) ? '⭐ En favoritos' : '☆ Agregar a favoritos'}
            </button>

            <button
              onClick={copiarTesis}
              className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: copiadoExitoso ? '#E8F5E8' : 'white',
                color: copiadoExitoso ? '#2E7D32' : '#1C1C1C',
                border: `1px solid ${copiadoExitoso ? '#4CAF50' : '#E5E5E5'}`,
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {copiadoExitoso ? '✅ Copiado' : '📋 Copiar texto'}
            </button>

            <button
              onClick={compartirTesis}
              className="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: 'white',
                color: '#1C1C1C',
                border: '1px solid #E5E5E5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4EFE8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              📤 Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl mb-4" style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: '700',
                color: '#1C1C1C',
                lineHeight: '1.3'
              }}>
                {tesis.rubro}
              </h1>

              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500'
                  }}
                >
                  {obtenerIconoMateria(tesis.materia)} {tesis.materia}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: tesis.tipo === 'jurisprudencia' ? '#E8F5E8' : '#FFF3E0',
                    color: tesis.tipo === 'jurisprudencia' ? '#2E7D32' : '#F57C00',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500'
                  }}
                >
                  {tesis.tipo === 'jurisprudencia' ? '📖 Jurisprudencia' : '📄 Tesis Aislada'}
                </span>
                {tesis.epoca && (
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: '#F3E5F5',
                      color: '#7B1FA2',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500'
                    }}
                  >
                    {tesis.epoca}
                  </span>
                )}
              </div>

              <div className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>
                <div className="mb-1">
                  <strong>Registro Digital:</strong> {tesis.registro_digital}
                </div>
                {tesis.numero_tesis && (
                  <div className="mb-1">
                    <strong>Número de Tesis:</strong> {tesis.numero_tesis}
                  </div>
                )}
                {tesis.fecha_publicacion && (
                  <div className="mb-1">
                    <strong>Fecha de Publicación:</strong> {formatearFecha(tesis.fecha_publicacion)}
                  </div>
                )}
                {tesis.sala && (
                  <div className="mb-1">
                    <strong>Sala:</strong> {tesis.sala}
                  </div>
                )}
                {tesis.instancia && (
                  <div className="mb-1">
                    <strong>Instancia:</strong> {tesis.instancia}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-lg mb-4" style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: '600',
                color: '#1C1C1C'
              }}>
                Texto de la Tesis
              </h2>
              <div 
                className="prose max-w-none"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3D3D3D',
                  fontSize: '16px',
                  lineHeight: '1.7'
                }}
              >
                {tesis.texto.split('\n\n').map((parrafo, index) => (
                  <p key={index} className="mb-4">
                    {parrafo}
                  </p>
                ))}
              </div>
            </div>

            {/* Precedentes */}
            {tesis.precedentes && tesis.precedentes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg mb-4" style={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: '600',
                  color: '#1C1C1C'
                }}>
                  Precedentes
                </h2>
                <div className="space-y-3">
                  {tesis.precedentes.map((precedente, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: '#F4EFE8', border: '1px solid #E5E5E5' }}
                    >
                      <div className="text-sm mb-2" style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '600',
                        color: '#1C1C1C'
                      }}>
                        Expediente: {precedente.numero_expediente}
                      </div>
                      <div className="text-sm mb-1" style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#666'
                      }}>
                        Fecha: {formatearFecha(precedente.fecha)}
                      </div>
                      <div className="text-sm" style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#3D3D3D'
                      }}>
                        {precedente.descripcion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            <div className="pt-6 border-t border-gray-200">
              <div className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>
                <strong>Fuente:</strong> {tesis.fuente}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}