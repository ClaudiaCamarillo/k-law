/**
 * Explorador de API del Bicentenario SCJN
 * Funciones para descubrir endpoints y estructura de la API
 */

interface EndpointResult {
  endpoint: string
  status: number
  success: boolean
  data?: any
  error?: string
  headers?: Record<string, string>
}

export class APIExplorer {
  // URLs REALES confirmadas de la SCJN
  private urlsReales = {
    bicentenario: 'https://bicentenario.scjn.gob.mx',
    datosAbiertos: 'https://bj.scjn.gob.mx/datos-abiertos', 
    repositorioSJF: 'https://bicentenario.scjn.gob.mx/repositorio-scjn/sjf'
  }
  private timeout = 12000

  /**
   * Explora TODAS las plataformas REALES confirmadas de la SCJN
   */
  async explorarAPI(): Promise<EndpointResult[]> {
    console.log('🔍 EXPLORANDO APIs REALES confirmadas de la SCJN...')
    
    // Endpoints basados en la investigación oficial realizada
    const endpointsPorPlataforma = {
      // Bicentenario (Manual oficial confirma API)
      bicentenario: [
        '/api', '/api/sjf', '/api/tesis', '/api/search', '/api/count', '/api/list',
        '/api/v1', '/api/v1/sjf', '/api/v1/tesis', '/services/api',
        '/repositorio/api', '/datos/api'
      ],
      // Datos Abiertos (Plataforma oficial confirmada)
      datosAbiertos: [
        '/api', '/api/v1', '/api/sjf', '/api/search', '/api/jurisprudencia',
        '/conjunto-datos', '/conjunto-datos/api', '/datasets/api',
        '/open-data/api', '/api/datasets'
      ],
      // Repositorio SJF específico
      repositorioSJF: [
        '/api', '/datos', '/tesis', '/search', '/consulta',
        '/api/tesis', '/api/search', '/api/count'
      ]
    }

    const resultados: EndpointResult[] = []

    // Explorar cada plataforma real
    for (const [plataforma, endpoints] of Object.entries(endpointsPorPlataforma)) {
      const baseURL = this.urlsReales[plataforma as keyof typeof this.urlsReales]
      console.log(`\n🏛️ EXPLORANDO ${plataforma.toUpperCase()}: ${baseURL}`)
      
      for (const endpoint of endpoints) {
        try {
          const url = baseURL + endpoint
          console.log(`🔎 Probando: ${url}`)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), this.timeout)

          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json, text/html, */*',
              'Content-Type': 'application/json',
              'User-Agent': 'K-LAW-Explorer/2.0 (APIs-Reales)',
              'Cache-Control': 'no-cache'
            },
            mode: 'cors'
          })

        clearTimeout(timeoutId)

        const result: EndpointResult = {
          endpoint,
          status: response.status,
          success: response.ok,
          headers: this.extractHeaders(response)
        }

        const result: EndpointResult = {
          endpoint: `${plataforma}${endpoint}`,
          status: response.status,
          success: response.ok,
          headers: this.extractHeaders(response)
        }

        if (response.ok) {
          console.log(`✅ ${plataforma}${endpoint}: ${response.status} - OK`)
          
          const contentType = response.headers.get('content-type') || ''
          
          if (contentType.includes('application/json')) {
            try {
              const data = await response.json()
              result.data = data
              console.log(`📊 JSON encontrado en ${plataforma}${endpoint}:`, Object.keys(data || {}))
              
              // Analizar si parece API de tesis/jurisprudencia
              if (this.esAPIRelevante(data)) {
                console.log(`🎯 ¡API RELEVANTE encontrada en ${plataforma}${endpoint}!`)
              }
            } catch (jsonError) {
              result.error = 'JSON inválido'
            }
          } else if (contentType.includes('text/html')) {
            const text = await response.text()
            result.data = text.substring(0, 300) + '...'
            console.log(`📄 HTML en ${plataforma}${endpoint} (${text.length} chars)`)
          } else {
            result.data = `Tipo: ${contentType}`
          }
        } else {
          console.log(`❌ ${plataforma}${endpoint}: ${response.status}`)
          result.error = response.statusText
        }

        resultados.push(result)

        } catch (error) {
          console.log(`❌ ${plataforma}${endpoint}: ${error instanceof Error ? error.message : 'Error'}`)
          resultados.push({
            endpoint: `${plataforma}${endpoint}`,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          })
        }

        // Pausa entre requests para ser respetuosos
        await this.sleep(400)
      }
      
      // Pausa más larga entre plataformas
      await this.sleep(1000)
    }

    console.log('🏁 Exploración completada')
    return resultados
  }

  /**
   * Prueba búsquedas REALES en las plataformas confirmadas
   */
  async probarBusquedas(): Promise<EndpointResult[]> {
    console.log('🔍 PROBANDO BÚSQUEDAS en APIs reales...')
    
    const busquedasPorPlataforma = {
      bicentenario: [
        { path: '/api/sjf/search?q=amparo&format=json', desc: 'SJF Search JSON' },
        { path: '/api/tesis?query=amparo&formato=json', desc: 'Tesis Query' },
        { path: '/api/search?texto=amparo&materia=amparo', desc: 'Search General' },
        { path: '/api/v1/sjf?search=amparo&type=jurisprudencia', desc: 'API v1 SJF' }
      ],
      datosAbiertos: [
        { path: '/api/search?q=amparo&dataset=sjf', desc: 'Datos Abiertos Search' },
        { path: '/api/jurisprudencia?consulta=amparo', desc: 'Jurisprudencia API' },
        { path: '/conjunto-datos/sjf?search=amparo', desc: 'Conjunto Datos SJF' },
        { path: '/api/v1/datasets?query=amparo', desc: 'Datasets API' }
      ],
      repositorioSJF: [
        { path: '/api/search?texto=amparo&tipo=tesis', desc: 'Repositorio Search' },
        { path: '/api/tesis?q=amparo&limit=10', desc: 'Tesis API' },
        { path: '/search?consulta=amparo&formato=json', desc: 'Search JSON' }
      ]
    }

    const resultados: EndpointResult[] = []

    for (const [plataforma, busquedas] of Object.entries(busquedasPorPlataforma)) {
      const baseURL = this.urlsReales[plataforma as keyof typeof this.urlsReales]
      console.log(`\n🔍 BÚSQUEDAS en ${plataforma.toUpperCase()}: ${baseURL}`)
      
      for (const { path, desc } of busquedas) {
        try {
          const url = baseURL + path
          console.log(`🎯 ${desc}: ${url}`)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), this.timeout)

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json, */*',
              'Content-Type': 'application/json',
              'User-Agent': 'K-LAW-Search/1.0'
            },
            mode: 'cors'
          })

        clearTimeout(timeoutId)

          clearTimeout(timeoutId)

          const result: EndpointResult = {
            endpoint: `${plataforma}: ${desc}`,
            status: response.status,
            success: response.ok
          }

          if (response.ok) {
            console.log(`✅ ${desc}: ${response.status}`)
            try {
              const data = await response.json()
              result.data = data
              
              // Analizar si encontramos datos de tesis
              const cantidadTesis = this.contarTesis(data)
              if (cantidadTesis > 0) {
                console.log(`🎉 ¡TESIS ENCONTRADAS! ${cantidadTesis} resultados en ${desc}`)
              }
              
              console.log(`📊 Estructura de respuesta:`, Object.keys(data || {}))
            } catch {
              const text = await response.text()
              result.data = text.substring(0, 200) + '...'
            }
          } else {
            console.log(`❌ ${desc}: ${response.status}`)
            result.error = response.statusText
          }

          resultados.push(result)

        } catch (error) {
          console.log(`❌ ${desc}: ${error instanceof Error ? error.message : 'Error'}`)
          resultados.push({
            endpoint: `${plataforma}: ${desc}`,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          })
        }

        await this.sleep(500)
      }
      
      await this.sleep(1500) // Pausa entre plataformas
    }

    return resultados
  }

  /**
   * Analiza la estructura de respuestas exitosas para entender el formato de datos
   */
  analizarEstructuras(resultados: EndpointResult[]): void {
    console.log('📊 Análisis de estructuras encontradas:')
    
    const exitosos = resultados.filter(r => r.success && r.data)
    
    if (exitosos.length === 0) {
      console.log('❌ No se encontraron endpoints exitosos con datos')
      return
    }

    exitosos.forEach(resultado => {
      console.log(`\n🔍 Análisis de ${resultado.endpoint}:`)
      
      if (typeof resultado.data === 'object') {
        const keys = Object.keys(resultado.data)
        console.log(`📋 Claves encontradas: ${keys.join(', ')}`)
        
        // Buscar patrones comunes
        if (keys.includes('resultados') || keys.includes('results')) {
          console.log('✅ Patrón de resultados detectado')
        }
        if (keys.includes('tesis') || keys.includes('jurisprudencia')) {
          console.log('✅ Datos de tesis detectados')
        }
        if (keys.includes('total') || keys.includes('count')) {
          console.log('✅ Contador de resultados detectado')
        }
        
        console.log(`📄 Muestra de datos:`, JSON.stringify(resultado.data, null, 2).substring(0, 500))
      }
    })
  }

  /**
   * Genera un reporte completo de la exploración
   */
  generarReporte(resultados: EndpointResult[]): string {
    const exitosos = resultados.filter(r => r.success)
    const fallidos = resultados.filter(r => !r.success)
    
    let reporte = `
# Reporte de Exploración - API Bicentenario SCJN

## 📊 Resumen
- **Total de endpoints probados:** ${resultados.length}
- **Endpoints exitosos:** ${exitosos.length}
- **Endpoints fallidos:** ${fallidos.length}
- **Tasa de éxito:** ${((exitosos.length / resultados.length) * 100).toFixed(1)}%

## ✅ Endpoints Exitosos
${exitosos.map(r => `- \`${r.endpoint}\` (${r.status})`).join('\n')}

## ❌ Endpoints Fallidos
${fallidos.map(r => `- \`${r.endpoint}\` (${r.status || 'Error'}) - ${r.error || 'Sin respuesta'}`).join('\n')}

## 📋 Endpoints con Datos JSON
${exitosos.filter(r => typeof r.data === 'object').map(r => 
  `### ${r.endpoint}\n\`\`\`json\n${JSON.stringify(r.data, null, 2).substring(0, 300)}...\n\`\`\``
).join('\n\n')}

---
*Generado por K-LAW API Explorer*
`
    
    return reporte
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    return headers
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Analiza si una respuesta parece ser de una API relevante de tesis
   */
  private esAPIRelevante(data: any): boolean {
    if (!data || typeof data !== 'object') return false
    
    const campos = Object.keys(data).join(' ').toLowerCase()
    const palabrasClave = [
      'tesis', 'jurisprudencia', 'precedente', 'sjf', 'semanario',
      'amparo', 'tribunal', 'corte', 'sentencia', 'registro'
    ]
    
    return palabrasClave.some(palabra => campos.includes(palabra))
  }

  /**
   * Cuenta cuántas tesis hay en una respuesta
   */
  private contarTesis(data: any): number {
    if (!data) return 0
    
    // Buscar arrays que podrían contener tesis
    const posiblesArrays = [
      data.resultados, data.results, data.tesis, data.data, 
      data.items, data.documents, data.entries
    ]
    
    for (const array of posiblesArrays) {
      if (Array.isArray(array)) {
        return array.length
      }
    }
    
    // Si la respuesta misma es un array
    if (Array.isArray(data)) {
      return data.length
    }
    
    // Buscar campos de conteo
    return data.total || data.count || data.totalResults || 0
  }
}

/**
 * Función de conveniencia para explorar la API desde la consola del navegador
 */
export async function explorarAPIBicentenario(): Promise<void> {
  const explorer = new APIExplorer()
  
  console.log('🚀 Iniciando exploración completa de la API...')
  
  // Exploración básica
  const resultadosBasicos = await explorer.explorarAPI()
  
  // Exploración de búsquedas
  const resultadosBusqueda = await explorer.probarBusquedas()
  
  // Análisis
  const todosLosResultados = [...resultadosBasicos, ...resultadosBusqueda]
  explorer.analizarEstructuras(todosLosResultados)
  
  // Reporte
  const reporte = explorer.generarReporte(todosLosResultados)
  console.log(reporte)
  
  console.log('✅ Exploración completada. Revisa la consola para más detalles.')
  
  // Guardar en localStorage para referencia
  localStorage.setItem('k-law-api-exploration', JSON.stringify({
    timestamp: new Date().toISOString(),
    resultados: todosLosResultados,
    reporte
  }))
  
  return todosLosResultados as any
}