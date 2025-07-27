'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Documento {
  id: string
  nombre: string
  descripcion: string
  icono: string
  categoria: string
  ruta: string
  premium: boolean
  nuevo?: boolean
}

export default function DocumentosPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos')

  const documentos: Documento[] = [
    // Documentos principales según requisitos
    { id: '1', nombre: 'Demanda de Amparo Indirecto', descripcion: 'Generador inteligente con IA para crear demandas de amparo indirecto', icono: '📋', categoria: 'amparo', ruta: '/documentos/amparo-indirecto', premium: true },
    { id: '2', nombre: 'Demanda de Amparo Directo', descripcion: 'Formato avanzado con IA para amparo directo ante tribunales', icono: '⚖️', categoria: 'amparo', ruta: '/documentos/amparo-directo', premium: true },
    { id: '3', nombre: 'Contrato de Arrendamiento', descripcion: 'Vivienda y local comercial con cláusulas actualizadas', icono: '🏠', categoria: 'contratos', ruta: '/documentos/arrendamiento', premium: false },
    { id: '4', nombre: 'Contrato de Servicios', descripcion: 'Prestación de servicios profesionales personalizable', icono: '💼', categoria: 'contratos', ruta: '/documentos/servicios', premium: false },
    { id: '5', nombre: 'Contrato de Compraventa', descripcion: 'Bienes muebles e inmuebles con garantías legales', icono: '🤝', categoria: 'contratos', ruta: '/documentos/compraventa', premium: true },
    { id: '6', nombre: 'Diseño de la Semana', descripcion: 'Contrato visual con Legal Design - Esta semana: Arrendamiento ilustrado', icono: '✨', categoria: 'design', ruta: '/documentos/diseno-semana', premium: true, nuevo: true },
    
    // Documentos adicionales
    { id: '7', nombre: 'Recurso de Revisión', descripcion: 'Plantilla inteligente para recursos', icono: '🔄', categoria: 'amparo', ruta: '/documentos/revision', premium: true },
    { id: '8', nombre: 'Alegatos', descripcion: 'Generador de alegatos procesales', icono: '📝', categoria: 'amparo', ruta: '/documentos/alegatos', premium: true },
    { id: '9', nombre: 'Contrato de Confidencialidad', descripcion: 'NDA y acuerdos de confidencialidad', icono: '🔐', categoria: 'contratos', ruta: '/documentos/confidencialidad', premium: true },
    { id: '10', nombre: 'Poder Notarial', descripcion: 'Formatos de poder general y especial', icono: '📜', categoria: 'contratos', ruta: '/documentos/poder-notarial', premium: true },
    { id: '11', nombre: 'Términos y Condiciones', descripcion: 'T&C con lenguaje claro y accesible', icono: '📑', categoria: 'design', ruta: '/documentos/terminos', premium: true },
    { id: '12', nombre: 'Aviso de Privacidad', descripcion: 'AVPD conforme a la ley mexicana', icono: '🛡️', categoria: 'design', ruta: '/documentos/aviso-privacidad', premium: true }
  ]

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '📚' },
    { id: 'contratos', nombre: 'Contratos Básicos', icono: '📝' },
    { id: 'amparo', nombre: 'Documentos de Amparo', icono: '⚖️' },
    { id: 'design', nombre: 'Legal Design', icono: '🎨' },
    { id: 'guardados', nombre: 'Mis Documentos', icono: '💾' }
  ]

  useEffect(() => {
    const userPlan = localStorage.getItem('userPlan') || 'free'
    setPlan(userPlan as 'free' | 'premium')
  }, [])

  const handleDocumentoClick = (documento: Documento) => {
    if (plan === 'free' && documento.premium) {
      setSelectedDocumento(documento)
      setShowUpgradeModal(true)
      return
    }
    router.push(documento.ruta)
  }

  const documentosFiltrados = selectedCategoria === 'todos' 
    ? documentos 
    : selectedCategoria === 'guardados'
    ? [] // Por ahora vacío, se implementará después
    : documentos.filter(doc => doc.categoria === selectedCategoria)

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .document-card {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="flex-shrink-0" style={{ backgroundColor: '#0A1628', padding: '1rem 0', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/calculadoras')}
                style={{ color: '#C9A961', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                ← 
              </button>
              <div style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
                <span className="text-2xl md:text-3xl" style={{ fontWeight: '800', color: '#C9A961', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}>K-LAW</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {plan === 'premium' && (
                <span style={{ backgroundColor: '#C9A961', color: '#0A1628', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                  PREMIUM
                </span>
              )}
              <button 
                onClick={() => router.push('/tienda')}
                className="text-white hover:text-gray-300 transition-colors relative"
                style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}
              >
                🛍️ Tienda
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#16a34a',
                  color: '#FFFFFF',
                  fontSize: '0.5rem',
                  fontWeight: '700',
                  padding: '0.1rem 0.3rem',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  HOT
                </span>
              </button>
              <button 
                onClick={() => router.push('/perfil')}
                className="text-white hover:text-gray-300 transition-colors"
                style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}
              >
                Mi Perfil
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="flex-shrink-0 px-4 md:px-6 py-6 md:py-8 text-center" style={{ backgroundColor: '#F5F5F5' }}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl mb-3" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
          Generador de Documentos Jurídicos
        </h1>
        <p className="text-base md:text-lg" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
          Crea documentos legales profesionales con IA
        </p>
      </div>

      {/* Categories */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className="flex-shrink-0 transition-all duration-300"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                fontSize: '0.875rem',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                backgroundColor: selectedCategoria === cat.id ? '#0A1628' : '#F5F5F5',
                color: selectedCategoria === cat.id ? '#C9A961' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedCategoria !== cat.id) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategoria !== cat.id) {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                }
              }}
            >
              <span>{cat.icono}</span>
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="flex-1 px-4 md:px-6 pb-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {selectedCategoria === 'guardados' && documentosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl mb-2" style={{ fontWeight: '600', color: '#0A1628', fontFamily: 'Montserrat, sans-serif' }}>
                No hay documentos guardados
              </h3>
              <p style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                Los documentos que generes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {documentosFiltrados.map((doc, index) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentoClick(doc)}
                  className="document-card relative group transition-all duration-300 hover:scale-105 text-left"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    minHeight: '220px'
                  }}
                >
                  {doc.nuevo && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <span style={{ 
                        backgroundColor: '#ef4444', 
                        color: '#FFFFFF', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '12px', 
                        fontSize: '0.65rem', 
                        fontWeight: '700', 
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}>
                        NUEVO
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className="h-full p-5 rounded-2xl transition-all duration-300"
                    style={{ 
                      backgroundColor: doc.premium && plan === 'free' ? '#F5F5F5' : '#FFFFFF',
                      border: doc.premium && plan === 'free' ? '2px solid #e5e7eb' : '2px solid #F5F5F5',
                      boxShadow: doc.premium && plan === 'free' ? '0 4px 20px rgba(0,0,0,0.03)' : '0 8px 30px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      if (!(doc.premium && plan === 'free')) {
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(10,22,40,0.15)';
                        e.currentTarget.style.border = '2px solid #C9A961';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(doc.premium && plan === 'free')) {
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
                        e.currentTarget.style.border = '2px solid #F5F5F5';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-3xl mb-3">{doc.icono}</div>
                      <h3 className="text-base md:text-lg mb-2" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Montserrat, sans-serif', lineHeight: '1.3' }}>
                        {doc.nombre}
                      </h3>
                      <p className="text-xs md:text-sm flex-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}>
                        {doc.descripcion}
                      </p>
                      
                      {doc.premium && plan === 'free' ? (
                        <div className="mt-3 flex items-center gap-2">
                          <span style={{ fontSize: '0.875rem' }}>🔒</span>
                          <span style={{ color: '#C9A961', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>PREMIUM</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-between">
                          <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Disponible</span>
                          <span style={{ color: '#C9A961', fontSize: '0.875rem' }}>→</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4" 
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-xl md:text-2xl mb-3" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Playfair Display, serif' }}>
                Documento Premium
              </h2>
              <p className="text-sm md:text-base mb-6" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                El documento "{selectedDocumento?.nombre}" requiere una cuenta Premium para generar contenido con IA avanzada.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold mb-2" style={{ color: '#0A1628', fontFamily: 'Montserrat, sans-serif' }}>
                  Incluye en Premium:
                </h4>
                <ul className="text-xs space-y-1" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                  <li>✓ Generación ilimitada de documentos</li>
                  <li>✓ Personalización con IA</li>
                  <li>✓ Exportar en múltiples formatos</li>
                  <li>✓ Guardado en la nube</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#F5F5F5', 
                    color: '#374151', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => router.push('/')}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#C9A961', 
                    color: '#0A1628', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8975a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C9A961'; }}
                >
                  Actualizar Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}