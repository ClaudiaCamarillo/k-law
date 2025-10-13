'use client'

import { useState, useEffect } from 'react'

export function SelectorLeyNotificacion({ onLeySeleccionada, tipoNotificacion, leySeleccionada = '' }) {
  const [leyAplicable, setLeyAplicable] = useState(leySeleccionada)
  
  // Actualizar el campo cuando cambie la prop leySeleccionada
  useEffect(() => {
    setLeyAplicable(leySeleccionada)
  }, [leySeleccionada])
  
  const leyesComunes = [
    "Código Nacional de Procedimientos Penales",
    "Código Federal de Procedimientos Civiles",
    "Código de Comercio",
    "Ley Federal de Procedimiento Administrativo",
    "Código Fiscal de la Federación",
    "Ley Federal del Trabajo",
    "Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional",
    "Ley General de Educación",
    "Ley del Seguro Social",
    "Ley de Navegación y Comercio Marítimos",
    "Código Nacional de Procedimientos Civiles y Familiares",
    "Ley Federal de Procedimiento Contencioso Administrativo",
    "Ley Aduanera"
  ];
  
  // Notificar cambios al componente padre
  const handleLeyChange = (e) => {
    const nuevaLey = e.target.value;
    setLeyAplicable(nuevaLey);
    if (nuevaLey) {
      onLeySeleccionada(nuevaLey);
    }
  };
  
  return (
    <div>
      <label className="block" style={{ 
        color: '#1C1C1C', 
        fontWeight: '600', 
        marginBottom: '0.5rem', 
        fontSize: '0.95rem', 
        fontFamily: 'Inter, sans-serif' 
      }}>
        Ley que rige la notificación del acto reclamado
      </label>
      <select
        value={leyAplicable}
        onChange={handleLeyChange}
        style={{ 
          border: '1.5px solid #1C1C1C', 
          borderRadius: '8px', 
          fontSize: '0.95rem', 
          transition: 'border-color 0.3s ease', 
          backgroundColor: 'transparent', 
          fontFamily: 'Inter, sans-serif', 
          color: '#1C1C1C', 
          width: '100%', 
          padding: '0.75rem' 
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
      >
        <option value="">Seleccione...</option>
        {leyesComunes.map(ley => (
          <option key={ley} value={ley}>{ley}</option>
        ))}
      </select>
      {leyAplicable === 'Ley Federal de Procedimiento Administrativo' && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '2px solid #DC2626',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '0.75rem'
        }}>
          <p style={{
            color: '#DC2626',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            margin: 0,
            lineHeight: '1.4'
          }}>
            ⚠️ <strong>IMPORTANTE:</strong> El CFPC se aplica supletoriamente para determinar cuándo surten efectos las notificaciones, pero se recomienda tomar en cuenta que a pesar de que no existe declaratoria de vigencia del CNPCF a nivel federal existen tribunales que lo toman en cuenta en lo que ve a las reglas de notificación.
          </p>
        </div>
      )}
    </div>
  );
}