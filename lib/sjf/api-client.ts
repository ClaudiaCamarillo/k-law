import { 
  Tesis, 
  BusquedaParams, 
  ResultadoBusqueda, 
  ErrorSJF,
  Materia,
  Epoca 
} from './types'

/**
 * Cliente para la API del Bicentenario de la SCJN
 * URL Base: https://bicentenario.scjn.gob.mx
 * 
 * Nota: Esta implementación está basada en la estructura típica de APIs de la SCJN.
 * Los endpoints específicos pueden requerir ajustes según la documentación oficial.
 */
class SJFApiClient {
  private baseUrl = 'https://bicentenario.scjn.gob.mx/api'
  private timeout = 10000

  /**
   * Método para obtener información de la API disponible
   * Útil para verificar endpoints y estructura
   */
  async obtenerInfoAPI(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/info`)
      return response.ok ? await response.json() : null
    } catch (error) {
      console.warn('No se pudo obtener información de la API:', error)
      return null
    }
  }

  async buscar_tesis(
    texto: string, 
    materia: Materia = 'amparo', 
    tipo: 'jurisprudencia' | 'aislada' | 'todas' = 'jurisprudencia'
  ): Promise<ResultadoBusqueda> {
    try {
      const params = new URLSearchParams({
        texto: texto,
        materia,
        ...(tipo !== 'todas' && { tipo }),
        formato: 'json',
        limite: '20'
      })

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/tesis/buscar?${params}`
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformarRespuesta(data)
    } catch (error) {
      throw this.manejarError(error)
    }
  }

  async obtener_tesis_por_id(registro_digital: string): Promise<Tesis> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/tesis/${registro_digital}`
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformarTesis(data)
    } catch (error) {
      throw this.manejarError(error)
    }
  }

  async buscar_por_epoca(epoca: Epoca, año?: string): Promise<ResultadoBusqueda> {
    try {
      const params = new URLSearchParams({
        epoca,
        ...(año && { anio: año }),
        formato: 'json',
        limite: '20'
      })

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/tesis/epoca?${params}`
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformarRespuesta(data)
    } catch (error) {
      throw this.manejarError(error)
    }
  }

  async buscar_precedentes_relacionados(num_expediente: string): Promise<Tesis[]> {
    try {
      const params = new URLSearchParams({
        expediente: num_expediente,
        formato: 'json'
      })

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/precedentes/buscar?${params}`
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((item: any) => this.transformarTesis(item))
    } catch (error) {
      throw this.manejarError(error)
    }
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private transformarRespuesta(data: any): ResultadoBusqueda {
    return {
      tesis: data.resultados?.map((item: any) => this.transformarTesis(item)) || [],
      total: data.total || 0,
      pagina: data.pagina || 1,
      total_paginas: Math.ceil((data.total || 0) / (data.limite || 10))
    }
  }

  private transformarTesis(data: any): Tesis {
    return {
      id: data.id || data.registro_digital,
      registro_digital: data.registro_digital || data.id,
      rubro: data.rubro || data.titulo || '',
      texto: data.texto || data.contenido || '',
      tipo: data.tipo === 'Jurisprudencia' ? 'jurisprudencia' : 'aislada',
      epoca: data.epoca || '',
      materia: data.materia?.toLowerCase() || 'amparo',
      fuente: data.fuente || '',
      numero_tesis: data.numero_tesis,
      precedentes: data.precedentes?.map((p: any) => ({
        numero_expediente: p.expediente || p.numero_expediente,
        fecha: p.fecha,
        descripcion: p.descripcion || p.asunto
      })) || [],
      fecha_publicacion: data.fecha_publicacion,
      sala: data.sala,
      instancia: data.instancia
    }
  }

  private manejarError(error: any): ErrorSJF {
    if (error.name === 'AbortError') {
      return {
        codigo: 'TIMEOUT',
        mensaje: 'La consulta tardó demasiado tiempo',
        detalles: 'Intente nuevamente o verifique su conexión'
      }
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        codigo: 'NETWORK_ERROR',
        mensaje: 'Error de conexión',
        detalles: 'Verifique su conexión a internet'
      }
    }

    return {
      codigo: 'API_ERROR',
      mensaje: error.message || 'Error desconocido',
      detalles: error.stack
    }
  }
}

export const sjfClient = new SJFApiClient()
export default SJFApiClient