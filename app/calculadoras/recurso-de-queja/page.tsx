'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { getCuandoSurteEfectos, calcularFechaSurteEfectos, getFundamentoSurtimientoEfectos } from '../../../lib/articulo31LeyAmparo.js'

// Función para convertir fecha a texto en español
function fechaATexto(fecha: string): string {
  if (!fecha) return '';
  
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const dias = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
    'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho',
    'veintinueve', 'treinta', 'treinta y uno'
  ];
  
  const fechaObj = new Date(fecha + 'T12:00:00');
  const dia = fechaObj.getDate();
  const mes = fechaObj.getMonth();
  const año = fechaObj.getFullYear();
  
  const añoEnTexto = (año: number): string => {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    
    if (año === 2000) return 'dos mil';
    if (año > 2000 && año < 2100) {
      const resto = año - 2000;
      if (resto < 10) return `dos mil ${unidades[resto]}`;
      if (resto < 20) return `dos mil ${especiales[resto - 10]}`;
      const decena = Math.floor(resto / 10);
      const unidad = resto % 10;
      if (unidad === 0) return `dos mil ${decenas[decena]}`;
      return `dos mil ${decenas[decena] === 'veinte' ? 'veinti' + unidades[unidad] : decenas[decena] + ' y ' + unidades[unidad]}`;
    }
    return año.toString();
  };
  
  return `${dias[dia]} de ${meses[mes]} de ${añoEnTexto(año)}`;
}

// Función para formato de fecha para litigantes (día y año en número, mes en letra)
function fechaParaLitigante(fecha: string): string {
  if (!fecha) return '';
  
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const fechaObj = new Date(fecha + 'T12:00:00');
  const dia = fechaObj.getDate();
  const mes = fechaObj.getMonth();
  const año = fechaObj.getFullYear();
  
  return `${dia} de ${meses[mes]} de ${año}`;
}

// Función para simplificar período de fechas cuando son del mismo mes y año
function simplificarPeriodoFechas(fechaInicio: string, fechaFin: string): string {
  if (!fechaInicio || !fechaFin) return '';
  
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const fechaInicioObj = new Date(fechaInicio + 'T12:00:00');
  const fechaFinObj = new Date(fechaFin + 'T12:00:00');
  
  const diaInicio = fechaInicioObj.getDate();
  const mesInicio = fechaInicioObj.getMonth();
  const añoInicio = fechaInicioObj.getFullYear();
  
  const diaFin = fechaFinObj.getDate();
  const mesFin = fechaFinObj.getMonth();
  const añoFin = fechaFinObj.getFullYear();
  
  // Si es el mismo mes y año, simplificar
  if (mesInicio === mesFin && añoInicio === añoFin) {
    return `Del ${diaInicio} al ${diaFin} de ${meses[mesInicio]} de ${añoInicio}`;
  }
  
  // Si es diferente mes pero mismo año
  if (mesInicio !== mesFin && añoInicio === añoFin) {
    return `Del ${diaInicio} de ${meses[mesInicio]} al ${diaFin} de ${meses[mesFin]} de ${añoInicio}`;
  }
  
  // Si es diferente año, mostrar completo
  return `Del ${diaInicio} de ${meses[mesInicio]} de ${añoInicio} al ${diaFin} de ${meses[mesFin]} de ${añoFin}`;
}

// Función para convertir número a texto
function numeroATexto(num: number): string {
  const numeros = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
    'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho',
    'veintinueve', 'treinta', 'treinta y uno'
  ];
  return numeros[num] || num.toString();
}

// Función para calcular días móviles
function calcularDiasMoviles(año: number) {
  const dias = [];
  
  // Primer lunes de febrero
  const feb = new Date(año, 1, 1);
  while (feb.getDay() !== 1) feb.setDate(feb.getDate() + 1);
  dias.push({ fecha: feb.toISOString().split('T')[0], tipo: 'primer lunes de febrero' });
  
  // Tercer lunes de marzo
  const mar = new Date(año, 2, 1);
  while (mar.getDay() !== 1) mar.setDate(mar.getDate() + 1);
  mar.setDate(mar.getDate() + 14);
  dias.push({ fecha: mar.toISOString().split('T')[0], tipo: 'tercer lunes de marzo' });
  
  // Tercer lunes de noviembre
  const nov = new Date(año, 10, 1);
  while (nov.getDay() !== 1) nov.setDate(nov.getDate() + 1);
  nov.setDate(nov.getDate() + 14);
  dias.push({ fecha: nov.toISOString().split('T')[0], tipo: 'tercer lunes de noviembre' });
  
  return dias;
}

// Función para verificar si es día inhábil según tipo de usuario
function esDiaInhabil(fecha: Date, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): boolean {
  // Verificar si la fecha es válida
  if (!fecha || isNaN(fecha.getTime())) return false;
  
  // Sábados y domingos siempre son inhábiles
  if (fecha.getDay() === 0 || fecha.getDay() === 6) return true;
  
  const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const fechaStr = fecha.toISOString().split('T')[0];
  const año = fecha.getFullYear();
  
  // Filtrar días según tipo de usuario
  const diasAplicables = diasInhabilesData.filter(d => 
    d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
  );
  
  // Días fijos
  if (diasAplicables.some(d => d.fecha === mesdia || d.fecha === fechaStr)) return true;
  
  // Días móviles
  const diasMoviles = calcularDiasMoviles(año);
  if (diasMoviles.some(d => d.fecha === fechaStr)) return true;
  
  // Días adicionales del usuario
  return diasAdicionales.includes(fechaStr);
}

// Función para el siguiente día hábil
function siguienteDiaHabil(fecha: Date, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): Date {
  if (!fecha || isNaN(fecha.getTime())) {
    throw new Error('Fecha inválida proporcionada a siguienteDiaHabil');
  }
  
  const siguiente = new Date(fecha);
  siguiente.setDate(siguiente.getDate() + 1);
  while (esDiaInhabil(siguiente, diasAdicionales, tipoUsuario)) {
    siguiente.setDate(siguiente.getDate() + 1);
  }
  return siguiente;
}

// Función para calcular el plazo
function calcularPlazoReal(fechaInicio: Date, dias: number, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): Date {
  let fecha = new Date(fechaInicio);
  let diasHabiles = 1; // Empezamos en 1 porque fechaInicio ya es el primer día
  
  while (diasHabiles < dias) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha, diasAdicionales, tipoUsuario)) {
      diasHabiles++;
    }
  }
  
  return fecha;
}

// Función para obtener días inhábiles con notas al pie (formato numérico para detalles)
function obtenerDiasInhabilesConNotas(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasPorFundamento: {[key: string]: string[]} = {};
  const diasYaIncluidos = new Set<string>();
  let hayFinDeSemana = false;
  
  // Orden de prioridad de fundamentos
  const ordenFundamentos = [
    'artículo 19 de la Ley de Amparo',
    'artículo 74 de la Ley Federal del Trabajo',
    'Ley Orgánica',
    'Circular',
    'Acuerdo',
    'usuario'
  ];
  
  const fecha = new Date(inicio);
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    const año = fecha.getFullYear();
    
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      hayFinDeSemana = true;
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = fechaParaLitigante(fechaStr);
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(fechaParaLitigante(fechaStr));
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        // Buscar primero por tipo móvil genérico
        let diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        
        // Si no se encuentra genérico, buscar fecha específica que coincida con día móvil
        if (!diaMovilInfo) {
          diaMovilInfo = diasAplicables.find(d => d.fecha === fechaStr && 
            d.fundamento === 'artículo 74 de la Ley Federal del Trabajo');
        }
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(fechaParaLitigante(fechaStr));
          diasYaIncluidos.add(fechaParaLitigante(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        diasPorFundamento[fundamento].push(fechaParaLitigante(fechaStr));
        diasYaIncluidos.add(fechaParaLitigante(fechaStr));
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Agregar sábados y domingos si hay
  if (hayFinDeSemana) {
    diasTexto.push('sábados y domingos');
  }
  
  // Agregar días por orden de fundamento
  ordenFundamentos.forEach(fundamentoBuscado => {
    Object.keys(diasPorFundamento).forEach(fundamento => {
      if (fundamento.includes(fundamentoBuscado) || (fundamentoBuscado === 'usuario' && fundamento === fundamentoAdicional)) {
        const dias = diasPorFundamento[fundamento];
        if (dias && dias.length > 0) {
          // Agrupar días del mismo mes (solo en función de texto)
          let diasFinales = dias;
          
          // Para litigantes no mostramos superíndices
          if (tipoUsuario === 'litigante') {
            diasTexto = diasTexto.concat(diasFinales);
          } else {
            const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
            diasTexto = diasTexto.concat(diasFinales.map(dia => dia + superindice));
            notasAlPie.push(`${superindice} ${fundamento}`);
            numeroNota++;
          }
        }
      }
    });
  });
  
  return {
    texto: diasTexto.join(', '),
    notas: notasAlPie
  };
}

// Función para obtener días inhábiles para texto de resolución (formato texto)
function obtenerDiasInhabilesParaTexto(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasPorFundamento: {[key: string]: string[]} = {};
  const diasYaIncluidos = new Set<string>();
  let hayFinDeSemana = false;
  
  // Función para agrupar días del mismo mes y año
  const agruparDiasPorMesAno = (listaDias: string[]) => {
    const diasPorMesAno: {[key: string]: string[]} = {};
    
    listaDias.forEach(dia => {
      // Extraer el mes y año del día
      const match = dia.match(/(.+) de (\w+) de (.+)$/);
      if (match) {
        const diaNum = match[1];
        const mes = match[2];
        const ano = match[3];
        const claveMesAno = `${mes} de ${ano}`;
        
        if (!diasPorMesAno[claveMesAno]) {
          diasPorMesAno[claveMesAno] = [];
        }
        diasPorMesAno[claveMesAno].push(diaNum);
      } else {
        // Si no coincide con el patrón, agregar tal como está
        const clave = 'otros';
        if (!diasPorMesAno[clave]) {
          diasPorMesAno[clave] = [];
        }
        diasPorMesAno[clave].push(dia);
      }
    });
    
    const resultado: string[] = [];
    Object.keys(diasPorMesAno).forEach(mesAno => {
      if (mesAno === 'otros') {
        resultado.push(...diasPorMesAno[mesAno]);
      } else {
        const dias = diasPorMesAno[mesAno];
        if (dias.length === 1) {
          resultado.push(`${dias[0]} de ${mesAno}`);
        } else {
          // Agrupar múltiples días del mismo mes
          const ultimoDia = dias.pop();
          const otrosDias = dias.join(', ');
          resultado.push(`${otrosDias} y ${ultimoDia}, todos de ${mesAno}`);
        }
      }
    });
    
    return resultado;
  };
  
  // Orden de prioridad de fundamentos
  const ordenFundamentos = [
    'artículo 19 de la Ley de Amparo',
    'artículo 74 de la Ley Federal del Trabajo',
    'Ley Orgánica',
    'Circular',
    'Acuerdo',
    'usuario'
  ];
  
  const fecha = new Date(inicio);
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    const año = fecha.getFullYear();
    
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      hayFinDeSemana = true;
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      const claveConsistente = tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr);
      if (diaFijo && !diasYaIncluidos.has(claveConsistente)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = claveConsistente;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(claveConsistente);
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        const claveMovil = tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr);
        if (diaMovilInfo && !diasYaIncluidos.has(claveMovil)) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(claveMovil);
          diasYaIncluidos.add(claveMovil);
        }
      }
      
      // Días adicionales del usuario
      const claveAdicional = tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr);
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(claveAdicional)) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        diasPorFundamento[fundamento].push(claveAdicional);
        diasYaIncluidos.add(claveAdicional);
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Agregar sábados y domingos si hay
  if (hayFinDeSemana) {
    if (tipoUsuario === 'litigante') {
      diasTexto.push('sábados y domingos');
    } else {
      const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
      diasTexto.push(`sábados y domingos${superindice}`);
      notasAlPie.push(`${superindice} artículo 19 de la Ley de Amparo`);
      numeroNota++;
    }
  }
  
  // Agregar días por orden de fundamento
  ordenFundamentos.forEach(fundamentoBuscado => {
    Object.keys(diasPorFundamento).forEach(fundamento => {
      if (fundamento.includes(fundamentoBuscado) || (fundamentoBuscado === 'usuario' && fundamento === fundamentoAdicional)) {
        const dias = diasPorFundamento[fundamento];
        if (dias && dias.length > 0) {
          // Agrupar días del mismo mes (solo en función de texto)
          let diasFinales = dias;
          
          // Para litigantes no mostramos superíndices
          if (tipoUsuario === 'litigante') {
            diasTexto = diasTexto.concat(diasFinales);
          } else {
            const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
            diasTexto = diasTexto.concat(diasFinales.map(dia => dia + superindice));
            notasAlPie.push(`${superindice} ${fundamento}`);
            numeroNota++;
          }
        }
      }
    });
  });
  
  return {
    texto: diasTexto.join(', '),
    notas: notasAlPie
  };
}

// Componente de Calendario
function Calendario({ 
  fechaNotificacion, 
  fechaSurte, 
  fechaInicio, 
  fechaFin, 
  diasAdicionales,
  tipoUsuario,
  esOmision = false,
  fechaPresentacion = null
}: {
  fechaNotificacion: Date,
  fechaSurte: Date,
  fechaInicio: Date,
  fechaFin: Date,
  diasAdicionales: string[],
  tipoUsuario: string,
  esOmision?: boolean,
  fechaPresentacion?: Date | null
}) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Calcular rango de meses a mostrar
  let mesInicio, mesFin;
  
  if (esOmision) {
    // Para omisión, mostrar solo el mes de presentación de demanda y recurso
    const fechas = [fechaNotificacion];
    if (fechaPresentacion) fechas.push(fechaPresentacion);
    
    const fechaMin = new Date(Math.min(...fechas.map(f => f.getTime())));
    const fechaMax = new Date(Math.max(...fechas.map(f => f.getTime())));
    
    mesInicio = new Date(fechaMin.getFullYear(), fechaMin.getMonth(), 1);
    mesFin = new Date(fechaMax.getFullYear(), fechaMax.getMonth() + 1, 0);
  } else {
    mesInicio = new Date(fechaNotificacion.getFullYear(), fechaNotificacion.getMonth(), 1);
    mesFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 0);
  }
  
  const mesesAMostrar = [];
  const mesActual = new Date(mesInicio);
  while (mesActual <= mesFin) {
    mesesAMostrar.push(new Date(mesActual));
    mesActual.setMonth(mesActual.getMonth() + 1);
  }
  
  const obtenerClaseDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const fechaNotifStr = fechaNotificacion.toISOString().split('T')[0];
    const fechaSurteStr = fechaSurte.toISOString().split('T')[0];
    
    // Día de notificación
    if (fechaStr === fechaNotifStr) {
      return 'bg-blue-500 text-white font-bold relative triangle-container';
    }
    
    // Día que surte efectos (si es diferente)
    if (fechaStr === fechaSurteStr && fechaNotifStr !== fechaSurteStr) {
      return 'bg-green-500 text-white font-bold';
    }
    
    // Días del cómputo
    if (fecha >= fechaInicio && fecha <= fechaFin) {
      if (esDiaInhabil(fecha, diasAdicionales, tipoUsuario)) {
        return 'bg-red-500 text-white'; // Días inhábiles
      }
      return 'bg-yellow-300 text-black font-semibold'; // Días hábiles del cómputo
    }
    
    // Días inhábiles fuera del cómputo
    if (esDiaInhabil(fecha, diasAdicionales, tipoUsuario)) {
      return 'bg-gray-200 text-gray-500';
    }
    
    return 'hover:bg-gray-50';
  };
  
  return (
    <div className="mt-6">
      
      <div style={{
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: '10px', 
        justifyContent: 'flex-start',
        overflowX: 'auto',
        width: '100%',
        maxWidth: '300px'
      }}>
        {mesesAMostrar.map((mes, idx) => {
          const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
          const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
          const diasAntes = primerDia.getDay();
          const diasEnMes = ultimoDia.getDate();
          
          const dias = [];
          for (let i = 0; i < diasAntes; i++) {
            dias.push(null);
          }
          for (let i = 1; i <= diasEnMes; i++) {
            dias.push(i);
          }
          
          return (
            <div key={idx} style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px',
              width: '120px',
              flexShrink: 0
            }}>
              <h4 style={{
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '2px',
                color: 'black',
                fontSize: '10px'
              }}>
                {meses[mes.getMonth()]} {mes.getFullYear()}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0px',
                textAlign: 'center',
                fontSize: '8px'
              }}>
                <div style={{fontWeight: 'bold'}}>D</div>
                <div style={{fontWeight: 'bold'}}>L</div>
                <div style={{fontWeight: 'bold'}}>M</div>
                <div style={{fontWeight: 'bold'}}>M</div>
                <div style={{fontWeight: 'bold'}}>J</div>
                <div style={{fontWeight: 'bold'}}>V</div>
                <div style={{fontWeight: 'bold'}}>S</div>
                {dias.map((dia, i) => (
                  <div key={i} style={{height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {dia && (
                      <>
                        {(() => {
                          const fechaDiaObj = new Date(mes.getFullYear(), mes.getMonth(), dia);
                          fechaDiaObj.setHours(12, 0, 0, 0); // Normalizar a mediodía
                          const fechaDia = fechaDiaObj.toISOString().split('T')[0];
                          const esNotificacion = fechaDia === fechaNotificacion.toISOString().split('T')[0];
                          const esSurteEfectos = fechaDia === fechaSurte.toISOString().split('T')[0];
                          const esPresentacionRecurso = fechaPresentacion && fechaDia === fechaPresentacion.toISOString().split('T')[0];
                          
                          // Para casos de omisión, solo mostrar las fechas relevantes
                          if (esOmision) {
                            if (esNotificacion) {
                              return (
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: '#3b82f6',
                                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '6px',
                                  fontWeight: 'bold'
                                }}>
                                  {dia}
                                </div>
                              );
                            }
                            if (esPresentacionRecurso) {
                              return (
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: '#8b5cf6',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '6px',
                                  fontWeight: 'bold'
                                }}>
                                  {dia}
                                </div>
                              );
                            }
                            // Día normal para omisión
                            return (
                              <div className="w-full h-full flex items-center justify-center" style={{fontSize: '8px'}}>
                                {dia}
                              </div>
                            );
                          }
                          
                          // Si coinciden notificación y surte efectos
                          if (esNotificacion && esSurteEfectos) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#3b82f6',
                                border: '2px solid #10b981',
                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '5px',
                                fontWeight: 'bold'
                              }}>
                                {dia}
                              </div>
                            );
                          }
                          
                          // Solo día de notificación
                          if (esNotificacion) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#3b82f6',
                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '6px',
                                fontWeight: 'bold'
                              }}>
                                {dia}
                              </div>
                            );
                          }
                          
                          // Solo día que surte efectos
                          if (esSurteEfectos) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '6px',
                                fontWeight: 'bold'
                              }}>
                                {dia}
                              </div>
                            );
                          }
                          
                          // Otros días del cómputo o inhábiles (usar la misma fecha normalizada)
                          const esDiaDelComputo = fechaDiaObj >= fechaInicio && fechaDiaObj <= fechaFin;
                          const esDiaInhabilDelComputo = esDiaDelComputo && esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
                          const esDiaHabilDelComputo = esDiaDelComputo && !esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
                          // Días inhábiles entre notificación e inicio del cómputo
                          const esDiaInhabilEntreNotifYComputo = fechaDiaObj > fechaNotificacion && fechaDiaObj < fechaInicio && esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
                          
                          // Día hábil del cómputo (círculo amarillo)
                          if (esDiaHabilDelComputo) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#fcd34d',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'black',
                                fontSize: '6px',
                                fontWeight: 'bold'
                              }}>
                                {dia}
                              </div>
                            );
                          }
                          
                          // Día inhábil del cómputo (con X)
                          if (esDiaInhabilDelComputo) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  color: '#ef4444',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  lineHeight: '1'
                                }}>
                                  ×
                                </div>
                                <div style={{fontSize: '6px', color: '#666'}}>
                                  {dia}
                                </div>
                              </div>
                            );
                          }
                          
                          // Día inhábil entre notificación e inicio del cómputo (con X)
                          if (esDiaInhabilEntreNotifYComputo) {
                            return (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  color: '#ef4444',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  lineHeight: '1'
                                }}>
                                  ×
                                </div>
                                <div style={{fontSize: '6px', color: '#666'}}>
                                  {dia}
                                </div>
                              </div>
                            );
                          }
                          
                          // Día normal
                          return (
                            <div className={`w-full h-full flex items-center justify-center ${
                              obtenerClaseDia(new Date(mes.getFullYear(), mes.getMonth(), dia))
                            }`} style={{fontSize: '8px'}}>
                              {dia}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Calculadora() {
  const [tipoUsuario, setTipoUsuario] = useState<string>('litigante');
  const [tipoFecha, setTipoFecha] = useState<'notificacion' | 'conocimiento' | null>(null);
  const [formData, setFormData] = useState({
    tipoQueja: 'indirecto',
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    fechaConocimiento: '',
    formaNotificacion: '',
    fechaPresentacion: '',
    formaPresentacion: ''
  });
  
  const [diasAdicionales, setDiasAdicionales] = useState<string[]>([]);
  const [nuevoDiaInhabil, setNuevoDiaInhabil] = useState('');
  const [fundamentoAdicional, setFundamentoAdicional] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [calculando, setCalculando] = useState(false);
  
  // Para litigantes
  const [numeroExpediente, setNumeroExpediente] = useState('');
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [calculos, setCalculos] = useState<any[]>([]);

  useEffect(() => {
    // Obtener tipo de usuario de localStorage
    const tipo = localStorage.getItem('tipoUsuario') || 'litigante';
    setTipoUsuario(tipo);
    
    // Cargar cálculos guardados (solo para litigantes)
    if (tipo === 'litigante') {
      const calculosGuardados = localStorage.getItem('calculosGuardados');
      if (calculosGuardados) {
        setCalculos(JSON.parse(calculosGuardados));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un tipo de fecha (solo si no es omisión de tramite)
    if (formData.resolucionImpugnada !== 'omision-tramite') {
      if (!tipoFecha) {
        alert('Por favor seleccione el tipo de fecha');
        return;
      }
      
      // Validar que se haya ingresado la fecha correspondiente
      if (tipoFecha === 'notificacion' && !formData.fechaNotificacion) {
        alert('Por favor ingrese la fecha de notificación');
        return;
      }
      
      if (tipoFecha === 'conocimiento' && !formData.fechaConocimiento) {
        alert('Por favor ingrese la fecha de conocimiento');
        return;
      }
    } else {
      // Para omisión de tramite, siempre se requiere fecha de notificación
      if (!formData.fechaNotificacion) {
        alert('Por favor ingrese la fecha de presentación de la demanda');
        return;
      }
    }
    
    setCalculando(true);
    
    setTimeout(() => {
      let plazo, fundamento;
      
      // Determinar plazo según el tipo de resolución impugnada (artículo 98)
      if (formData.resolucionImpugnada === 'suspension-plano') {
        plazo = 2; // Suspensión de plano o provisional
        fundamento = 'artículo 98, fracción I, de la Ley de Amparo';
      } else if (formData.resolucionImpugnada === 'omision-tramite') {
        plazo = null; // Cualquier tiempo
        fundamento = 'artículo 98, fracción II, de la Ley de Amparo';
      } else {
        plazo = 5; // Regla general
        fundamento = 'artículo 98 de la Ley de Amparo';
      }
      
      let fechaInicio;
      let usandoFechaConocimiento = false;
      let fechaSurte;
      let textoSurte = '';
      let fundamentoSurte = '';
      let fechaNotif: Date | null = null;
      
      if (formData.fechaConocimiento) {
        // Si hay fecha de conocimiento, usar esa fecha
        const fechaConocimiento = new Date(formData.fechaConocimiento + 'T12:00:00');
        // El plazo inicia al día siguiente de la fecha de conocimiento
        fechaInicio = siguienteDiaHabil(fechaConocimiento, diasAdicionales, tipoUsuario);
        usandoFechaConocimiento = true;
      } else {
        // Usar la lógica normal con fecha de notificación
        fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        fechaSurte = new Date(fechaNotif);
        
        // Determinar si el tercero interesado es autoridad (cuando se notifica por oficio o es autoridad-tercero)
        const esAutoridadTercero = (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio') || formData.parteRecurrente === 'autoridad-tercero';
        
        // Usar las funciones centralizadas del artículo 31
        textoSurte = getCuandoSurteEfectos(formData.formaNotificacion, formData.parteRecurrente, esAutoridadTercero);
        fundamentoSurte = getFundamentoSurtimientoEfectos(formData.formaNotificacion, formData.parteRecurrente, esAutoridadTercero);
        
        // Calcular la fecha en que surte efectos
        fechaSurte = calcularFechaSurteEfectos(
          fechaNotif, 
          formData.formaNotificacion, 
          formData.parteRecurrente, 
          esAutoridadTercero,
          esDiaInhabil,
          siguienteDiaHabil,
          diasAdicionales,
          tipoUsuario
        );
        
        // El plazo inicia al día siguiente del que surte efectos
        fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
      }
      let fechaFin;
      
      if (formData.resolucionImpugnada === 'omision-tramite') {
        // Para omisión de tramitar demanda, no hay plazo (cualquier tiempo)
        fechaFin = new Date('2099-12-31'); // Fecha muy lejana para indicar "cualquier tiempo"
      } else {
        fechaFin = calcularPlazoReal(fechaInicio, plazo!, diasAdicionales, tipoUsuario);
      }
      
      // Para litigantes, no evaluamos la oportunidad excepto en omisión
      let esOportuno = true;
      let fechaPres = null;
      
      if (tipoUsuario === 'servidor' && formData.fechaPresentacion) {
        fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
        if (formData.resolucionImpugnada === 'omision-tramite') {
          esOportuno = true; // Siempre oportuno para omisión
        } else {
          esOportuno = fechaPres <= fechaFin;
        }
      }
      
      // Obtener información de días inhábiles (solo si no es omisión)
      let diasInhabilesInfo, diasInhabilesTextoInfo;
      if (formData.resolucionImpugnada === 'omision-tramite') {
        diasInhabilesInfo = { texto: '', notas: [] };
        diasInhabilesTextoInfo = { texto: '', notas: [] };
      } else {
        // Usar la fecha de notificación o de conocimiento según corresponda
        const fechaReferencia = fechaNotif || new Date(formData.fechaConocimiento + 'T12:00:00');
        diasInhabilesInfo = obtenerDiasInhabilesConNotasMejorado(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
        diasInhabilesTextoInfo = obtenerDiasInhabilesTextoResolucion(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      }
      
      // Mapeos para el texto generado
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
        'correo': 'del sobre que obra en el toca en que se actúa',
        'momento': 'de la constancia de notificación que obra en el juicio de amparo',
        'electronica': 'de la evidencia criptográfica del escrito que lo contiene'
      };
      
      const resoluciones: {[key: string]: string} = {
        'admision-demanda': 'del acuerdo impugnado',
        'suspension-plano': 'del acuerdo impugnado',
        'fianzas-contrafianzas': 'del acuerdo impugnado',
        'tercero-interesado': 'del acuerdo impugnado',
        'naturaleza-trascendental': 'del acuerdo impugnado',
        'incidente-danos': 'de la resolución impugnada',
        'exceso-defecto': 'de la resolución impugnada',
        'cumplimiento-sustituto': 'de la resolución impugnada',
        'omision-tramite': 'de la omisión de tramitar la demanda de amparo',
        'omision-suspension': 'de la omisión de proveer sobre la suspensión',
        'incidente-danos-directo': 'de la resolución impugnada',
        'libertad-caucional': 'de la resolución impugnada'
      };
      
      const fundamentosRecurso: {[key: string]: string} = {
        'admision-demanda': 'artículo 97, fracción I, inciso a), de la Ley de Amparo',
        'suspension-plano': 'artículo 97, fracción I, inciso b), de la Ley de Amparo',
        'fianzas-contrafianzas': 'artículo 97, fracción I, inciso c), de la Ley de Amparo',
        'tercero-interesado': 'artículo 97, fracción I, inciso d), de la Ley de Amparo',
        'naturaleza-trascendental': 'artículo 97, fracción I, inciso e), de la Ley de Amparo',
        'incidente-danos': 'artículo 97, fracción I, inciso f), de la Ley de Amparo',
        'exceso-defecto': 'artículo 97, fracción I, inciso g), de la Ley de Amparo',
        'cumplimiento-sustituto': 'artículo 97, fracción I, inciso h), de la Ley de Amparo',
        'omision-tramite': 'artículo 97, fracción II, inciso a), de la Ley de Amparo',
        'omision-suspension': 'artículo 97, fracción II, inciso b), de la Ley de Amparo',
        'incidente-danos-directo': 'artículo 97, fracción II, inciso c), de la Ley de Amparo',
        'libertad-caucional': 'artículo 97, fracción II, inciso d), de la Ley de Amparo'
      };
      
      // Calcular días restantes del plazo
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      let diasRestantes = 0;
      const fechaTemp = new Date(hoy);
      
      if (fechaTemp <= fechaFin) {
        while (fechaTemp <= fechaFin) {
          if (!esDiaInhabil(fechaTemp, diasAdicionales, tipoUsuario)) {
            diasRestantes++;
          }
          fechaTemp.setDate(fechaTemp.getDate() + 1);
        }
      }
      
      setResultado({
        esOportuno,
        plazo,
        fundamento,
        textoSurte: usandoFechaConocimiento ? '' : textoSurte,
        fundamentoSurte: usandoFechaConocimiento ? 'artículo 18 de la Ley de Amparo' : fundamentoSurte,
        fechaNotificacion: formData.fechaNotificacion ? new Date(formData.fechaNotificacion + 'T12:00:00') : null,
        fechaSurte: usandoFechaConocimiento ? null : fechaSurte,
        fechaConocimiento: formData.fechaConocimiento ? new Date(formData.fechaConocimiento + 'T12:00:00') : null,
        usandoFechaConocimiento,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        fechaNotificacionTexto: formData.fechaNotificacion ? fechaATexto(formData.fechaNotificacion) : '',
        fechaConocimientoTexto: formData.fechaConocimiento ? fechaATexto(formData.fechaConocimiento) : '',
        fechaSurteEfectosTexto: usandoFechaConocimiento ? '' : fechaATexto(fechaSurte.toISOString().split('T')[0]),
        fechaInicioTexto: fechaATexto(fechaInicio.toISOString().split('T')[0]),
        fechaFinTexto: fechaATexto(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionTexto: formData.fechaPresentacion ? fechaATexto(formData.fechaPresentacion) : '',
        fechaNotificacionNumerico: formData.fechaNotificacion ? fechaParaLitigante(formData.fechaNotificacion) : '',
        fechaConocimientoNumerico: formData.fechaConocimiento ? fechaParaLitigante(formData.fechaConocimiento) : '',
        fechaSurteEfectosNumerico: usandoFechaConocimiento ? '' : fechaParaLitigante(fechaSurte.toISOString().split('T')[0]),
        fechaInicioNumerico: fechaParaLitigante(fechaInicio.toISOString().split('T')[0]),
        fechaFinNumerico: fechaParaLitigante(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionNumerico: formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : '',
        diasInhabiles: diasInhabilesInfo.texto,
        diasInhabilesTexto: diasInhabilesTextoInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        notasAlPieTexto: diasInhabilesTextoInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada,
        fundamentoRecurso: fundamentosRecurso[formData.resolucionImpugnada] || '',
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: plazo ? numeroATexto(plazo) : 'cualquier tiempo'
      });
      
      setCalculando(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el tipo de amparo, limpiar la resolución seleccionada
    if (name === 'tipoQueja') {
      setFormData({
        ...formData,
        [name]: value,
        resolucionImpugnada: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const agregarDiaInhabil = async () => {
    if (nuevoDiaInhabil && !diasAdicionales.includes(nuevoDiaInhabil)) {
      setDiasAdicionales([...diasAdicionales, nuevoDiaInhabil]);
      
      // Enviar los datos al servidor para registro
      try {
        await fetch('/api/guardar-dia-inhabil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fecha: nuevoDiaInhabil,
            fundamento: fundamentoAdicional || 'Sin fundamento especificado',
            usuario: user?.email || 'Anónimo',
            calculadora: 'recurso-de-queja'
          })
        });
      } catch (error) {
        console.error('Error al registrar día inhábil:', error);
      }
      
      setNuevoDiaInhabil('');
    }
  };

  const guardarCalculo = () => {
    if (!numeroExpediente || !resultado) return;
    
    const nuevoCalculo = {
      id: Date.now(),
      expediente: numeroExpediente,
      fechaGuardado: new Date().toISOString(),
      fechaVencimiento: resultado.fechaFin.toISOString(),
      tipoQueja: formData.tipoQueja,
      telefono: telefonoWhatsApp,
      notificaciones: {
        tresDias: false,
        dosDias: false,
        unDia: false,
        vencimiento: false
      }
    };
    
    const nuevosCalculos = [...calculos, nuevoCalculo];
    setCalculos(nuevosCalculos);
    localStorage.setItem('calculosGuardados', JSON.stringify(nuevosCalculos));
    
    alert(`Cálculo guardado para expediente ${numeroExpediente}`);
    setNumeroExpediente('');
  };

  // Función para copiar texto con formato
  const copiarTextoConFormato = async () => {
    if (!resultado) return;
    
    const textoPlano = generarTexto();
    const textoHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 12pt; text-align: justify;">
        ${generarTextoFormateado()}
      </div>
    `;
    
    try {
      // Crear el item del portapapeles con ambos formatos
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([textoPlano], { type: 'text/plain' }),
        'text/html': new Blob([textoHTML], { type: 'text/html' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      alert('Texto copiado al portapapeles con formato');
    } catch (err) {
      // Si falla, copiar solo texto plano
      navigator.clipboard.writeText(textoPlano);
      alert('Texto copiado al portapapeles');
    }
  };

  // Función para copiar solo el calendario como imagen
  const copiarCalendario = async () => {
    try {
      const calendarioElement = document.getElementById('calendario-visual');
      
      if (calendarioElement) {
        // Crear un contenedor temporal centrado
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; background: white; padding: 20px;';
        
        // Clonar el calendario para no afectar el original
        const calendarioClone = calendarioElement.cloneNode(true) as HTMLElement;
        tempContainer.appendChild(calendarioClone);
        
        // Agregar temporalmente al body
        document.body.appendChild(tempContainer);
        
        // Importar html2canvas dinámicamente
        const html2canvas = (await import('html2canvas')).default;
        
        // Capturar el contenedor temporal como canvas
        const canvas = await html2canvas(tempContainer, {
          backgroundColor: '#ffffff',
          scale: 2 // Mayor calidad
        });
        
        // Remover el contenedor temporal
        document.body.removeChild(tempContainer);
        
        // Convertir canvas a blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert('Calendario copiado como imagen');
            } catch (err) {
              alert('No se pudo copiar el calendario como imagen');
            }
          }
        });
      } else {
        alert('No se encontró el calendario');
      }
    } catch (error) {
      console.error('Error al copiar calendario:', error);
      alert('Error al copiar el calendario');
    }
  };

  const generarTexto = () => {
    if (!resultado) return '';
    
    // Determinar el género correcto según la parte recurrente
    const esQuejoso = formData.parteRecurrente === 'quejoso';
    const generoRecurrente = esQuejoso ? 'la recurrente' : 'el recurrente';
    const parteTexto = esQuejoso ? 'parte quejosa' : 'parte autoridad responsable';
    
    // Obtener el año de las fechas
    const año = new Date(formData.fechaNotificacion + 'T12:00:00').getFullYear();
    
    // Contador para referencias a Ley de Amparo
    let referenciaLeyAmparo = 0;
    const obtenerReferenciaLey = () => {
      referenciaLeyAmparo++;
      switch (referenciaLeyAmparo) {
        case 1: return 'de la Ley de Amparo';
        case 2: return 'de la legislación referida';
        case 3: return 'de la Ley de la Materia';
        case 4: return 'de la Ley de Amparo';
        default: return referenciaLeyAmparo % 2 === 0 ? 'de la legislación referida' : 'de la Ley de la Materia';
      }
    };
    
    // Función para extraer solo día y mes
    const extraerDiaMes = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 3) {
        return `${partes[0]} de ${partes[1]}`;
      }
      return fechaTexto;
    };
    
    // Función para extraer solo el día
    const extraerSoloDia = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 1) {
        return partes[0];
      }
      return fechaTexto;
    };
    
    // Función para verificar si dos fechas son del mismo mes y año
    const mismoMesYAno = (fecha1: string, fecha2: string) => {
      const partes1 = fecha1.split(' de ');
      const partes2 = fecha2.split(' de ');
      if (partes1.length >= 3 && partes2.length >= 3) {
        return partes1[1] === partes2[1] && partes1[2] === partes2[2];
      }
      return false;
    };
    
    // Función para formatear rango de fechas evitando repetición
    const formatearRangoFechas = (fechaInicio: string, fechaFin: string) => {
      const partesInicio = fechaInicio.split(' de ');
      const partesFin = fechaFin.split(' de ');
      
      // Si ambas fechas tienen día, mes y año
      if (partesInicio.length >= 3 && partesFin.length >= 3) {
        const mesInicio = partesInicio[1];
        const añoInicio = partesInicio[2];
        const mesFin = partesFin[1];
        const añoFin = partesFin[2];
        
        // Si es el mismo mes y año, simplificar
        if (mesInicio === mesFin && añoInicio === añoFin) {
          return `${partesInicio[0]} al ${partesFin[0]} de ${mesInicio} de ${añoInicio}`;
        }
        
        // Si es diferente mes pero mismo año (año ya incluido en el contexto)
        if (mesInicio !== mesFin && añoInicio === añoFin) {
          return `${partesInicio[0]} de ${mesInicio} al ${partesFin[0]} de ${mesFin}`;
        }
      }
      
      // Si es el mismo mes (sin año), solo mostrar el día al final
      if (partesInicio.length >= 2 && partesFin.length >= 2 && partesInicio[1] === partesFin[1]) {
        return `${partesInicio[0]} al ${partesFin[0]} de ${partesInicio[1]}`;
      }
      
      // Si es diferente mes, mostrar completo
      return `${extraerDiaMes(fechaInicio)} al ${extraerDiaMes(fechaFin)}`;
    };
    
    let texto: string;
    
    if (formData.resolucionImpugnada === 'omision-tramite') {
      // Texto específico para omisión de tramitar demanda
      const tipoAmparo = formData.tipoQueja === 'directo' ? 'directo' : 'indirecto';
      const fraccionCorrecta = formData.tipoQueja === 'directo' ? 'II, inciso a)' : 'I, inciso a)';
      
      texto = `La presentación del recurso de queja es oportuna dado que se impugna la omisión de tramitar una demanda de amparo ${tipoAmparo}, conforme lo previsto en el artículo 97, fracción ${fraccionCorrecta}, ${obtenerReferenciaLey()}, y de acuerdo a lo establecido en el diverso numeral 98, fracción II, ${obtenerReferenciaLey()}, ello puede ocurrir en cualquier tiempo.`;
    } else {
      // Determinar si se presentó antes del inicio del cómputo
      const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
      const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
      
      // Texto para días inhábiles (solo si hay)
      const textoInhabiles = resultado.diasInhabilesTexto && resultado.diasInhabilesTexto.trim() !== '' 
        ? `, con exclusión de los días ${resultado.diasInhabilesTexto}` 
        : '';
      
      // Determinar el fundamento del recurso con referencia a Ley de Amparo
      const fundamentoRecursoTexto = resultado.fundamentoRecurso.replace('de la Ley de Amparo', obtenerReferenciaLey());
      
      // Determinar el texto del verbo según si se presentó antes del cómputo
      const verboTranscurrir = antesDelComputo ? 'transcurriría' : 'transcurrió';
      
      // Determinar si la fecha de surte efectos es del mismo mes que la notificación
      const surteMismoMes = mismoMesYAno(resultado.fechaNotificacionTexto, resultado.fechaSurteEfectosTexto);
      const textoSurteEfectos = surteMismoMes 
        ? `${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`
        : `${extraerDiaMes(resultado.fechaSurteEfectosTexto)} siguiente`;
      
      // Simplificar el rango de fechas si son del mismo mes y año
      const fechasRangoMismoMes = mismoMesYAno(resultado.fechaInicioTexto, resultado.fechaFinTexto);
      const textoRangoFechas = fechasRangoMismoMes
        ? `${extraerSoloDia(resultado.fechaInicioTexto)} al ${extraerSoloDia(resultado.fechaFinTexto)} de los citados mes y año`
        : `${formatearRangoFechas(resultado.fechaInicioTexto, resultado.fechaFinTexto)} del citado año`;
      
      texto = `La presentación del recurso de queja es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación ${resultado.resolucionImpugnada}, que se ubica en la hipótesis prevista en el ${fundamentoRecursoTexto}, se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, ${parteTexto} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${textoSurteEfectos}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso ${resultado.fundamento.replace('de la Ley de Amparo', obtenerReferenciaLey())}, ${verboTranscurrir} del ${textoRangoFechas}${textoInhabiles}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;

      // Agregar jurisprudencia si se presentó antes del cómputo
      if (antesDelComputo && resultado.esOportuno) {
        texto += `

Al respecto, resulta aplicable la jurisprudencia VII.2o.T. J/13 (10a.), sustentada por el Segundo Tribunal Colegiado en Materia de Trabajo del Séptimo Circuito, que se comparte, con el rubro y texto siguientes:
"RECURSO DE QUEJA EN EL JUICIO DE AMPARO. SU INTERPOSICIÓN RESULTA OPORTUNA AUN CUANDO OCURRA ANTES DE QUE INICIE EL CÓMPUTO DEL PLAZO RESPECTIVO. Conforme a lo dispuesto por el artículo 98, primer párrafo, de la Ley de la Materia, el recurso de queja podrá interponerse dentro del término de cinco días siguientes al en que surta efectos la notificación de la resolución que se recurra; de lo que se infiere lógicamente que este medio de impugnación no podrá hacerse valer con posterioridad a dicho periodo; sin embargo, ello no impide que pueda interponerse antes de que inicie el cómputo del plazo, debido a que esa anticipación no infringe ni sobrepasa el término previsto en la ley, si se toma en cuenta que el establecimiento de un límite temporal para ejercer un derecho, como en el caso, para interponer el recurso de queja, tiene como propósito primordial generar seguridad jurídica respecto a las resoluciones jurisdiccionales objeto de impugnación, pero no prohibir que ese derecho se ejerza anticipadamente."`;
      }
    }
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      texto += '\n\n__________________________________\n';
      resultado.notasAlPieTexto.forEach((nota: string) => {
        texto += `${nota}\n`;
      });
    }
    
    return texto;
  };

  const generarTextoFormateado = () => {
    if (!resultado) return '';
    
    // Determinar el género correcto según la parte recurrente
    const esQuejoso = formData.parteRecurrente === 'quejoso';
    const generoRecurrente = esQuejoso ? 'la recurrente' : 'el recurrente';
    const parteTexto = esQuejoso ? 'parte quejosa' : 'parte autoridad responsable';
    
    // Contador para referencias a Ley de Amparo
    let referenciaLeyAmparo = 0;
    const obtenerReferenciaLey = () => {
      referenciaLeyAmparo++;
      switch (referenciaLeyAmparo) {
        case 1: return 'de la Ley de Amparo';
        case 2: return 'de la legislación referida';
        case 3: return 'de la Ley de la Materia';
        case 4: return 'de la Ley de Amparo';
        default: return referenciaLeyAmparo % 2 === 0 ? 'de la legislación referida' : 'de la Ley de la Materia';
      }
    };
    
    // Función para extraer solo día y mes
    const extraerDiaMes = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 3) {
        return `${partes[0]} de ${partes[1]}`;
      }
      return fechaTexto;
    };
    
    // Función para extraer solo el día
    const extraerSoloDia = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 1) {
        return partes[0];
      }
      return fechaTexto;
    };
    
    // Función para verificar si dos fechas son del mismo mes y año
    const mismoMesYAno = (fecha1: string, fecha2: string) => {
      const partes1 = fecha1.split(' de ');
      const partes2 = fecha2.split(' de ');
      if (partes1.length >= 3 && partes2.length >= 3) {
        return partes1[1] === partes2[1] && partes1[2] === partes2[2];
      }
      return false;
    };
    
    // Función para formatear rango de fechas evitando repetición
    const formatearRangoFechas = (fechaInicio: string, fechaFin: string) => {
      const partesInicio = fechaInicio.split(' de ');
      const partesFin = fechaFin.split(' de ');
      
      // Si ambas fechas tienen día, mes y año
      if (partesInicio.length >= 3 && partesFin.length >= 3) {
        const mesInicio = partesInicio[1];
        const añoInicio = partesInicio[2];
        const mesFin = partesFin[1];
        const añoFin = partesFin[2];
        
        // Si es el mismo mes y año, simplificar
        if (mesInicio === mesFin && añoInicio === añoFin) {
          return `${partesInicio[0]} al ${partesFin[0]} de ${mesInicio} de ${añoInicio}`;
        }
        
        // Si es diferente mes pero mismo año (año ya incluido en el contexto)
        if (mesInicio !== mesFin && añoInicio === añoFin) {
          return `${partesInicio[0]} de ${mesInicio} al ${partesFin[0]} de ${mesFin}`;
        }
      }
      
      // Si es el mismo mes (sin año), solo mostrar el día al final
      if (partesInicio.length >= 2 && partesFin.length >= 2 && partesInicio[1] === partesFin[1]) {
        return `${partesInicio[0]} al ${partesFin[0]} de ${partesInicio[1]}`;
      }
      
      // Si es diferente mes, mostrar completo
      return `${extraerDiaMes(fechaInicio)} al ${extraerDiaMes(fechaFin)}`;
    };
    
    let textoHTML: string;
    
    if (formData.resolucionImpugnada === 'omision-tramite') {
      // Texto específico para omisión de tramitar demanda
      const tipoAmparo = formData.tipoQueja === 'directo' ? 'directo' : 'indirecto';
      const fraccionCorrecta = formData.tipoQueja === 'directo' ? 'II, inciso a)' : 'I, inciso a)';
      
      textoHTML = `<p style="text-indent: 2em; margin-bottom: 1em;">La presentación del recurso de queja es oportuna dado que se impugna la omisión de tramitar una demanda de amparo ${tipoAmparo}, conforme lo previsto en el artículo 97, fracción ${fraccionCorrecta}, ${obtenerReferenciaLey()}, y de acuerdo a lo establecido en el diverso numeral 98, fracción II, ${obtenerReferenciaLey()}, ello puede ocurrir en cualquier tiempo.</p>`;
    } else {
      // Determinar si se presentó antes del inicio del cómputo
      const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
      const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
      
      // Texto para días inhábiles (solo si hay)
      const textoInhabiles = resultado.diasInhabilesTexto && resultado.diasInhabilesTexto.trim() !== '' 
        ? `, con exclusión de los días ${resultado.diasInhabilesTexto}` 
        : '';
      
      // Determinar el fundamento del recurso con referencia a Ley de Amparo
      const fundamentoRecursoTexto = resultado.fundamentoRecurso.replace('de la Ley de Amparo', obtenerReferenciaLey());
      
      // Determinar el texto del verbo según si se presentó antes del cómputo
      const verboTranscurrir = antesDelComputo ? 'transcurriría' : 'transcurrió';
      
      // Determinar si la fecha de surte efectos es del mismo mes que la notificación
      const surteMismoMes = mismoMesYAno(resultado.fechaNotificacionTexto, resultado.fechaSurteEfectosTexto);
      const textoSurteEfectos = surteMismoMes 
        ? `${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`
        : `${extraerDiaMes(resultado.fechaSurteEfectosTexto)} siguiente`;
      
      // Simplificar el rango de fechas si son del mismo mes y año
      const fechasRangoMismoMes = mismoMesYAno(resultado.fechaInicioTexto, resultado.fechaFinTexto);
      const textoRangoFechas = fechasRangoMismoMes
        ? `${extraerSoloDia(resultado.fechaInicioTexto)} al ${extraerSoloDia(resultado.fechaFinTexto)} de los citados mes y año`
        : `${formatearRangoFechas(resultado.fechaInicioTexto, resultado.fechaFinTexto)} del citado año`;
      
      textoHTML = `<p style="text-indent: 2em; margin-bottom: 1em;">La presentación del recurso de queja es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación ${resultado.resolucionImpugnada}, que se ubica en la hipótesis prevista en el ${fundamentoRecursoTexto}, se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, ${parteTexto} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${textoSurteEfectos}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso ${resultado.fundamento.replace('de la Ley de Amparo', obtenerReferenciaLey())}, ${verboTranscurrir} del ${textoRangoFechas}${textoInhabiles}.</p>`;

      textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.</p>`;

      // Agregar jurisprudencia si se presentó antes del cómputo
      if (antesDelComputo && resultado.esOportuno) {
        // Calcular el número de nota para la jurisprudencia (siguiente número después de las notas existentes)
        const numeroNota = (resultado.notasAlPieTexto ? resultado.notasAlPieTexto.length : 0) + 1;
        
        textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Al respecto, resulta aplicable la jurisprudencia VII.2o.T. J/13 (10a.)<sup style="font-size: 0.6em;">${numeroNota}</sup>, sustentada por el Segundo Tribunal Colegiado en Materia de Trabajo del Séptimo Circuito, que se comparte, con el rubro y texto siguientes:</p>`;
        
        textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;"><strong>"RECURSO DE QUEJA EN EL JUICIO DE AMPARO. SU INTERPOSICIÓN RESULTA OPORTUNA AUN CUANDO OCURRA ANTES DE QUE INICIE EL CÓMPUTO DEL PLAZO RESPECTIVO.</strong> Conforme a lo dispuesto por el artículo 98, primer párrafo, de la Ley de la Materia, el recurso de queja podrá interponerse dentro del término de cinco días siguientes al en que surta efectos la notificación de la resolución que se recurra; de lo que se infiere lógicamente que este medio de impugnación no podrá hacerse valer con posterioridad a dicho periodo; sin embargo, ello no impide que pueda interponerse antes de que inicie el cómputo del plazo, debido a que esa anticipación no infringe ni sobrepasa el término previsto en la ley, si se toma en cuenta que el establecimiento de un límite temporal para ejercer un derecho, como en el caso, para interponer el recurso de queja, tiene como propósito primordial generar seguridad jurídica respecto a las resoluciones jurisdiccionales objeto de impugnación, pero no prohibir que ese derecho se ejerza anticipadamente."</p>`;
      }
    }
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      textoHTML += '<div style="border-top: 1px solid #ccc; margin-top: 1.5em; padding-top: 0.5em;">';
      resultado.notasAlPieTexto.forEach((nota: string) => {
        textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;">${nota}</p>`;
      });
      
      // Agregar la referencia de la jurisprudencia si existe
      if (formData.resolucionImpugnada !== 'omision-tramite') {
        const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
        const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
        
        if (antesDelComputo && resultado.esOportuno) {
          const numeroNota = (resultado.notasAlPieTexto ? resultado.notasAlPieTexto.length : 0) + 1;
          textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;"><sup style="font-size: 0.6em;">${numeroNota}</sup> Registro digital: 2010780. Décima Época. Gaceta del Semanario Judicial de la Federación. Libro 26, Enero de 2016, Tomo III, página 2348.</p>`;
        }
      }
      
      textoHTML += '</div>';
    } else if (formData.resolucionImpugnada !== 'omision-tramite') {
      // Si no hay otras notas pero sí jurisprudencia, crear la sección
      const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
      const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
      
      if (antesDelComputo && resultado.esOportuno) {
        textoHTML += '<div style="border-top: 1px solid #ccc; margin-top: 1.5em; padding-top: 0.5em;">';
        textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;"><sup style="font-size: 0.6em;">1</sup> Registro digital: 2010780. Décima Época. Gaceta del Semanario Judicial de la Federación. Libro 26, Enero de 2016, Tomo III, página 2348.</p>`;
        textoHTML += '</div>';
      }
    }
    
    return textoHTML;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8', position: 'relative' }}>
      <style jsx>{`
        .texto-resolucion sup {
          font-size: 0.6em;
          vertical-align: super;
          line-height: 0;
        }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
      
      {/* Franja dorada superior */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '122px', 
        backgroundColor: '#C5A770', 
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      
      {/* Línea negra */}
      <div style={{ 
        position: 'absolute', 
        top: '122px', 
        left: 0, 
        right: 0, 
        height: '1.5px', 
        backgroundColor: '#1C1C1C',
        zIndex: 1
      }}></div>
      
      {/* Logo K-LAW */}
      <div style={{ 
        position: 'absolute', 
        top: '-43px', 
        left: '20px', 
        zIndex: 15 
      }}>
        <Link href="/">
          <img 
            src="/LOGO-KLAW.gif" 
            alt="K-LAW Logo" 
            style={{ 
              display: 'block',
              width: 'auto',
              height: 'auto',
              maxWidth: '599px',
              maxHeight: '240px',
              cursor: 'pointer'
            }}
          />
        </Link>
      </div>
      
      {/* Patrón diagonal */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1C1C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none'
      }} />
      
      {/* Contenido principal */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '122px' }}>
        
        {/* Nav minimalista */}
        <nav style={{ padding: '1rem 0' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
            <span style={{ 
              backgroundColor: 'transparent', 
              color: '#1C1C1C', 
              fontWeight: '500', 
              fontSize: '0.875rem', 
              fontFamily: 'Inter, sans-serif',
              border: '1.5px solid #C5A770',
              padding: '6px 16px',
              borderRadius: '20px'
            }}>
              Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
            </span>
            <Link href="/calculadoras" 
              className="text-sm px-4 py-2" 
              style={{ 
                backgroundColor: '#1C1C1C', 
                color: '#FFFFFF', 
                border: '1.5px solid #1C1C1C', 
                borderRadius: '6px', 
                transition: 'all 0.3s ease', 
                cursor: 'pointer', 
                fontFamily: 'Inter, sans-serif' 
              }} 
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = '#C5A770'; 
                e.currentTarget.style.borderColor = '#C5A770';
                e.currentTarget.style.color = '#1C1C1C'; 
              }} 
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                e.currentTarget.style.borderColor = '#1C1C1C';
                e.currentTarget.style.color = '#FFFFFF'; 
              }}>
              Volver
            </Link>
          </div>
        </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontWeight: '800',
            color: '#1C1C1C',
            letterSpacing: '-0.02em'
          }}>
            Recurso de Queja
          </h1>
          <p className="text-sm md:text-base" style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#3D3D3D',
            fontWeight: '300',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Sistema profesional de cálculo de plazos legales
          </p>
        </div>
        
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)', padding: '2.5rem', border: '1.5px solid #C5A770' }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Tipo de Recurso</label>
                  <select name="tipoQueja" value={formData.tipoQueja} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                    <option value="indirecto">Queja en Amparo Indirecto</option>
                    <option value="directo">Queja en Amparo Directo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Resolución Impugnada</label>
                  <select name="resolucionImpugnada" value={formData.resolucionImpugnada} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                    <option value="">Seleccione...</option>
                    {formData.tipoQueja === 'indirecto' ? (
                      // Fracción I - Amparo Indirecto
                      <>
                        <option value="admision-demanda">Acuerdos que admitan total o parcialmente, desechen o tengan por no presentada una demanda de amparo indirecto o su ampliación</option>
                        <option value="suspension-plano">Acuerdos que concedan o nieguen la suspensión de plano o la provisional</option>
                        <option value="fianzas-contrafianzas">Acuerdos que rehúsen la admisión de fianzas o contrafianzas, admitan las que no reúnan los requisitos legales o que puedan resultar excesivas o insuficientes</option>
                        <option value="tercero-interesado">Acuerdos que reconozcan o nieguen el carácter de persona tercera interesada</option>
                        <option value="naturaleza-trascendental">Acuerdos o resoluciones que por su naturaleza trascendental y grave puedan causar perjuicio a alguna de las partes</option>
                        <option value="incidente-danos">Resolución que decide el incidente de reclamación de daños y perjuicios</option>
                        <option value="exceso-defecto">Determinación que resuelve el incidente por exceso o defecto en la ejecución del acuerdo de suspensión</option>
                        <option value="cumplimiento-sustituto">Determinación dictada en el incidente de cumplimiento sustituto de las sentencias de amparo</option>
                      </>
                    ) : (
                      // Fracción II - Amparo Directo  
                      <>
                        <option value="omision-tramite">Cuando omita tramitar la demanda de amparo o lo haga indebidamente</option>
                        <option value="omision-suspension">Omisión de proveer sobre la suspensión dentro del plazo legal</option>
                        <option value="incidente-danos-directo">Resolución que decide el incidente de reclamación de daños y perjuicios</option>
                        <option value="libertad-caucional">Resolución o acuerdo que niegue a la persona quejosa su libertad caucional</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Parte Recurrente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                    <option value="">Seleccione...</option>
                    <option value="autoridad">Autoridad responsable</option>
                    <option value="quejoso">Quejoso</option>
                    <option value="tercero">Tercero interesado</option>
                    <option value="autoridad-tercero">Autoridad tercero interesada</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="label block mb-4" style={{ color: '#1C1C1C', fontWeight: '700', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>Seleccione:</label>
                  <div className="space-y-4">
                    <div style={{ backgroundColor: '#F4EFE8', padding: '1rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', transition: 'all 0.3s ease' }}>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="tipoFecha" 
                          value="notificacion"
                          checked={tipoFecha === 'notificacion'}
                          onChange={() => {
                            setTipoFecha('notificacion');
                            setFormData({...formData, fechaConocimiento: ''});
                          }}
                          style={{ accentColor: '#1C1C1C' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#1C1C1C', fontWeight: '500' }}>
                          {formData.resolucionImpugnada === 'omision-tramite' ? 'Fecha de Presentación de la Demanda que se Omitió Tramitar' : 'Fecha de Notificación'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campos de notificación justo después de seleccionar esa opción */}
                    {tipoFecha === 'notificacion' && (
                      <div className="ml-8 space-y-4" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            {formData.resolucionImpugnada === 'omision-tramite' ? 'Fecha de Presentación de la Demanda' : 'Fecha de Notificación'}
                          </label>
                          <input 
                            type="date" 
                            name="fechaNotificacion" 
                            value={formData.fechaNotificacion} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.borderColor = '#C5A770'}
                            onBlur={(e) => e.target.style.borderColor = '#1C1C1C'}
                            required 
                          />
                        </div>
                        {formData.resolucionImpugnada !== 'omision-tramite' && (
                          <div>
                            <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                            <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                              <option value="">Seleccione...</option>
                              <option value="personal">Personalmente</option>
                              {(formData.parteRecurrente === 'autoridad' || formData.parteRecurrente === 'autoridad-tercero') && (
                                <option value="oficio">Por oficio</option>
                              )}
                              <option value="lista">Por lista</option>
                              <option value="electronica">En forma electrónica</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ 
                      backgroundColor: tipoFecha === 'notificacion' ? '#f5f5f5' : '#ffffff', 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      border: '1.5px solid #1C1C1C', 
                      transition: 'all 0.3s ease',
                      opacity: tipoFecha === 'notificacion' ? '0.6' : '1'
                    }}>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="tipoFecha" 
                          value="conocimiento"
                          checked={tipoFecha === 'conocimiento'}
                          onChange={() => {
                            setTipoFecha('conocimiento');
                            setFormData({...formData, fechaNotificacion: '', formaNotificacion: ''});
                          }}
                          style={{ accentColor: '#1C1C1C' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: tipoFecha === 'notificacion' ? '#999' : '#1C1C1C', fontWeight: '500' }}>
                          Fecha de conocimiento
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campo de conocimiento */}
                    {tipoFecha === 'conocimiento' && (
                      <div className="ml-8" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            Fecha de Conocimiento
                          </label>
                          <input 
                            type="date" 
                            name="fechaConocimiento" 
                            value={formData.fechaConocimiento} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.borderColor = '#C5A770'}
                            onBlur={(e) => e.target.style.borderColor = '#1C1C1C'}
                            required 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{formData.resolucionImpugnada === 'omision-tramite' ? 'Fecha de Presentación del Recurso de Queja' : 'Fecha de Presentación'}</label>
                      <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required={tipoUsuario === 'servidor'} suppressHydrationWarning={true} />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{formData.resolucionImpugnada === 'omision-tramite' ? 'Forma de Presentación del Recurso de Queja' : 'Forma de Presentación'}</label>
                      <select name="formaPresentacion" value={formData.formaPresentacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required={tipoUsuario === 'servidor'} suppressHydrationWarning={true}>
                        <option value="">Seleccione...</option>
                        <option value="escrito">Por escrito</option>
                        <option value="correo">Por correo</option>
                        {formData.formaNotificacion === 'personal' && (
                          <option value="momento">Al momento de ser notificado</option>
                        )}
                        <option value="electronica">En forma electrónica</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <button type="submit" disabled={calculando} style={{ width: '100%', backgroundColor: calculando ? '#E5E5E5' : '#1C1C1C', color: calculando ? '#999' : '#F4EFE8', padding: '1rem 2rem', borderRadius: '25px', fontSize: '1rem', fontWeight: '500', transition: 'all 0.3s ease', cursor: calculando ? 'not-allowed' : 'pointer', border: '1.5px solid #1C1C1C', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }} onMouseEnter={(e) => { if (!calculando) { e.currentTarget.style.backgroundColor = '#C5A770'; e.currentTarget.style.borderColor = '#C5A770'; e.currentTarget.style.color = '#1C1C1C'; } }} onMouseLeave={(e) => { if (!calculando) { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.borderColor = '#1C1C1C'; e.currentTarget.style.color = '#F4EFE8'; } }} suppressHydrationWarning={true}>
                  {calculando ? 'Calculando...' : 'Calcular Plazo'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div style={{ backgroundColor: 'transparent', borderRadius: '30px', padding: '2rem', border: '2px solid #C5A770' }}>
              <h3 style={{ color: '#1C1C1C', fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>Días Inhábiles Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Agregar día inhábil</label>
                  <div className="flex gap-2">
                    <input type="date" value={nuevoDiaInhabil} onChange={(e) => setNuevoDiaInhabil(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1.5px solid #1C1C1C', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} suppressHydrationWarning={true} />
                    <button type="button" onClick={agregarDiaInhabil} style={{ backgroundColor: '#1C1C1C', color: '#F4EFE8', padding: '0.5rem 1rem', borderRadius: '25px', fontSize: '0.875rem', fontWeight: '500', border: '1.5px solid #1C1C1C', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C5A770'; e.currentTarget.style.borderColor = '#C5A770'; e.currentTarget.style.color = '#1C1C1C'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.borderColor = '#1C1C1C'; e.currentTarget.style.color = '#F4EFE8'; }} suppressHydrationWarning={true}>
                      Agregar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} suppressHydrationWarning={true} />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center p-2 rounded text-sm" style={{ backgroundColor: 'rgba(197, 167, 112, 0.1)', border: '1px solid #C5A770' }}>
                          <span style={{ color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>{tipoUsuario === 'litigante' ? fechaParaLitigante(dia) : fechaATexto(dia)}</span>
                          <button type="button" onClick={() => setDiasAdicionales(diasAdicionales.filter(d => d !== dia))} className="text-red-400 hover:text-red-300">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </section>
        
        {resultado && (
          <>
            <div className="mt-16" style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 20px rgba(28, 28, 28, 0.08)', padding: '2.5rem', border: '1.5px solid #C5A770' }}>
              <div className="text-center mb-8">
                <h2 style={{ color: '#1C1C1C', fontSize: '1.75rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>Resultado del Cálculo</h2>
              </div>
              
              <div style={{ padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', background: resultado.esOportuno ? 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: `1.5px solid ${resultado.esOportuno ? '#C5A770' : '#dc2626'}` }}>
                {tipoUsuario === 'servidor' ? (
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1C1C1C' }}>
                    El recurso se presentó de forma: {' '}
                    <span style={{ color: resultado.esOportuno ? '#16a34a' : '#dc2626' }}>
                      {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                    </span>
                  </p>
                ) : (
                  <div>
                    {formData.resolucionImpugnada === 'omision-tramite' ? (
                      <p className="text-lg font-semibold text-green-700">
                        No hay plazo - El recurso puede presentarse en cualquier momento
                      </p>
                    ) : (
                      <>
                        <p className="text-lg font-semibold">
                          El plazo para presentar el recurso vence el: {' '}
                          <span className="text-green-700">
                            {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}
                          </span>
                        </p>
                        {resultado.diasRestantes > 0 && (
                          <p className="mt-2 text-sm">
                            Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                          </p>
                        )}
                        {resultado.diasRestantes === 0 && (
                          <p className="mt-2 text-sm text-red-600 font-bold">
                            ⚠️ El plazo ha vencido
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#F4EFE8', border: '1.5px solid #C5A770' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Detalles del Cómputo:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Plazo legal:</strong> {formData.resolucionImpugnada === 'omision-tramite' ? 'Cualquier tiempo' : `${resultado.plazo} días`}</p>
                  <p><strong>Fundamento:</strong> {resultado.fundamento}</p>
                  {resultado.usandoFechaConocimiento ? (
                    <p><strong>Fecha de conocimiento:</strong> {fechaParaLitigante(formData.fechaConocimiento)}</p>
                  ) : (
                    <>
                      <p><strong>{formData.resolucionImpugnada === 'omision-tramite' ? 'Fecha de presentación de la demanda:' : 'Fecha de notificación:'}</strong> {fechaParaLitigante(formData.fechaNotificacion)}</p>
                      {formData.resolucionImpugnada !== 'omision-tramite' && (
                        <p><strong>Surte efectos:</strong> {fechaParaLitigante(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                      )}
                    </>
                  )}
                  <p><strong>Período del cómputo:</strong> {formData.resolucionImpugnada === 'omision-tramite' ? 'Puede presentarse en cualquier tiempo' : simplificarPeriodoFechas(resultado.fechaInicio.toISOString().split('T')[0], resultado.fechaFin.toISOString().split('T')[0])}</p>
                  {tipoUsuario === 'servidor' && (
                    <p><strong>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : ''}</p>
                  )}
                  {formData.resolucionImpugnada !== 'omision-tramite' && (
                    <p className="texto-resolucion"><strong>Días inhábiles excluidos:</strong> {(() => {
                      // Generar texto con formato numérico y superíndices para detalles
                      const fechaReferencia = resultado.usandoFechaConocimiento && resultado.fechaConocimiento ? 
                        resultado.fechaConocimiento : 
                        (resultado.fechaNotificacion || resultado.fechaInicio);
                      
                      const diasInhabiles: { fecha: Date, tipo: 'sabado' | 'domingo' | 'otro', fundamento?: string }[] = [];
                      const notas: string[] = [];
                      let contadorNotas = 1;
                      const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
                      const fundamentosUsados = new Map<string, number>();
                      
                      const fechaActual = new Date(fechaReferencia);
                      while (fechaActual <= resultado.fechaFin) {
                        if (esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
                          const diaSemana = fechaActual.getDay();
                          const fechaStr = fechaActual.toISOString().split('T')[0];
                          let tipo: 'sabado' | 'domingo' | 'otro';
                          let fundamento = '';
                          
                          if (diaSemana === 6) {
                            tipo = 'sabado';
                            fundamento = 'artículo 19 de la Ley de Amparo';
                          } else if (diaSemana === 0) {
                            tipo = 'domingo';
                            fundamento = 'artículo 19 de la Ley de Amparo';
                          } else {
                            tipo = 'otro';
                            if (diasAdicionales.includes(fechaStr)) {
                              fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
                            } else {
                              const año = fechaActual.getFullYear();
                              for (const diaInhabil of diasInhabilesData) {
                                let coincide = false;
                                if (diaInhabil.tipo === 'movil') {
                                  const diasMoviles = calcularDiasMoviles(año);
                                  for (const diaMovil of diasMoviles) {
                                    if (fechaStr === diaMovil.fecha) coincide = true;
                                  }
                                } else if (diaInhabil.fecha) {
                                  if (diaInhabil.fecha.includes('-')) {
                                    if (fechaStr === diaInhabil.fecha) coincide = true;
                                  } else {
                                    const messDia = fechaStr.substring(5);
                                    if (messDia === diaInhabil.fecha) coincide = true;
                                  }
                                }
                                if (coincide && (diaInhabil.aplicaPara === 'todos' || diaInhabil.aplicaPara === tipoUsuario)) {
                                  fundamento = diaInhabil.fundamento;
                                  break;
                                }
                              }
                            }
                          }
                          diasInhabiles.push({ fecha: new Date(fechaActual), tipo, fundamento });
                        }
                        fechaActual.setDate(fechaActual.getDate() + 1);
                      }
                      
                      // Contar sábados y domingos
                      const sabados = diasInhabiles.filter(d => d.tipo === 'sabado').length;
                      const domingos = diasInhabiles.filter(d => d.tipo === 'domingo').length;
                      const otrosDias = diasInhabiles.filter(d => d.tipo === 'otro');
                      
                      let texto = '';
                      
                      // Agregar sábados y domingos con superíndice
                      if (sabados > 0 || domingos > 0) {
                        const fundamentoSabDom = 'artículo 19 de la Ley de Amparo';
                        let numeroNota: number;
                        if (!fundamentosUsados.has(fundamentoSabDom)) {
                          numeroNota = contadorNotas;
                          fundamentosUsados.set(fundamentoSabDom, numeroNota);
                          notas.push(fundamentoSabDom + '.');
                          contadorNotas++;
                        } else {
                          numeroNota = fundamentosUsados.get(fundamentoSabDom)!;
                        }
                        const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
                        
                        if ((sabados > 0 && domingos > 0)) {
                          texto = `sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
                        } else if (sabados > 0) {
                          texto = `sábados incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
                        } else {
                          texto = `domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
                        }
                      }
                      
                      // Agrupar todos los otros días con sus fundamentos
                      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                      
                      if (otrosDias.length > 0) {
                        if (texto) texto += ', así como los días ';
                        
                        // Crear estructura para agrupar días con sus superíndices
                        const diasConSuperindices: { fecha: Date, superindice: string }[] = [];
                        
                        otrosDias.forEach(d => {
                          const fund = d.fundamento || 'Sin fundamento';
                          let numeroNota: number;
                          
                          if (!fundamentosUsados.has(fund)) {
                            numeroNota = contadorNotas;
                            fundamentosUsados.set(fund, numeroNota);
                            notas.push(fund + '.');
                            contadorNotas++;
                          } else {
                            numeroNota = fundamentosUsados.get(fund)!;
                          }
                          
                          const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
                          diasConSuperindices.push({ fecha: d.fecha, superindice });
                        });
                        
                        // Agrupar por año primero
                        const diasPorAño = new Map<number, { fecha: Date, superindice: string }[]>();
                        diasConSuperindices.forEach(d => {
                          const año = d.fecha.getFullYear();
                          if (!diasPorAño.has(año)) {
                            diasPorAño.set(año, []);
                          }
                          diasPorAño.get(año)!.push(d);
                        });
                        
                        const textosAños: string[] = [];
                        
                        diasPorAño.forEach((diasDelAño, año) => {
                          // Ordenar por fecha
                          diasDelAño.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
                          
                          // Agrupar por mes dentro del año
                          const diasPorMes = new Map<number, { dia: number, superindice: string }[]>();
                          diasDelAño.forEach(d => {
                            const mes = d.fecha.getMonth();
                            if (!diasPorMes.has(mes)) {
                              diasPorMes.set(mes, []);
                            }
                            diasPorMes.get(mes)!.push({ dia: d.fecha.getDate(), superindice: d.superindice });
                          });
                          
                          // Si todos los días son del mismo mes
                          if (diasPorMes.size === 1) {
                            const [mes, diasDelMes] = Array.from(diasPorMes.entries())[0];
                            diasDelMes.sort((a, b) => a.dia - b.dia);
                            
                            const diasTexto = diasDelMes.map(d => `${d.dia}${d.superindice}`).join(', ');
                            const ultimaComa = diasTexto.lastIndexOf(',');
                            const diasFormateado = ultimaComa > -1 ? 
                              diasTexto.substring(0, ultimaComa) + ' y' + diasTexto.substring(ultimaComa + 1) : 
                              diasTexto;
                            
                            textosAños.push(`${diasFormateado} de ${meses[mes]} de ${año}`);
                          } else {
                            // Días de diferentes meses del mismo año
                            const textosMeses: string[] = [];
                            const mesesOrdenados = Array.from(diasPorMes.keys()).sort((a, b) => a - b);
                            
                            mesesOrdenados.forEach((mes, idx) => {
                              const diasDelMes = diasPorMes.get(mes)!;
                              diasDelMes.sort((a, b) => a.dia - b.dia);
                              
                              const diasTexto = diasDelMes.map(d => `${d.dia}${d.superindice}`).join(', ');
                              const ultimaComa = diasTexto.lastIndexOf(',');
                              const diasFormateado = ultimaComa > -1 ? 
                                diasTexto.substring(0, ultimaComa) + ' y' + diasTexto.substring(ultimaComa + 1) : 
                                diasTexto;
                              
                              if (idx === mesesOrdenados.length - 1 && mesesOrdenados.length > 1) {
                                // Último mes - incluir el año
                                textosMeses.push(`${diasFormateado} de ${meses[mes]} de ${año}`);
                              } else {
                                // Otros meses - sin año
                                textosMeses.push(`${diasFormateado} de ${meses[mes]}`);
                              }
                            });
                            
                            const textoFinal = textosMeses.join(', ');
                            const ultimaComa = textoFinal.lastIndexOf(',');
                            const textoFormateado = ultimaComa > -1 ? 
                              textoFinal.substring(0, ultimaComa) + ' y' + textoFinal.substring(ultimaComa + 1) : 
                              textoFinal;
                            
                            textosAños.push(textoFormateado);
                          }
                        });
                        
                        texto += textosAños.join('; ');
                      }
                      
                      // Guardar las notas para mostrarlas después
                      resultado.diasInhabilesDetallesNotas = notas;
                      return texto || 'Ninguno';
                    })()}</p>
                  )}
                </div>
                
                {/* Notas al pie para Detalles del Cómputo */}
                {formData.resolucionImpugnada !== 'omision-tramite' && resultado.diasInhabilesDetallesNotas && resultado.diasInhabilesDetallesNotas.length > 0 && (
                  <div style={{ borderTop: '1px solid #C5A770', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                    {resultado.diasInhabilesDetallesNotas.map((nota: string, index: number) => {
                      const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
                      const superindice = index < 9 ? superindices[index] : `(${index + 1})`;
                      return (
                        <p key={index} style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
                          <sup>{superindice}</sup> {nota}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Calendario visual - solo para servidores */}
              {tipoUsuario === 'servidor' && (
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #C5A770', boxShadow: '0 4px 20px rgba(28, 28, 28, 0.08)' }}>
                  <h3 className="font-semibold text-lg mb-4" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Calendario Visual del Cómputo</h3>
                  
                  <div id="calendario-visual" className="bg-white">
                    <Calendario 
                      fechaNotificacion={resultado.fechaNotificacion}
                      fechaSurte={resultado.fechaSurte}
                      fechaInicio={resultado.fechaInicio}
                      fechaFin={resultado.fechaFin}
                      diasAdicionales={diasAdicionales}
                      tipoUsuario={tipoUsuario}
                      esOmision={formData.resolucionImpugnada === 'omision-tramite'}
                      fechaPresentacion={formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null}
                    />
                  </div>
                </div>
              )}
              
              {tipoUsuario === 'servidor' && (
                <div className="p-4 rounded-lg mt-6" style={{ backgroundColor: '#F4EFE8', border: '1.5px solid #C5A770' }}>
                  <h3 className="font-bold mb-2" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Texto para Resolución:</h3>
                  <div 
                    className="text-sm font-['Arial'] leading-relaxed" 
                    style={{textAlign: 'justify'}}
                    dangerouslySetInnerHTML={{__html: generarTextoFormateado()}}
                  />
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                {tipoUsuario === 'servidor' && (
                  <>
                    <button onClick={copiarCalendario} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                      Copiar calendario
                    </button>
                    <button onClick={copiarTextoConFormato} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                      Copiar texto
                    </button>
                  </>
                )}
                <button onClick={() => { setResultado(null); setFormData({ tipoQueja: 'indirecto', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', fechaConocimiento: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); setTipoFecha(null); }} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Sección para litigantes */}
            {tipoUsuario === 'litigante' && (
              <div className="mt-6 rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #C5A770', boxShadow: '0 4px 20px rgba(28, 28, 28, 0.08)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Guardar Cálculo y Notificaciones</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>Número de Expediente</label>
                    <input 
                      type="text" 
                      value={numeroExpediente} 
                      onChange={(e) => setNumeroExpediente(e.target.value)}
                      placeholder="Ej: 123/2024"
                      className="w-full p-2 rounded-lg" 
                      style={{ border: '1.5px solid #1C1C1C', backgroundColor: 'transparent', color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>WhatsApp (opcional)</label>
                    <input 
                      type="tel" 
                      value={telefonoWhatsApp} 
                      onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                      placeholder="Ej: +52 1234567890"
                      className="w-full p-2 rounded-lg" 
                      style={{ border: '1.5px solid #1C1C1C', backgroundColor: 'transparent', color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={guardarCalculo}
                  disabled={!numeroExpediente}
                  className="text-white px-6 py-2 rounded-lg disabled:bg-gray-400" 
                  style={{ backgroundColor: !numeroExpediente ? '#B0B0B0' : '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} 
                  onMouseEnter={(e) => { if (numeroExpediente) e.currentTarget.style.backgroundColor = '#C5A770'; }} 
                  onMouseLeave={(e) => { if (numeroExpediente) e.currentTarget.style.backgroundColor = '#1C1C1C'; }}
                >
                  Guardar Cálculo
                </button>
                
                {telefonoWhatsApp && (
                  <p className="mt-2 text-sm text-gray-600">
                    Recibirás recordatorios 3, 2 y 1 día antes del vencimiento, y el día del vencimiento.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Lista de cálculos guardados para litigantes */}
        {tipoUsuario === 'litigante' && calculos.length > 0 && (
          <div className="mt-6 rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #C5A770', boxShadow: '0 4px 20px rgba(28, 28, 28, 0.08)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Cálculos Guardados</h3>
            <div className="space-y-2">
              {calculos.map((calc) => (
                <div key={calc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">Expediente: {calc.expediente}</p>
                    <p className="text-sm text-gray-600">
                      Vence: {new Date(calc.fechaVencimiento).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setCalculos(calculos.filter(c => c.id !== calc.id));
                      localStorage.setItem('calculosGuardados', 
                        JSON.stringify(calculos.filter(c => c.id !== calc.id))
                      );
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Funciones mejoradas para días inhábiles
function obtenerDiasInhabilesConNotasMejorado(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasInhabiles: {fecha: Date, dia: string, fundamento: string}[] = [];
  const diasYaIncluidos = new Set<string>();
  const fineDeSemanaEncontrados: Date[] = [];
  
  const fecha = new Date(inicio);
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    const año = fecha.getFullYear();
    
    // Recopilar sábados y domingos específicos
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      fineDeSemanaEncontrados.push(new Date(fecha));
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(fechaStr)) {
        const dia = fechaParaLitigante(fechaStr);
        diasInhabiles.push({fecha: new Date(fecha), dia, fundamento: diaFijo.fundamento});
        diasYaIncluidos.add(fechaStr);
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        let diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (!diaMovilInfo) {
          diaMovilInfo = diasAplicables.find(d => d.fecha === fechaStr && 
            d.fundamento === 'artículo 74 de la Ley Federal del Trabajo');
        }
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaStr)) {
          const dia = fechaParaLitigante(fechaStr);
          diasInhabiles.push({fecha: new Date(fecha), dia, fundamento: diaMovilInfo.fundamento});
          diasYaIncluidos.add(fechaStr);
        }
      }
    }
    
    // Verificar días adicionales del usuario
    if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaStr)) {
      const dia = fechaParaLitigante(fechaStr);
      const fundamento = fundamentoAdicional || 'día adicional';
      diasInhabiles.push({fecha: new Date(fecha), dia, fundamento});
      diasYaIncluidos.add(fechaStr);
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Ordenar cronológicamente
  diasInhabiles.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  
  // Agrupar días por mes y año, manteniendo orden cronológico
  const agruparDiasCronologicos = (dias: string[]) => {
    const grupos: {[key: string]: number[]} = {};
    const ordenMeses: string[] = [];
    
    dias.forEach(dia => {
      const match = dia.match(/(\d+) de (\w+) de (\d+)/);
      if (match) {
        const [, diaNum, mes, año] = match;
        const clave = `${mes} de ${año}`;
        if (!grupos[clave]) {
          grupos[clave] = [];
          ordenMeses.push(clave);
        }
        grupos[clave].push(parseInt(diaNum));
      }
    });
    
    const resultado: string[] = [];
    ordenMeses.forEach(mesAno => {
      const dias = grupos[mesAno].sort((a, b) => a - b);
      if (dias.length === 1) {
        resultado.push(`${dias[0]} de ${mesAno}`);
      } else {
        const ultimoDia = dias.pop();
        const otrosDias = dias.join(', ');
        resultado.push(`${otrosDias} y ${ultimoDia} de ${mesAno}`);
      }
    });
    
    return resultado;
  };
  
  // Construir el texto
  let textoPartes: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const fundamentosUsados = new Map<string, string>();
  
  // Agregar sábados y domingos específicos
  if (fineDeSemanaEncontrados.length > 0) {
    const sabadosDomingos = fineDeSemanaEncontrados.map(f => fechaParaLitigante(f.toISOString().split('T')[0]));
    const sabadosDomingosAgrupados = agruparDiasCronologicos(sabadosDomingos);
    
    if (tipoUsuario === 'litigante') {
      textoPartes.push(`sábados y domingos incluidos entre el día de la notificación y el último día del cómputo`);
    } else {
      const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
      textoPartes.push(`sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`);
      notasAlPie.push(`${superindice} artículo 19 de la Ley de Amparo`);
      fundamentosUsados.set('artículo 19 de la Ley de Amparo', superindice);
      numeroNota++;
    }
  }
  
  // Agrupar otros días por fundamento
  const diasPorFundamento: {[key: string]: string[]} = {};
  diasInhabiles.forEach(({dia, fundamento}) => {
    if (!diasPorFundamento[fundamento]) {
      diasPorFundamento[fundamento] = [];
    }
    diasPorFundamento[fundamento].push(dia);
  });
  
  // Agregar días agrupados por fundamento
  const todosLosDiasConSuperindices: {dia: string, superindice: string}[] = [];
  
  Object.keys(diasPorFundamento).forEach(fundamento => {
    const dias = diasPorFundamento[fundamento];
    if (dias.length > 0) {
      if (tipoUsuario === 'litigante') {
        const diasAgrupados = agruparDiasCronologicos(dias);
        textoPartes.push(diasAgrupados.join(', '));
      } else {
        let superindice: string;
        if (fundamentosUsados.has(fundamento)) {
          superindice = fundamentosUsados.get(fundamento)!;
        } else {
          superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          notasAlPie.push(`${superindice} ${fundamento}`);
          fundamentosUsados.set(fundamento, superindice);
          numeroNota++;
        }
        
        // Guardar días con sus superíndices para procesamiento posterior
        dias.forEach(dia => {
          todosLosDiasConSuperindices.push({dia, superindice});
        });
      }
    }
  });
  
  // Procesar todos los días con superíndices para simplificar formato
  if (tipoUsuario !== 'litigante' && todosLosDiasConSuperindices.length > 0) {
    // Función auxiliar para agrupar días consecutivos
    const agruparConsecutivos = (dias: {numero: number, superindice: string}[]) => {
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
          grupos.push(`${numeroATexto(dias[inicio].numero)}${dias[inicio].superindice}`);
        } else if (finGrupo === inicio + 1) {
          // Dos días consecutivos
          grupos.push(`${numeroATexto(dias[inicio].numero)}${dias[inicio].superindice} y ${numeroATexto(dias[finGrupo].numero)}${dias[finGrupo].superindice}`);
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
              subgrupos.push(`${numeroATexto(dias[subInicio].numero)} a ${numeroATexto(dias[subFin].numero)}${dias[subFin].superindice}`);
            } else if (subFin === subInicio + 1) {
              // Dos con mismo superíndice
              subgrupos.push(`${numeroATexto(dias[subInicio].numero)}${dias[subInicio].superindice}`, `${numeroATexto(dias[subFin].numero)}${dias[subFin].superindice}`);
            } else {
              // Solo uno
              subgrupos.push(`${numeroATexto(dias[subInicio].numero)}${dias[subInicio].superindice}`);
            }
            
            j = subFin + 1;
          }
          
          // Unir los subgrupos
          if (subgrupos.length === 1) {
            grupos.push(subgrupos[0]);
          } else if (subgrupos.length === 2) {
            grupos.push(`${subgrupos[0]} y ${subgrupos[1]}`);
          } else {
            const ultimo = subgrupos.pop();
            grupos.push(`${subgrupos.join(', ')} y ${ultimo}`);
          }
        }
        
        i = finGrupo + 1;
      }
      
      return grupos;
    };
    
    // Agrupar por mes y año
    const diasPorMesAno: {[key: string]: {numero: number, superindice: string}[]} = {};
    
    todosLosDiasConSuperindices.forEach(({dia, superindice}) => {
      const match = dia.match(/(\d+) de (\w+) de (\d+)/);
      if (match) {
        const [, diaNum, mes, año] = match;
        const clave = `${mes} de ${año}`;
        if (!diasPorMesAno[clave]) {
          diasPorMesAno[clave] = [];
        }
        diasPorMesAno[clave].push({numero: parseInt(diaNum), superindice});
      }
    });
    
    // Construir texto simplificado
    const partesTexto: string[] = [];
    Object.entries(diasPorMesAno).forEach(([mesAno, diasInfo]) => {
      const gruposAgrupados = agruparConsecutivos(diasInfo);
      
      if (gruposAgrupados.length > 0) {
        // Unir los grupos con comas y "y" antes del último
        let textoGrupos = '';
        if (gruposAgrupados.length === 1) {
          textoGrupos = gruposAgrupados[0];
        } else {
          const ultimo = gruposAgrupados.pop();
          textoGrupos = gruposAgrupados.length > 0 ? `${gruposAgrupados.join(', ')} y ${ultimo}` : ultimo;
        }
        
        partesTexto.push(`${textoGrupos} de ${mesAno}`);
      }
    });
    
    // Si hay días inhábiles, agregar prefijo
    if (partesTexto.length > 0) {
      const textoFinal = partesTexto.join(', ');
      // Determinar si usar "el día" o "los días" basado en la cantidad total
      const usarPlural = todosLosDiasConSuperindices.length > 1;
      textoPartes.push(`así como ${usarPlural ? 'los días' : 'el día'} ${textoFinal}`);
    }
  }
  
  return {
    texto: textoPartes.join(', '),
    notas: notasAlPie
  };
}

// Función específica para generar texto de días inhábiles para resolución (con días en texto)
function obtenerDiasInhabilesTextoResolucion(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasInhabiles: {fecha: Date, dia: string, fundamento: string}[] = [];
  const diasYaIncluidos = new Set<string>();
  const fineDeSemanaEncontrados: {fecha: Date, diaSemana: string}[] = [];
  
  const fecha = new Date(inicio);
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    const año = fecha.getFullYear();
    
    // Recopilar sábados y domingos específicos
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      fineDeSemanaEncontrados.push({
        fecha: new Date(fecha),
        diaSemana: fecha.getDay() === 0 ? 'domingo' : 'sábado'
      });
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(fechaStr)) {
        const dia = fechaATexto(fechaStr); // Usar fechaATexto para formato de texto
        diasInhabiles.push({fecha: new Date(fecha), dia, fundamento: diaFijo.fundamento});
        diasYaIncluidos.add(fechaStr);
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        let diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (!diaMovilInfo) {
          diaMovilInfo = diasAplicables.find(d => d.fecha === fechaStr && 
            d.fundamento === 'artículo 74 de la Ley Federal del Trabajo');
        }
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaStr)) {
          const dia = fechaATexto(fechaStr); // Usar fechaATexto para formato de texto
          diasInhabiles.push({fecha: new Date(fecha), dia, fundamento: diaMovilInfo.fundamento});
          diasYaIncluidos.add(fechaStr);
        }
      }
    }
    
    // Verificar días adicionales del usuario
    if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaStr)) {
      const dia = fechaATexto(fechaStr); // Usar fechaATexto para formato de texto
      const fundamento = fundamentoAdicional || 'día adicional';
      diasInhabiles.push({fecha: new Date(fecha), dia, fundamento});
      diasYaIncluidos.add(fechaStr);
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Ordenar cronológicamente
  diasInhabiles.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  fineDeSemanaEncontrados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  
  // Construir el texto
  let textoPartes: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const fundamentosUsados = new Map<string, string>();
  
  // Procesar sábados y domingos
  if (fineDeSemanaEncontrados.length > 0) {
    const gruposPorMesAno: {[key: string]: {dias: number[], tipos: string[]}} = {};
    
    fineDeSemanaEncontrados.forEach(({fecha, diaSemana}) => {
      const dia = fecha.getDate();
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      
      // Convertir año a texto para el texto de resolución
      const añoEnTexto = (año: number): string => {
        const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
        
        if (año === 2000) return 'dos mil';
        if (año > 2000 && año < 2100) {
          const resto = año - 2000;
          if (resto < 10) return `dos mil ${unidades[resto]}`;
          if (resto < 20) return `dos mil ${especiales[resto - 10]}`;
          const decena = Math.floor(resto / 10);
          const unidad = resto % 10;
          if (unidad === 0) return `dos mil ${decenas[decena]}`;
          return `dos mil ${decenas[decena] === 'veinte' ? 'veinti' + unidades[unidad] : decenas[decena] + ' y ' + unidades[unidad]}`;
        }
        return año.toString();
      };
      
      const clave = `${mes} de ${añoEnTexto(año)}`;
      
      if (!gruposPorMesAno[clave]) {
        gruposPorMesAno[clave] = { dias: [], tipos: [] };
      }
      gruposPorMesAno[clave].dias.push(dia);
      gruposPorMesAno[clave].tipos.push(diaSemana);
    });
    
    // Función auxiliar para agrupar días consecutivos de sábados y domingos
    const agruparSabadosDomingos = (diasConTipo: {dia: number, tipo: string}[]) => {
      const grupos: string[] = [];
      let i = 0;
      
      while (i < diasConTipo.length) {
        const inicio = i;
        const tipoInicio = diasConTipo[i].tipo;
        
        // Buscar días consecutivos
        while (i + 1 < diasConTipo.length && 
               diasConTipo[i + 1].dia === diasConTipo[i].dia + 1) {
          i++;
        }
        
        // Convertir a texto
        if (i === inicio) {
          // Un solo día
          grupos.push(`${numeroATexto(diasConTipo[inicio].dia)}`);
        } else if (i === inicio + 1) {
          // Dos días
          grupos.push(`${numeroATexto(diasConTipo[inicio].dia)} y ${numeroATexto(diasConTipo[i].dia)}`);
        } else {
          // Tres o más días consecutivos
          const todosDelMismoTipo = diasConTipo.slice(inicio, i + 1).every(d => d.tipo === tipoInicio);
          if (todosDelMismoTipo) {
            grupos.push(`${numeroATexto(diasConTipo[inicio].dia)} a ${numeroATexto(diasConTipo[i].dia)}`);
          } else {
            // Si hay mezcla de sábados y domingos, listar individualmente
            const subgrupo = [];
            for (let j = inicio; j <= i; j++) {
              subgrupo.push(numeroATexto(diasConTipo[j].dia));
            }
            grupos.push(subgrupo.join(', '));
          }
        }
        i++;
      }
      
      return grupos;
    };
    
    const partesSabadosDomingos: string[] = [];
    const mesAnoArray = Object.entries(gruposPorMesAno);
    
    // Si solo hay un mes/año, simplificar
    if (mesAnoArray.length === 1) {
      const [mesAno, {dias, tipos}] = mesAnoArray[0];
      
      // Crear array de días con sus tipos
      const diasConTipo = dias.map((dia, idx) => ({ dia, tipo: tipos[idx] }));
      diasConTipo.sort((a, b) => a.dia - b.dia);
      
      const gruposTexto = agruparSabadosDomingos(diasConTipo);
      
      if (gruposTexto.length > 0) {
        const textoGrupos = gruposTexto.length === 1 
          ? gruposTexto[0]
          : gruposTexto.length === 2
          ? `${gruposTexto[0]} y ${gruposTexto[1]}`
          : `${gruposTexto.slice(0, -1).join(', ')} y ${gruposTexto[gruposTexto.length - 1]}`;
          
        partesSabadosDomingos.push(`${textoGrupos} de los mes y año referidos, por corresponder a sábados y domingos`);
      }
    } else {
      // Si hay múltiples meses/años, mantener el formato completo
      mesAnoArray.forEach(([mesAno, {dias, tipos}]) => {
        const diasConTipo = dias.map((dia, idx) => ({ dia, tipo: tipos[idx] }));
        diasConTipo.sort((a, b) => a.dia - b.dia);
        
        const gruposTexto = agruparSabadosDomingos(diasConTipo);
        
        if (gruposTexto.length > 0) {
          const textoGrupos = gruposTexto.length === 1 
            ? gruposTexto[0]
            : gruposTexto.length === 2
            ? `${gruposTexto[0]} y ${gruposTexto[1]}`
            : `${gruposTexto.slice(0, -1).join(', ')} y ${gruposTexto[gruposTexto.length - 1]}`;
            
          partesSabadosDomingos.push(`${textoGrupos} de ${mesAno}, por corresponder a sábados y domingos`);
        }
      });
    }
    
    if (partesSabadosDomingos.length > 0) {
      if (tipoUsuario === 'servidor') {
        const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
        textoPartes.push(partesSabadosDomingos.join('; ') + superindice);
        notasAlPie.push(`${superindice} artículo 19 de la Ley de Amparo`);
        fundamentosUsados.set('artículo 19 de la Ley de Amparo', superindice);
        numeroNota++;
      } else {
        textoPartes.push(partesSabadosDomingos.join('; '));
      }
    }
  }
  
  // Agrupar otros días por fundamento
  const diasPorFundamento: {[key: string]: string[]} = {};
  diasInhabiles.forEach(({dia, fundamento}) => {
    if (!diasPorFundamento[fundamento]) {
      diasPorFundamento[fundamento] = [];
    }
    diasPorFundamento[fundamento].push(dia);
  });
  
  // Función auxiliar para agrupar días consecutivos en texto
  const agruparConsecutivosTexto = (diasConInfo: {diaNum: number, diaTexto: string, superindice: string}[]) => {
    if (diasConInfo.length === 0) return [];
    
    diasConInfo.sort((a, b) => a.diaNum - b.diaNum);
    const grupos: string[] = [];
    let inicio = 0;
    
    for (let i = 1; i <= diasConInfo.length; i++) {
      if (i === diasConInfo.length || 
          diasConInfo[i].diaNum !== diasConInfo[i-1].diaNum + 1 || 
          diasConInfo[i].superindice !== diasConInfo[i-1].superindice) {
        
        if (i - inicio === 1) {
          // Un solo día
          grupos.push(`${diasConInfo[inicio].diaTexto}${diasConInfo[inicio].superindice}`);
        } else if (i - inicio === 2) {
          // Dos días consecutivos
          grupos.push(`${diasConInfo[inicio].diaTexto}${diasConInfo[inicio].superindice} y ${diasConInfo[i-1].diaTexto}${diasConInfo[i-1].superindice}`);
        } else {
          // Tres o más días consecutivos con mismo superíndice
          grupos.push(`${diasConInfo[inicio].diaTexto} a ${diasConInfo[i-1].diaTexto}${diasConInfo[i-1].superindice}`);
        }
        inicio = i;
      }
    }
    
    return grupos;
  };
  
  // Procesar otros días inhábiles
  const diasPorMesAno: {[key: string]: {diaNum: number, diaTexto: string, superindice: string, fechaCompleta: string}[]} = {};
  
  Object.keys(diasPorFundamento).forEach(fundamento => {
    const dias = diasPorFundamento[fundamento];
    if (dias.length > 0) {
      let superindice = '';
      if (tipoUsuario === 'servidor') {
        if (fundamentosUsados.has(fundamento)) {
          superindice = fundamentosUsados.get(fundamento)!;
        } else {
          superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          notasAlPie.push(`${superindice} ${fundamento}`);
          fundamentosUsados.set(fundamento, superindice);
          numeroNota++;
        }
      }
      
      // Agrupar días por mes y año
      dias.forEach(diaCompleto => {
        const partes = diaCompleto.split(' de ');
        if (partes.length >= 3) {
          const diaTexto = partes[0];
          const mes = partes[1];
          const año = partes[2];
          const clave = `${mes} de ${año}`;
          
          // Extraer número del día para ordenamiento
          let diaNum = 0;
          // Buscar el número correspondiente al texto del día
          for (let i = 1; i <= 31; i++) {
            if (numeroATexto(i) === diaTexto) {
              diaNum = i;
              break;
            }
          }
          
          if (!diasPorMesAno[clave]) {
            diasPorMesAno[clave] = [];
          }
          
          diasPorMesAno[clave].push({
            diaNum,
            diaTexto,
            superindice,
            fechaCompleta: diaCompleto
          });
        }
      });
    }
  });
  
  // Construir texto final agrupado
  const partesOtrosDias: string[] = [];
  const mesAnoKeys = Object.keys(diasPorMesAno);
  
  if (mesAnoKeys.length > 0) {
    mesAnoKeys.forEach((mesAno, index) => {
      const diasInfo = diasPorMesAno[mesAno];
      const gruposAgrupados = agruparConsecutivosTexto(diasInfo);
      
      if (gruposAgrupados.length > 0) {
        let textoGrupos = '';
        if (gruposAgrupados.length === 1) {
          textoGrupos = gruposAgrupados[0];
        } else if (gruposAgrupados.length === 2) {
          textoGrupos = `${gruposAgrupados[0]} y ${gruposAgrupados[1]}`;
        } else {
          const ultimo = gruposAgrupados.pop();
          textoGrupos = `${gruposAgrupados.join(', ')} y ${ultimo}`;
        }
        
        // Simplificar referencia a mes y año
        if (index === 0) {
          partesOtrosDias.push(`${textoGrupos} de ${mesAno}`);
        } else if (mesAnoKeys.length === 1 || (index === mesAnoKeys.length - 1 && mesAnoKeys.every(k => k === mesAno))) {
          partesOtrosDias.push(`${textoGrupos} de los mismos mes y año`);
        } else {
          // Verificar si es el mismo año
          const añoActual = mesAno.split(' de ')[1];
          const añoPrimero = mesAnoKeys[0].split(' de ')[1];
          if (añoActual === añoPrimero) {
            const mesSolo = mesAno.split(' de ')[0];
            partesOtrosDias.push(`${textoGrupos} de ${mesSolo} del año referido`);
          } else {
            partesOtrosDias.push(`${textoGrupos} de ${mesAno}`);
          }
        }
      }
    });
    
    // Unir todas las partes de otros días
    if (partesOtrosDias.length > 0) {
      const totalDias = Object.values(diasPorMesAno).reduce((sum, dias) => sum + dias.length, 0);
      const usarPlural = totalDias > 1;
      textoPartes.push(`así como ${usarPlural ? 'los días' : 'el día'} ${partesOtrosDias.join('; ')}, que también ${usarPlural ? 'son inhábiles' : 'es inhábil'}`);
    }
  }
  
  return {
    texto: textoPartes.join(', '),
    notas: notasAlPie
  };
}

// Función mejorada para formatear rango de fechas
function formatearRangoFechasMejorado(fechaInicio: string, fechaFin: string) {
  const extraerPartes = (fecha: string) => {
    const partes = fecha.split(' de ');
    return {
      dia: partes[0],
      mes: partes[1],
      año: partes[2]
    };
  };
  
  const inicio = extraerPartes(fechaInicio);
  const fin = extraerPartes(fechaFin);
  
  // Mismo mes y año
  if (inicio.mes === fin.mes && inicio.año === fin.año) {
    return `${inicio.dia} al ${fin.dia} de ${inicio.mes} de ${inicio.año}`;
  }
  
  // Mismo año, diferente mes
  if (inicio.año === fin.año) {
    return `${inicio.dia} de ${inicio.mes} al ${fin.dia} de ${fin.mes} del mismo año`;
  }
  
  // Diferente año
  return `${fechaInicio} al ${fechaFin}`;
}