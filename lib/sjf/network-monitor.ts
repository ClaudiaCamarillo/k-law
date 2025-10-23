/**
 * Monitor de red para detectar llamadas API reales
 */

export class NetworkMonitor {
  private ventanaMonitor: Window | null = null
  private endpointsDetectados: Set<string> = new Set()
  private intervalId: number | null = null

  /**
   * Monitorea la red del sitio del Bicentenario
   */
  monitorearRedBicentenario(): void {
    console.log('🕵️ Iniciando monitor de red...')
    
    // Abrir ventana del Bicentenario
    this.ventanaMonitor = window.open('https://bicentenario.scjn.gob.mx/', '_blank')
    
    if (!this.ventanaMonitor) {
      alert('❌ No se pudo abrir la ventana. Verifica que no esté bloqueada por el navegador.')
      return
    }

    // Mostrar instrucciones al usuario
    this.mostrarInstruccionesMonitoreo()

    // Configurar monitoreo (limitado por políticas de seguridad del navegador)
    this.configurarMonitoreoLimitado()
  }

  /**
   * Muestra instrucciones detalladas para el usuario
   */
  private mostrarInstruccionesMonitoreo(): void {
    const instrucciones = `
    📋 INSTRUCCIONES PARA DETECTAR LA API:

    1. 🌐 En la ventana que se abrió (Bicentenario SCJN):
       • Navega a cualquier sección de búsqueda
       • Busca "Consulta de tesis" o "Búsqueda avanzada"

    2. 🔧 Abre las Herramientas de Desarrollador:
       • Presiona F12 (Windows/Linux) o Cmd+Option+I (Mac)
       • Ve a la pestaña "Network" / "Red"
       • Marca "Preserve log" / "Conservar registro"

    3. 🔍 Realiza una búsqueda de prueba:
       • Busca términos como "amparo", "jurisprudencia"
       • Observa las peticiones HTTP que aparecen

    4. 📡 Identifica llamadas de API:
       • Busca URLs que contengan "api", "json", "ajax"
       • Especialmente las que contengan "tesis", "jurisprudencia", "busqueda"
       • Anota las URLs completas

    5. 📋 Reporta los hallazgos:
       • Copia las URLs encontradas
       • Úsalas en el campo "Endpoints encontrados" abajo

    ⚠️ Si no encuentras APIs:
    • Podría ser una SPA (Single Page Application)
    • Los datos podrían estar embebidos en el HTML
    • Podría usar WebSockets o GraphQL
    `

    alert(instrucciones)
  }

  /**
   * Configurar monitoreo limitado (sin acceso cross-origin)
   */
  private configurarMonitoreoLimitado(): void {
    // Nota: Debido a las políticas CORS, no podemos interceptar
    // el tráfico de red de otra ventana directamente.
    // Esto es más una guía para el usuario.

    console.log('⚠️ Monitoreo automático limitado por políticas de seguridad del navegador')
    console.log('💡 El usuario debe seguir las instrucciones manuales')

    // Simular algunos endpoints comunes para probar
    this.sugerirEndpointsComunes()
  }

  /**
   * Sugiere endpoints comunes basados en patrones típicos
   */
  private sugerirEndpointsComunes(): void {
    const endpointsComunes = [
      'https://bicentenario.scjn.gob.mx/api/tesis',
      'https://bicentenario.scjn.gob.mx/api/busqueda',
      'https://bicentenario.scjn.gob.mx/api/jurisprudencia',
      'https://bicentenario.scjn.gob.mx/api/v1/tesis',
      'https://bicentenario.scjn.gob.mx/api/v2/buscar',
      'https://bicentenario.scjn.gob.mx/datos/api/tesis',
      'https://bicentenario.scjn.gob.mx/sjf/api/buscar',
      'https://bicentenario.scjn.gob.mx/servicios/api/consulta'
    ]

    console.log('🎯 Endpoints comunes a probar:', endpointsComunes)
    return endpointsComunes
  }

  /**
   * Procesa endpoints encontrados manualmente por el usuario
   */
  procesarEndpointsEncontrados(endpoints: string[]): any {
    console.log('📥 Procesando endpoints encontrados por el usuario:', endpoints)
    
    const endpointsLimpios = endpoints
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith('http') || url.startsWith('/')))

    const analisis = {
      timestamp: new Date().toISOString(),
      endpointsOriginales: endpoints,
      endpointsLimpios,
      analisis: this.analizarEndpoints(endpointsLimpios),
      recomendaciones: this.generarRecomendacionesEndpoints(endpointsLimpios)
    }

    // Guardar en localStorage
    localStorage.setItem('k-law-endpoints-usuario', JSON.stringify(analisis))

    return analisis
  }

  /**
   * Analiza endpoints proporcionados por el usuario
   */
  private analizarEndpoints(endpoints: string[]): any {
    const analisis = {
      total: endpoints.length,
      categorias: {
        api: endpoints.filter(url => url.includes('/api/')),
        tesis: endpoints.filter(url => url.includes('tesis')),
        busqueda: endpoints.filter(url => url.includes('busqu') || url.includes('search')),
        jurisprudencia: endpoints.filter(url => url.includes('jurisprudencia')),
        ajax: endpoints.filter(url => url.includes('ajax')),
        json: endpoints.filter(url => url.includes('json')),
        otros: []
      },
      patrones: this.detectarPatrones(endpoints),
      metodos: this.sugerirMetodos(endpoints)
    }

    // Calcular "otros"
    analisis.categorias.otros = endpoints.filter(url => 
      !url.includes('/api/') && 
      !url.includes('tesis') && 
      !url.includes('busqu') && 
      !url.includes('jurisprudencia') &&
      !url.includes('ajax') &&
      !url.includes('json')
    )

    return analisis
  }

  /**
   * Detecta patrones en los endpoints
   */
  private detectarPatrones(endpoints: string[]): string[] {
    const patrones: string[] = []

    // Detectar versionado de API
    if (endpoints.some(url => /\/v\d+\//.test(url))) {
      patrones.push('API versionada detectada')
    }

    // Detectar estructura REST
    if (endpoints.some(url => url.includes('/api/'))) {
      patrones.push('Estructura REST estándar')
    }

    // Detectar parámetros de consulta
    if (endpoints.some(url => url.includes('?'))) {
      patrones.push('Endpoints con parámetros de consulta')
    }

    // Detectar subdominios
    const dominios = [...new Set(endpoints.map(url => {
      try {
        return new URL(url).hostname
      } catch {
        return null
      }
    }).filter(Boolean))]

    if (dominios.length > 1) {
      patrones.push(`Múltiples dominios: ${dominios.join(', ')}`)
    }

    return patrones
  }

  /**
   * Sugiere métodos HTTP basados en los endpoints
   */
  private sugerirMetodos(endpoints: string[]): Record<string, string[]> {
    const metodos: Record<string, string[]> = {}

    endpoints.forEach(url => {
      // Determinar método probable basado en la estructura del endpoint
      if (url.includes('buscar') || url.includes('search') || url.includes('?q=')) {
        metodos[url] = ['GET', 'POST']
      } else if (url.includes('/api/') && !url.includes('?')) {
        metodos[url] = ['GET']
      } else if (url.includes('consulta') || url.includes('query')) {
        metodos[url] = ['POST', 'GET']
      } else {
        metodos[url] = ['GET']
      }
    })

    return metodos
  }

  /**
   * Genera recomendaciones para probar endpoints
   */
  private generarRecomendacionesEndpoints(endpoints: string[]): string[] {
    const recomendaciones: string[] = []

    if (endpoints.length === 0) {
      recomendaciones.push('❌ No se proporcionaron endpoints')
      recomendaciones.push('🔧 Revisa las instrucciones de monitoreo')
      return recomendaciones
    }

    recomendaciones.push(`✅ ${endpoints.length} endpoints para probar`)

    // Recomendar orden de prueba
    const apiEndpoints = endpoints.filter(url => url.includes('/api/'))
    if (apiEndpoints.length > 0) {
      recomendaciones.push(`🎯 Comenzar con endpoints de API: ${apiEndpoints.length} encontrados`)
    }

    const tesisEndpoints = endpoints.filter(url => url.includes('tesis'))
    if (tesisEndpoints.length > 0) {
      recomendaciones.push(`📚 Probar endpoints de tesis: ${tesisEndpoints.length} encontrados`)
    }

    // Sugerir parámetros de prueba
    recomendaciones.push('🔍 Parámetros sugeridos para pruebas:')
    recomendaciones.push('  • q=amparo, texto=amparo, consulta=amparo')
    recomendaciones.push('  • formato=json, type=json')
    recomendaciones.push('  • limite=10, limit=10, size=10')

    return recomendaciones
  }

  /**
   * Genera código de prueba para los endpoints encontrados
   */
  generarCodigoPrueba(endpoints: string[]): string {
    const codigo = `
// Código generado para probar endpoints encontrados
const endpointsAProbar = ${JSON.stringify(endpoints, null, 2)};

async function probarEndpoint(url, metodo = 'GET', params = {}) {
  try {
    const config = {
      method: metodo,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'K-LAW/1.0'
      }
    };

    if (metodo === 'POST') {
      config.body = JSON.stringify(params);
    } else if (Object.keys(params).length > 0) {
      const urlParams = new URLSearchParams(params);
      url += '?' + urlParams.toString();
    }

    console.log('🔍 Probando:', url);
    const response = await fetch(url, config);
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      return { success: true, data, status: response.status };
    } else {
      console.log('❌ Error:', response.statusText);
      return { success: false, error: response.statusText, status: response.status };
    }
  } catch (error) {
    console.log('💥 Excepción:', error.message);
    return { success: false, error: error.message, status: 0 };
  }
}

// Función para probar todos los endpoints
async function probarTodosLosEndpoints() {
  const resultados = [];
  
  for (const endpoint of endpointsAProbar) {
    // Probar con diferentes parámetros
    const parametrosPrueba = [
      {},
      { q: 'amparo' },
      { texto: 'amparo', formato: 'json' },
      { consulta: 'jurisprudencia', limite: '10' }
    ];
    
    for (const params of parametrosPrueba) {
      const resultado = await probarEndpoint(endpoint, 'GET', params);
      resultados.push({ endpoint, params, resultado });
      
      // Pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('📊 Resultados completos:', resultados);
  return resultados;
}

// Ejecutar pruebas
probarTodosLosEndpoints();
`

    return codigo
  }

  /**
   * Cierra el monitor
   */
  cerrarMonitor(): void {
    if (this.ventanaMonitor && !this.ventanaMonitor.closed) {
      this.ventanaMonitor.close()
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log('🔒 Monitor de red cerrado')
  }
}

export const networkMonitor = new NetworkMonitor()
export default NetworkMonitor