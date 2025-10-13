'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ColorPalette {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
}

interface DesignPreset {
  id: string
  name: string
  description: string
  icon: string
  style: 'conservador' | 'moderno'
}

interface IndustryTemplate {
  id: string
  name: string
  icon: string
  colors: ColorPalette
  designStyle: 'conservador' | 'moderno'
}

export default function ConfiguracionPage() {
  const router = useRouter()
  
  // Estados
  const [selectedPalette, setSelectedPalette] = useState<string>('classic')
  const [designStyle, setDesignStyle] = useState<'conservador' | 'moderno'>('moderno')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general')
  const [showPreview, setShowPreview] = useState(true)
  const [savedMessage, setSavedMessage] = useState('')

  // Paletas de colores predefinidas
  const colorPalettes: ColorPalette[] = [
    {
      id: 'classic',
      name: 'Clásico Legal',
      primary: '#0A1628',
      secondary: '#C9A961',
      accent: '#16a34a',
      background: '#F5F5F5'
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      primary: '#1e3a8a',
      secondary: '#0891b2',
      accent: '#06b6d4',
      background: '#f0f9ff'
    },
    {
      id: 'modern',
      name: 'Moderno',
      primary: '#18181b',
      secondary: '#a855f7',
      accent: '#8b5cf6',
      background: '#fafafa'
    },
    {
      id: 'elegant',
      name: 'Elegante',
      primary: '#1f2937',
      secondary: '#92400e',
      accent: '#b45309',
      background: '#fffbeb'
    },
    {
      id: 'nature',
      name: 'Natural',
      primary: '#14532d',
      secondary: '#059669',
      accent: '#10b981',
      background: '#f0fdf4'
    }
  ]

  // Estilos de diseño
  const designStyles: DesignPreset[] = [
    {
      id: 'conservador',
      name: 'Conservador',
      description: 'Diseño tradicional con estructura formal',
      icon: '🏛️',
      style: 'conservador'
    },
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Diseño contemporáneo con elementos visuales',
      icon: '✨',
      style: 'moderno'
    }
  ]

  // Plantillas por industria
  const industryTemplates: IndustryTemplate[] = [
    {
      id: 'general',
      name: 'General',
      icon: '⚖️',
      colors: colorPalettes[0],
      designStyle: 'moderno'
    },
    {
      id: 'inmobiliaria',
      name: 'Inmobiliaria',
      icon: '🏢',
      colors: {
        id: 'real-estate',
        name: 'Inmobiliaria',
        primary: '#7c2d12',
        secondary: '#ea580c',
        accent: '#f97316',
        background: '#fff7ed'
      },
      designStyle: 'moderno'
    },
    {
      id: 'tech',
      name: 'Tecnología',
      icon: '💻',
      colors: {
        id: 'tech',
        name: 'Tech',
        primary: '#1e1b4b',
        secondary: '#4c1d95',
        accent: '#7c3aed',
        background: '#faf5ff'
      },
      designStyle: 'moderno'
    },
    {
      id: 'servicios',
      name: 'Servicios',
      icon: '💼',
      colors: {
        id: 'services',
        name: 'Servicios',
        primary: '#1e3a8a',
        secondary: '#2563eb',
        accent: '#3b82f6',
        background: '#eff6ff'
      },
      designStyle: 'conservador'
    },
    {
      id: 'salud',
      name: 'Salud',
      icon: '🏥',
      colors: {
        id: 'health',
        name: 'Salud',
        primary: '#064e3b',
        secondary: '#047857',
        accent: '#10b981',
        background: '#f0fdf4'
      },
      designStyle: 'conservador'
    }
  ]

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('klaw-config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setSelectedPalette(config.palette || 'classic')
      setDesignStyle(config.designStyle || 'moderno')
      setSelectedIndustry(config.industry || 'general')
    }
  }, [])

  // Guardar configuración
  const saveConfiguration = () => {
    const config = {
      palette: selectedPalette,
      designStyle: designStyle,
      industry: selectedIndustry,
      colors: selectedPalette === 'custom' 
        ? industryTemplates.find(t => t.id === selectedIndustry)?.colors 
        : colorPalettes.find(p => p.id === selectedPalette)
    }
    
    localStorage.setItem('klaw-config', JSON.stringify(config))
    setSavedMessage('✅ Configuración guardada exitosamente')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  // Aplicar plantilla de industria
  const applyIndustryTemplate = (templateId: string) => {
    const template = industryTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedIndustry(templateId)
      setSelectedPalette('custom')
      setDesignStyle(template.designStyle)
    }
  }

  // Obtener colores actuales
  const getCurrentColors = () => {
    if (selectedIndustry !== 'general' && selectedPalette === 'custom') {
      return industryTemplates.find(t => t.id === selectedIndustry)?.colors || colorPalettes[0]
    }
    return colorPalettes.find(p => p.id === selectedPalette) || colorPalettes[0]
  }

  const currentColors = getCurrentColors()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Configuración de Documentos
              </h1>
            </div>
            <button
              onClick={saveConfiguration}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>💾</span>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Configuración */}
          <div className="space-y-8">
            {/* Selector de Paleta de Colores */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎨</span> Paleta de Colores
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setSelectedPalette(palette.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPalette === palette.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium mb-2">{palette.name}</div>
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full shadow-sm" 
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full shadow-sm" 
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full shadow-sm" 
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo de Legal Design */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📐</span> Estilo de Legal Design
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {designStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setDesignStyle(style.style)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      designStyle === style.style 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{style.icon}</div>
                    <div className="font-medium mb-1">{style.name}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plantillas por Industria */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏭</span> Plantillas por Industria
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {industryTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyIndustryTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      selectedIndustry === template.id && selectedPalette === 'custom'
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <span className="font-medium">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>👁️</span> Vista Previa en Tiempo Real
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPreview ? '🔽' : '▶️'}
                </button>
              </div>
              
              {showPreview && (
                <div className="p-6">
                  {/* Preview del documento con estilos aplicados */}
                  <div 
                    className="border rounded-lg p-6 space-y-4"
                    style={{ borderColor: currentColors.secondary }}
                  >
                    {/* Header del documento */}
                    <div 
                      className="text-white p-4 rounded-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primary}dd 100%)`
                      }}
                    >
                      <div className="text-xs opacity-80 mb-1">DOCUMENTO LEGAL</div>
                      <h4 className="text-lg font-bold">CONTRATO DE EJEMPLO</h4>
                      <div className="text-sm mt-2">📅 Vista previa del diseño</div>
                    </div>

                    {/* Contenido de ejemplo */}
                    {designStyle === 'moderno' ? (
                      <>
                        {/* Diseño Moderno */}
                        <div className="space-y-3">
                          <div 
                            className="p-4 rounded-lg flex items-center gap-3"
                            style={{ backgroundColor: `${currentColors.background}` }}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: currentColors.secondary }}
                            >
                              📋
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: currentColors.primary }}>
                                CLÁUSULA PRIMERA
                              </div>
                              <div className="text-sm text-gray-600">Objeto del contrato</div>
                            </div>
                          </div>

                          <div 
                            className="border-2 rounded-lg p-4"
                            style={{ borderColor: currentColors.accent }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span style={{ color: currentColors.accent }}>💰</span>
                              <span className="font-semibold">Inversión Mensual</span>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: currentColors.primary }}>
                              $15,000 MXN
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <div 
                              className="px-3 py-1 rounded-full text-sm"
                              style={{ 
                                backgroundColor: `${currentColors.accent}20`,
                                color: currentColors.accent 
                              }}
                            >
                              ✓ Vigente
                            </div>
                            <div 
                              className="px-3 py-1 rounded-full text-sm"
                              style={{ 
                                backgroundColor: `${currentColors.secondary}20`,
                                color: currentColors.secondary 
                              }}
                            >
                              📅 12 meses
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Diseño Conservador */}
                        <div className="space-y-4">
                          <div>
                            <h5 
                              className="font-bold mb-2"
                              style={{ color: currentColors.primary }}
                            >
                              PRIMERA.- OBJETO
                            </h5>
                            <p className="text-sm text-gray-700 text-justify">
                              El presente contrato tiene por objeto establecer los términos
                              y condiciones bajo los cuales se regirá la relación contractual
                              entre las partes.
                            </p>
                          </div>

                          <div>
                            <h5 
                              className="font-bold mb-2"
                              style={{ color: currentColors.primary }}
                            >
                              SEGUNDA.- MONTO
                            </h5>
                            <p className="text-sm text-gray-700">
                              La cantidad acordada es de <strong>$15,000.00</strong> 
                              (QUINCE MIL PESOS 00/100 M.N.) mensuales.
                            </p>
                          </div>

                          <div 
                            className="border-t-2 pt-4 mt-6"
                            style={{ borderColor: currentColors.secondary }}
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="border-b-2 border-gray-400 mb-2"></div>
                                <div className="text-sm font-semibold">ARRENDADOR</div>
                              </div>
                              <div className="text-center">
                                <div className="border-b-2 border-gray-400 mb-2"></div>
                                <div className="text-sm font-semibold">ARRENDATARIO</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Información de colores */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-3 text-sm">Colores Aplicados:</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: currentColors.primary }}
                        />
                        <span>Primario: {currentColors.primary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: currentColors.secondary }}
                        />
                        <span>Secundario: {currentColors.secondary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: currentColors.accent }}
                        />
                        <span>Acento: {currentColors.accent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: currentColors.background }}
                        />
                        <span>Fondo: {currentColors.background}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de guardado */}
        {savedMessage && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            {savedMessage}
          </div>
        )}
      </div>
    </div>
  )
}