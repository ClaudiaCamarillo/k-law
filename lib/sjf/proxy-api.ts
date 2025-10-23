/**
 * Cliente proxy para evitar problemas de CORS
 */

export class ProxyAPI {
  private proxies = [
    {
      name: 'AllOrigins',
      url: 'https://api.allorigins.win/get?url=',
      transform: (data: any) => {
        try {
          return JSON.parse(data.contents)
        } catch {
          return data.contents
        }
      }
    },
    {
      name: 'CORS Anywhere',
      url: 'https://cors-anywhere.herokuapp.com/',
      transform: (data: any) => data
    },
    {
      name: 'CORS Proxy',
      url: 'https://corsproxy.io/?',
      transform: (data: any) => data
    },
    {
      name: 'Proxy Server',
      url: 'https://api.codetabs.com/v1/proxy?quest=',
      transform: (data: any) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data
        } catch {
          return data
        }
      }
    }
  ]

  private timeout = 10000

  /**
   * Realiza fetch usando proxies para evitar CORS
   */
  async fetchConProxy(url: string, options: RequestInit = {}): Promise<any> {
    console.log(`🌐 Intentando fetch con proxy: ${url}`)
    
    const errores: Array<{proxy: string, error: string}> = []

    for (const proxy of this.proxies) {
      try {
        console.log(`🔄 Probando proxy: ${proxy.name}`)
        
        const proxyUrl = proxy.url + encodeURIComponent(url)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(proxyUrl, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'K-LAW/1.0',
            ...options.headers
          }
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const transformedData = proxy.transform(data)
          
          console.log(`✅ Proxy ${proxy.name} exitoso`)
          return {
            success: true,
            data: transformedData,
            proxy: proxy.name,
            originalUrl: url,
            proxyUrl
          }
        } else {
          const error = `HTTP ${response.status}: ${response.statusText}`
          errores.push({ proxy: proxy.name, error })
          console.log(`❌ Proxy ${proxy.name} falló: ${error}`)
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
        errores.push({ proxy: proxy.name, error: errorMsg })
        console.log(`💥 Proxy ${proxy.name} excepción: ${errorMsg}`)
      }
    }

    // Si todos los proxies fallaron
    throw new Error(`Todos los proxies fallaron: ${JSON.stringify(errores)}`)
  }

  /**
   * Busca tesis usando múltiples estrategias de proxy
   */
  async buscarTesisConProxy(termino: string): Promise<any> {
    const endpointsAProbar = [
      `https://bicentenario.scjn.gob.mx/api/tesis?q=${encodeURIComponent(termino)}`,
      `https://bicentenario.scjn.gob.mx/api/buscar?texto=${encodeURIComponent(termino)}`,
      `https://bicentenario.scjn.gob.mx/api/jurisprudencia/buscar?consulta=${encodeURIComponent(termino)}`,
      `https://bicentenario.scjn.gob.mx/datos/api/tesis?busqueda=${encodeURIComponent(termino)}`,
      `https://sjf2.scjn.gob.mx/api/busqueda?q=${encodeURIComponent(termino)}`
    ]

    const resultados = []

    for (const endpoint of endpointsAProbar) {
      try {
        console.log(`🔍 Probando endpoint: ${endpoint}`)
        const resultado = await this.fetchConProxy(endpoint)
        
        if (resultado.success && resultado.data) {
          resultados.push({
            endpoint,
            resultado: resultado.data,
            proxy: resultado.proxy
          })
          
          console.log(`✅ Datos encontrados en: ${endpoint}`)
          
          // Si encontramos datos válidos, podemos retornar inmediatamente
          if (this.validarDatosTesis(resultado.data)) {
            return {
              success: true,
              data: resultado.data,
              source: endpoint,
              proxy: resultado.proxy
            }
          }
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} falló:`, error)
      }
    }

    if (resultados.length > 0) {
      return {
        success: true,
        data: resultados,
        message: `${resultados.length} endpoints respondieron pero no con formato esperado`
      }
    }

    throw new Error('Ningún endpoint respondió con datos válidos')
  }

  /**
   * Valida si los datos recibidos parecen ser tesis
   */
  private validarDatosTesis(data: any): boolean {
    if (!data) return false
    
    // Si es un array
    if (Array.isArray(data)) {
      return data.some(item => this.validarItemTesis(item))
    }
    
    // Si es un objeto con resultados
    if (data.resultados || data.tesis || data.results || data.data) {
      const items = data.resultados || data.tesis || data.results || data.data
      return Array.isArray(items) && items.some(item => this.validarItemTesis(item))
    }
    
    // Si es un solo item
    return this.validarItemTesis(data)
  }

  /**
   * Valida si un item individual parece ser una tesis
   */
  private validarItemTesis(item: any): boolean {
    if (!item || typeof item !== 'object') return false
    
    // Buscar campos típicos de una tesis
    const camposEsperados = [
      'rubro', 'titulo', 'title',
      'texto', 'contenido', 'content',
      'registro', 'registroDigital', 'id',
      'tesis', 'numero',
      'epoca', 'instancia', 'materia'
    ]
    
    const camposEncontrados = camposEsperados.filter(campo => 
      item.hasOwnProperty(campo) && item[campo]
    )
    
    // Si tiene al menos 2 campos esperados, probablemente es una tesis
    return camposEncontrados.length >= 2
  }

  /**
   * Método específico para probar endpoints conocidos del SJF
   */
  async probarEndpointsSJF(): Promise<any> {
    const endpointsSJF = [
      // Bicentenario endpoints
      'https://bicentenario.scjn.gob.mx/api',
      'https://bicentenario.scjn.gob.mx/api/tesis',
      'https://bicentenario.scjn.gob.mx/api/v1/tesis',
      'https://bicentenario.scjn.gob.mx/api/v2/buscar',
      
      // SJF alternativo
      'https://sjf2.scjn.gob.mx/api',
      'https://sjf2.scjn.gob.mx/api/tesis',
      
      // Otros posibles
      'https://www.scjn.gob.mx/api/tesis',
      'https://datos.scjn.gob.mx/api/tesis'
    ]

    const resultados = []

    for (const endpoint of endpointsSJF) {
      try {
        console.log(`🧪 Probando endpoint SJF: ${endpoint}`)
        
        const resultado = await this.fetchConProxy(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        resultados.push({
          endpoint,
          success: true,
          data: resultado.data,
          proxy: resultado.proxy,
          status: 'OK'
        })

        console.log(`✅ Endpoint ${endpoint} respondió`)

      } catch (error) {
        resultados.push({
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          status: 'ERROR'
        })
        
        console.log(`❌ Endpoint ${endpoint} falló`)
      }
    }

    return {
      total: endpointsSJF.length,
      exitosos: resultados.filter(r => r.success).length,
      fallidos: resultados.filter(r => !r.success).length,
      resultados
    }
  }

  /**
   * Intenta diferentes métodos HTTP en un endpoint
   */
  async probarMetodosHTTP(url: string): Promise<any> {
    const metodos = ['GET', 'POST', 'OPTIONS']
    const resultados = []

    for (const metodo of metodos) {
      try {
        console.log(`🔄 Probando ${metodo} en ${url}`)
        
        const options: RequestInit = {
          method: metodo,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }

        // Para POST, agregar algunos datos de prueba
        if (metodo === 'POST') {
          options.body = JSON.stringify({
            q: 'amparo',
            texto: 'amparo',
            consulta: 'jurisprudencia',
            limite: 10
          })
        }

        const resultado = await this.fetchConProxy(url, options)
        
        resultados.push({
          metodo,
          success: true,
          data: resultado.data,
          proxy: resultado.proxy
        })

      } catch (error) {
        resultados.push({
          metodo,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    return resultados
  }

  /**
   * Genera reporte de todos los intentos de proxy
   */
  async generarReporteProxy(): Promise<any> {
    console.log('📊 Generando reporte completo de proxy...')
    
    const [
      endpointsSJF,
      busquedaTest
    ] = await Promise.all([
      this.probarEndpointsSJF(),
      this.buscarTesisConProxy('amparo').catch(e => ({ error: e.message }))
    ])

    const reporte = {
      timestamp: new Date().toISOString(),
      proxiesDisponibles: this.proxies.map(p => p.name),
      testEndpointsSJF: endpointsSJF,
      testBusqueda: busquedaTest,
      recomendaciones: this.generarRecomendacionesProxy(endpointsSJF, busquedaTest)
    }

    // Guardar en localStorage
    localStorage.setItem('k-law-proxy-report', JSON.stringify(reporte))
    
    return reporte
  }

  /**
   * Genera recomendaciones basadas en los resultados del proxy
   */
  private generarRecomendacionesProxy(endpointsSJF: any, busquedaTest: any): string[] {
    const recomendaciones: string[] = []

    if (endpointsSJF.exitosos > 0) {
      recomendaciones.push(`✅ ${endpointsSJF.exitosos} endpoints SJF respondieron`)
      recomendaciones.push('🎯 Analizar respuestas para determinar estructura de datos')
    } else {
      recomendaciones.push('❌ Ningún endpoint SJF estándar respondió')
      recomendaciones.push('🔍 Considerar análisis HTML o scraping')
    }

    if (busquedaTest.success) {
      recomendaciones.push('✅ Búsqueda de prueba exitosa')
      recomendaciones.push('🚀 Proceder con implementación usando proxy exitoso')
    } else {
      recomendaciones.push('❌ Búsqueda de prueba falló')
      recomendaciones.push('🔧 Evaluar otras estrategias de acceso a datos')
    }

    recomendaciones.push('💡 Considerar implementar proxy propio para mejor rendimiento')

    return recomendaciones
  }
}

export const proxyAPI = new ProxyAPI()
export default ProxyAPI