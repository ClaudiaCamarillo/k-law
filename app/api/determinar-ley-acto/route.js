import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { actoConcreto } = await request.json();
    
    if (!actoConcreto) {
      return NextResponse.json(
        { error: 'Falta el parametro actoConcreto' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un experto en derecho mexicano. Tu tarea es determinar qué ley rige un acto concreto específico.

          IMPORTANTE: 
          - SIEMPRE verifica si tienes información suficiente para determinar la ley específica
          - Si hay cualquier ambigüedad sobre jurisdicción, autoridad o materia, debes preguntar
          - NO asumas ni generalices - cada acto tiene una ley específica que lo rige
          - Si no puedes determinar con certeza la ley exacta, solicita más información

          Si tienes información suficiente para determinar la ley específica, responde con este formato JSON:
          {
            "suficienteInfo": true,
            "leyAplicable": "nombre completo de la ley específica",
            "autoridad": "autoridad que emite el acto",
            "materia": "materia específica del acto",
            "jurisdiccion": "federal|estatal|municipal",
            "fundamento": "artículos o disposiciones aplicables",
            "explicacion": "breve explicación de por qué esta ley específica aplica"
          }

          Si NO tienes información suficiente para determinar la ley específica, responde con:
          {
            "suficienteInfo": false,
            "preguntasNecesarias": [
              "preguntas específicas necesarias para determinar la ley exacta"
            ],
            "contexto": "explicación de por qué necesitas más información para determinar la ley específica"
          }

          REGLA GENERAL: Si no puedes determinar la ley EXACTA que rige el acto, debes hacer preguntas.
          `
        },
        {
          role: "user",
          content: `Determina qué ley rige este acto concreto: "${actoConcreto}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 600
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
    
    const resultado = JSON.parse(jsonTexto);
    return NextResponse.json(resultado);
    
  } catch (error) {
    console.error('Error completo:', error);
    
    // Si es error de parsing JSON, devolver respuesta por defecto
    if (error instanceof SyntaxError) {
      const resultadoDefault = {
        suficienteInfo: false,
        preguntasNecesarias: [
          "¿Qué autoridad específica emitió el acto?",
          "¿Es un acto federal, estatal o municipal?",
          "¿En qué municipio, estado o dependencia se emitió?",
          "¿Cuál es la materia específica del acto?",
          "¿Cuál es el fundamento legal del acto?"
        ],
        contexto: "No se pudo procesar la información proporcionada. Se requiere información específica sobre la jurisdicción, autoridad y materia para determinar la ley exacta que rige el acto."
      };
      return NextResponse.json(resultadoDefault);
    }
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error.message 
      },
      { status: 500 }
    );
  }
}