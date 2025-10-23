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
  private baseURL = 'https://bicentenario.scjn.gob.mx'
  private timeout = 8000

  /**
   * Explora múltiples endpoints posibles para descubrir la estructura de la API
   */
  async explorarAPI(): Promise<EndpointResult[]> {
    console.log('🔍 Iniciando exploración de la API del Bicentenario...')
    
    const posiblesEndpoints = [
      '/api',
      '/api/tesis',
      '/api/sjf/tesis',
      '/api/busqueda',
      '/api/jurisprudencia',
      '/tesis/buscar',
      '/datos-abiertos/api',
      '/repositorio/api',
      '/api/v1',
      '/api/v2',
      '/sjf/api',
      '/bicentenario/api',
      '/consulta/api',
      '/semanario/api',
      '/api/semanario',
      '/api/consulta'
    ]

    const resultados: EndpointResult[] = []

    for (const endpoint of posiblesEndpoints) {
      try {
        console.log(`🔎 Probando: ${this.baseURL}${endpoint}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(this.baseURL + endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'K-LAW-Explorer/1.0'
          }
        })

        clearTimeout(timeoutId)

        const result: EndpointResult = {
          endpoint,
          status: response.status,
          success: response.ok,
          headers: this.extractHeaders(response)
        }

        if (response.ok) {
          console.log(`✅ ${endpoint}: ${response.status} - OK`)
          
          const contentType = response.headers.get('content-type') || ''
          
          if (contentType.includes('application/json')) {
            try {
              const data = await response.json()
              result.data = data
              console.log(`📄 Estructura encontrada en ${endpoint}:`, data)
            } catch (jsonError) {
              result.error = 'Respuesta no es JSON válido'
            }
          } else if (contentType.includes('text/html')) {
            const text = await response.text()
            result.data = text.substring(0, 500) + '...' // Primeros 500 caracteres
            console.log(`📄 Respuesta HTML en ${endpoint} (${text.length} caracteres)`)
          } else {
            result.data = `Tipo de contenido: ${contentType}`
          }
        } else {
          console.log(`❌ ${endpoint}: ${response.status} - ${response.statusText}`)
          result.error = response.statusText
        }

        resultados.push(result)

      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error}`)
        resultados.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      // Pequeña pausa para no sobrecargar el servidor
      await this.sleep(200)
    }

    console.log('🏁 Exploración completada')
    return resultados
  }

  /**
   * Prueba endpoints específicos de búsqueda con parámetros
   */
  async probarBusquedas(): Promise<EndpointResult[]> {
    console.log('🔍 Probando endpoints de búsqueda...')
    
    const endpointsBusqueda = [
      { url: '/api/tesis?q=amparo', desc: 'Búsqueda simple' },
      { url: '/api/buscar?texto=amparo', desc: 'Búsqueda con texto' },
      { url: '/api/sjf/buscar?consulta=amparo', desc: 'Búsqueda SJF' },
      { url: '/tesis/buscar?query=amparo', desc: 'Búsqueda directa' },
      { url: '/api/tesis/buscar?q=amparo&formato=json', desc: 'Con formato JSON' },
      { url: '/datos-abiertos/api/tesis?search=amparo', desc: 'Datos abiertos' }
    ]

    const resultados: EndpointResult[] = []

    for (const { url, desc } of endpointsBusqueda) {
      try {
        console.log(`🔎 Probando búsqueda: ${desc} - ${this.baseURL}${url}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(this.baseURL + url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        clearTimeout(timeoutId)

        const result: EndpointResult = {
          endpoint: `${url} (${desc})`,
          status: response.status,
          success: response.ok
        }

        if (response.ok) {
          console.log(`✅ ${desc}: ${response.status}`)
          try {
            const data = await response.json()
            result.data = data
            console.log(`📊 Resultados de búsqueda:`, data)
          } catch {
            result.data = await response.text()
          }
        } else {
          console.log(`❌ ${desc}: ${response.status}`)
          result.error = response.statusText
        }

        resultados.push(result)

      } catch (error) {
        console.log(`❌ ${desc}: Error`)
        resultados.push({
          endpoint: `${url} (${desc})`,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }

      await this.sleep(300)
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