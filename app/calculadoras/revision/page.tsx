'use client'

import { useState } from 'react'

export default function CalculadoraRevision() {
  const [fechaNotificacion, setFechaNotificacion] = useState('')
  const [tipoNotificacion, setTipoNotificacion] = useState('personal')
  const [resultado, setResultado] = useState<{
    fechaLimite: string
    diasHabiles: number
    diasTranscurridos?: number
  } | null>(null)

  // Función para calcular días inhábiles
  const calcularDiasInhabiles = (año: number) => {
    const diasInhabiles: string[] = []
    
    // Días fijos
    diasInhabiles.push(
      `${año}-01-01`, // Año Nuevo
      `${año}-05-01`, // Día del Trabajo
      `${año}-09-16`, // Día de la Independencia
      `${año}-12-25`  // Navidad
    )
    
    // Primer lunes de febrero
    const feb = new Date(año, 1, 1)
    while (feb.getDay() !== 1) feb.setDate(feb.getDate() + 1)
    diasInhabiles.push(feb.toISOString().split('T')[0])
    
    // Tercer lunes de marzo
    const mar = new Date(año, 2, 1)
    while (mar.getDay() !== 1) mar.setDate(mar.getDate() + 1)
    mar.setDate(mar.getDate() + 14)
    diasInhabiles.push(mar.toISOString().split('T')[0])
    
    // Tercer lunes de noviembre
    const nov = new Date(año, 10, 1)
    while (nov.getDay() !== 1) nov.setDate(nov.getDate() + 1)
    nov.setDate(nov.getDate() + 14)
    diasInhabiles.push(nov.toISOString().split('T')[0])
    
    // Períodos vacacionales
    for (let dia = 16; dia <= 31; dia++) {
      diasInhabiles.push(`${año}-07-${dia.toString().padStart(2, '0')}`)
      diasInhabiles.push(`${año}-12-${dia.toString().padStart(2, '0')}`)
    }
    
    return diasInhabiles
  }

  // Función para verificar si es día hábil
  const esDiaHabil = (fecha: Date, diasInhabiles: string[]) => {
    const diaSemana = fecha.getDay()
    if (diaSemana === 0 || diaSemana === 6) return false // Sábado o domingo
    
    const fechaStr = fecha.toISOString().split('T')[0]
    return !diasInhabiles.includes(fechaStr)
  }

  // Función para agregar días hábiles
  const agregarDiasHabiles = (fechaInicio: Date, diasHabiles: number) => {
    const fecha = new Date(fechaInicio)
    let diasAgregados = 0
    const año = fecha.getFullYear()
    const añoSiguiente = año + 1
    
    // Obtener días inhábiles del año actual y siguiente
    const diasInhabiles = [
      ...calcularDiasInhabiles(año),
      ...calcularDiasInhabiles(añoSiguiente)
    ]
    
    while (diasAgregados < diasHabiles) {
      fecha.setDate(fecha.getDate() + 1)
      if (esDiaHabil(fecha, diasInhabiles)) {
        diasAgregados++
      }
    }
    
    return fecha
  }

  // Función para calcular el plazo
  const calcularPlazo = () => {
    if (!fechaNotificacion) return
    
    const fecha = new Date(fechaNotificacion)
    const diasPlazo = tipoNotificacion === 'boletin' ? 9 : 10
    
    // Ajustar fecha de inicio según tipo de notificación
    if (tipoNotificacion === 'boletin') {
      fecha.setDate(fecha.getDate() + 1) // Día siguiente para boletín
    }
    
    const fechaLimite = agregarDiasHabiles(fecha, diasPlazo)
    
    // Calcular días transcurridos si ya pasó
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    fechaLimite.setHours(0, 0, 0, 0)
    
    let diasTranscurridos = undefined
    if (hoy > fechaLimite) {
      diasTranscurridos = Math.floor((hoy.getTime() - fechaLimite.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    setResultado({
      fechaLimite: fechaLimite.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      diasHabiles: diasPlazo,
      diasTranscurridos
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Calculadora de Plazo para Revisión
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Notificación
              </label>
              <input
                type="date"
                value={fechaNotificacion}
                onChange={(e) => setFechaNotificacion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Notificación
              </label>
              <select
                value={tipoNotificacion}
                onChange={(e) => setTipoNotificacion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="personal">Personal (10 días)</option>
                <option value="boletin">Por Boletín Judicial (9 días)</option>
              </select>
            </div>
            
            <button
              onClick={calcularPlazo}
              disabled={!fechaNotificacion}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Calcular Plazo
            </button>
          </div>
          
          {resultado && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-lg mb-2">Resultado:</h3>
              <p className="text-gray-700">
                <span className="font-medium">Fecha límite:</span> {resultado.fechaLimite}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Días hábiles:</span> {resultado.diasHabiles}
              </p>
              {resultado.diasTranscurridos !== undefined && (
                <p className="text-red-600 font-medium mt-2">
                  ⚠️ El plazo ha vencido hace {resultado.diasTranscurridos} días
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium mb-1">Nota:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>No se cuentan sábados, domingos ni días festivos</li>
              <li>Para notificaciones por boletín, el plazo comienza al día siguiente</li>
              <li>Se consideran los períodos vacacionales del Poder Judicial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}