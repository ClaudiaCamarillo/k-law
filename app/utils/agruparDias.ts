// Función auxiliar para agrupar días consecutivos
export const agruparDiasConsecutivos = (dias: {numero: number, superindice: string}[]) => {
  if (dias.length === 0) return [];
  
  dias.sort((a, b) => a.numero - b.numero);
  const grupos: string[] = [];
  let i = 0;
  
  while (i < dias.length) {
    let inicio = i;
    let finGrupo = i;
    
    // Buscar el final del grupo de días consecutivos
    while (finGrupo + 1 < dias.length && dias[finGrupo + 1].numero === dias[finGrupo].numero + 1) {
      finGrupo++;
    }
    
    if (finGrupo === inicio) {
      // Un solo día
      grupos.push(`${dias[inicio].numero}${dias[inicio].superindice}`);
    } else if (finGrupo === inicio + 1) {
      // Dos días consecutivos
      grupos.push(`${dias[inicio].numero}${dias[inicio].superindice} y ${dias[finGrupo].numero}${dias[finGrupo].superindice}`);
    } else {
      // Tres o más días consecutivos
      // Agrupar por superíndices iguales dentro del rango
      let subgrupos: string[] = [];
      let j = inicio;
      
      while (j <= finGrupo) {
        let subInicio = j;
        let subFin = j;
        
        // Encontrar días consecutivos con el mismo superíndice
        while (subFin < finGrupo && 
               dias[subFin + 1].numero === dias[subFin].numero + 1 && 
               dias[subFin + 1].superindice === dias[subFin].superindice) {
          subFin++;
        }
        
        if (subFin > subInicio + 1) {
          // Tres o más con mismo superíndice
          subgrupos.push(`${dias[subInicio].numero} a ${dias[subFin].numero}${dias[subFin].superindice}`);
        } else if (subFin === subInicio + 1) {
          // Dos con mismo superíndice - agregar como elementos separados
          subgrupos.push(`${dias[subInicio].numero}${dias[subInicio].superindice}`, `${dias[subFin].numero}${dias[subFin].superindice}`);
        } else {
          // Solo uno
          subgrupos.push(`${dias[subInicio].numero}${dias[subInicio].superindice}`);
        }
        
        j = subFin + 1;
      }
      
      // Unir los subgrupos con comas y "y" solo antes del último
      if (subgrupos.length === 1) {
        grupos.push(subgrupos[0]);
      } else {
        const ultimo = subgrupos.pop()!;
        grupos.push(subgrupos.length > 0 ? `${subgrupos.join(', ')} y ${ultimo}` : ultimo);
      }
    }
    
    i = finGrupo + 1;
  }
  
  return grupos;
};

// Función para unir elementos con comas y "y" antes del último
export const unirConY = (elementos: string[]): string => {
  if (elementos.length === 0) return '';
  if (elementos.length === 1) return elementos[0];
  
  const ultimo = elementos.pop()!;
  return elementos.length > 0 ? `${elementos.join(', ')} y ${ultimo}` : ultimo;
};