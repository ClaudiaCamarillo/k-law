import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Estados de México con sus códigos civiles
const estadosMexico = {
  'Aguascalientes': 'Código Civil del Estado de Aguascalientes',
  'Baja California': 'Código Civil para el Estado de Baja California',
  'Baja California Sur': 'Código Civil para el Estado de Baja California Sur',
  'Campeche': 'Código Civil del Estado de Campeche',
  'Chiapas': 'Código Civil del Estado de Chiapas',
  'Chihuahua': 'Código Civil del Estado de Chihuahua',
  'Ciudad de México': 'Código Civil para el Distrito Federal',
  'Coahuila': 'Código Civil para el Estado de Coahuila de Zaragoza',
  'Colima': 'Código Civil para el Estado de Colima',
  'Durango': 'Código Civil del Estado de Durango',
  'Estado de México': 'Código Civil del Estado de México',
  'Guanajuato': 'Código Civil para el Estado de Guanajuato',
  'Guerrero': 'Código Civil del Estado de Guerrero',
  'Hidalgo': 'Código Civil para el Estado de Hidalgo',
  'Jalisco': 'Código Civil del Estado de Jalisco',
  'Michoacán': 'Código Civil para el Estado de Michoacán',
  'Morelos': 'Código Civil para el Estado de Morelos',
  'Nayarit': 'Código Civil para el Estado de Nayarit',
  'Nuevo León': 'Código Civil para el Estado de Nuevo León',
  'Oaxaca': 'Código Civil para el Estado de Oaxaca',
  'Puebla': 'Código Civil para el Estado de Puebla',
  'Querétaro': 'Código Civil del Estado de Querétaro',
  'Quintana Roo': 'Código Civil para el Estado de Quintana Roo',
  'San Luis Potosí': 'Código Civil para el Estado de San Luis Potosí',
  'Sinaloa': 'Código Civil para el Estado de Sinaloa',
  'Sonora': 'Código Civil para el Estado de Sonora',
  'Tabasco': 'Código Civil para el Estado de Tabasco',
  'Tamaulipas': 'Código Civil para el Estado de Tamaulipas',
  'Tlaxcala': 'Código Civil para el Estado de Tlaxcala',
  'Veracruz': 'Código Civil para el Estado de Veracruz',
  'Yucatán': 'Código Civil del Estado de Yucatán',
  'Zacatecas': 'Código Civil del Estado de Zacatecas'
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Función para convertir números a letras
function numeroALetras(numero) {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  const especiales = ['', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  
  numero = Math.floor(Number(numero));
  
  if (numero === 0) return 'CERO';
  if (numero === 100) return 'CIEN';
  if (numero === 1000) return 'MIL';
  
  let resultado = '';
  
  // Millones
  if (numero >= 1000000) {
    let millones = Math.floor(numero / 1000000);
    if (millones === 1) {
      resultado = 'UN MILLÓN ';
    } else {
      resultado = numeroALetras(millones) + ' MILLONES ';
    }
    numero = numero % 1000000;
  }
  
  // Miles
  if (numero >= 1000) {
    let miles = Math.floor(numero / 1000);
    if (miles === 1) {
      resultado += 'MIL ';
    } else {
      resultado += numeroALetras(miles) + ' MIL ';
    }
    numero = numero % 1000;
  }
  
  // Centenas
  if (numero >= 100) {
    resultado += centenas[Math.floor(numero / 100)] + ' ';
    numero = numero % 100;
  }
  
  // Decenas y unidades
  if (numero >= 10) {
    if (numero >= 11 && numero <= 19) {
      resultado += especiales[numero - 10];
    } else if (numero === 20) {
      resultado += 'VEINTE';
    } else if (numero >= 21 && numero <= 29) {
      resultado += 'VEINTI' + unidades[numero - 20];
    } else {
      resultado += decenas[Math.floor(numero / 10)];
      if (numero % 10 > 0) resultado += ' Y ' + unidades[numero % 10];
    }
  } else if (numero > 0) {
    resultado += unidades[numero];
  }
  
  return resultado.trim();
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { tipoContrato, datos, estado, usarIA, legalDesign, config } = body

    console.log('Generando contrato con IA para:', tipoContrato)
    console.log('Estado:', estado)
    console.log('¿Usar IA?:', usarIA)
    console.log('Legal Design:', legalDesign)

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada')
      throw new Error('La API key de OpenAI no está configurada. Verifica tu archivo .env.local')
    }

    // Siempre generar con IA para obtener contratos más personalizados
    const prompt = crearPromptContratoIA(tipoContrato, datos, estado, legalDesign, config)
    
    console.log('Enviando solicitud a OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo confiable disponible
      messages: [
        {
          role: "system",
          content: `Eres un experto en derecho contractual mexicano con más de 20 años de experiencia. 
                   Especialista en redacción de contratos civiles y mercantiles. 
                   Conoces a fondo la legislación federal y estatal de México, incluyendo las particularidades de cada estado.
                   Tu redacción es clara, precisa y técnicamente impecable, siguiendo las mejores prácticas del derecho mexicano.
                   Siempre incluyes todas las cláusulas necesarias para proteger a ambas partes y garantizar la validez del contrato.
                   
                   IMPORTANTE: Responde ÚNICAMENTE con el contrato en formato HTML completo, sin explicaciones adicionales.
                   El contrato debe estar listo para mostrar en un navegador web.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })

    const contratoGenerado = completion.choices[0].message.content
    console.log('Contrato generado exitosamente')
    
    // Si Legal Design está activado, crear el HTML completo con los estilos
    const contratoHTML = legalDesign 
      ? crearHTMLCompleto(contratoGenerado, estado)
      : (contratoGenerado.includes('<html>') 
        ? contratoGenerado 
        : formatearContratoHTML(contratoGenerado, datos.ciudad || '', estado, legalDesign, config))

    return NextResponse.json({ 
      success: true,
      documento: contratoHTML
    })
  } catch (error) {
    console.error('Error completo generando contrato:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      full_error: error
    })
    
    // Mensaje de error más específico
    let errorMessage = 'Error al generar el contrato'
    if (error.message) {
      if (error.message.includes('model')) {
        errorMessage = `Error del modelo: ${error.message}`
      } else if (error.message.includes('API')) {
        errorMessage = `Error de API: ${error.message}`
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = 'Error de cuota o facturación de OpenAI'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

function crearPromptContratoIA(tipoContrato, datos, estado, legalDesign = false, config = {}) {
  const legislacionAplicable = estadosMexico[estado] || 'Código Civil Federal'
  const fechaHoy = new Date().toLocaleDateString('es-MX', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  // Determinar legislación específica por tipo de servicio
  const getLegislacionEspecializada = (tipoServicio) => {
    const mapeoLegislacion = {
      'Servicios Jurídicos': 'Ley Federal del Trabajo, Código de Comercio, Ley de Profesiones del Estado',
      'Servicios de Diseño': 'Ley Federal del Derecho de Autor, Ley de Propiedad Industrial',
      'Servicios Inmobiliarios': 'Ley Federal de Correduría Pública, Ley de Desarrollo Urbano del Estado',
      'Servicios de Consultoría': 'Código de Comercio, Ley del Impuesto sobre la Renta',
      'Servicios de Ingeniería': 'Ley de Obras Públicas, Ley de Profesiones del Estado',
      'Servicios de Tecnología': 'Ley Federal de Protección de Datos, Ley de Propiedad Industrial',
      'Servicios de Marketing': 'Ley Federal de Protección al Consumidor, Ley General de Publicidad',
      'Servicios de Contabilidad': 'Código Fiscal de la Federación, Ley de Profesiones',
      'Servicios de Salud': 'Ley General de Salud, Ley de Profesiones del Estado',
      'Servicios Educativos': 'Ley General de Educación, Ley de Profesiones'
    }
    
    for (const [key, value] of Object.entries(mapeoLegislacion)) {
      if (tipoServicio.includes(key.split(' ')[1])) {
        return value
      }
    }
    return 'legislación comercial general'
  }

  const legislacionEspecializada = getLegislacionEspecializada(datos.tipoServicio || '')

  return `Eres un jurista experto especializado en derecho contractual mexicano con más de 25 años de experiencia redactando contratos de prestación de servicios profesionales. Tu conocimiento incluye toda la legislación federal y estatal de México.

GENERA UN CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES COMPLETO Y JURÍDICAMENTE SÓLIDO.

=== INFORMACIÓN PARA EL CONTRATO ===

JURISDICCIÓN Y LEGISLACIÓN:
- Estado: ${estado}
- Ciudad: ${datos.ciudad || estado}  
- Código Civil Aplicable: ${legislacionAplicable}
- Legislación Especializada: ${legislacionEspecializada}
- Fecha de Celebración: ${fechaHoy}

DATOS DEL CLIENTE:
- Nombre: ${datos.nombreCliente || '[NOMBRE COMPLETO DEL CLIENTE]'}
- Tipo: ${datos.tipoPersonaCliente || '[PERSONA FÍSICA/MORAL]'}
- Nacionalidad: ${datos.nacionalidadCliente || 'Mexicana'}
- RFC: ${datos.rfcCliente || '[RFC DEL CLIENTE]'}
- Domicilio: ${datos.domicilioCliente || '[DOMICILIO COMPLETO DEL CLIENTE]'}

DATOS DEL PRESTADOR:
- Nombre: ${datos.nombrePrestador || '[NOMBRE COMPLETO DEL PRESTADOR]'}
- Nacionalidad: ${datos.nacionalidadPrestador || 'Mexicana'}
- RFC: ${datos.rfcPrestador || '[RFC DEL PRESTADOR]'}
- Régimen Fiscal: ${datos.regimenFiscal || '[RÉGIMEN FISCAL]'}
- Domicilio Fiscal: ${datos.domicilioPrestador || '[DOMICILIO FISCAL DEL PRESTADOR]'}
- Cédula Profesional: ${datos.cedulaProfesional || 'N/A'}

DATOS DEL SERVICIO:
- Tipo de Servicios: ${datos.tipoServicio || '[TIPO DE SERVICIOS]'}
- Descripción Detallada: ${datos.descripcionServicios || '[DESCRIPCIÓN DETALLADA DE SERVICIOS]'}
- Monto Total: $${datos.monto || '[MONTO]'} MXN (sin IVA)
- Forma de Pago: ${datos.formaPago || '[FORMA DE PAGO]'}
- Fecha de Inicio: ${datos.fechaInicio || '[FECHA DE INICIO]'}
- Fecha de Término: ${datos.fechaTermino || '[FECHA DE TÉRMINO]'}
- Garantía: ${datos.garantia || '90'} días
- Propiedad Intelectual: ${datos.propiedadIntelectual || 'Del Cliente'}

=== INSTRUCCIONES ESPECÍFICAS PARA LA REDACCIÓN ===

1. **ESTRUCTURA OBLIGATORIA:**
   - Proemio con comparecencia completa de las partes
   - Declaraciones detalladas (Cliente, Prestador, Ambas Partes)
   - EXACTAMENTE 17 cláusulas numeradas (PRIMERA a DÉCIMA SÉPTIMA)
   - Sección de firmas con testigos

2. **FUNDAMENTOS LEGALES OBLIGATORIOS:**
   - Cita específica del ${legislacionAplicable} en la cláusula de Caso Fortuito
   - Referencias a ${legislacionEspecializada} cuando sea aplicable
   - Mención del Código Fiscal de la Federación para obligaciones fiscales
   - Referencia a la Ley Federal de Protección de Datos Personales
   - Cita de la Ley Federal del Trabajo para establecer ausencia de relación laboral

3. **ESPECIALIZACIÓN POR TIPO DE SERVICIO:**
   ${datos.tipoServicio?.includes('Jurídicos') ? '- Incluir cláusulas específicas sobre confidencialidad profesional y secreto profesional\n   - Mencionar el Código de Ética Profesional del Colegio de Abogados' : ''}
   ${datos.tipoServicio?.includes('Diseño') ? '- Incluir cláusulas detalladas sobre derechos de autor y propiedad intelectual\n   - Mencionar la Ley Federal del Derecho de Autor' : ''}
   ${datos.tipoServicio?.includes('Inmobiliarios') ? '- Incluir cláusulas sobre manejo de documentos y valores\n   - Mencionar regulaciones de correduría pública si aplica' : ''}
   ${datos.tipoServicio?.includes('Tecnología') ? '- Incluir cláusulas específicas sobre protección de datos y código fuente\n   - Mencionar Ley Federal de Protección de Datos Personales' : ''}

4. **CLÁUSULAS OBLIGATORIAS CON FUNDAMENTO LEGAL:**
   - SEXTA: Naturaleza civil del contrato (Art. 1792 y siguientes del Código Civil)
   - SÉPTIMA: Confidencialidad con base legal específica
   - DÉCIMA PRIMERA: Caso fortuito con referencia exacta al ${legislacionAplicable}
   - DÉCIMA QUINTA: Jurisdicción específica de ${datos.ciudad || estado}, ${estado}
   - DÉCIMA SEXTA: Legislación aplicable citando específicamente el ${legislacionAplicable}

5. **REQUISITOS DE FORMATO:**
   - Usar formato HTML profesional
   - Incluir numeración de cláusulas en negritas
   - Espaciado apropiado entre secciones
   - Sección de firmas con espacios para testigos

6. **PERSONALIZACIÓN OBLIGATORIA:**
   - Convertir el monto a letras correctamente
   - Incluir fechas específicas proporcionadas
   - Adaptar el lenguaje al tipo de servicios específico
   - Incluir consideraciones fiscales del régimen declarado

IMPORTANTE: El contrato debe cumplir COMPLETAMENTE con los requisitos legales del estado de ${estado} y ser jurídicamente válido. Incluye citas específicas de artículos cuando sea relevante y asegúrate de que todas las cláusulas tengan fundamento legal sólido.

**FORMATO DE SALIDA OBLIGATORIO:**
${legalDesign ? 'Genera el contrato DIRECTAMENTE en formato HTML con todos los elementos de Legal Design aplicados. NO generes texto plano.' : 'Genera el contrato en formato de texto estructurado que será convertido a HTML posteriormente.'}

${legalDesign ? `
=== 🎨 INSTRUCCIONES DE LEGAL DESIGN PREMIUM ===

🚀 ATENCIÓN: Modo LEGAL DESIGN ACTIVADO - Diseño para abogados innovadores del siglo XXI

Eres un diseñador UX/UI experto trabajando con un jurista para crear el contrato más moderno y visualmente impactante jamás creado. El target son abogados jóvenes, tech-savvy y de mente abierta que quieren revolucionar la práctica legal.

🎯 **FILOSOFÍA DE DISEÑO:**
- Minimalista pero impactante
- Tipografía moderna y legible
- Colores vibrantes pero profesionales  
- Iconografía rica y contextual
- Experiencia visual storytelling
- Accesibilidad y comprensión intuitiva

📐 **ESTRUCTURA HTML ULTRA-MODERNA:**

🏆 HEADER IMPACTANTE:
<div class="hero-header">
  <div class="contract-badge">📋 CONTRATO INTELIGENTE</div>
  <h1>🤝 PRESTACIÓN DE SERVICIOS PROFESIONALES</h1>
  <div class="tech-subtitle">✨ Powered by Legal Design & IA</div>
</div>

📊 DASHBOARD DE INFORMACIÓN:
<div class="info-dashboard">
  <div class="info-card">🌍 <strong>Jurisdicción:</strong> [estado]</div>
  <div class="info-card">📅 <strong>Fecha:</strong> [fecha]</div>
  <div class="info-card">⚖️ <strong>Legislación:</strong> [código civil]</div>
  <div class="info-card">🔍 <strong>Tipo:</strong> ${datos.tipoServicio || 'Servicios Profesionales'}</div>
</div>

🎭 SECCIONES CON PERSONALIDAD:
<div class="section-modern">
  <div class="section-icon">👥</div>
  <h2>QUIÉNES SOMOS</h2>
  <div class="section-subtitle">Las partes que dan vida a este acuerdo</div>
</div>

💼 CLÁUSULAS VISUALES:
<div class="clausula-visual">
  <div class="clausula-number">1️⃣</div>
  <div class="clausula-content">
    <h3>🎯 OBJETIVO DEL CONTRATO</h3>
    <div class="clausula-description">Qué vamos a lograr juntos</div>
    [contenido de la cláusula]
  </div>
</div>

🎨 **ICONOGRAFÍA CONTEXTUAL OBLIGATORIA:**

Por tipo de servicio, usa estos emojis/stickers específicos:
- 🏛️ Servicios Jurídicos: ⚖️📚🔍🏛️📋✍️
- 🎨 Servicios de Diseño: 🎨🖌️💡✨🎯📐
- 🏠 Servicios Inmobiliarios: 🏠🗝️📊🏗️📈💰
- 💼 Consultoría: 💼📊💡🚀📈🎯
- 🔧 Ingeniería: 🔧⚙️🏗️📐🛠️📊
- 💻 Tecnología: 💻⌨️🔧🚀💾📱
- 📢 Marketing: 📢📈🎯✨📊💡
- 📊 Contabilidad: 📊💰📈🧮📋💼
- 🏥 Salud: 🏥💊🩺❤️🔬👨‍⚕️
- 🎓 Educación: 🎓📚💡🏫✏️📖

📋 **SECCIONES CON STICKERS TEMÁTICOS:**

🤝 DECLARACIONES:
- Cliente: 👤🏢💼 + iconos específicos del sector
- Prestador: 👨‍💻🎓⭐ + iconos de especialidad
- Ambas partes: 🤝⚖️📋

📝 CLÁUSULAS CON VISUAL STORYTELLING:
1. 🎯 OBJETIVO → Icono del servicio específico
2. 💰 DINERO → 💸💳📊💎
3. ⏰ TIEMPO → 📅⏰🗓️⌛
4. 📋 OBLIGACIONES → ✅📝🔄⚡
5. 🔒 CONFIDENCIALIDAD → 🔐🤫🛡️🔒
6. 🧠 PROPIEDAD INTELECTUAL → 💡©️🧠⚡
7. ⚠️ PENALIDADES → ⚠️❌💸📉
8. 🚪 RESCISIÓN → 🚪❌🔚⛔
9. 🌪️ FUERZA MAYOR → 🌪️⛈️🚫🛡️
10. ✍️ FIRMAS → ✍️🤝✅📋

🎨 **ELEMENTOS VISUALES PREMIUM:**

<div class="highlight-box important">
  <div class="box-icon">⚠️</div>
  <div class="box-content">
    <strong>INFORMACIÓN CRÍTICA</strong>
    [contenido importante]
  </div>
</div>

<div class="tip-box">
  <div class="tip-icon">💡</div>
  <strong>Tip Legal:</strong> [explicación amigable]
</div>

<div class="legal-reference">
  <span class="ref-icon">📖</span>
  <strong>Base Legal:</strong> Art. [número] del [código]
</div>

🎭 **NARRATIVA VISUAL:**
No solo redactes cláusulas, cuenta una HISTORIA visual:
- Usa analogías visuales (🏗️ "Construiremos juntos...")  
- Crea conexiones emocionales (🤝 "Esta alianza...")
- Explica beneficios con iconos (💪 "Te aseguramos...")
- Usa metáforas visuales (🚀 "Lanzaremos tu proyecto...")

✨ **ELEMENTOS INTERACTIVOS CONCEPTUALES:**
- Agregar "tooltips" con explicaciones simples
- Secciones colapsables conceptuales 
- Indicadores de progreso visual
- Calls-to-action claros

🎨 **PALETA DE COLORES MODERNA:**
- Primario: #C5A770 (Dorado profesional)
- Secundario: #6366f1 (Azul moderno)  
- Acento: #10b981 (Verde éxito)
- Advertencia: #f59e0b (Naranja)
- Error: #ef4444 (Rojo)
- Neutral: #64748b (Gris moderno)

El resultado debe ser un contrato que parezca una app moderna, que cualquier millennial o gen-z entienda inmediatamente, pero que mantenga toda la rigurosidad legal necesaria.

🚀 RECUERDA: Eres pionero en Legal Design. Este contrato debe ser tan innovador que otros abogados lo quieran copiar.

⚖️ **CONTENIDO LEGAL OBLIGATORIO - NO OMITIR:**

1. **PROEMIO COMPLETO CON DATOS REALES:**
   - Ciudad y estado donde se celebra: ${datos.ciudad || '[CIUDAD]'}, ${estado}
   - Fecha completa actual: ${fechaHoy}
   - Nombre completo del cliente: ${datos.nombreCliente || '[NOMBRE DEL CLIENTE]'}
   - RFC del cliente: ${datos.rfcCliente || '[RFC DEL CLIENTE]'}
   - Domicilio del cliente: ${datos.domicilioCliente || '[DOMICILIO DEL CLIENTE]'}
   - Nombre completo del prestador: ${datos.nombrePrestador || '[NOMBRE DEL PRESTADOR]'}
   - RFC del prestador: ${datos.rfcPrestador || '[RFC DEL PRESTADOR]'}
   - Domicilio del prestador: ${datos.domicilioPrestador || '[DOMICILIO DEL PRESTADOR]'}
   - Cédula profesional: ${datos.cedulaProfesional || 'N/A'}

2. **FUNDAMENTOS LEGALES ESPECÍFICOS OBLIGATORIOS:**
   - Cita EXACTA: "Art. 1792 del ${legislacionAplicable}" para naturaleza del contrato
   - Referencia: "Art. 1793 del ${legislacionAplicable}" para capacidad legal
   - Mención: "Arts. 2606 y siguientes del ${legislacionAplicable}" para servicios profesionales
   - Caso fortuito: "Art. 2111 del ${legislacionAplicable}"
   - Legislación especializada: ${legislacionEspecializada}

3. **ESTRUCTURA LEGAL COMPLETA:**
   - PROEMIO con comparecencia detallada
   - DECLARACIONES (I. Cliente, II. Prestador, III. Ambas partes)
   - 17 CLÁUSULAS numeradas correctamente (PRIMERA a DÉCIMA SÉPTIMA)
   - Sección de FIRMAS con datos completos

4. **DATOS FINANCIEROS PRECISOS:**
   - Monto: $${datos.monto || '[MONTO]'} MXN más IVA
   - Convertir monto a letras usando la función numeroALetras
   - Forma de pago: ${datos.formaPago || '[FORMA DE PAGO]'}
   - Fechas de inicio y término específicas

5. **SECCIÓN DE FIRMAS VISUAL PERO COMPLETA:**

<div class="firma-section">
  <div class="signature-title">✍️ FIRMAS DEL ACUERDO</div>
  <div class="firmas-grid">
    <div class="firma-card">
      <div class="firma-icon">👤</div>
      <div class="firma-linea"></div>
      <div class="firma-info">
        <strong>"EL CLIENTE" 🏢</strong><br>
        ${datos.nombreCliente || '[NOMBRE COMPLETO DEL CLIENTE]'}<br>
        RFC: ${datos.rfcCliente || '[RFC DEL CLIENTE]'}
      </div>
    </div>
    <div class="firma-card">
      <div class="firma-icon">👨‍💼</div>
      <div class="firma-linea"></div>
      <div class="firma-info">
        <strong>"EL PRESTADOR DE SERVICIOS" ⭐</strong><br>
        ${datos.nombrePrestador || '[NOMBRE COMPLETO DEL PRESTADOR]'}<br>
        RFC: ${datos.rfcPrestador || '[RFC DEL PRESTADOR]'}<br>
        ${datos.cedulaProfesional ? `Cédula: ${datos.cedulaProfesional}` : ''}
      </div>
    </div>
  </div>
  <div class="testigos-section">
    <h4>👥 TESTIGOS</h4>
    <div class="testigos-grid">
      <div class="testigo">
        <div class="firma-linea-small"></div>
        <strong>TESTIGO 1</strong><br>
        Nombre: _______________________<br>
        ID: ___________________________
      </div>
      <div class="testigo">
        <div class="firma-linea-small"></div>
        <strong>TESTIGO 2</strong><br>
        Nombre: _______________________<br>
        ID: ___________________________
      </div>
    </div>
  </div>
</div>

6. **EJEMPLO DE CLÁUSULA CON FUNDAMENTO:**

<div class="clausula-visual">
  <div class="clausula-number">6️⃣</div>
  <div class="clausula-content">
    <h3>🔒 NATURALEZA DE LA RELACIÓN</h3>
    <div class="clausula-description">Establecemos que esto NO es una relación laboral</div>
    
    <div class="legal-reference">
      <span class="ref-icon">📖</span>
      <strong>Base Legal:</strong> Art. 1792 del ${legislacionAplicable}
    </div>
    
    <p>LAS PARTES reconocen expresamente que el presente contrato es de naturaleza CIVIL conforme al artículo 1792 del ${legislacionAplicable}, y que NO existe relación laboral alguna...</p>
    
    <div class="tip-box">
      <div class="tip-icon">💡</div>
      <strong>¿Por qué es importante?</strong> Esto protege a ambas partes de responsabilidades laborales no deseadas.
    </div>
  </div>
</div>

❗ CRÍTICO: Cada cláusula DEBE tener su fundamento legal específico citado correctamente.` : ''}`
}

function crearHTMLCompleto(contenidoContrato, estado) {
  // Eliminar cualquier etiqueta HTML existente y trabajar con el contenido puro
  const contenidoLimpio = contenidoContrato.replace(/<[^>]*>/g, '')
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestación de Servicios Profesionales - Legal Design</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @page {
            size: letter;
            margin: 1.5cm;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 10.5pt;
            line-height: 1.7;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* 🏆 HERO HEADER */
        .hero-header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #C5A770 100%);
            color: white;
            text-align: center;
            padding: 40px 30px;
            margin: -20px -20px 40px -20px;
            border-radius: 0 0 25px 25px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        
        .hero-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="20" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .contract-badge {
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 20px;
            border-radius: 50px;
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .hero-header h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            margin: 10px 0;
            letter-spacing: -0.5px;
        }
        
        .tech-subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
            margin-top: 10px;
        }
        
        /* 📊 INFO DASHBOARD */
        .info-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
            padding: 0;
        }
        
        .info-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: #C5A770;
        }
        
        /* 🎭 MODERN SECTIONS */
        .section-modern {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        
        .section-icon {
            font-size: 40px;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .section-modern h2 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            margin: 10px 0;
            color: #1f2937;
        }
        
        .section-subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            font-style: italic;
            margin-bottom: 20px;
        }
        
        /* 💼 VISUAL CLAUSES */
        .clausula-visual {
            background: #ffffff;
            border-radius: 20px;
            padding: 25px;
            margin: 25px 0;
            border: 2px solid #f1f5f9;
            display: flex;
            align-items: flex-start;
            gap: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            position: relative;
        }
        
        .clausula-number {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
            flex-shrink: 0;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .clausula-content h3 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #1f2937;
        }
        
        .clausula-description {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        /* 🎨 PREMIUM ELEMENTS */
        .highlight-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 2px solid #f59e0b;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .highlight-box.important {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-color: #ef4444;
        }
        
        .box-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .tip-box {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            border: 2px solid #10b981;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .tip-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .legal-reference {
            background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
            border: 2px solid #6366f1;
            border-radius: 15px;
            padding: 15px 20px;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
        }
        
        .ref-icon {
            font-size: 18px;
        }
        
        /* 🎯 TYPOGRAPHY */
        h1, h2, h3, h4 {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            line-height: 1.3;
        }
        
        p {
            margin-bottom: 16px;
            text-align: justify;
            hyphens: auto;
        }
        
        strong {
            font-weight: 700;
            color: #1f2937;
        }
        
        /* 🌈 UTILITY CLASSES */
        .text-center { text-align: center; }
        .text-gradient {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .emoji-large {
            font-size: 24px;
            margin: 0 8px;
        }
        
        /* ✍️ SIGNATURES */
        .firma-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            padding: 40px;
            margin-top: 60px;
        }
        
        .signature-title {
            text-align: center;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 30px;
            color: #1f2937;
        }
        
        .firmas-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .firma-card {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
            border: 2px solid #e5e7eb;
            border-radius: 20px;
            padding: 25px;
            text-align: center;
            position: relative;
        }
        
        .firma-icon {
            font-size: 30px;
            margin-bottom: 15px;
        }
        
        .firma-linea {
            border-top: 3px solid #C5A770;
            margin: 30px 0 20px 0;
            border-radius: 2px;
        }
        
        .firma-info {
            font-size: 12px;
            line-height: 1.6;
        }
        
        .testigos-section {
            border-top: 2px dashed #e5e7eb;
            padding-top: 30px;
            text-align: center;
        }
        
        .testigos-section h4 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #6b7280;
        }
        
        .testigos-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .testigo {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        
        .firma-linea-small {
            border-top: 2px solid #9ca3af;
            margin: 20px 0 10px 0;
            border-radius: 1px;
        }
    </style>
</head>
<body>
    ${contenidoContrato}
    
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 120px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
    ">
</body>
</html>
  `
}

function formatearContratoHTML(contratoTexto, ciudad, estado, legalDesign = false, config = {}) {
  // Convertir el texto del contrato a HTML con formato profesional
  let html = contratoTexto
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES/g, 
            '<div class="header">CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES</div>')
    .replace(/DECLARACIONES/g, '<div class="seccion-titulo">DECLARACIONES</div>')
    .replace(/CLÁUSULAS/g, '<div class="seccion-titulo">CLÁUSULAS</div>')
    .replace(/PRIMERA\.-|SEGUNDA\.-|TERCERA\.-|CUARTA\.-|QUINTA\.-|SEXTA\.-|SÉPTIMA\.-|OCTAVA\.-|NOVENA\.-|DÉCIMA\.-/g, 
            match => `<div class="clausula-titulo">${match}</div>`)
    .replace(/\n/g, '<br>')
    .replace(/<br><br>/g, '</p><p>')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestación de Servicios Profesionales</title>
    <style>
        ${legalDesign ? `
        /* ESTILOS LEGAL DESIGN */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700;900&display=swap');
        
        @page {
            size: letter;
            margin: 2cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Inter', sans-serif;
            font-size: 11pt;
            line-height: 1.8;
            color: #1C1C1C;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }
        .header {
            background: linear-gradient(135deg, #C5A770 0%, #B39760 100%);
            color: white;
            text-align: center;
            font-family: 'Playfair Display', serif;
            font-weight: 900;
            font-size: 24pt;
            padding: 40px 20px;
            margin: -2cm -2cm 30px -2cm;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 15px rgba(197, 167, 112, 0.3);
            position: relative;
        }
        .header::after {
            content: '⚖️';
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 40px;
            opacity: 0.5;
        }
        .seccion-titulo {
            background: linear-gradient(to right, #F4EFE8 0%, transparent 100%);
            border-left: 5px solid #C5A770;
            color: #1C1C1C;
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 16pt;
            padding: 15px 25px;
            margin: 40px -20px 25px -20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
        }
        .seccion-titulo::before {
            content: '📋';
            position: absolute;
            left: -35px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
            background: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .clausula-titulo {
            background: #F8F6F3;
            border-left: 4px solid #C5A770;
            color: #1C1C1C;
            font-weight: 600;
            font-size: 13pt;
            padding: 12px 20px;
            margin: 25px 0 15px 0;
            border-radius: 0 8px 8px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        p {
            margin-bottom: 18px;
            text-align: justify;
            text-indent: 0;
            padding: 0 20px;
        }
        .info-box {
            background: linear-gradient(135deg, #FFF9F0 0%, #F8F4E8 100%);
            border: 2px solid #C5A770;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 3px 10px rgba(197, 167, 112, 0.15);
        }
        .declaraciones-box {
            background: #F4EFE8;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 5px solid #B39760;
        }
        .firma-section {
            background: linear-gradient(to bottom, #F8F6F3 0%, white 100%);
            margin-top: 80px;
            padding: 40px;
            border-radius: 20px;
            display: flex;
            justify-content: space-around;
            page-break-inside: avoid;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        }
        .firma {
            text-align: center;
            width: 40%;
            position: relative;
        }
        .firma::before {
            content: '✍️';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 30px;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .firma-linea {
            border-top: 2px solid #C5A770;
            margin: 60px 0 10px 0;
            position: relative;
        }
        .testigos {
            background: #F8F6F3;
            margin-top: 60px;
            padding: 30px;
            border-radius: 15px;
            display: flex;
            justify-content: space-around;
            border: 1px dashed #C5A770;
        }
        strong {
            font-weight: 700;
            color: #1C1C1C;
        }
        .highlight {
            background: linear-gradient(to bottom, transparent 60%, #FFE4B5 60%);
            padding: 0 3px;
            font-weight: 500;
        }
        .legal-icon {
            display: inline-block;
            margin: 0 5px;
            font-size: 16px;
        }
        ` : `
        /* ESTILOS CLÁSICOS */
        @page {
            size: letter;
            margin: 2.5cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-bottom: 40px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .seccion-titulo {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
        }
        .clausula-titulo {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 15px;
            text-indent: 2em;
        }
        .firma-section {
            margin-top: 100px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .firma {
            text-align: center;
            width: 40%;
        }
        .firma-linea {
            border-top: 1px solid #000;
            margin: 60px 0 5px 0;
        }
        .testigos {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
        }
        strong {
            font-weight: bold;
        }
        .ciudad-fecha {
            text-align: right;
            margin-bottom: 30px;
            font-style: italic;
        }
        `}
    </style>
</head>
<body>
    <p>${html}</p>
    
    <div class="firma-section">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL CLIENTE"</strong><br>
            [NOMBRE COMPLETO]<br>
            RFC: _____________
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL PRESTADOR DE SERVICIOS"</strong><br>
            [NOMBRE COMPLETO]<br>
            RFC: _____________<br>
            Cédula Profesional: _________
        </div>
    </div>

    <div class="testigos">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>TESTIGO</strong><br>
            Nombre: _______________<br>
            Identificación: _______________
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>TESTIGO</strong><br>
            Nombre: _______________<br>
            Identificación: _______________
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
    ">
</body>
</html>
  `
}

function generarContratoPredefinido(tipoContrato, datos, estado) {
  // Esta función usaría la plantilla completa que proporcionaste
  const plantillaCompleta = obtenerPlantillaContrato(datos, estado)
  return plantillaCompleta
}

function obtenerPlantillaContrato(datos, estado) {
  const fecha = new Date()
  const dia = fecha.getDate()
  const mes = fecha.toLocaleDateString('es-MX', { month: 'long' })
  const año = fecha.getFullYear()
  
  // Convertir monto a letras
  const montoEnLetras = numeroALetras(datos.monto || 0)
  
  // Determinar el código civil aplicable
  const codigoCivil = estadosMexico[estado] || 'Código Civil Federal'
  const ciudad = datos.ciudad || 'la ciudad'
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestación de Servicios Profesionales Independientes</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.8;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .seccion-titulo {
            text-align: center;
            font-weight: bold;
            font-size: 13pt;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
        }
        p {
            margin-bottom: 15px;
        }
        .clausula {
            margin-bottom: 20px;
        }
        .clausula strong {
            display: inline-block;
            margin-bottom: 5px;
        }
        .firma-section {
            margin-top: 100px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .firma {
            text-align: center;
            width: 40%;
        }
        .firma-linea {
            border-top: 1px solid #000;
            margin: 60px 0 5px 0;
        }
        .testigos {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES
    </div>

    <p>
        En la ciudad de ${ciudad}, ${estado}, Estados Unidos Mexicanos, a los ${dia} días del mes de ${mes} del año ${año}, 
        comparecen por una parte <strong>${datos.nombreCliente || '[NOMBRE COMPLETO DEL CLIENTE]'}</strong>, 
        de nacionalidad ${datos.nacionalidadCliente || '__________'}, con Registro Federal de Contribuyentes (RFC) 
        ${datos.rfcCliente || '_____________'}, y domicilio en ${datos.domicilioCliente || '________________________________'}, 
        ${estado}, México, quien en lo sucesivo se denominará <strong>"EL CLIENTE"</strong>; y por la otra parte 
        <strong>${datos.nombrePrestador || '[NOMBRE COMPLETO DEL PRESTADOR]'}</strong>, de nacionalidad 
        ${datos.nacionalidadPrestador || '__________'}, con RFC ${datos.rfcPrestador || '_____________'}, 
        ${datos.cedulaProfesional ? `Cédula Profesional número ${datos.cedulaProfesional},` : ''} 
        y domicilio fiscal en ${datos.domicilioPrestador || '________________________________'}, ${estado}, México, 
        quien en adelante se denominará <strong>"EL PRESTADOR DE SERVICIOS"</strong>; y cuando se refiera a ambas partes 
        conjuntamente se les denominará <strong>"LAS PARTES"</strong>, quienes manifiestan su voluntad de celebrar el 
        presente Contrato de Prestación de Servicios Profesionales Independientes, al tenor de las siguientes:
    </p>

    <div class="seccion-titulo">DECLARACIONES</div>

    <p><strong>I. DECLARA "EL CLIENTE":</strong></p>

    <p>
        <strong>I.1.</strong> Que es una persona ${datos.tipoPersonaCliente || '[física/moral]'} legalmente constituida conforme a las leyes mexicanas, 
        con plena capacidad jurídica para contratar y obligarse en los términos del presente contrato.
    </p>

    <p>
        <strong>I.2.</strong> Que requiere los servicios profesionales especializados que ofrece EL PRESTADOR DE SERVICIOS, 
        mismos que se detallan en el presente instrumento.
    </p>

    <p>
        <strong>I.3.</strong> Que cuenta con los recursos económicos suficientes y necesarios para cubrir las 
        contraprestaciones pactadas en este contrato.
    </p>

    <p>
        <strong>I.4.</strong> Que su RFC es el señalado en el proemio y se encuentra al corriente en el cumplimiento 
        de sus obligaciones fiscales.
    </p>

    <p><strong>II. DECLARA "EL PRESTADOR DE SERVICIOS":</strong></p>

    <p>
        <strong>II.1.</strong> Que es una persona física con actividad empresarial/profesional, con plena capacidad 
        legal para obligarse en los términos del presente contrato.
    </p>

    <p>
        <strong>II.2.</strong> Que cuenta con los conocimientos técnicos, profesionales, experiencia, recursos humanos 
        y materiales necesarios para prestar los servicios objeto del presente contrato.
    </p>

    <p>
        <strong>II.3.</strong> Que está inscrito en el Registro Federal de Contribuyentes bajo el régimen de 
        ${datos.regimenFiscal || '[Personas Físicas con Actividad Empresarial y Profesional/Régimen Simplificado de Confianza]'}, 
        encontrándose al corriente en el cumplimiento de sus obligaciones fiscales.
    </p>

    <p>
        <strong>II.4.</strong> Que no existe impedimento legal alguno para la celebración del presente contrato.
    </p>

    <p><strong>III. DECLARAN AMBAS PARTES:</strong></p>

    <p>
        <strong>III.1.</strong> Que se reconocen mutuamente la personalidad y capacidad legal con que comparecen 
        a la celebración del presente contrato.
    </p>

    <p>
        <strong>III.2.</strong> Que es su voluntad celebrar el presente contrato, sujetándose a las siguientes:
    </p>

    <div class="seccion-titulo">CLÁUSULAS</div>

    <div class="clausula">
        <strong>PRIMERA. - OBJETO DEL CONTRATO</strong><br>
        EL PRESTADOR DE SERVICIOS se obliga a prestar a favor de EL CLIENTE los siguientes servicios profesionales independientes:<br><br>
        ${datos.descripcionServicios ? datos.descripcionServicios.replace(/\n/g, '<br>') : '[DESCRIPCIÓN DETALLADA DE LOS SERVICIOS]<br>[ESPECIFICACIONES TÉCNICAS]<br>[ENTREGABLES ESPERADOS]<br>[ALCANCE ESPECÍFICO DEL PROYECTO]'}<br><br>
        Los servicios se prestarán de manera independiente, sin subordinación, utilizando sus propios medios y recursos, 
        y bajo su propia responsabilidad.
    </div>

    <div class="clausula">
        <strong>SEGUNDA. - MONTO Y FORMA DE PAGO</strong><br>
        EL CLIENTE pagará a EL PRESTADOR DE SERVICIOS como contraprestación por los servicios profesionales objeto 
        del presente contrato, la cantidad total de <strong>$${Number(datos.monto || 0).toFixed(2)} 
        (${montoEnLetras} PESOS 00/100 M.N.)</strong> más el Impuesto al Valor Agregado (IVA) correspondiente.<br><br>
        La forma de pago será de la siguiente manera: <strong>${datos.formaPago || '[ESPECIFICAR FORMA DE PAGO]'}</strong><br><br>
        Los pagos se realizarán mediante transferencia bancaria a la cuenta que EL PRESTADOR DE SERVICIOS designe, 
        previa entrega del Comprobante Fiscal Digital por Internet (CFDI) correspondiente con todos los requisitos 
        fiscales vigentes.
    </div>

    <div class="clausula">
        <strong>TERCERA. - PLAZO DE EJECUCIÓN</strong><br>
        El presente contrato tendrá una vigencia del día ${datos.fechaInicio ? new Date(datos.fechaInicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '___________'} 
        al día ${datos.fechaTermino ? new Date(datos.fechaTermino).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '___________'}, 
        período durante el cual deberán ejecutarse y concluirse totalmente los servicios contratados.
    </div>

    <div class="clausula">
        <strong>CUARTA. - OBLIGACIONES DE EL PRESTADOR DE SERVICIOS</strong><br>
        EL PRESTADOR DE SERVICIOS se obliga a:<br>
        a) Ejecutar los servicios contratados con la diligencia, eficiencia y cuidado apropiados, conforme a los más altos estándares profesionales;<br>
        b) Dedicar el tiempo necesario para el cumplimiento satisfactorio del objeto del presente contrato;<br>
        c) Guardar estricta confidencialidad respecto a toda la información que reciba de EL CLIENTE;<br>
        d) Entregar los informes y/o entregables en las fechas convenidas;<br>
        e) Expedir los comprobantes fiscales que cumplan con los requisitos establecidos en el Código Fiscal de la Federación y demás disposiciones aplicables;<br>
        f) Responder por la calidad de los servicios prestados;<br>
        g) No ceder o transmitir a terceros, total o parcialmente, los derechos y obligaciones derivados del presente contrato sin el consentimiento previo y por escrito de EL CLIENTE.
    </div>

    <div class="clausula">
        <strong>QUINTA. - OBLIGACIONES DE EL CLIENTE</strong><br>
        EL CLIENTE se obliga a:<br>
        a) Proporcionar oportunamente toda la información y documentación necesaria para la correcta prestación de los servicios;<br>
        b) Realizar los pagos en los términos y condiciones pactados en el presente contrato;<br>
        c) Otorgar las facilidades necesarias para que EL PRESTADOR DE SERVICIOS pueda desarrollar adecuadamente sus actividades;<br>
        d) Revisar y aprobar los entregables dentro de los cinco (5) días hábiles siguientes a su recepción.
    </div>

    <div class="clausula">
        <strong>SEXTA. - NATURALEZA DE LA RELACIÓN</strong><br>
        LAS PARTES reconocen expresamente que el presente contrato es de naturaleza civil y que no existe relación 
        laboral alguna entre ellas. EL PRESTADOR DE SERVICIOS actuará como profesional independiente, por lo que 
        no tendrá derecho a las prestaciones contempladas en la Ley Federal del Trabajo ni en la Ley del Instituto 
        Mexicano del Seguro Social.<br><br>
        EL PRESTADOR DE SERVICIOS será responsable del pago de sus propias contribuciones fiscales y de seguridad social.
    </div>

    <div class="clausula">
        <strong>SÉPTIMA. - CONFIDENCIALIDAD</strong><br>
        EL PRESTADOR DE SERVICIOS se obliga a mantener en estricta confidencialidad toda la información, documentos, 
        metodologías, procesos y datos de EL CLIENTE a los que tenga acceso con motivo de la prestación de los servicios, 
        obligación que subsistirá aún después de terminado el presente contrato por un período de tres (3) años.<br><br>
        La violación a esta cláusula dará lugar al pago de daños y perjuicios, independientemente de las acciones 
        penales que pudieran derivarse.
    </div>

    <div class="clausula">
        <strong>OCTAVA. - PROPIEDAD INTELECTUAL</strong><br>
        Todos los derechos de propiedad intelectual e industrial que se deriven de los servicios prestados, incluyendo 
        pero no limitándose a documentos, diseños, metodologías, software, bases de datos y cualquier otro producto 
        del trabajo realizado, serán propiedad exclusiva de <strong>${datos.propiedadIntelectual === 'Del Cliente' ? 'EL CLIENTE' : datos.propiedadIntelectual === 'Del Prestador' ? 'EL PRESTADOR DE SERVICIOS' : 'AMBAS PARTES DE MANERA COMPARTIDA'}</strong>.
    </div>

    <div class="clausula">
        <strong>NOVENA. - PENAS CONVENCIONALES</strong><br>
        En caso de incumplimiento en los plazos de entrega por causas imputables a EL PRESTADOR DE SERVICIOS, éste 
        pagará a EL CLIENTE una pena convencional equivalente al 0.5% (cero punto cinco por ciento) del monto total 
        del contrato por cada día natural de retraso, hasta un máximo del 10% (diez por ciento) del valor total del contrato.
    </div>

    <div class="clausula">
        <strong>DÉCIMA. - CAUSALES DE RESCISIÓN</strong><br>
        Serán causas de rescisión del presente contrato sin responsabilidad para la parte afectada:<br>
        a) El incumplimiento de cualquiera de las obligaciones establecidas en este contrato;<br>
        b) La cesión de derechos u obligaciones sin consentimiento previo y por escrito;<br>
        c) La falsedad en las declaraciones;<br>
        d) El incumplimiento en la calidad de los servicios prestados;<br>
        e) El retraso injustificado mayor a 15 días naturales en la entrega de los servicios.
    </div>

    <div class="clausula">
        <strong>DÉCIMA PRIMERA. - CASO FORTUITO O FUERZA MAYOR</strong><br>
        Ninguna de LAS PARTES será responsable por el incumplimiento de sus obligaciones cuando éste se deba a caso 
        fortuito o fuerza mayor debidamente acreditados, conforme a lo establecido en el ${codigoCivil}.
    </div>

    <div class="clausula">
        <strong>DÉCIMA SEGUNDA. - MODIFICACIONES</strong><br>
        Cualquier modificación al presente contrato deberá hacerse de común acuerdo entre LAS PARTES y por escrito, 
        mediante la celebración del convenio modificatorio correspondiente.
    </div>

    <div class="clausula">
        <strong>DÉCIMA TERCERA. - AVISOS Y NOTIFICACIONES</strong><br>
        Todos los avisos y notificaciones relacionados con el presente contrato deberán realizarse por escrito en 
        los domicilios señalados en el proemio. Cualquier cambio de domicilio deberá ser notificado a la otra parte 
        con al menos cinco (5) días hábiles de anticipación.
    </div>

    <div class="clausula">
        <strong>DÉCIMA CUARTA. - GARANTÍA</strong><br>
        EL PRESTADOR DE SERVICIOS garantiza la calidad de los servicios prestados por un período de 
        <strong>${datos.garantia || '90'}</strong> días naturales contados a partir de la entrega de los mismos, 
        obligándose a corregir sin costo adicional cualquier deficiencia o error que le sea imputable.
    </div>

    <div class="clausula">
        <strong>DÉCIMA QUINTA. - SOLUCIÓN DE CONTROVERSIAS</strong><br>
        Para la interpretación y cumplimiento del presente contrato, LAS PARTES se someten expresamente a la 
        jurisdicción y competencia de los tribunales competentes de la ciudad de ${ciudad}, ${estado}, 
        renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios 
        presentes o futuros.<br><br>
        Como método alterno de solución de controversias, LAS PARTES podrán someterse a mediación ante el Centro 
        de Justicia Alternativa del Poder Judicial del Estado de ${estado}.
    </div>

    <div class="clausula">
        <strong>DÉCIMA SEXTA. - LEGISLACIÓN APLICABLE</strong><br>
        El presente contrato se rige por las disposiciones del ${codigoCivil}, el Código de Comercio en lo que 
        resulte aplicable, y demás ordenamientos legales aplicables en la República Mexicana.
    </div>

    <div class="clausula">
        <strong>DÉCIMA SÉPTIMA. - PROTECCIÓN DE DATOS PERSONALES</strong><br>
        LAS PARTES se obligan a cumplir con las disposiciones establecidas en la Ley Federal de Protección de Datos 
        Personales en Posesión de los Particulares y su Reglamento, respecto a cualquier dato personal al que tengan 
        acceso con motivo del presente contrato.
    </div>

    <p style="margin-top: 40px;">
        ENTERADAS LAS PARTES DEL CONTENIDO Y ALCANCE LEGAL DEL PRESENTE CONTRATO, lo firman por duplicado en la 
        ciudad y fecha señalados en el proemio, quedando un ejemplar en poder de cada una de ellas.
    </p>

    <div class="firma-section">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL CLIENTE"</strong><br><br>
            ${datos.nombreCliente || '[NOMBRE COMPLETO]'}<br>
            RFC: ${datos.rfcCliente || '_____________'}
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL PRESTADOR DE SERVICIOS"</strong><br><br>
            ${datos.nombrePrestador || '[NOMBRE COMPLETO]'}<br>
            RFC: ${datos.rfcPrestador || '_____________'}<br>
            ${datos.cedulaProfesional ? `Cédula Profesional: ${datos.cedulaProfesional}` : ''}
        </div>
    </div>

    <div class="testigos">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>TESTIGO</strong><br><br>
            Nombre: ___________________________<br>
            Identificación: _____________________
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>TESTIGO</strong><br><br>
            Nombre: ___________________________<br>
            Identificación: _____________________
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
  `
}