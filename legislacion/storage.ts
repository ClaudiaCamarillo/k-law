import { Ley } from './tipos-legislacion'
import { leyesFederales as leyesDefault } from './datos-legislacion'

const STORAGE_KEY = 'legislacion_data'

export function guardarLeyEnStorage(leyActualizada: Ley): void {
  // Obtener todas las leyes del storage o usar las default
  const leyesActuales = obtenerLeyesDeStorage()
  
  // Actualizar la ley específica
  const index = leyesActuales.findIndex(ley => ley.id === leyActualizada.id)
  if (index !== -1) {
    leyesActuales[index] = leyActualizada
  }
  
  // Guardar en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leyesActuales))
  }
}

export function obtenerLeyesDeStorage(): Ley[] {
  if (typeof window === 'undefined') {
    return leyesDefault
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const leyes = JSON.parse(stored)
      // Mantener las fechas como están (strings o Date)
      return leyes
    }
  } catch (error) {
    console.error('Error al cargar datos del localStorage:', error)
  }
  
  return leyesDefault
}

export function limpiarStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function obtenerLeyPorId(leyId: string): Ley | undefined {
  const leyes = obtenerLeyesDeStorage()
  return leyes.find(ley => ley.id === leyId)
}