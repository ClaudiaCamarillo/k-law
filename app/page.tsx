'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si ya hay un tipo de usuario guardado
    const tipo = localStorage.getItem('tipoUsuario')
    if (tipo) {
      setTipoUsuario(tipo)
    }
  }, [])

  const seleccionarTipoUsuario = (tipo: 'litigante' | 'servidor') => {
    localStorage.setItem('tipoUsuario', tipo)
    router.push('/calculadoras')
  }

  const cambiarTipoUsuario = () => {
    localStorage.removeItem('tipoUsuario')
    setTipoUsuario(null)
  }

  if (tipoUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">LegalCompute Pro</h1>
          <p className="text-xl mb-8">
            Modo: <span className="font-semibold">{tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}</span>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/calculadoras')}
              className="block w-full text-white px-8 py-4 rounded-lg text-lg hover:opacity-90"
              style={{backgroundColor: '#001f3f'}}
            >
              Ir a Calculadoras
            </button>
            <button
              onClick={cambiarTipoUsuario}
              className="block w-full bg-pink-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-pink-300"
            >
              Cambiar tipo de usuario
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom, #fce4ec, #e1f5fe)'}}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{color: '#001f3f'}}>LegalCompute Pro</h1>
          <p className="text-xl text-gray-600">Calculadora de Plazos Jurídicos</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8" style={{borderTop: '4px solid #001f3f'}}>
          <h2 className="text-2xl font-semibold text-center mb-8" style={{color: '#001f3f'}}>¿Quién eres?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <button
              onClick={() => seleccionarTipoUsuario('litigante')}
              className="p-8 border-2 border-gray-200 rounded-lg hover:border-pink-400 hover:shadow-lg transition-all bg-pink-50"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold mb-2 text-navy-900">Litigante</h3>
                <p className="text-gray-600">
                  Abogado postulante, despacho jurídico o representante legal
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  • Incluye días inhábiles por circulares del CJF
                  • Cálculos para presentación de recursos
                  • Formato para escritos judiciales
                </div>
              </div>
            </button>

            <button
              onClick={() => seleccionarTipoUsuario('servidor')}
              className="p-8 border-2 border-gray-200 rounded-lg hover:border-pink-400 hover:shadow-lg transition-all bg-blue-50"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold mb-2 text-navy-900">Servidor Público</h3>
                <p className="text-gray-600">
                  Personal de juzgados, tribunales o dependencias gubernamentales
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  • Incluye días inhábiles por circulares del CJF
                  • Cálculos para resoluciones judiciales
                  • Formato para acuerdos y sentencias
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Esta selección determina qué días inhábiles se considerarán en los cálculos
          </p>
        </div>
      </div>
    </div>
  )
}