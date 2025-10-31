'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Documento {
  id: string
  nombre: string
  descripcion: string
  icono: string
  categoria: string
  campos?: Campo[]
  premium: boolean
  nuevo?: boolean
}

interface Campo {
  id: string
  label: string
  tipo: 'text' | 'textarea' | 'date' | 'select' | 'email' | 'number'
  placeholder?: string
  requerido: boolean
  opciones?: string[]
  ayuda?: string
}

interface FormData {
  [key: string]: string
}

export default function DocumentosPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<'free' | 'premium'>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos')
  const [showFormModal, setShowFormModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({})
  const [generatingDocument, setGeneratingDocument] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [legalDesignMode, setLegalDesignMode] = useState(false)

  const documentos: Documento[] = [
    // Documentos principales según requisitos
    { 
      id: '1', 
      nombre: 'Demanda de Amparo Indirecto', 
      descripcion: 'Generador inteligente con IA para crear demandas de amparo indirecto', 
      icono: '📋', 
      categoria: 'amparo', 
      premium: true,
      campos: [
        { id: 'promovente', label: 'Nombre del Promovente', tipo: 'text', placeholder: 'Nombre completo del quejoso', requerido: true },
        { id: 'autoridadResponsable', label: 'Autoridad Responsable', tipo: 'text', placeholder: 'Autoridad que emitió el acto', requerido: true },
        { id: 'actoReclamado', label: 'Acto Reclamado', tipo: 'textarea', placeholder: 'Descripción del acto que se impugna', requerido: true },
        { id: 'fechaNotificacion', label: 'Fecha de Notificación', tipo: 'date', requerido: true },
        { id: 'derechosViolados', label: 'Derechos Fundamentales Violados', tipo: 'textarea', placeholder: 'Artículos constitucionales violados', requerido: true },
        { id: 'argumentos', label: 'Argumentos Principales', tipo: 'textarea', placeholder: 'Argumentos de la demanda', requerido: true }
      ]
    },
    { 
      id: '2', 
      nombre: 'Demanda de Amparo Directo', 
      descripcion: 'Formato avanzado con IA para amparo directo ante tribunales', 
      icono: '⚖️', 
      categoria: 'amparo', 
      premium: true,
      campos: [
        { id: 'quejoso', label: 'Nombre del Quejoso', tipo: 'text', placeholder: 'Nombre completo', requerido: true },
        { id: 'sentencia', label: 'Sentencia Impugnada', tipo: 'text', placeholder: 'Número de expediente y fecha', requerido: true },
        { id: 'tribunal', label: 'Tribunal que emitió la sentencia', tipo: 'text', requerido: true },
        { id: 'conceptosViolacion', label: 'Conceptos de Violación', tipo: 'textarea', placeholder: 'Detalle los conceptos', requerido: true }
      ]
    },
    { 
      id: '3', 
      nombre: 'Contrato de Arrendamiento', 
      descripcion: 'Vivienda y local comercial con cláusulas actualizadas', 
      icono: '🏠', 
      categoria: 'contratos', 
      premium: false,
      campos: [
        { id: 'arrendador', label: 'Nombre del Arrendador', tipo: 'text', requerido: true },
        { id: 'arrendatario', label: 'Nombre del Arrendatario', tipo: 'text', requerido: true },
        { id: 'inmueble', label: 'Dirección del Inmueble', tipo: 'text', requerido: true },
        { id: 'tipoInmueble', label: 'Tipo de Inmueble', tipo: 'select', opciones: ['Casa Habitación', 'Local Comercial', 'Departamento', 'Oficina'], requerido: true },
        { id: 'renta', label: 'Monto de Renta Mensual', tipo: 'number', placeholder: '0.00', requerido: true },
        { id: 'duracion', label: 'Duración del Contrato (meses)', tipo: 'number', placeholder: '12', requerido: true },
        { id: 'fechaInicio', label: 'Fecha de Inicio', tipo: 'date', requerido: true }
      ]
    },
    { 
      id: '4', 
      nombre: 'Contrato de Servicios Profesionales', 
      descripcion: 'Contrato avanzado de prestación de servicios profesionales con IA', 
      icono: '💼', 
      categoria: 'contratos', 
      premium: true,
      nuevo: true,
      campos: [
        // Datos del Cliente
        { id: 'nombreCliente', label: 'Nombre Completo del Cliente', tipo: 'text', requerido: true },
        { id: 'tipoPersonaCliente', label: 'Tipo de Persona', tipo: 'select', opciones: ['Persona Física', 'Persona Moral'], requerido: true },
        { id: 'nacionalidadCliente', label: 'Nacionalidad del Cliente', tipo: 'text', placeholder: 'Mexicana', requerido: true },
        { id: 'rfcCliente', label: 'RFC del Cliente', tipo: 'text', placeholder: 'XXXX000000XXX', requerido: true },
        { id: 'domicilioCliente', label: 'Domicilio Completo del Cliente', tipo: 'text', requerido: true },
        
        // Datos del Prestador
        { id: 'nombrePrestador', label: 'Nombre Completo del Prestador', tipo: 'text', requerido: true },
        { id: 'nacionalidadPrestador', label: 'Nacionalidad del Prestador', tipo: 'text', placeholder: 'Mexicana', requerido: true },
        { id: 'rfcPrestador', label: 'RFC del Prestador', tipo: 'text', placeholder: 'XXXX000000XXX', requerido: true },
        { id: 'cedulaProfesional', label: 'Cédula Profesional (si aplica)', tipo: 'text', placeholder: 'Opcional', requerido: false },
        { id: 'domicilioPrestador', label: 'Domicilio Fiscal del Prestador', tipo: 'text', requerido: true },
        { id: 'regimenFiscal', label: 'Régimen Fiscal del Prestador', tipo: 'select', 
          opciones: [
            'Personas Físicas con Actividad Empresarial y Profesional', 
            'Régimen Simplificado de Confianza',
            'Personas Físicas con Actividades Empresariales'
          ], 
          requerido: true 
        },
        
        // Datos del Servicio
        { id: 'tipoServicio', label: 'Tipo de Prestación de Servicios', tipo: 'select', 
          opciones: [
            'Servicios Jurídicos (Asesoría legal, representación)',
            'Servicios de Diseño (Gráfico, web, arquitectónico)', 
            'Servicios Inmobiliarios (Avalúos, gestión, intermediación)',
            'Servicios de Consultoría (Empresarial, financiera, estratégica)',
            'Servicios de Ingeniería (Diseño, supervisión, dictámenes)',
            'Servicios de Tecnología (Desarrollo software, soporte IT)',
            'Servicios de Marketing (Publicidad, estrategia digital)',
            'Servicios de Contabilidad (Auditoría, fiscal, nóminas)',
            'Servicios de Salud (Médicos, psicológicos, terapéuticos)',
            'Servicios Educativos (Capacitación, formación profesional)',
            'Otros servicios profesionales'
          ], 
          requerido: true,
          ayuda: 'Selecciona el tipo de servicios para aplicar la legislación especializada correspondiente'
        },
        { id: 'descripcionServicios', label: 'Descripción Detallada de los Servicios', tipo: 'textarea', placeholder: 'Especifique los servicios, entregables, alcance y especificaciones técnicas', requerido: true },
        { id: 'monto', label: 'Monto Total (sin IVA)', tipo: 'number', placeholder: '0.00', requerido: true },
        { id: 'formaPago', label: 'Forma de Pago', tipo: 'select', opciones: ['Pago único', 'Pagos parciales', 'Mensualidades', 'Por entregables'], requerido: true },
        { id: 'fechaInicio', label: 'Fecha de Inicio', tipo: 'date', requerido: true },
        { id: 'fechaTermino', label: 'Fecha de Término', tipo: 'date', requerido: true },
        { id: 'garantia', label: 'Período de Garantía (días)', tipo: 'number', placeholder: '90', requerido: true },
        
        // Ubicación
        { id: 'estado', label: 'Estado donde se firma', tipo: 'select', 
          opciones: Object.keys({
            'Aguascalientes': true, 'Baja California': true, 'Baja California Sur': true,
            'Campeche': true, 'Chiapas': true, 'Chihuahua': true, 'Ciudad de México': true,
            'Coahuila': true, 'Colima': true, 'Durango': true, 'Estado de México': true,
            'Guanajuato': true, 'Guerrero': true, 'Hidalgo': true, 'Jalisco': true,
            'Michoacán': true, 'Morelos': true, 'Nayarit': true, 'Nuevo León': true,
            'Oaxaca': true, 'Puebla': true, 'Querétaro': true, 'Quintana Roo': true,
            'San Luis Potosí': true, 'Sinaloa': true, 'Sonora': true, 'Tabasco': true,
            'Tamaulipas': true, 'Tlaxcala': true, 'Veracruz': true, 'Yucatán': true,
            'Zacatecas': true
          }), 
          requerido: true 
        },
        { id: 'ciudad', label: 'Ciudad donde se firma', tipo: 'text', requerido: true },
        
        // Opciones adicionales
        { id: 'propiedadIntelectual', label: 'Propiedad Intelectual', tipo: 'select', 
          opciones: ['Del Cliente', 'Del Prestador', 'Compartida'], 
          requerido: true,
          ayuda: 'Define quién será el dueño de los derechos sobre el trabajo realizado' 
        }
      ]
    },
    { 
      id: '5', 
      nombre: 'Contrato de Compraventa', 
      descripcion: 'Bienes muebles e inmuebles con garantías legales', 
      icono: '🏪', 
      categoria: 'contratos', 
      premium: true,
      campos: [
        { id: 'vendedor', label: 'Nombre del Vendedor', tipo: 'text', requerido: true },
        { id: 'comprador', label: 'Nombre del Comprador', tipo: 'text', requerido: true },
        { id: 'bien', label: 'Descripción del Bien', tipo: 'textarea', requerido: true },
        { id: 'precio', label: 'Precio de Venta', tipo: 'number', placeholder: '0.00', requerido: true },
        { id: 'formaPago', label: 'Forma de Pago', tipo: 'text', requerido: true },
        { id: 'tipoPropiedad', label: 'Tipo de Propiedad', tipo: 'select', opciones: ['Inmueble', 'Vehículo', 'Bien Mueble', 'Otro'], requerido: true },
        { id: 'direccion', label: 'Dirección del Inmueble', tipo: 'text', requerido: false },
        { id: 'superficie', label: 'Superficie (m²)', tipo: 'text', requerido: false },
        { id: 'descripcion', label: 'Descripción detallada', tipo: 'textarea', requerido: false }
      ]
    }
  ]

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '📚' },
    { id: 'amparo', nombre: 'Amparo', icono: '⚖️' },
    { id: 'contratos', nombre: 'Contratos', icono: '📜' },
    { id: 'guardados', nombre: 'Guardados', icono: '💾' }
  ]

  useEffect(() => {
    // Temporal: Forzar plan premium para testing
    localStorage.setItem('userPlan', 'premium')
    localStorage.setItem('tipoUsuario', 'servidor')
    setPlan('premium')
    
    // Código original comentado temporalmente
    // const userPlan = localStorage.getItem('userPlan') || 'free'
    // setPlan(userPlan as 'free' | 'premium')
  }, [])

  const handleSelectDocumento = (doc: Documento) => {
    if (doc.premium && plan === 'free') {
      setShowUpgradeModal(true)
      return
    }
    setSelectedDocumento(doc)
    setFormData({})
    setShowFormModal(true)
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleGenerateDocument = async () => {
    if (!selectedDocumento || !validateForm()) return
    
    setGeneratingDocument(true)
    
    try {
      // Obtener configuración guardada
      const savedConfig = localStorage.getItem('klaw-config')
      const config = savedConfig ? JSON.parse(savedConfig) : null
      
      // Determinar qué endpoint usar
      const isContratoServiciosProfesionales = selectedDocumento.nombre === 'Contrato de Servicios Profesionales'
      const endpoint = isContratoServiciosProfesionales ? '/api/generar-contrato' : '/api/generar-documento'
      
      const requestBody = isContratoServiciosProfesionales ? {
        tipoContrato: selectedDocumento.nombre,
        datos: formData,
        estado: formData.estado,
        usarIA: true, // Siempre usar IA para contratos profesionales
        legalDesign: legalDesignMode, // Agregar Legal Design para contratos
        config: {
          colors: config?.colors,
          designStyle: config?.designStyle || 'moderno',
          industry: config?.industry || 'general'
        }
      } : {
        tipoDocumento: selectedDocumento.nombre,
        datos: formData,
        legalDesign: legalDesignMode,
        config: {
          colors: config?.colors,
          designStyle: config?.designStyle || 'moderno',
          industry: config?.industry || 'general'
        }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        throw new Error('Error al generar el documento')
      }
      
      const data = await response.json()
      setGeneratedDocument(data.documento)
      setShowFormModal(false)
      setShowPreview(true)
    } catch (error) {
      console.error('Error completo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al generar el documento: ${errorMessage}`)
    } finally {
      setGeneratingDocument(false)
    }
  }

  const handleDownloadDocument = async () => {
    if (!generatedDocument || !selectedDocumento) return
    
    try {
      // Crear un contenedor temporal para el documento
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = generatedDocument
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '210mm' // Ancho A4
      tempDiv.style.padding = '25mm'
      tempDiv.style.backgroundColor = 'white'
      document.body.appendChild(tempDiv)
      
      // Asegurar que el logo esté visible para la captura
      const logoImg = tempDiv.querySelector('img[alt="K-LAW"]')
      if (logoImg) {
        logoImg.style.position = 'absolute'
        logoImg.style.bottom = '30px'
        logoImg.style.right = '30px'
        logoImg.style.opacity = '0.15'
      }
      
      // Generar el canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      })
      
      // Crear PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      })
      
      // Función para agregar marca de agua en cada página
      const addWatermark = () => {
        // Cargar y agregar logo como marca de agua
        const logoWidth = 45 // mm
        const logoHeight = 18 // mm (proporción aproximada)
        const xPosition = pdf.internal.pageSize.getWidth() - logoWidth - 10
        const yPosition = pdf.internal.pageSize.getHeight() - logoHeight - 10
        
        // Agregar el logo con opacidad
        pdf.setGState(new pdf.GState({opacity: 0.15}))
        try {
          // Intentar agregar el logo si está disponible
          const logoDataUrl = '/LOGO-KLAW.gif'
          pdf.addImage(logoDataUrl, 'GIF', xPosition, yPosition, logoWidth, logoHeight)
        } catch (e) {
          // Si falla, agregar texto como marca de agua
          pdf.setFontSize(20)
          pdf.setTextColor(200, 200, 200)
          pdf.text('K-LAW', xPosition + 10, yPosition + 10)
        }
        pdf.setGState(new pdf.GState({opacity: 1}))
      }
      
      const imgWidth = 210
      const pageHeight = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      
      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      addWatermark()
      heightLeft -= pageHeight
      
      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        addWatermark()
        heightLeft -= pageHeight
      }
      
      // Guardar PDF
      pdf.save(`${selectedDocumento.nombre.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
      
      // Limpiar
      document.body.removeChild(tempDiv)
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      // Fallback a descarga HTML
      const blob = new Blob([generatedDocument], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedDocumento.nombre.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const documentosFiltrados = selectedCategoria === 'todos' 
    ? documentos 
    : selectedCategoria === 'guardados'
    ? [] // Por ahora vacío, se implementará después
    : documentos.filter(doc => doc.categoria === selectedCategoria)

  const validateForm = () => {
    if (!selectedDocumento) return false
    
    const camposRequeridos = selectedDocumento.campos?.filter(campo => campo.requerido) || []
    for (const campo of camposRequeridos) {
      if (!formData[campo.id] || formData[campo.id].trim() === '') {
        alert(`Por favor complete el campo: ${campo.label}`)
        return false
      }
    }
    return true
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8', position: 'relative' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        
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
      
      {/* Franja dorada superior */}
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
      
      {/* Línea negra */}
      <div style={{ 
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        height: '1.5px', 
        backgroundColor: '#1C1C1C',
        zIndex: 1
      }} />
      
      {/* Subtle pattern overlay */}
      <div style={{
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1C1C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Logo K-LAW en la parte izquierda */}
      <div style={{ 
        position: 'absolute',
        top: '-43px',
        left: '20px',
        zIndex: 15
      }}>
        <Link href="/">
          <img 
            src="/LOGO-KLAW.gif" 
            alt="K-LAW Logo" 
            style={{ 
              display: 'block',
              width: 'auto',
              height: 'auto',
              maxWidth: '599px',
              maxHeight: '240px',
              cursor: 'pointer'
            }}
          />
        </Link>
      </div>
      
      
      {/* Contenido principal */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '122px' }}>
        
        {/* Nav minimalista */}
        <nav style={{ padding: '1rem 0' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {plan === 'premium' && (
                  <span style={{ 
                    backgroundColor: 'transparent', 
                    color: '#1C1C1C', 
                    fontWeight: '500', 
                    fontSize: '0.875rem', 
                    fontFamily: 'Inter, sans-serif',
                    border: '1.5px solid #C5A770',
                    padding: '6px 16px',
                    borderRadius: '20px'
                  }}>
                    Premium
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/configuracion')}
                  className="text-sm px-4 py-2"
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: '#1C1C1C', 
                    border: '1.5px solid #C5A770',
                    borderRadius: '6px', 
                    transition: 'all 0.3s ease', 
                    cursor: 'pointer', 
                    fontFamily: 'Inter, sans-serif' 
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = '#C5A770'; 
                    e.currentTarget.style.color = '#1C1C1C'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = 'transparent'; 
                    e.currentTarget.style.color = '#1C1C1C'; 
                  }}
                >
                  ⚙️ Configuración
                </button>
                <Link 
                  href="/calculadoras" 
                  className="text-sm px-4 py-2" 
                  style={{ 
                    backgroundColor: '#1C1C1C', 
                    color: '#FFFFFF', 
                    borderRadius: '6px', 
                    transition: 'all 0.3s ease', 
                    cursor: 'pointer', 
                    fontFamily: 'Inter, sans-serif' 
                  }} 
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = '#C5A770'; 
                    e.currentTarget.style.color = '#1C1C1C'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                    e.currentTarget.style.color = '#FFFFFF'; 
                  }}
                >
                  Volver
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontWeight: '800', 
            color: '#1C1C1C',
            letterSpacing: '-0.02em'
          }}>
            Generador de Documentos Legales
          </h1>
          <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem' }}>
            Crea documentos legales profesionales con tecnología IA
          </p>
        </div>

        {/* Mensaje de En Desarrollo */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
                <span className="text-3xl">🚧</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#1C1C1C'
            }}>
              Módulo en Desarrollo
            </h2>
            <p className="text-gray-600 mb-8" style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Estamos trabajando en el generador de documentos legales con tecnología IA para brindarte la mejor experiencia. 
              Esta funcionalidad estará disponible próximamente.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg" style={{
              backgroundColor: '#F8F4E8',
              border: '1.5px solid #C5A770'
            }}>
              <span className="text-sm" style={{ color: '#8B6914' }}>⏱️</span>
              <span className="font-medium" style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#8B6914'
              }}>
                Disponible próximamente
              </span>
            </div>
          </div>
        </div>

        {/* Modal de formulario */}
        {showFormModal && selectedDocumento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {selectedDocumento.nombre}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* Sección de Legal Design - Ahora disponible para TODOS los documentos */}
                <div className="mb-6">
                  <div className="p-6 rounded-xl border-2 transition-all duration-300"
                    style={{ 
                      borderColor: legalDesignMode ? '#C5A770' : '#E5E7EB',
                      backgroundColor: legalDesignMode ? 'linear-gradient(135deg, #FFF9F0, #F8F4E8)' : 'white',
                      boxShadow: legalDesignMode ? '0 8px 25px rgba(197, 167, 112, 0.15)' : '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                  >
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalDesignMode}
                        onChange={(e) => setLegalDesignMode(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                        legalDesignMode ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${
                          legalDesignMode ? 'translate-x-8' : 'translate-x-0'
                        }`}>
                          <div className="w-full h-full flex items-center justify-center">
                            {legalDesignMode ? (
                              <span className="text-yellow-600 text-xs">✨</span>
                            ) : (
                              <span className="text-gray-400 text-xs">○</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">🎨</span>
                          <h3 className="text-xl font-bold" style={{ color: legalDesignMode ? '#C5A770' : '#1C1C1C' }}>
                            Legal Design
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            legalDesignMode ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {legalDesignMode ? 'ACTIVADO' : 'DESACTIVADO'}
                          </span>
                        </div>
                        <p className="text-base" style={{ 
                          color: legalDesignMode ? '#8B6914' : '#4B5563',
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          Documento con diseño visual moderno, tipografía mejorada y elementos gráficos que 
                          facilitan la comprensión y lectura del contenido legal.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            legalDesignMode ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            📊 Gráficos explicativos
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            legalDesignMode ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            🎯 Navegación clara
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            legalDesignMode ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            ✨ Diseño profesional
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {selectedDocumento.nombre === 'Contrato de Servicios Profesionales' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Generación con IA de Última Generación</h3>
                        <p className="text-sm text-gray-700">
                          Este contrato se genera usando GPT-4o, el modelo más avanzado de OpenAI, especializado 
                          en derecho contractual mexicano. Se adapta automáticamente a la legislación del estado 
                          seleccionado y crea un documento completamente personalizado según los datos proporcionados.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedDocumento.campos?.map((campo) => (
                    <div key={campo.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {campo.label}
                        {campo.requerido && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {campo.tipo === 'select' ? (
                        <select
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required={campo.requerido}
                        >
                          <option value="">Seleccionar...</option>
                          {campo.opciones?.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      ) : campo.tipo === 'textarea' ? (
                        <textarea
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          placeholder={campo.placeholder}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required={campo.requerido}
                        />
                      ) : (
                        <input
                          type={campo.tipo}
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          placeholder={campo.placeholder}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          required={campo.requerido}
                        />
                      )}
                      
                      {campo.ayuda && (
                        <p className="text-xs text-gray-500 mt-1">{campo.ayuda}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleGenerateDocument}
                    disabled={generatingDocument}
                    className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#C5A770',
                      color: '#1C1C1C'
                    }}
                  >
                    {generatingDocument ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Generando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>✨</span>
                        Generar con IA
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de vista previa */}
        {showPreview && generatedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Vista Previa del Documento
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: editMode ? '#C5A770' : 'transparent',
                      color: editMode ? 'white' : '#C5A770',
                      border: '2px solid #C5A770'
                    }}
                  >
                    {editMode ? '👁️ Vista' : '✏️ Editar'}
                  </button>
                  <button
                    onClick={handleDownloadDocument}
                    className="px-6 py-2 text-white font-medium rounded-lg transition-all"
                    style={{ backgroundColor: '#C5A770' }}
                  >
                    📥 Descargar PDF
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {editMode ? (
                  <textarea
                    value={generatedDocument}
                    onChange={(e) => setGeneratedDocument(e.target.value)}
                    className="w-full h-full p-4 border border-gray-300 rounded-lg font-mono text-sm"
                    style={{ minHeight: '600px' }}
                  />
                ) : (
                  <div
                    className="bg-white rounded-lg shadow-sm p-8"
                    dangerouslySetInnerHTML={{ __html: generatedDocument }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de actualización */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">👑</div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Función Premium
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta funcionalidad está disponible solo para usuarios Premium. 
                  Actualiza tu plan para acceder a todas las herramientas avanzadas.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/planes')}
                    className="flex-1 py-3 text-white font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#C5A770' }}
                  >
                    Ver Planes
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}