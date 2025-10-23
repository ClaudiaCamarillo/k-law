import { Articulo } from './tipos-legislacion'

export function parsearArticulos(contenido: string): Articulo[] {
  // PRIMERO: Limpiar el texto de basura
  let textoLimpio = contenido
    // Eliminar encabezados de página
    .replace(/CÓDIGO DE COMERCIO[\s\S]*?Última Reforma DOF[\s\S]*?\d{2}-\d{2}-\d{4}/g, '')
    .replace(/Secretaría de Servicios Parlamentarios[\s\S]*?Última Reforma DOF[\s\S]*?\d{2}-\d{2}-\d{4}/g, '')
    // Eliminar otros patrones problemáticos
    .replace(/CÁMARA DE DIPUTADOS DEL H\. CONGRESO DE LA UNIÓN/g, '')
    .replace(/Secretaría General/g, '')
    // Eliminar paginación
    .replace(/\d+ de \d+/g, '');

  const articulos: Articulo[] = [];
  let tituloCapituloActual = '';
  
  // Dividir por artículos - captura el número correctamente
  const regex = /Art[íi]culo\s+(\d+)[oº°]?\s*\.?\s*[-–—]?\s*((?:(?!Art[íi]culo\s+\d+).)*)/gis;
  const matches = [...textoLimpio.matchAll(regex)];
  
  // Procesar cada match
  matches.forEach((match) => {
    const numero = match[1];
    let contenido = match[2] || '';
    
    // Detectar y separar títulos/capítulos del contenido
    const tituloMatch = contenido.match(/(T[ÍI]TULO|CAP[ÍI]TULO|SECCIÓN)[^\n]*\n/i);
    if (tituloMatch && contenido.indexOf(tituloMatch[0]) < 100) {
      // Si hay un título al inicio del contenido, separárlo
      tituloCapituloActual = tituloMatch[0].trim();
      contenido = contenido.replace(tituloMatch[0], '');
    }
    
    // Buscar títulos al final para el siguiente artículo
    const tituloFinalMatch = contenido.match(/(T[ÍI]TULO|CAP[ÍI]TULO|SECCIÓN)[\s\S]*$/i);
    if (tituloFinalMatch) {
      contenido = contenido.substring(0, contenido.indexOf(tituloFinalMatch[0]));
      tituloCapituloActual = tituloFinalMatch[0].trim();
    }
    
    // Limpiar el contenido
    contenido = contenido
      .replace(/Artículo (reformado|derogado|adicionado) DOF.*$/gm, '')
      .replace(/Fracción (reformada|derogada|adicionada) DOF.*$/gm, '')
      .replace(/Párrafo (reformado|derogado|adicionado) DOF.*$/gm, '')
      .trim();
    
    // Agregar saltos de línea para mejor formato
    contenido = contenido
      // Fracciones romanas con doble salto de línea
      .replace(/([^\n])\s*([IVX]+)\s*\.[-–—]?\s*/g, '$1\n\n$2.- ')
      // Incisos con letras
      .replace(/([.;:])\s*([a-z]\))/g, '$1\n\n$2')
      // Numerales
      .replace(/([.;:])\s*(\d+\.-)/g, '$1\n\n$2')
      // Párrafos después de punto y seguido
      .replace(/\.\s+([A-Z])/g, '.\n\n$1');
    
    if (numero && contenido) {
      articulos.push({
        numero: numero,
        texto: contenido,
        tituloCapitulo: tituloCapituloActual,
        esTransitorio: /transitori/i.test(contenido) || /transitori/i.test(tituloCapituloActual),
        notasReforma: undefined,
        fechaReforma: undefined
      });
    }
  });
  
  return articulos;
}

function combinarTituloCapitulo(titulo: string, capitulo: string): string {
  if (titulo && capitulo) {
    return `${titulo} - ${capitulo}`
  } else if (titulo) {
    return titulo
  } else if (capitulo) {
    return capitulo
  }
  return ''
}

function separarNotasReforma(texto: string): { texto: string; notasReforma: string[] } {
  const notasReforma: string[] = []
  
  // Regex para detectar notas de reforma
  const regexNotasReforma = /((?:Artículo|Párrafo|Fracción|Inciso|Numeral|Texto)\s+(?:reformado|adicionado|derogado|recorrido)[^.]*DOF\s+\d{2}-\d{2}-\d{4})/gi
  
  // Encontrar todas las notas de reforma
  const matches = [...texto.matchAll(regexNotasReforma)]
  
  // Eliminar las notas del texto principal
  let textoLimpio = texto
  matches.forEach(match => {
    notasReforma.push(match[0].trim())
    textoLimpio = textoLimpio.replace(match[0], '')
  })
  
  return {
    texto: textoLimpio.trim(),
    notasReforma
  }
}

function procesarTextoArticulo(texto: string): string {
  // Preservar saltos de línea originales pero normalizar espacios excesivos
  let textoFormateado = texto
    .replace(/\r\n/g, '\n') // Normalizar saltos de línea de Windows
    .replace(/\n{4,}/g, '\n\n\n') // Limitar saltos de línea consecutivos a máximo 3
    .trim()
  
  // Detectar y formatear fracciones romanas (I., II., III., etc.)
  textoFormateado = textoFormateado.replace(/(?<=\n|^|\.\s)(\s*)((?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII|XXIII|XXIV|XXV|XXVI|XXVII|XXVIII|XXIX|XXX|XL|L|LX|LXX|LXXX|XC|C)\.[-–—]?\s*)/gm, 
    (match, spaces, roman) => {
      return `\n\n${roman}`
    })
  
  // Detectar y formatear incisos con letras (a), b), c), etc. o a.-, b.-, etc.
  textoFormateado = textoFormateado.replace(/(?<=\n|^|\.\s)(\s*)([a-z]\)[-–—]?\s*)/gm, 
    (match, spaces, inciso) => {
      return `\n\n    ${inciso}`
    })
  
  // Detectar y formatear numerales (1., 2., 3., etc.)
  textoFormateado = textoFormateado.replace(/(?<=\n|^|\.\s)(\s*)(\d{1,2}\.[-–—]?\s*)/gm, 
    (match, spaces, numeral) => {
      return `\n\n  ${numeral}`
    })
  
  return textoFormateado
}

function normalizeNumeroArticulo(numero: string): string {
  // Normalizar números con símbolos de grado
  numero = numero.replace(/[°oº]/g, '')
  
  // Convertir números escritos a números
  const numerosEscritos: { [key: string]: string } = {
    'primero': '1',
    'segundo': '2',
    'tercero': '3',
    'cuarto': '4',
    'quinto': '5',
    'sexto': '6',
    'séptimo': '7',
    'septimo': '7',
    'octavo': '8',
    'noveno': '9',
    'décimo': '10',
    'decimo': '10'
  }
  
  const numeroLower = numero.toLowerCase()
  if (numerosEscritos[numeroLower]) {
    return numerosEscritos[numeroLower]
  }
  
  return numero
}

export function obtenerVistaPrevia(articulos: Articulo[], limite: number = 5): string {
  const primeros = articulos.slice(0, limite)
  let vista = `Se encontraron ${articulos.length} artículos\n\n`
  
  // Mostrar advertencia si hay demasiados artículos (probablemente un error)
  if (articulos.length > 1000) {
    vista += `⚠️ ADVERTENCIA: Se detectaron ${articulos.length} artículos, lo cual parece excesivo. Verifica el contenido.\n\n`
  }
  
  // Verificar si faltan los primeros artículos
  const numerosArticulos = articulos.map(a => parseInt(a.numero)).sort((a, b) => a - b)
  const primerArticulo = numerosArticulos[0]
  if (primerArticulo > 1) {
    vista += `⚠️ ADVERTENCIA: El primer artículo es el ${primerArticulo}. Faltan los artículos 1-${primerArticulo - 1}.\n\n`
  }
  
  primeros.forEach((art, index) => {
    vista += `--- Artículo ${art.numero} ---\n`
    if (art.tituloCapitulo) {
      vista += `[${art.tituloCapitulo}]\n`
    }
    vista += `${art.texto.substring(0, 150)}${art.texto.length > 150 ? '...' : ''}\n\n`
  })
  
  if (articulos.length > limite) {
    vista += `... y ${articulos.length - limite} artículos más`
  }
  
  return vista
}