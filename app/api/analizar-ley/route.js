import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { nombreLey, tipoNotificacion } = await request.json();
    
    if (!nombreLey || !tipoNotificacion) {
      return NextResponse.json(
        { error: 'Faltan parametros requeridos' },
        { status: 400 }
      );
    }

    // Primero intentar buscar en la ley
    let completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un experto en derecho mexicano. Analiza cuándo surte efectos una notificación según la ley específica. 
          IMPORTANTE: Solo responde si encuentras información ESPECÍFICA en la ley mencionada.
          Si no encuentras información clara, responde con {"encontrado": false}
          Si encuentras información, responde con este formato JSON:
          {
            "encontrado": true,
            "surteEfectos": "mismo_dia|dia_siguiente|tercer_dia",
            "diasHabiles": true,
            "articulo": "número del artículo",
            "textoLegal": "texto exacto del artículo",
            "fuente": "ley"
          }`
        },
        {
          role: "user",
          content: `¿Cuándo surte efectos una notificación ${tipoNotificacion} según la ${nombreLey}?`
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });
    
    let respuestaTexto = completion.choices[0].message.content.trim();
    
    // Limpiar la respuesta para asegurar que sea JSON válido
    let jsonTexto = respuestaTexto;
    if (jsonTexto.startsWith('```json')) {
      jsonTexto = jsonTexto.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (jsonTexto.startsWith('```')) {
      jsonTexto = jsonTexto.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    let resultado = JSON.parse(jsonTexto);
    
    // Si no encontró en la ley, buscar en jurisprudencia
    if (!resultado.encontrado) {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un experto en derecho mexicano. Busca en la JURISPRUDENCIA mexicana (tesis aisladas y jurisprudencia de la SCJN) cuándo surte efectos una notificación.
            Responde con este formato JSON:
            {
              "encontrado": true,
              "surteEfectos": "mismo_dia|dia_siguiente|tercer_dia",
              "diasHabiles": true,
              "tesis": "número de tesis o registro",
              "textoLegal": "texto relevante de la jurisprudencia",
              "fuente": "jurisprudencia",
              "epoca": "época de la jurisprudencia"
            }`
          },
          {
            role: "user",
            content: `Busca en la jurisprudencia mexicana: ¿Cuándo surte efectos una notificación ${tipoNotificacion} en materia de ${nombreLey}?`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });
      
      respuestaTexto = completion.choices[0].message.content.trim();
      
      // Limpiar la respuesta para asegurar que sea JSON válido
      jsonTexto = respuestaTexto;
      if (jsonTexto.startsWith('```json')) {
        jsonTexto = jsonTexto.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (jsonTexto.startsWith('```')) {
        jsonTexto = jsonTexto.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      resultado = JSON.parse(jsonTexto);
    }
    
    return NextResponse.json(resultado);
    
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Si es error de parsing JSON, devolver respuesta por defecto
    if (error instanceof SyntaxError) {
      const resultadoDefault = {
        encontrado: true,
        surteEfectos: "dia_siguiente",
        diasHabiles: true,
        articulo: "Articulo por defecto",
        textoLegal: "No se pudo analizar la ley especifica. Se aplica regla general.",
        fuente: "ley"
      };
      return NextResponse.json(resultadoDefault);
    }
    
    // Si es error de OpenAI, devolver respuesta por defecto
    if (error.code === 'invalid_api_key' || error.code === 'insufficient_quota') {
      const resultadoDefault = {
        encontrado: true,
        surteEfectos: "dia_siguiente",
        diasHabiles: true,
        articulo: "Articulo por defecto",
        textoLegal: "Error de API key. Se aplica regla general.",
        fuente: "ley"
      };
      return NextResponse.json(resultadoDefault);
    }
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error.message,
        code: error.code || 'unknown' 
      },
      { status: 500 }
    );
  }
}