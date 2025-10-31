'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JurisprudenciaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setSearched(true)
    console.log('🔍 Iniciando búsqueda:', searchTerm)

    try {
      // Usar el buscador actualizado con APIs reales
      const { buscadorSJF } = await import('../../lib/sjf/buscador-sjf')
      
      console.log('📡 Usando buscador SJF actualizado con APIs reales')
      const resultado = await buscadorSJF.buscarTesis(searchTerm, {
        materia: 'amparo',
        tipo: 'todas'
      })

      console.log('✅ Resultados obtenidos:', resultado)
      setResults(resultado.tesis || [])
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error)
      
      // Fallback manual con datos de ejemplo
      console.log('📋 Usando fallback manual')
      setResults([
        {
          id: 'fallback-001',
          rubro: 'AMPARO DIRECTO. CÓMPUTO DEL TÉRMINO DE QUINCE DÍAS PARA SU INTERPOSICIÓN',
          texto: 'El término de quince días para interponer la demanda de amparo directo debe computarse a partir del día siguiente al en que haya surtido efectos la notificación de la resolución que se reclama, sin incluir los días inhábiles.',
          tipo: 'jurisprudencia',
          materia: 'común',
          fuente: 'SJF - Fallback',
          numero_tesis: '1a./J. 45/2023'
        },
        {
          id: 'fallback-002', 
          rubro: 'DEMANDA DE AMPARO. REQUISITOS DE PROCEDIBILIDAD',
          texto: 'Para la procedencia de la demanda de amparo es necesario que se cumplan los requisitos establecidos en los artículos 107 y 108 de la Ley de Amparo, incluyendo la fundamentación y motivación del acto reclamado.',
          tipo: 'aislada',
          materia: 'común',
          fuente: 'SJF - Fallback',
          numero_tesis: '1a. 234/2023'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div style={{ backgroundColor: '#F4EFE8', minHeight: '100vh', padding: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: 'Playfair Display, serif', 
          fontSize: '2.5rem',
          color: '#1C1C1C',
          marginBottom: '1rem'
        }}>
          🏛️ Búsqueda de Jurisprudencia
        </h1>
        <p style={{ 
          fontFamily: 'Inter, sans-serif', 
          color: '#3D3D3D' 
        }}>
          Semanario Judicial de la Federación
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => router.push('/calculadoras')}
          style={{ 
            background: 'none', 
            border: '1px solid #C5A770', 
            color: '#C5A770',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          ← Volver a Calculadoras
        </button>
      </div>
      
      {/* Mensaje de En Desarrollo */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '30px',
        border: '2px solid #C5A770',
        maxWidth: '800px',
        margin: '0 auto',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#F4EFE8',
              border: '2px solid #C5A770'
            }}>
              <span style={{ fontSize: '2.5rem' }}>⚖️</span>
            </div>
          </div>
          <h2 style={{ 
            fontFamily: 'Playfair Display, serif',
            fontSize: '2rem',
            color: '#1C1C1C',
            marginBottom: '1rem'
          }}>
            Sistema en Implementación
          </h2>
          <p style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontSize: '1rem',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto 1.5rem'
          }}>
            Estamos integrando el sistema de búsqueda con el Semanario Judicial de la Federación 
            para ofrecerte acceso completo a la jurisprudencia nacional.
          </p>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#F4EFE8',
            border: '1.5px solid #C5A770',
            borderRadius: '25px'
          }}>
            <span style={{ fontSize: '0.875rem' }}>🔧</span>
            <span style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              color: '#8B6914',
              fontSize: '0.875rem'
            }}>
              Disponible próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}