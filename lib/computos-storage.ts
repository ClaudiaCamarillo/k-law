export interface ComputoGuardado {
  id: string
  tipo: string // 'amparo-directo' | 'amparo-indirecto' | etc.
  nombre: string
  fechaCreacion: string
  fechaNotificacion: string
  fechaVencimiento: string
  diasHabiles: number
  datos: {
    fechaNotificacion: string
    notificoAutoridad: boolean
    tieneReposicion?: boolean
    esAdministrativo?: boolean
    [key: string]: any
  }
}

const STORAGE_KEY = 'klaw-computos-guardados'
const MAX_COMPUTOS_LITIGANTE = 25
const MAX_COMPUTOS_FREE = 5

export const computosStorage = {
  // Obtener todos los cómputos guardados
  obtenerTodos: (): ComputoGuardado[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // Guardar un nuevo cómputo
  guardar: (computo: Omit<ComputoGuardado, 'id' | 'fechaCreacion'>): boolean => {
    if (typeof window === 'undefined') return false
    
    const tipoUsuario = localStorage.getItem('tipoUsuario')
    const plan = localStorage.getItem('userPlan') || 'free'
    const computos = computosStorage.obtenerTodos()
    
    // Verificar límites
    const limite = tipoUsuario === 'litigante' ? MAX_COMPUTOS_LITIGANTE : 
                   plan === 'premium' ? 999 : MAX_COMPUTOS_FREE
    
    if (computos.length >= limite) {
      alert(`Has alcanzado el límite de ${limite} cómputos guardados.`)
      return false
    }
    
    const nuevoComputo: ComputoGuardado = {
      ...computo,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString()
    }
    
    computos.push(nuevoComputo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(computos))
    return true
  },

  // Eliminar un cómputo
  eliminar: (id: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const computos = computosStorage.obtenerTodos()
    const nuevosComputos = computos.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosComputos))
    return true
  },

  // Actualizar un cómputo existente
  actualizar: (id: string, datosActualizados: Partial<ComputoGuardado>): boolean => {
    if (typeof window === 'undefined') return false
    
    const computos = computosStorage.obtenerTodos()
    const index = computos.findIndex(c => c.id === id)
    
    if (index === -1) return false
    
    computos[index] = {
      ...computos[index],
      ...datosActualizados,
      id: computos[index].id,
      fechaCreacion: computos[index].fechaCreacion
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(computos))
    return true
  },

  // Obtener cantidad de cómputos guardados
  obtenerCantidad: (): number => {
    return computosStorage.obtenerTodos().length
  },

  // Obtener límite según tipo de usuario
  obtenerLimite: (): number => {
    if (typeof window === 'undefined') return 0
    
    const tipoUsuario = localStorage.getItem('tipoUsuario')
    const plan = localStorage.getItem('userPlan') || 'free'
    
    if (tipoUsuario === 'litigante') return MAX_COMPUTOS_LITIGANTE
    if (plan === 'premium') return 999
    return MAX_COMPUTOS_FREE
  },

  // Verificar si puede guardar más cómputos
  puedeGuardarMas: (): boolean => {
    const cantidad = computosStorage.obtenerCantidad()
    const limite = computosStorage.obtenerLimite()
    return cantidad < limite
  },

  // Buscar cómputos por tipo
  buscarPorTipo: (tipo: string): ComputoGuardado[] => {
    const computos = computosStorage.obtenerTodos()
    return computos.filter(c => c.tipo === tipo)
  },

  // Buscar cómputos por nombre
  buscarPorNombre: (nombre: string): ComputoGuardado[] => {
    const computos = computosStorage.obtenerTodos()
    return computos.filter(c => 
      c.nombre.toLowerCase().includes(nombre.toLowerCase())
    )
  }
}