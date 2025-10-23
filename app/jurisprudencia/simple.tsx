'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JurisprudenciaSimple() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')

  return (
    <div style={{ backgroundColor: '#F4EFE8', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Arial, sans-serif', color: '#1C1C1C' }}>
        Búsqueda de Jurisprudencia
      </h1>
      
      <button 
        onClick={() => router.back()}
        style={{ marginBottom: '2rem', background: 'none', border: 'none', color: '#666' }}
      >
        ← Volver
      </button>
      
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px' }}>
        <input
          type="text"
          placeholder="Buscar jurisprudencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            marginBottom: '1rem',
            border: '2px solid #C5A770',
            borderRadius: '5px'
          }}
        />
        
        <button
          style={{
            backgroundColor: '#1C1C1C',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </div>
      
      <p style={{ marginTop: '2rem', color: '#666' }}>
        Funcionalidad en desarrollo. Pronto estará disponible la búsqueda completa.
      </p>
    </div>
  )
}