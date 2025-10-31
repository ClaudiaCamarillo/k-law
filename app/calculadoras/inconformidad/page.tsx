'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { getCuandoSurteEfectos, calcularFechaSurteEfectos, getFundamentoSurtimientoEfectos } from '../../../lib/articulo31LeyAmparo.js'
import { computosStorage } from '../../../lib/computos-storage'

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

// Función para convertir número a texto
function numeroATexto(num: number): string {
  const numeros = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y uno'];
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

// Función para formatear días inhábiles para mostrar notas pequeñas
function formatearDiasInhabilesParaDetalles(texto: string): React.ReactElement | string {
  if (!texto) return '';
  
  // Solo formatear números que claramente son días con notas (10-31 seguidos de 1-9)
  const partes = texto.split(/(\b(?:[12]\d|3[01])[1-9]\b)/);
  
  return (
    <>
      {partes.map((parte, index) => {
        // Si es un número de día válido con nota (ej: 161, 171, 182, etc.)
        if (/^\b(?:[12]\d|3[01])[1-9]\b$/.test(parte)) {
          const dia = parte.slice(0, -1);
          const nota = parte.slice(-1);
          return (
            <span key={index}>
              {dia}<sup style={{fontSize: '0.6em'}}>{nota}</sup>
            </span>
          );
        }
        return <span key={index}>{parte}</span>;
      })}
    </>
  );
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
        const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
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
  
  // Función para agrupar días consecutivos (para detalles del cómputo)
  function agruparDiasConsecutivosDetalles(dias: number[]): string {
    if (dias.length === 0) return '';
    if (dias.length === 1) return dias[0].toString();

    dias.sort((a, b) => a - b);
    const grupos: string[] = [];
    let inicio = dias[0];
    let fin = dias[0];

    for (let i = 1; i < dias.length; i++) {
      if (dias[i] === fin + 1) {
        fin = dias[i];
      } else {
        if (inicio === fin) {
          grupos.push(inicio.toString());
        } else if (fin === inicio + 1) {
          grupos.push(`${inicio} y ${fin}`);
        } else {
          grupos.push(`${inicio} a ${fin}`);
        }
        inicio = dias[i];
        fin = dias[i];
      }
    }

    // Agregar el último grupo
    if (inicio === fin) {
      grupos.push(inicio.toString());
    } else if (fin === inicio + 1) {
      grupos.push(`${inicio} y ${fin}`);
    } else {
      grupos.push(`${inicio} a ${fin}`);
    }

    if (grupos.length === 1) {
      return grupos[0];
    } else {
      const ultimos = grupos.slice(-1)[0];
      const otros = grupos.slice(0, -1).join(', ');
      return `${otros} y ${ultimos}`;
    }
  }

  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  const fundamentosConNumero: {[key: string]: number} = {};
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Agregar sábados y domingos si hay
  if (hayFinDeSemana) {
    if (tipoUsuario === 'litigante') {
      diasTexto.push('sábados y domingos');
    } else {
      const fundamento = 'artículo 19 de la Ley de Amparo';
      if (!fundamentosConNumero[fundamento]) {
        fundamentosConNumero[fundamento] = numeroNota;
        const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
        notasAlPie.push(`${superindice} ${fundamento}`);
        numeroNota++;
      }
      const superindice = fundamentosConNumero[fundamento] <= 9 ? superindices[fundamentosConNumero[fundamento] - 1] : `(${fundamentosConNumero[fundamento]})`;
      diasTexto.push(`sábados y domingos${superindice}`);
    }
  }
  
  // Recopilar todos los días con sus fundamentos para ordenar cronológicamente
  const todosLosDias: {dia: string, fundamento: string, diaNumero: number, mesAno: string}[] = [];
  
  Object.keys(diasPorFundamento).forEach(fundamento => {
    const dias = diasPorFundamento[fundamento];
    if (dias && dias.length > 0) {
      dias.forEach(dia => {
        const partes = dia.split(' de ');
        const diaNumero = parseInt(partes[0]) || 0;
        const mesAno = partes.slice(1).join(' de ');
        todosLosDias.push({dia, fundamento, diaNumero, mesAno});
      });
    }
  });
  
  // Ordenar todos los días cronológicamente (por mes/año y luego por día)
  todosLosDias.sort((a, b) => {
    // Primero por mes/año, luego por día
    if (a.mesAno !== b.mesAno) {
      return a.mesAno.localeCompare(b.mesAno);
    }
    return a.diaNumero - b.diaNumero;
  });

  // Agrupar días por mes/año y fundamento
  const diasPorMesYFundamentoDetalles: {[key: string]: {[key: string]: number[]}} = {};
  
  todosLosDias.forEach(item => {
    if (!diasPorMesYFundamentoDetalles[item.mesAno]) {
      diasPorMesYFundamentoDetalles[item.mesAno] = {};
    }
    if (!diasPorMesYFundamentoDetalles[item.mesAno][item.fundamento]) {
      diasPorMesYFundamentoDetalles[item.mesAno][item.fundamento] = [];
    }
    diasPorMesYFundamentoDetalles[item.mesAno][item.fundamento].push(item.diaNumero);
  });

  // Generar el texto agrupado para detalles del cómputo
  if (tipoUsuario === 'litigante') {
    Object.keys(diasPorMesYFundamentoDetalles).forEach(mesAno => {
      Object.keys(diasPorMesYFundamentoDetalles[mesAno]).forEach(fundamento => {
        const dias = diasPorMesYFundamentoDetalles[mesAno][fundamento];
        const diasAgrupados = agruparDiasConsecutivosDetalles(dias);
        diasTexto.push(`${diasAgrupados} de ${mesAno}`);
      });
    });
  } else {
    Object.keys(diasPorMesYFundamentoDetalles).forEach(mesAno => {
      Object.keys(diasPorMesYFundamentoDetalles[mesAno]).forEach(fundamento => {
        // Asignar número al fundamento si no existe
        if (!fundamentosConNumero[fundamento]) {
          fundamentosConNumero[fundamento] = numeroNota;
          const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          notasAlPie.push(`${superindice} ${fundamento}`);
          numeroNota++;
        }
        
        const dias = diasPorMesYFundamentoDetalles[mesAno][fundamento];
        const diasAgrupados = agruparDiasConsecutivosDetalles(dias);
        const superindice = fundamentosConNumero[fundamento] <= 9 ? superindices[fundamentosConNumero[fundamento] - 1] : `(${fundamentosConNumero[fundamento]})`;
        diasTexto.push(`${diasAgrupados} de ${mesAno}${superindice}`);
      });
    });
  }
  
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
        
        // Ordenar los días cronológicamente (convertir a números para ordenar correctamente)
        const diasOrdenados = dias.sort((a, b) => {
          // Función para convertir texto del día a número
          const convertirDiaATexto = (dia: string) => {
            const numeros: {[key: string]: number} = {
              'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
              'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
              'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
            };
            return numeros[dia] || parseInt(dia) || 0;
          };
          
          return convertirDiaATexto(a) - convertirDiaATexto(b);
        });
        
        if (diasOrdenados.length === 1) {
          resultado.push(`${diasOrdenados[0]} de ${mesAno}`);
        } else {
          // Agrupar múltiples días del mismo mes
          const ultimoDia = diasOrdenados[diasOrdenados.length - 1];
          const otrosDias = diasOrdenados.slice(0, -1).join(', ');
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
      
      // Verificar días móviles PRIMERO (para evitar conflictos con días fijos)
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        const claveMovil = fechaATexto(fechaStr);
        if (diaMovilInfo && !diasYaIncluidos.has(claveMovil)) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(claveMovil);
          diasYaIncluidos.add(claveMovil);
        }
      }
      
      // Verificar días fijos (solo si no fue procesado como día móvil)
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      const claveConsistente = fechaATexto(fechaStr);
      if (diaFijo && !diasYaIncluidos.has(claveConsistente)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = claveConsistente;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(claveConsistente);
      }
      
      // Días adicionales del usuario
      const claveAdicional = fechaATexto(fechaStr);
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
  
  // Función para convertir texto de día a número
  function convertirTextoANumero(diaTexto: string): number {
    const numeros: {[key: string]: number} = {
      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
    };
    return numeros[diaTexto] || parseInt(diaTexto) || 0;
  }

  // Función para agrupar días consecutivos
  function agruparDiasConsecutivos(dias: number[]): string {
    if (dias.length === 0) return '';
    if (dias.length === 1) return numeroATexto(dias[0]);

    dias.sort((a, b) => a - b);
    const grupos: string[] = [];
    let inicio = dias[0];
    let fin = dias[0];

    for (let i = 1; i < dias.length; i++) {
      if (dias[i] === fin + 1) {
        fin = dias[i];
      } else {
        if (inicio === fin) {
          grupos.push(numeroATexto(inicio));
        } else if (fin === inicio + 1) {
          grupos.push(`${numeroATexto(inicio)} y ${numeroATexto(fin)}`);
        } else {
          grupos.push(`${numeroATexto(inicio)} a ${numeroATexto(fin)}`);
        }
        inicio = dias[i];
        fin = dias[i];
      }
    }

    // Agregar el último grupo
    if (inicio === fin) {
      grupos.push(numeroATexto(inicio));
    } else if (fin === inicio + 1) {
      grupos.push(`${numeroATexto(inicio)} y ${numeroATexto(fin)}`);
    } else {
      grupos.push(`${numeroATexto(inicio)} a ${numeroATexto(fin)}`);
    }

    if (grupos.length === 1) {
      return grupos[0];
    } else {
      const ultimos = grupos.slice(-1)[0];
      const otros = grupos.slice(0, -1).join(', ');
      return `${otros} y ${ultimos}`;
    }
  }

  // Construir el texto con notas al pie (para texto de resolución)
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  const fundamentosConNumero: {[key: string]: number} = {};
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Agregar sábados y domingos si hay
  if (hayFinDeSemana) {
    if (tipoUsuario === 'litigante') {
      diasTexto.push('sábados y domingos');
    } else {
      const fundamento = 'artículo 19 de la Ley de Amparo';
      if (!fundamentosConNumero[fundamento]) {
        fundamentosConNumero[fundamento] = numeroNota;
        const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
        notasAlPie.push(`${superindice} ${fundamento}`);
        numeroNota++;
      }
      const superindice = fundamentosConNumero[fundamento] <= 9 ? superindices[fundamentosConNumero[fundamento] - 1] : `(${fundamentosConNumero[fundamento]})`;
      diasTexto.push(`sábados y domingos${superindice}`);
    }
  }
  
  // Recopilar todos los días con sus fundamentos para ordenar cronológicamente
  const todosLosDiasTexto: {dia: string, fundamento: string, diaNumero: number, mesAno: string}[] = [];
  
  Object.keys(diasPorFundamento).forEach(fundamento => {
    const dias = diasPorFundamento[fundamento];
    if (dias && dias.length > 0) {
      dias.forEach(dia => {
        const partes = dia.split(' de ');
        const diaNumero = convertirTextoANumero(partes[0]);
        const mesAno = partes.slice(1).join(' de ');
        todosLosDiasTexto.push({dia, fundamento, diaNumero, mesAno});
      });
    }
  });
  
  // Ordenar todos los días cronológicamente
  todosLosDiasTexto.sort((a, b) => {
    if (a.mesAno !== b.mesAno) {
      return a.mesAno.localeCompare(b.mesAno);
    }
    return a.diaNumero - b.diaNumero;
  });

  // Agrupar días por mes/año y fundamento
  const diasPorMesYFundamento: {[key: string]: {[key: string]: number[]}} = {};
  
  todosLosDiasTexto.forEach(item => {
    if (!diasPorMesYFundamento[item.mesAno]) {
      diasPorMesYFundamento[item.mesAno] = {};
    }
    if (!diasPorMesYFundamento[item.mesAno][item.fundamento]) {
      diasPorMesYFundamento[item.mesAno][item.fundamento] = [];
    }
    diasPorMesYFundamento[item.mesAno][item.fundamento].push(item.diaNumero);
  });

  // Generar el texto agrupado simplificado
  if (tipoUsuario === 'litigante') {
    Object.keys(diasPorMesYFundamento).forEach(mesAno => {
      Object.keys(diasPorMesYFundamento[mesAno]).forEach(fundamento => {
        const dias = diasPorMesYFundamento[mesAno][fundamento];
        const diasAgrupados = agruparDiasConsecutivos(dias);
        diasTexto.push(`${diasAgrupados} de ${mesAno}`);
      });
    });
  } else {
    // Agrupar días por mes/año independientemente del fundamento
    Object.keys(diasPorMesYFundamento).forEach(mesAno => {
      const todosDiasDelMes: {dia: number, fundamento: string}[] = [];
      
      // Recopilar todos los días del mes con sus fundamentos
      Object.keys(diasPorMesYFundamento[mesAno]).forEach(fundamento => {
        const dias = diasPorMesYFundamento[mesAno][fundamento];
        dias.forEach(dia => {
          todosDiasDelMes.push({dia, fundamento});
        });
      });
      
      // Ordenar días cronológicamente
      todosDiasDelMes.sort((a, b) => a.dia - b.dia);
      
      // Agrupar días consecutivos con el mismo fundamento
      const gruposConsecutivos: string[] = [];
      let i = 0;
      
      while (i < todosDiasDelMes.length) {
        const diaActual = todosDiasDelMes[i];
        
        // Asignar número al fundamento si no existe
        if (!fundamentosConNumero[diaActual.fundamento]) {
          fundamentosConNumero[diaActual.fundamento] = numeroNota;
          const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          notasAlPie.push(`${superindice} ${diaActual.fundamento}`);
          numeroNota++;
        }
        
        const superindice = fundamentosConNumero[diaActual.fundamento] <= 9 ? superindices[fundamentosConNumero[diaActual.fundamento] - 1] : `(${fundamentosConNumero[diaActual.fundamento]})`;
        
        // Buscar días consecutivos con el mismo fundamento
        let j = i;
        while (j + 1 < todosDiasDelMes.length && 
               todosDiasDelMes[j + 1].dia === todosDiasDelMes[j].dia + 1 && 
               todosDiasDelMes[j + 1].fundamento === diaActual.fundamento) {
          j++;
        }
        
        // Crear el texto del grupo
        if (i === j) {
          // Un solo día
          gruposConsecutivos.push(`${numeroATexto(diaActual.dia)}${superindice}`);
        } else {
          // Rango de días consecutivos
          const diaFinal = todosDiasDelMes[j];
          gruposConsecutivos.push(`${numeroATexto(diaActual.dia)}${superindice} a ${numeroATexto(diaFinal.dia)}${superindice}`);
        }
        
        i = j + 1;
      }
      
      // Formatear la lista con "y" antes del último elemento
      let diasTextoMes: string;
      if (gruposConsecutivos.length === 1) {
        diasTextoMes = gruposConsecutivos[0];
      } else {
        const ultimoGrupo = gruposConsecutivos.pop();
        diasTextoMes = gruposConsecutivos.join(', ') + ', y ' + ultimoGrupo;
      }
      
      diasTexto.push(`así como el ${diasTextoMes}, todos de ${mesAno}`);
    });
  }
  
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
  tipoUsuario 
}: {
  fechaNotificacion: Date,
  fechaSurte: Date,
  fechaInicio: Date,
  fechaFin: Date,
  diasAdicionales: string[],
  tipoUsuario: string
}) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Calcular rango de meses a mostrar
  const mesInicio = new Date(fechaNotificacion.getFullYear(), fechaNotificacion.getMonth(), 1);
  const mesFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 0);
  
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
              borderRadius: '8px',
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
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    fechaConocimiento: '',
    tipoFecha: null as string | null,
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
  // const [calculos, setCalculos] = useState<any[]>([]);

  useEffect(() => {
    // Obtener tipo de usuario de localStorage
    const tipo = localStorage.getItem('tipoUsuario') || 'litigante';
    setTipoUsuario(tipo);
    
    // Cargar cálculos guardados (solo para litigantes)
    // if (tipo === 'litigante') {
    //   const calculosGuardados = localStorage.getItem('calculosGuardados');
    //   if (calculosGuardados) {
    //     setCalculos(JSON.parse(calculosGuardados));
    //   }
    // }
  }, []);

  // Limpiar valores cuando se selecciona auto-cumplida
  useEffect(() => {
    if (formData.resolucionImpugnada === 'auto-cumplida') {
      // Si tenía autoridad seleccionada, limpiar
      if (formData.parteRecurrente === 'autoridad') {
        setFormData(prev => ({
          ...prev,
          parteRecurrente: '',
          formaNotificacion: ''
        }));
      }
      // Si tenía oficio seleccionado, limpiar
      if (formData.formaNotificacion === 'oficio') {
        setFormData(prev => ({
          ...prev,
          formaNotificacion: ''
        }));
      }
    }
  }, [formData.resolucionImpugnada]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tipoFecha') {
      // Limpiar la fecha que no se está usando
      if (value === 'notificacion') {
        setFormData({
          ...formData,
          tipoFecha: value,
          fechaConocimiento: ''
        });
      } else if (value === 'conocimiento') {
        setFormData({
          ...formData,
          tipoFecha: value,
          fechaNotificacion: '',
          formaNotificacion: ''
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un tipo de fecha
    if (!formData.tipoFecha) {
      alert('Por favor seleccione fecha de notificación o fecha de conocimiento');
      return;
    }
    
    setCalculando(true);
    
    setTimeout(() => {
      const plazo = 15;
      const fundamento = 'artículo 202, segundo párrafo, de la Ley de Amparo';
      
      let fechaInicio;
      let usandoFechaConocimiento = false;
      let fechaSurte;
      let textoSurte = '';
      let fundamentoSurte = '';
      
      if (formData.tipoFecha === 'conocimiento') {
        // Si seleccionó fecha de conocimiento, usar esa fecha
        const fechaConocimiento = new Date(formData.fechaConocimiento + 'T12:00:00');
        // El plazo inicia al día siguiente de la fecha de conocimiento
        fechaInicio = siguienteDiaHabil(fechaConocimiento, diasAdicionales, tipoUsuario);
        usandoFechaConocimiento = true;
      } else {
        // Usar la lógica normal con fecha de notificación
        const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        fechaSurte = new Date(fechaNotif);
        
        // Para inconformidad, normalmente la parte recurrente es el quejoso
        // pero podemos determinar si hay casos especiales
        const esAutoridadTercero = false; // En inconformidad raramente es autoridad
        
        // Usar las funciones centralizadas del artículo 31
        textoSurte = getCuandoSurteEfectos(formData.formaNotificacion, 'quejoso', esAutoridadTercero);
        fundamentoSurte = getFundamentoSurtimientoEfectos(formData.formaNotificacion, 'quejoso', esAutoridadTercero);
        
        // Calcular la fecha en que surte efectos
        fechaSurte = calcularFechaSurteEfectos(
          fechaNotif, 
          formData.formaNotificacion, 
          'quejoso', 
          esAutoridadTercero,
          esDiaInhabil,
          siguienteDiaHabil,
          diasAdicionales,
          tipoUsuario
        );
        
        // El plazo inicia al día siguiente del que surte efectos
        fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
      }
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales, tipoUsuario);
      
      // Para litigantes, no evaluamos la oportunidad
      let esOportuno = true;
      let fechaPres = null;
      
      if (tipoUsuario === 'servidor' && formData.fechaPresentacion) {
        fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
        esOportuno = fechaPres <= fechaFin;
      }
      
      const fechaNotif = formData.tipoFecha === 'conocimiento' ? new Date(formData.fechaConocimiento + 'T12:00:00') : new Date(formData.fechaNotificacion + 'T12:00:00');
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesTextoInfo = obtenerDiasInhabilesParaTexto(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      
      // Mapeos para el texto generado
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
        'correo': 'del sobre que obra en el toca en que se actúa',
        'momento': 'de la constancia de notificación que obra en el juicio de amparo',
        'electronica': 'de la evidencia criptográfica del escrito que lo contiene'
      };
      
      const resoluciones: {[key: string]: string} = {
        'sentencia': 'la sentencia impugnada',
        'auto': 'el acuerdo impugnado',
        'interlocutoria': 'la interlocutoria dictada en el incidente de suspensión'
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
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: numeroATexto(plazo)
      });
      
      setCalculando(false);
    }, 1000);
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
            usuario: 'Usuario',
            calculadora: 'inconformidad'
          })
        });
      } catch (error) {
        console.error('Error al registrar día inhábil:', error);
      }
      
      setNuevoDiaInhabil('');
    }
  };

  const guardarCalculo = async () => {
    if (!numeroExpediente || !resultado) return;
    
    const nuevoCalculo = {
      id: Date.now(),
      expediente: numeroExpediente,
      fechaGuardado: new Date().toISOString(),
      fechaVencimiento: resultado.fechaFin.toISOString(),
      tipoRecurso: formData.tipoRecurso,
      telefono: telefonoWhatsApp,
      notificaciones: {
        tresDias: false,
        dosDias: false,
        unDia: false,
        vencimiento: false
      },
      // Datos adicionales para el nuevo sistema
      tipo: 'inconformidad',
      fechaInicio: resultado.fechaInicio.toISOString(),
      diasHabiles: resultado.diasHabiles,
      tipoFecha: formData.tipoFecha,
      fechaNotificacion: formData.fechaNotificacion,
      fechaConocimiento: formData.fechaConocimiento,
      resolucionImpugnada: formData.resolucionImpugnada,
      parteRecurrente: formData.parteRecurrente,
      formaNotificacion: formData.formaNotificacion
    };
    
    const exito = await computosStorage.guardar(nuevoCalculo, 'inconformidad');
    
    if (exito) {
      alert(`Cálculo guardado exitosamente para expediente ${numeroExpediente}`);
      setNumeroExpediente('');
    } else {
      alert('Has alcanzado el límite de cálculos guardados (30). Por favor, elimina algunos cálculos antiguos desde la página de Cómputos Guardados.');
    }
  };

  // Función para copiar solo el calendario como imagen
  const copiarCalendario = async () => {
    try {
      const calendarioElement = document.getElementById('calendario-visual');
      
      if (calendarioElement) {
        // Importar html2canvas dinámicamente
        const html2canvas = (await import('html2canvas')).default;
        
        // Capturar el calendario como canvas
        const canvas = await html2canvas(calendarioElement, {
          backgroundColor: '#ffffff',
          scale: 2 // Mayor calidad
        });
        
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

  // Función para copiar solo el texto
  const copiarTexto = () => {
    navigator.clipboard.writeText(generarTexto());
    alert('Texto copiado al portapapeles');
  };

  const generarTextoFormateado = () => {
    if (!resultado) return '';
    
    // Determinar el género correcto según la parte recurrente
    const esQuejoso = formData.parteRecurrente === 'quejoso';
    const generoRecurrente = esQuejoso ? 'la recurrente' : 'el recurrente';
    const parteTexto = esQuejoso ? 'parte quejosa' : 'parte autoridad responsable';
    
    // Obtener el año de las fechas
    const año = new Date(formData.fechaNotificacion + 'T12:00:00').getFullYear();
    
    // Función para extraer solo día y mes
    const extraerDiaMes = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 2) {
        return `${partes[0]} de ${partes[1]}`;
      }
      return fechaTexto;
    };

    const extraerSoloDia = (fechaTexto: string, fechaComparacion: string) => {
      const partesComparacion = fechaComparacion.split(' de ');
      const partesFecha = fechaTexto.split(' de ');
      
      // Si es el mismo mes, solo devolver el día
      if (partesFecha.length >= 2 && partesComparacion.length >= 2 && partesFecha[1] === partesComparacion[1]) {
        return partesFecha[0];
      }
      return extraerDiaMes(fechaTexto);
    };

    // Función para generar texto detallado de días inhábiles
    const generarTextoDiasInhabiles = () => {
      let textoCompleto = '';
      
      // Obtener todos los sábados y domingos del período ordenados cronológicamente
      const sabadosYDomingos: {fecha: string, dia: number, mes: string, año: string}[] = [];
      const fechaTemp = new Date(resultado.fechaNotificacion);
      while (fechaTemp <= resultado.fechaFin) {
        if (fechaTemp.getDay() === 0 || fechaTemp.getDay() === 6) {
          const fechaTexto = fechaATexto(fechaTemp.toISOString().split('T')[0]);
          const partes = fechaTexto.split(' de ');
          sabadosYDomingos.push({
            fecha: fechaTemp.toISOString().split('T')[0],
            dia: fechaTemp.getDate(),
            mes: partes[1] || '',
            año: partes[2] || ''
          });
        }
        fechaTemp.setDate(fechaTemp.getDate() + 1);
      }
      
      if (sabadosYDomingos.length > 0) {
        // Ordenar cronológicamente
        sabadosYDomingos.sort((a, b) => a.fecha.localeCompare(b.fecha));
        
        // Agrupar por mes/año
        const sabadosPorMes: {[key: string]: number[]} = {};
        sabadosYDomingos.forEach(item => {
          const mesAno = `${item.mes} de ${item.año}`;
          if (!sabadosPorMes[mesAno]) {
            sabadosPorMes[mesAno] = [];
          }
          sabadosPorMes[mesAno].push(item.dia);
        });
        
        // Generar texto agrupando días consecutivos
        const textosSabados: string[] = [];
        const mesesOrdenados = Object.keys(sabadosPorMes).sort((a, b) => {
          const [mesA, añoA] = a.split(' de ');
          const [mesB, añoB] = b.split(' de ');
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const fechaA = parseInt(añoA) * 12 + meses.indexOf(mesA.toLowerCase());
          const fechaB = parseInt(añoB) * 12 + meses.indexOf(mesB.toLowerCase());
          return fechaA - fechaB;
        });
        
        mesesOrdenados.forEach((mesAno, index) => {
          const dias = sabadosPorMes[mesAno].sort((a, b) => a - b);
          
          // Agrupar días consecutivos
          const grupos: string[] = [];
          let inicio = dias[0];
          let fin = dias[0];
          
          for (let i = 1; i < dias.length; i++) {
            if (dias[i] === fin + 1) {
              fin = dias[i];
            } else {
              if (inicio === fin) {
                grupos.push(numeroATexto(inicio) || inicio.toString());
              } else if (fin === inicio + 1) {
                grupos.push(numeroATexto(inicio) || inicio.toString());
                grupos.push(numeroATexto(fin) || fin.toString());
              } else {
                grupos.push(`del ${numeroATexto(inicio) || inicio.toString()} al ${numeroATexto(fin) || fin.toString()}`);
              }
              inicio = dias[i];
              fin = dias[i];
            }
          }
          
          // Agregar el último grupo
          if (inicio === fin) {
            grupos.push(numeroATexto(inicio) || inicio.toString());
          } else if (fin === inicio + 1) {
            grupos.push(numeroATexto(inicio) || inicio.toString());
            grupos.push(numeroATexto(fin) || fin.toString());
          } else {
            grupos.push(`del ${numeroATexto(inicio) || inicio.toString()} al ${numeroATexto(fin) || fin.toString()}`);
          }
          
          const diasTexto = grupos.length > 1 ? grupos.join(', ').replace(/, ([^,]+)$/, ' y $1') : grupos[0];
          const totalDias = dias.length;
          
          // Para el primer mes, usar la fecha completa
          if (index === 0) {
            if (totalDias === 2) {
              textosSabados.push(`${diasTexto}, ambos de ${mesAno}`);
            } else {
              textosSabados.push(`${diasTexto}, todos de ${mesAno}`);
            }
          } else {
            // Para meses subsecuentes del mismo año, usar "del año referido" o solo el mes
            const [mesActual, añoActual] = mesAno.split(' de ');
            const [mesPrimero, añoPrimero] = mesesOrdenados[0].split(' de ');
            
            if (añoActual === añoPrimero) {
              // Mismo año, simplificar para evitar repetir "todos"
              if (totalDias === 2) {
                textosSabados.push(`${diasTexto}, ambos de ${mesActual} del año referido`);
              } else {
                // Para meses subsecuentes, omitir "todos" para evitar repetición
                textosSabados.push(`${diasTexto} de ${mesActual} del año referido`);
              }
            } else {
              // Año diferente, usar fecha completa
              if (totalDias === 2) {
                textosSabados.push(`${diasTexto}, ambos de ${mesAno}`);
              } else {
                textosSabados.push(`${diasTexto}, todos de ${mesAno}`);
              }
            }
          }
        });
        
        
        textoCompleto = textosSabados.join(', así como ') + ', por corresponder a sábados y domingos';
      }
      
      // Obtener otros días inhábiles (no sábados/domingos) del período
      const otrosDiasInhabiles: {fecha: string, dia: number, mes: string, año: string}[] = [];
      const fechaTemp2 = new Date(resultado.fechaNotificacion);
      while (fechaTemp2 <= resultado.fechaFin) {
        if (fechaTemp2.getDay() !== 0 && fechaTemp2.getDay() !== 6 && esDiaInhabil(fechaTemp2, diasAdicionales, tipoUsuario)) {
          const fechaTexto = fechaATexto(fechaTemp2.toISOString().split('T')[0]);
          const partes = fechaTexto.split(' de ');
          otrosDiasInhabiles.push({
            fecha: fechaTemp2.toISOString().split('T')[0],
            dia: fechaTemp2.getDate(),
            mes: partes[1] || '',
            año: partes[2] || ''
          });
        }
        fechaTemp2.setDate(fechaTemp2.getDate() + 1);
      }
      
      if (otrosDiasInhabiles.length > 0) {
        if (textoCompleto) {
          textoCompleto += '; además de los días ';
        }
        
        // Agrupar y formatear otros días inhábiles igual que los sábados
        const otrosPorMes: {[key: string]: number[]} = {};
        otrosDiasInhabiles.forEach(item => {
          const mesAno = `${item.mes} de ${item.año}`;
          if (!otrosPorMes[mesAno]) {
            otrosPorMes[mesAno] = [];
          }
          otrosPorMes[mesAno].push(item.dia);
        });
        
        const textosOtros: string[] = [];
        const mesesOtrosOrdenados = Object.keys(otrosPorMes).sort((a, b) => {
          const [mesA, añoA] = a.split(' de ');
          const [mesB, añoB] = b.split(' de ');
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const fechaA = parseInt(añoA) * 12 + meses.indexOf(mesA.toLowerCase());
          const fechaB = parseInt(añoB) * 12 + meses.indexOf(mesB.toLowerCase());
          return fechaA - fechaB;
        });
        
        mesesOtrosOrdenados.forEach((mesAno, index) => {
          const dias = otrosPorMes[mesAno].sort((a, b) => a - b);
          const grupos: string[] = [];
          let inicio = dias[0];
          let fin = dias[0];
          
          for (let i = 1; i < dias.length; i++) {
            if (dias[i] === fin + 1) {
              fin = dias[i];
            } else {
              if (inicio === fin) {
                grupos.push(numeroATexto(inicio) || inicio.toString());
              } else if (fin === inicio + 1) {
                grupos.push(numeroATexto(inicio) || inicio.toString());
                grupos.push(numeroATexto(fin) || fin.toString());
              } else {
                grupos.push(`del ${numeroATexto(inicio) || inicio.toString()} al ${numeroATexto(fin) || fin.toString()}`);
              }
              inicio = dias[i];
              fin = dias[i];
            }
          }
          
          if (inicio === fin) {
            grupos.push(numeroATexto(inicio) || inicio.toString());
          } else if (fin === inicio + 1) {
            grupos.push(numeroATexto(inicio) || inicio.toString());
            grupos.push(numeroATexto(fin) || fin.toString());
          } else {
            grupos.push(`del ${numeroATexto(inicio) || inicio.toString()} al ${numeroATexto(fin) || fin.toString()}`);
          }
          
          const diasTexto = grupos.length > 1 ? grupos.join(', ').replace(/, ([^,]+)$/, ' y $1') : grupos[0];
          const totalDias = dias.length;
          
          // Aplicar la misma lógica de evitar repetición del año
          if (index === 0 || mesesOtrosOrdenados.length === 1) {
            // Primer mes o único mes
            if (totalDias === 2) {
              textosOtros.push(`${diasTexto}, ambos de ${mesAno}`);
            } else {
              textosOtros.push(`${diasTexto}, todos de ${mesAno}`);
            }
          } else {
            // Verificar si ya se mencionó el año antes (desde sábados/domingos o meses previos)
            const [mesActual, añoActual] = mesAno.split(' de ');
            const [mesPrimero, añoPrimero] = mesesOtrosOrdenados[0].split(' de ');
            
            if (añoActual === añoPrimero || textoCompleto) {
              // Mismo año o ya se mencionó el año antes, simplificar para evitar repetir "todos"
              if (totalDias === 2) {
                textosOtros.push(`${diasTexto}, ambos de ${mesActual} del año referido`);
              } else {
                // Para meses subsecuentes o cuando ya se mencionó el año, omitir "todos"
                textosOtros.push(`${diasTexto} de ${mesActual} del año referido`);
              }
            } else {
              // Año diferente, usar fecha completa
              if (totalDias === 2) {
                textosOtros.push(`${diasTexto}, ambos de ${mesAno}`);
              } else {
                textosOtros.push(`${diasTexto}, todos de ${mesAno}`);
              }
            }
          }
        });
        
        
        textoCompleto += textosOtros.join(', así como ');
      }
      
      return textoCompleto;
    };

    let textoHTML = `<p style="text-indent: 2em; margin-bottom: 1em;">La presentación del recurso es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación del auto impugnado se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${extraerSoloDia(resultado.fechaSurteEfectosTexto, resultado.fechaNotificacionTexto)} siguiente, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso artículo 202, segundo párrafo, de esa ley, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)}, del año en cita, con exclusión de los días ${generarTextoDiasInhabiles()}.</p>`;

    textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.</p>`;

    // Agregar jurisprudencia si el recurso se presenta antes del cómputo (solo para servidores)
    if (tipoUsuario === 'servidor' && formData.fechaPresentacion && resultado.fechaInicio) {
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const fechaInicioComp = resultado.fechaInicio instanceof Date ? resultado.fechaInicio : new Date(resultado.fechaInicio + 'T12:00:00');
      
      if (fechaPres < fechaInicioComp) {
        textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Al respecto, resulta aplicable la jurisprudencia 1a./J. 16/2008, sustentada por la Primera Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:</p>`;
        
        textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;"><strong>"INCONFORMIDAD. SU INTERPOSICIÓN ES OPORTUNA AUN ANTES DE QUE INICIE EL PLAZO PARA ELLO.</strong> De una interpretación sistemática de los artículos 24, fracción III, y 25 de la Ley de Amparo, en relación con el 21 del propio ordenamiento, se advierte que las reglas para la presentación de la demanda de amparo que señala el último precepto citado son aplicables para la inconformidad prevista en el párrafo tercero del artículo 105 de la Ley mencionada. En ese sentido, el recurrente puede interponer la inconformidad desde el momento mismo en que se le notifique el acuerdo recurrido, es decir, el mismo día, o bien también puede hacerlo al día siguiente, esto es, el día que surte efectos la notificación, sin que por ello deba considerarse presentada extemporáneamente, máxime si no existe disposición legal alguna que prohíba expresamente interponerla antes de que inicie el plazo otorgado para dicho trámite, ni que señale que por ello sea extemporánea o inoportuna."</p>`;
      }
    }
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      textoHTML += '<div style="border-top: 1px solid #ccc; margin-top: 1.5em; padding-top: 0.5em;">';
      resultado.notasAlPieTexto.forEach((nota: string) => {
        textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;">${nota}</p>`;
      });
      textoHTML += '</div>';
    }
    
    return textoHTML;
  };

  const generarTexto = () => {
    if (!resultado) return '';
    
    // Determinar el género correcto según la parte recurrente
    const esQuejoso = formData.parteRecurrente === 'quejoso';
    const generoRecurrente = esQuejoso ? 'la recurrente' : 'el recurrente';
    const parteTexto = esQuejoso ? 'parte quejosa' : 'parte autoridad responsable';
    
    // Obtener el año de las fechas
    const año = new Date(formData.fechaNotificacion + 'T12:00:00').getFullYear();
    
    // Función para simplificar fecha (solo día y mes para fechas intermedias)
    const simplificarFecha = (fechaTexto: string, esPrimera: boolean = false, esUltima: boolean = false) => {
      if (esPrimera || esUltima) return fechaTexto; // Mantener completa primera y última fecha
      // Extraer solo día y mes para fechas intermedias
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 2) {
        return `${partes[0]} de ${partes[1]}`;
      }
      return fechaTexto;
    };
    
    // Simplificar las fechas para evitar repetir el año
    const extraerDiaMes = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      if (partes.length >= 3) {
        return `${partes[0]} de ${partes[1]}`;
      }
      return fechaTexto;
    };
    
    // Extraer solo el día para "siguiente" si es el mismo mes que la notificación
    const extraerSoloDia = (fechaTexto: string, fechaComparacion: string) => {
      const partesComparacion = fechaComparacion.split(' de ');
      const partesFecha = fechaTexto.split(' de ');
      
      // Si es el mismo mes, solo devolver el día
      if (partesFecha.length >= 2 && partesComparacion.length >= 2 && partesFecha[1] === partesComparacion[1]) {
        return partesFecha[0];
      }
      return extraerDiaMes(fechaTexto);
    };

    let texto = `La presentación del recurso es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación del auto impugnado se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${extraerSoloDia(resultado.fechaSurteEfectosTexto, resultado.fechaNotificacionTexto)} siguiente, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso artículo 202, segundo párrafo, de esa ley, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)}, todos del citado año, con exclusión de los días ${resultado.diasInhabilesTexto}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;

    // Agregar jurisprudencia si el recurso se presenta antes del cómputo (solo para servidores)
    if (tipoUsuario === 'servidor' && formData.fechaPresentacion && resultado.fechaInicio) {
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      // resultado.fechaInicio ya es un objeto Date, no necesita conversión
      const fechaInicioComp = resultado.fechaInicio instanceof Date ? resultado.fechaInicio : new Date(resultado.fechaInicio + 'T12:00:00');
      
      console.log('Fecha presentación:', fechaPres);
      console.log('Fecha inicio cómputo:', fechaInicioComp);
      console.log('Es anterior:', fechaPres < fechaInicioComp);
      
      if (fechaPres < fechaInicioComp) {
        texto += `\n\nAl respecto, resulta aplicable la jurisprudencia 1a./J. 16/2008, sustentada por la Primera Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:\n\n"INCONFORMIDAD. SU INTERPOSICIÓN ES OPORTUNA AUN ANTES DE QUE INICIE EL PLAZO PARA ELLO. De una interpretación sistemática de los artículos 24, fracción III, y 25 de la Ley de Amparo, en relación con el 21 del propio ordenamiento, se advierte que las reglas para la presentación de la demanda de amparo que señala el último precepto citado son aplicables para la inconformidad prevista en el párrafo tercero del artículo 105 de la Ley mencionada. En ese sentido, el recurrente puede interponer la inconformidad desde el momento mismo en que se le notifique el acuerdo recurrido, es decir, el mismo día, o bien también puede hacerlo al día siguiente, esto es, el día que surte efectos la notificación, sin que por ello deba considerarse presentada extemporáneamente, máxime si no existe disposición legal alguna que prohíba expresamente interponerla antes de que inicie el plazo otorgado para dicho trámite, ni que señale que por ello sea extemporánea o inoportuna."`;
      }
    }
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      texto += '\n\n__________________________________\n';
      resultado.notasAlPieTexto.forEach((nota: string, index: number) => {
        texto += `${index + 1} ${nota}\n`;
      });
    }
    
    return texto;
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
      
      {/* Subtle pattern overlay */}
      <div style={{
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1C1C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
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
      }} />
      
      {/* Línea negra */}
      <div style={{ 
        position: 'absolute',
        top: '122px',
        left: 0,
        right: 0,
        height: '1.5px', 
        backgroundColor: '#1C1C1C',
        zIndex: 1
      }} />

      {/* Logo K-LAW en la parte izquierda */}
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
                borderRadius: '25px'
              }}>
                Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
              </span>
              <Link 
                href="/calculadoras" 
                className="text-sm px-4 py-2" 
                style={{ 
                  backgroundColor: '#1C1C1C', 
                  color: '#FFFFFF', 
                  borderRadius: '6px', 
                  transition: 'all 0.3s ease', 
                  cursor: 'pointer', 
                  fontFamily: 'Inter, sans-serif' 
                }} 
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = '#C5A770'; 
                  e.currentTarget.style.color = '#1C1C1C'; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                  e.currentTarget.style.color = '#FFFFFF'; 
                }}
              >
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
            Recurso de Inconformidad
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
            <form onSubmit={handleSubmit} style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)', 
              padding: '2.5rem', 
              border: '1.5px solid #C5A770' 
            }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block" style={{ 
                    color: '#1C1C1C', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.95rem', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Tipo de Recurso
                  </label>
                  <input 
                    type="text" 
                    value="Inconformidad" 
                    readOnly 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '1rem', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#3D3D3D', 
                      backgroundColor: 'transparent', 
                      cursor: 'not-allowed' 
                    }} 
                    suppressHydrationWarning={true}
                  />
                </div>
                
                <div>
                  <label className="block" style={{ 
                    color: '#1C1C1C', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.95rem', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Resolución Impugnada
                  </label>
                  <select 
                    name="resolucionImpugnada" 
                    value={formData.resolucionImpugnada} 
                    onChange={handleChange} 
                    style={{ 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem', 
                      transition: 'all 0.3s ease', 
                      backgroundColor: 'transparent', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#1C1C1C', 
                      width: '100%', 
                      padding: '0.75rem' 
                    }} 
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                    required 
                    suppressHydrationWarning={true}
                  >
                    <option value="">Seleccione...</option>
                    <option value="auto-cumplida">Auto que declara cumplida la ejecutoria de amparo</option>
                    <option value="auto-imposibilidad">Auto que declara que existe imposibilidad material de cumplir la ejecutoria de amparo</option>
                    <option value="auto-archivo">Auto que ordena el archivo del asunto</option>
                    <option value="auto-sin-materia">Auto que declara sin materia o infundada la denuncia de repetición del acto reclamado</option>
                    <option value="auto-improcedente">Auto que declara infundada o improcedente la denuncia por incumplimiento de la declaratoria general de inconstitucionalidad</option>
                  </select>
                </div>
                
                <div>
                  <label className="block" style={{ 
                    color: '#1C1C1C', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.95rem', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Parte Recurrente
                  </label>
                  <select 
                    name="parteRecurrente" 
                    value={formData.parteRecurrente} 
                    onChange={handleChange} 
                    style={{ 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem', 
                      transition: 'all 0.3s ease', 
                      backgroundColor: 'transparent', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#1C1C1C', 
                      width: '100%', 
                      padding: '0.75rem' 
                    }} 
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                    required 
                    suppressHydrationWarning={true}
                  >
                    <option value="">Seleccione...</option>
                    {formData.resolucionImpugnada !== 'auto-cumplida' && (
                      <option value="autoridad">Autoridad</option>
                    )}
                    <option value="quejoso">Quejoso</option>
                    <option value="tercero">Tercero interesado</option>
                    <option value="promovente">Promovente de la denuncia por incumplimiento de la declaratoria general de inconstitucionalidad</option>
                    <option value="tercero-extrano">Tercero extraño a juicio</option>
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
                          checked={formData.tipoFecha === 'notificacion'}
                          onChange={handleChange}
                          style={{ accentColor: '#1C1C1C' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#1C1C1C', fontWeight: '500' }}>
                          Fecha de Notificación
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campos de notificación justo después de seleccionar esa opción */}
                    {formData.tipoFecha === 'notificacion' && (
                      <div className="ml-8 space-y-4" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            Fecha de Notificación
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
                            suppressHydrationWarning={true}
                          />
                        </div>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                          <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                            <option value="">Seleccione...</option>
                            <option value="personal">Personalmente</option>
                            {formData.parteRecurrente === 'autoridad' && formData.resolucionImpugnada !== 'auto-cumplida' && (
                              <option value="oficio">Por oficio</option>
                            )}
                            <option value="lista">Por lista</option>
                            <option value="electronica">En forma electrónica</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ 
                      backgroundColor: formData.tipoFecha === 'notificacion' ? '#f5f5f5' : '#ffffff', 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      border: '1.5px solid #1C1C1C', 
                      transition: 'all 0.3s ease',
                      opacity: formData.tipoFecha === 'notificacion' ? '0.6' : '1'
                    }}>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="tipoFecha" 
                          value="conocimiento"
                          checked={formData.tipoFecha === 'conocimiento'}
                          onChange={handleChange}
                          style={{ accentColor: '#1C1C1C' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: formData.tipoFecha === 'notificacion' ? '#999' : '#1C1C1C', fontWeight: '500' }}>
                          Fecha de Conocimiento
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campo de conocimiento */}
                    {formData.tipoFecha === 'conocimiento' && (
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
                            suppressHydrationWarning={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="block" style={{ 
                        color: '#1C1C1C', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem', 
                        fontSize: '0.95rem', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>
                        Fecha de Presentación
                      </label>
                      <input 
                        type="date" 
                        name="fechaPresentacion" 
                        value={formData.fechaPresentacion} 
                        onChange={handleChange} 
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem', 
                          border: '1.5px solid #1C1C1C', 
                          borderRadius: '8px', 
                          fontSize: '0.95rem', 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#1C1C1C', 
                          backgroundColor: 'transparent', 
                          transition: 'all 0.3s ease' 
                        }} 
                        onFocus={(e) => e.target.style.borderColor = '#C5A770'} 
                        onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} 
                        required={tipoUsuario === 'servidor'} 
                        suppressHydrationWarning={true} 
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block" style={{ 
                        color: '#1C1C1C', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem', 
                        fontSize: '0.95rem', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>
                        Forma de Presentación
                      </label>
                      <select 
                        name="formaPresentacion" 
                        value={formData.formaPresentacion} 
                        onChange={handleChange} 
                        style={{ 
                          border: '1.5px solid #1C1C1C', 
                          borderRadius: '8px', 
                          fontSize: '0.95rem', 
                          transition: 'all 0.3s ease', 
                          backgroundColor: 'transparent', 
                          fontFamily: 'Inter, sans-serif', 
                          color: '#1C1C1C', 
                          width: '100%', 
                          padding: '0.75rem' 
                        }} 
                        onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                        required={tipoUsuario === 'servidor'} 
                        suppressHydrationWarning={true}
                      >
                        <option value="">Seleccione...</option>
                        <option value="escrito">Por escrito</option>
                        <option value="correo">Por correo</option>
                        <option value="momento">Al momento de ser notificado</option>
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
            <div style={{ 
              backgroundColor: 'transparent', 
              borderRadius: '30px', 
              padding: '2rem', 
              border: '2px solid #C5A770' 
            }}>
              <h3 style={{ 
                fontFamily: 'Playfair Display, serif', 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1C1C1C', 
                marginBottom: '1rem' 
              }}>
                Días Inhábiles Adicionales
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block" style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem', 
                    color: '#1C1C1C', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Agregar día inhábil
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={nuevoDiaInhabil} 
                      onChange={(e) => setNuevoDiaInhabil(e.target.value)} 
                      style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        border: '1.5px solid #1C1C1C', 
                        borderRadius: '8px', 
                        fontSize: '0.875rem', 
                        backgroundColor: 'transparent', 
                        color: '#1C1C1C', 
                        fontFamily: 'Inter, sans-serif' 
                      }} 
                      suppressHydrationWarning={true} 
                    />
                    <button type="button" onClick={agregarDiaInhabil} style={{ backgroundColor: '#1C1C1C', color: '#F4EFE8', padding: '0.5rem 1rem', borderRadius: '25px', fontSize: '0.875rem', fontWeight: '500', border: '1.5px solid #1C1C1C', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C5A770'; e.currentTarget.style.borderColor = '#C5A770'; e.currentTarget.style.color = '#1C1C1C'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.borderColor = '#1C1C1C'; e.currentTarget.style.color = '#F4EFE8'; }} suppressHydrationWarning={true}>
                      Agregar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block" style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem', 
                    color: '#1C1C1C', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Fundamento legal
                  </label>
                  <input 
                    type="text" 
                    value={fundamentoAdicional} 
                    onChange={(e) => setFundamentoAdicional(e.target.value)} 
                    placeholder="Ej: Circular CCNO/1/2024" 
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '0.875rem', 
                      backgroundColor: 'transparent', 
                      color: '#1C1C1C', 
                      fontFamily: 'Inter, sans-serif' 
                    }} 
                    suppressHydrationWarning={true} 
                  />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      marginBottom: '0.5rem', 
                      color: '#1C1C1C', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
                      Días agregados:
                    </p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          backgroundColor: '#F4EFE8', 
                          padding: '0.5rem', 
                          borderRadius: '8px', 
                          fontSize: '0.875rem', 
                          fontFamily: 'Inter, sans-serif', 
                          marginBottom: '0.25rem' 
                        }}>
                          <span>{tipoUsuario === 'litigante' ? fechaParaLitigante(dia) : fechaATexto(dia)}</span>
                          <button 
                            type="button" 
                            onClick={() => setDiasAdicionales(diasAdicionales.filter(d => d !== dia))} 
                            style={{ 
                              color: '#C5A770', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              fontSize: '0.875rem', 
                              fontFamily: 'Inter, sans-serif', 
                              transition: 'color 0.3s ease' 
                            }} 
                            onMouseEnter={(e) => e.currentTarget.style.color = '#1C1C1C'} 
                            onMouseLeave={(e) => e.currentTarget.style.color = '#C5A770'}
                          >
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
            <div style={{ 
              marginTop: '1.5rem', 
              backgroundColor: '#FFFFFF', 
              borderRadius: '8px', 
              padding: '2rem', 
              border: '1.5px solid #1C1C1C' 
            }}>
              <h2 style={{ 
                fontSize: '1.875rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1C1C1C', 
                fontFamily: 'Playfair Display, serif' 
              }}>
                Resultado del Cálculo
              </h2>
              
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
                    <p style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
                      El plazo para presentar el recurso vence el: {' '}
                      <span style={{ color: '#1C1C1C' }}>
                        {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}
                      </span>
                    </p>
                    {resultado.diasRestantes > 0 && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: '#3D3D3D', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>
                        Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                      </p>
                    )}
                    {resultado.diasRestantes === 0 && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: '#C5A770', 
                        fontWeight: 'bold', 
                        fontFamily: 'Inter, sans-serif' 
                      }}>
                        ⚠️ El plazo ha vencido
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: '#F4EFE8', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem' 
              }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  marginBottom: '0.5rem', 
                  color: '#1C1C1C', 
                  fontFamily: 'Inter, sans-serif' 
                }}>
                  Detalles del Cómputo:
                </h3>
                <div style={{ fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C' }}>
                  <p><strong>Plazo legal:</strong> {resultado.plazo} días</p>
                  <p><strong>Fundamento:</strong> {resultado.fundamento}</p>
                  {resultado.usandoFechaConocimiento ? (
                    <p><strong>Fecha de conocimiento:</strong> {fechaParaLitigante(formData.fechaConocimiento)}</p>
                  ) : (
                    <>
                      <p><strong>Fecha de notificación:</strong> {fechaParaLitigante(formData.fechaNotificacion)}</p>
                      <p><strong>Surte efectos:</strong> {fechaParaLitigante(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                    </>
                  )}
                  <p><strong>Período del cómputo:</strong> Del {fechaParaLitigante(resultado.fechaInicio.toISOString().split('T')[0])} al {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}</p>
                  {tipoUsuario === 'servidor' && (
                    <p><strong>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : ''}</p>
                  )}
                  <p><strong>Días inhábiles excluidos:</strong> {formatearDiasInhabilesParaDetalles(resultado.diasInhabiles)}</p>
                </div>
              </div>
              
              {/* Calendario visual - solo para servidores */}
              {tipoUsuario === 'servidor' && (
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  padding: '1.5rem', 
                  borderRadius: '8px', 
                  border: '1.5px solid #C5A770', 
                  marginTop: '1rem' 
                }}>
                  <h3 style={{ 
                    fontWeight: '600', 
                    fontSize: '1.125rem', 
                    marginBottom: '1rem', 
                    color: '#1C1C1C', 
                    fontFamily: 'Playfair Display, serif' 
                  }}>
                    Calendario Visual del Cómputo
                  </h3>
                  
                  <div id="calendario-visual" className="bg-white">
                    <Calendario 
                  fechaNotificacion={resultado.fechaNotificacion}
                  fechaSurte={resultado.fechaSurte}
                  fechaInicio={resultado.fechaInicio}
                  fechaFin={resultado.fechaFin}
                  diasAdicionales={diasAdicionales}
                  tipoUsuario={tipoUsuario}
                />
                  </div>
                </div>
              )}
              
              {tipoUsuario === 'servidor' && (
                <div style={{ 
                  backgroundColor: '#F4EFE8', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginTop: '1.5rem', 
                  border: '1.5px solid #C5A770' 
                }}>
                  <h3 style={{ 
                    fontWeight: '700', 
                    marginBottom: '0.5rem', 
                    color: '#1C1C1C', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Texto para Resolución:
                  </h3>
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
                    <button 
                      onClick={copiarCalendario} 
                      style={{ 
                        backgroundColor: '#1C1C1C', 
                        color: '#FFFFFF', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '8px', 
                        fontSize: '0.95rem', 
                        fontWeight: '600', 
                        border: 'none', 
                        cursor: 'pointer', 
                        transition: 'all 0.3s ease', 
                        fontFamily: 'Inter, sans-serif' 
                      }} 
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#C5A770'; 
                      }} 
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                      }}
                    >
                      Copiar calendario
                    </button>
                    <button 
                      onClick={copiarTexto} 
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: '#1C1C1C', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '8px', 
                        fontSize: '0.95rem', 
                        fontWeight: '600', 
                        border: '1.5px solid #1C1C1C', 
                        cursor: 'pointer', 
                        transition: 'all 0.3s ease', 
                        fontFamily: 'Inter, sans-serif' 
                      }} 
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                        e.currentTarget.style.color = '#FFFFFF'; 
                      }} 
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = 'transparent'; 
                        e.currentTarget.style.color = '#1C1C1C'; 
                      }}
                    >
                      Copiar texto
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { 
                    setResultado(null); 
                    setFormData({ 
                      tipoRecurso: 'principal', 
                      resolucionImpugnada: '', 
                      parteRecurrente: '', 
                      fechaNotificacion: '', 
                      fechaConocimiento: '', 
                      tipoFecha: null, 
                      formaNotificacion: '', 
                      fechaPresentacion: '', 
                      formaPresentacion: '' 
                    }); 
                  }} 
                  style={{ 
                    backgroundColor: '#1C1C1C', 
                    color: '#FFFFFF', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem', 
                    fontWeight: '600', 
                    border: 'none', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease', 
                    fontFamily: 'Inter, sans-serif' 
                  }} 
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = '#C5A770'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                  }}
                >
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Sección para litigantes */}
            {tipoUsuario === 'litigante' && (
              <div style={{ 
                marginTop: '1.5rem', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                border: '1.5px solid #C5A770' 
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem', 
                  color: '#1C1C1C', 
                  fontFamily: 'Playfair Display, serif' 
                }}>
                  Guardar Cálculo y Notificaciones
                </h3>
                
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  marginBottom: '1rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Puedes guardar hasta 30 cálculos. Ver todos tus cálculos guardados en{' '}
                  <Link href="/computos-guardados" style={{ color: '#C5A770', textDecoration: 'underline' }}>
                    Cómputos Guardados
                  </Link>
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block" style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      marginBottom: '0.5rem', 
                      color: '#1C1C1C', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
                      Número de Expediente
                    </label>
                    <input 
                      type="text" 
                      value={numeroExpediente} 
                      onChange={(e) => setNumeroExpediente(e.target.value)}
                      placeholder="Ej: 123/2024"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1.5px solid #1C1C1C', 
                        borderRadius: '8px', 
                        backgroundColor: 'transparent', 
                        color: '#1C1C1C', 
                        fontFamily: 'Inter, sans-serif' 
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block" style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      marginBottom: '0.5rem', 
                      color: '#1C1C1C', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
                      WhatsApp (opcional)
                    </label>
                    <input 
                      type="tel" 
                      value={telefonoWhatsApp} 
                      onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                      placeholder="Ej: +52 1234567890"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1.5px solid #1C1C1C', 
                        borderRadius: '8px', 
                        backgroundColor: 'transparent', 
                        color: '#1C1C1C', 
                        fontFamily: 'Inter, sans-serif' 
                      }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={guardarCalculo}
                  disabled={!numeroExpediente}
                  style={{ 
                    backgroundColor: !numeroExpediente ? '#B0B0B0' : '#1C1C1C', 
                    color: '#FFFFFF', 
                    padding: '0.5rem 1.5rem', 
                    borderRadius: '8px', 
                    cursor: !numeroExpediente ? 'not-allowed' : 'pointer', 
                    border: 'none', 
                    fontFamily: 'Inter, sans-serif', 
                    transition: 'all 0.3s ease' 
                  }} 
                  onMouseEnter={(e) => { 
                    if (numeroExpediente) e.currentTarget.style.backgroundColor = '#C5A770'; 
                  }} 
                  onMouseLeave={(e) => { 
                    if (numeroExpediente) e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                  }}
                >
                  Guardar Cálculo (límite: 30)
                </button>
                
                {telefonoWhatsApp && (
                  <p style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#3D3D3D', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Recibirás recordatorios 3, 2 y 1 día antes del vencimiento, y el día del vencimiento.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Lista de cálculos guardados para litigantes - COMENTADO: Ahora se muestran en /computos-guardados */}
        {/* {tipoUsuario === 'litigante' && calculos.length > 0 && (
          <div style={{ 
            marginTop: '1.5rem', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            padding: '1.5rem', 
            border: '1.5px solid #1C1C1C' 
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              color: '#1C1C1C', 
              fontFamily: 'Playfair Display, serif' 
            }}>
              Cálculos Guardados
            </h3>
            <div className="space-y-2">
              {calculos.map((calc) => (
                <div key={calc.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem', 
                  backgroundColor: '#F4EFE8', 
                  borderRadius: '8px', 
                  marginBottom: '0.5rem' 
                }}>
                  <div>
                    <p style={{ 
                      fontWeight: '600', 
                      color: '#1C1C1C', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
                      Expediente: {calc.expediente}
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#3D3D3D', 
                      fontFamily: 'Inter, sans-serif' 
                    }}>
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
                    style={{ 
                      color: '#C5A770', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '0.875rem', 
                      fontFamily: 'Inter, sans-serif', 
                      transition: 'color 0.3s ease' 
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1C1C1C'} 
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C5A770'}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
}