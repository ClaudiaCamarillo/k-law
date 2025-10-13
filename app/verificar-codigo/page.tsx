'use client'

import { useState, useEffect } from 'react'
import { obtenerLeyPorId } from '@/legislacion/storage'

export default function VerificarCodigoPage() {
  const [codigoComercio, setCodigoComercio] = useState<any>(null)

  useEffect(() => {
    const ley = obtenerLeyPorId('ccom')
    setCodigoComercio(ley)
  }, [])

  if (!codigoComercio) {
    return <div>Cargando...</div>
  }

  // Obtener texto de los primeros 3 artículos si existen
  const primerosArticulos = codigoComercio.articulos.slice(0, 3)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Verificación del Código de Comercio</h1>
      
      <h2>Estado actual:</h2>
      <ul>
        <li>Nombre: {codigoComercio.nombre}</li>
        <li>Total de artículos: {codigoComercio.articulos.length}</li>
        <li>Fecha última reforma: {codigoComercio.fechaUltimaReforma}</li>
      </ul>

      <h2>Primeros artículos encontrados:</h2>
      {primerosArticulos.length === 0 ? (
        <p style={{ color: 'red' }}>⚠️ NO HAY ARTÍCULOS GUARDADOS</p>
      ) : (
        primerosArticulos.map((art: any, idx: number) => (
          <div key={idx} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <strong>Artículo {art.numero}</strong>
            {art.tituloCapitulo && <p>Título/Capítulo: {art.tituloCapitulo}</p>}
            <p>Primeras 200 caracteres del texto:</p>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{art.texto.substring(0, 200)}...</pre>
          </div>
        ))
      )}

      {codigoComercio.articulos.length > 0 && (
        <>
          <h2>Números de los primeros 10 artículos:</h2>
          <p>{codigoComercio.articulos.slice(0, 10).map((a: any) => `Art. ${a.numero}`).join(', ')}</p>
        </>
      )}
    </div>
  )
}