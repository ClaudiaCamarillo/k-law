'use client'

import { useState } from 'react'

export function PreguntasActoConcreto({ preguntas, contexto, onRespuestas }) {
  const [respuestas, setRespuestas] = useState({})
  const [cargando, setCargando] = useState(false)

  const handleRespuestaChange = (pregunta, respuesta) => {
    setRespuestas(prev => ({
      ...prev,
      [pregunta]: respuesta
    }))
  }

  const enviarRespuestas = async () => {
    setCargando(true)
    try {
      // Construir información adicional basada en las respuestas
      const infoAdicional = Object.entries(respuestas)
        .map(([pregunta, respuesta]) => `${pregunta}: ${respuesta}`)
        .join('. ')
      
      await onRespuestas(infoAdicional)
    } catch (error) {
      console.error('Error al procesar respuestas:', error)
    } finally {
      setCargando(false)
    }
  }

  const todasRespondidas = preguntas.every(pregunta => respuestas[pregunta]?.trim())

  return (
    <div className="mt-3 k-law-alert-warning">
      <h4 className="font-semibold text-yellow-100 mb-2">
        ⚠️ Información adicional requerida
      </h4>
      <p className="text-sm text-yellow-100 mb-3">{contexto}</p>
      
      <div className="space-y-3">
        {preguntas.map((pregunta, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-yellow-100 mb-1">
              {pregunta}
            </label>
            <input
              type="text"
              value={respuestas[pregunta] || ''}
              onChange={(e) => handleRespuestaChange(pregunta, e.target.value)}
              className="k-law-input"
              placeholder="Escriba su respuesta..."
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={enviarRespuestas}
        disabled={!todasRespondidas || cargando}
        className="mt-3 w-full k-law-button-primary py-2 px-4 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {cargando ? 'Procesando...' : 'Determinar ley con esta información'}
      </button>
    </div>
  )
}