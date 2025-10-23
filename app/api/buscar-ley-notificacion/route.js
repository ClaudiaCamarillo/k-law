import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { materiaDelActo } = await request.json();
    
    if (!materiaDelActo) {
      return NextResponse.json(
        { error: 'Falta el parametro materiaDelActo' },
        { status: 400 }
      );
    }

    // Primero buscar en la ley específica de la materia
    let completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un experto en derecho mexicano. Determina qué ley rige la notificación según la materia del acto.
          IMPORTANTE: Solo responde si encuentras una regla ESPECÍFICA en la ley de la materia.
          Si no hay regla específica o no indica ley supletoria, responde con {"encontrado": false}
          Si encuentras regla específica, responde con este formato:
          {
            "encontrado": true,
            "leyAplicable": "nombre completo de la ley",
            "fundamento": "artículos aplicables",
            "explicacion": "breve explicación de por qué aplica esta ley",
            "materiaDetectada": "civil|penal|laboral|administrativa|amparo|fiscal|mercantil",
            "fuente": "ley"
          }`
        },
        {
          role: "user",
          content: `¿Qué ley rige la notificación si el acto reclamado es en materia de ${materiaDelActo}? Solo responde si hay regla específica en la ley de la materia. 
          IMPORTANTE: Si es extradición, la Ley de Extradición Internacional NO tiene reglas de notificación, por lo que debes responder {"encontrado": false}.`
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
    
    // Si no encontró regla específica en la ley, buscar en jurisprudencia
    if (!resultado.encontrado) {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un experto en derecho mexicano. Busca en la JURISPRUDENCIA mexicana (NO en tesis aisladas) qué ley rige la notificación según la materia del acto.
            Responde con este formato JSON:
            {
              "encontrado": true,
              "leyAplicable": "nombre completo de la ley",
              "fundamento": "número de jurisprudencia o registro",
              "explicacion": "breve explicación de por qué aplica esta ley según jurisprudencia",
              "materiaDetectada": "civil|penal|laboral|administrativa|amparo|fiscal|mercantil",
              "fuente": "jurisprudencia",
              "epoca": "época de la jurisprudencia"
            }`
          },
          {
            role: "user",
            content: `Busca en jurisprudencia mexicana (NO tesis aisladas): ¿Qué ley rige la notificación en materia de ${materiaDelActo}? 
            ${materiaDelActo.toLowerCase().includes('extradición') || materiaDelActo.toLowerCase().includes('extradicion') ? 
              'ESPECÍFICAMENTE para extradición: busca qué ley se aplica supletoriamente para las notificaciones en procedimientos de extradición.' : 
              ''}`
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
    
    // Si es error de parsing JSON, devolver respuesta por defecto
    if (error instanceof SyntaxError) {
      const resultadoDefault = {
        encontrado: true,
        leyAplicable: "Código Federal de Procedimientos Civiles",
        fundamento: "Artículos aplicables por defecto",
        explicacion: "No se pudo analizar la materia específica. Se aplica ley general.",
        materiaDetectada: "general",
        fuente: "ley"
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