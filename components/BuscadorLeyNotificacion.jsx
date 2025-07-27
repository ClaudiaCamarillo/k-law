'use client'

import { useState } from 'react'
import { buscarLeyQueRigeNotificacion } from '@/lib/ia-legal'

export function BuscadorLeyNotificacion({ onLeyEncontrada }) {
  const [materia, setMateria] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)
  
  const materiasComunes = [
    "amparo",
    "civil",
    "penal", 
    "laboral",
    "administrativa",
    "fiscal",
    "mercantil",
    "familiar"
  ];
  
  const buscarLey = async () => {
    if (!materia) return;
    
    setCargando(true);
    try {
      const res = await buscarLeyQueRigeNotificacion(materia);
      setResultado(res);
      if (res && onLeyEncontrada) {
        onLeyEncontrada(res.leyAplicable);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al buscar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Materia del acto reclamado
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          list="materias-comunes"
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          placeholder="Ej: civil, penal, laboral..."
          className="k-law-input flex-1"
        />
        <datalist id="materias-comunes">
          {materiasComunes.map(m => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <button
          onClick={buscarLey}
          disabled={!materia || cargando}
          className="k-law-button-primary px-4 py-2 disabled:bg-gray-500"
        >
          {cargando ? '...' : 'Buscar'}
        </button>
      </div>
      
      {resultado && (
        <div className="mt-2 k-law-alert-info text-sm">
          <h4 className="font-semibold mb-2 text-blue-100">
            Encontrado en: {resultado.fuente === 'jurisprudencia' ? '⚖️ Jurisprudencia' : '📖 Ley'}
          </h4>
          <p className="text-blue-100"><strong>Ley aplicable:</strong> {resultado.leyAplicable}</p>
          <p className="text-blue-100"><strong>
            {resultado.fuente === 'jurisprudencia' ? 'Jurisprudencia' : 'Fundamento'}:
          </strong> {resultado.fundamento}</p>
          {resultado.epoca && (
            <p className="text-blue-100"><strong>Época:</strong> {resultado.epoca}</p>
          )}
          <p className="text-xs text-blue-100 mt-1">{resultado.explicacion}</p>
        </div>
      )}
    </div>
  );
}