/**
 * Sistema de logs para debugging de la API
 */

export type LogType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEBUG'

export interface LogEntry {
  id: string
  timestamp: string
  tipo: LogType
  mensaje: string
  data?: any
  url?: string
  metodo?: string
  status?: number
  duracion?: number
}

export class APILogger {
  private static maxLogs = 200
  private static storageKey = 'k-law-api-logs'

  /**
   * Registra un log
   */
  static log(tipo: LogType, mensaje: string, data: any = null, metaData: Partial<LogEntry> = {}): void {
    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp,
      tipo,
      mensaje,
      data,
      ...metaData
    }

    // Log en consola con colores
    this.logToConsole(logEntry)

    // Guardar en localStorage
    this.saveToStorage(logEntry)

    // Si es un error crítico, también lo mostramos en la UI (opcional)
    if (tipo === 'ERROR') {
      this.notifyError(logEntry)
    }
  }

  /**
   * Log específico para requests HTTP
   */
  static logRequest(url: string, metodo: string = 'GET', data?: any): string {
    const requestId = this.generateId()
    this.log('INFO', `Request iniciado: ${metodo} ${url}`, data, {
      url,
      metodo,
      id: requestId
    })
    return requestId
  }

  /**
   * Log específico para responses HTTP
   */
  static logResponse(requestId: string, status: number, data?: any, duracion?: number): void {
    const tipo: LogType = status >= 200 && status < 300 ? 'SUCCESS' : 
                         status >= 400 ? 'ERROR' : 'WARNING'
    
    this.log(tipo, `Response recibido: ${status}`, data, {
      status,
      duracion,
      id: requestId
    })
  }

  /**
   * Log para errores de red
   */
  static logNetworkError(url: string, error: Error): void {
    this.log('ERROR', `Error de red: ${url}`, {
      error: error.message,
      stack: error.stack,
      url
    })
  }

  /**
   * Obtener todos los logs
   */
  static getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.storageKey)
      return logs ? JSON.parse(logs) : []
    } catch (error) {
      console.warn('Error obteniendo logs:', error)
      return []
    }
  }

  /**
   * Obtener logs filtrados
   */
  static getFilteredLogs(filtros: {
    tipo?: LogType
    desde?: Date
    hasta?: Date
    url?: string
  }): LogEntry[] {
    const logs = this.getLogs()
    
    return logs.filter(log => {
      if (filtros.tipo && log.tipo !== filtros.tipo) return false
      if (filtros.desde && new Date(log.timestamp) < filtros.desde) return false
      if (filtros.hasta && new Date(log.timestamp) > filtros.hasta) return false
      if (filtros.url && log.url && !log.url.includes(filtros.url)) return false
      return true
    })
  }

  /**
   * Limpiar logs antiguos
   */
  static clearOldLogs(diasAntiguedad: number = 7): void {
    const logs = this.getLogs()
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad)

    const logsRecientes = logs.filter(log => 
      new Date(log.timestamp) > fechaLimite
    )

    localStorage.setItem(this.storageKey, JSON.stringify(logsRecientes))
    this.log('INFO', `Logs limpiados: ${logs.length - logsRecientes.length} entradas eliminadas`)
  }

  /**
   * Exportar logs como JSON
   */
  static exportLogs(): string {
    const logs = this.getLogs()
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalLogs: logs.length,
      logs
    }, null, 2)
  }

  /**
   * Generar reporte de errores
   */
  static generateErrorReport(): string {
    const errores = this.getFilteredLogs({ tipo: 'ERROR' })
    
    const reporte = {
      fecha: new Date().toISOString(),
      totalErrores: errores.length,
      erroresPorURL: this.groupBy(errores, 'url'),
      erroresRecientes: errores.slice(-10),
      estadisticas: this.getErrorStats(errores)
    }

    return JSON.stringify(reporte, null, 2)
  }

  /**
   * Obtener estadísticas de API
   */
  static getAPIStats(): any {
    const logs = this.getLogs()
    const requests = logs.filter(log => log.url)

    return {
      totalRequests: requests.length,
      exitosos: logs.filter(log => log.tipo === 'SUCCESS').length,
      errores: logs.filter(log => log.tipo === 'ERROR').length,
      warnings: logs.filter(log => log.tipo === 'WARNING').length,
      promedioRespuesta: this.calcularPromedioRespuesta(requests),
      urlsMasFrecuentes: this.getTopURLs(requests),
      erroresMasComunes: this.getTopErrors(logs.filter(log => log.tipo === 'ERROR'))
    }
  }

  // Métodos privados
  private static logToConsole(logEntry: LogEntry): void {
    const colors = {
      INFO: 'color: #2196F3',
      SUCCESS: 'color: #4CAF50',
      WARNING: 'color: #FF9800',
      ERROR: 'color: #F44336',
      DEBUG: 'color: #9C27B0'
    }

    const style = colors[logEntry.tipo] || 'color: #000'
    
    console.log(
      `%c[${logEntry.tipo}] ${logEntry.timestamp}: ${logEntry.mensaje}`,
      style,
      logEntry.data
    )
  }

  private static saveToStorage(logEntry: LogEntry): void {
    try {
      const logs = this.getLogs()
      logs.push(logEntry)

      // Mantener solo los últimos N logs
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs))
    } catch (error) {
      console.warn('Error guardando log:', error)
    }
  }

  private static notifyError(logEntry: LogEntry): void {
    // Opcional: mostrar notificación en la UI
    // Por ahora solo agregamos a una cola de errores críticos
    try {
      const erroresCriticos = JSON.parse(localStorage.getItem('k-law-errores-criticos') || '[]')
      erroresCriticos.push({
        ...logEntry,
        mostrado: false
      })
      localStorage.setItem('k-law-errores-criticos', JSON.stringify(erroresCriticos.slice(-10)))
    } catch (error) {
      console.warn('Error guardando error crítico:', error)
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private static groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const group = item[key] || 'unknown'
      acc[group] = (acc[group] || 0) + 1
      return acc
    }, {})
  }

  private static getErrorStats(errores: LogEntry[]): any {
    const hoy = new Date()
    const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000)
    
    return {
      erroresHoy: errores.filter(log => new Date(log.timestamp) >= ayer).length,
      erroresUltimaHora: errores.filter(log => 
        new Date(log.timestamp) >= new Date(hoy.getTime() - 60 * 60 * 1000)
      ).length
    }
  }

  private static calcularPromedioRespuesta(requests: LogEntry[]): number {
    const conDuracion = requests.filter(log => log.duracion)
    if (conDuracion.length === 0) return 0
    
    const suma = conDuracion.reduce((acc, log) => acc + (log.duracion || 0), 0)
    return Math.round(suma / conDuracion.length)
  }

  private static getTopURLs(requests: LogEntry[], limit: number = 5): Array<{url: string, count: number}> {
    const urlCounts = this.groupBy(requests, 'url')
    return Object.entries(urlCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([url, count]) => ({ url, count }))
  }

  private static getTopErrors(errores: LogEntry[], limit: number = 5): Array<{mensaje: string, count: number}> {
    const errorCounts = this.groupBy(errores, 'mensaje')
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([mensaje, count]) => ({ mensaje, count }))
  }
}

// Funciones de conveniencia para uso fácil
export const logInfo = (mensaje: string, data?: any) => APILogger.log('INFO', mensaje, data)
export const logSuccess = (mensaje: string, data?: any) => APILogger.log('SUCCESS', mensaje, data)
export const logWarning = (mensaje: string, data?: any) => APILogger.log('WARNING', mensaje, data)
export const logError = (mensaje: string, data?: any) => APILogger.log('ERROR', mensaje, data)
export const logDebug = (mensaje: string, data?: any) => APILogger.log('DEBUG', mensaje, data)

export default APILogger