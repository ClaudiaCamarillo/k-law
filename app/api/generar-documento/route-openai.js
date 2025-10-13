import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const body = await req.json()
    const { tipoDocumento, datos } = body

    console.log('Recibiendo petición para generar:', tipoDocumento)
    console.log('Datos recibidos:', datos)

    if (!tipoDocumento || !datos) {
      return NextResponse.json(
        { error: 'Tipo de documento y datos son requeridos' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada')
      throw new Error('API key no configurada')
    }

    // Crear prompt específico según el tipo de documento
    let prompt = ''
    
    switch (tipoDocumento) {
      case 'Demanda de Amparo Indirecto':
        prompt = `Genera una demanda de amparo indirecto profesional en formato HTML con los siguientes datos:
        - Promovente: ${datos.promovente}
        - Autoridad Responsable: ${datos.autoridadResponsable}
        - Acto Reclamado: ${datos.actoReclamado}
        - Fecha de Notificación: ${datos.fechaNotificacion}
        - Derechos Violados: ${datos.derechosViolados}
        - Argumentos: ${datos.argumentos}
        
        La demanda debe incluir:
        1. Encabezado formal dirigido al Juez de Distrito
        2. Datos del promovente
        3. Acto reclamado detallado
        4. Autoridades responsables
        5. Conceptos de violación
        6. Fundamentos legales (Constitución y Ley de Amparo)
        7. Puntos petitorios
        8. Lugar y fecha
        
        Formato HTML con estilos inline profesionales.`
        break

      case 'Demanda de Amparo Directo':
        prompt = `Genera una demanda de amparo directo profesional en formato HTML con los siguientes datos:
        - Quejoso: ${datos.quejoso}
        - Sentencia Impugnada: ${datos.sentencia}
        - Tribunal: ${datos.tribunal}
        - Conceptos de Violación: ${datos.conceptosViolacion}
        
        La demanda debe incluir estructura formal de amparo directo con fundamentos legales.`
        break

      case 'Contrato de Arrendamiento':
        prompt = `Genera un contrato de arrendamiento profesional en formato HTML con los siguientes datos:
        - Arrendador: ${datos.arrendador}
        - Arrendatario: ${datos.arrendatario}
        - Inmueble: ${datos.inmueble}
        - Tipo de Inmueble: ${datos.tipoInmueble}
        - Renta Mensual: $${datos.renta} MXN
        - Duración: ${datos.duracion} meses
        - Fecha de Inicio: ${datos.fechaInicio}
        
        El contrato debe incluir:
        1. Declaraciones de las partes
        2. Cláusulas estándar (objeto, renta, vigencia, obligaciones)
        3. Garantías y depósito
        4. Causales de rescisión
        5. Jurisdicción
        6. Firmas
        
        Formato HTML profesional con estilos inline.`
        break

      case 'Contrato de Servicios':
        prompt = `Genera un contrato de prestación de servicios profesionales en formato HTML con:
        - Prestador: ${datos.prestador}
        - Cliente: ${datos.cliente}
        - Servicios: ${datos.servicios}
        - Honorarios: $${datos.honorarios} MXN
        - Forma de Pago: ${datos.formaPago}
        - Duración: ${datos.duracion}
        
        Incluir cláusulas profesionales y formato HTML con estilos.`
        break

      case 'Contrato de Compraventa':
        prompt = `Genera un contrato de compraventa profesional en formato HTML con:
        - Vendedor: ${datos.vendedor}
        - Comprador: ${datos.comprador}
        - Descripción del Bien: ${datos.bien}
        - Precio: $${datos.precio} MXN
        - Forma de Pago: ${datos.formaPago}
        - Fecha de Entrega: ${datos.fechaEntrega}
        
        Incluir declaraciones, cláusulas de compraventa, garantías y formato HTML profesional.`
        break

      default:
        prompt = `Genera un documento legal profesional de tipo "${tipoDocumento}" con los siguientes datos: ${JSON.stringify(datos)}. Formato HTML con estilos inline.`
    }

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un abogado experto mexicano que genera documentos legales profesionales. Siempre generas documentos completos, formales y con fundamentos legales mexicanos actualizados. Usas formato HTML con estilos inline profesionales."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })

    const documentoGenerado = completion.choices[0].message.content

    // Agregar estilos base si no están incluidos
    const documentoConEstilos = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tipoDocumento}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          h1, h2, h3 {
            text-align: center;
            margin: 20px 0;
          }
          .header {
            text-align: right;
            margin-bottom: 30px;
          }
          .content {
            text-align: justify;
            margin: 20px 0;
          }
          .firma {
            margin-top: 60px;
            text-align: center;
          }
          .clausula {
            margin: 15px 0;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        ${documentoGenerado}
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>Documento generado con K-LAW | ${new Date().toLocaleDateString('es-MX')}</p>
        </div>
      </body>
      </html>
    `

    return NextResponse.json({ 
      documento: documentoConEstilos,
      success: true 
    })

  } catch (error) {
    console.error('Error detallado al generar documento:', error)
    console.error('Mensaje de error:', error.message)
    if (error.response) {
      console.error('Respuesta de error:', error.response.data)
    }
    
    // Documento de respaldo en caso de error
    const documentoRespaldo = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Documento Legal</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { text-align: center; color: #0A1628; }
          .error { background: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 8px; color: #991b1b; }
        </style>
      </head>
      <body>
        <h1>${req.body?.tipoDocumento || 'Documento Legal'}</h1>
        <div class="error">
          <h2>Error al generar el documento</h2>
          <p>Lo sentimos, no pudimos generar el documento automáticamente. Por favor, intente nuevamente más tarde.</p>
          <p>Si el problema persiste, contacte a soporte técnico.</p>
        </div>
      </body>
      </html>
    `
    
    return NextResponse.json({ 
      documento: documentoRespaldo,
      success: false,
      error: 'Error al generar el documento con IA' 
    })
  }
}