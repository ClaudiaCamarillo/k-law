export async function analizarLeyNotificacion(nombreLey, tipoNotificacion) {
  try {
    const response = await fetch('/api/analizar-ley', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreLey,
        tipoNotificacion
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const resultado = await response.json();
    return resultado;
    
  } catch (error) {
    console.error('Error al analizar ley:', error);
    return null;
  }
}

export async function buscarLeyQueRigeNotificacion(materiaDelActo) {
  try {
    const response = await fetch('/api/buscar-ley-notificacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        materiaDelActo
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const resultado = await response.json();
    return resultado;
    
  } catch (error) {
    console.error('Error al buscar ley de notificación:', error);
    return null;
  }
}

export async function determinarLeyPorActoConcreto(actoConcreto) {
  try {
    const response = await fetch('/api/determinar-ley-acto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actoConcreto
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const resultado = await response.json();
    return resultado;
    
  } catch (error) {
    console.error('Error al determinar ley por acto concreto:', error);
    return null;
  }
}