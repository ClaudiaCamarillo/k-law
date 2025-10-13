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

      {/* Filtros y Búsqueda */}
      <div className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar ley..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#F4EFE8',
                    border: '1px solid #E5E5E5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Filtro por categoría */}
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value as Categoria | 'todas')}
                className="px-4 py-2 rounded-lg cursor-pointer"
                style={{
                  backgroundColor: '#F4EFE8',
                  border: '1px solid #E5E5E5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              >
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Leyes */}
      <div className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leyesFiltradas.map(ley => (
              <div
                key={ley.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4">
                  <h3 className="text-lg mb-2" style={{
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: '600',
                    color: '#1C1C1C'
                  }}>
                    {ley.nombre}
                  </h3>
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
                </div>

                <p className="text-sm mb-4" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#3D3D3D',
                  fontWeight: '300',
                  fontStyle: 'italic'
                }}>
                  Contenido próximamente
                </p>

                <Link
                  href={`/legislacion/${ley.id}`}
                  className="block w-full py-2 rounded-lg transition-all duration-300 text-center"
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
                  Ver
                </Link>
              </div>
            ))}
          </div>

          {leyesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#3D3D3D',
                fontWeight: '300'
              }}>
                No se encontraron leyes con los filtros seleccionados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}