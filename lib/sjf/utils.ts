import { Materia, Epoca } from './types'

export const MATERIAS: { value: Materia; label: string }[] = [
  { value: 'amparo', label: 'Amparo' },
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'mercantil', label: 'Mercantil' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'constitucional', label: 'Constitucional' }
]

export const EPOCAS: { value: Epoca; label: string }[] = [
  { value: 'decima', label: 'Décima Época' },
  { value: 'novena', label: 'Novena Época' },
  { value: 'octava', label: 'Octava Época' },
  { value: 'septima', label: 'Séptima Época' },
  { value: 'quinta', label: 'Quinta Época' }
]

export const TIPOS_TESIS = [
  { value: 'todas', label: 'Todas' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'aislada', label: 'Tesis Aislada' }
]

export function validarTextoConsuita(texto: string): { valido: boolean; error?: string } {
  if (!texto || texto.trim().length === 0) {
    return { valido: false, error: 'El texto de búsqueda es requerido' }
  }

  if (texto.trim().length < 3) {
    return { valido: false, error: 'El texto debe tener al menos 3 caracteres' }
  }

  if (texto.length > 500) {
    return { valido: false, error: 'El texto no puede exceder 500 caracteres' }
  }

  return { valido: true }
}

export function formatearFecha(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return fecha
  }
}

export function truncarTexto(texto: string, limite: number = 300): string {
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + '...'
}

export function resaltarTexto(texto: string, termino: string): string {
  if (!termino) return texto
  
  const regex = new RegExp(`(${termino})`, 'gi')
  return texto.replace(regex, '<mark>$1</mark>')
}

export function copiarAlPortapapeles(texto: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto)
        .then(() => resolve(true))
        .catch(() => resolve(false))
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea')
      textArea.value = texto
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        textArea.remove()
        resolve(true)
      } catch {
        textArea.remove()
        resolve(false)
      }
    }
  })
}

export function generarUrlCompartir(tesis: { id: string; rubro: string }): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/jurisprudencia/${tesis.id}`
}

export function obtenerColorMateria(materia: string): string {
  const colores: Record<string, string> = {
    amparo: '#C5A770',
    civil: '#8B9DC3',
    penal: '#DDA0DD',
    administrativo: '#98FB98',
    laboral: '#F0E68C',
    fiscal: '#FFA07A',
    mercantil: '#87CEEB',
    familiar: '#FFB6C1',
    constitucional: '#D2B48C'
  }
  
  return colores[materia.toLowerCase()] || '#C5A770'
}

export function obtenerIconoMateria(materia: string): string {
  const iconos: Record<string, string> = {
    amparo: '⚖️',
    civil: '🏛️',
    penal: '🔒',
    administrativo: '📋',
    laboral: '👷',
    fiscal: '💰',
    mercantil: '💼',
    familiar: '👨‍👩‍👧‍👦',
    constitucional: '📜'
  }
  
  return iconos[materia.toLowerCase()] || '⚖️'
}