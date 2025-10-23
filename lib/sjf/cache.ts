import { CacheEntry, ResultadoBusqueda } from './types'

class SJFCache {
  private cacheKey = 'k-law-sjf-cache'
  private maxEntries = 50
  private maxAge = 1000 * 60 * 30 // 30 minutos

  guardar(query: string, data: ResultadoBusqueda): void {
    try {
      const cache = this.obtenerCache()
      const cacheEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
        query: query.toLowerCase()
      }

      // Agregar nueva entrada
      cache[query.toLowerCase()] = cacheEntry

      // Limpiar entradas viejas si excede el límite
      const entries = Object.entries(cache)
      if (entries.length > this.maxEntries) {
        const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
        const newCache: Record<string, CacheEntry> = {}
        
        sorted.slice(0, this.maxEntries).forEach(([key, value]) => {
          newCache[key] = value
        })
        
        localStorage.setItem(this.cacheKey, JSON.stringify(newCache))
      } else {
        localStorage.setItem(this.cacheKey, JSON.stringify(cache))
      }
    } catch (error) {
      console.warn('Error guardando en cache:', error)
    }
  }

  obtener(query: string): ResultadoBusqueda | null {
    try {
      const cache = this.obtenerCache()
      const entry = cache[query.toLowerCase()]

      if (!entry) return null

      // Verificar si la entrada no ha expirado
      if (Date.now() - entry.timestamp > this.maxAge) {
        this.eliminar(query)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Error obteniendo del cache:', error)
      return null
    }
  }

  eliminar(query: string): void {
    try {
      const cache = this.obtenerCache()
      delete cache[query.toLowerCase()]
      localStorage.setItem(this.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.warn('Error eliminando del cache:', error)
    }
  }

  limpiar(): void {
    try {
      localStorage.removeItem(this.cacheKey)
    } catch (error) {
      console.warn('Error limpiando cache:', error)
    }
  }

  obtenerUltimasBusquedas(limite: number = 10): string[] {
    try {
      const cache = this.obtenerCache()
      const entries = Object.values(cache)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limite)
        .map(entry => entry.query)
      
      return entries
    } catch (error) {
      console.warn('Error obteniendo últimas búsquedas:', error)
      return []
    }
  }

  private obtenerCache(): Record<string, CacheEntry> {
    try {
      const cached = localStorage.getItem(this.cacheKey)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.warn('Error parseando cache:', error)
      return {}
    }
  }

  // Limpiar entradas expiradas
  limpiarExpiradas(): void {
    try {
      const cache = this.obtenerCache()
      const now = Date.now()
      const newCache: Record<string, CacheEntry> = {}

      Object.entries(cache).forEach(([key, entry]) => {
        if (now - entry.timestamp <= this.maxAge) {
          newCache[key] = entry
        }
      })

      localStorage.setItem(this.cacheKey, JSON.stringify(newCache))
    } catch (error) {
      console.warn('Error limpiando entradas expiradas:', error)
    }
  }
}

export const sjfCache = new SJFCache()
export default SJFCache