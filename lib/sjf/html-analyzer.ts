/**
 * Analizador de HTML para descubrir APIs embebidas
 */

export class HTMLAnalyzer {
  private baseURL = 'https://bicentenario.scjn.gob.mx'

  /**
   * Descubre endpoints de API analizando el HTML de la página
   */
  async descubrirAPIDelHTML(): Promise<string[]> {
    try {
      console.log('🔍 Analizando HTML del Bicentenario para encontrar APIs...')
      
      // Obtener el HTML de la página principal
      const response = await fetch(this.baseURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      console.log(`📄 HTML obtenido: ${html.length} caracteres`)

      // Patrones para buscar APIs en el HTML
      const patrones = [
        // APIs estándar
        /api\/[a-zA-Z0-9\/\-_]+/gi,
        /\/api\/v\d+\/[a-zA-Z0-9\/\-_]+/gi,
        
        // Configuraciones de JavaScript
        /endpoint['"]\s*:\s*['"]([^'"]+)['"]/gi,
        /baseURL['"]\s*:\s*['"]([^'"]+)['"]/gi,
        /apiUrl['"]\s*:\s*['"]([^'"]+)['"]/gi,
        /url['"]\s*:\s*['"]([^'"]*api[^'"]*)['"]/gi,
        
        // Llamadas fetch/ajax
        /fetch\s*\(\s*['"]([^'"]+)['"]/gi,
        /\$.get\s*\(\s*['"]([^'"]+)['"]/gi,
        /\$.post\s*\(\s*['"]([^'"]+)['"]/gi,
        /axios\.[a-z]+\s*\(\s*['"]([^'"]+)['"]/gi,
        
        // URLs de servicios
        /https?:\/\/[^'">\s]*api[^'">\s]*/gi,
        /\/[a-zA-Z0-9\-_]*api[a-zA-Z0-9\-_\/]*/gi,
        
        // Específicos para SCJN
        /\/sjf\/[a-zA-Z0-9\/\-_]+/gi,
        /\/tesis\/[a-zA-Z0-9\/\-_]+/gi,
        /\/busqueda\/[a-zA-Z0-9\/\-_]+/gi,
        /\/jurisprudencia\/[a-zA-Z0-9\/\-_]+/gi,
        
        // Configuraciones de datos
        /data-api[^=]*=['"]([^'"]+)['"]/gi,
        /data-endpoint[^=]*=['"]([^'"]+)['"]/gi,
        /data-url[^=]*=['"]([^'"]+)['"]/gi
      ]

      const endpointsEncontrados = new Set<string>()
      
      // Aplicar cada patrón
      patrones.forEach((patron, index) => {
        const matches = [...html.matchAll(patron)]
        console.log(`🔎 Patrón ${index + 1}: ${matches.length} coincidencias`)
        
        matches.forEach(match => {
          const endpoint = match[1] || match[0]
          if (endpoint && endpoint.length > 2) {
            // Limpiar y normalizar el endpoint
            const cleanEndpoint = this.limpiarEndpoint(endpoint)
            if (cleanEndpoint) {
              endpointsEncontrados.add(cleanEndpoint)
            }
          }
        })
      })

      // Buscar también en scripts embebidos
      const scriptsEncontrados = await this.analizarScripts(html)
      scriptsEncontrados.forEach(script => endpointsEncontrados.add(script))

      const endpoints = Array.from(endpointsEncontrados)
      console.log('📍 Endpoints únicos encontrados:', endpoints)
      
      return endpoints

    } catch (error) {
      console.error('❌ Error analizando HTML:', error)
      return []
    }
  }

  /**
   * Analiza scripts embebidos en busca de configuraciones de API
   */
  private async analizarScripts(html: string): Promise<string[]> {
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
    const scripts = [...html.matchAll(scriptRegex)]
    const endpoints: string[] = []

    console.log(`📜 Analizando ${scripts.length} scripts embebidos`)

    scripts.forEach((script, index) => {
      const contenido = script[1]
      
      // Buscar configuraciones típicas de API
      const configuraciones = [
        /config\s*[=:]\s*{[\s\S]*?apiUrl\s*:\s*['"]([^'"]+)['"]/gi,
        /window\.[a-zA-Z]+\s*=\s*['"]([^'"]*api[^'"]*)['"]/gi,
        /const\s+[a-zA-Z_]+\s*=\s*['"]([^'"]*api[^'"]*)['"]/gi,
        /var\s+[a-zA-Z_]+\s*=\s*['"]([^'"]*api[^'"]*)['"]/gi,
        /let\s+[a-zA-Z_]+\s*=\s*['"]([^'"]*api[^'"]*)['"]/gi
      ]

      configuraciones.forEach(patron => {
        const matches = [...contenido.matchAll(patron)]
        matches.forEach(match => {
          const endpoint = match[1]
          if (endpoint) {
            endpoints.push(this.limpiarEndpoint(endpoint))
          }
        })
      })
    })

    return endpoints.filter(Boolean)
  }

  /**
   * Limpia y normaliza endpoints encontrados
   */
  private limpiarEndpoint(endpoint: string): string | null {
    if (!endpoint) return null
    
    // Remover espacios y caracteres extraños
    let clean = endpoint.trim().replace(/['"`;]/g, '')
    
    // Si es una URL relativa, convertir a absoluta
    if (clean.startsWith('/') && !clean.startsWith('//')) {
      clean = this.baseURL + clean
    }
    
    // Si no tiene protocolo pero parece una URL, agregar https
    if (clean.includes('.') && !clean.startsWith('http')) {
      clean = 'https://' + clean
    }
    
    // Filtrar endpoints inválidos
    if (clean.length < 5 || 
        clean.includes('javascript:') || 
        clean.includes('mailto:') ||
        clean.includes('tel:') ||
        clean.endsWith('.css') ||
        clean.endsWith('.js') ||
        clean.endsWith('.png') ||
        clean.endsWith('.jpg') ||
        clean.endsWith('.svg')) {
      return null
    }
    
    return clean
  }

  /**
   * Analiza páginas específicas que podrían contener APIs
   */
  async analizarPaginasEspecificas(): Promise<string[]> {
    const paginasAAnalizar = [
      '/consulta',
      '/busqueda',
      '/tesis',
      '/jurisprudencia',
      '/api',
      '/datos',
      '/servicios'
    ]

    const endpointsEncontrados: string[] = []

    for (const pagina of paginasAAnalizar) {
      try {
        console.log(`🔍 Analizando página: ${this.baseURL}${pagina}`)
        
        const response = await fetch(this.baseURL + pagina, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; K-LAW-Analyzer/1.0)'
          }
        })

        if (response.ok) {
          const html = await response.text()
          const endpoints = await this.descubrirAPIDelHTML()
          endpointsEncontrados.push(...endpoints)
        }
      } catch (error) {
        console.log(`⚠️ No se pudo analizar ${pagina}:`, error)
      }
    }

    return [...new Set(endpointsEncontrados)]
  }

  /**
   * Busca documentación de API o swagger
   */
  async buscarDocumentacionAPI(): Promise<string[]> {
    const rutasDocumentacion = [
      '/api/docs',
      '/api/swagger',
      '/swagger',
      '/docs',
      '/api-docs',
      '/documentation',
      '/help/api',
      '/dev/api'
    ]

    const documentacionEncontrada: string[] = []

    for (const ruta of rutasDocumentacion) {
      try {
        const response = await fetch(this.baseURL + ruta)
        if (response.ok) {
          console.log(`📚 Documentación encontrada en: ${this.baseURL}${ruta}`)
          documentacionEncontrada.push(this.baseURL + ruta)
        }
      } catch (error) {
        // Silenciar errores esperados
      }
    }

    return documentacionEncontrada
  }

  /**
   * Genera reporte completo del análisis
   */
  async generarReporteCompleto(): Promise<any> {
    console.log('📊 Generando reporte completo de análisis...')
    
    const [
      endpointsHTML,
      endpointsPaginas,
      documentacion
    ] = await Promise.all([
      this.descubrirAPIDelHTML(),
      this.analizarPaginasEspecificas(),
      this.buscarDocumentacionAPI()
    ])

    const todosLosEndpoints = [
      ...endpointsHTML,
      ...endpointsPaginas
    ]

    const endpointsUnicos = [...new Set(todosLosEndpoints)]

    const reporte = {
      fecha: new Date().toISOString(),
      sitioAnalizado: this.baseURL,
      resumen: {
        totalEndpointsEncontrados: endpointsUnicos.length,
        documentacionEncontrada: documentacion.length,
        paginasAnalizadas: [this.baseURL, ...endpointsPaginas].length
      },
      endpoints: {
        desdeHTML: endpointsHTML,
        desdePaginasEspecificas: endpointsPaginas,
        unicos: endpointsUnicos
      },
      documentacion,
      endpointsPotenciales: this.categorizarEndpoints(endpointsUnicos),
      recomendaciones: this.generarRecomendaciones(endpointsUnicos)
    }

    // Guardar reporte en localStorage
    localStorage.setItem('k-law-html-analysis', JSON.stringify(reporte))
    
    return reporte
  }

  /**
   * Categoriza endpoints por tipo
   */
  private categorizarEndpoints(endpoints: string[]): any {
    const categorias = {
      api: endpoints.filter(e => e.includes('/api/')),
      tesis: endpoints.filter(e => e.includes('tesis')),
      busqueda: endpoints.filter(e => e.includes('busqu') || e.includes('search')),
      jurisprudencia: endpoints.filter(e => e.includes('jurisprudencia')),
      datos: endpoints.filter(e => e.includes('datos') || e.includes('data')),
      servicios: endpoints.filter(e => e.includes('servic') || e.includes('service')),
      otros: endpoints.filter(e => 
        !e.includes('/api/') && 
        !e.includes('tesis') && 
        !e.includes('busqu') && 
        !e.includes('jurisprudencia') && 
        !e.includes('datos')
      )
    }

    return categorias
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  private generarRecomendaciones(endpoints: string[]): string[] {
    const recomendaciones: string[] = []

    if (endpoints.length === 0) {
      recomendaciones.push('❌ No se encontraron endpoints de API en el HTML')
      recomendaciones.push('🔧 Probar monitor de red o análisis manual')
    } else {
      recomendaciones.push(`✅ ${endpoints.length} endpoints potenciales encontrados`)
      
      if (endpoints.some(e => e.includes('/api/'))) {
        recomendaciones.push('🎯 Endpoints de API estándar detectados')
      }
      
      if (endpoints.some(e => e.includes('tesis'))) {
        recomendaciones.push('📚 Endpoints relacionados con tesis encontrados')
      }
      
      recomendaciones.push('🔍 Proceder a probar endpoints con llamadas reales')
    }

    return recomendaciones
  }
}

export const htmlAnalyzer = new HTMLAnalyzer()
export default HTMLAnalyzer