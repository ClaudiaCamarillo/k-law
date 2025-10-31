'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  tipo: 'digital' | 'fisico'
  categoria: string
  imagen: string
  popular?: boolean
  nuevo?: boolean
  oferta?: number // porcentaje de descuento
  rating: number
  reviews: number
  tags: string[]
}

export default function TiendaPage() {
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'digital' | 'fisico'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [ordenar, setOrdenar] = useState<'popular' | 'precio-asc' | 'precio-desc' | 'nuevo'>('popular')
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const [carrito, setCarrito] = useState<string[]>([])

  const productos: Producto[] = [
    // Productos Digitales
    {
      id: '1',
      nombre: 'Pack Cartas de Amparo Directo',
      descripcion: '30 cartas educativas digitales sobre el procedimiento de amparo directo',
      precio: 199,
      tipo: 'digital',
      categoria: 'cartas',
      imagen: '🃏',
      popular: true,
      nuevo: true,
      rating: 4.8,
      reviews: 124,
      tags: ['amparo', 'cartas', 'estudio']
    },
    {
      id: '2',
      nombre: 'Ley de Amparo - Diseño Premium',
      descripcion: 'PDF con diseño moderno, infografías y navegación interactiva',
      precio: 149,
      tipo: 'digital',
      categoria: 'leyes',
      imagen: '📕',
      popular: true,
      rating: 4.9,
      reviews: 89,
      tags: ['ley', 'diseño', 'pdf']
    },
    {
      id: '3',
      nombre: 'Flashcards Términos Procesales',
      descripcion: '100 flashcards digitales para memorizar términos jurídicos',
      precio: 99,
      tipo: 'digital',
      categoria: 'flashcards',
      imagen: '🎴',
      oferta: 20,
      rating: 4.5,
      reviews: 67,
      tags: ['flashcards', 'estudio', 'memorización']
    },
    {
      id: '4',
      nombre: 'Plantillas de Mapas Mentales',
      descripcion: 'Kit de 25 plantillas para crear mapas conceptuales jurídicos',
      precio: 79,
      tipo: 'digital',
      categoria: 'plantillas',
      imagen: '🗺️',
      nuevo: true,
      rating: 4.7,
      reviews: 45,
      tags: ['plantillas', 'mapas', 'estudio']
    },
    {
      id: '5',
      nombre: 'Pack Jurisprudencia Ilustrada',
      descripcion: 'Criterios relevantes explicados con infografías',
      precio: 299,
      tipo: 'digital',
      categoria: 'jurisprudencia',
      imagen: '⚖️',
      popular: true,
      rating: 4.9,
      reviews: 156,
      tags: ['jurisprudencia', 'infografía', 'criterios']
    },

    // Productos Físicos
    {
      id: '6',
      nombre: 'Cartas de Amparo - Edición Física',
      descripcion: 'Baraja impresa en alta calidad con 54 cartas sobre amparo',
      precio: 399,
      tipo: 'fisico',
      categoria: 'cartas',
      imagen: '🎯',
      popular: true,
      rating: 5.0,
      reviews: 201,
      tags: ['cartas', 'físico', 'coleccionable']
    },
    {
      id: '7',
      nombre: 'Poster Flowchart Amparo',
      descripcion: 'Poster 60x90cm con el proceso completo del juicio de amparo',
      precio: 249,
      tipo: 'fisico',
      categoria: 'posters',
      imagen: '🖼️',
      nuevo: true,
      rating: 4.8,
      reviews: 78,
      tags: ['poster', 'flowchart', 'decoración']
    },
    {
      id: '8',
      nombre: 'Cuaderno Legal Design',
      descripcion: 'Cuaderno A5 con plantillas para casos y notas procesales',
      precio: 189,
      tipo: 'fisico',
      categoria: 'papeleria',
      imagen: '📓',
      oferta: 15,
      rating: 4.6,
      reviews: 92,
      tags: ['cuaderno', 'plantillas', 'notas']
    },
    {
      id: '9',
      nombre: 'Pack Stickers Jurídicos',
      descripcion: 'Set de 50 stickers con términos y símbolos del derecho',
      precio: 89,
      tipo: 'fisico',
      categoria: 'stickers',
      imagen: '🏷️',
      rating: 4.4,
      reviews: 134,
      tags: ['stickers', 'decoración', 'divertido']
    },
    {
      id: '10',
      nombre: 'Taza "Abogado en Formación"',
      descripcion: 'Taza de cerámica con diseño exclusivo K-LAW',
      precio: 129,
      tipo: 'fisico',
      categoria: 'merchandise',
      imagen: '☕',
      nuevo: true,
      rating: 4.7,
      reviews: 56,
      tags: ['taza', 'merchandise', 'regalo']
    }
  ]

  const categorias = [
    { id: 'todos', nombre: 'Todas las categorías' },
    { id: 'cartas', nombre: 'Cartas Educativas' },
    { id: 'leyes', nombre: 'Leyes Diseñadas' },
    { id: 'flashcards', nombre: 'Flashcards' },
    { id: 'plantillas', nombre: 'Plantillas' },
    { id: 'posters', nombre: 'Posters' },
    { id: 'papeleria', nombre: 'Papelería' },
    { id: 'merchandise', nombre: 'Merchandise' }
  ]

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const cumpleTipo = filtroTipo === 'todos' || producto.tipo === filtroTipo
    const cumpleCategoria = filtroCategoria === 'todos' || producto.categoria === filtroCategoria
    const cumpleBusqueda = busqueda === '' || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.tags.some(tag => tag.toLowerCase().includes(busqueda.toLowerCase()))
    
    return cumpleTipo && cumpleCategoria && cumpleBusqueda
  })

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenar) {
      case 'popular':
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.reviews - a.reviews
      case 'precio-asc':
        return a.precio - b.precio
      case 'precio-desc':
        return b.precio - a.precio
      case 'nuevo':
        return (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0)
      default:
        return 0
    }
  })

  const agregarAlCarrito = (productoId: string) => {
    setCarrito([...carrito, productoId])
    // Aquí se podría agregar una notificación o toast
  }

  const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
    if (!descuento) return precio
    return precio * (1 - descuento / 100)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .product-card {
          animation: slideIn 0.4s ease-out;
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
              <button 
                onClick={() => router.push('/carrito')}
                className="relative"
                style={{ 
                  color: '#FFFFFF', 
                  fontSize: '1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A961'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              >
                🛒
                {carrito.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#ef4444',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {carrito.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => router.push('/mis-compras')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem', 
                  fontFamily: 'Inter, sans-serif',
                  color: '#FFFFFF',
                  background: 'none',
                  border: '1px solid #C9A961',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = '#C9A961';
                  e.currentTarget.style.color = '#0A1628';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                Mis Compras
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 md:px-6 py-8 text-center" style={{ backgroundColor: '#F5F5F5' }}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl mb-3" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
          Tienda Jurídica
        </h1>
        <p className="text-base md:text-lg" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>
          Materiales educativos para estudiantes y profesionales del derecho
        </p>
      </div>

      {/* Mensaje de En Desarrollo */}
      <div className="flex-1 px-4 md:px-6 py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ backgroundColor: '#0A1628' }}>
              <span className="text-3xl">🛍️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ 
            fontFamily: 'Playfair Display, serif',
            color: '#0A1628'
          }}>
            Tienda en Desarrollo
          </h2>
          <p className="text-gray-600 mb-8" style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            Estamos preparando nuestra tienda jurídica con productos exclusivos y materiales educativos de alta calidad. 
            Muy pronto podrás adquirir recursos especializados para tu desarrollo profesional.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg" style={{
            backgroundColor: '#F5F5F5',
            border: '1.5px solid #C9A961'
          }}>
            <span className="text-sm" style={{ color: '#0A1628' }}>🚀</span>
            <span className="font-medium" style={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#0A1628'
            }}>
              Lanzamiento próximamente
            </span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowPreview(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl mb-4" style={{ fontWeight: '700', color: '#0A1628', fontFamily: 'Playfair Display, serif' }}>
                Vista Previa
              </h3>
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <p style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                  Aquí se mostraría una vista previa del producto digital
                </p>
              </div>
              <button
                onClick={() => setShowPreview(null)}
                style={{ 
                  padding: '0.75rem 2rem', 
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
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}