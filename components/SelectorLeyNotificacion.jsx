'use client'

import { useState, useEffect } from 'react'
import { analizarLeyNotificacion } from '@/lib/ia-legal'

export function SelectorLeyNotificacion({ onLeySeleccionada, tipoNotificacion, leySeleccionada = '' }) {
  const [leyAplicable, setLeyAplicable] = useState(leySeleccionada)
  const [cargando, setCargando] = useState(false)
  const [reglaSurteEfectos, setReglaSurteEfectos] = useState(null)
  const [error, setError] = useState(null)
  
  // Actualizar el campo cuando cambie la prop leySeleccionada
  useEffect(() => {
    setLeyAplicable(leySeleccionada)
  }, [leySeleccionada])
  
  const leyesComunes = [
    "Ley de Amparo",
    "Codigo Federal de Procedimientos Civiles",
    "Codigo de Comercio",
    "Ley Federal de Procedimiento Contencioso Administrativo",
    "Codigo Fiscal de la Federacion",
    "Codigo Nacional de Procedimientos Penales",
    "Ley Federal del Trabajo"
  ];
  
  const buscarReglaNotificacion = async () => {
    if (!leyAplicable || !tipoNotificacion) return;
    
    setCargando(true);
    setError(null);
    try {
      console.log('Buscando regla para:', { leyAplicable, tipoNotificacion });
      const resultado = await analizarLeyNotificacion(leyAplicable, tipoNotificacion);
      console.log('Resultado recibido:', resultado);
      
      if (resultado) {
        setReglaSurteEfectos(resultado);
        onLeySeleccionada(resultado);
      } else {
        setError('No se pudo obtener la informacion de la ley');
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Ley que rige la notificación del acto reclamado
        </label>
        <input
          type="text"
          list="leyes-comunes"
          value={leyAplicable}
          onChange={(e) => setLeyAplicable(e.target.value)}
          placeholder="Ej: Ley de Amparo"
          className="k-law-input"
        />
        <datalist id="leyes-comunes">
          {leyesComunes.map(ley => (
            <option key={ley} value={ley} />
          ))}
        </datalist>
      </div>
      
      <button
        onClick={buscarReglaNotificacion}
        disabled={!leyAplicable || !tipoNotificacion || cargando}
        className="k-law-button-primary w-full py-2 px-4 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {cargando ? 'Buscando...' : 'Buscar regla en la ley'}
      </button>
      
      {error && (
        <div className="mt-4 k-law-alert-error">
          <h4 className="font-semibold text-red-100">Error:</h4>
          <p className="text-sm text-red-100 mt-2">{error}</p>
        </div>
      )}
      
      {reglaSurteEfectos && (
        <div className="mt-4 k-law-alert-success">
          <h4 className="font-semibold text-green-100">
            Regla encontrada en: {reglaSurteEfectos.fuente === 'jurisprudencia' ? '⚖️ Jurisprudencia' : '📖 Ley'}
          </h4>
          <p className="text-sm mt-2 text-green-100">
            <strong>Surte efectos:</strong> {
              reglaSurteEfectos.surteEfectos === 'dia_siguiente' ? 'Al día siguiente' :
              reglaSurteEfectos.surteEfectos === 'mismo_dia' ? 'El mismo día' :
              reglaSurteEfectos.surteEfectos === 'tercer_dia' ? 'Al tercer día' :
              reglaSurteEfectos.surteEfectos
            }
          </p>
          <p className="text-sm text-green-100">
            <strong>
              {reglaSurteEfectos.fuente === 'jurisprudencia' ? 'Tesis' : 'Artículo'}:
            </strong> {reglaSurteEfectos.articulo || reglaSurteEfectos.tesis}
          </p>
          {reglaSurteEfectos.epoca && (
            <p className="text-sm text-green-100">
              <strong>Época:</strong> {reglaSurteEfectos.epoca}
            </p>
          )}
          <blockquote className="text-xs italic mt-2 border-l-4 border-white/30 pl-4 text-green-100">
            {reglaSurteEfectos.textoLegal}
          </blockquote>
        </div>
      )}
    </div>
  );
}