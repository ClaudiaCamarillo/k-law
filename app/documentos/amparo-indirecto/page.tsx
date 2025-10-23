'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AmparoIndirectoPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    promovente: '',
    autoridadResponsable: '',
    actoReclamado: '',
    fechaNotificacion: '',
    derechosViolados: '',
    argumentos: ''
  })

  useEffect(() => {
    const userPlan = localStorage.getItem('userPlan') || 'free'
    setPlan(userPlan as 'free' | 'premium')
    
    // Redirect if not premium
    if (userPlan !== 'premium') {
      router.push('/documentos')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular generación con IA
    setTimeout(() => {
      setLoading(false)
      // Aquí iría la lógica para generar el documento
      alert('Documento generado exitosamente')
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (plan !== 'premium') {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
      
      {/* Navigation */}
      <nav className="flex-shrink-0" style={{ backgroundColor: '#0A1628', padding: '1rem 0', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/documentos')}
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
            <span style={{ backgroundColor: '#C9A961', color: '#0A1628', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
              PREMIUM
            </span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 md:px-6 py-8 text-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">📋</span>
          <h1 className="text-3xl md:text-4xl" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
            Demanda de Amparo Indirecto
          </h1>
        </div>
        <p className="text-base md:text-lg" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
          Genera tu demanda con IA en minutos
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Promovente */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Nombre del Promovente
              </label>
              <input
                type="text"
                name="promovente"
                value={formData.promovente}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
                placeholder="Nombre completo del quejoso"
              />
            </div>

            {/* Autoridad Responsable */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Autoridad Responsable
              </label>
              <input
                type="text"
                name="autoridadResponsable"
                value={formData.autoridadResponsable}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
                placeholder="Nombre de la autoridad que emitió el acto"
              />
            </div>

            {/* Acto Reclamado */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Acto Reclamado
              </label>
              <textarea
                name="actoReclamado"
                value={formData.actoReclamado}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg resize-none"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
                placeholder="Descripción del acto o resolución que se impugna"
              />
            </div>

            {/* Fecha de Notificación */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Fecha de Notificación
              </label>
              <input
                type="date"
                name="fechaNotificacion"
                value={formData.fechaNotificacion}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
              />
            </div>

            {/* Derechos Violados */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Derechos Fundamentales Violados
              </label>
              <textarea
                name="derechosViolados"
                value={formData.derechosViolados}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg resize-none"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
                placeholder="Artículos constitucionales y derechos humanos violados"
              />
            </div>

            {/* Argumentos */}
            <div>
              <label className="block mb-2" style={{ color: '#0A1628', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                Argumentos Principales
              </label>
              <textarea
                name="argumentos"
                value={formData.argumentos}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg resize-none"
                style={{ 
                  border: '2px solid #F5F5F5',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A961'; }}
                onBlur={(e) => { e.target.style.borderColor = '#F5F5F5'; }}
                placeholder="Describe los argumentos principales de tu demanda"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/documentos')}
                style={{ 
                  flex: 1,
                  padding: '1rem', 
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
                type="submit"
                disabled={loading}
                style={{ 
                  flex: 2,
                  padding: '1rem', 
                  backgroundColor: loading ? '#6b7280' : '#C9A961', 
                  color: loading ? '#FFFFFF' : '#0A1628', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(201, 169, 97, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#b8975a'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#C9A961'; }}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⚙️</span>
                    Generando con IA...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generar Demanda
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            <span style={{ 
              backgroundColor: '#F5F5F5', 
              color: '#6b7280', 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontFamily: 'Inter, sans-serif' 
            }}>
              🤖 IA Avanzada
            </span>
            <span style={{ 
              backgroundColor: '#F5F5F5', 
              color: '#6b7280', 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontFamily: 'Inter, sans-serif' 
            }}>
              📊 Jurisprudencia Actualizada
            </span>
            <span style={{ 
              backgroundColor: '#F5F5F5', 
              color: '#6b7280', 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontFamily: 'Inter, sans-serif' 
            }}>
              ⚡ Generación en Segundos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}