'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { getCuandoSurteEfectos, calcularFechaSurteEfectos, getFundamentoSurtimientoEfectos } from '../../../lib/articulo31LeyAmparo.js'
import { agruparDiasConsecutivos, unirConY } from '../../utils/agruparDias'

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
  
  const año = fecha.getFullYear();
  const fechaStr = fecha.toISOString().split('T')[0];
  
  // Calcular días móviles para el año
  const diasMoviles = calcularDiasMoviles(año);
  
  // Revisar días adicionales específicos del usuario
  if (diasAdicionales.includes(fechaStr)) {
    return true;
  }
  
  // Revisar cada día inhábil en los datos
  for (const diaInhabil of diasInhabilesData) {
    // Fin de semana
    if (diaInhabil.tipo === 'finDeSemana') {
      const diaSemana = fecha.getDay();
      if (diaSemana === 0 || diaSemana === 6) return true;
    }
    
    // Días móviles
    if (diaInhabil.tipo === 'movil') {
      for (const diaMovil of diasMoviles) {
        if (fechaStr === diaMovil.fecha) return true;
      }
    }
    
    // Días con fecha específica
    if (diaInhabil.fecha) {
      if (diaInhabil.fecha.includes('-')) {
        // Fecha completa (YYYY-MM-DD)
        if (fechaStr === diaInhabil.fecha) return true;
      } else {
        // Fecha anual (MM-DD)
        const messDia = fechaStr.substring(5);
        if (messDia === diaInhabil.fecha) return true;
      }
    }
  }
  
  return false;
}

// Función para obtener el siguiente día hábil
function siguienteDiaHabil(fecha: Date, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): Date {
  const siguienteDia = new Date(fecha);
  siguienteDia.setDate(siguienteDia.getDate() + 1);
  
  while (esDiaInhabil(siguienteDia, diasAdicionales, tipoUsuario)) {
    siguienteDia.setDate(siguienteDia.getDate() + 1);
  }
  
  return siguienteDia;
}

// Función para calcular el plazo real considerando días inhábiles
function calcularPlazoReal(fechaInicio: Date, diasPlazo: number, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): Date {
  let fechaActual = new Date(fechaInicio);
  let diasContados = 0;
  
  while (diasContados < diasPlazo) {
    if (!esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
      diasContados++;
    }
    if (diasContados < diasPlazo) {
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
  }
  
  return fechaActual;
}

// Función para generar texto de días inhábiles para detalles del cómputo
function generarTextoDiasInhabilesDetalles(fechaInicio: Date, fechaFin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante'): { texto: string, notas: string[] } {
  const diasInhabiles: { fecha: Date, tipo: 'sabado' | 'domingo' | 'otro', fundamento?: string }[] = [];
  const notas: string[] = [];
  let contadorNotas = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const fundamentosUsados = new Map<string, number>();
  
  const fechaActual = new Date(fechaInicio);
  while (fechaActual <= fechaFin) {
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
        // Buscar el fundamento del día inhábil
        if (diasAdicionales.includes(fechaStr)) {
          fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        } else {
          // Buscar en diasInhabilesData
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
    // Obtener o asignar número de nota para artículo 19
    const fundamentoSabDom = 'artículo 19 de la Ley de Amparo';
    let numeroNota: number;
    if (fundamentosUsados.has(fundamentoSabDom)) {
      numeroNota = fundamentosUsados.get(fundamentoSabDom)!;
    } else {
      numeroNota = contadorNotas;
      fundamentosUsados.set(fundamentoSabDom, numeroNota);
      notas.push(fundamentoSabDom + '.');
      contadorNotas++;
    }
    const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
    
    if (sabados === 1 && domingos === 1) {
      texto = `el sábado y domingo incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if (sabados === 1 && domingos === 0) {
      texto = `el sábado incluido entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if (sabados === 0 && domingos === 1) {
      texto = `el domingo incluido entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if (sabados > 1 && domingos > 1) {
      texto = `los sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if (sabados > 1 && domingos === 0) {
      texto = `los sábados incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if (sabados === 0 && domingos > 1) {
      texto = `los domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
    } else if ((sabados === 1 && domingos > 1) || (sabados > 1 && domingos === 1)) {
      texto = `los sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindice}`;
    }
  }
  
  // Agrupar otros días por fundamento
  const otrosPorFundamento = new Map<string, Date[]>();
  otrosDias.forEach(d => {
    const fund = d.fundamento || 'Sin fundamento';
    if (!otrosPorFundamento.has(fund)) {
      otrosPorFundamento.set(fund, []);
    }
    otrosPorFundamento.get(fund)!.push(d.fecha);
  });
  
  // Agregar otros días inhábiles con superíndices
  otrosPorFundamento.forEach((fechas, fundamento) => {
    if (texto) texto += ', así como ';
    
    // Obtener o asignar número de nota
    let numeroNota: number;
    if (fundamentosUsados.has(fundamento)) {
      numeroNota = fundamentosUsados.get(fundamento)!;
    } else {
      numeroNota = contadorNotas;
      fundamentosUsados.set(fundamento, numeroNota);
      notas.push(fundamento + '.');
      contadorNotas++;
    }
    const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
    
    const diasFormateados = fechas.map(f => fechaParaLitigante(f.toISOString().split('T')[0]));
    texto += diasFormateados.join(', ') + superindice;
  });
  
  return { texto: texto || 'Ninguno', notas };
}

// Función para obtener información de días inhábiles en el período
function obtenerDiasInhabilesConNotas(fechaInicio: Date, fechaFin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasInhabiles = [];
  const notas = [];
  let contadorNotas = 1;
  
  const fechaActual = new Date(fechaInicio);
  const fundamentosUsados = new Set();
  
  while (fechaActual <= fechaFin) {
    if (esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      const año = fechaActual.getFullYear();
      
      // Verificar si es día adicional del usuario
      if (diasAdicionales.includes(fechaStr)) {
        diasInhabiles.push({
          fecha: tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr),
          nota: contadorNotas,
          fundamento: fundamentoAdicional || 'Día adicional'
        });
        
        if (fundamentoAdicional && !fundamentosUsados.has(fundamentoAdicional)) {
          notas.push(`${fundamentoAdicional}.`);
          fundamentosUsados.add(fundamentoAdicional);
          contadorNotas++;
        }
      } else {
        // Buscar en diasInhabilesData
        let fundamentoEncontrado = false;
        
        for (const diaInhabil of diasInhabilesData) {
          let coincide = false;
          
          if (diaInhabil.tipo === 'finDeSemana') {
            const diaSemana = fechaActual.getDay();
            if (diaSemana === 0 || diaSemana === 6) coincide = true;
          } else if (diaInhabil.tipo === 'movil') {
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
          
          if (coincide) {
            const fundamento = diaInhabil.fundamento;
            
            diasInhabiles.push({
              fecha: tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr),
              nota: fundamentosUsados.has(fundamento) ? Array.from(fundamentosUsados).indexOf(fundamento) + 1 : contadorNotas,
              fundamento: fundamento
            });
            
            if (!fundamentosUsados.has(fundamento)) {
              notas.push(`${fundamento}.`);
              fundamentosUsados.add(fundamento);
              contadorNotas++;
            }
            
            fundamentoEncontrado = true;
            break;
          }
        }
      }
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  // Agrupar días por mes y año para formato compacto
  const diasPorMes: { [key: string]: Array<{ dia: string; nota?: any }> } = {};
  diasInhabiles.forEach(dia => {
    const partes = dia.fecha.split(' de ');
    if (partes.length >= 2) {
      const mesAño = `${partes[1]} de ${partes[2] || partes[1]}`;
      if (!diasPorMes[mesAño]) {
        diasPorMes[mesAño] = [];
      }
      diasPorMes[mesAño].push({ dia: partes[0], nota: dia.nota });
    }
  });
  
  // Construir texto compacto
  let texto = '';
  const mesesOrdenados = Object.keys(diasPorMes);
  
  mesesOrdenados.forEach((mes, indice) => {
    const dias = diasPorMes[mes];
    
    // Convertir días de texto a número para agrupar
    const diasNumericos = dias.map((d: any) => {
      // Para obtenerDiasInhabilesConNotas, los días ya vienen como números
      const numero = typeof d.dia === 'string' ? parseInt(d.dia) : d.dia;
      return { numero: numero, superindice: d.nota ? d.nota.toString() : '' };
    });
    
    // Agrupar días consecutivos
    const gruposAgrupados = agruparDiasConsecutivos(diasNumericos);
    const diasTexto = unirConY(gruposAgrupados);
    
    if (indice > 0) {
      texto += indice === mesesOrdenados.length - 1 ? ' y ' : ', ';
    }
    texto += `${diasTexto} de ${mes}`;
  });
  
  return { texto, notas };
}

// Función para generar texto de días inhábiles para resoluciones con notas
function generarTextoDiasInhabilesResolucion(fechaInicio: Date, fechaFin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante'): { texto: string, notas: string[] } {
  const diasInhabilesSabDom: Date[] = [];
  const otrosDiasInhabiles: { fecha: Date, fundamento: string }[] = [];
  const notas: string[] = [];
  let contadorNotas = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  const fechaActual = new Date(fechaInicio);
  while (fechaActual <= fechaFin) {
    if (esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
      const diaSemana = fechaActual.getDay();
      const fechaStr = fechaActual.toISOString().split('T')[0];
      
      if (diaSemana === 0 || diaSemana === 6) {
        diasInhabilesSabDom.push(new Date(fechaActual));
      } else {
        // Buscar el fundamento del día inhábil
        let fundamento = '';
        
        // Verificar si es día adicional del usuario
        if (diasAdicionales.includes(fechaStr)) {
          fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        } else {
          // Buscar en diasInhabilesData
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
        
        otrosDiasInhabiles.push({ fecha: new Date(fechaActual), fundamento });
      }
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  let texto = '';
  
  // Procesar sábados y domingos
  if (diasInhabilesSabDom.length > 0) {
    // Agrupar por rangos consecutivos
    const rangos: { inicio: Date, fin: Date }[] = [];
    let rangoActual: { inicio: Date, fin: Date } | null = null;
    
    diasInhabilesSabDom.forEach((fecha, index) => {
      if (!rangoActual) {
        rangoActual = { inicio: fecha, fin: fecha };
      } else {
        const diffDias = Math.floor((fecha.getTime() - rangoActual.fin.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias <= 2) { // Si están cerca (máximo 2 días de diferencia)
          rangoActual.fin = fecha;
        } else {
          rangos.push(rangoActual);
          rangoActual = { inicio: fecha, fin: fecha };
        }
      }
      
      if (index === diasInhabilesSabDom.length - 1 && rangoActual) {
        rangos.push(rangoActual);
      }
    });
    
    // Generar texto para cada rango
    const textosRangos = rangos.map(rango => {
      const diaInicio = rango.inicio.getDate();
      const diaFin = rango.fin.getDate();
      
      if (diaInicio === diaFin) {
        return numeroATexto(diaInicio);
      } else {
        return `${numeroATexto(diaInicio)} y ${numeroATexto(diaFin)}`;
      }
    });
    
    texto = textosRangos.join(', ');
    
    // Agregar superíndice y nota para sábados y domingos
    const superindice = contadorNotas <= 9 ? superindices[contadorNotas - 1] : `(${contadorNotas})`;
    texto += `${superindice} de los mes y año referidos, por corresponder a ${diasInhabilesSabDom.length === 1 ? 'sábado o domingo' : 'sábados y domingos'}`;
    notas.push(`artículo 19 de la Ley de Amparo.`);
    contadorNotas++;
  }
  
  // Procesar otros días inhábiles agrupados por fundamento
  const diasPorFundamento: { [key: string]: number[] } = {};
  otrosDiasInhabiles.forEach(({ fecha, fundamento }) => {
    if (!diasPorFundamento[fundamento]) {
      diasPorFundamento[fundamento] = [];
    }
    diasPorFundamento[fundamento].push(fecha.getDate());
  });
  
  Object.entries(diasPorFundamento).forEach(([fundamento, dias]) => {
    if (texto) texto += ', y del ';
    
    const diasTexto = dias.map(dia => numeroATexto(dia));
    const superindice = contadorNotas <= 9 ? superindices[contadorNotas - 1] : `(${contadorNotas})`;
    
    if (diasTexto.length === 1) {
      texto += diasTexto[0] + superindice + ' siguiente';
    } else {
      const ultimo = diasTexto.pop();
      texto += diasTexto.join(', ') + ' y ' + ultimo + superindice + ' siguientes';
    }
    
    notas.push(`${fundamento}.`);
    contadorNotas++;
  });
  
  return { texto, notas };
}

// Función específica para generar texto para resoluciones
function obtenerDiasInhabilesParaTexto(fechaInicio: Date, fechaFin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasInhabiles = [];
  const notas = [];
  let contadorNotas = 1;
  
  const fechaActual = new Date(fechaInicio);
  const fundamentosUsados = new Set();
  
  while (fechaActual <= fechaFin) {
    if (esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      const año = fechaActual.getFullYear();
      
      // Verificar si es día adicional del usuario
      if (diasAdicionales.includes(fechaStr)) {
        diasInhabiles.push({
          fecha: fechaATexto(fechaStr),
          nota: contadorNotas,
          fundamento: fundamentoAdicional || 'Día adicional'
        });
        
        if (fundamentoAdicional && !fundamentosUsados.has(fundamentoAdicional)) {
          notas.push(`${fundamentoAdicional}.`);
          fundamentosUsados.add(fundamentoAdicional);
          contadorNotas++;
        }
      } else {
        // Buscar en diasInhabilesData
        for (const diaInhabil of diasInhabilesData) {
          let coincide = false;
          
          if (diaInhabil.tipo === 'finDeSemana') {
            const diaSemana = fechaActual.getDay();
            if (diaSemana === 0 || diaSemana === 6) coincide = true;
          } else if (diaInhabil.tipo === 'movil') {
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
          
          if (coincide) {
            const fundamento = diaInhabil.fundamento;
            
            diasInhabiles.push({
              fecha: fechaATexto(fechaStr),
              nota: fundamentosUsados.has(fundamento) ? Array.from(fundamentosUsados).indexOf(fundamento) + 1 : contadorNotas,
              fundamento: fundamento
            });
            
            if (!fundamentosUsados.has(fundamento)) {
              notas.push(`${fundamento}.`);
              fundamentosUsados.add(fundamento);
              contadorNotas++;
            }
            break;
          }
        }
      }
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  // Agrupar días por mes y año para formato compacto
  const diasPorMes: { [key: string]: Array<{ dia: string; nota?: any }> } = {};
  diasInhabiles.forEach(dia => {
    const partes = dia.fecha.split(' de ');
    if (partes.length >= 3) {
      const mesAño = `${partes[1]} de ${partes[2]}`;
      if (!diasPorMes[mesAño]) {
        diasPorMes[mesAño] = [];
      }
      diasPorMes[mesAño].push({ dia: partes[0], nota: dia.nota });
    }
  });
  
  // Construir texto compacto
  let texto = '';
  const mesesOrdenados = Object.keys(diasPorMes);
  
  mesesOrdenados.forEach((mes, indice) => {
    const dias = diasPorMes[mes];
    
    // Convertir días de texto a número para agrupar
    const diasNumericos = dias.map((d: any) => {
      // Convertir día en texto a número
      const diaNumeros: {[key: string]: number} = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
        'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
      };
      
      const numero = typeof d.dia === 'string' ? (diaNumeros[d.dia] || parseInt(d.dia)) : d.dia;
      return { numero: numero, superindice: d.nota ? d.nota.toString() : '' };
    });
    
    // Agrupar días consecutivos
    const gruposAgrupados = agruparDiasConsecutivos(diasNumericos);
    
    // Convertir los números de vuelta a texto en español
    const numeroATextoMap: {[key: number]: string} = {
      1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
      11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
      21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco', 26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta', 31: 'treinta y uno'
    };
    
    // Convertir los grupos agrupados de vuelta a texto
    const gruposEnTexto = gruposAgrupados.map(grupo => {
      // Extraer todas las partes del grupo
      const partes = [];
      let resto = grupo;
      
      // Buscar patrones como "16<sup>1</sup> y 17<sup>1</sup>" o "27 a 29<sup>2</sup>"
      while (resto.length > 0) {
        // Buscar número seguido opcionalmente de superíndice
        const match = resto.match(/^(\d+)(<sup>\d+<\/sup>)?(.*)$/);
        if (match) {
          const numero = match[1];
          const superindice = match[2] || '';
          resto = match[3];
          
          // Convertir número a texto
          const textoNumero = numeroATextoMap[parseInt(numero)] || numero;
          partes.push(textoNumero + superindice);
          
          // Buscar conectores
          const conectorMatch = resto.match(/^(\s+(y|a)\s+)(.*)$/);
          if (conectorMatch) {
            partes.push(conectorMatch[1]);
            resto = conectorMatch[3];
          }
        } else {
          // Si no hay más números, terminar
          break;
        }
      }
      
      return partes.join('');
    });
    
    const diasTexto = unirConY(gruposEnTexto);
    
    if (indice > 0) {
      texto += indice === mesesOrdenados.length - 1 ? ' y ' : ', ';
    }
    texto += `${diasTexto} de ${mes}`;
  });
  
  return { texto, notas };
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
    tipoRecurso: 'principal',
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
    
    // Validar que se haya seleccionado un tipo de fecha
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
    
    setCalculando(true);
    
    setTimeout(() => {
      // Para recursos de reclamación, el plazo siempre es 3 días
      const plazo = 3;
      const fundamento = 'artículo 104, párrafo segundo, de la Ley de Amparo';
      
      let fechaInicio;
      let usandoFechaConocimiento = false;
      let fechaSurte;
      let textoSurte = '';
      let fundamentoSurte = '';
      let fechaReferencia: Date;
      
      if (formData.fechaConocimiento) {
        // Si hay fecha de conocimiento, usar esa fecha
        const fechaConocimiento = new Date(formData.fechaConocimiento + 'T12:00:00');
        fechaReferencia = fechaConocimiento;
        // El plazo inicia al día siguiente de la fecha de conocimiento
        fechaInicio = siguienteDiaHabil(fechaConocimiento, diasAdicionales, tipoUsuario);
        usandoFechaConocimiento = true;
      } else {
        // Usar la lógica normal con fecha de notificación
        const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        fechaReferencia = fechaNotif;
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
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales, tipoUsuario);
      
      // Para litigantes, no evaluamos la oportunidad
      let esOportuno = true;
      let fechaPres = null;
      
      if (tipoUsuario === 'servidor' && formData.fechaPresentacion) {
        fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
        esOportuno = fechaPres <= fechaFin;
      }
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesTextoInfo = obtenerDiasInhabilesParaTexto(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesNumericoInfo = obtenerDiasInhabilesConNotas(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, 'litigante');
      const diasInhabilesDetallesInfo = generarTextoDiasInhabilesDetalles(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesResolucionInfo = generarTextoDiasInhabilesResolucion(fechaReferencia, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      
      // Mapeos para el texto generado
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
        'correo': 'del sobre que obra en el toca en que se actúa',
        'momento': 'de la constancia de notificación que obra en el juicio de amparo',
        'electronica': 'de la evidencia criptográfica del escrito que lo contiene'
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
        diasInhabilesNumerico: diasInhabilesNumericoInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        notasAlPieTexto: diasInhabilesTextoInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: numeroATexto(plazo),
        diasInhabilesDetalles: diasInhabilesDetallesInfo.texto,
        diasInhabilesDetallesNotas: diasInhabilesDetallesInfo.notas,
        diasInhabilesResolucion: diasInhabilesResolucionInfo.texto,
        diasInhabilesResolucionNotas: diasInhabilesResolucionInfo.notas
      });
      
      setCalculando(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
            calculadora: 'recurso-de-reclamacion'
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
      tipoRecurso: formData.tipoRecurso,
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
    
    // Determinar si se presentó antes del inicio del cómputo
    const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
    const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
    
    // Usar el texto de días inhábiles formateado para resolución
    let textoInhabilesSimplificado = '';
    if (resultado.diasInhabilesResolucion && resultado.diasInhabilesResolucion.trim() !== '') {
      textoInhabilesSimplificado = `, con exclusión de los días inhábiles ${resultado.diasInhabilesResolucion}`;
    }
    
    // Extraer solo día de las fechas intermedias
    const diaInicio = resultado.fechaInicioTexto.split(' de ')[0];
    const diaFin = resultado.fechaFinTexto.split(' de ')[0];
    
    // Simplificar fecha de surte efectos para que solo muestre el día
    const diaSurte = resultado.fechaSurteEfectosTexto.split(' de ')[0];
    
    let texto: string;
    
    if (resultado.usandoFechaConocimiento) {
      // Texto específico para cuando se usa fecha de conocimiento
      texto = `La presentación del recurso de reclamación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, toda vez que ${generoRecurrente}, ${parteTexto}, manifestó tener conocimiento del acuerdo impugnado el ${resultado.fechaConocimientoTexto}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el ${resultado.fundamento}, transcurrió del ${diaInicio} al ${diaFin} de esos mes y año${textoInhabilesSimplificado}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    } else {
      // Texto original para fecha de notificación
      texto = `La presentación del recurso de reclamación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación del acuerdo impugnado se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${diaSurte} siguiente, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el ${resultado.fundamento}, transcurrió del ${diaInicio} al ${diaFin} de esos mes y año${textoInhabilesSimplificado}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    }

    // Agregar jurisprudencia si se presentó antes del cómputo
    if (antesDelComputo && resultado.esOportuno) {
      texto += `

Al respecto, resulta aplicable la jurisprudencia 2a./J. 1/2016 (10a.), sustentada por la Segunda Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:
"RECURSO DE RECLAMACIÓN. NO ES EXTEMPORÁNEO EL INTERPUESTO ANTES DE QUE INICIE EL TÉRMINO LEGAL RESPECTIVO. Conforme al segundo párrafo del artículo 104 de la Ley de Amparo, el recurso de reclamación podrá interponerse dentro del término de 3 días siguientes al en que surta efectos la notificación del acuerdo de trámite impugnado; de su texto se advierte que el medio de impugnación no podrá interponerse con posterioridad a esa temporalidad, sin embargo, ello no impide que pueda presentarse antes de que inicie el término indicado, y el así interpuesto, se estime que no es extemporáneo."`;
    }
    
    // Agregar notas al pie si existen
    const todasLasNotas = [];
    
    // Primero agregar las notas de días inhábiles de resolución
    if (resultado.diasInhabilesResolucionNotas && resultado.diasInhabilesResolucionNotas.length > 0) {
      todasLasNotas.push(...resultado.diasInhabilesResolucionNotas);
    }
    
    // Luego agregar otras notas si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      todasLasNotas.push(...resultado.notasAlPieTexto);
    }
    
    if (todasLasNotas.length > 0) {
      texto += '\n\n__________________________________\n';
      const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
      todasLasNotas.forEach((nota: string, index: number) => {
        const superindice = index < 9 ? superindices[index] : `(${index + 1})`;
        texto += `${superindice} ${nota}\n`;
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
    
    // Determinar si se presentó antes del inicio del cómputo
    const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
    const antesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
    
    // Usar el texto de días inhábiles formateado para resolución
    let textoInhabilesSimplificado = '';
    if (resultado.diasInhabilesResolucion && resultado.diasInhabilesResolucion.trim() !== '') {
      textoInhabilesSimplificado = `, con exclusión de los días inhábiles ${resultado.diasInhabilesResolucion}`;
    }
    
    // Extraer solo día de las fechas intermedias
    const diaInicio = resultado.fechaInicioTexto.split(' de ')[0];
    const diaFin = resultado.fechaFinTexto.split(' de ')[0];
    
    // Simplificar fecha de surte efectos para que solo muestre el día
    const diaSurte = resultado.fechaSurteEfectosTexto.split(' de ')[0];
    
    let textoHTML: string;
    
    if (resultado.usandoFechaConocimiento) {
      // Texto específico para cuando se usa fecha de conocimiento
      textoHTML = `<p style="text-indent: 2em; margin-bottom: 1em;">La presentación del recurso de reclamación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, toda vez que ${generoRecurrente}, ${parteTexto}, manifestó tener conocimiento del acuerdo impugnado el ${resultado.fechaConocimientoTexto}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el ${resultado.fundamento}, transcurrió del ${diaInicio} al ${diaFin} de esos mes y año${textoInhabilesSimplificado}.</p>`;
    } else {
      // Texto original para fecha de notificación
      textoHTML = `<p style="text-indent: 2em; margin-bottom: 1em;">La presentación del recurso de reclamación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación del acuerdo impugnado se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, el ${resultado.fechaNotificacionTexto}, y surtió efectos el ${diaSurte} siguiente, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el ${resultado.fundamento}, transcurrió del ${diaInicio} al ${diaFin} de esos mes y año${textoInhabilesSimplificado}.</p>`;
    }

    textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.</p>`;

    // Agregar jurisprudencia si se presentó antes del cómputo
    if (antesDelComputo && resultado.esOportuno) {
      // Calcular el número de nota para la jurisprudencia (siguiente número después de las notas existentes)
      const numeroNota = (resultado.notasAlPieTexto ? resultado.notasAlPieTexto.length : 0) + 1;
      
      textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;">Al respecto, resulta aplicable la jurisprudencia 2a./J. 1/2016 (10a.)<sup style="font-size: 0.6em;">${numeroNota}</sup>, sustentada por la Segunda Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:</p>`;
      
      textoHTML += `<p style="text-indent: 2em; margin-bottom: 1em;"><strong>"RECURSO DE RECLAMACIÓN. NO ES EXTEMPORÁNEO EL INTERPUESTO ANTES DE QUE INICIE EL TÉRMINO LEGAL RESPECTIVO.</strong> Conforme al segundo párrafo del artículo 104 de la Ley de Amparo, el recurso de reclamación podrá interponerse dentro del término de 3 días siguientes al en que surta efectos la notificación del acuerdo de trámite impugnado; de su texto se advierte que el medio de impugnación no podrá interponerse con posterioridad a esa temporalidad, sin embargo, ello no impide que pueda presentarse antes de que inicie el término indicado, y el así interpuesto, se estime que no es extemporáneo."</p>`;
    }
    
    // Agregar notas al pie si existen
    const todasLasNotas = [];
    const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    
    // Primero agregar las notas de días inhábiles de resolución
    if (resultado.diasInhabilesResolucionNotas && resultado.diasInhabilesResolucionNotas.length > 0) {
      todasLasNotas.push(...resultado.diasInhabilesResolucionNotas);
    }
    
    // Luego agregar otras notas si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      todasLasNotas.push(...resultado.notasAlPieTexto);
    }
    
    // Agregar nota de jurisprudencia si aplica
    let notaJurisprudencia = null;
    if (antesDelComputo && resultado.esOportuno) {
      notaJurisprudencia = 'Registro digital: 2010779. Décima Época. Gaceta del Semanario Judicial de la Federación. Libro 26, Enero de 2016, Tomo II, página 1430.';
    }
    
    if (todasLasNotas.length > 0 || notaJurisprudencia) {
      textoHTML += '<div style="border-top: 1px solid #ccc; margin-top: 1.5em; padding-top: 0.5em;">';
      
      todasLasNotas.forEach((nota: string, index: number) => {
        const superindice = index < 9 ? superindices[index] : `(${index + 1})`;
        textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;"><sup style="font-size: 0.6em;">${superindice}</sup> ${nota}</p>`;
      });
      
      if (notaJurisprudencia) {
        const numeroNota = todasLasNotas.length;
        const superindice = numeroNota < 9 ? superindices[numeroNota] : `(${numeroNota + 1})`;
        textoHTML += `<p style="font-size: 0.9em; margin-bottom: 0.5em;"><sup style="font-size: 0.6em;">${superindice}</sup> ${notaJurisprudencia}</p>`;
      }
      
      textoHTML += '</div>';
    }
    
    return textoHTML;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .texto-resolucion sup {
          font-size: 0.6em;
          vertical-align: super;
          line-height: 0;
        }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Source+Code+Pro:wght@400;500&display=swap');
      `}</style>
      <nav className="k-law-nav" style={{ backgroundColor: '#1A1A2E', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <img src="/mnt/c/Users/Neo 14/Desktop/Logo.jpg" alt="K-LAW Logo" style={{ height: '48px', width: 'auto', filter: 'brightness(1.1)' }} />
              </Link>
              <span className="k-law-badge" style={{ backgroundColor: '#c9a961', color: '#1A1A2E', fontWeight: '600', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
              </span>
            </div>
            <Link href="/calculadoras" className="text-sm px-4 py-2" style={{ backgroundColor: 'transparent', color: '#FFFFFF', border: '1px solid #c9a961', borderRadius: '6px', transition: 'all 0.3s ease', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c9a961'; e.currentTarget.style.color = '#1A1A2E'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}>
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="k-law-title" style={{ color: '#1A1A2E', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>
            Recurso de Reclamación
          </h1>
          <p style={{ color: '#666', fontSize: '1.125rem', fontFamily: 'Inter, sans-serif' }}>Sistema profesional de cálculo de plazos legales</p>
        </div>
        
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="k-law-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 20px rgba(26, 26, 46, 0.08)', padding: '2.5rem', border: '1px solid #f0f0f0' }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Tipo de Recurso</label>
                  <input 
                    type="text" 
                    value="Reclamación" 
                    readOnly 
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#666', backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} 
                    suppressHydrationWarning={true}
                  />
                </div>
                
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Parte Recurrente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} className="k-law-select" style={{ borderColor: '#E0E0E0', borderRadius: '12px', fontSize: '0.95rem', transition: 'border-color 0.3s ease', backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', color: '#333333', width: '100%', padding: '0.75rem' }} onFocus={(e) => e.currentTarget.style.borderColor = '#c9a961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} required suppressHydrationWarning={true}>
                    <option value="">Seleccione...</option>
                    <option value="autoridad">Autoridad responsable</option>
                    <option value="quejoso">Quejoso</option>
                    <option value="tercero">Tercero interesado</option>
                    <option value="autoridad-tercero">Autoridad tercero interesada</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="k-law-label block mb-4" style={{ color: '#0A1628', fontWeight: '700', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>Seleccione el tipo de fecha:</label>
                  <div className="space-y-4">
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s ease' }}>
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
                          style={{ accentColor: '#0A1628' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#0A1628', fontWeight: '500' }}>
                          Fecha de Notificación
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campos de notificación justo después de seleccionar esa opción */}
                    {tipoFecha === 'notificacion' && (
                      <div className="ml-8 space-y-4" style={{ backgroundColor: '#F5F5F5', padding: '1.5rem', borderRadius: '12px', border: '2px solid #C9A961' }}>
                        <div>
                          <input 
                            type="date" 
                            name="fechaNotificacion" 
                            value={formData.fechaNotificacion} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.borderColor = '#C9A961'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required 
                          />
                        </div>
                        
                        {formData.fechaNotificacion && (
                          <div>
                            <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                            <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} className="k-law-select" style={{ borderColor: '#E0E0E0', borderRadius: '12px', fontSize: '0.95rem', transition: 'border-color 0.3s ease', backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', color: '#333333', width: '100%', padding: '0.75rem' }} onFocus={(e) => e.currentTarget.style.borderColor = '#c9a961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} required suppressHydrationWarning={true}>
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
                      border: '2px solid #e5e7eb', 
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
                          style={{ accentColor: '#0A1628' }}
                        />
                        <span style={{ fontFamily: 'Inter, sans-serif', color: tipoFecha === 'notificacion' ? '#999' : '#0A1628', fontWeight: '500' }}>
                          Fecha de conocimiento
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campo de conocimiento */}
                    {tipoFecha === 'conocimiento' && (
                      <div className="ml-8" style={{ backgroundColor: '#F5F5F5', padding: '1.5rem', borderRadius: '12px', border: '2px solid #C9A961' }}>
                        <div>
                          <input 
                            type="date" 
                            name="fechaConocimiento" 
                            value={formData.fechaConocimiento} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }}
                            onFocus={(e) => e.target.style.borderColor = '#C9A961'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required 
                          />
                          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem', fontFamily: 'Inter, sans-serif' }}>Si se usa esta fecha, el plazo iniciará al día siguiente de la misma</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Presentación</label>
                      <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#c9a961'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} required={tipoUsuario === 'servidor'} />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Presentación</label>
                      <select name="formaPresentacion" value={formData.formaPresentacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease', cursor: 'pointer' }} onFocus={(e) => e.target.style.borderColor = '#c9a961'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} required={tipoUsuario === 'servidor'}>
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
                <button type="submit" disabled={calculando} className="w-full" style={{ backgroundColor: calculando ? '#B0B0B0' : '#1A1A2E', color: '#FFFFFF', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', transition: 'all 0.3s ease', cursor: calculando ? 'not-allowed' : 'pointer', border: 'none', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.2)', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { if (!calculando) { e.currentTarget.style.backgroundColor = '#c9a961'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 169, 97, 0.3)'; } }} onMouseLeave={(e) => { if (!calculando) { e.currentTarget.style.backgroundColor = '#1A1A2E'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 26, 46, 0.2)'; } }} suppressHydrationWarning={true}>
                  {calculando ? 'Calculando...' : 'Calcular Plazo'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="k-law-card" style={{ backgroundColor: '#f8f9fa', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e5e7eb' }}>
              <h3 className="k-law-subtitle" style={{ color: '#1A1A2E', fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Montserrat, sans-serif', marginBottom: '1rem' }}>Días Inhábiles Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Agregar día inhábil</label>
                  <div className="flex gap-2">
                    <input type="date" value={nuevoDiaInhabil} onChange={(e) => setNuevoDiaInhabil(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#c9a961'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                    <button type="button" onClick={agregarDiaInhabil} style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c9a961'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1A1A2E'; }}>
                      Agregar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" className="w-full p-2 border rounded-lg text-sm" />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                          <span>{tipoUsuario === 'litigante' ? fechaParaLitigante(dia) : fechaATexto(dia)}</span>
                          <button type="button" onClick={() => setDiasAdicionales(diasAdicionales.filter(d => d !== dia))} className="text-red-600 hover:text-red-800">
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
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
              
              <div style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', background: resultado.esOportuno ? 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: `1px solid ${resultado.esOportuno ? '#86efac' : '#fde047'}` }}>
                {tipoUsuario === 'servidor' ? (
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#333333' }}>
                    El recurso se presentó de forma: {' '}
                    <span style={{ color: resultado.esOportuno ? '#16a34a' : '#dc2626' }}>
                      {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                    </span>
                  </p>
                ) : (
                  <div>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#333333' }}>
                      El plazo para presentar el recurso vence el: {' '}
                      <span style={{ color: '#16a34a' }}>
                        {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}
                      </span>
                    </p>
                    {resultado.diasRestantes > 0 && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666666' }}>
                        Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                      </p>
                    )}
                    {resultado.diasRestantes === 0 && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626', fontWeight: 'bold' }}>
                        ⚠️ El plazo ha vencido
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Detalles del Cómputo:</h3>
                <div className="space-y-1 text-sm">
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
                  <p className="texto-resolucion"><strong>Días inhábiles excluidos:</strong> {resultado.diasInhabilesDetalles || 'Ninguno'}</p>
                </div>
                
                {/* Notas al pie para Detalles del Cómputo */}
                {resultado.diasInhabilesDetallesNotas && resultado.diasInhabilesDetallesNotas.length > 0 && (
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                    {resultado.diasInhabilesDetallesNotas.map((nota: string, index: number) => {
                      const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
                      const superindice = index < 9 ? superindices[index] : `(${index + 1})`;
                      return (
                        <p key={index} style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                          <sup>{superindice}</sup> {nota}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Calendario visual - solo para servidores */}
              {tipoUsuario === 'servidor' && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold text-lg mb-4">Calendario Visual del Cómputo</h3>
                  
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
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h3 className="font-bold mb-2">Texto para Resolución:</h3>
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
                    <button onClick={copiarCalendario} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Copiar calendario
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Copiar texto
                    </button>
                  </>
                )}
                <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', parteRecurrente: '', fechaNotificacion: '', fechaConocimiento: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); setTipoFecha(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Sección para litigantes */}
            {tipoUsuario === 'litigante' && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Guardar Cálculo y Notificaciones</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Número de Expediente</label>
                    <input 
                      type="text" 
                      value={numeroExpediente} 
                      onChange={(e) => setNumeroExpediente(e.target.value)}
                      placeholder="Ej: 123/2024"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp (opcional)</label>
                    <input 
                      type="tel" 
                      value={telefonoWhatsApp} 
                      onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                      placeholder="Ej: +52 1234567890"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={guardarCalculo}
                  disabled={!numeroExpediente}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
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
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Cálculos Guardados</h3>
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