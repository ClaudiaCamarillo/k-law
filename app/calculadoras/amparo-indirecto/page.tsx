'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { SelectorLeyNotificacion } from '@/components/SelectorLeyNotificacion'
import { BuscadorLeyNotificacion } from '@/components/BuscadorLeyNotificacion'
import { PreguntasActoConcreto } from '@/components/PreguntasActoConcreto'

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
      if (diaFijo && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
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
        diasYaIncluidos.add(fechaParaLitigante(fechaStr));
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
        
        if (diaMovilInfo && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
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
          diasYaIncluidos.add(fechaParaLitigante(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
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
        diasYaIncluidos.add(fechaParaLitigante(fechaStr));
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
      if (diaFijo && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
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
          const fechaObj = new Date(fechaStr + 'T12:00:00');
          const dia = fechaObj.getDate();
          const mes = fechaObj.getMonth();
          const año = fechaObj.getFullYear();
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const diaTexto = `${dia} de ${meses[mes]} de ${año}`;
          diasPorFundamento[diaMovilInfo.fundamento].push(diaTexto);
          diasYaIncluidos.add(fechaParaLitigante(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaParaLitigante(fechaStr))) {
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
        const fechaTexto = tipoUsuario === 'litigante' ? fechaParaLitigante(fechaStr) : fechaATexto(fechaStr);
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

export default function Page() {
  const [tipoUsuario, setTipoUsuario] = useState<string>('litigante');
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    tipoFecha: '',
    formaNotificacion: '',
    fechaPresentacion: '',
    formaPresentacion: '',
    leyNotificacion: '',
    actoConcreto: '',
    leyActoConcreto: ''
  });
  
  const [diasAdicionales, setDiasAdicionales] = useState<string[]>([]);
  const [nuevoDiaInhabil, setNuevoDiaInhabil] = useState('');
  const [fundamentoAdicional, setFundamentoAdicional] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [calculando, setCalculando] = useState(false);
  const [reglaLey, setReglaLey] = useState(null);
  const [preguntasActoConcreto, setPreguntasActoConcreto] = useState(null);
  
  // Para litigantes
  const [numeroExpediente, setNumeroExpediente] = useState('');
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [calculos, setCalculos] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="k-law-text">Cargando calculadora...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    
    setTimeout(() => {
      // Manejar caso de "se desconoce el acto reclamado"
      if (formData.tipoFecha === 'desconoce') {
        const resultado = {
          plazo: 'En cualquier tiempo',
          fundamento: 'Criterio jurisprudencial - acto desconocido',
          fechaNotificacion: new Date(),
          fechaSurte: new Date(),
          fechaInicio: new Date(),
          fechaFin: new Date(),
          fechaNotificacionTexto: 'No aplica',
          fechaSurteEfectosTexto: 'No aplica',
          fechaInicioTexto: 'No aplica',
          fechaFinTexto: 'No aplica',
          diasInhabiles: 'No aplica',
          diasInhabilesTexto: 'No aplica',
          plazoTexto: 'No hay plazo específico',
          esOportuno: true,
          fundamentoSurte: 'No aplica',
          notasAlPieTexto: [],
          formaPresentacion: 'No aplica'
        };
        
        setResultado(resultado);
        setCalculando(false);
        return;
      }

      // Determinar plazo y fundamento según tipo de acto reclamado
      let plazo: number | string = 15;
      let fundamento = '';
      let esEnCualquierTiempo = false;
      
      switch (formData.resolucionImpugnada) {
        case 'ley_entrada_vigor':
          plazo = 30;
          fundamento = 'artículo 17, fracción I, de la Ley de Amparo';
          break;
        case 'ley_acto_aplicacion':
          plazo = 15;
          fundamento = 'artículo 17, fracción I, de la Ley de Amparo';
          break;
        case 'acto_restrictivo_libertad':
        case 'fecha_lejana_audiencia':
          plazo = 15;
          fundamento = 'artículo 17 de la Ley de Amparo';
          break;
        case 'actos_22_constitucional':
          plazo = 'En cualquier tiempo';
          fundamento = 'artículo 17, fracción IV, de la Ley de Amparo';
          esEnCualquierTiempo = true;
          break;
        case 'procedimiento_extradicion':
          plazo = 30;
          fundamento = 'artículo 17, fracción I, de la Ley de Amparo';
          break;
        case 'dilacion_excesiva':
          plazo = 'En cualquier tiempo';
          fundamento = 'criterio jurisprudencial sobre dilación excesiva';
          esEnCualquierTiempo = true;
          break;
        case 'omision_legislativa_absoluta':
          plazo = 'En cualquier tiempo';
          fundamento = 'Jurisprudencia 2a./J. 87/2018 - mientras persista la omisión';
          esEnCualquierTiempo = true;
          break;
        case 'omision_legislativa_relativa':
          plazo = 15;
          fundamento = 'Jurisprudencia 2a./J. 87/2018 - desde conocimiento de la deficiencia normativa';
          break;
        default:
          plazo = 15;
          fundamento = 'artículo 17 de la Ley de Amparo';
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
          fechaNotificacionTexto: fechaParaLitigante(formData.fechaNotificacion),
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
      if (formData.resolucionImpugnada === 'ley_entrada_vigor') {
        // Para leyes por entrada en vigor: NO hay notificación, se computa desde el día de entrada en vigor
        fechaInicio = new Date(fechaNotif);
        textoSurte = 'No aplica - No hay notificación';
        fundamentoSurte = 'artículo 18 de la Ley de Amparo';
        fechaSurte = new Date(fechaNotif); // La fecha de entrada en vigor es la referencia
      } else {
        // Si hay una regla de ley específica, úsala
        if (reglaLey) {
          if (reglaLey.surteEfectos === 'dia_siguiente') {
            fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
            textoSurte = 'al siguiente día hábil';
            fundamentoSurte = `${reglaLey.articulo} de la ${reglaLey.leyNombre || 'ley aplicable'}`;
          } else if (reglaLey.surteEfectos === 'tercer_dia') {
            // Contar 3 días hábiles
            let fechaTemp = new Date(fechaNotif);
            let diasContados = 0;
            while (diasContados < 3) {
              fechaTemp.setDate(fechaTemp.getDate() + 1);
              // Verificar si es día hábil (no sábado ni domingo)
              if (fechaTemp.getDay() !== 0 && fechaTemp.getDay() !== 6) {
                diasContados++;
              }
            }
            fechaSurte = fechaTemp;
            textoSurte = 'al tercer día hábil';
            fundamentoSurte = `${reglaLey.articulo} de la ${reglaLey.leyNombre || 'ley aplicable'}`;
          } else {
            // Si es mismo_dia, no hacer nada
            fechaSurte = new Date(fechaNotif);
            textoSurte = 'el mismo día';
            fundamentoSurte = `${reglaLey.articulo} de la ${reglaLey.leyNombre || 'ley aplicable'}`;
          }
        } else {
          // Usar la lógica existente de tipo de notificación
          // Para otros actos: calcular cuándo surte efectos la notificación según artículo 31 de la Ley de Amparo
          const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                             (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
          
          if (esAutoridad) {
            // Fracción I: para autoridades surten efectos desde el momento en que quedan hechas
            textoSurte = 'el mismo día';
            fundamentoSurte = 'artículo 31, fracción I, de la Ley de Amparo';
          } else if (formData.formaNotificacion === 'electronica') {
            // Fracción III: electrónicas cuando se genere el acuse
            textoSurte = 'el mismo día en que se genera el acuse electrónico';
            fundamentoSurte = 'artículo 31, fracción III, de la Ley de Amparo';
          } else if (formData.tipoFecha === 'conocimiento') {
            textoSurte = 'el mismo día del conocimiento completo';
            fundamentoSurte = 'artículo 31 de la Ley de Amparo';
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
      
      const fechaFin = formData.resolucionImpugnada === 'ley_entrada_vigor' 
        ? calcularPlazoLeyEntradaVigor(fechaInicio, plazo as number, diasAdicionales, tipoUsuario)
        : calcularPlazoReal(fechaInicio, plazo as number, diasAdicionales, tipoUsuario);
      
      // Para litigantes, no evaluamos la oportunidad
      let esOportuno = true;
      let fechaPres = null;
      
      if (tipoUsuario === 'servidor' && formData.fechaPresentacion) {
        fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
        esOportuno = fechaPres <= fechaFin;
      }
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesTextoInfo = obtenerDiasInhabilesParaTexto(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      const diasInhabilesSimplificadoInfo = obtenerDiasInhabilesSimplificado(fechaNotif, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      
      // Mapeos para el texto generado
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
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
        diasInhabiles: diasInhabilesSimplificadoInfo || diasInhabilesInfo.texto,
        diasInhabilesTexto: diasInhabilesTextoInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        notasAlPieTexto: diasInhabilesTextoInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: typeof plazo === 'number' ? numeroATexto(plazo) : plazo
      });
      
      setCalculando(false);
    }, 1000);
  };

  const determinarLeyPorActo = (acto: string) => {
    const leyesPorActo: { [key: string]: string } = {
      // Actos penales
      'orden_aprehension': 'Código Nacional de Procedimientos Penales',
      'auto_vinculacion': 'Código Nacional de Procedimientos Penales',
      'auto de formal prisión': 'Código Nacional de Procedimientos Penales',
      'sentencia penal': 'Código Nacional de Procedimientos Penales',
      'negativa de libertad caucional': 'Código Nacional de Procedimientos Penales',
      
      // Actos civiles
      'sentencia civil': 'Código Federal de Procedimientos Civiles',
      'embargo': 'Código Federal de Procedimientos Civiles',
      'lanzamiento': 'Código Federal de Procedimientos Civiles',
      'requerimiento de pago': 'Código Federal de Procedimientos Civiles',
      'falta_emplazamiento': 'Código Federal de Procedimientos Civiles',
      
      // Actos laborales
      'laudo': 'Ley Federal del Trabajo',
      'reinstalación': 'Ley Federal del Trabajo',
      'despido': 'Ley Federal del Trabajo',
      
      // Actos administrativos
      'clausura': 'Ley Federal de Procedimiento Administrativo',
      'multa administrativa': 'Ley Federal de Procedimiento Administrativo',
      'negativa de permiso': 'Ley Federal de Procedimiento Administrativo',
      
      // Actos fiscales
      'requerimiento fiscal': 'Código Fiscal de la Federación',
      'embargo fiscal': 'Código Fiscal de la Federación',
      'determinación de crédito fiscal': 'Código Fiscal de la Federación',
      
      // Actos mercantiles
      'sentencia mercantil': 'Código de Comercio',
      
      // Actos de pensión
      'omision_negativa_pension': 'Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      'negativa_pension': 'Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      'descuentos_nomina_pension': 'Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      
      // Actos de extradición - se debe buscar ley supletoria
      // 'procedimiento_extradicion': 'Ley de Extradición Internacional', // Removido: no tiene reglas de notificación
      
      // Otros
      'resolución de amparo': 'Ley de Amparo',
      'acuerdo de trámite': 'Ley de Amparo',
      'ley_entrada_vigor': 'Ley de Amparo',
      'ley_acto_aplicacion': 'Ley de Amparo',
      'actos_22_constitucional': 'Ley de Amparo',
      'dilacion_excesiva': 'Ley de Amparo',
      'fecha_lejana_audiencia': 'Ley de Amparo',
      'omision_legislativa_absoluta': 'Ley de Amparo',
      'omision_legislativa_relativa': 'Ley de Amparo',
      'otros_actos': 'Ley de Amparo'
    };
    
    // Buscar coincidencia exacta primero
    if (leyesPorActo[acto]) {
      return leyesPorActo[acto];
    }
    
    // Si no hay coincidencia exacta, buscar por palabras clave
    const actoLower = acto.toLowerCase();
    
    if (actoLower.includes('penal') || actoLower.includes('aprehensión') || 
        actoLower.includes('prisión') || actoLower.includes('vinculación')) {
      return 'Código Nacional de Procedimientos Penales';
    }
    
    if (actoLower.includes('civil') || actoLower.includes('divorcio') || 
        actoLower.includes('custodia') || actoLower.includes('alimentos')) {
      return 'Código Federal de Procedimientos Civiles';
    }
    
    if (actoLower.includes('laboral') || actoLower.includes('trabajo') || 
        actoLower.includes('despido') || actoLower.includes('laudo')) {
      return 'Ley Federal del Trabajo';
    }
    
    if (actoLower.includes('fiscal') || actoLower.includes('impuesto') || 
        actoLower.includes('sat') || actoLower.includes('contribu')) {
      return 'Código Fiscal de la Federación';
    }
    
    if (actoLower.includes('administrativ') || actoLower.includes('multa') || 
        actoLower.includes('clausura')) {
      return 'Ley Federal de Procedimiento Administrativo';
    }
    
    if (actoLower.includes('mercantil') || actoLower.includes('comerci')) {
      return 'Código de Comercio';
    }
    
    if (actoLower.includes('pensión') || actoLower.includes('pension')) {
      return 'Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado';
    }
    
    if (actoLower.includes('extradición') || actoLower.includes('extradicion')) {
      return null; // No tiene reglas de notificación, debe buscar ley supletoria
    }
    
    // Por defecto, Ley de Amparo para actos no específicos
    return 'Ley de Amparo';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    
    // Si se selecciona "se desconoce el acto reclamado" o "conocimiento", auto-seleccionar "No aplica" en forma de notificación
    if (e.target.name === 'tipoFecha' && (e.target.value === 'desconoce' || e.target.value === 'conocimiento')) {
      newFormData.formaNotificacion = 'no_aplica';
    }
    
    // Si se cambia a "fecha", limpiar forma de notificación
    if (e.target.name === 'tipoFecha' && e.target.value === 'fecha' && (formData.tipoFecha === 'desconoce' || formData.tipoFecha === 'conocimiento')) {
      newFormData.formaNotificacion = '';
    }
    
    // Determinar automáticamente la ley cuando se selecciona un acto reclamado
    if (e.target.name === 'resolucionImpugnada' && e.target.value) {
      const leyDeterminada = determinarLeyPorActo(e.target.value);
      console.log('Acto seleccionado:', e.target.value);
      console.log('Ley determinada:', leyDeterminada);
      
      if (leyDeterminada) {
        newFormData.leyNotificacion = leyDeterminada;
      } else {
        // Si no se puede determinar automáticamente, limpiar el campo
        newFormData.leyNotificacion = '';
        console.log('⚠️ Esta ley no tiene reglas de notificación específicas. Use el buscador para encontrar la ley supletoria.');
      }
    }
    
    // Determinar ley por acto concreto cuando se escribe en el campo
    if (e.target.name === 'actoConcreto' && e.target.value.trim().length > 10) {
      // Usar debounce para evitar demasiadas llamadas
      setTimeout(async () => {
        try {
          const { determinarLeyPorActoConcreto } = await import('../../../lib/ia-legal');
          const resultado = await determinarLeyPorActoConcreto(e.target.value);
          
          if (resultado && resultado.suficienteInfo) {
            setFormData(prev => ({
              ...prev,
              leyActoConcreto: resultado.leyAplicable,
              leyNotificacion: resultado.leyAplicable
            }));
            setPreguntasActoConcreto(null); // Limpiar preguntas si las había
            console.log('Ley detectada para acto concreto:', resultado.leyAplicable);
          } else if (resultado && !resultado.suficienteInfo) {
            setPreguntasActoConcreto(resultado);
            console.log('⚠️ Información insuficiente. Preguntas necesarias:', resultado.preguntasNecesarias);
          }
        } catch (error) {
          console.error('Error al determinar ley por acto concreto:', error);
        }
      }, 1000); // Esperar 1 segundo después de que el usuario deje de escribir
    }
    
    setFormData(newFormData);
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
    
    // Función para extraer solo el día cuando estamos en el mismo contexto de mes
    const extraerSoloDia = (fechaTexto: string) => {
      const partes = fechaTexto.split(' de ');
      return partes[0]; // Solo devuelve el día
    };
    
    // Casos especiales para actos sin plazo específico
    if (formData.tipoFecha === 'desconoce') {
      // Caso 1: Se desconoce el acto reclamado
      return `\t\tLa presentación de la demanda debe estimarse es oportuna, habida cuenta que la parte quejosa refiere que desconoce el acto reclamado y hasta este momento no se cuenta con constancias de las que se advierta lo contrario.`;
    }
    
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
          return `el ${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`;
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
          // Mismo día (por conocimiento completo)
          return 'ese mismo día';
        } else {
          // Día siguiente
          return `el ${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`;
        }
      })();
      
      let texto = `\t\tLa presentación de la demanda es ${oportunidadTexto}, pues la parte quejosa fue notificada ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'lista' ? 'por lista' : formData.formaNotificacion === 'oficio' ? 'por oficio' : 'en forma electrónica'} el ${resultado.fechaNotificacionTexto}, y la notificación surtió efectos ${efectosTexto}, de conformidad con lo previsto en el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días a que alude el artículo 17, fracción ${obtenerFraccionArticulo17()}, de dicha legislación, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)} del referido año, de acuerdo con lo previsto en el diverso numeral 18 de la referida ley; lo anterior con exclusión de los días ${diasInhabilesTexto}.
\t\tPor ende, si la demanda se presentó el ${extraerDiaMes(resultado.fechaPresentacionTexto)} de ${añoTexto}, es inconcuso que su presentación ${presentadaAntesDeInicio ? 'ocurrió oportunamente, pues en esa fecha aún no iniciaba el plazo' : resultado.esOportuno ? 'es oportuna' : 'es extemporánea'}.`;
      
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
        // Mismo día (por conocimiento completo)
        return 'ese mismo día';
      } else {
        // Día siguiente
        return `el ${extraerSoloDia(resultado.fechaSurteEfectosTexto)} siguiente`;
      }
    })();
    
    // Texto estándar para casos con plazo específico
    let texto = `\t\tLa presentación del recurso de revisión ${formData.tipoRecurso} es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, dado que la notificación ${formData.resolucionImpugnada === 'auto' ? 'del acuerdo impugnado' : formData.resolucionImpugnada === 'sentencia' ? 'de la sentencia impugnada' : 'de la interlocutoria dictada en el incidente de suspensión'} se realizó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a ${generoRecurrente}, ${parteTexto} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, y surtió efectos ${efectosTextoRevision}, de conformidad con el ${resultado.fundamentoSurte}, por lo que el plazo de ${resultado.plazoTexto} días que prevé el diverso artículo 86, párrafo primero, de esa ley, transcurrió del ${extraerDiaMes(resultado.fechaInicioTexto)} al ${extraerDiaMes(resultado.fechaFinTexto)}, todos del referido año, con exclusión de los días ${resultado.diasInhabilesTexto}.

\t\tPor ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    
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
    <div className="min-h-screen">
      <nav className="k-law-nav">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold" style={{ color: '#808080' }}>
                K-LAW
              </Link>
              <span className="k-law-badge">
                Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
              </span>
            </div>
            <Link href="/calculadoras" className="k-law-button-secondary text-sm px-4 py-2">
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="k-law-title">Calculadora de Amparo Indirecto</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="k-law-card">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Tipo de Demanda</label>
                  <input 
                    type="text" 
                    value="Amparo Indirecto" 
                    readOnly 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '2px solid #E0E0E0', 
                      borderRadius: '12px', 
                      fontSize: '0.95rem', 
                      fontFamily: 'Inter, sans-serif', 
                      color: '#333333', 
                      backgroundColor: '#F3F4F6', 
                      cursor: 'not-allowed',
                      opacity: 0.6 
                    }} 
                  />
                </div>
                
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Acto Reclamado</label>
                  <select name="resolucionImpugnada" value={formData.resolucionImpugnada} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} required>
                    <option value="">Seleccione...</option>
                    <option value="ley_entrada_vigor">Ley por su entrada en vigor</option>
                    <option value="ley_acto_aplicacion">Ley, con motivo de un acto concreto de aplicación</option>
                    <option value="actos_22_constitucional">Actos que importen peligro de privación de la vida, u otros previstos en el 22 constitucional</option>
                    <option value="procedimiento_extradicion">Procedimiento de extradición</option>
                    <option value="dilacion_excesiva">Dilación excesiva (considere el lapso que debe transcurrir para que se considere excesiva, conforme la ley la jurisprudencia)</option>
                    <option value="fecha_lejana_audiencia">Señalamiento de una fecha lejana para la celebración de una audiencia</option>
                    <option value="omision_legislativa_absoluta">Omisión legislativa absoluta</option>
                    <option value="omision_legislativa_relativa">Omisión legislativa relativa</option>
                    <option value="orden_aprehension">Orden de aprehensión</option>
                    <option value="falta_emplazamiento">Falta de emplazamiento</option>
                    <option value="omision_negativa_pension">Omisión o negativa a recibir trámite de pensión</option>
                    <option value="negativa_pension">Negativa de pensión</option>
                    <option value="descuentos_nomina_pension">Descuentos en el recibo de nómina o pensión</option>
                    <option value="auto_vinculacion">Auto de vinculación o resolución que lo confirma</option>
                    <option value="otros_actos">Otros actos</option>
                  </select>
                </div>
                
                {/* Campo condicional para acto concreto de aplicación */}
                {formData.resolucionImpugnada === 'ley_acto_aplicacion' && (
                  <div className="k-law-alert">
                    <label className="k-law-label block">
                      Especifique el acto concreto de aplicación:
                    </label>
                    <input
                      type="text"
                      name="actoConcreto"
                      value={formData.actoConcreto}
                      onChange={handleChange}
                      placeholder="Ej: Multa por infracción de tránsito, Clausura de establecimiento, etc."
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
                      required
                    />
                    {formData.leyActoConcreto && (
                      <div className="mt-2 k-law-alert-success">
                        <p className="text-sm font-medium">Ley aplicable detectada:</p>
                        <p className="text-sm">{formData.leyActoConcreto}</p>
                      </div>
                    )}
                    
                    {preguntasActoConcreto && (
                      <PreguntasActoConcreto
                        preguntas={preguntasActoConcreto.preguntasNecesarias}
                        contexto={preguntasActoConcreto.contexto}
                        onRespuestas={async (infoAdicional) => {
                          try {
                            const { determinarLeyPorActoConcreto } = await import('../../../lib/ia-legal');
                            const actoCompleto = `${formData.actoConcreto}. Información adicional: ${infoAdicional}`;
                            const resultado = await determinarLeyPorActoConcreto(actoCompleto);
                            
                            if (resultado && resultado.suficienteInfo) {
                              setFormData(prev => ({
                                ...prev,
                                leyActoConcreto: resultado.leyAplicable,
                                leyNotificacion: resultado.leyAplicable
                              }));
                              setPreguntasActoConcreto(null);
                              console.log('Ley detectada con información adicional:', resultado.leyAplicable);
                            }
                          } catch (error) {
                            console.error('Error al procesar respuestas:', error);
                          }
                        }}
                      />
                    )}
                  </div>
                )}
                
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Promovente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} required>
                    <option value="">Seleccione...</option>
                    <option value="quejoso">Quejoso</option>
                  </select>
                </div>
                
                {formData.resolucionImpugnada === 'ley_entrada_vigor' ? (
                  <div>
                    <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de entrada en vigor</label>
                    <input 
                      type="date" 
                      name="fechaNotificacion" 
                      value={formData.fechaNotificacion} 
                      onChange={(e) => {
                        const newFormData = { ...formData, fechaNotificacion: e.target.value, tipoFecha: 'entrada_vigor' };
                        setFormData(newFormData);
                      }} 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} 
                      onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} 
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} 
                      required 
                    />
                  </div>
                ) : formData.resolucionImpugnada === 'actos_22_constitucional' ? (
                  <div className="k-law-alert-warning">
                    <p className="text-sm">
                      <strong>Acto reclamable en cualquier tiempo</strong><br/>
                      Los actos que importen peligro de privación de la vida pueden reclamarse en cualquier tiempo conforme al artículo 17, fracción IV, de la Ley de Amparo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.resolucionImpugnada !== 'ley_acto_aplicacion' && (
                      <div className={formData.tipoFecha !== '' && formData.tipoFecha !== 'desconoce' ? 'opacity-50' : ''}>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="tipoFecha" 
                            value="desconoce" 
                            checked={formData.tipoFecha === 'desconoce'} 
                            onChange={handleChange} 
                            className="mr-2"
                          />
                          Se desconoce el acto reclamado
                        </label>
                      </div>
                    )}
                    <div className={formData.tipoFecha !== '' && formData.tipoFecha !== 'fecha' ? 'opacity-50' : ''}>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="tipoFecha" 
                          value="fecha" 
                          checked={formData.tipoFecha === 'fecha'} 
                          onChange={handleChange} 
                          className="mr-2"
                        />
                        {formData.resolucionImpugnada === 'ley_acto_aplicacion' ? 'Fecha de notificación del acto concreto de aplicación de la norma' : 'Fecha de notificación'}
                      </label>
                      {formData.tipoFecha === 'fecha' && (
                        <input 
                          type="date" 
                          name="fechaNotificacion" 
                          value={formData.fechaNotificacion} 
                          onChange={handleChange} 
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease', marginTop: '0.25rem' }} 
                          onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} 
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} 
                          required 
                        />
                      )}
                    </div>
                    <div className={formData.tipoFecha !== '' && formData.tipoFecha !== 'conocimiento' ? 'opacity-50' : ''}>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="tipoFecha" 
                          value="conocimiento" 
                          checked={formData.tipoFecha === 'conocimiento'} 
                          onChange={handleChange} 
                          className="mr-2"
                        />
                        {formData.resolucionImpugnada === 'ley_acto_aplicacion' ? 'Fecha de conocimiento completo del acto de aplicación de la norma' : 'Fecha en que se tuvo conocimiento completo (no hubo notificación)'}
                      </label>
                      {formData.tipoFecha === 'conocimiento' && (
                        <input 
                          type="date" 
                          name="fechaNotificacion" 
                          value={formData.fechaNotificacion} 
                          onChange={handleChange} 
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease', marginTop: '0.25rem' }} 
                          onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} 
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} 
                          required 
                        />
                      )}
                    </div>
                  </div>
                )}
                
                
                {formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                  <div>
                    <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                    {(formData.tipoFecha === 'desconoce' || formData.tipoFecha === 'conocimiento') ? (
                    <select 
                      name="formaNotificacion" 
                      value="no_aplica"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#6b7280', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      disabled
                    >
                      <option value="no_aplica">No aplica</option>
                    </select>
                  ) : (
                    <select 
                      name="formaNotificacion" 
                      value={formData.formaNotificacion} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="personal">Personalmente</option>
                      <option value="oficio">Por oficio</option>
                      <option value="lista">Por lista</option>
                      <option value="electronica">En forma electrónica</option>
                    </select>
                  )}
                  </div>
                )}
                
                <SelectorLeyNotificacion 
                  tipoNotificacion={formData.formaNotificacion}
                  leySeleccionada={formData.leyNotificacion}
                  onLeySeleccionada={(regla) => setReglaLey(regla)}
                />
                
                <BuscadorLeyNotificacion 
                  onLeyEncontrada={(ley) => {
                    setFormData(prev => ({
                      ...prev,
                      leyNotificacion: ley
                    }))
                  }}
                />
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Presentación</label>
                      <input 
                        type="date" 
                        name="fechaPresentacion" 
                        value={formData.fechaPresentacion} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
                        required={tipoUsuario === 'servidor'} 
                      />
                    </div>
                    
                    {(formData.tipoFecha === 'fecha' || formData.resolucionImpugnada === 'ley_entrada_vigor') && (
                      <div className="md:col-span-2">
                        <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Presentación</label>
                        <select 
                          name="formaPresentacion" 
                          value={formData.formaPresentacion} 
                          onChange={handleChange} 
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'}
                          required={tipoUsuario === 'servidor'}>
                          <option value="">Seleccione...</option>
                          <option value="escrito">Por escrito</option>
                          <option value="correo">Por correo</option>
                          {formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                            <option value="momento">Al momento de ser notificado</option>
                          )}
                          {formData.resolucionImpugnada === 'actos_22_constitucional' && (
                            <option value="personal">Personalmente</option>
                          )}
                          <option value="electronica">En forma electrónica</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <button type="submit" disabled={calculando} className="mt-6 w-full k-law-button">
                {calculando ? 'Calculando...' : 'Calcular Plazo'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="k-law-card">
              <h3 className="k-law-subtitle">Días Inhábiles Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Agregar día inhábil</label>
                  <div className="flex gap-2">
                    <input type="date" value={nuevoDiaInhabil} onChange={(e) => setNuevoDiaInhabil(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} />
                    <button type="button" onClick={agregarDiaInhabil} className="k-law-button-small">
                      Agregar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="k-law-label block" style={{ color: '#333333', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" style={{ width: '100%', padding: '0.5rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#333333', backgroundColor: '#FFFFFF', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C9A961'} onBlur={(e) => e.currentTarget.style.borderColor = '#E0E0E0'} />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 k-law-text">Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center k-law-result-box p-2 text-sm">
                          <span className="k-law-text">{tipoUsuario === 'litigante' ? fechaParaLitigante(dia) : fechaATexto(dia)}</span>
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
        </div>
        
        {resultado && (
          <>
            <div className="mt-6 k-law-card">
              <h2 className="k-law-subtitle">Resultado del Cálculo</h2>
              
              <div 
                style={{
                  background: resultado.esOportuno 
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' 
                    : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: `2px solid ${resultado.esOportuno ? '#86efac' : '#fde047'}`,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}
              >
                {tipoUsuario === 'servidor' ? (
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: '#333333'
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
                      color: '#333333'
                    }}>
                      El plazo para presentar el recurso vence el: {' '}
                      <span style={{ color: '#16a34a' }}>
                        {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}
                      </span>
                    </p>
                    {resultado.diasRestantes > 0 && (
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#666666'
                      }}>
                        Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                      </p>
                    )}
                    {resultado.diasRestantes === 0 && (
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#dc2626',
                        fontWeight: '700'
                      }}>
                        ⚠️ El plazo ha vencido
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="k-law-result-box">
                <h3 className="k-law-text font-semibold mb-2">Detalles del Cómputo:</h3>
                <div className="space-y-1 text-sm k-law-text">
                  <p><strong>Plazo legal:</strong> {typeof resultado.plazo === 'number' ? `${resultado.plazo} días` : resultado.plazo}</p>
                  <p><strong>Fundamento:</strong> {formData.tipoFecha === 'desconoce' ? 'Artículos 17 de la Ley de Amparo, en relación con el 18, pues este último prevé que los plazos a que alude el primero de ellos se computarán a partir del día siguiente a aquél en que surta efectos, conforme a la ley del acto, la notificación a la persona quejosa del acto o resolución que reclame o a aquella en que haya tenido conocimiento o se ostente sabedora del acto reclamado o de su ejecución, salvo el caso de la fracción I del artículo anterior en el que se computará a partir del día de su entrada en vigor; y en el caso se eligió la opción relativa a que se desconoce el acto reclamado, por lo cual se entiende que éste no fue notificado ni se hizo del conocimiento de quien pretende reclamarlo.' : resultado.fundamento}</p>
                  {formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>{formData.resolucionImpugnada === 'ley_entrada_vigor' ? 'Fecha en que la norma reclamada entró en vigor:' : formData.tipoFecha === 'conocimiento' ? (formData.resolucionImpugnada === 'ley_acto_aplicacion' ? 'Fecha de conocimiento completo del acto de aplicación de la norma:' : 'Fecha en que se tuvo conocimiento completo:') : formData.resolucionImpugnada === 'ley_acto_aplicacion' ? 'Fecha de notificación del acto concreto de aplicación de la norma:' : 'Fecha de notificación:'}</strong> {formData.tipoFecha === 'desconoce' ? 'Se desconoce el acto reclamado' : fechaParaLitigante(formData.fechaNotificacion)}</p>
                  )}
                  {formData.tipoFecha !== 'desconoce' && formData.resolucionImpugnada !== 'ley_entrada_vigor' && formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>Surte efectos:</strong> {fechaParaLitigante(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                  )}
                  {formData.resolucionImpugnada !== 'actos_22_constitucional' && (
                    <p><strong>Período del cómputo:</strong> {formData.tipoFecha === 'desconoce' ? 'La demanda puede presentarse en cualquier tiempo puesto que no existe fecha de notificación o conocimiento completo.' : (() => {
                      const fechaInicio = fechaParaLitigante(resultado.fechaInicio.toISOString().split('T')[0]);
                      const fechaFin = fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0]);
                      
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
                    <p><strong>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : ''}</p>
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
              {tipoUsuario === 'servidor' && resultado.plazo !== 'En cualquier tiempo' && formData.tipoFecha !== 'desconoce' && (
                <div id="calendario-visual" className="mt-6">
                  <h3 className="k-law-text font-semibold mb-4">Calendario Visual</h3>
                  <div className="k-law-result-box p-4">
                    <div id="calendario-solo">
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
                </div>
              )}
              
              {tipoUsuario === 'servidor' && (
                <div className="k-law-result-box mt-6">
                  <h3 className="k-law-text font-semibold mb-2">Texto para Resolución:</h3>
                  <div className="text-sm font-['Arial'] leading-relaxed whitespace-pre-wrap text-justify" style={{textIndent: '2em'}}>
                    {generarTexto()}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                {tipoUsuario === 'servidor' && (
                  <>
                    <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="k-law-button-small">
                      Copiar Texto
                    </button>
                    {resultado.plazo !== 'En cualquier tiempo' && formData.tipoFecha !== 'desconoce' && (
                      <button onClick={copiarCalendario} className="k-law-button-small">
                        Copiar Calendario
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', tipoFecha: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '', leyNotificacion: '', actoConcreto: '', leyActoConcreto: '' }); }} className="k-law-button-small">
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
                      className="k-law-select"
                    />
                  </div>
                  
                  <div>
                    <label className="k-law-label block">WhatsApp (opcional)</label>
                    <input 
                      type="tel" 
                      value={telefonoWhatsApp} 
                      onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                      placeholder="Ej: +52 1234567890"
                      className="k-law-select"
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
                  <p className="mt-2 text-sm k-law-text">
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
                    <p className="font-semibold k-law-text">Expediente: {calc.expediente}</p>
                    <p className="text-sm k-law-text opacity-70">
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
                    className="text-red-400 hover:text-red-300"
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
  );
}