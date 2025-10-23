'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JurisprudenciaPage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  const realizarBusqueda = () => {
    if (!busqueda.trim()) return
    
    setCargando(true)
    
    // Simular búsqueda con datos de ejemplo
    setTimeout(() => {
      const tesisEjemplo = [
        {
          id: '1',
          rubro: 'AMPARO DIRECTO. CÓMPUTO DEL TÉRMINO DE QUINCE DÍAS PARA SU INTERPOSICIÓN',
          texto: 'El término de quince días para interponer la demanda de amparo directo debe computarse a partir del día siguiente al en que haya surtido efectos la notificación de la resolución que se reclama, sin incluir los días inhábiles. Este criterio busca garantizar el derecho de acceso efectivo a la justicia constitucional.',
          registro: '2023-001',
          tipo: 'Jurisprudencia',
          materia: 'Amparo',
          fuente: 'Semanario Judicial de la Federación'
        },
        {
          id: '2', 
          rubro: 'DEBIDO PROCESO LEGAL. GARANTÍAS MÍNIMAS QUE LO INTEGRAN',
          texto: 'El derecho al debido proceso legal comprende las garantías mínimas que aseguran al gobernado la oportunidad de ser oído y vencido en juicio, incluyendo el derecho a la defensa adecuada, a ofrecer y desahogar pruebas, y a impugnar las resoluciones adversas.',
          registro: '2023-002',
          tipo: 'Tesis Aislada',
          materia: 'Constitucional',
          fuente: 'Semanario Judicial de la Federación'
        },
        {
          id: '3',
          rubro: 'RECURSO DE REVISIÓN. TÉRMINO PARA SU INTERPOSICIÓN EN MATERIA DE AMPARO',
          texto: 'El recurso de revisión debe interponerse dentro del término de diez días contados a partir del día siguiente al en que surta efectos la notificación de la resolución que se recurre, término que es improrrogable y de orden público.',
          registro: '2023-003',
          tipo: 'Jurisprudencia',
          materia: 'Amparo',
          fuente: 'Semanario Judicial de la Federación'
        }
      ]
      
      const filtrados = tesisEjemplo.filter(tesis => 
        tesis.rubro.toLowerCase().includes(busqueda.toLowerCase()) ||
        tesis.texto.toLowerCase().includes(busqueda.toLowerCase()) ||
        tesis.materia.toLowerCase().includes(busqueda.toLowerCase())
      )
      
      setResultados(filtrados)
      setCargando(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      {/* Golden Top Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '122px',
        backgroundColor: '#C5A770',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Thin Black Line */}
      <div style={{
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        height: '1.5px',
        backgroundColor: '#1C1C1C',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Elegant Header */}
      <div className="relative py-8 md:py-12" style={{ zIndex: 2 }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1C1C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative z-10 text-center px-6">
          <div className="mb-4" style={{ position: 'relative', zIndex: 10, marginTop: '-47px' }}>
            <img 
              src="/LOGO-KLAW.gif" 
              alt="K-LAW Logo" 
              className="mx-auto cursor-pointer"
              style={{ 
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '599px',
                maxHeight: '240px',
                position: 'relative',
                zIndex: 10
              }}
              onClick={() => router.push('/')}
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontWeight: '800',
            color: '#1C1C1C',
            letterSpacing: '-0.02em'
          }}>
            Búsqueda de Jurisprudencia
          </h1>
          <p className="text-sm md:text-base" style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Semanario Judicial de la Federación
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 text-center" style={{ position: 'relative', zIndex: 5 }}>
        <button
          onClick={() => router.back()}
          className="text-sm transition-colors duration-300 mb-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '400',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#C5A770'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3D3D3D'}
        >
          ← Volver a calculadoras
        </button>
      </div>

      {/* Search Form */}
      <div className="flex-1 px-6 pb-8" style={{ position: 'relative', zIndex: 5 }}>
        <div className="max-w-4xl mx-auto">
          <div 
            className="p-6 transition-all duration-300"
            style={{ 
              backgroundColor: 'transparent',
              border: '2px solid #C5A770',
              borderRadius: '30px',
              marginBottom: '2rem'
            }}
          >
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cualquier tema jurídico (ej: amparo directo, debido proceso, contratos...)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && realizarBusqueda()}
                className="w-full px-4 py-3 rounded-lg text-base"
                style={{
                  backgroundColor: '#F4EFE8',
                  border: '2px solid #E5E5E5',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C5A770'}
                onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
              />
            </div>

            <button
              onClick={realizarBusqueda}
              disabled={cargando || !busqueda.trim()}
              className="w-full py-3 transition-all duration-300"
              style={{
                backgroundColor: cargando || !busqueda.trim() ? '#E5E5E5' : '#1C1C1C',
                color: cargando || !busqueda.trim() ? '#999' : '#F4EFE8',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: cargando || !busqueda.trim() ? 'not-allowed' : 'pointer',
                borderRadius: '30px'
              }}
              onMouseEnter={(e) => {
                if (!cargando && busqueda.trim()) {
                  e.currentTarget.style.backgroundColor = '#C5A770'
                }
              }}
              onMouseLeave={(e) => {
                if (!cargando && busqueda.trim()) {
                  e.currentTarget.style.backgroundColor = '#1C1C1C'
                }
              }}
            >
              {cargando ? '🔍 Buscando...' : '🔍 Buscar Jurisprudencia'}
            </button>
          </div>

          {/* Results */}
          {resultados.length > 0 && (
            <div>
              <div className="mb-4">
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3D3D3D',
                  fontSize: '14px',
                  fontWeight: '300'
                }}>
                  {resultados.length} resultados encontrados
                </p>
              </div>

              <div className="space-y-4">
                {resultados.map((tesis) => (
                  <div
                    key={tesis.id}
                    className="relative group transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div 
                      className="h-full p-6 transition-all duration-300"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: '2px solid #C5A770',
                        borderRadius: '30px'
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <h3 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: '#1C1C1C', 
                          marginBottom: '1rem', 
                          fontFamily: 'Playfair Display, serif',
                          lineHeight: '1.3'
                        }}>
                          {tesis.rubro}
                        </h3>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: '#E3F2FD',
                              color: '#1976D2',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: '500'
                            }}
                          >
                            📚 {tesis.materia}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: tesis.tipo === 'Jurisprudencia' ? '#E8F5E8' : '#FFF3E0',
                              color: tesis.tipo === 'Jurisprudencia' ? '#2E7D32' : '#F57C00',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: '500'
                            }}
                          >
                            {tesis.tipo === 'Jurisprudencia' ? '📖 Jurisprudencia' : '📄 Tesis Aislada'}
                          </span>
                        </div>

                        <p style={{ 
                          color: '#3D3D3D', 
                          fontSize: '0.875rem', 
                          fontFamily: 'Inter, sans-serif', 
                          lineHeight: '1.6',
                          marginBottom: '1rem',
                          fontWeight: '300'
                        }}>
                          {tesis.texto}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs" style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#999'
                        }}>
                          <span>Registro: {tesis.registro}</span>
                          <span>{tesis.fuente}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!cargando && resultados.length === 0 && !busqueda && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                color: '#1C1C1C',
                fontWeight: '600'
              }}>
                Buscar en la Jurisprudencia
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#3D3D3D',
                fontSize: '14px',
                fontWeight: '300'
              }}>
                Ingresa cualquier término jurídico para encontrar tesis y jurisprudencias
              </p>
            </div>
          )}

          {/* No results */}
          {!cargando && resultados.length === 0 && busqueda && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                color: '#1C1C1C',
                fontWeight: '600'
              }}>
                Sin resultados
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#3D3D3D',
                fontSize: '14px',
                fontWeight: '300'
              }}>
                No se encontraron tesis con el término "{busqueda}". Intenta con otras palabras.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'transparent', 
        padding: '2rem 0', 
        borderTop: '1px solid #E5E5E5',
        position: 'relative',
        zIndex: 5
      }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ 
            color: '#3D3D3D', 
            fontSize: '0.875rem', 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '300'
          }}>
            Búsqueda de jurisprudencia - 
            <button 
              onClick={() => router.push('/calculadoras')}
              style={{ 
                color: '#C5A770', 
                fontWeight: '500', 
                textDecoration: 'underline', 
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Volver a calculadoras
            </button>
          </p>
        </div>
      </footer>
    </div>
  )
}