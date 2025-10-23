export async function POST(request) {
  try {
    const data = await request.json()
    
    // Documento de prueba simple
    const documento = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Documento de Prueba</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Documento de Prueba</h1>
        <p>Este es un documento de prueba generado exitosamente.</p>
        <p>Tipo: ${data.tipoDocumento || 'No especificado'}</p>
        <p>Fecha: ${new Date().toLocaleString('es-MX')}</p>
        <hr>
        <h3>Datos recibidos:</h3>
        <pre>${JSON.stringify(data.datos || {}, null, 2)}</pre>
      </body>
      </html>
    `
    
    return Response.json({ 
      documento: documento,
      success: true 
    })
  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 })
  }
}