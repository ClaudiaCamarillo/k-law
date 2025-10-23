/**
 * Scraper para el SJF como último recurso
 */

import { Tesis, ResultadoBusqueda } from './types'
import { proxyAPI } from './proxy-api'

export class SJFScraper {
  private baseUrls = {
    sjf2: 'https://sjf2.scjn.gob.mx',
    bicentenario: 'https://bicentenario.scjn.gob.mx',
    sjfSemanal: 'https://sjfsemanal.scjn.gob.mx'
  }

  /**
   * Scraped principal del SJF
   */
  async scrapearSJF(termino: string): Promise<ResultadoBusqueda> {
    console.log(`🕷️ Iniciando scraping para: "${termino}"`)
    
    // Intentar diferentes sitios
    const sitios = [
      { name: 'SJF2', method: () => this.scrapearSJF2(termino) },
      { name: 'Bicentenario', method: () => this.scrapearBicentenario(termino) },
      { name: 'SJF Semanal', method: () => this.scrapearSJFSemanal(termino) }
    ]

    for (const sitio of sitios) {
      try {
        console.log(`🔍 Intentando scraping en ${sitio.name}`)
        const resultado = await sitio.method()
        
        if (resultado.tesis.length > 0) {
          console.log(`✅ Scraping exitoso en ${sitio.name}: ${resultado.tesis.length} tesis encontradas`)
          return resultado
        }
      } catch (error) {
        console.log(`❌ Scraping falló en ${sitio.name}:`, error)
      }
    }

    // Si todo falla, retornar resultado vacío
    return {
      tesis: [],
      total: 0,
      pagina: 1,
      total_paginas: 0
    }
  }

  /**
   * Scraper específico para SJF2
   */
  private async scrapearSJF2(termino: string): Promise<ResultadoBusqueda> {
    const url = `${this.baseUrls.sjf2}/busqueda-principal-tesis`
    
    try {
      // Intentar con GET primero
      const urlConParams = `${url}?palabra=${encodeURIComponent(termino)}&tipo=todos`
      console.log(`🔍 Scraping SJF2 GET: ${urlConParams}`)
      
      const resultadoGet = await this.scrapearConProxy(urlConParams)
      if (resultadoGet.tesis.length > 0) {
        return resultadoGet
      }

      // Si GET falla, intentar con POST
      console.log('🔄 Intentando SJF2 con POST')
      return await this.scrapearSJF2POST(termino)

    } catch (error) {
      console.log('❌ Error en scraping SJF2:', error)
      throw error
    }
  }

  /**
   * Scraper SJF2 con método POST
   */
  private async scrapearSJF2POST(termino: string): Promise<ResultadoBusqueda> {
    const url = `${this.baseUrls.sjf2}/busqueda-principal-tesis`
    
    try {
      // Preparar datos del formulario
      const formData = new FormData()
      formData.append('palabra', termino)
      formData.append('tipo', 'todos')
      formData.append('buscar', 'Buscar')

      // Usar proxy para POST
      const response = await proxyAPI.fetchConProxy(url, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.success) {
        return this.parsearResultadosSJF(response.data)
      }

      throw new Error('POST request failed')

    } catch (error) {
      console.log('❌ Error en SJF2 POST:', error)
      throw error
    }
  }

  /**
   * Scraper para el sitio del Bicentenario
   */
  private async scrapearBicentenario(termino: string): Promise<ResultadoBusqueda> {
    // El Bicentenario podría tener una interfaz diferente
    const posiblesUrls = [
      `${this.baseUrls.bicentenario}/consulta?q=${encodeURIComponent(termino)}`,
      `${this.baseUrls.bicentenario}/busqueda?texto=${encodeURIComponent(termino)}`,
      `${this.baseUrls.bicentenario}/tesis?buscar=${encodeURIComponent(termino)}`
    ]

    for (const url of posiblesUrls) {
      try {
        console.log(`🔍 Probando URL Bicentenario: ${url}`)
        const resultado = await this.scrapearConProxy(url)
        
        if (resultado.tesis.length > 0) {
          return resultado
        }
      } catch (error) {
        console.log(`❌ URL falló: ${url}`)
      }
    }

    throw new Error('Todas las URLs del Bicentenario fallaron')
  }

  /**
   * Scraper para SJF Semanal
   */
  private async scrapearSJFSemanal(termino: string): Promise<ResultadoBusqueda> {
    const url = `${this.baseUrls.sjfSemanal}/busqueda?q=${encodeURIComponent(termino)}`
    
    try {
      return await this.scrapearConProxy(url)
    } catch (error) {
      console.log('❌ Error en SJF Semanal:', error)
      throw error
    }
  }

  /**
   * Realizar scraping usando proxy
   */
  private async scrapearConProxy(url: string): Promise<ResultadoBusqueda> {
    try {
      const response = await proxyAPI.fetchConProxy(url)
      
      if (response.success) {
        // Si la respuesta ya es JSON, usarla directamente
        if (typeof response.data === 'object' && response.data.tesis) {
          return response.data
        }
        
        // Si es HTML, parsearlo
        if (typeof response.data === 'string') {
          return this.parsearResultadosSJF(response.data)
        }
      }

      throw new Error('No se pudieron obtener datos válidos')

    } catch (error) {
      console.log(`❌ Error scraping ${url}:`, error)
      throw error
    }
  }

  /**
   * Parser principal para HTML del SJF
   */
  private parsearResultadosSJF(html: string): ResultadoBusqueda {
    console.log('🔍 Parseando HTML del SJF...')
    
    try {
      // Intentar parsear como JSON primero
      if (html.trim().startsWith('{') || html.trim().startsWith('[')) {
        const data = JSON.parse(html)
        return this.convertirJSONATesis(data)
      }

      // Si es HTML, usar DOMParser
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      return this.extraerTesisDelDOM(doc)

    } catch (error) {
      console.log('❌ Error parseando HTML:', error)
      return {
        tesis: [],
        total: 0,
        pagina: 1,
        total_paginas: 0
      }
    }
  }

  /**
   * Convierte respuesta JSON a formato de tesis
   */
  private convertirJSONATesis(data: any): ResultadoBusqueda {
    let tesis: Tesis[] = []

    if (Array.isArray(data)) {
      tesis = data.map(item => this.convertirItemATesis(item))
    } else if (data.resultados || data.tesis || data.results) {
      const items = data.resultados || data.tesis || data.results
      tesis = Array.isArray(items) ? items.map(item => this.convertirItemATesis(item)) : []
    } else if (data.data) {
      tesis = Array.isArray(data.data) ? data.data.map(item => this.convertirItemATesis(item)) : []
    }

    return {
      tesis,
      total: data.total || tesis.length,
      pagina: data.pagina || 1,
      total_paginas: data.total_paginas || 1
    }
  }

  /**
   * Extrae tesis del DOM HTML
   */
  private extraerTesisDelDOM(doc: Document): ResultadoBusqueda {
    const tesis: Tesis[] = []
    
    // Selectores comunes para resultados de tesis
    const selectores = [
      '.resultado-tesis',
      '.tesis-item',
      '.resultado',
      '.search-result',
      '.jurisprudencia-item',
      '[data-tesis]',
      'article',
      '.card',
      '.item'
    ]

    for (const selector of selectores) {
      const elementos = doc.querySelectorAll(selector)
      
      if (elementos.length > 0) {
        console.log(`📋 Encontrados ${elementos.length} elementos con selector: ${selector}`)
        
        elementos.forEach((elem, index) => {
          const tesisData = this.extraerDatosTesis(elem, index)
          if (tesisData) {
            tesis.push(tesisData)
          }
        })

        // Si encontramos tesis, detener la búsqueda
        if (tesis.length > 0) {
          break
        }
      }
    }

    // Si no encontramos con selectores específicos, buscar texto
    if (tesis.length === 0) {
      console.log('🔍 Búsqueda por selectores falló, intentando extracción de texto')
      return this.extraerTesisPorTexto(doc)
    }

    return {
      tesis,
      total: tesis.length,
      pagina: 1,
      total_paginas: 1
    }
  }

  /**
   * Extrae datos de una tesis desde un elemento DOM
   */
  private extraerDatosTesis(elemento: Element, index: number): Tesis | null {
    try {
      // Buscar diferentes campos en el elemento
      const rubro = this.extraerTexto(elemento, [
        '.rubro', '.titulo', '.title', 'h1', 'h2', 'h3', '.header', '.nombre'
      ]) || `Tesis ${index + 1}`

      const texto = this.extraerTexto(elemento, [
        '.texto', '.contenido', '.content', '.description', '.body', 'p'
      ]) || ''

      const registro = this.extraerTexto(elemento, [
        '.registro', '.id', '.number', '.registro-digital', '[data-id]'
      ]) || `scraped-${Date.now()}-${index}`

      const instancia = this.extraerTexto(elemento, [
        '.instancia', '.court', '.sala', '.organ'
      ]) || ''

      const epoca = this.extraerTexto(elemento, [
        '.epoca', '.period', '.era'
      ]) || 'Décima Época'

      const materia = this.extraerTexto(elemento, [
        '.materia', '.subject', '.category'
      ]) || 'común'

      // Solo crear la tesis si tiene contenido mínimo
      if (rubro.length > 5 || texto.length > 10) {
        return {
          id: `scraped-${Date.now()}-${index}`,
          registro_digital: registro,
          rubro: rubro,
          texto: texto,
          tipo: texto.toLowerCase().includes('jurisprudencia') ? 'jurisprudencia' : 'aislada',
          epoca: epoca,
          materia: materia.toLowerCase(),
          fuente: 'SJF (Scraped)',
          instancia: instancia,
          sala: instancia
        }
      }

      return null

    } catch (error) {
      console.log('❌ Error extrayendo tesis:', error)
      return null
    }
  }

  /**
   * Extrae texto usando múltiples selectores
   */
  private extraerTexto(elemento: Element, selectores: string[]): string {
    for (const selector of selectores) {
      const elem = elemento.querySelector(selector)
      if (elem && elem.textContent) {
        return elem.textContent.trim()
      }
    }

    // Si no encuentra con selectores, usar el texto del elemento completo
    return elemento.textContent?.trim() || ''
  }

  /**
   * Extracción por análisis de texto cuando fallan los selectores
   */
  private extraerTesisPorTexto(doc: Document): ResultadoBusqueda {
    const textoCompleto = doc.body.textContent || ''
    const tesis: Tesis[] = []

    // Buscar patrones típicos de tesis
    const patronesTesis = [
      /TESIS\s+[IVX]+\/\d+\/\d+/gi,
      /JURISPRUDENCIA\s+\d+\/\d+/gi,
      /Registro\s+digital:\s*(\d+)/gi,
      /Época:\s*([^.]+)/gi
    ]

    // Si encontramos patrones de tesis, crear una tesis genérica
    let encontroPatrones = false
    for (const patron of patronesTesis) {
      if (patron.test(textoCompleto)) {
        encontroPatrones = true
        break
      }
    }

    if (encontroPatrones) {
      tesis.push({
        id: `scraped-text-${Date.now()}`,
        registro_digital: 'scraped-content',
        rubro: 'Contenido encontrado en SJF (requiere análisis manual)',
        texto: textoCompleto.substring(0, 500) + '...',
        tipo: 'aislada',
        epoca: 'Por determinar',
        materia: 'común',
        fuente: 'SJF (Scraped - Texto)'
      })
    }

    return {
      tesis,
      total: tesis.length,
      pagina: 1,
      total_paginas: 1
    }
  }

  /**
   * Convierte item individual a tesis
   */
  private convertirItemATesis(item: any): Tesis {
    return {
      id: item.id || item.registroDigital || item.registro || `scraped-${Date.now()}`,
      registro_digital: item.registroDigital || item.registro || item.id || '',
      rubro: item.rubro || item.titulo || item.title || 'Sin rubro',
      texto: item.texto || item.contenido || item.content || item.description || '',
      tipo: (item.tipo || item.type || '').toLowerCase().includes('jurisprudencia') ? 'jurisprudencia' : 'aislada',
      epoca: item.epoca || item.epoch || 'Décima Época',
      materia: (item.materia || item.subject || 'común').toLowerCase(),
      fuente: item.fuente || item.source || 'SJF (Scraped)',
      numero_tesis: item.numero_tesis || item.numeroTesis || item.tesis,
      instancia: item.instancia || item.instance || item.court,
      sala: item.sala || item.instancia
    }
  }

  /**
   * Genera reporte de scraping
   */
  async generarReporteScraping(termino: string): Promise<any> {
    console.log(`📊 Generando reporte de scraping para: "${termino}"`)
    
    const sitios = Object.keys(this.baseUrls)
    const resultados = []

    for (const sitio of sitios) {
      try {
        const inicio = Date.now()
        let resultado

        switch (sitio) {
          case 'sjf2':
            resultado = await this.scrapearSJF2(termino)
            break
          case 'bicentenario':
            resultado = await this.scrapearBicentenario(termino)
            break
          case 'sjfSemanal':
            resultado = await this.scrapearSJFSemanal(termino)
            break
        }

        const duracion = Date.now() - inicio

        resultados.push({
          sitio,
          success: true,
          tesisEncontradas: resultado?.tesis.length || 0,
          duracion,
          datos: resultado
        })

      } catch (error) {
        resultados.push({
          sitio,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          tesisEncontradas: 0
        })
      }
    }

    const reporte = {
      timestamp: new Date().toISOString(),
      termino,
      sitiosProbados: sitios.length,
      sitiosExitosos: resultados.filter(r => r.success).length,
      totalTesis: resultados.reduce((acc, r) => acc + r.tesisEncontradas, 0),
      resultados,
      recomendaciones: this.generarRecomendacionesScraping(resultados)
    }

    localStorage.setItem('k-law-scraping-report', JSON.stringify(reporte))
    return reporte
  }

  /**
   * Genera recomendaciones basadas en el scraping
   */
  private generarRecomendacionesScraping(resultados: any[]): string[] {
    const recomendaciones: string[] = []
    const exitosos = resultados.filter(r => r.success)
    const totalTesis = resultados.reduce((acc, r) => acc + r.tesisEncontradas, 0)

    if (exitosos.length === 0) {
      recomendaciones.push('❌ Ningún sitio respondió al scraping')
      recomendaciones.push('🔧 Verificar conectividad y proxies')
      recomendaciones.push('💡 Considerar análisis manual de HTML')
    } else {
      recomendaciones.push(`✅ ${exitosos.length} sitios respondieron`)
      
      if (totalTesis > 0) {
        recomendaciones.push(`📚 ${totalTesis} tesis extraídas total`)
        recomendaciones.push('🚀 Implementar scraping como fallback')
      } else {
        recomendaciones.push('⚠️ Sitios respondieron pero sin tesis válidas')
        recomendaciones.push('🔍 Mejorar parsers HTML específicos')
      }
    }

    return recomendaciones
  }
}

export const sjfScraper = new SJFScraper()
export default SJFScraper