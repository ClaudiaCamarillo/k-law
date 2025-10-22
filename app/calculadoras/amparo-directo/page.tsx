'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { getCuandoSurteEfectos, calcularFechaSurteEfectos, getFundamentoSurtimientoEfectos } from '../../../lib/articulo31LeyAmparo.js'
import { SelectorLeyNotificacion } from '@/components/SelectorLeyNotificacion'

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
  const numeros = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta'];
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

// Función para calcular el plazo sin excluir días inhábiles (para casos penales con pena de prisión)
function calcularPlazoSinExcluirInhabiles(fechaInicio: Date, dias: number): Date {
  let fecha = new Date(fechaInicio);
  fecha.setDate(fecha.getDate() + dias - 1); // -1 porque el día de inicio cuenta
  return fecha;
}

// Función para calcular el plazo para leyes por entrada en vigor (artículo 18)
function calcularPlazoLeyEntradaVigor(fechaEntrada: Date, dias: number, diasAdicionales: string[] = [], tipoUsuario: string = 'litigante'): Date {
  let fecha = new Date(fechaEntrada);
  let diasHabiles = 0; // Para leyes por entrada en vigor, empezamos en 0 y contamos el primer día
  
  // Contar días hábiles incluyendo la fecha de entrada en vigor
  while (diasHabiles < dias) {
    if (!esDiaInhabil(fecha, diasAdicionales, tipoUsuario)) {
      diasHabiles++;
    }
    if (diasHabiles < dias) {
      fecha.setDate(fecha.getDate() + 1);
    }
  }
  
  return fecha;
}

// Función para agrupar días consecutivos
// Función para agrupar días consecutivos con formato numérico (para detalles de cómputo)
function agruparDiasConsecutivos(dias: string[]): string {
  if (dias.length === 0) return '';
  
  // Función auxiliar para convertir texto de números a números
  const textoANumero = (texto: string): number => {
    const numeros: {[key: string]: number} = {
      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
    };
    return numeros[texto] || parseInt(texto) || 0;
  };
  
  // Función auxiliar para convertir números a texto
  const numeroATexto = (num: number): string => {
    const textos: {[key: number]: string} = {
      1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
      11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
      21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco', 26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta', 31: 'treinta y uno'
    };
    return textos[num] || num.toString();
  };
  
  // Ordenar las fechas
  const fechasOrdenadas = dias.sort((a, b) => {
    const partesA = a.split(' de ');
    const partesB = b.split(' de ');
    const diaA = textoANumero(partesA[0]);
    const diaB = textoANumero(partesB[0]);
    const mesA = partesA[1];
    const mesB = partesB[1];
    const anoA = partesA[2];
    const anoB = partesB[2];
    
    // Comparar por año, mes y día
    if (anoA !== anoB) return anoA.localeCompare(anoB);
    if (mesA !== mesB) return mesA.localeCompare(mesB);
    return diaA - diaB;
  });
  
  // Agrupar por mes y año
  const diasPorMes: {[key: string]: number[]} = {};
  fechasOrdenadas.forEach(fechaTexto => {
    const partes = fechaTexto.split(' de ');
    const dia = textoANumero(partes[0]);
    const mes = partes[1];
    const año = partes[2];
    const claveMes = `${mes} de ${año}`;
    
    if (!diasPorMes[claveMes]) {
      diasPorMes[claveMes] = [];
    }
    diasPorMes[claveMes].push(dia);
  });
  
  // Crear rangos consecutivos por mes
  const rangosTexto: string[] = [];
  Object.keys(diasPorMes).forEach(mes => {
    const diasDelMes = diasPorMes[mes].sort((a, b) => a - b);
    const rangos: string[] = [];
    
    let inicio = diasDelMes[0];
    let fin = diasDelMes[0];
    
    for (let i = 1; i < diasDelMes.length; i++) {
      if (diasDelMes[i] === fin + 1) {
        fin = diasDelMes[i];
      } else {
        // Terminar el rango actual
        if (inicio === fin) {
          rangos.push(inicio.toString());
        } else if (fin === inicio + 1) {
          rangos.push(`${inicio} y ${fin}`);
        } else {
          rangos.push(`${inicio} a ${fin}`);
        }
        inicio = diasDelMes[i];
        fin = diasDelMes[i];
      }
    }
    
    // Agregar el último rango
    if (inicio === fin) {
      rangos.push(inicio.toString());
    } else if (fin === inicio + 1) {
      rangos.push(`${inicio} y ${fin}`);
    } else {
      rangos.push(`${inicio} a ${fin}`);
    }
    
    // Formatear el texto final para este mes
    if (rangos.length === 1) {
      rangosTexto.push(`${rangos[0]} de ${mes}`);
    } else if (rangos.length === 2) {
      rangosTexto.push(`${rangos[0]} y ${rangos[1]} de ${mes}`);
    } else {
      const ultimoRango = rangos.pop();
      rangosTexto.push(`${rangos.join(', ')} y ${ultimoRango} de ${mes}`);
    }
  });
  
  if (rangosTexto.length === 1) {
    return rangosTexto[0];
  } else if (rangosTexto.length === 2) {
    return rangosTexto.join(' y ');
  } else {
    const ultimaParte = rangosTexto.pop();
    return rangosTexto.join(', ') + ' y ' + ultimaParte;
  }
}

// Función para agrupar días consecutivos con superíndices
function agruparDiasConSuperindices(diasConSuperindices: string[]): string {
  if (diasConSuperindices.length === 1) {
    return diasConSuperindices[0];
  } else if (diasConSuperindices.length === 2) {
    return `${diasConSuperindices[0]} y ${diasConSuperindices[1]}`;
  } else {
    const ultimoDia = diasConSuperindices.pop();
    return `${diasConSuperindices.join(', ')} y ${ultimoDia}`;
  }
}

// Función para agrupar días consecutivos con formato de texto (para resoluciones)
function agruparDiasConsecutivosTexto(dias: string[]): string {
  if (dias.length === 0) return '';
  
  // Función auxiliar para convertir texto de números a números
  const textoANumero = (texto: string): number => {
    const numeros: {[key: string]: number} = {
      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
    };
    return numeros[texto] || parseInt(texto) || 0;
  };
  
  // Función auxiliar para convertir números a texto
  const numeroATexto = (num: number): string => {
    const textos: {[key: number]: string} = {
      1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
      11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
      21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco', 26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta', 31: 'treinta y uno'
    };
    return textos[num] || num.toString();
  };
  
  // Ordenar las fechas
  const fechasOrdenadas = dias.sort((a, b) => {
    const partesA = a.split(' de ');
    const partesB = b.split(' de ');
    const diaA = textoANumero(partesA[0]);
    const diaB = textoANumero(partesB[0]);
    const mesA = partesA[1];
    const mesB = partesB[1];
    const anoA = partesA[2];
    const anoB = partesB[2];
    
    // Comparar por año, mes y día
    if (anoA !== anoB) return anoA.localeCompare(anoB);
    if (mesA !== mesB) return mesA.localeCompare(mesB);
    return diaA - diaB;
  });
  
  // Agrupar por mes y año
  const diasPorMes: {[key: string]: number[]} = {};
  
  fechasOrdenadas.forEach(fecha => {
    const partes = fecha.split(' de ');
    const dia = textoANumero(partes[0]);
    const mes = partes[1];
    const ano = partes[2];
    const clave = `${mes} de ${ano}`;
    
    if (!diasPorMes[clave]) {
      diasPorMes[clave] = [];
    }
    diasPorMes[clave].push(dia);
  });
  
  const rangosTexto: string[] = [];
  
  Object.keys(diasPorMes).forEach(mes => {
    const diasDelMes = diasPorMes[mes].sort((a, b) => a - b);
    const rangos: string[] = [];
    
    let inicio = diasDelMes[0];
    let fin = diasDelMes[0];
    
    for (let i = 1; i < diasDelMes.length; i++) {
      if (diasDelMes[i] === fin + 1) {
        fin = diasDelMes[i];
      } else {
        // Terminar el rango actual
        if (inicio === fin) {
          rangos.push(numeroATexto(inicio));
        } else if (fin === inicio + 1) {
          rangos.push(numeroATexto(inicio));
          rangos.push(numeroATexto(fin));
        } else {
          rangos.push(`${numeroATexto(inicio)} al ${numeroATexto(fin)}`);
        }
        inicio = diasDelMes[i];
        fin = diasDelMes[i];
      }
    }
    
    // Agregar el último rango
    if (inicio === fin) {
      rangos.push(numeroATexto(inicio));
    } else if (fin === inicio + 1) {
      rangos.push(numeroATexto(inicio));
      rangos.push(numeroATexto(fin));
    } else {
      rangos.push(`${numeroATexto(inicio)} a ${numeroATexto(fin)}`);
    }
    
    // Formatear el texto final para este mes
    if (rangos.length === 1) {
      rangosTexto.push(`${rangos[0]} de ${mes}`);
    } else if (rangos.length === 2) {
      rangosTexto.push(`${rangos[0]} y ${rangos[1]} de ${mes}`);
    } else {
      const ultimoRango = rangos.pop();
      rangosTexto.push(`${rangos.join(', ')} y ${ultimoRango} de ${mes}`);
    }
  });
  
  if (rangosTexto.length === 1) {
    return rangosTexto[0];
  } else if (rangosTexto.length === 2) {
    return rangosTexto.join(' y ');
  } else {
    const ultimaParte = rangosTexto.pop();
    return rangosTexto.join(', ') + ' y ' + ultimaParte;
  }
}

// Función para obtener días inhábiles con formato simplificado para detalles
function obtenerDiasInhabilesSimplificado(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante') {
  const diasPorFundamento: {[key: string]: string[]} = {};
  const diasYaIncluidos = new Set<string>();
  let hayFinDeSemana = false;
  
  // Obtener meses que realmente tienen sábados/domingos en el período
  const mesesConFinDeSemana = new Set<string>();
  
  const fecha = new Date(inicio);
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    const año = fecha.getFullYear();
    
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      hayFinDeSemana = true;
      // Agregar mes con fin de semana
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const mesTexto = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      mesesConFinDeSemana.add(`${mesTexto} de ${año}`);
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const fechaObj = new Date(fechaStr + 'T12:00:00');
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth();
        const año = fechaObj.getFullYear();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(fechaATexto(fechaStr));
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
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          const fechaObj = new Date(fechaStr + 'T12:00:00');
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth();
        const año = fechaObj.getFullYear();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
          diasPorFundamento[diaMovilInfo.fundamento].push(diaTexto);
          diasYaIncluidos.add(fechaATexto(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        const fechaObj = new Date(fechaStr + 'T12:00:00');
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth();
        const año = fechaObj.getFullYear();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
        diasPorFundamento[fundamento].push(diaTexto);
        diasYaIncluidos.add(fechaATexto(fechaStr));
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir el texto simplificado
  let partes: string[] = [];
  
  // Agregar sábados y domingos si hay - solo los del período de cómputo
  if (hayFinDeSemana) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    if (inicio.getFullYear() === fin.getFullYear()) {
      if (inicio.getMonth() === fin.getMonth()) {
        // Mismo mes: "todos los sábados y domingos incluidos entre el 10 y el 25 de febrero de 2025"
        partes.push(`todos los sábados y domingos¹ incluidos entre el ${inicio.getDate()} y el ${fin.getDate()} de ${meses[inicio.getMonth()]} de ${inicio.getFullYear()}`);
      } else {
        // Diferente mes, mismo año: "todos los sábados y domingos incluidos entre el 10 de febrero y el 25 de marzo de 2025"
        partes.push(`todos los sábados y domingos¹ incluidos entre el ${inicio.getDate()} de ${meses[inicio.getMonth()]} y el ${fin.getDate()} de ${meses[fin.getMonth()]} de ${inicio.getFullYear()}`);
      }
    } else {
      // Diferente año
      partes.push(`todos los sábados y domingos¹ incluidos entre el ${inicio.getDate()} de ${meses[inicio.getMonth()]} de ${inicio.getFullYear()} y el ${fin.getDate()} de ${meses[fin.getMonth()]} de ${fin.getFullYear()}`);
    }
  }
  
  // Agregar otros días agrupados
  const ordenFundamentos = [
    'artículo 19 de la Ley de Amparo',
    'artículo 74 de la Ley Federal del Trabajo',
    'Ley Orgánica',
    'Circular',
    'Acuerdo',
    'usuario'
  ];
  
  // Recopilar todos los días no-weekend y ordenarlos cronológicamente
  const todosLosDiasNoWeekend: {fecha: string, fundamento: string}[] = [];
  
  Object.keys(diasPorFundamento).forEach(fundamento => {
    const dias = diasPorFundamento[fundamento];
    if (dias && dias.length > 0) {
      dias.forEach(dia => {
        // Convertir "17 de marzo de 2025" a fecha para ordenar
        const partesFecha = dia.split(' de ');
        if (partesFecha.length === 3) {
          const diaNum = parseInt(partesFecha[0]);
          const mesNombre = partesFecha[1];
          const año = parseInt(partesFecha[2]);
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const mesNum = meses.indexOf(mesNombre);
          const fechaObj = new Date(año, mesNum, diaNum);
          
          todosLosDiasNoWeekend.push({
            fecha: dia,
            fundamento: fundamento
          });
        }
      });
    }
  });
  
  // Ordenar cronológicamente
  todosLosDiasNoWeekend.sort((a, b) => {
    const fechaA = a.fecha.split(' de ');
    const fechaB = b.fecha.split(' de ');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const añoA = parseInt(fechaA[2]);
    const añoB = parseInt(fechaB[2]);
    const mesA = meses.indexOf(fechaA[1]);
    const mesB = meses.indexOf(fechaB[1]);
    const diaA = parseInt(fechaA[0]);
    const diaB = parseInt(fechaB[0]);
    
    if (añoA !== añoB) return añoA - añoB;
    if (mesA !== mesB) return mesA - mesB;
    return diaA - diaB;
  });
  
  // Agrupar días por mes/año + fundamento para simplificar redacción con superíndices
  const diasPorMesAñoFundamento: {[key: string]: {fechas: string[], fundamento: string, mesAño: string}} = {};
  
  console.log('Debug - todosLosDiasNoWeekend:', todosLosDiasNoWeekend);
  todosLosDiasNoWeekend.forEach(item => {
    const partes = item.fecha.split(' de ');
    if (partes.length === 3) {
      const dia = partes[0];
      const mes = partes[1];
      const año = partes[2];
      const mesAño = `${mes} de ${año}`;
      const claveGrupo = `${mesAño} - ${item.fundamento}`;
      
      if (!diasPorMesAñoFundamento[claveGrupo]) {
        diasPorMesAñoFundamento[claveGrupo] = {fechas: [], fundamento: item.fundamento, mesAño: mesAño};
      }
      diasPorMesAñoFundamento[claveGrupo].fechas.push(dia);
    }
  });
  
  console.log('Debug - diasPorMesAñoFundamento:', diasPorMesAñoFundamento);
  
  // Generar texto agrupado con superíndices para detalles
  const partesOtrosDias: string[] = [];
  const notasAlPie: string[] = [];
  const fundamentosYaUsados: {[key: string]: string} = {}; // Mapeo de fundamento a superíndice
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Agregar nota para sábados y domingos si hay fin de semana
  if (hayFinDeSemana) {
    const fundamentoWeekend = 'artículo 19 de la Ley de Amparo';
    const superindiceWeekend = superindices[0];
    fundamentosYaUsados[fundamentoWeekend] = superindiceWeekend;
    notasAlPie.push(`${superindiceWeekend} ${fundamentoWeekend}`);
    numeroNota++;
  }
  
  Object.keys(diasPorMesAñoFundamento).forEach(claveGrupo => {
    const grupo = diasPorMesAñoFundamento[claveGrupo];
    console.log('Debug - procesando grupo:', claveGrupo, grupo);
    
    // Debug: mostrar información del grupo
    console.log(`Debug - mesAño: ${grupo.mesAño}, fundamento: ${grupo.fundamento}, fechas: ${grupo.fechas.join(', ')}`);
    
    // Con el nuevo agrupamiento por fundamento, todos los días ya tienen el mismo fundamento
    const fundamento = grupo.fundamento;
    let superindiceAUsar = fundamentosYaUsados[fundamento];
    
    if (!superindiceAUsar) {
      // Crear nueva nota
      superindiceAUsar = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
      fundamentosYaUsados[fundamento] = superindiceAUsar;
      notasAlPie.push(`${superindiceAUsar} ${fundamento}`);
      numeroNota++;
    }
    
    // Verificar si son días consecutivos para crear rangos
    console.log('Debug - grupo.fechas:', grupo.fechas, 'fundamento:', grupo.fundamento);
    const diasNumericos = grupo.fechas.map(dia => {
        // dia ya es solo el número como "27", no necesita split
        const textoANumero: {[key: string]: number} = {
          'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
          'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
          'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
          '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
          '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
          '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
        };
        const numero = textoANumero[dia] || 0;
        console.log('Debug - dia:', dia, 'numero:', numero);
        return numero;
      }).sort((a, b) => a - b);
      console.log('Debug - diasNumericos ordenados:', diasNumericos);
      
      let textoFormateado = '';
      if (diasNumericos.length >= 3) {
        // Verificar si son consecutivos (para 3 o más días)
        let sonConsecutivos = true;
        for (let i = 1; i < diasNumericos.length; i++) {
          if (diasNumericos[i] !== diasNumericos[i-1] + 1) {
            sonConsecutivos = false;
            break;
          }
        }
        
        if (sonConsecutivos) {
          // Mostrar como rango: "16 a 31"
          const primerDia = grupo.fechas.find(dia => {
            const textoANumero: {[key: string]: number} = {
              'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
              'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
              'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
              '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
              '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
            };
            return textoANumero[dia] === diasNumericos[0];
          });
          const ultimoDia = grupo.fechas.find(dia => {
            const textoANumero: {[key: string]: number} = {
              'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
              'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
              'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
              '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
              '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
            };
            return textoANumero[dia] === diasNumericos[diasNumericos.length - 1];
          });
          textoFormateado = `${primerDia} a ${ultimoDia}${superindiceAUsar}`;
        } else {
          // No son consecutivos, buscar sub-rangos
          const textoANumero: {[key: string]: number} = {
            'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
            'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
            'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
            '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
          };
          
          // Agrupar en sub-rangos
          const diasOrdenados = [...grupo.fechas].sort((a, b) => (textoANumero[a] || 0) - (textoANumero[b] || 0));
          const grupos: string[] = [];
          let inicio = 0;
          
          while (inicio < diasOrdenados.length) {
            let fin = inicio;
            
            // Encontrar el final del rango consecutivo
            while (fin + 1 < diasOrdenados.length && 
                   textoANumero[diasOrdenados[fin + 1]] === textoANumero[diasOrdenados[fin]] + 1) {
              fin++;
            }
            
            if (fin === inicio) {
              // Día individual
              grupos.push(diasOrdenados[inicio]);
            } else if (fin === inicio + 1) {
              // Dos días consecutivos, mostrar separados
              grupos.push(diasOrdenados[inicio]);
              grupos.push(diasOrdenados[fin]);
            } else {
              // Tres o más días consecutivos, mostrar como rango
              grupos.push(`${diasOrdenados[inicio]} a ${diasOrdenados[fin]}`);
            }
            
            inicio = fin + 1;
          }
          
          if (grupos.length === 1) {
            textoFormateado = `${grupos[0]}${superindiceAUsar}`;
          } else {
            const ultimoGrupo = grupos.pop();
            textoFormateado = `${grupos.join(', ')} y ${ultimoGrupo}${superindiceAUsar}`;
          }
        }
      } else if (diasNumericos.length === 2) {
        // Para dos días, verificar si son consecutivos
        if (diasNumericos[1] === diasNumericos[0] + 1) {
          // Son consecutivos, mostrar como rango
          const primerDia = grupo.fechas.find(dia => {
            const textoANumero: {[key: string]: number} = {
              'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
              'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
              'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
              '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
              '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
            };
            return textoANumero[dia] === diasNumericos[0];
          });
          const ultimoDia = grupo.fechas.find(dia => {
            const textoANumero: {[key: string]: number} = {
              'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
              'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
              'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
              '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
              '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31
            };
            return textoANumero[dia] === diasNumericos[1];
          });
          textoFormateado = `${primerDia} a ${ultimoDia}${superindiceAUsar}`;
        } else {
          // No son consecutivos, mostrar con "y"
          textoFormateado = `${grupo.fechas[0]} y ${grupo.fechas[1]}${superindiceAUsar}`;
        }
      } else {
        textoFormateado = `${grupo.fechas[0]}${superindiceAUsar}`;
      }
      
      // Determinar si usar "del mismo año" o el año completo
      const añoCompleto = grupo.mesAño.includes('de dos mil') ? grupo.mesAño : grupo.mesAño;
      const añoSimplificado = grupo.mesAño.replace(/de dos mil \w+/, 'del mismo año');
      partesOtrosDias.push(`${textoFormateado} de ${añoSimplificado}`);
  });
  
  if (partesOtrosDias.length > 0) {
    let textoOtrosDias;
    if (partesOtrosDias.length === 1) {
      textoOtrosDias = `así como el ${partesOtrosDias[0]}`;
    } else {
      const ultimaParte = partesOtrosDias.pop();
      textoOtrosDias = `así como el ${partesOtrosDias.join(', ')} y el ${ultimaParte}`;
    }
    partes.push(textoOtrosDias);
    
    // Guardar las notas para uso externo
    // (obtenerDiasInhabilesSimplificado as any).notasAlPie = notasAlPie;
  }
  
  if (partes.length === 0) {
    return '';
  } else if (partes.length === 1) {
    return partes[0];
  } else if (partes.length === 2) {
    return partes.join(' y ');
  } else {
    const ultimaParte = partes.pop();
    return partes.join(', ') + ' y ' + ultimaParte;
  }
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
      if (diaFijo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const fechaObj = new Date(fechaStr + 'T12:00:00');
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth();
        const año = fechaObj.getFullYear();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(fechaATexto(fechaStr));
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
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          const fechaObj = new Date(fechaStr + 'T12:00:00');
          const dia = fechaObj.getDate();
          const mes = fechaObj.getMonth();
          const año = fechaObj.getFullYear();
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
          diasPorFundamento[diaMovilInfo.fundamento].push(diaTexto);
          diasYaIncluidos.add(fechaATexto(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        const fechaObj = new Date(fechaStr + 'T12:00:00');
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth();
        const año = fechaObj.getFullYear();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
        diasPorFundamento[fundamento].push(diaTexto);
        diasYaIncluidos.add(fechaATexto(fechaStr));
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const fundamentosYaUsados: {[key: string]: string} = {}; // Mapeo de fundamento a superíndice
  
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
          // Agrupar días del mismo mes
          diasFinales = dias;
          
          // Para litigantes no mostramos superíndices
          if (tipoUsuario === 'litigante') {
            diasTexto = diasTexto.concat(diasFinales);
          } else {
            let superindiceAUsar = fundamentosYaUsados[fundamento];
            
            if (!superindiceAUsar) {
              superindiceAUsar = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
              fundamentosYaUsados[fundamento] = superindiceAUsar;
              notasAlPie.push(`${superindiceAUsar} ${fundamento}`);
              numeroNota++;
            }
            
            diasTexto = diasTexto.concat(diasFinales.map(dia => dia + superindiceAUsar));
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
function obtenerDiasInhabilesParaTexto(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante', fechaNotificacion?: Date) {
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
      const claveConsistente = fechaATexto(fechaStr);
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
        const claveMovil = fechaATexto(fechaStr);
        if (diaMovilInfo && !diasYaIncluidos.has(claveMovil)) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(claveMovil);
          diasYaIncluidos.add(claveMovil);
        }
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
  
  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const fundamentosYaUsados: {[key: string]: string} = {}; // Mapeo de fundamento a superíndice
  
  // Agregar sábados y domingos si hay - especificando cuáles exactamente
  if (hayFinDeSemana) {
    // Obtener todos los sábados y domingos desde el día después de la notificación hasta el fin del período
    const sabadosYDomingos: string[] = [];
    
    // Calcular desde el día después de la notificación
    let fechaDesde: Date;
    if (fechaNotificacion) {
      // Usar la fecha de notificación real más un día
      fechaDesde = new Date(fechaNotificacion);
      fechaDesde.setDate(fechaDesde.getDate() + 1);
    } else {
      // Fallback: usar un día antes del inicio del cómputo
      fechaDesde = new Date(inicio);
      fechaDesde.setDate(fechaDesde.getDate() - 1);
    }
    
    const fechaTemp = new Date(fechaDesde);
    while (fechaTemp <= fin) {
      if (fechaTemp.getDay() === 0 || fechaTemp.getDay() === 6) {
        const fechaStr = fechaTemp.toISOString().split('T')[0];
        const fechaTexto = fechaATexto(fechaStr);
        sabadosYDomingos.push(fechaTexto);
      }
      fechaTemp.setDate(fechaTemp.getDate() + 1);
    }
    
    if (sabadosYDomingos.length > 0) {
      // Separar por mes para mejor formato
      const sabadosYDomingosPorMes: {[key: string]: string[]} = {};
      sabadosYDomingos.forEach(fechaTexto => {
        // Extraer mes de "diez de febrero de dos mil veinticinco"
        const partes = fechaTexto.split(' de ');
        const mes = partes[1]; // "febrero"
        if (!sabadosYDomingosPorMes[mes]) {
          sabadosYDomingosPorMes[mes] = [];
        }
        sabadosYDomingosPorMes[mes].push(fechaTexto);
      });
      
      const mesesConSabDom = Object.keys(sabadosYDomingosPorMes);
      if (mesesConSabDom.length === 1) {
        // Solo un mes
        const primerMes = mesesConSabDom[0];
        const diasDelMes = sabadosYDomingosPorMes[primerMes];
        const diasAgrupados = agruparDiasConsecutivosTexto(diasDelMes);
        const prefijo = diasAgrupados.includes(' al ') ? 'del ' : '';
        diasTexto.push(`${prefijo}${diasAgrupados}, por corresponder a sábados y domingos, inhábiles conforme lo previsto en artículo 19 de la Ley de la Materia`);
      } else {
        // Múltiples meses
        const partesSabDom: string[] = [];
        mesesConSabDom.forEach(mes => {
          const diasDelMes = sabadosYDomingosPorMes[mes];
          
          // Extraer solo los números de día de las fechas completas
          const soloNumerosDias = diasDelMes.map(fechaCompleta => {
            const partes = fechaCompleta.split(' de ');
            return partes[0]; // Solo el día en texto (ej: "diez")
          });
          
          // Agrupar los números de días
          const diasOrdenados = soloNumerosDias.sort((a, b) => {
            const textoANumero = (texto: string): number => {
              const textos: {[key: string]: number} = {
                'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
              };
              return textos[texto] || 0;
            };
            return textoANumero(a) - textoANumero(b);
          });
          
          // Formatear según cantidad de días
          let textoDelMes = '';
          if (diasOrdenados.length === 1) {
            textoDelMes = diasOrdenados[0];
          } else if (diasOrdenados.length === 2) {
            textoDelMes = `${diasOrdenados[0]} y ${diasOrdenados[1]}`;
          } else {
            const ultimoDia = diasOrdenados.pop();
            textoDelMes = `${diasOrdenados.join(', ')} y ${ultimoDia}`;
          }
          
          // Solo agregar mes, sin año (se agrega al final)
          partesSabDom.push(`${textoDelMes} de ${mes}`);
        });
        
        // Unir las partes con "así como" y agregar año al final
        const añoPeriodo = inicio.getFullYear();
        const añoTexto = añoPeriodo === 2024 ? 'dos mil veinticuatro' : añoPeriodo === 2025 ? 'dos mil veinticinco' : `${añoPeriodo}`;
        
        let textoCompleto = '';
        if (partesSabDom.length === 2) {
          textoCompleto = `${partesSabDom[0]}, así como ${partesSabDom[1]}, todos del referido año`;
        } else {
          const ultimaParte = partesSabDom.pop();
          textoCompleto = `${partesSabDom.join(', ')}, así como ${ultimaParte}, todos del referido año`;
        }
        
        diasTexto.push(`${textoCompleto}, por corresponder a sábados y domingos, inhábiles conforme lo previsto en artículo 19 de la Ley de la Materia`);
      }
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
          // Agrupar días del mismo mes
          diasFinales = dias;
          
          // Para litigantes no mostramos superíndices
          if (tipoUsuario === 'litigante') {
            diasTexto = diasTexto.concat(diasFinales);
          } else {
            let superindiceAUsar = fundamentosYaUsados[fundamento];
            
            if (!superindiceAUsar) {
              superindiceAUsar = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
              fundamentosYaUsados[fundamento] = superindiceAUsar;
              notasAlPie.push(`${superindiceAUsar} ${fundamento}`);
              numeroNota++;
            }
            
            diasTexto = diasTexto.concat(diasFinales.map(dia => dia + superindiceAUsar));
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
  esCasoPenal = false
}: {
  fechaNotificacion: Date,
  fechaSurte: Date,
  fechaInicio: Date,
  fechaFin: Date,
  diasAdicionales: string[],
  tipoUsuario: string,
  esCasoPenal?: boolean
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
    
    // Días del cómputo (no mostrar en casos penales)
    if (!esCasoPenal && fecha >= fechaInicio && fecha <= fechaFin) {
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
        flexWrap: 'wrap',
        gap: '15px', 
        justifyContent: 'flex-start',
        width: '100%'
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
              padding: '8px',
              width: '140px',
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
                            // Verificar si también es día del cómputo (para leyes por entrada en vigor)
                            const esDiaDelComputo = fechaDiaObj >= fechaInicio && fechaDiaObj <= fechaFin;
                            const esDiaHabilDelComputo = esDiaDelComputo && !esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
                            
                            if (esDiaHabilDelComputo) {
                              // Día de entrada en vigor que también es día del cómputo: triángulo con círculo superpuesto
                              return (
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {/* Triángulo azul (entrada en vigor) */}
                                  <div style={{
                                    position: 'absolute',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3b82f6',
                                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                    zIndex: 1
                                  }}></div>
                                  {/* Círculo amarillo superpuesto (día del cómputo) */}
                                  <div style={{
                                    position: 'absolute',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#fcd34d',
                                    borderRadius: '50%',
                                    top: '6px',
                                    left: '2px',
                                    zIndex: 2
                                  }}></div>
                                  {/* Número del día */}
                                  <div style={{
                                    position: 'absolute',
                                    color: 'white',
                                    fontSize: '5px',
                                    fontWeight: 'bold',
                                    zIndex: 3
                                  }}>
                                    {dia}
                                  </div>
                                </div>
                              );
                            } else {
                              // Solo día de notificación
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
                                <div style={{fontSize: '6px', color: '#3D3D3D'}}>
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
                                <div style={{fontSize: '6px', color: '#3D3D3D'}}>
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

// Función para mapear nombres de leyes a identificadores internos
function mapearLeyAIdentificador(nombreLey: string): string {
  const mapeo: {[key: string]: string} = {
    'Código Nacional de Procedimientos Penales': 'codigo_nacional_penal',
    'Código Federal de Procedimientos Civiles': 'codigo_federal_civil',
    'Código de Comercio': 'codigo_comercio',
    'Ley Federal de Procedimiento Administrativo': 'ley_federal_procedimiento_administrativo',
    'Código Fiscal de la Federación': 'codigo_fiscal_federacion',
    'Ley Federal del Trabajo': 'ley_federal_trabajo',
    'Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional': 'ley_federal_trabajadores_estado',
    'Ley General de Educación': 'ley_general_educacion',
    'Ley del Seguro Social': 'ley_seguro_social',
    'Ley de Navegación y Comercio Marítimos': 'ley_navegacion_comercio',
    'Código Federal de Procedimientos Penales': 'codigo_federal_procedimientos_penales',
    'Código Nacional de Procedimientos Civiles y Familiares': 'codigo_nacional_civil_familiar',
    'Ley Federal de Procedimiento Contencioso Administrativo': 'ley_federal_contencioso',
    'Ley Aduanera': 'ley_aduanera'
  };
  return mapeo[nombreLey] || nombreLey;
}

export default function Page() {
  const [tipoUsuario, setTipoUsuario] = useState<string>('litigante');
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
    tipoDemanda: '', // 'directo' o 'adhesivo'
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    fechaConocimiento: '',
    tipoFecha: 'notificacion',
    supuestoAgrario: '',
    tipoSupuesto: '', // 'agrario' o 'penal'
    formaNotificacion: '',
    leyDelActo: '',
    leyDelActoManual: '',
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
  const [mounted, setMounted] = useState(false);

  // Función para verificar si los campos deben estar deshabilitados
  const camposDeshabilitados = () => {
    if (formData.tipoDemanda !== 'directo') return false;
    
    // Si no ha respondido sobre supuestos, deshabilitar campos siguientes
    if (!formData.supuestoAgrario) return true;
    
    // Si respondió "sí" pero no ha seleccionado el tipo de supuesto
    if (formData.supuestoAgrario === 'si' && !formData.tipoSupuesto) return true;
    
    return false;
  };

  useEffect(() => {
    setMounted(true);
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

  // Evitar hidratación hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="k-law-text">Cargando calculadora...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que si seleccionó 'sí' en supuesto agrario, debe elegir un tipo (solo para amparo directo)
    if (formData.tipoDemanda === 'directo' && formData.supuestoAgrario === 'si' && !formData.tipoSupuesto) {
      alert('Debe seleccionar uno de los supuestos:\n• Avecindados, personas ejidatarias o comuneras\n• Persona sentenciada con pena de prisión');
      return;
    }
    
    setCalculando(true);
    
    setTimeout(() => {

      // Determinar plazo y fundamento según tipo de demanda
      let plazo: number | string = 15;
      let fundamento = '';
      let esEnCualquierTiempo = false;
      
      if (formData.tipoDemanda === 'adhesivo') {
        plazo = 15;
        fundamento = 'artículo 181 de la Ley de Amparo';
      } else {
        switch (formData.resolucionImpugnada) {
          case 'sentencia_definitiva':
          case 'laudo':
          case 'resolucion_fin_juicio':
            plazo = 15;
            fundamento = 'artículo 17 de la Ley de Amparo';
            break;
          case 'sentencia_condenatoria_penal':
            // Si es persona sentenciada con pena de prisión, plazo de 8 años
            if (formData.tipoSupuesto === 'penal') {
              plazo = '8 años';
              fundamento = 'artículo 17, fracción II, de la Ley de Amparo';
            } else {
              plazo = 15;
              fundamento = 'artículo 17 de la Ley de Amparo';
            }
            break;
          default:
            plazo = 15;
            fundamento = 'artículo 17 de la Ley de Amparo';
        }
      }
      
      // Si es "en cualquier tiempo", crear resultado especial
      if (esEnCualquierTiempo) {
        const resultado = {
          plazo: plazo as string,
          fundamento: fundamento,
          fechaNotificacion: new Date(formData.fechaNotificacion + 'T12:00:00'),
          fechaSurte: new Date(formData.fechaNotificacion + 'T12:00:00'),
          fechaInicio: new Date(formData.fechaNotificacion + 'T12:00:00'),
          fechaFin: new Date(formData.fechaNotificacion + 'T12:00:00'),
          fechaNotificacionTexto: fechaATexto(formData.fechaNotificacion),
          fechaSurteEfectosTexto: 'No aplica - En cualquier tiempo',
          fechaInicioTexto: 'No aplica - En cualquier tiempo',
          fechaFinTexto: 'No aplica - En cualquier tiempo',
          diasInhabiles: 'No aplica',
          diasInhabilesTexto: 'No aplica',
          plazoTexto: 'En cualquier tiempo',
          esOportuno: true,
          fundamentoSurte: 'No aplica',
          notasAlPieTexto: [],
          formaPresentacion: 'No aplica'
        };
        
        setResultado(resultado);
        setCalculando(false);
        return;
      }
      
      const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
      let fechaSurte = new Date(fechaNotif);
      let textoSurte = '';
      let fundamentoSurte = '';
      
      // Aplicar artículo 18 de la Ley de Amparo
      let fechaInicio: Date;
      if (formData.tipoDemanda === 'adhesivo') {
        // Para amparo adhesivo, usar las reglas del artículo 31 de la Ley de Amparo
        const parteRecurrente = 'particular'; // El promovente en adhesivo nunca es autoridad
        
        // Calcular cuándo surte efectos según forma de notificación
        textoSurte = getCuandoSurteEfectos(formData.formaNotificacion, parteRecurrente);
        fundamentoSurte = getFundamentoSurtimientoEfectos(formData.formaNotificacion, parteRecurrente);
        
        // Calcular fecha que surte efectos
        const esAutoridadTercero = (parteRecurrente as string) === 'autoridad' || (parteRecurrente as string) === 'tercero';
        fechaSurte = calcularFechaSurteEfectos(
          fechaNotif,
          formData.formaNotificacion,
          parteRecurrente,
          esAutoridadTercero,
          esDiaInhabil,
          siguienteDiaHabil,
          diasAdicionales,
          tipoUsuario
        );
        
        // El plazo inicia al día siguiente de que surte efectos
        fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
      } else if (formData.resolucionImpugnada === 'ley_entrada_vigor') {
        // Para leyes por entrada en vigor: NO hay notificación, se computa desde el día de entrada en vigor
        fechaInicio = new Date(fechaNotif);
        textoSurte = 'No aplica - No hay notificación';
        fundamentoSurte = 'artículo 18 de la Ley de Amparo';
        fechaSurte = new Date(fechaNotif); // La fecha de entrada en vigor es la referencia
      } else {
        // Para otros actos: calcular cuándo surte efectos la notificación
        const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                           (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
        
        // Verificar si aplica el Código Nacional de Procedimientos Penales
        const leyIdentificador = mapearLeyAIdentificador(formData.leyDelActo);
        if (leyIdentificador === 'codigo_nacional_penal') {
          // Aplicar reglas específicas del CNPP según el tipo de notificación
          switch (formData.formaNotificacion) {
            case 'personal_audiencia':
              // Personalmente, en audiencia - artículo 82, fracción I, inciso a)
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'personal_correo_electronico':
            case 'personal_telefono':
              // Personalmente, por correo electrónico/teléfono - artículo 82, fracción I, inciso b)
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'personal_domicilio':
              // Personalmente, en su domicilio - artículo 82, fracción I, inciso d)
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'personal_instructivo':
              // Por instructivo en su domicilio - artículo 82, fracción I, inciso d), punto 2)
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'personal_instalaciones':
              // Personalmente, en las instalaciones del órgano jurisdiccional - artículo 82, fracción I, inciso c)
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'personal_detencion':
              // Personalmente, en el lugar de la detención - artículo 85, tercer párrafo
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'correo_certificado':
              // Por correo certificado - artículo 87, segundo párrafo
              textoSurte = 'el mismo día en que se recibe';
              fundamentoSurte = 'artículo 87, segundo párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = fechaNotif;
              break;
            case 'electronica':
              // Por medios electrónicos - artículo 87, primer párrafo
              textoSurte = 'el mismo día en que por sistema se confirme que recibió el archivo electrónico correspondiente';
              fundamentoSurte = 'artículo 87, primer párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = fechaNotif;
              break;
            case 'edictos':
              // Por edictos - artículo 82, fracción III
              textoSurte = 'el día siguiente de su publicación';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'boletin_jurisdiccional':
            case 'estrados':
            case 'lista':
              // Por Boletín Jurisdiccional, estrados o lista - artículo 82, fracción II
              textoSurte = 'el día siguiente de su publicación';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general para otros casos
              textoSurte = 'al día siguiente en que hubieren sido practicadas';
              fundamentoSurte = 'artículo 82, último párrafo del Código Nacional de Procedimientos Penales';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_federal_civil') {
          // Aplicar reglas específicas del Código Federal de Procedimientos Civiles
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 309
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'cedula':
              // Por cédula - artículo 459
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'estrados':
              // Por estrados
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'edictos':
              // Por edictos - artículo 315
              textoSurte = 'al día siguiente de la última publicación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'correo_certificado':
              // Por correo certificado
              textoSurte = 'al día siguiente de la recepción';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'telegrama':
              // Por telegrama
              textoSurte = 'al día siguiente de la recepción';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'rotulon':
              // Por rotulón - artículo 315
              textoSurte = 'el día siguiente al en que se publique';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'instructivo':
              // Por instructivo - artículo 310
              textoSurte = 'el día siguiente al en que se publique';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general - al día siguiente
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (leyIdentificador === 'codigo_comercio') {
          // Aplicar reglas específicas del Código de Comercio
          switch (formData.formaNotificacion) {
            case 'personal':
              // Notificaciones personales - Arts. 1068 Bis y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente del que se hayan practicado';
              fundamentoSurte = 'Arts. 1068 Bis y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'boletin_judicial':
              // Por Boletín Judicial - Arts. 1068, fracc. II y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de aquel en que se hubieren hecho';
              fundamentoSurte = 'Arts. 1068, fracc. II y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'gaceta_judicial':
              // Por Gaceta Judicial - Arts. 1068, fracc. II y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de aquel en que se hubieren hecho';
              fundamentoSurte = 'Arts. 1068, fracc. II y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'periodico_judicial':
              // Por Periódico Judicial - Arts. 1068, fracc. II y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de aquel en que se hubieren hecho';
              fundamentoSurte = 'Arts. 1068, fracc. II y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'estrados':
              // Por estrados - Arts. 1068, fracc. III y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de aquel en que se hubieren fijado';
              fundamentoSurte = 'Arts. 1068, fracc. III y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'correo':
              // Por correo - Arts. 1068, fracc. V y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de que exista constancia de haberse entregado';
              fundamentoSurte = 'Arts. 1068, fracc. V y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'telegrafo':
              // Por telégrafo - Arts. 1068, fracc. VI y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de que exista constancia de haberse entregado';
              fundamentoSurte = 'Arts. 1068, fracc. VI y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'edictos':
              // Por edictos - Arts. 1070 y 1075, párrafo 2°
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de haberse hecho la última publicación';
              fundamentoSurte = 'Arts. 1070 y 1075, párrafo 2° del Código de Comercio';
              break;
            case 'audiencia':
              // En audiencia - Arts. 1390 Bis 22 y 1075
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente (aplicando regla general del Art. 1075)';
              fundamentoSurte = 'Arts. 1390 Bis 22 y 1075 del Código de Comercio';
              break;
            default:
              // Regla general - al día siguiente
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de que se hubieren hecho';
              fundamentoSurte = 'artículo 1075, párrafo 2° del Código de Comercio';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_procedimiento_administrativo') {
          // Aplicar reglas específicas de la Ley Federal de Procedimiento Administrativo
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 35, fracción I - surte efectos el mismo día
              textoSurte = 'el día en que hubieren sido realizadas';
              fundamentoSurte = 'artículo 38 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = fechaNotif;
              break;
            case 'correo_certificado_acuse':
              // Por correo certificado con acuse de recibo - artículo 35, fracción II
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'mensajeria_acuse':
              // Por mensajería, con acuse de recibo - artículo 35, fracción III
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'oficio':
              // Por oficio - artículo 35, fracción II
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'estrados':
              // Por estrados
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'edictos':
              // Por edictos - artículo 35, fracción III
              textoSurte = 'al día siguiente de la última publicación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'electronica':
              // Por medios electrónicos - artículo 35, fracciones II y III
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'correo_ordinario':
              // Por correo ordinario - artículo 35, fracción III
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'telegrama':
              // Por telegrama - artículo 35, fracción III
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'medios_magneticos_digitales':
              // a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos - artículo 40
              textoSurte = 'el día hábil siguiente a aquél en que sean realizadas';
              fundamentoSurte = 'artículo 40';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'buzon_imss':
              // a través del Buzón IMSS - artículo 286
              textoSurte = 'al día hábil siguiente en que fueron hechas';
              fundamentoSurte = 'artículo 135, primer párrafo, del CFF de aplicación supletoria (en cuanto se actúe como ente fiscalizador)';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general - al día siguiente
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_fiscal_federacion') {
          // Aplicar reglas específicas del Código Fiscal de la Federación
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 134, fracción I
              textoSurte = 'al día hábil siguiente en que fueron hechas';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'correo_certificado':
              // Por correo certificado - artículo 134, fracción I
              textoSurte = 'al día hábil siguiente al de la fecha del acuse de recibo';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'estrados':
              // Por estrados - artículo 134, fracción III
              textoSurte = 'al día hábil siguiente en que fueron hechas, en la inteligencia de que se tienen por hechas el decimoprimer día contado a partir del día siguiente a aquél en el que se hubiera publicado el documento';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'edictos':
              // Por edictos - artículo 134, fracción IV
              textoSurte = 'al día hábil siguiente al de la última publicación';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'buzon_tributario':
              // Por buzón tributario - artículo 134, fracción I
              textoSurte = 'al día hábil siguiente al de la fecha del acuse de recibo';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'correo_ordinario':
              // Por correo ordinario - artículo 134, fracción II
              textoSurte = 'al día hábil siguiente al de la fecha del acuse de recibo';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'telegrama':
              // Por telegrama - artículo 134, fracción II
              textoSurte = 'al día hábil siguiente al de la fecha del acuse de recibo';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general - al día hábil siguiente
              textoSurte = 'al día hábil siguiente en que fueron hechas';
              fundamentoSurte = 'artículo 135, primer párrafo del Código Fiscal de la Federación';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_trabajo') {
          // Aplicar reglas específicas de la Ley Federal del Trabajo
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 739 - el día y hora en que se practiquen
              textoSurte = 'el día y hora en que se practiquen';
              fundamentoSurte = 'artículo 747, fracción I de la Ley Federal del Trabajo';
              fechaSurte = fechaNotif;
              break;
            case 'boletin':
            case 'boletin_jurisdiccional':
              // Por boletín - artículo 739
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II de la Ley Federal del Trabajo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'estrados':
              // Por estrados - artículo 739
              textoSurte = 'al día siguiente de su fijación';
              fundamentoSurte = 'artículo 747, fracción II de la Ley Federal del Trabajo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'lista':
              // Por lista - artículo 739 Ter, fracción III
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II de la Ley Federal del Trabajo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'oficio':
              // Por oficio - artículo 739 Ter, fracción II - Solo para autoridades específicas
              textoSurte = 'el día y hora en que se practiquen';
              fundamentoSurte = 'artículo 747, fracción I de la Ley Federal del Trabajo';
              fechaSurte = fechaNotif;
              break;
            case 'electronica':
              // Por vía electrónica - artículo 739
              textoSurte = 'cuando se genere la constancia de la consulta realizada o el acuse de manera automática, o en dos días de que se realice si no hay constancia de consulta ni acuse automático';
              fundamentoSurte = 'artículo 747, fracciones III y IV de la Ley Federal del Trabajo';
              // Por defecto a los dos días (puede ajustarse según constancia)
              const fechaTemporal = new Date(fechaNotif);
              fechaTemporal.setDate(fechaTemporal.getDate() + 2);
              fechaSurte = siguienteDiaHabil(fechaTemporal, diasAdicionales, tipoUsuario);
              break;
            case 'buzon_electronico':
              // Por buzón electrónico - artículo 739 Ter, fracción IV
              textoSurte = 'cuando se genere la constancia de la consulta realizada o el acuse de manera automática, o en dos días de que se realice si no hay constancia de consulta ni acuse automático';
              fundamentoSurte = 'artículo 747, fracciones III y IV de la Ley Federal del Trabajo';
              // Por defecto a los dos días (puede ajustarse según constancia)
              const fechaTemporal2 = new Date(fechaNotif);
              fechaTemporal2.setDate(fechaTemporal2.getDate() + 2);
              fechaSurte = siguienteDiaHabil(fechaTemporal2, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general - al día siguiente
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II de la Ley Federal del Trabajo';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_trabajadores_estado') {
          // Aplicar reglas específicas de la Ley Federal de los Trabajadores al Servicio del Estado
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 739 (supletorio) - En el momento de la notificación
              textoSurte = 'en el momento de la notificación';
              fundamentoSurte = 'artículo 747, fracción I, de la Ley Federal del Trabajo, de aplicación supletoria conforme a lo previsto en el artículo 11 de la Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional';
              fechaSurte = fechaNotif;
              break;
            case 'boletin':
            case 'boletin_jurisdiccional':
              // Por boletín - artículo 739 (supletorio)
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II, de la Ley Federal del Trabajo, de aplicación supletoria conforme a lo previsto en el artículo 11 de la Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'estrados':
              // Por estrados - artículo 739 (supletorio) - Nota especial para litigantes
              textoSurte = 'al día siguiente de su fijación';
              fundamentoSurte = 'artículo 747, fracción II, de la Ley Federal del Trabajo, de aplicación supletoria conforme a lo previsto en el artículo 11 de la Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            case 'circular':
              // Por circular - artículo 739 (supletorio)
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II, de la Ley Federal del Trabajo, de aplicación supletoria conforme a lo previsto en el artículo 11 de la Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              break;
            default:
              // Regla general - al día siguiente
              textoSurte = 'al día siguiente de su publicación';
              fundamentoSurte = 'artículo 747, fracción II, de la Ley Federal del Trabajo, de aplicación supletoria conforme a lo previsto en el artículo 11 de la Ley Federal de los Trabajadores al Servicio del Estado, Reglamentaria del Apartado B) del Artículo 123 Constitucional';
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_general_educacion') {
          // Aplicar reglas específicas de la Ley General de Educación
          switch (formData.formaNotificacion) {
            case 'visita_vigilancia':
              // Mediante visita de vigilancia - artículo 152
              fechaSurte = new Date(fechaNotif);
              textoSurte = 'el mismo día en que se practique su visita';
              fundamentoSurte = 'artículo 152 de la Ley General de Educación';
              break;
            case 'otra_lfpa':
              // Usar las reglas de LFPA según formaNotificacionLFPA
              // Temporalmente usar 'personal' como default
              const formaLFPA = 'personal'; // formData.formaNotificacion;
              switch (formaLFPA) {
                case 'personal':
                  fechaSurte = new Date(fechaNotif);
                  textoSurte = 'el día en que hubieren sido realizadas';
                  fundamentoSurte = 'artículo 38 de la Ley Federal de Procedimiento Administrativo';
                  break;
                case 'correo_certificado_acuse':
                case 'mensajeria_acuse':
                case 'oficio':
                case 'estrados':
                case 'correo_ordinario':
                case 'telegrama':
                case 'medios_electronicos':
                  fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
                  textoSurte = 'al día siguiente de la notificación';
                  fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
                  break;
                case 'edictos':
                  fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
                  textoSurte = 'al día siguiente de la última publicación';
                  fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
                  break;
                case 'medios_magneticos_digitales':
                  fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
                  textoSurte = 'el día hábil siguiente a aquél en que sean realizadas';
                  fundamentoSurte = 'artículo 40';
                  break;
                case 'buzon_imss':
                  fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
                  textoSurte = 'al día hábil siguiente en que fueron hechas';
                  fundamentoSurte = 'artículo 135, primer párrafo, del CFF de aplicación supletoria (en cuanto se actúe como ente fiscalizador)';
                  break;
                default:
                  fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
                  textoSurte = 'al día siguiente de la notificación';
                  fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              }
              break;
            default:
              // Regla general
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'Ley General de Educación';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_contencioso') {
          // Aplicar reglas específicas de la Ley Federal de Procedimiento Contencioso Administrativo
          switch (formData.formaNotificacion) {
            case 'boletin_jurisdiccional':
              // Por Boletín Jurisdiccional - artículo 65
              const fechaBase = new Date(fechaNotif);
              let diasContados = 0;
              let fechaActual = new Date(fechaBase);
              
              // Contar 3 días hábiles
              while (diasContados < 3) {
                fechaActual.setDate(fechaActual.getDate() + 1);
                if (!esDiaInhabil(fechaActual, diasAdicionales, tipoUsuario)) {
                  diasContados++;
                }
              }
              
              fechaSurte = fechaActual;
              textoSurte = 'al tercer día hábil siguiente a aquél en que se haya realizado la publicación en el Boletín Jurisdiccional';
              fundamentoSurte = 'artículo 65, cuarto párrafo, de la Ley Federal de Procedimiento Contencioso Administrativo';
              break;
              
            case 'personales':
              // Personales - artículo 67
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente a aquél en que las partes sean notificadas personalmente';
              fundamentoSurte = 'artículo 67 de la Ley Federal de Procedimiento Contencioso Administrativo';
              break;
              
            default:
              // Para otras formas de notificación, usar reglas generales de la ley
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'Ley Federal de Procedimiento Contencioso Administrativo';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_seguro_social') {
          // Aplicar reglas específicas de la Ley del Seguro Social
          switch (formData.formaNotificacion) {
            case 'medios_magneticos_digitales':
              // a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos o de cualquier otra naturaleza - artículo 40
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'el día hábil siguiente a aquél en que sean realizadas';
              fundamentoSurte = 'artículo 40 de la Ley del Seguro Social';
              break;
              
            case 'buzon_imss':
              // a través del Buzón IMSS - artículo 286
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente en que fueron hechas';
              fundamentoSurte = 'artículo 135, primer párrafo, del CFF de aplicación supletoria (en cuanto se actúe como ente fiscalizador)';
              break;
              
            default:
              // Para otras formas de notificación, usar reglas generales de la LSS
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'Ley del Seguro Social';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_nacional_civil_familiar') {
          // Aplicar reglas específicas del Código Nacional de Procedimientos Civiles y Familiares
          switch (formData.formaNotificacion) {
            case 'personalmente':
              // Personalmente - artículo 203, fracción I
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción I, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'comunicacion_judicial':
              // Por medio de comunicación judicial - artículo 203, fracción II y 227, fracción III
              fechaSurte = new Date(fechaNotif);
              textoSurte = 'el mismo día en que por sistema se confirme que recibió el archivo electrónico correspondiente';
              fundamentoSurte = 'artículo 227, fracción III, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'edictos':
              // Por edictos - artículo 203, fracción III
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción III, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'correo_certificado':
              // Por correo certificado - artículo 203, fracción IV
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción IV, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'telegrafo':
              // Por telégrafo - artículo 203, fracción V
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción V, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'audiencia_juicio_oral':
              // En audiencia en juicio oral - artículo 227, fracción V
              fechaSurte = new Date(fechaNotif);
              textoSurte = 'en el momento en que las emita, estén o no presentes las partes';
              fundamentoSurte = 'artículo 227, fracción V, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'comunicacion_electronica':
              // Por cualquier otro medio de comunicación electrónica - artículo 203, fracción VI
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción VI, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'adhesion':
              // Por adhesión - artículo 199, fracción I, y 203, fracción I
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 199, fracción I, y 203, fracción I, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'cedula':
              // Por cédula - artículo 203, fracción I
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción I, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'instructivo':
              // Por instructivo - artículo 203, fracción I
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción I, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'correo_electronico':
              // Por correo electrónico - artículo 203, fracción I
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'artículo 203, fracción I, del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'boletin_judicial':
              // Por boletín Judicial
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            case 'cedula_1027_1028':
              // Por cédula en caso de artículos 1027 y 1028 - dentro de tres días
              const fechaBase = new Date(fechaNotif);
              fechaBase.setDate(fechaBase.getDate() + 3);
              fechaSurte = fechaBase;
              textoSurte = 'dentro de tres días';
              fundamentoSurte = 'artículos 1027 y 1028 del Código Nacional de Procedimientos Civiles y Familiares';
              break;
              
            default:
              // Para otras formas de notificación, usar reglas generales del CNPCF
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'Código Nacional de Procedimientos Civiles y Familiares';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_navegacion_comercio') {
          // Aplicar reglas específicas de la Ley de Navegación y Comercio Marítimos
          switch (formData.formaNotificacion) {
            case 'personal':
              // Personal - artículo 287, segundo párrafo - Al día siguiente
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente';
              fundamentoSurte = 'artículo 287, segundo párrafo, de la Ley de Navegación y Comercio Marítimos';
              break;
              
            case 'correo_certificado':
              // Por correo certificado - artículo 287, segundo párrafo - Al tercer día de recibida
              const fechaBaseCertificado = new Date(fechaNotif);
              fechaBaseCertificado.setDate(fechaBaseCertificado.getDate() + 3);
              fechaSurte = fechaBaseCertificado;
              textoSurte = 'al tercer día de recibida';
              fundamentoSurte = 'artículo 327 de la Ley de Navegación y Comercio Marítimos';
              break;
              
            case 'edictos':
              // Por edictos - artículo 287, segundo párrafo - Al día siguiente de la última publicación
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la última publicación';
              fundamentoSurte = 'artículo 327 de la Ley de Navegación y Comercio Marítimos';
              break;
              
            case 'estrados':
              // Por estrados - artículo 287, segundo párrafo
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente';
              fundamentoSurte = 'artículo 287, segundo párrafo, de la Ley de Navegación y Comercio Marítimos';
              break;
              
            // Opciones de LFPA aplicables
            case 'personal_lfpa':
              fechaSurte = new Date(fechaNotif);
              textoSurte = 'el día en que hubieren sido realizadas';
              fundamentoSurte = 'artículo 38 de la Ley Federal de Procedimiento Administrativo, aplicable a la Ley de Navegación y Comercio Marítimos';
              break;
              
            case 'correo_certificado_acuse_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'mensajeria_acuse_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'estrados_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'edictos_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la última publicación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'electronica_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'oficio_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'correo_ordinario_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            case 'telegrama_lfpa':
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente de la notificación';
              fundamentoSurte = 'artículo 321 del Código Federal de Procedimientos Civiles, aplicable supletoriamente conforme lo dispuesto en el artículo 2 de la Ley Federal de Procedimiento Administrativo';
              break;
              
            default:
              // Para otras formas de notificación, usar reglas generales de LNCM
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día siguiente';
              fundamentoSurte = 'Ley de Navegación y Comercio Marítimos';
          }
        } else if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_aduanera') {
          // Aplicar reglas específicas de la Ley Aduanera
          switch (formData.formaNotificacion) {
            case 'notificaciones_electronicas':
              // Notificaciones electrónicas - artículo 9A
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'a partir del día hábil siguiente a aquél en el que se generó el acuse de la notificación';
              fundamentoSurte = 'artículo 9A, último párrafo, de la Ley Aduanera';
              break;
              
            case 'estrados':
              // Por estrados - artículo 9B - décimosexto día hábil contando como día 1 el de su publicación
              const fechaBaseEstrados = new Date(fechaNotif);
              let diasContadosEstrados = 1; // Empezamos contando el día de publicación como día 1
              let fechaActualEstrados = new Date(fechaBaseEstrados);
              
              // Contar 16 días hábiles total (incluyendo el día 1 de publicación)
              while (diasContadosEstrados < 16) {
                fechaActualEstrados.setDate(fechaActualEstrados.getDate() + 1);
                if (!esDiaInhabil(fechaActualEstrados, diasAdicionales, tipoUsuario)) {
                  diasContadosEstrados++;
                }
              }
              
              fechaSurte = fechaActualEstrados;
              textoSurte = 'el décimosexto día hábil contando como día 1 el de su publicación';
              fundamentoSurte = 'artículo 9B, último párrafo, de la Ley Aduanera';
              break;
              
            case 'avisos_autorizacion':
              // Los avisos de autorización y de revocación - artículo 9C
              fechaSurte = new Date(fechaNotif);
              textoSurte = 'en la fecha y hora señalados en los acuses de recibo que para tal efecto emita el sistema electrónico aduanero';
              fundamentoSurte = 'artículo 9C, segundo párrafo, de la Ley Aduanera';
              break;
              
            default:
              // Para otras formas de notificación, usar reglas generales de la Ley Aduanera
              fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
              textoSurte = 'al día hábil siguiente';
              fundamentoSurte = 'Ley Aduanera';
          }
        } else {
          // Aplicar artículo 31 de la Ley de Amparo para otras leyes
          if (esAutoridad) {
            // Fracción I: para autoridades surten efectos desde el momento en que quedan hechas
            textoSurte = 'el mismo día';
            fundamentoSurte = 'artículo 31, fracción I, de la Ley de Amparo';
          } else if (formData.formaNotificacion === 'electronica') {
            // Fracción III: electrónicas cuando se genere el acuse
            textoSurte = 'el mismo día en que se genera el acuse electrónico';
            fundamentoSurte = 'artículo 31, fracción III, de la Ley de Amparo';
          } else {
            // Fracción II: personales o por lista surten efectos al día siguiente
            textoSurte = 'al siguiente día hábil';
            fundamentoSurte = 'artículo 31, fracción II, de la Ley de Amparo';
            fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
          }
        }
        
        // Regla general: se computa a partir del día siguiente al que surte efectos
        fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
      }
      
      // Calcular fecha fin según el tipo de caso
      let fechaFin: Date;
      if (formData.tipoSupuesto === 'penal' && formData.resolucionImpugnada === 'sentencia_condenatoria_penal') {
        // Para casos penales con pena de prisión (8 años), no se excluyen días inhábiles
        fechaFin = calcularPlazoSinExcluirInhabiles(fechaInicio, 2920); // 8 años = 2920 días
      } else if (formData.resolucionImpugnada === 'ley_entrada_vigor' && formData.tipoDemanda === 'directo') {
        fechaFin = calcularPlazoLeyEntradaVigor(fechaInicio, plazo as number, diasAdicionales, tipoUsuario);
      } else {
        fechaFin = calcularPlazoReal(fechaInicio, plazo as number, diasAdicionales, tipoUsuario);
      }
      
      // Para litigantes, no evaluamos la oportunidad
      let esOportuno = true;
      let fechaPres = null;
      
      if (tipoUsuario === 'servidor' && formData.fechaPresentacion) {
        fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
        esOportuno = fechaPres <= fechaFin;
      }
      
      // Para casos penales con plazo de 8 años, solo se consideran días inhábiles entre notificación y surtimiento
      let diasInhabilesInfo, diasInhabilesTextoInfo, diasInhabilesSimplificadoInfo;
      if (formData.tipoSupuesto === 'penal' && formData.resolucionImpugnada === 'sentencia_condenatoria_penal') {
        // Solo calcular días inhábiles entre la notificación y cuando surte efectos
        const diasInhabilesNotifSurte = obtenerDiasInhabilesConNotas(fechaNotif, fechaSurte, diasAdicionales, fundamentoAdicional, tipoUsuario);
        const diasInhabilesTextoNotifSurte = obtenerDiasInhabilesParaTexto(fechaNotif, fechaSurte, diasAdicionales, fundamentoAdicional, tipoUsuario);
        const diasInhabilesSimplificadoNotifSurte = obtenerDiasInhabilesSimplificado(fechaNotif, fechaSurte, diasAdicionales, fundamentoAdicional, tipoUsuario);
        
        // Personalizar el texto para casos penales
        let textoDiasInhabiles = '';
        if (diasInhabilesSimplificadoNotifSurte && diasInhabilesSimplificadoNotifSurte !== '') {
          textoDiasInhabiles = `Los días inhábiles transcurridos entre la fecha de la notificación y aquella en que surtió efectos son: ${diasInhabilesSimplificadoNotifSurte}, inhábiles conforme a lo previsto en el artículo 94 del Código Nacional de Procedimientos Penales`;
          if (diasInhabilesNotifSurte.notasAlPie && diasInhabilesNotifSurte.notasAlPie.length > 0) {
            textoDiasInhabiles += ' y demás disposiciones aplicables';
          }
        } else {
          textoDiasInhabiles = 'No hubo días inhábiles entre la fecha de notificación y aquella en que surtió efectos';
        }
        
        diasInhabilesInfo = {
          diasInhabiles: textoDiasInhabiles,
          notasAlPie: ['En los términos del artículo 17, fracción II, de la Ley de Amparo, para sentencias condenatorias con pena de prisión, el plazo de 8 años se cuenta sin excluir días inhábiles.']
        };
        diasInhabilesTextoInfo = { diasInhabilesTexto: textoDiasInhabiles };
        diasInhabilesSimplificadoInfo = textoDiasInhabiles;
      } else {
        diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
        diasInhabilesTextoInfo = obtenerDiasInhabilesParaTexto(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
        diasInhabilesSimplificadoInfo = obtenerDiasInhabilesSimplificado(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      }
      
      // Mapeos para el texto generado
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
        'oficio': 'del oficio de remisión que obra en autos',
        'correo': 'del sobre que obra en el toca en que se actúa',
        'momento': 'de la constancia de notificación que obra en el juicio de amparo',
        'personal': 'del acuse de recibo que obra en el juicio de amparo',
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
        textoSurte,
        fundamentoSurte,
        fechaNotificacion: fechaNotif,
        fechaSurte: fechaSurte,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        fechaNotificacionTexto: fechaATexto(formData.fechaNotificacion),
        fechaSurteEfectosTexto: fechaATexto(fechaSurte.toISOString().split('T')[0]),
        fechaInicioTexto: fechaATexto(fechaInicio.toISOString().split('T')[0]),
        fechaFinTexto: fechaATexto(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionTexto: formData.fechaPresentacion ? fechaATexto(formData.fechaPresentacion) : '',
        fechaNotificacionNumerico: fechaParaLitigante(formData.fechaNotificacion),
        fechaSurteEfectosNumerico: fechaParaLitigante(fechaSurte.toISOString().split('T')[0]),
        fechaInicioNumerico: fechaParaLitigante(fechaInicio.toISOString().split('T')[0]),
        fechaFinNumerico: fechaParaLitigante(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionNumerico: formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : '',
        diasInhabiles: diasInhabilesSimplificadoInfo || diasInhabilesInfo.diasInhabiles,
        diasInhabilesTexto: diasInhabilesTextoInfo.diasInhabilesTexto || diasInhabilesTextoInfo.texto,
        notasAlPie: diasInhabilesInfo.notasAlPie,
        notasAlPieTexto: (() => {
          let notas = diasInhabilesTextoInfo.notasAlPie || diasInhabilesTextoInfo.notas || [];
          
          // Agregar nota especial para LFTSE + estrados
          if (mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_trabajadores_estado' && formData.formaNotificacion === 'estrados') {
            const notaEstrados = 'Nota para litigantes: Existe la posibilidad de que se considere inaplicable supletoriamente el citado precepto, conforme la tesis I.8o.T.1 L (11a.), con registro 2024351, y rubro: "NOTIFICACIONES POR ESTRADOS EN EL JUICIO LABORAL BUROCRÁTICO. CONFORME AL PÁRRAFO SEGUNDO DEL ARTÍCULO 142 DE LA LEY FEDERAL DE LOS TRABAJADORES AL SERVICIO DEL ESTADO, SURTEN EFECTOS EN EL MOMENTO EN QUE SE PRACTICAN (INAPLICABILIDAD SUPLETORIA DEL ARTÍCULO 747, FRACCIÓN II, DE LA LEY FEDERAL DEL TRABAJO)."';
            notas = [...notas, notaEstrados];
          }
          
          return notas;
        })(),
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: typeof plazo === 'number' ? numeroATexto(plazo) : plazo
      });
      
      setCalculando(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si se cambia el tipo de demanda a adhesivo, limpiar campos de supuesto
    if (name === 'tipoDemanda' && value === 'adhesivo') {
      setFormData({
        ...formData,
        [name]: value,
        supuestoAgrario: '',
        tipoSupuesto: ''
      });
      return;
    }
    
    // Si se cambia supuestoAgrario a 'no', limpiar tipoSupuesto
    if (name === 'supuestoAgrario' && value === 'no') {
      setFormData({
        ...formData,
        [name]: value,
        tipoSupuesto: ''
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const agregarDiaInhabil = () => {
    if (nuevoDiaInhabil && !diasAdicionales.includes(nuevoDiaInhabil)) {
      setDiasAdicionales([...diasAdicionales, nuevoDiaInhabil]);
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
      const calendarioElement = document.getElementById('calendario-solo');
      
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
    
    // Para Texto para Resolución, siempre usar formato texto
    const getFechaNotificacion = () => resultado.fechaNotificacionTexto;
    const getFechaSurteEfectos = () => resultado.fechaSurteEfectosTexto;
    const getFechaInicio = () => resultado.fechaInicioTexto;
    const getFechaFin = () => resultado.fechaFinTexto;
    const getFechaPresentacion = () => resultado.fechaPresentacionTexto;
    
    // Determinar el género correcto según la parte recurrente
    const esQuejoso = formData.parteRecurrente === 'quejoso';
    let generoRecurrente = esQuejoso ? 'la recurrente' : 'el recurrente';
    let parteTexto = esQuejoso ? 'parte quejosa' : 'parte autoridad responsable';
    
    // Para amparo adhesivo, usar términos específicos
    if (formData.tipoDemanda === 'adhesivo') {
      generoRecurrente = 'la parte quejosa adhesiva';
      parteTexto = ''; // No es necesario especificar el carácter
    }
    
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
    
    // Función para extraer solo el día cuando estamos en el mismo contexto de mes
    const extraerSoloDia = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      return partes[0]; // Solo devuelve el día
    };
    
    
    // Caso especial: Ley por entrada en vigor
    if (formData.resolucionImpugnada === 'ley_entrada_vigor') {
      const oportunidadTexto = resultado.esOportuno ? 'oportuna' : 'extemporánea';
      
      // Generar texto específico para días inhábiles en resolución
      const generarDiasInhabilesParaResolucion = () => {
        const diasInhabiles: string[] = [];
        const sabadosyDomingos: string[] = [];
        const otrosDias: string[] = [];
        
        // Recorrer desde el día después de la notificación hasta el fin del período
        const fechaDesdeNotif = new Date(resultado.fechaNotificacion);
        fechaDesdeNotif.setDate(fechaDesdeNotif.getDate() + 1);
        
        const fechaTemp = new Date(fechaDesdeNotif);
        while (fechaTemp <= resultado.fechaFin) {
          const fechaStr = fechaTemp.toISOString().split('T')[0];
          
          if (fechaTemp.getDay() === 0 || fechaTemp.getDay() === 6) {
            // Es sábado o domingo - siempre incluir
            const fechaTexto = fechaATexto(fechaStr);
            sabadosyDomingos.push(fechaTexto);
          } else if (esDiaInhabil(fechaTemp, diasAdicionales, tipoUsuario)) {
            // Es otro día inhábil
            const fechaTexto = fechaATexto(fechaStr);
            otrosDias.push(fechaTexto);
          }
          
          fechaTemp.setDate(fechaTemp.getDate() + 1);
        }
        
        // Construir texto
        let partes: string[] = [];
        
        // Separar sábados y domingos por mes
        const sabadosYDomingosPorMes: {[key: string]: string[]} = {};
        sabadosyDomingos.forEach(fechaTexto => {
          // Extraer mes de "diez de febrero de dos mil veinticinco"
          const partes = fechaTexto.split(' de ');
          const mes = partes[1]; // "febrero"
          if (!sabadosYDomingosPorMes[mes]) {
            sabadosYDomingosPorMes[mes] = [];
          }
          sabadosYDomingosPorMes[mes].push(fechaTexto);
        });
        
        // Agregar sábados y domingos simplificado
        const mesesConSabDom = Object.keys(sabadosYDomingosPorMes);
        if (mesesConSabDom.length > 0) {
          // Simplificar texto para evitar demasiadas conjunciones "y"
          const totalSabDom = sabadosyDomingos.length;
          if (totalSabDom > 0) {
            const primerMes = mesesConSabDom[0];
            const ultimoMes = mesesConSabDom[mesesConSabDom.length - 1];
            
            if (mesesConSabDom.length === 1) {
              // Solo un mes
              const diasDelMes = sabadosYDomingosPorMes[primerMes];
              const diasAgrupados = agruparDiasConsecutivosTexto(diasDelMes);
              // Determinar año dinámicamente
              const añoPeriodo = resultado.fechaInicio.getFullYear();
              const añoTexto = añoPeriodo === 2024 ? 'dos mil veinticuatro' : añoPeriodo === 2025 ? 'dos mil veinticinco' : `${añoPeriodo}`;
              
              const prefijo = diasAgrupados.includes(' al ') ? 'del ' : '';
              partes.push(`los días ${prefijo}${diasAgrupados} de ${primerMes} de ${añoTexto}, por corresponder a sábados y domingos, inhábiles conforme lo previsto en artículo 19 de la Ley de la Materia`);
            } else {
              // Múltiples meses - simplificar
              const añoPeriodo = resultado.fechaInicio.getFullYear();
              const añoTexto = añoPeriodo === 2024 ? 'dos mil veinticuatro' : añoPeriodo === 2025 ? 'dos mil veinticinco' : `${añoPeriodo}`;
              
              const partesSabDom: string[] = [];
              mesesConSabDom.forEach(mes => {
                const diasDelMes = sabadosYDomingosPorMes[mes];
                
                // Extraer solo los números de día (sin mes ni año)
                const soloNumerosDias = diasDelMes.map(fechaCompleta => {
                  const partes = fechaCompleta.split(' de ');
                  return partes[0]; // Solo el día en texto (ej: "diez")
                });
                
                // Agrupar días del mismo mes
                const diasOrdenados = soloNumerosDias.sort((a, b) => {
                  const textoANumero = (texto: string): number => {
                    const textos: {[key: string]: number} = {
                      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                    };
                    return textos[texto] || 0;
                  };
                  return textoANumero(a) - textoANumero(b);
                });
                
                // Formatear con agrupación de días consecutivos
                let textoDelMes = agruparDiasConsecutivosTexto(diasOrdenados);
                
                partesSabDom.push(`${textoDelMes} de ${mes}`);
              });
              
              let textoMeses = '';
              if (partesSabDom.length === 2) {
                textoMeses = `${partesSabDom[0]}, así como ${partesSabDom[1]}`;
              } else {
                const ultimaParte = partesSabDom.pop();
                textoMeses = `${partesSabDom.join(', ')}, así como ${ultimaParte}`;
              }
              
              partes.push(`los días ${textoMeses}, todos del referido año, por corresponder a sábados y domingos, inhábiles conforme lo previsto en artículo 19 de la Ley de la Materia`);
            }
          }
        }
        
        // Agregar otros días inhábiles con superíndices específicos para cada fundamento
        if (otrosDias.length > 0) {
          const añoPeriodo = resultado.fechaInicio.getFullYear();
          const añoTexto = añoPeriodo === 2024 ? 'dos mil veinticuatro' : añoPeriodo === 2025 ? 'dos mil veinticinco' : `${añoPeriodo}`;
          
          // Agrupar días por fundamento
          const diasPorFundamento: {[key: string]: string[]} = {};
          const notasAlPie: string[] = [];
          let numeroNota = 1;
          const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
          
          // Recorrer período y clasificar días inhábiles no-weekend
          const fechaTemp = new Date(resultado.fechaInicio);
          while (fechaTemp <= resultado.fechaFin) {
            const fechaStr = fechaTemp.toISOString().split('T')[0];
            const mesdia = `${String(fechaTemp.getMonth() + 1).padStart(2, '0')}-${String(fechaTemp.getDate()).padStart(2, '0')}`;
            
            if (fechaTemp.getDay() !== 0 && fechaTemp.getDay() !== 6) { // No es sábado ni domingo
              if (esDiaInhabil(fechaTemp, diasAdicionales, 'servidor')) {
                const diasAplicables = diasInhabilesData.filter(d => 
                  d.aplicaPara === 'todos' || d.aplicaPara === 'servidor'
                );
                
                // Buscar el fundamento específico
                const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
                if (diaFijo) {
                  const fechaTexto = fechaATexto(fechaStr);
                  const fundamento = diaFijo.fundamento;
                  
                  if (!diasPorFundamento[fundamento]) {
                    diasPorFundamento[fundamento] = [];
                  }
                  diasPorFundamento[fundamento].push(fechaTexto);
                }
              }
            }
            fechaTemp.setDate(fechaTemp.getDate() + 1);
          }
          
          // Agrupar días por mes/año para simplificar redacción
          const diasPorMesAño: {[key: string]: {fechas: string[], fundamentos: string[]}} = {};
          
          Object.keys(diasPorFundamento).forEach(fundamento => {
            const dias = diasPorFundamento[fundamento];
            if (dias && dias.length > 0) {
              dias.forEach(fechaCompleta => {
                const partes = fechaCompleta.split(' de ');
                const dia = partes[0]; // "dieciocho"
                const mes = partes[1]; // "marzo"
                const año = partes[2]; // "dos mil veinticuatro"
                const claveGrupo = `${mes} de ${año}`;
                
                if (!diasPorMesAño[claveGrupo]) {
                  diasPorMesAño[claveGrupo] = {fechas: [], fundamentos: []};
                }
                diasPorMesAño[claveGrupo].fechas.push(dia);
                diasPorMesAño[claveGrupo].fundamentos.push(fundamento);
              });
            }
          });
          
          // Generar texto agrupado con superíndices
          const partesOtrosDias: string[] = [];
          const fundamentosYaUsados: {[key: string]: string} = {}; // Mapeo de fundamento a superíndice
          
          Object.keys(diasPorMesAño).forEach(mesAño => {
            const grupo = diasPorMesAño[mesAño];
            
            // Agrupar días consecutivos y sus fundamentos únicos
            const fundamentosUnicos = [...new Set(grupo.fundamentos)];
            
            if (fundamentosUnicos.length === 1) {
              // Todos los días tienen el mismo fundamento
              const fundamento = fundamentosUnicos[0];
              let superindiceAUsar = fundamentosYaUsados[fundamento];
              
              if (!superindiceAUsar) {
                // Crear nueva nota
                superindiceAUsar = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
                fundamentosYaUsados[fundamento] = superindiceAUsar;
                notasAlPie.push(`${superindiceAUsar} ${fundamento}`);
                numeroNota++;
              }
              
              // Verificar si son días consecutivos para crear rangos
              const diasNumericos = grupo.fechas.map(dia => {
                const textoANumero: {[key: string]: number} = {
                  'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                  'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                  'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                };
                return textoANumero[dia] || 0;
              }).sort((a, b) => a - b);
              
              let textoFormateado = '';
              if (diasNumericos.length >= 3) {
                // Verificar si son consecutivos (para 3 o más días)
                let sonConsecutivos = true;
                for (let i = 1; i < diasNumericos.length; i++) {
                  if (diasNumericos[i] !== diasNumericos[i-1] + 1) {
                    sonConsecutivos = false;
                    break;
                  }
                }
                
                if (sonConsecutivos) {
                  // Mostrar como rango: "del dieciséis al treinta y uno"
                  const primerDia = grupo.fechas.find(dia => {
                    const textoANumero: {[key: string]: number} = {
                      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                    };
                    return textoANumero[dia] === diasNumericos[0];
                  });
                  const ultimoDia = grupo.fechas.find(dia => {
                    const textoANumero: {[key: string]: number} = {
                      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                    };
                    return textoANumero[dia] === diasNumericos[diasNumericos.length - 1];
                  });
                  textoFormateado = `del ${primerDia} al ${ultimoDia}${superindiceAUsar}`;
                } else {
                  // No son consecutivos, mostrar lista normal
                  const ultimoDia = grupo.fechas.pop();
                  textoFormateado = `${grupo.fechas.join(', ')} y ${ultimoDia}${superindiceAUsar}`;
                }
              } else if (diasNumericos.length === 2) {
                // Para dos días, verificar si son consecutivos
                if (diasNumericos[1] === diasNumericos[0] + 1) {
                  // Son consecutivos, mostrar como rango
                  const primerDia = grupo.fechas.find(dia => {
                    const textoANumero: {[key: string]: number} = {
                      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                    };
                    return textoANumero[dia] === diasNumericos[0];
                  });
                  const ultimoDia = grupo.fechas.find(dia => {
                    const textoANumero: {[key: string]: number} = {
                      'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
                      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
                      'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
                    };
                    return textoANumero[dia] === diasNumericos[1];
                  });
                  textoFormateado = `del ${primerDia} al ${ultimoDia}${superindiceAUsar}`;
                } else {
                  // No son consecutivos, mostrar con "y"
                  textoFormateado = `${grupo.fechas[0]} y ${grupo.fechas[1]}${superindiceAUsar}`;
                }
              } else {
                textoFormateado = `${grupo.fechas[0]}${superindiceAUsar}`;
              }
              
              partesOtrosDias.push(`el ${textoFormateado} de ${mesAño}`);
              
            } else {
              // Días con diferentes fundamentos - usar lógica original
              const diasConSuperindice = grupo.fechas.map((dia, index) => {
                const fundamento = grupo.fundamentos[index];
                let superindiceAUsar = fundamentosYaUsados[fundamento];
                
                if (!superindiceAUsar) {
                  superindiceAUsar = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
                  fundamentosYaUsados[fundamento] = superindiceAUsar;
                  notasAlPie.push(`${superindiceAUsar} ${fundamento}`);
                  numeroNota++;
                }
                
                return `${dia}${superindiceAUsar}`;
              });
              
              // Aplicar agrupación de días consecutivos manteniendo superíndices
              const textoAgrupadoConSuperindices = agruparDiasConSuperindices(diasConSuperindice);
              partesOtrosDias.push(`el ${textoAgrupadoConSuperindices} de ${mesAño}`);
            }
          });
          
          if (partesOtrosDias.length > 0) {
            let textoOtrosDias;
            if (partesOtrosDias.length === 1) {
              textoOtrosDias = `y ${partesOtrosDias[0]}, que también son inhábiles`;
            } else {
              const ultimaParte = partesOtrosDias.pop();
              textoOtrosDias = `y ${partesOtrosDias.join(', ')} y ${ultimaParte}, que también son inhábiles`;
            }
            partes.push(textoOtrosDias);
            
            // Guardar las notas para usar después
            // generarDiasInhabilesParaResolucion.notasAlPie = notasAlPie;
          }
        }
        
        return partes.join('; y ');
      };
      
      const diasInhabilesTextoResolucion = generarDiasInhabilesParaResolucion();
      
      let texto = `\t\tLa presentación de la demanda es ${oportunidadTexto}, pues la norma reclamada como autoaplicativa entró en vigor el ${resultado.fechaNotificacionTexto}, por lo que de conformidad con lo previsto en la parte final del artículo 18 de la Ley de Amparo, el cómputo inició a partir de ese día y concluyó el ${extraerSoloDia(resultado.fechaFinTexto)} siguiente; lo anterior al excluir ${diasInhabilesTextoResolucion}.
\t\tPor ende, si la demanda se presentó el ${extraerDiaMes(resultado.fechaPresentacionTexto)} del referido año, es inconcuso que su presentación ${resultado.esOportuno ? 'es oportuna' : 'es extemporánea'}.`;
      
      // Agregar notas al pie específicas si hay otros días inhábiles
      // if (generarDiasInhabilesParaResolucion.notasAlPie && generarDiasInhabilesParaResolucion.notasAlPie.length > 0) {
      //   texto += '\n\n__________________________________\n';
      //   generarDiasInhabilesParaResolucion.notasAlPie.forEach((nota: string) => {
      //     texto += `${nota}\n`;
      //   });
      // }
      
      return texto;
    }
    
    // Casos con plazo "en cualquier tiempo"
    if (resultado.plazo === 'En cualquier tiempo') {
      let texto = '';
      
      if (formData.resolucionImpugnada === 'omision_legislativa_absoluta') {
        // Caso 3: Omisión legislativa absoluta
        texto = `\t\tLa presentación del amparo es oportuna. El promovente impugna una omisión legislativa absoluta, la cual puede impugnarse en cualquier tiempo mientras persista la omisión, de conformidad con la ${resultado.fundamento}.`;
      } else {
        // Caso 2: Actos específicos sin plazo
        const actosTexto = {
          'actos_22_constitucional': 'actos que importen peligro de privación de la vida, u otros previstos en el artículo 22 constitucional',
          'dilacion_excesiva': 'dilación excesiva en el procedimiento'
        };
        
        const actoDescripcion = actosTexto[formData.resolucionImpugnada as keyof typeof actosTexto] || 'el acto reclamado';
        texto = `\t\tLa presentación del amparo es oportuna, pues el promovente impugna ${actoDescripcion}, el cual puede impugnarse en cualquier tiempo de conformidad con el ${resultado.fundamento}.`;
      }
      
      return texto;
    }
    
    // Caso especial: Procedimiento de extradición (usando la lógica de ley entrada en vigor como referencia)
    if (formData.resolucionImpugnada === 'procedimiento_extradicion') {
      const oportunidadTexto = resultado.esOportuno ? 'oportuna' : 'extemporánea';
      
      // Verificar si se presentó antes de que iniciara el plazo
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const presentadaAntesDeInicio = fechaPres < resultado.fechaInicio;
      
      // Función para generar días inhábiles específicos para resolución
      const generarDiasInhabilesParaResolucion = () => {
        const diasPorFundamento: {[key: string]: string[]} = {};
        const diasYaIncluidos = new Set<string>();
        let hayFinDeSemana = false;
        const partes: string[] = [];
        const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        let notasAlPie: string[] = [];
        let numeroNota = 1;
        
        // Obtener todos los días inhábiles del período
        const fechaTemp = new Date(resultado.fechaInicio);
        while (fechaTemp <= resultado.fechaFin) {
          const fechaStr = fechaTemp.toISOString().split('T')[0];
          const año = fechaTemp.getFullYear();
          
          if (fechaTemp.getDay() === 0 || fechaTemp.getDay() === 6) {
            hayFinDeSemana = true;
          } else {
            const mesdia = `${String(fechaTemp.getMonth() + 1).padStart(2, '0')}-${String(fechaTemp.getDate()).padStart(2, '0')}`;
            const diasAplicables = diasInhabilesData.filter(d => d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario);
            
            const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
            if (diaFijo) {
              const fechaTexto = fechaATexto(fechaStr);
              if (!diasPorFundamento[diaFijo.fundamento]) {
                diasPorFundamento[diaFijo.fundamento] = [];
              }
              diasPorFundamento[diaFijo.fundamento].push(fechaTexto);
            }
            
            const diasMoviles = calcularDiasMoviles(año);
            const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
            if (diaMovil) {
              const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
              if (diaMovilInfo) {
                const fechaTexto = fechaATexto(fechaStr);
                if (!diasPorFundamento[diaMovilInfo.fundamento]) {
                  diasPorFundamento[diaMovilInfo.fundamento] = [];
                }
                diasPorFundamento[diaMovilInfo.fundamento].push(fechaTexto);
              }
            }
          }
          fechaTemp.setDate(fechaTemp.getDate() + 1);
        }
        
        // Agrupar días por mes/año para simplificar redacción
        const diasPorMesAño: {[key: string]: {fechas: string[], fundamentos: string[]}} = {};
        
        Object.keys(diasPorFundamento).forEach(fundamento => {
          const dias = diasPorFundamento[fundamento];
          if (dias && dias.length > 0) {
            dias.forEach(fechaCompleta => {
              const partes = fechaCompleta.split(' de ');
              const dia = partes[0];
              const mes = partes[1];
              const año = partes[2];
              const claveGrupo = `${mes} de ${año}`;
              
              if (!diasPorMesAño[claveGrupo]) {
                diasPorMesAño[claveGrupo] = {fechas: [], fundamentos: []};
              }
              diasPorMesAño[claveGrupo].fechas.push(dia);
              diasPorMesAño[claveGrupo].fundamentos.push(fundamento);
            });
          }
        });
        
        // Generar texto agrupado con superíndices
        const partesOtrosDias: string[] = [];
        Object.keys(diasPorMesAño).forEach(mesAño => {
          const grupo = diasPorMesAño[mesAño];
          const diasConSuperindice = grupo.fechas.map((dia, index) => {
            const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
            notasAlPie.push(`${superindice} ${grupo.fundamentos[index]}`);
            numeroNota++;
            return `${dia}${superindice}`;
          });
          
          if (diasConSuperindice.length === 1) {
            partesOtrosDias.push(`el ${diasConSuperindice[0]} de ${mesAño}`);
          } else {
            const ultimoDia = diasConSuperindice.pop();
            partesOtrosDias.push(`el ${diasConSuperindice.join(', ')} y ${ultimoDia} de ${mesAño}`);
          }
        });
        
        if (partesOtrosDias.length > 0) {
          let textoOtrosDias;
          if (partesOtrosDias.length === 1) {
            textoOtrosDias = `además ${partesOtrosDias[0]}, que también son inhábiles`;
          } else {
            const ultimaParte = partesOtrosDias.pop();
            textoOtrosDias = `además ${partesOtrosDias.join(', ')} y ${ultimaParte}, que también son inhábiles`;
          }
          partes.push(textoOtrosDias);
          
          // generarDiasInhabilesParaResolucion.notasAlPie = notasAlPie;
        }
        
        return partes.join('; y ');
      };
      
      const diasInhabilesTextoResolucion = generarDiasInhabilesParaResolucion();
      
      // Generar año en texto para evitar repetición de "citado año"
      const añoTexto = (() => {
        const año = resultado.fechaInicio.getFullYear();
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
      })();
      
      // Determinar texto de cuándo surtió efectos según el tipo de notificación
      const efectosTexto = (() => {
        const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                           (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
        const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        const fechaSurte = resultado.fechaSurte;
        
        if (esAutoridad || formData.formaNotificacion === 'electronica') {
          return 'ese mismo día';
        } else if (fechaNotif.toDateString() === fechaSurte.toDateString()) {
          return 'ese mismo día';
        } else {
          return `el ${extraerSoloDia(getFechaSurteEfectos())} siguiente`;
        }
      })();
      
      let texto = `\t\tLa presentación de la demanda es ${oportunidadTexto}, pues la parte quejosa fue notificada ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'lista' ? 'por lista' : formData.formaNotificacion === 'oficio' ? 'por oficio' : 'en forma electrónica'} del inicio del procedimiento de extradición el ${resultado.fechaNotificacionTexto}, y la notificación surtió efectos ${efectosTexto}, de conformidad con lo previsto en el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días a que alude el artículo 17, fracción I, de la Ley de Amparo, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)} del referido año, de acuerdo con lo previsto en el diverso numeral 18 de la referida ley; lo anterior con exclusión de los días ${diasInhabilesTextoResolucion}.
\t\tPor ende, si la demanda se presentó el ${extraerDiaMes(resultado.fechaPresentacionTexto)} de ${añoTexto}, es inconcuso que su presentación ${presentadaAntesDeInicio ? 'ocurrió oportunamente, pues en esa fecha aún no iniciaba el plazo' : resultado.esOportuno ? 'es oportuna' : 'es extemporánea'}.`;
      
      // Agregar notas al pie específicas si hay otros días inhábiles
      // if (generarDiasInhabilesParaResolucion.notasAlPie && generarDiasInhabilesParaResolucion.notasAlPie.length > 0) {
      //   texto += '\n\n__________________________________\n';
      //   generarDiasInhabilesParaResolucion.notasAlPie.forEach((nota: string) => {
      //     texto += `${nota}\n`;
      //   });
      // }
      
      return texto;
    }
    
    // Caso especial: Ley con motivo de acto de aplicación
    if (formData.resolucionImpugnada === 'ley_acto_aplicacion') {
      const oportunidadTexto = resultado.esOportuno ? 'oportuna' : 'extemporánea';
      
      // Verificar si se presentó antes de que iniciara el plazo
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const presentadaAntesDeInicio = fechaPres < resultado.fechaInicio;
      
      // Obtener días inhábiles con fundamento inline si es solo artículo 19
      const diasInhabilesInfo = obtenerDiasInhabilesParaTexto(resultado.fechaInicio, resultado.fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario, resultado.fechaNotificacion);
      let diasInhabilesTexto = diasInhabilesInfo.texto;
      
      // Si solo hay notas del artículo 19, incluir el fundamento inline
      if (diasInhabilesInfo.notas.length === 1 && diasInhabilesInfo.notas[0].includes('artículo 19')) {
        diasInhabilesTexto = diasInhabilesTexto.replace(/¹$/, ', inhábiles conforme lo previsto en artículo 19 de la Ley de la Materia');
      }
      
      // Extraer el año del texto
      const obtenerAnoTexto = (fechaTexto: string) => {
        const partes = fechaTexto.split(' de ');
        return partes[partes.length - 1] || 'dos mil veinticinco';
      };
      
      const anoTexto = obtenerAnoTexto(resultado.fechaNotificacionTexto);
      
      // Determinar la fracción correcta según el tipo de acto reclamado
      const obtenerFraccionArticulo17 = () => {
        switch (formData.resolucionImpugnada) {
          case 'ley_entrada_vigor':
          case 'ley_acto_aplicacion':
          case 'procedimiento_extradicion':
            return 'I';
          case 'actos_22_constitucional':
            return 'IV';
          case 'acto_restrictivo_libertad':
          case 'fecha_lejana_audiencia':
          case 'omision_legislativa_relativa':
          default:
            return 'I'; // Por defecto fracción I para actos ordinarios
        }
      };
      
      // Generar año en texto para evitar repetición de "citado año"
      const añoTexto = (() => {
        const año = resultado.fechaInicio.getFullYear();
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
      })();
      
      // Determinar texto de cuándo surtió efectos según el tipo de notificación
      const efectosTexto = (() => {
        const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                           (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
        const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        const fechaSurte = resultado.fechaSurte;
        
        if (esAutoridad || formData.formaNotificacion === 'electronica') {
          // Mismo día
          return 'ese mismo día';
        } else if (fechaNotif.toDateString() === fechaSurte.toDateString()) {
          // Mismo día
          return 'ese mismo día';
        } else {
          // Día siguiente
          return `el ${extraerSoloDia(getFechaSurteEfectos())} siguiente`;
        }
      })();
      
      let texto = '';
      
      // Caso especial para sentencias penales con pena de prisión (8 años)
      if (formData.tipoSupuesto === 'penal' && formData.resolucionImpugnada === 'sentencia_condenatoria_penal') {
        texto = `\t\tLa presentación de la demanda es ${oportunidadTexto}, pues la parte quejosa fue notificada ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'lista' ? 'por lista' : formData.formaNotificacion === 'oficio' ? 'por oficio' : 'en forma electrónica'} el ${getFechaNotificacion()}, y la notificación surtió efectos ${efectosTexto}, de conformidad con lo previsto en el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} a que alude el artículo 17, fracción II, de la Ley de Amparo, transcurrió del ${extraerDiaMes(getFechaInicio())} al ${extraerDiaMes(getFechaFin())}, sin excluir días inhábiles en el cómputo del plazo, conforme a lo previsto en dicha disposición legal.`;
        
        // Agregar información sobre días inhábiles solo entre notificación y surtimiento
        if (resultado.diasInhabilesTexto && resultado.diasInhabilesTexto !== 'No hubo días inhábiles entre la fecha de notificación y aquella en que surtió efectos') {
          texto += `\n\t\t${resultado.diasInhabilesTexto}.`;
        }
        
        texto += `\n\t\tPor ende, si la demanda se presentó el ${extraerDiaMes(getFechaPresentacion())} de ${añoTexto}, es inconcuso que su presentación ${presentadaAntesDeInicio ? 'ocurrió oportunamente, pues en esa fecha aún no iniciaba el plazo' : resultado.esOportuno ? 'es oportuna' : 'es extemporánea'}.`;
      } else {
        // Caso general (no penal)
        texto = `\t\tLa presentación de la demanda es ${oportunidadTexto}, pues la parte quejosa fue notificada ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'lista' ? 'por lista' : formData.formaNotificacion === 'oficio' ? 'por oficio' : 'en forma electrónica'} el ${getFechaNotificacion()}, y la notificación surtió efectos ${efectosTexto}, de conformidad con lo previsto en el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días a que alude el artículo 17, fracción ${obtenerFraccionArticulo17()}, de dicha legislación, transcurrió del ${extraerDiaMes(getFechaInicio())} al ${extraerDiaMes(getFechaFin())} del referido año, de acuerdo con lo previsto en el diverso numeral 18 de la referida ley; lo anterior con exclusión de los días ${diasInhabilesTexto}.
\t\tPor ende, si la demanda se presentó el ${extraerDiaMes(getFechaPresentacion())} de ${añoTexto}, es inconcuso que su presentación ${presentadaAntesDeInicio ? 'ocurrió oportunamente, pues en esa fecha aún no iniciaba el plazo' : resultado.esOportuno ? 'es oportuna' : 'es extemporánea'}.`;
      }
      
      // Agregar notas al pie si hay más de un fundamento
      if (diasInhabilesInfo.notas.length > 1 || (diasInhabilesInfo.notas.length === 1 && !diasInhabilesInfo.notas[0].includes('artículo 19'))) {
        texto += '\n\n__________________________________\n';
        diasInhabilesInfo.notas.forEach((nota: string, index: number) => {
          texto += `${index + 1} ${nota}\n`;
        });
      }
      
      return texto;
    }
    
    // Determinar texto de cuándo surtió efectos según el tipo de notificación para revisión
    const efectosTextoRevision = (() => {
      const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                         (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
      const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
      const fechaSurte = resultado.fechaSurte;
      
      if (esAutoridad || formData.formaNotificacion === 'electronica') {
        // Mismo día
        return 'ese mismo día';
      } else if (fechaNotif.toDateString() === fechaSurte.toDateString()) {
        // Mismo día
        return 'ese mismo día';
      } else {
        // Día siguiente
        return `el ${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`;
      }
    })();
    
    // Texto estándar para casos con plazo específico
    let texto = '';
    
    if (formData.tipoDemanda === 'adhesivo') {
      // Texto específico para amparo directo adhesivo
      texto = `\t\tLa presentación del amparo directo adhesivo es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación del auto de admisión de la demanda de amparo principal se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, el ${resultado.fechaNotificacionTexto}, y surtió efectos ${efectosTextoRevision}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso artículo 181 de la Ley de Amparo, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)}, todos del referido año, con exclusión de los días ${resultado.diasInhabilesTexto}.

\t\tPor ende, si el referido amparo adhesivo se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    } else {
      // Texto para amparo directo principal
      texto = `\t\tLa presentación de la demanda de amparo directo es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación ${formData.resolucionImpugnada === 'auto' ? 'del acuerdo impugnado' : formData.resolucionImpugnada === 'sentencia' ? 'de la sentencia impugnada' : 'de la interlocutoria dictada en el incidente de suspensión'} se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, ${parteTexto} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, y surtió efectos ${efectosTextoRevision}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso ${resultado.fundamento}, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)}, todos del referido año, con exclusión de los días ${resultado.diasInhabilesTexto}.

\t\tPor ende, si la referida demanda de amparo se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    }
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPieTexto && resultado.notasAlPieTexto.length > 0) {
      texto += '\n\n\n';
      texto += '\n__________________________________\n';
      texto += '\n';
      resultado.notasAlPieTexto.forEach((nota: string) => {
        texto += `${nota}\n`;
      });
    }
    
    return texto;
  };

  const generarTextoFormateado = () => {
    const textoBase = generarTexto();
    if (!textoBase) return '';
    
    // Dividir el texto en partes: contenido principal y notas al pie
    const partes = textoBase.split('__________________________________');
    
    if (partes.length === 1) {
      // No hay notas al pie
      return `<p style="text-indent: 2em; margin-bottom: 1em;">${partes[0].trim()}</p>`;
    }
    
    // Hay notas al pie
    const contenidoPrincipal = partes[0].trim();
    const notasAlPie = partes[1].trim();
    
    let html = `<p style="text-indent: 2em; margin-bottom: 1em;">${contenidoPrincipal}</p>`;
    html += '<div style="margin-top: 2em; padding-top: 1em; border-top: 1px solid #000;">';
    html += '<div style="margin-bottom: 0.5em;">__________________________________</div>';
    
    if (notasAlPie) {
      const lineasNotas = notasAlPie.split('\n').filter(linea => linea.trim());
      lineasNotas.forEach(nota => {
        html += `<div style="margin-bottom: 0.3em;">${nota}</div>`;
      });
    }
    
    html += '</div>';
    
    return html;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE8', position: 'relative' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
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
                borderRadius: '20px'
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
            Amparo Directo
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
                    Tipo de Demanda
                  </label>
                  <select 
                    name="tipoDemanda" 
                    value={formData.tipoDemanda} 
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem', 
                      transition: 'all 0.3s ease', 
                      backgroundColor: 'transparent', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#1C1C1C', 
                      cursor: 'pointer' 
                    }} 
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                    required
                    suppressHydrationWarning={true}
                  >
                    <option value="">Seleccione...</option>
                    <option value="directo">Amparo Directo</option>
                    <option value="adhesivo">Amparo directo adhesivo</option>
                  </select>
                </div>
                
                {formData.tipoDemanda === 'directo' && (
                  <div className="md:col-span-2">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="k-law-label" style={{ color: '#1C1C1C', fontWeight: '600', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>
                        La persona quejosa se ubica en alguno de los siguientes supuestos:
                      </span>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="supuestoAgrario" 
                            value="si" 
                            checked={formData.supuestoAgrario === 'si'} 
                            onChange={handleChange} 
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span style={{ color: '#1C1C1C', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>SÍ</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="supuestoAgrario" 
                            value="no" 
                            checked={formData.supuestoAgrario === 'no'} 
                            onChange={handleChange} 
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span style={{ color: '#1C1C1C', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>NO</span>
                        </label>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingLeft: formData.supuestoAgrario === 'si' ? '1rem' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        {formData.supuestoAgrario === 'si' && (
                          <input 
                            type="checkbox" 
                            name="tipoSupuesto" 
                            value="agrario"
                            checked={formData.tipoSupuesto === 'agrario'} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  tipoSupuesto: 'agrario',
                                  // Limpiar opciones incompatibles con el supuesto agrario
                                  parteRecurrente: formData.parteRecurrente === 'sentenciado' || formData.parteRecurrente === 'victima' ? '' : formData.parteRecurrente,
                                  resolucionImpugnada: formData.resolucionImpugnada === 'laudo' || formData.resolucionImpugnada === 'sentencia_condenatoria_penal' ? '' : formData.resolucionImpugnada
                                });
                              }
                            }}
                            style={{ marginRight: '0.5rem', marginTop: '0.125rem' }}
                          />
                        )}
                        <span style={{ fontSize: '0.875rem', color: '#3D3D3D', fontFamily: 'Inter, sans-serif' }}>
                          {formData.supuestoAgrario !== 'si' && '• '}Avecindados, personas ejidatarias o comuneras en particular (cuyos bienes o derechos agrarios se ven afectados con el acto reclamado)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {formData.supuestoAgrario === 'si' && (
                          <input 
                            type="checkbox" 
                            name="tipoSupuesto" 
                            value="penal"
                            checked={formData.tipoSupuesto === 'penal'} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  tipoSupuesto: 'penal',
                                  resolucionImpugnada: 'sentencia_condenatoria_penal',
                                  parteRecurrente: 'sentenciado',
                                  leyDelActo: 'codigo_nacional_penal'
                                });
                              }
                            }}
                            style={{ marginRight: '0.5rem', marginTop: '0.125rem' }}
                          />
                        )}
                        <span style={{ fontSize: '0.875rem', color: '#3D3D3D', fontFamily: 'Inter, sans-serif' }}>
                          {formData.supuestoAgrario !== 'si' && '• '}Persona sentenciada con pena de prisión en un proceso penal
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && camposDeshabilitados() && (
                  <div className="md:col-span-2" style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      color: '#92400E',
                      fontSize: '0.875rem',
                      fontFamily: 'Inter, sans-serif',
                      margin: 0
                    }}>
                      ⚠️ {!formData.supuestoAgrario 
                        ? 'Por favor, primero indique si la persona quejosa se ubica en alguno de los supuestos especiales.' 
                        : 'Por favor, seleccione el tipo de supuesto en el que se ubica la persona quejosa.'}
                    </p>
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && (
                  <div>
                    <label className="block" style={{ 
                    color: '#1C1C1C', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.95rem', 
                    fontFamily: 'Inter, sans-serif' 
                  }}>
                    Acto Reclamado
                  </label>
                  <select 
                    name="resolucionImpugnada" 
                    value={formData.resolucionImpugnada} 
                    onChange={handleChange} 
                    disabled={camposDeshabilitados() || formData.tipoSupuesto === 'penal'}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1.5px solid #1C1C1C', 
                      borderRadius: '8px', 
                      fontSize: '0.95rem', 
                      transition: 'all 0.3s ease', 
                      backgroundColor: 'transparent', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#1C1C1C', 
                      cursor: (camposDeshabilitados() || formData.tipoSupuesto === 'penal') ? 'not-allowed' : 'pointer',
                      opacity: (camposDeshabilitados() || formData.tipoSupuesto === 'penal') ? 0.6 : 1
                    }} 
                    onFocus={(e) => !camposDeshabilitados() && formData.tipoSupuesto !== 'penal' && (e.currentTarget.style.borderColor = '#C5A770')} 
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                    required
                    suppressHydrationWarning={true}
                  >
                    <option value="">Seleccione...</option>
                    <option value="sentencia_definitiva">Sentencia definitiva</option>
                    {formData.tipoSupuesto !== 'agrario' && (
                      <option value="laudo">Laudo</option>
                    )}
                    <option value="resolucion_fin_juicio">Resolución que pone fin a juicio</option>
                    {formData.tipoSupuesto !== 'agrario' && (
                      <option value="sentencia_condenatoria_penal">Sentencia definitiva condenatoria en un proceso penal</option>
                    )}
                    </select>
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && (
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Promovente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} disabled={camposDeshabilitados() || formData.tipoSupuesto === 'penal'} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.3s ease', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', cursor: (camposDeshabilitados() || formData.tipoSupuesto === 'penal') ? 'not-allowed' : 'pointer', opacity: (camposDeshabilitados() || formData.tipoSupuesto === 'penal') ? 0.6 : 1 }} onFocus={(e) => !camposDeshabilitados() && formData.tipoSupuesto !== 'penal' && (e.currentTarget.style.borderColor = '#C5A770')} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                    <option value="">Seleccione...</option>
                    {formData.tipoSupuesto !== 'agrario' && (
                      <option value="sentenciado">Sentenciado</option>
                    )}
                    <option value="actor">Actor</option>
                    <option value="demandado">Demandado</option>
                    {formData.tipoSupuesto !== 'agrario' && (
                      <option value="victima">Víctima o persona ofendida</option>
                    )}
                    </select>
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && formData.resolucionImpugnada === 'ley_entrada_vigor' ? (
                  <div>
                    <label className="k-law-label block">Fecha de entrada en vigor</label>
                    <input 
                      type="date" 
                      name="fechaNotificacion" 
                      value={formData.fechaNotificacion} 
                      onChange={(e) => {
                        const newFormData = { ...formData, fechaNotificacion: e.target.value, tipoFecha: 'entrada_vigor' };
                        setFormData(newFormData);
                      }} 
                      disabled={camposDeshabilitados()}
                      className="k-law-input" 
                      style={{ cursor: camposDeshabilitados() ? 'not-allowed' : 'text', opacity: camposDeshabilitados() ? 0.6 : 1 }}
                      required 
                    />
                  </div>
                ) : formData.tipoDemanda === 'directo' && formData.resolucionImpugnada === 'actos_22_constitucional' ? (
                  <div className="k-law-alert-warning">
                    <p className="text-sm text-yellow-100">
                      <strong>Acto reclamable en cualquier tiempo</strong><br/>
                      Los actos que importen peligro de privación de la vida pueden reclamarse en cualquier tiempo conforme al artículo 17, fracción IV, de la Ley de Amparo.
                    </p>
                  </div>
                ) : formData.tipoDemanda === 'directo' ? (
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de notificación</label>
                    <input 
                      type="date" 
                      name="fechaNotificacion" 
                      value={formData.fechaNotificacion} 
                      onChange={handleChange} 
                      disabled={camposDeshabilitados()}
                      style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease', cursor: camposDeshabilitados() ? 'not-allowed' : 'pointer', opacity: camposDeshabilitados() ? 0.6 : 1 }} 
                      onFocus={(e) => !camposDeshabilitados() && (e.target.style.borderColor = '#C5A770')} 
                      onBlur={(e) => e.target.style.borderColor = '#1C1C1C'}
                      required 
                    />
                  </div>
                ) : (
                  // Amparo directo adhesivo
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>
                      Fecha de notificación del auto de admisión de la demanda de amparo principal
                    </label>
                    <input 
                      type="date" 
                      name="fechaNotificacion" 
                      value={formData.fechaNotificacion} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} 
                      onFocus={(e) => e.target.style.borderColor = '#C5A770'} 
                      onBlur={(e) => e.target.style.borderColor = '#1C1C1C'}
                      required 
                    />
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && formData.tipoFecha === 'notificacion' && formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                  <div>
                    <SelectorLeyNotificacion 
                      tipoNotificacion={formData.formaNotificacion}
                      leySeleccionada={(formData as any).leyDelActo || ''}
                      onLeySeleccionada={(ley) => {
                        setFormData(prev => ({...prev, leyDelActo: ley}));
                      }}
                    />
                  </div>
                )}
                
                {formData.tipoDemanda === 'directo' && formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && formData.tipoFecha === 'notificacion' && (
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                    <select 
                      name="formaNotificacion" 
                      value={formData.formaNotificacion} 
                      onChange={handleChange} 
                      className="k-law-select" 
                      disabled={camposDeshabilitados()}
                      style={{ borderColor: '#1C1C1C', borderRadius: '12px', fontSize: '0.95rem', transition: 'border-color 0.3s ease', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', width: '100%', padding: '0.75rem', cursor: camposDeshabilitados() ? 'not-allowed' : 'pointer', opacity: camposDeshabilitados() ? 0.6 : 1 }} 
                      onFocus={(e) => !camposDeshabilitados() && (e.currentTarget.style.borderColor = '#C5A770')} 
                      onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_nacional_penal' ? (
                        <>
                          <option value="personal_audiencia">Personalmente, en audiencia</option>
                          <option value="personal_correo_electronico">Personalmente, por correo electrónico</option>
                          <option value="personal_telefono">Personalmente, por teléfono</option>
                          <option value="personal_domicilio">Personalmente, en su domicilio</option>
                          <option value="personal_instructivo">Por instructivo en su domicilio</option>
                          <option value="personal_instalaciones">Personalmente, en las instalaciones del órgano jurisdiccional</option>
                          <option value="personal_detencion">Personalmente, en el lugar de la detención</option>
                          <option value="correo_certificado">Por correo certificado (poner fecha de recepción)</option>
                          <option value="edictos">Por edictos</option>
                          <option value="boletin_jurisdiccional">Por boletín jurisdiccional</option>
                          <option value="estrados">Por estrados</option>
                          <option value="lista">Por lista</option>
                          <option value="electronica">Por medios electrónicos (poner fecha en que por sistema se confirmó la recepción)</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_federal_civil' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="cedula">Por cédula</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="telegrama">Por telegrama</option>
                          <option value="rotulon">Por rotulón</option>
                          <option value="instructivo">Por instructivo</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_comercio' ? (
                        <>
                          <option value="personal">Notificaciones personales</option>
                          <option value="boletin_judicial">Por Boletín Judicial</option>
                          <option value="gaceta_judicial">Por Gaceta Judicial</option>
                          <option value="periodico_judicial">Por Periódico Judicial</option>
                          <option value="estrados">Por estrados</option>
                          <option value="correo">Por correo</option>
                          <option value="telegrafo">Por telégrafo</option>
                          <option value="edictos">Por edictos</option>
                          <option value="audiencia">En audiencia</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_procedimiento_administrativo' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="correo_certificado_acuse">Por correo certificado con acuse de recibo</option>
                          <option value="mensajeria_acuse">Por mensajería, con acuse de recibo</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="electronica">Por medios electrónicos</option>
                          <option value="oficio">Por oficio</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_seguro_social' ? (
                        <>
                          <option value="medios_magneticos_digitales">a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos o de cualquier otra naturaleza</option>
                          <option value="buzon_imss">a través del Buzón IMSS</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_fiscal_federacion' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="estrados">Por estrados (en la fecha de notificación ponga la del decimoprimer día contado a partir del día siguiente a aquél en el que se hubiera publicado el documento)</option>
                          <option value="edictos">Por edictos</option>
                          <option value="buzon_tributario">Por buzón tributario</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_nacional_civil_familiar' ? (
                        <>
                          <option value="personalmente">Personalmente</option>
                          <option value="comunicacion_judicial">Por medio de comunicación judicial, según corresponda</option>
                          <option value="edictos">Por edictos</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="telegrafo">Por telégrafo</option>
                          <option value="audiencia_juicio_oral">En audiencia en juicio oral</option>
                          <option value="comunicacion_electronica">Por cualquier otro medio de comunicación electrónica o sistema de justicia digital</option>
                          <option value="adhesion">Por adhesión</option>
                          <option value="cedula">Por cédula</option>
                          <option value="instructivo">Por instructivo</option>
                          <option value="correo_electronico">Por correo electrónico</option>
                          <option value="boletin_judicial">Por boletín Judicial</option>
                          <option value="cedula_1027_1028">Por cédula (artículos 1027 y 1028)</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_general_educacion' ? (
                        <>
                          <option value="visita_vigilancia">Mediante visita de vigilancia</option>
                          <option value="otra_lfpa">Otra forma de notificación de las previstas en la LFPA</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_navegacion_comercio' ? (
                        <>
                          {/* Opciones específicas de LNCM */}
                          <option value="personal">Personal</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="edictos">Por edictos</option>
                          <option value="estrados">Por estrados</option>
                          
                          {/* Separador visual */}
                          <option disabled>--- Otras previstas en la LFPA ---</option>
                          
                          {/* Catálogo completo de LFPA */}
                          <option value="personal_lfpa">Personal (LFPA)</option>
                          <option value="correo_certificado_acuse_lfpa">Por correo certificado con acuse de recibo (LFPA)</option>
                          <option value="mensajeria_acuse_lfpa">Por mensajería, con acuse de recibo (LFPA)</option>
                          <option value="estrados_lfpa">Por estrados (LFPA)</option>
                          <option value="edictos_lfpa">Por edictos (LFPA)</option>
                          <option value="electronica_lfpa">Por medios electrónicos (LFPA)</option>
                          <option value="oficio_lfpa">Por oficio (LFPA)</option>
                          <option value="correo_ordinario_lfpa">Por correo ordinario (LFPA)</option>
                          <option value="telegrama_lfpa">Por telegrama (LFPA)</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_aduanera' ? (
                        <>
                          {/* Opciones específicas de Ley Aduanera */}
                          <option value="notificaciones_electronicas">Notificaciones electrónicas</option>
                          <option value="estrados">Por estrados</option>
                          <option value="avisos_autorizacion">Los avisos de autorización y de revocación</option>
                        </>
                      ) : (
                        <>
                          <option value="personal">Personalmente</option>
                          <option value="oficio">Por oficio</option>
                          <option value="lista">Por lista</option>
                          <option value="electronica">En forma electrónica</option>
                          <option value="boletin">Por boletín</option>
                          <option value="estrados">Por estrados</option>
                          <option value="boletin_jurisdiccional">Por boletín jurisdiccional</option>
                          <option value="edictos">Por edictos</option>
                        </>
                      )}
                    </select>
                    
                    {/* Dropdown cascada para LFPA cuando se selecciona "otra_lfpa" en LGE */}
                    {mapearLeyAIdentificador(formData.leyDelActo) === 'ley_general_educacion' && formData.formaNotificacion === 'otra_lfpa' && (
                      <div style={{ marginTop: '1rem' }}>
                        {/* Advertencia LFPA */}
                        <div style={{
                          backgroundColor: '#FEE2E2',
                          border: '2px solid #DC2626',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem'
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
                        
                        {/* Selector específico de LFPA */}
                        <label className="block" style={{ 
                          color: '#1C1C1C', 
                          fontWeight: '600', 
                          marginBottom: '0.5rem', 
                          fontSize: '0.95rem', 
                          fontFamily: 'Inter, sans-serif' 
                        }}>
                          Forma específica de notificación (LFPA)
                        </label>
                        <select
                          name="formaNotificacionLFPA"
                          value={formData.formaNotificacionLFPA || ''}
                          onChange={handleChange}
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
                          <option value="personal">Personal</option>
                          <option value="correo_certificado_acuse">Por correo certificado con acuse de recibo</option>
                          <option value="mensajeria_acuse">Por mensajería, con acuse de recibo</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="medios_electronicos">Por medios electrónicos</option>
                          <option value="oficio">Por oficio</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                          <option value="medios_magneticos_digitales">a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos o de cualquier otra naturaleza en los términos del Código</option>
                          <option value="buzon_imss">a través del Buzón IMSS</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
                
                {formData.tipoDemanda === 'adhesivo' && (
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                    <select 
                      name="formaNotificacion" 
                      value={formData.formaNotificacion} 
                      onChange={handleChange} 
                      className="k-law-select" 
                      style={{ borderColor: '#1C1C1C', borderRadius: '12px', fontSize: '0.95rem', transition: 'border-color 0.3s ease', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', width: '100%', padding: '0.75rem' }} 
                      onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                      onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_nacional_penal' ? (
                        <>
                          <option value="personal_audiencia">Personalmente, en audiencia</option>
                          <option value="personal_correo_electronico">Personalmente, por correo electrónico</option>
                          <option value="personal_telefono">Personalmente, por teléfono</option>
                          <option value="personal_domicilio">Personalmente, en su domicilio</option>
                          <option value="personal_instructivo">Por instructivo en su domicilio</option>
                          <option value="personal_instalaciones">Personalmente, en las instalaciones del órgano jurisdiccional</option>
                          <option value="personal_detencion">Personalmente, en el lugar de la detención</option>
                          <option value="correo_certificado">Por correo certificado (poner fecha de recepción)</option>
                          <option value="electronica">Por medios electrónicos (poner fecha en que por sistema se confirmó la recepción)</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_federal_civil' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="cedula">Por cédula</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="telegrama">Por telegrama</option>
                          <option value="rotulon">Por rotulón</option>
                          <option value="instructivo">Por instructivo</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_comercio' ? (
                        <>
                          <option value="personal">Notificaciones personales</option>
                          <option value="boletin_judicial">Por Boletín Judicial</option>
                          <option value="gaceta_judicial">Por Gaceta Judicial</option>
                          <option value="periodico_judicial">Por Periódico Judicial</option>
                          <option value="estrados">Por estrados</option>
                          <option value="correo">Por correo</option>
                          <option value="telegrafo">Por telégrafo</option>
                          <option value="edictos">Por edictos</option>
                          <option value="audiencia">En audiencia</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_federal_procedimiento_administrativo' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="correo_certificado_acuse">Por correo certificado con acuse de recibo</option>
                          <option value="mensajeria_acuse">Por mensajería, con acuse de recibo</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="electronica">Por medios electrónicos</option>
                          <option value="oficio">Por oficio</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_seguro_social' ? (
                        <>
                          <option value="medios_magneticos_digitales">a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos o de cualquier otra naturaleza</option>
                          <option value="buzon_imss">a través del Buzón IMSS</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_fiscal_federacion' ? (
                        <>
                          <option value="personal">Personal</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="estrados">Por estrados (en la fecha de notificación ponga la del decimoprimer día contado a partir del día siguiente a aquél en el que se hubiera publicado el documento)</option>
                          <option value="edictos">Por edictos</option>
                          <option value="buzon_tributario">Por buzón tributario</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'codigo_nacional_civil_familiar' ? (
                        <>
                          <option value="personalmente">Personalmente</option>
                          <option value="comunicacion_judicial">Por medio de comunicación judicial, según corresponda</option>
                          <option value="edictos">Por edictos</option>
                          <option value="correo_certificado">Por correo certificado</option>
                          <option value="telegrafo">Por telégrafo</option>
                          <option value="audiencia_juicio_oral">En audiencia en juicio oral</option>
                          <option value="comunicacion_electronica">Por cualquier otro medio de comunicación electrónica o sistema de justicia digital</option>
                          <option value="adhesion">Por adhesión</option>
                          <option value="cedula">Por cédula</option>
                          <option value="instructivo">Por instructivo</option>
                          <option value="correo_electronico">Por correo electrónico</option>
                          <option value="boletin_judicial">Por boletín Judicial</option>
                          <option value="cedula_1027_1028">Por cédula (artículos 1027 y 1028)</option>
                        </>
                      ) : mapearLeyAIdentificador(formData.leyDelActo) === 'ley_general_educacion' ? (
                        <>
                          <option value="visita_vigilancia">Mediante visita de vigilancia</option>
                          <option value="otra_lfpa">Otra forma de notificación de las previstas en la LFPA</option>
                        </>
                      ) : (
                        <>
                          <option value="personal">Personalmente</option>
                          <option value="oficio">Por oficio</option>
                          <option value="lista">Por lista</option>
                          <option value="electronica">En forma electrónica</option>
                        </>
                      )}
                    </select>
                    
                    {/* Dropdown cascada para LFPA cuando se selecciona "otra_lfpa" en LGE (adhesivo) */}
                    {mapearLeyAIdentificador(formData.leyDelActo) === 'ley_general_educacion' && formData.formaNotificacion === 'otra_lfpa' && (
                      <div style={{ marginTop: '1rem' }}>
                        {/* Advertencia LFPA */}
                        <div style={{
                          backgroundColor: '#FEE2E2',
                          border: '2px solid #DC2626',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem'
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
                        
                        {/* Selector específico de LFPA */}
                        <label className="block" style={{ 
                          color: '#1C1C1C', 
                          fontWeight: '600', 
                          marginBottom: '0.5rem', 
                          fontSize: '0.95rem', 
                          fontFamily: 'Inter, sans-serif' 
                        }}>
                          Forma específica de notificación (LFPA)
                        </label>
                        <select
                          name="formaNotificacionLFPA"
                          value={formData.formaNotificacionLFPA || ''}
                          onChange={handleChange}
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
                          <option value="personal">Personal</option>
                          <option value="correo_certificado_acuse">Por correo certificado con acuse de recibo</option>
                          <option value="mensajeria_acuse">Por mensajería, con acuse de recibo</option>
                          <option value="estrados">Por estrados</option>
                          <option value="edictos">Por edictos</option>
                          <option value="medios_electronicos">Por medios electrónicos</option>
                          <option value="oficio">Por oficio</option>
                          <option value="correo_ordinario">Por correo ordinario</option>
                          <option value="telegrama">Por telegrama</option>
                          <option value="medios_magneticos_digitales">a través de medios magnéticos, digitales, electrónicos, ópticos, magneto ópticos o de cualquier otra naturaleza en los términos del Código</option>
                          <option value="buzon_imss">a través del Buzón IMSS</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Presentación</label>
                      <input 
                        type="date" 
                        name="fechaPresentacion" 
                        value={formData.fechaPresentacion} 
                        onChange={handleChange} 
                        disabled={formData.tipoDemanda === 'directo' && camposDeshabilitados()}
                        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease', cursor: (formData.tipoDemanda === 'directo' && camposDeshabilitados()) ? 'not-allowed' : 'pointer', opacity: (formData.tipoDemanda === 'directo' && camposDeshabilitados()) ? 0.6 : 1 }} 
                        onFocus={(e) => !(formData.tipoDemanda === 'directo' && camposDeshabilitados()) && (e.target.style.borderColor = '#C5A770')} 
                        onBlur={(e) => e.target.style.borderColor = '#1C1C1C'}
                        required={tipoUsuario === 'servidor'} 
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Presentación</label>
                      <select 
                        name="formaPresentacion" 
                        value={formData.formaPresentacion} 
                        onChange={handleChange} 
                        disabled={formData.tipoDemanda === 'directo' && camposDeshabilitados()}
                        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '0.95rem', transition: 'all 0.3s ease', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', cursor: (formData.tipoDemanda === 'directo' && camposDeshabilitados()) ? 'not-allowed' : 'pointer', opacity: (formData.tipoDemanda === 'directo' && camposDeshabilitados()) ? 0.6 : 1 }} 
                        onFocus={(e) => !(formData.tipoDemanda === 'directo' && camposDeshabilitados()) && (e.currentTarget.style.borderColor = '#C5A770')} 
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'}
                        required={tipoUsuario === 'servidor'}>
                        <option value="">Seleccione...</option>
                        <option value="escrito">Por escrito</option>
                        {formData.tipoDemanda !== 'adhesivo' && (
                          <option value="oficio">Por oficio</option>
                        )}
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
                <button 
                  type="submit" 
                  disabled={calculando || (formData.tipoDemanda === 'directo' && camposDeshabilitados())} 
                  style={{ 
                    width: '100%',
                    backgroundColor: (calculando || (formData.tipoDemanda === 'directo' && camposDeshabilitados())) ? '#E5E5E5' : '#1C1C1C', 
                    color: (calculando || (formData.tipoDemanda === 'directo' && camposDeshabilitados())) ? '#999' : '#F4EFE8', 
                    padding: '1rem 2rem', 
                    borderRadius: '25px', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    transition: 'all 0.3s ease', 
                    cursor: (calculando || (formData.tipoDemanda === 'directo' && camposDeshabilitados())) ? 'not-allowed' : 'pointer', 
                    border: '1.5px solid #1C1C1C', 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.02em' 
                  }} 
                  onMouseEnter={(e) => { 
                    if (!calculando && !(formData.tipoDemanda === 'directo' && camposDeshabilitados())) { 
                      e.currentTarget.style.backgroundColor = '#C5A770'; 
                      e.currentTarget.style.borderColor = '#C5A770';
                      e.currentTarget.style.color = '#1C1C1C';
                    } 
                  }} 
                  onMouseLeave={(e) => { 
                    if (!calculando && !(formData.tipoDemanda === 'directo' && camposDeshabilitados())) { 
                      e.currentTarget.style.backgroundColor = '#1C1C1C'; 
                      e.currentTarget.style.borderColor = '#1C1C1C';
                      e.currentTarget.style.color = '#F4EFE8';
                    } 
                  }}
                  suppressHydrationWarning={true}
                >
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
                  <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} suppressHydrationWarning={true} />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 k-law-text">Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center p-2 text-sm" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
                          <span className="k-law-text">{fechaATexto(dia)}</span>
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
            <div className="mt-16" style={{ backgroundColor: 'transparent', border: '1.5px solid #C5A770', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' }}>
              <div className="text-center mb-8">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Resultado del Cálculo</h2>
              </div>
              
              <div style={{
                background: resultado.esOportuno 
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' 
                  : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: `1px solid ${resultado.esOportuno ? '#86efac' : '#fde047'}`,
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                {tipoUsuario === 'servidor' ? (
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: '#1C1C1C'
                  }}>
                    El recurso se presentó de forma: {' '}
                    <span style={{
                      color: resultado.esOportuno ? '#16a34a' : '#dc2626'
                    }}>
                      {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                    </span>
                  </p>
                ) : (
                  <div>
                    <p style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#1C1C1C'
                    }}>
                      El plazo para presentar el recurso vence el: {' '}
                      <span style={{ color: '#16a34a' }}>
                        {fechaATexto(resultado.fechaFin.toISOString().split('T')[0])}
                      </span>
                    </p>
                    {resultado.diasRestantes > 0 && (
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        fontFamily: 'Inter, sans-serif',
                        color: '#1C1C1C'
                      }}>
                        Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                      </p>
                    )}
                    {resultado.diasRestantes === 0 && (
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        fontFamily: 'Inter, sans-serif',
                        color: '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        ⚠️ El plazo ha vencido
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="k-law-result-box">
                <h3 className="k-law-subtitle text-lg">Detalles del Cómputo:</h3>
                <div className="space-y-1">
                  <p className="k-law-text"><strong>Plazo legal:</strong> {typeof resultado.plazo === 'number' ? `${resultado.plazo} días` : resultado.plazo}</p>
                  <p className="k-law-text"><strong>Fundamento:</strong> {resultado.fundamento}</p>
                  {formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>{formData.resolucionImpugnada === 'ley_entrada_vigor' ? 'Fecha en que la norma reclamada entró en vigor:' : formData.resolucionImpugnada === 'ley_acto_aplicacion' ? 'Fecha de notificación del acto concreto de aplicación de la norma:' : 'Fecha de notificación:'}</strong> {fechaATexto(formData.fechaNotificacion)}</p>
                  )}
                  {formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>Surte efectos:</strong> {fechaATexto(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                  )}
                  {formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>Período del cómputo:</strong> {(() => {
                      const fechaInicio = fechaATexto(resultado.fechaInicio.toISOString().split('T')[0]);
                      const fechaFin = fechaATexto(resultado.fechaFin.toISOString().split('T')[0]);
                      
                      // Extraer día y mes de cada fecha
                      const [diaInicio, mesInicio, anoInicio] = fechaInicio.split(' de ');
                      const [diaFin, mesFin, anoFin] = fechaFin.split(' de ');
                      
                      // Si son del mismo año, simplificar
                      if (anoInicio === anoFin) {
                        if (mesInicio === mesFin) {
                          // Mismo mes y año: "Del 10 al 25 de febrero de 2025"
                          return `Del ${diaInicio} al ${diaFin} de ${mesInicio} de ${anoInicio}`;
                        } else {
                          // Diferente mes, mismo año: "Del 10 de febrero al 25 de marzo, ambos de 2025"
                          return `Del ${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin}, ambos de ${anoInicio}`;
                        }
                      } else {
                        // Diferente año: mantener formato completo
                        return `Del ${fechaInicio} al ${fechaFin}`;
                      }
                    })()}</p>
                  )}
                  {tipoUsuario === 'servidor' && (
                    <p><strong>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaATexto(formData.fechaPresentacion) : ''}</p>
                  )}
                  <p><strong>Días inhábiles excluidos:</strong> {resultado.diasInhabiles}</p>
                  {/* Mostrar notas al pie de los días inhábiles si existen */}
                  {/* (obtenerDiasInhabilesSimplificado as any).notasAlPie && (obtenerDiasInhabilesSimplificado as any).notasAlPie.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {(obtenerDiasInhabilesSimplificado as any).notasAlPie.map((nota: string, index: number) => (
                        <div key={index}>{nota}</div>
                      ))}
                    </div>
                  ) */}
                </div>
              </div>
              
              {/* Calendario visual - solo para servidores y cuando el plazo no es "en cualquier tiempo" */}
              {tipoUsuario === 'servidor' && resultado.plazo !== 'En cualquier tiempo' && (
                <div id="calendario-visual" className="mt-6">
                  <h3 className="font-semibold mb-4">Calendario Visual</h3>
                  <div className="bg-white p-4 rounded-lg border">
                    <div id="calendario-solo">
                      <Calendario 
                        fechaNotificacion={resultado.fechaNotificacion}
                        fechaSurte={resultado.fechaSurte}
                        fechaInicio={resultado.fechaInicio}
                        fechaFin={formData.tipoSupuesto === 'penal' && formData.resolucionImpugnada === 'sentencia_condenatoria_penal' ? resultado.fechaSurte : resultado.fechaFin}
                        diasAdicionales={diasAdicionales}
                        tipoUsuario={tipoUsuario}
                        esCasoPenal={formData.tipoSupuesto === 'penal' && formData.resolucionImpugnada === 'sentencia_condenatoria_penal'}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {tipoUsuario === 'servidor' && (
                <div className="k-law-result-box mt-6">
                  <h3 className="k-law-subtitle text-lg">Texto para Resolución:</h3>
                  <div 
                    className="k-law-text font-['Arial'] leading-relaxed" 
                    dangerouslySetInnerHTML={{__html: generarTextoFormateado()}}
                  />
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                {tipoUsuario === 'servidor' && (
                  <>
                    <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="k-law-button-small">
                      Copiar Texto
                    </button>
                    {resultado.plazo !== 'En cualquier tiempo' && (
                      <button onClick={copiarCalendario} className="k-law-button-small">
                        Copiar Calendario
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', tipoDemanda: '', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', fechaConocimiento: '', tipoFecha: null, supuestoAgrario: '', tipoSupuesto: '', formaNotificacion: '', leyDelActo: '', leyDelActoManual: '', fechaPresentacion: '', formaPresentacion: '' }); }} className="k-law-button-small">
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Sección para litigantes */}
            {tipoUsuario === 'litigante' && (
              <div className="mt-6 k-law-card">
                <h3 className="k-law-subtitle">Guardar Cálculo y Notificaciones</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="k-law-label block">Número de Expediente</label>
                    <input 
                      type="text" 
                      value={numeroExpediente} 
                      onChange={(e) => setNumeroExpediente(e.target.value)}
                      placeholder="Ej: 123/2024"
                      className="k-law-input"
                    />
                  </div>
                  
                  <div>
                    <label className="k-law-label block">WhatsApp (opcional)</label>
                    <input 
                      type="tel" 
                      value={telefonoWhatsApp} 
                      onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                      placeholder="Ej: +52 1234567890"
                      className="k-law-input"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={guardarCalculo}
                  disabled={!numeroExpediente}
                  className="k-law-button-small disabled:opacity-50"
                >
                  Guardar Cálculo
                </button>
                
                {telefonoWhatsApp && (
                  <p className="mt-2 k-law-text text-sm">
                    Recibirás recordatorios 3, 2 y 1 día antes del vencimiento, y el día del vencimiento.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Lista de cálculos guardados para litigantes */}
        {tipoUsuario === 'litigante' && calculos.length > 0 && (
          <div className="mt-6 k-law-card">
            <h3 className="k-law-subtitle">Cálculos Guardados</h3>
            <div className="space-y-2">
              {calculos.map((calc) => (
                <div key={calc.id} className="flex justify-between items-center p-3 k-law-result-box">
                  <div>
                    <p className="k-law-text font-semibold">Expediente: {calc.expediente}</p>
                    <p className="k-law-text text-sm">
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
                    className="k-law-button-small text-sm"
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
