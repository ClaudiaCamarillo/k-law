'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { computosStorage, ComputoGuardado } from '@/lib/computos-storage'

export default function ComputosGuardadosPage() {
  const router = useRouter()
  const [computos, setComputos] = useState<ComputoGuardado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)
  const [limite, setLimite] = useState(0)

  useEffect(() => {
    const tipo = localStorage.getItem('tipoUsuario')
    setTipoUsuario(tipo)
    setLimite(computosStorage.obtenerLimite())
    cargarComputos()
  }, [])

  const cargarComputos = () => {
    setComputos(computosStorage.obtenerTodos())
  }

  const handleEliminar = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este cómputo?')) {
      computosStorage.eliminar(id)
      cargarComputos()
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const computosFiltrados = computos.filter(computo => {
    const cumpleBusqueda = busqueda === '' || 
      computo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const cumpleTipo = filtroTipo === 'todos' || computo.tipo === filtroTipo
    return cumpleBusqueda && cumpleTipo
  })

  const tiposDeComputo = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'amparo-directo', label: 'Amparo Directo' },
    { value: 'amparo-indirecto', label: 'Amparo Indirecto' },
    { value: 'revision', label: 'Revisión' },
    { value: 'queja', label: 'Queja' },
    { value: 'reclamacion', label: 'Reclamación' },
    { value: 'inconformidad', label: 'Inconformidad' },
    { value: 'revision-fiscal', label: 'Revisión Fiscal' }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/calculadoras')}
            className="mb-6 text-sm transition-colors duration-300"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '400'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C5A770'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3D3D3D'}
          >
            ← Volver a Calculadoras
          </button>

          <h1 className="text-3xl md:text-4xl mb-2" style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            color: '#1C1C1C',
            letterSpacing: '-0.01em'
          }}>
            Cómputos Guardados
          </h1>
          
          <div className="flex items-center justify-between">
            <p className="text-lg" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#3D3D3D',
              fontWeight: '300'
            }}>
              {computos.length} de {limite} cómputos utilizados
            </p>

            {tipoUsuario === 'litigante' && (
              <div className="px-4 py-2 rounded-full" style={{
                backgroundColor: '#C5A770',
                color: '#1C1C1C'
              }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Plan Litigante: {limite} cómputos
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
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

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 rounded-lg cursor-pointer"
                style={{
                  backgroundColor: '#F4EFE8',
                  border: '1px solid #E5E5E5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              >
                {tiposDeComputo.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cómputos */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {computosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: '600',
                color: '#1C1C1C'
              }}>
                No hay cómputos guardados
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#3D3D3D',
                fontWeight: '300'
              }}>
                {busqueda || filtroTipo !== 'todos' 
                  ? 'No se encontraron cómputos con los filtros seleccionados'
                  : 'Comienza a guardar cómputos desde las calculadoras'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {computosFiltrados.map(computo => (
                <div
                  key={computo.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg flex-1" style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: '600',
                      color: '#1C1C1C'
                    }}>
                      {computo.nombre}
                    </h3>
                    <button
                      onClick={() => handleEliminar(computo.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar cómputo"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-2 mb-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: '#3D3D3D'
                  }}>
                    <div>
                      <span className="font-medium">Tipo:</span> {tiposDeComputo.find(t => t.value === computo.tipo)?.label || computo.tipo}
                    </div>
                    <div>
                      <span className="font-medium">Fecha notificación:</span> {formatearFecha(computo.fechaNotificacion)}
                    </div>
                    <div>
                      <span className="font-medium">Fecha vencimiento:</span> {formatearFecha(computo.fechaVencimiento)}
                    </div>
                    <div>
                      <span className="font-medium">Días hábiles:</span> {computo.diasHabiles}
                    </div>
                    <div>
                      <span className="font-medium">Guardado:</span> {formatearFecha(computo.fechaCreacion)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Navegar a la calculadora correspondiente con los datos precargados
                      const ruta = `/calculadoras/${computo.tipo}?datos=${encodeURIComponent(JSON.stringify(computo.datos))}`
                      router.push(ruta)
                    }}
                    className="w-full py-2 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #C5A770',
                      color: '#C5A770',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      fontSize: '14px'
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
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}