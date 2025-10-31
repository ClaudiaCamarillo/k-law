'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Categoria } from '@/legislacion/tipos-legislacion'
import { obtenerLeyesDeStorage } from '@/legislacion/storage'

const categorias: { value: Categoria | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas las categorías' },
  { value: 'federales', label: 'Federales' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'mercantil', label: 'Mercantil' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'penal', label: 'Penal' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'civil', label: 'Civil' }
]

export default function LegislacionPage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | 'todas'>('todas')
  const [leyesFederales, setLeyesFederales] = useState(obtenerLeyesDeStorage())

  // Recargar datos cuando el componente se monta
  useState(() => {
    setLeyesFederales(obtenerLeyesDeStorage())
  })

  const leyesFiltradas = useMemo(() => {
    return leyesFederales.filter(ley => {
      const coincideBusqueda = ley.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria = categoriaSeleccionada === 'todas' || ley.categoria === categoriaSeleccionada
      return coincideBusqueda && coincideCategoria
    })
  }, [busqueda, categoriaSeleccionada, leyesFederales])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
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
            ← Volver
          </button>

          <h1 className="text-3xl md:text-4xl mb-2" style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            color: '#1C1C1C',
            letterSpacing: '-0.01em'
          }}>
            Legislación Federal Mexicana
          </h1>
          <p className="text-lg" style={{
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300'
          }}>
            Base de datos actualizada
          </p>
        </div>
      </div>

      {/* Mensaje de En Desarrollo */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#1C1C1C'
              }}>
                Base de Datos en Construcción
              </h2>
              <p className="text-gray-600 mb-8" style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                Estamos recopilando y organizando la legislación federal mexicana más actualizada. 
                Pronto tendrás acceso a una biblioteca legal completa con herramientas de búsqueda avanzada.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg" style={{
                backgroundColor: '#F8F4E8',
                border: '1.5px solid #C5A770'
              }}>
                <span className="text-sm" style={{ color: '#8B6914' }}>📊</span>
                <span className="font-medium" style={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#8B6914'
                }}>
                  En proceso de actualización
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}