'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { parsearArticulos, obtenerVistaPrevia } from '@/legislacion/parser-articulos'
import { Articulo } from '@/legislacion/tipos-legislacion'
import { obtenerLeyPorId, guardarLeyEnStorage } from '@/legislacion/storage'

export default function AdminEditarLeyPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const leyId = params.leyId as string
  
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [contenido, setContenido] = useState('')
  const [fechaReforma, setFechaReforma] = useState('')
  const [articulosProcesados, setArticulosProcesados] = useState<Articulo[]>([])
  const [vistaPrevia, setVistaPrevia] = useState('')
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [ley, setLey] = useState(obtenerLeyPorId(leyId))

  useEffect(() => {
    // Verificación simple de admin
    const adminParam = searchParams.get('admin')
    if (adminParam !== 'true') {
      router.push('/')
    } else {
      setIsAuthorized(true)
    }
  }, [searchParams, router])

  useEffect(() => {
    if (ley) {
      // Si la fecha es un string en formato DD/MM/AAAA, convertir a AAAA-MM-DD para el input date
      if (typeof ley.fechaUltimaReforma === 'string') {
        if (ley.fechaUltimaReforma.includes('/')) {
          const [dia, mes, anio] = ley.fechaUltimaReforma.split('/')
          setFechaReforma(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`)
        } else {
          setFechaReforma(ley.fechaUltimaReforma)
        }
      } else {
        // Si es Date, convertir a string ISO
        setFechaReforma(ley.fechaUltimaReforma.toISOString().split('T')[0])
      }
    }
  }, [ley])

  if (!isAuthorized || !ley) {
    return null
  }

  const limpiarTexto = () => {
    // Limpiar líneas problemáticas
    const lineas = contenido.split('\n')
    const lineasLimpias = lineas.filter(linea => {
      // Quitar líneas que contengan estos textos problemáticos
      return !linea.includes('CÁMARA DE DIPUTADOS') &&
             !linea.includes('Secretaría General') &&
             !linea.includes('Secretaria General') &&
             !/\d+ de \d+/.test(linea) // Quita líneas tipo "1 de 288"
    })
    
    const textoLimpio = lineasLimpias.join('\n').trim()
    setContenido(textoLimpio)
    alert('Texto limpiado. Ahora puedes procesar los artículos.')
  }

  const procesarArticulos = () => {
    const articulos = parsearArticulos(contenido)
    setArticulosProcesados(articulos)
    setVistaPrevia(obtenerVistaPrevia(articulos))
    setMostrarVistaPrevia(true)
  }

  const guardarLey = async () => {
    if (!ley) return
    
    setGuardando(true)
    
    try {
      // Crear la ley actualizada con los nuevos artículos
      // Convertir fecha de AAAA-MM-DD a DD/MM/AAAA
      const [anio, mes, dia] = fechaReforma.split('-')
      const fechaFormateada = `${dia}/${mes}/${anio}`
      
      const leyActualizada = {
        ...ley,
        articulos: articulosProcesados,
        fechaUltimaReforma: fechaFormateada // Guardar como DD/MM/AAAA
      }
      
      // Guardar en localStorage
      guardarLeyEnStorage(leyActualizada)
      
      // Mostrar mensaje de éxito
      alert(`Se guardaron ${articulosProcesados.length} artículos para ${ley.nombre}`)
      
      // Redirigir al listado
      router.push('/admin/legislacion?admin=true')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar los datos')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/admin/legislacion?admin=true')}
            className="mb-6 text-sm transition-colors duration-300"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C5A770'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3D3D3D'}
          >
            ← Volver a administración
          </button>

          <h1 className="text-2xl md:text-3xl mb-6" style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            color: '#1C1C1C',
            letterSpacing: '-0.01em'
          }}>
            Editar: {ley.nombre}
          </h1>

          {/* Formulario */}
          <div className="bg-white rounded-xl p-6 mb-6" style={{
            border: '1px solid #E5E5E5'
          }}>
            {/* Fecha de reforma */}
            <div className="mb-6">
              <label className="block mb-2" style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1C1C1C'
              }}>
                Fecha de última reforma
              </label>
              <input
                type="date"
                value={fechaReforma}
                onChange={(e) => setFechaReforma(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: '#F4EFE8',
                  border: '1px solid #E5E5E5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <label className="block mb-2" style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1C1C1C'
              }}>
                Contenido completo de la ley
              </label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Pega aquí el contenido completo de la ley..."
                className="w-full px-4 py-3 rounded-lg"
                rows={15}
                style={{
                  backgroundColor: '#F4EFE8',
                  border: '1px solid #E5E5E5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              {contenido.trim() && (
                <button
                  onClick={limpiarTexto}
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
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1C1C1C';
                  }}
                >
                  Limpiar texto
                </button>
              )}
              
              <button
                onClick={procesarArticulos}
                disabled={!contenido.trim()}
                className="px-6 py-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: contenido.trim() ? '#1C1C1C' : '#E5E5E5',
                  color: contenido.trim() ? '#FFFFFF' : '#999',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: contenido.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Procesar artículos
              </button>

              {articulosProcesados.length > 0 && (
                <button
                  onClick={guardarLey}
                  disabled={guardando}
                  className="px-6 py-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: '#C5A770',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    opacity: guardando ? 0.7 : 1
                  }}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              )}
            </div>
          </div>

          {/* Vista previa */}
          {mostrarVistaPrevia && (
            <div className="bg-white rounded-xl p-6" style={{
              border: '1px solid #E5E5E5'
            }}>
              <h2 className="text-xl mb-4" style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: '600',
                color: '#1C1C1C'
              }}>
                Vista previa del procesamiento
              </h2>
              <pre className="whitespace-pre-wrap" style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#3D3D3D',
                lineHeight: '1.6'
              }}>
                {vistaPrevia}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}