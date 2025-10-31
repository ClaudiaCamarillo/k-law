'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'
import { getCuandoSurteEfectos, calcularFechaSurteEfectos, getFundamentoSurtimientoEfectos } from '../../../lib/articulo31LeyAmparo.js'
import { computosStorage } from '../../../lib/computosStorage'

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
  const numeros = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
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

// Función para obtener días inhábiles con notas al pie
function obtenerDiasInhabilesConNotas(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '', tipoUsuario: string = 'litigante', paraTextoResolucion: boolean = false) {
  const diasPorFundamento: {[key: string]: {fecha: string, diaNum: number}[]} = {};
  const diasYaIncluidos = new Map<string, string>(); // fechaStr -> fundamento
  const sabadosDomingos: string[] = [];
  
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
    const diaNum = fecha.getDate();
    
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      // Recopilar sábados y domingos
      const diaTexto = paraTextoResolucion ? fechaATexto(fechaStr) : fechaParaLitigante(fechaStr);
      sabadosDomingos.push(diaTexto);
    } else {
      // Filtrar días según tipo de usuario
      const diasAplicables = diasInhabilesData.filter(d => 
        d.aplicaPara === 'todos' || d.aplicaPara === tipoUsuario
      );
      
      // Verificar días fijos
      const diaFijo = diasAplicables.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(fechaStr)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = paraTextoResolucion ? fechaATexto(fechaStr) : fechaParaLitigante(fechaStr);
        diasPorFundamento[diaFijo.fundamento].push({fecha: diaTexto, diaNum});
        diasYaIncluidos.set(fechaStr, diaFijo.fundamento);
      }
      
      // Verificar días móviles usando los datos del archivo diasInhabiles.js
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (diaMovilInfo && !diasYaIncluidos.has(fechaStr)) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          const fechaFormateada = paraTextoResolucion ? fechaATexto(fechaStr) : fechaParaLitigante(fechaStr);
          diasPorFundamento[diaMovilInfo.fundamento].push({fecha: fechaFormateada, diaNum});
          diasYaIncluidos.set(fechaStr, diaMovilInfo.fundamento);
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaStr)) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        const fechaFormateadaUsuario = paraTextoResolucion ? fechaATexto(fechaStr) : fechaParaLitigante(fechaStr);
        diasPorFundamento[fundamento].push({fecha: fechaFormateadaUsuario, diaNum});
        diasYaIncluidos.set(fechaStr, fundamento);
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir el texto con notas al pie
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  // Primero verificar si ya existe el artículo 19 en diasPorFundamento
  let superindiceArt19 = '';
  let art19YaExiste = false;
  
  // Revisar si ya hay días con fundamento del artículo 19
  if (diasPorFundamento['artículo 19 de la Ley de Amparo'] && diasPorFundamento['artículo 19 de la Ley de Amparo'].length > 0) {
    art19YaExiste = true;
    // El superíndice se asignará cuando se procese ese fundamento
  }
  
  // Si hay sábados y domingos pero NO existe aún el artículo 19, crear la nota
  let superindiceSabadosDomingos = '';
  if (sabadosDomingos.length > 0 && !art19YaExiste) {
    superindiceSabadosDomingos = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
    notasAlPie.push(`${superindiceSabadosDomingos} Conforme a lo previsto en el artículo 19 de la Ley de Amparo`);
    numeroNota++;
    superindiceArt19 = superindiceSabadosDomingos;
  }
  
  // Función para agrupar días por mes y año
  const agruparDiasPorMesAno = (dias: string[], superindices: string[] = []) => {
    const grupos: {[key: string]: {dia: number, superindice: string}[]} = {};
    const textosCompletos: string[] = [];
    
    // Primero, crear un mapa para eliminar duplicados conservando el primer superíndice
    const diasUnicos = new Map<string, {diaNum: number, superindice: string, mesAno: string}>();
    
    dias.forEach((dia, index) => {
      const superindice = superindices[index] || '';
      
      // Para texto de resolución (fechas completas en texto)
      if (paraTextoResolucion && dia.includes(' de ')) {
        const partes = dia.split(' de ');
        if (partes.length >= 3) {
          const diaTexto = partes[0];
          const mes = partes[1];
          const ano = partes[2];
          const clave = `${mes} de ${ano}`;
          
          // Convertir día texto a número para ordenar
          const diasTextoANumero: {[key: string]: number} = {
            'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
            'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16, 'diecisiete': 17,
            'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23,
            'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28,
            'veintinueve': 29, 'treinta': 30, 'treinta y uno': 31
          };
          
          const diaNum = diasTextoANumero[diaTexto];
          if (diaNum) {
            const key = `${diaNum}-${clave}`;
            if (!diasUnicos.has(key)) {
              diasUnicos.set(key, {diaNum, superindice, mesAno: clave});
            }
          }
        }
      } else {
        // Para formato litigante (números)
        const match = dia.match(/(\d+) de (\w+) de (\d{4})/);
        if (match) {
          const [, diaNum, mes, ano] = match;
          const clave = `${mes} de ${ano}`;
          const key = `${diaNum}-${clave}`;
          if (!diasUnicos.has(key)) {
            diasUnicos.set(key, {diaNum: parseInt(diaNum), superindice, mesAno: clave});
          }
        } else {
          textosCompletos.push(dia + superindice);
        }
      }
    });
    
    // Ahora agrupar por mes/año
    diasUnicos.forEach(({diaNum, superindice, mesAno}) => {
      if (!grupos[mesAno]) grupos[mesAno] = [];
      grupos[mesAno].push({dia: diaNum, superindice});
    });
    
    // Convertir grupos a texto
    const textos: string[] = [];
    const numeroATexto = (num: number): string => {
      const numeros = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
                      'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
                      'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
                      'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho',
                      'veintinueve', 'treinta', 'treinta y uno'];
      return numeros[num] || num.toString();
    };
    
    // Solo procesar si hay un único mes/año
    if (Object.keys(grupos).length === 1) {
      const periodo = Object.keys(grupos)[0];
      const elementos = grupos[periodo];
      
      // Eliminar duplicados manteniendo el primer superíndice
      const vistos = new Set<number>();
      const elementosUnicos: {dia: number, superindice: string}[] = [];
      
      elementos.forEach(elem => {
        if (!vistos.has(elem.dia)) {
          vistos.add(elem.dia);
          elementosUnicos.push(elem);
        }
      });
      
      // Ordenar por día
      elementosUnicos.sort((a, b) => a.dia - b.dia);
      
      // Agrupar consecutivos con mismo superíndice
      const rangos: string[] = [];
      let i = 0;
      
      while (i < elementosUnicos.length) {
        const inicio = i;
        const superindiceActual = elementosUnicos[i].superindice;
        
        // Encontrar el final del rango con el mismo superíndice
        while (i < elementosUnicos.length - 1 && 
               elementosUnicos[i + 1].dia === elementosUnicos[i].dia + 1 &&
               elementosUnicos[i + 1].superindice === superindiceActual) {
          i++;
        }
        
        // Crear el texto del rango
        if (inicio === i) {
          // Solo un día
          rangos.push((paraTextoResolucion ? numeroATexto(elementosUnicos[inicio].dia) : elementosUnicos[inicio].dia.toString()) + superindiceActual);
        } else if (i - inicio === 1) {
          // Dos días
          rangos.push((paraTextoResolucion ? numeroATexto(elementosUnicos[inicio].dia) : elementosUnicos[inicio].dia.toString()) + 
                     ' y ' + 
                     (paraTextoResolucion ? numeroATexto(elementosUnicos[i].dia) : elementosUnicos[i].dia.toString()) + superindiceActual);
        } else {
          // Tres o más días
          rangos.push((paraTextoResolucion ? numeroATexto(elementosUnicos[inicio].dia) : elementosUnicos[inicio].dia.toString()) + 
                     ' a ' + 
                     (paraTextoResolucion ? numeroATexto(elementosUnicos[i].dia) : elementosUnicos[i].dia.toString()) + superindiceActual);
        }
        
        i++;
      }
      
      // Unir todos los rangos y agregar el período al final
      if (rangos.length > 0) {
        let todosLosDias;
        if (rangos.length === 1) {
          todosLosDias = rangos[0];
        } else if (rangos.length === 2) {
          todosLosDias = rangos.join(' y ');
        } else {
          // Para 3 o más elementos, usar comas y "y" antes del último
          todosLosDias = rangos.slice(0, -1).join(', ') + ' y ' + rangos[rangos.length - 1];
        }
        
        textos.push(`${todosLosDias}, todos de ${periodo}`);
      }
    } else {
      // Si hay múltiples meses/años, usar variaciones para evitar repetir el año
      let añoAnterior = '';
      let contadorAño = 0;
      const variacionesAño = ['', 'del mismo año', 'del citado año', 'del año en cita', 'del referido año', 'del año mencionado'];
      
      Object.keys(grupos).forEach((periodo, index) => {
        const elementos = grupos[periodo];
        const [mes, , año] = periodo.split(' ');
        
        const diasArray = elementos.map(elem => 
          (paraTextoResolucion ? numeroATexto(elem.dia) : elem.dia.toString()) + elem.superindice
        );
        
        let diasTexto;
        if (diasArray.length === 1) {
          diasTexto = diasArray[0];
        } else if (diasArray.length === 2) {
          diasTexto = diasArray.join(' y ');
        } else {
          diasTexto = diasArray.slice(0, -1).join(', ') + ' y ' + diasArray[diasArray.length - 1];
        }
        
        // Determinar cómo referenciar el año
        if (año === añoAnterior && contadorAño < variacionesAño.length) {
          // Usar una variación para el mismo año
          const variacion = variacionesAño[contadorAño];
          if (variacion) {
            textos.push(`${diasTexto} de ${mes} ${variacion}`);
          } else {
            textos.push(`${diasTexto} de ${mes}`);
          }
          contadorAño++;
        } else {
          // Primera vez que aparece este año o es diferente del anterior
          textos.push(`${diasTexto} de ${periodo}`);
          if (año !== añoAnterior) {
            añoAnterior = año;
            contadorAño = 1; // Reiniciar contador para el nuevo año
          }
        }
      });
    }
    
    return [...textos, ...textosCompletos];
  };

  // Primero agregar días específicos con fundamentos
  const todosLosDiasConSuperindices: {dia: string, superindice: string}[] = [];
  
  ordenFundamentos.forEach(fundamentoBuscado => {
    Object.keys(diasPorFundamento).forEach(fundamento => {
      if (fundamento.includes(fundamentoBuscado) || (fundamentoBuscado === 'usuario' && fundamento === fundamentoAdicional)) {
        const dias = diasPorFundamento[fundamento];
        if (dias && dias.length > 0) {
          let superindice: string;
          let debeAgregarNota = true;
          
          // Si es el artículo 19 y ya tenemos sábados/domingos con nota, reusar el superíndice
          if (fundamento === 'artículo 19 de la Ley de Amparo' && sabadosDomingos.length > 0) {
            if (superindiceArt19) {
              // Ya existe el superíndice del artículo 19 de los sábados/domingos
              superindice = superindiceArt19;
              debeAgregarNota = false; // No agregar nota duplicada
            } else {
              // Primera vez que aparece el artículo 19
              superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
              superindiceArt19 = superindice;
              superindiceSabadosDomingos = superindice;
            }
          } else {
            // Otros fundamentos
            superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          }
          
          // Agregar cada día con su superíndice
          dias.forEach(diaObj => {
            todosLosDiasConSuperindices.push({dia: diaObj.fecha, superindice});
          });
          
          // Solo agregar la nota si no es duplicada
          if (debeAgregarNota) {
            notasAlPie.push(`${superindice} ${fundamento}`);
            numeroNota++;
          }
        }
      }
    });
  });
  
  // Si hay sábados/domingos y el artículo 19 ya fue procesado, usar su superíndice
  if (sabadosDomingos.length > 0 && art19YaExiste && superindiceArt19) {
    superindiceSabadosDomingos = superindiceArt19;
  }
  
  // Construir texto final
  if (paraTextoResolucion) {
    // Para texto de resolución, formato específico
    const diasSolos = todosLosDiasConSuperindices.map(item => item.dia);
    const superindicesSolos = todosLosDiasConSuperindices.map(item => item.superindice);
    const diasAgrupados = agruparDiasPorMesAno(diasSolos, superindicesSolos);
    
    // Construir el texto completo para resolución
    let textoFinal = '';
    
    if (sabadosDomingos.length > 0) {
      const sabDomAgrupados = agruparDiasPorMesAno(sabadosDomingos);
      textoFinal = sabDomAgrupados.join(', ') + ', por ser sábados y domingos' + superindiceSabadosDomingos;
      
      if (diasAgrupados.length > 0) {
        // Analizar si los días agrupados ya contienen el mismo mes/año que los sábados y domingos
        let diasModificados = diasAgrupados.join(', ');
        
        // Si el texto ya contiene el mes y año que acabamos de mencionar, simplificarlo
        if (sabDomAgrupados.length > 0 && diasAgrupados.length > 0) {
          // Extraer el mes y año del primer grupo de sábados/domingos
          const matchMesAño = sabDomAgrupados[0].match(/de (\w+ de [^,]+)$/);
          if (matchMesAño) {
            const mesAñoRepetido = matchMesAño[1];
            // Reemplazar la repetición del mismo mes/año
            // Usar diferentes variaciones para evitar repetición
            // Para sábados y domingos usar "del año señalado"
            // Para otros días inhábiles usar "también de esos mes y año"
            if (diasAgrupados[0].includes(`, todos de ${mesAñoRepetido}`)) {
              const [mes] = mesAñoRepetido.split(' de ');
              // Cambiar el formato de los sábados y domingos
              const sabDomModificado = sabDomAgrupados[0].replace(`, todos de ${mesAñoRepetido}`, `, todos de ${mes} del año señalado`);
              textoFinal = sabDomModificado + ', por ser sábados y domingos' + superindiceSabadosDomingos;
              
              // Y para los otros días usar "también de esos mes y año"
              diasModificados = diasAgrupados[0].replace(`, todos de ${mesAñoRepetido}`, ', también de esos mes y año');
            } else if (diasAgrupados[0].includes(` de ${mesAñoRepetido}`)) {
              // Si es un formato diferente, ajustar según corresponda
              diasModificados = diasAgrupados[0].replace(` de ${mesAñoRepetido}`, ' del mismo mes y año');
            }
          }
        }
        
        textoFinal += '; ni los días ' + diasModificados + ', que de igual forma son inhábiles';
      }
    } else if (diasAgrupados.length > 0) {
      textoFinal = diasAgrupados.join(', ');
    }
    
    return {
      texto: textoFinal,
      notas: notasAlPie
    };
  } else {
    // Para formato de litigantes
    const diasTexto: string[] = [];
    
    if (sabadosDomingos.length > 0) {
      // Contar sábados y domingos para ajustar singular/plural
      const sabados = sabadosDomingos.filter(fecha => {
        if (fecha.includes(' de ')) {
          // Para formato de texto completo, necesitamos parsear la fecha
          const partes = fecha.split(' de ');
          if (partes.length >= 3) {
            // Reconstruir fecha y verificar día de la semana
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const mesIndex = meses.indexOf(partes[1]);
            if (mesIndex !== -1) {
              const testDate = new Date(parseInt(partes[2]), mesIndex, 1);
              // Buscar el día correcto del mes
              return testDate.getDay() === 6; // Sábado
            }
          }
        }
        return false;
      }).length;
      
      const domingos = sabadosDomingos.length - sabados;
      
      let rangoTexto;
      if (sabados === 1 && domingos === 1) {
        rangoTexto = `el sábado y domingo incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if (sabados === 1 && domingos === 0) {
        rangoTexto = `el sábado incluido entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if (sabados === 0 && domingos === 1) {
        rangoTexto = `el domingo incluido entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if (sabados > 1 && domingos > 1) {
        rangoTexto = `los sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if (sabados > 1 && domingos === 0) {
        rangoTexto = `los sábados incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if (sabados === 0 && domingos > 1) {
        rangoTexto = `los domingos incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else if ((sabados === 1 && domingos > 1) || (sabados > 1 && domingos === 1)) {
        rangoTexto = `los sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      } else {
        // Fallback por si hay algún caso no cubierto
        rangoTexto = `todos los sábados y domingos incluidos entre el día de la notificación y el último día del cómputo${superindiceSabadosDomingos}`;
      }
      
      diasTexto.push(rangoTexto);
    }
    
    // Agrupar días con fundamento para litigantes
    const diasSolos = todosLosDiasConSuperindices.map(item => item.dia);
    const superindicesSolos = todosLosDiasConSuperindices.map(item => item.superindice);
    const diasAgrupados = agruparDiasPorMesAno(diasSolos, superindicesSolos);
    diasTexto.push(...diasAgrupados);
    
    return {
      texto: diasTexto.join(', '),
      notas: notasAlPie
    };
  }
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
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
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
  const [tipoFecha, setTipoFecha] = useState<'notificacion' | 'conocimiento' | ''>('');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoFecha) {
      alert('Por favor seleccione el tipo de fecha (Notificación o Conocimiento)');
      return;
    }
    
    setCalculando(true);
    
    setTimeout(() => {
      const plazo = formData.tipoRecurso === 'principal' ? 10 : 5;
      const fundamento = formData.tipoRecurso === 'principal' 
        ? 'artículo 86, primer párrafo, de la Ley de Amparo'
        : 'artículo 82 de la Ley de Amparo';
      
      let fechaInicio;
      let usandoFechaConocimiento = false;
      let fechaSurte;
      let textoSurte = '';
      let fundamentoSurte = '';
      
      if (tipoFecha === 'conocimiento' && formData.fechaConocimiento) {
        // Si hay fecha de conocimiento, usar esa fecha
        const fechaConocimiento = new Date(formData.fechaConocimiento + 'T12:00:00');
        // El plazo inicia al día siguiente de la fecha de conocimiento
        fechaInicio = siguienteDiaHabil(fechaConocimiento, diasAdicionales, tipoUsuario);
        usandoFechaConocimiento = true;
      } else if (tipoFecha === 'notificacion' && formData.fechaNotificacion) {
        // Usar la lógica normal con fecha de notificación
        const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
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
      
      // Para días inhábiles, incluir desde la fecha de notificación hasta el final del plazo
      const fechaDesde = tipoFecha === 'conocimiento' && formData.fechaConocimiento ? 
        new Date(formData.fechaConocimiento + 'T12:00:00') : 
        (formData.fechaNotificacion ? new Date(formData.fechaNotificacion + 'T12:00:00') : fechaInicio);
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaDesde, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      
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
        diasInhabiles: diasInhabilesInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        plazoTexto: numeroATexto(plazo)
      });
      
      setCalculando(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
            usuario: user?.email || 'Anónimo',
            calculadora: 'revision'
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
      expediente: numeroExpediente,
      tipo: 'revision' as const,
      fechaInicio: resultado.fechaInicio.toISOString(),
      fechaFin: resultado.fechaFin.toISOString(),
      diasHabiles: resultado.diasHabiles,
      diasNaturales: resultado.diasNaturales,
      tipoRecurso: formData.tipoRecurso,
      telefono: telefonoWhatsApp,
      detalles: {
        tipoNotificacion: formData.tipoNotificacion,
        fechaNotificacion: formData.fechaNotificacion,
        fechaAudiencia: formData.fechaAudiencia || '',
        fechaListaSurtimientoEfectos: formData.fechaListaSurtimientoEfectos || '',
        surtimientoEnDomingo: formData.surtimientoEnDomingo || false
      }
    };
    
    const guardado = computosStorage.guardar(nuevoCalculo);
    
    if (guardado.exito) {
      alert(`Cálculo guardado exitosamente para expediente ${numeroExpediente}`);
      setNumeroExpediente('');
    } else {
      alert(guardado.mensaje);
    }
  };

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
    
    // Generar días inhábiles en formato texto completo para resolución
    // Incluir desde la fecha de notificación/conocimiento hasta el final del plazo
    const fechaDesdeTexto = resultado.usandoFechaConocimiento && resultado.fechaConocimiento ? 
      resultado.fechaConocimiento : 
      (resultado.fechaNotificacion || resultado.fechaInicio);
    
    const diasInhabilesTextoResolucion = obtenerDiasInhabilesConNotas(
      fechaDesdeTexto, 
      resultado.fechaFin, 
      diasAdicionales, 
      fundamentoAdicional, 
      tipoUsuario, 
      true // paraTextoResolucion = true
    );
    
    // Verificar si el recurso se presentó antes del cómputo
    const fechaPres = formData.fechaPresentacion ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
    const presentadoAntesDelComputo = fechaPres && fechaPres < resultado.fechaInicio;
    
    // Determinar género según la parte recurrente
    const generoRecurrente = formData.parteRecurrente === 'autoridad' ? 'autoridad responsable' : 
                             formData.parteRecurrente === 'quejoso' ? 'quejosa' : 
                             'tercera interesada';
    
    // Determinar si las fechas son del mismo mes y año
    const fechaNotif = resultado.fechaNotificacion;
    const fechaSurte = resultado.fechaSurte;
    const mismoMesAno = fechaNotif && fechaSurte && 
                        fechaNotif.getMonth() === fechaSurte.getMonth() && 
                        fechaNotif.getFullYear() === fechaSurte.getFullYear();
    
    // Generar texto de fecha que surte efectos
    let textoFechaSurte = resultado.fechaSurteEfectosTexto;
    if (mismoMesAno && resultado.textoSurte.includes('siguiente día')) {
      const dia = fechaSurte.getDate();
      const dias = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
                    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
                    'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
                    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho',
                    'veintinueve', 'treinta', 'treinta y uno'];
      textoFechaSurte = dias[dia] + ' del citado mes';
    }
    
    // Contar las referencias a la Ley de Amparo
    let contadorLeyAmparo = 0;
    const reemplazarLeyAmparo = (texto) => {
      contadorLeyAmparo++;
      if (contadorLeyAmparo === 1) return 'Ley de Amparo';
      if (contadorLeyAmparo === 2) return 'Ley de la Materia';
      if (contadorLeyAmparo === 3) return 'ley referida';
      if (contadorLeyAmparo === 4) return 'citada legislación';
      return 'ley en comento';
    };
    
    // Extraer el mes y año de la fecha de notificación para pasar contexto
    let mesAñoContexto = '';
    if (resultado.fechaNotificacion) {
      const mesNotif = resultado.fechaNotificacion.getMonth();
      const añoNotif = resultado.fechaNotificacion.getFullYear();
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      mesAñoContexto = `${meses[mesNotif]} de ${añoNotif}`;
    }
    
    // Generar texto del período del cómputo con variaciones apropiadas
    let textoPeriodoComputo = '';
    if (resultado.fechaInicio.getFullYear() === resultado.fechaFin.getFullYear()) {
      if (resultado.fechaInicio.getMonth() === resultado.fechaFin.getMonth()) {
        // Mismo mes y año
        textoPeriodoComputo = `del ${resultado.fechaInicioTexto} al ${fechaATexto(resultado.fechaFin.toISOString().split('T')[0]).split(' de ').slice(0, -1).join(' de ')} del citado mes`;
      } else {
        // Diferente mes, mismo año - usar formato completo para inicio y simplificar el final
        const fechaFinParts = resultado.fechaFinTexto.split(' de ');
        const diaFinTexto = fechaFinParts[0];
        const mesFinTexto = fechaFinParts[1];
        textoPeriodoComputo = `del ${resultado.fechaInicioTexto} al ${diaFinTexto} de ${mesFinTexto} del mismo año`;
      }
    } else {
      // Diferente año
      textoPeriodoComputo = `del ${resultado.fechaInicioTexto} al ${resultado.fechaFinTexto}`;
    }
    
    let texto = `\tEl recurso de revisión ${formData.tipoRecurso} se interpuso dentro del plazo de ${resultado.plazoTexto} días previsto en el ${resultado.fundamento}, dado que ${resultado.resolucionImpugnada} se notificó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, quien tiene el carácter de ${generoRecurrente} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, por lo que la referida notificación surtió efectos ${resultado.textoSurte}, ${textoFechaSurte}, de conformidad con lo dispuesto por el ${resultado.fundamentoSurte.replace('Ley de Amparo', reemplazarLeyAmparo(''))}; computándose el referido plazo ${textoPeriodoComputo}, sin contar los días ${diasInhabilesTextoResolucion.texto}.

\tPor ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;

    // Primero obtener las notas de días inhábiles para saber cuántas hay
    let notasAlPie = [];
    if (diasInhabilesTextoResolucion.notas && diasInhabilesTextoResolucion.notas.length > 0) {
      notasAlPie = notasAlPie.concat(diasInhabilesTextoResolucion.notas);
    }
    
    // Calcular el número de nota para la jurisprudencia (será el siguiente después de las notas de días inhábiles)
    const numeroNotaJurisprudencia = notasAlPie.length + 1;
    const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    const superindiceJurisprudencia = numeroNotaJurisprudencia <= 9 ? superindices[numeroNotaJurisprudencia - 1] : `(${numeroNotaJurisprudencia})`;
    
    // Agregar jurisprudencia si se presentó antes del cómputo
    if (presentadoAntesDelComputo && resultado.esOportuno) {
      if (formData.tipoRecurso === 'principal') {
        texto += `\n\n\tAl respecto, resulta aplicable la jurisprudencia 2a./J. 16/2016 (10a.)${superindiceJurisprudencia}, sustentada por la Segunda Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:

\t"**RECURSO DE REVISIÓN EN EL JUICIO DE AMPARO. SU INTERPOSICIÓN RESULTA OPORTUNA AUN CUANDO OCURRA ANTES DE QUE INICIE EL CÓMPUTO DEL PLAZO RESPECTIVO.** El artículo 86 de la ${reemplazarLeyAmparo('')} establece que el plazo para interponer el recurso de revisión es de 10 días, y acorde con el diverso 22 de la misma ley, donde se precisan las reglas para el cómputo de los plazos en el juicio de amparo, en ellos se incluirá el día del vencimiento. De esta manera, de la interpretación de ambos preceptos se concluye que, al fijar un plazo para la interposición del recurso, el legislador quiso establecer un límite temporal a las partes para ejercer su derecho de revisión de las resoluciones dictadas dentro del juicio de amparo, a fin de generar seguridad jurídica respecto a la firmeza de esas decisiones jurisdiccionales; sin embargo, las referidas normas no prohíben que pueda interponerse dicho recurso antes de que inicie el cómputo del plazo, debido a que esa anticipación no infringe ni sobrepasa el término previsto en la ley."`;
        
        // Agregar la nota al pie de la jurisprudencia
        notasAlPie.push(`${superindiceJurisprudencia} Libro 27, Febrero de 2016, Tomo I de la Gaceta del Semanario Judicial de la Federación, Décima Época, p. 729, registro 2011123.`);
      } else if (formData.tipoRecurso === 'adhesivo') {
        texto += `\n\n\tAl respecto, resulta aplicable la jurisprudencia 1a./J. 39/2019 (10a.), sustentada por la Primera Sala de la Suprema Corte de Justicia de la Nación, con el rubro y texto siguientes:

\t"**RECURSO DE REVISIÓN ADHESIVA. SU INTERPOSICIÓN ES OPORTUNA, AUN SI SE PRESENTA ANTES DE QUE SEA NOTIFICADO EL ACUERDO POR EL QUE SE ADMITE EL PRINCIPAL.** En términos del artículo 82 de la ${reemplazarLeyAmparo('')}, la regla general para la presentación del recurso de revisión adhesiva es que deberá hacerse dentro del plazo de cinco días, contados a partir del siguiente a aquel en el que surta efectos la notificación de la admisión del recurso principal. Sin embargo, de los numerales 21 y 22 de la ${reemplazarLeyAmparo('')}, y aplicados análoga y sistemáticamente con el artículo 82 aludido, se concluye que si el recurrente adhesivo interpone el recurso de mérito antes de que le hubiere sido notificado el acuerdo de admisión del principal, no puede considerarse extemporáneo; máxime que la propia ley reglamentaria no dispone prohibición alguna al respecto, ni señala que por esta condición el medio de defensa sea inoportuno."`;
      }
    }
    
    // Si hay notas al pie, agregarlas al texto
    if (notasAlPie.length > 0) {
      texto += '\n\n_________________\n';
      texto += notasAlPie.join('\n');
    }
    
    return texto;
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
            Recurso de Revisión
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
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Tipo de Recurso</label>
                  <select name="tipoRecurso" value={formData.tipoRecurso} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                    <option value="principal">Principal</option>
                    <option value="adhesivo">Adhesivo</option>
                  </select>
                </div>
                
                {formData.tipoRecurso !== 'adhesivo' && (
                  <div>
                    <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Resolución Impugnada</label>
                    <select name="resolucionImpugnada" value={formData.resolucionImpugnada} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} required={formData.tipoRecurso !== 'adhesivo'} suppressHydrationWarning={true}>
                      <option value="">Seleccione...</option>
                      <option value="sentencia">Sentencia</option>
                      <option value="auto">Auto de sobreseimiento</option>
                      <option value="interlocutoria">Interlocutoria dictada en el incidente de suspensión</option>
                    </select>
                  </div>
                )}
                
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
                          {formData.tipoRecurso === 'adhesivo' ? 'Fecha de Notificación del Auto de Admisión de la Revisión Principal' : 'Fecha de Notificación'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campos de notificación justo después de seleccionar esa opción */}
                    {tipoFecha === 'notificacion' && (
                      <div className="ml-8 space-y-4" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: formData.tipoRecurso === 'adhesivo' ? '0.75rem' : '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            {formData.tipoRecurso === 'adhesivo' ? 'Fecha de Notificación del Auto de Admisión de la Revisión Principal' : 'Fecha de Notificación'}
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
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                          <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '12px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} required suppressHydrationWarning={true}>
                            <option value="">Seleccione...</option>
                            <option value="personal">Personalmente</option>
                            {(formData.parteRecurrente === 'autoridad' || formData.parteRecurrente === 'autoridad-tercero') && (
                              <option value="oficio">Por oficio</option>
                            )}
                            <option value="lista">Por lista</option>
                            <option value="electronica">En forma electrónica</option>
                          </select>
                        </div>
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
                          {formData.tipoRecurso === 'adhesivo' ? 'Fecha de Conocimiento del Auto de Admisión de la Revisión Principal' : 'Fecha de Conocimiento'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Mostrar campo de conocimiento */}
                    {tipoFecha === 'conocimiento' && (
                      <div className="ml-8" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                        <div>
                          <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: formData.tipoRecurso === 'adhesivo' ? '0.75rem' : '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            {formData.tipoRecurso === 'adhesivo' ? 'Fecha de Conocimiento del Auto de Admisión de la Revisión Principal' : 'Fecha de Conocimiento'}
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
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Presentación</label>
                      <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #E0E0E0', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#E0E0E0'} required={tipoUsuario === 'servidor'} />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Forma de Presentación</label>
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
                  <label className="label block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onFocus={(e) => e.target.style.borderColor = '#C5A770'} onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} suppressHydrationWarning={true} />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 k-law-text">Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center p-2 text-sm" style={{ backgroundColor: '#F4EFE8', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
                          <span className="text">{tipoUsuario === 'litigante' ? fechaParaLitigante(dia) : fechaATexto(dia)}</span>
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
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1C1C1C' }}>
                      El plazo vence el: {' '}
                      <span style={{ color: '#16a34a' }}>
                        {fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0])}
                      </span>
                    </p>
                    {resultado.diasRestantes > 0 && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666666' }}>
                        Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Detalles del cómputo - para litigantes */}
              {tipoUsuario === 'litigante' && (
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#F4EFE8', border: '1.5px solid #C5A770' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Detalles del Cómputo:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Plazo legal:</strong> {resultado.plazo} días</p>
                    <p><strong>Fundamento:</strong> {resultado.fundamento}</p>
                    {resultado.usandoFechaConocimiento ? (
                      <p><strong>Fecha en que manifestó tener conocimiento:</strong> {fechaParaLitigante(formData.fechaConocimiento)}</p>
                    ) : (
                      <>
                        <p><strong>Fecha de notificación:</strong> {fechaParaLitigante(formData.fechaNotificacion)}</p>
                        <p><strong>Surte efectos:</strong> {fechaParaLitigante(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                        <p><strong>Fundamento de la fecha en que surte efectos la notificación:</strong> {resultado.fundamentoSurte}</p>
                      </>
                    )}
                    <p><strong>Período del cómputo:</strong> Del {(() => {
                      const fechaInicio = fechaParaLitigante(resultado.fechaInicio.toISOString().split('T')[0]);
                      const fechaFin = fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0]);
                      
                      // Si el año es el mismo, simplificar
                      const añoInicio = resultado.fechaInicio.getFullYear();
                      const añoFin = resultado.fechaFin.getFullYear();
                      
                      if (añoInicio === añoFin) {
                        // Quitar el año de la fecha de inicio
                        const fechaInicioSinAño = fechaInicio.replace(` de ${añoInicio}`, '');
                        return `${fechaInicioSinAño} al ${fechaFin}`;
                      }
                      
                      return `${fechaInicio} al ${fechaFin}`;
                    })()}</p>
                    <p><strong>Días excluidos:</strong> {(() => {
                      const fechaDesde = resultado.usandoFechaConocimiento && resultado.fechaConocimiento ? 
                        resultado.fechaConocimiento : 
                        (resultado.fechaNotificacion || resultado.fechaInicio);
                      const diasInhabilesLitigante = obtenerDiasInhabilesConNotas(fechaDesde, resultado.fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario, false);
                      return diasInhabilesLitigante.texto;
                    })()}</p>
                  </div>
                  
                  {/* Notas al pie para litigantes */}
                  {(() => {
                    const fechaDesde = resultado.usandoFechaConocimiento && resultado.fechaConocimiento ? 
                      resultado.fechaConocimiento : 
                      (resultado.fechaNotificacion || resultado.fechaInicio);
                    const diasInhabilesLitigante = obtenerDiasInhabilesConNotas(fechaDesde, resultado.fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario, false);
                    return diasInhabilesLitigante.notas && diasInhabilesLitigante.notas.length > 0 && (
                      <>
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid #e5e7eb' }}></div>
                        <div className="text-xs k-law-text opacity-70 space-y-1">
                          {diasInhabilesLitigante.notas.map((nota, index) => (
                            <p key={index}>{nota}</p>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                  
                </div>
              )}
              
              {/* Calendario visual - también para litigantes */}
              {tipoUsuario === 'litigante' && (
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
                    />
                  </div>
                </div>
              )}
              {/* Detalles del cómputo - SOLO para servidores públicos */}
              {tipoUsuario === 'servidor' && (
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#F4EFE8', border: '1.5px solid #C5A770' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Detalles del Cómputo:</h3>
                  <div className="space-y-1 text-sm">
                  <p><strong>Plazo legal:</strong> {resultado.plazo} días</p>
                  <p><strong>Fundamento:</strong> {resultado.fundamento}</p>
                  {resultado.usandoFechaConocimiento ? (
                    <p><strong>Fecha en que manifestó tener conocimiento:</strong> {fechaParaLitigante(formData.fechaConocimiento)}</p>
                  ) : (
                    <>
                      <p><strong>Fecha de notificación:</strong> {fechaParaLitigante(formData.fechaNotificacion)}</p>
                      <p><strong>Surte efectos:</strong> {fechaParaLitigante(resultado.fechaSurte.toISOString().split('T')[0])}</p>
                    </>
                  )}
                  <p><strong>Período del cómputo:</strong> Del {(() => {
                    const fechaInicio = fechaParaLitigante(resultado.fechaInicio.toISOString().split('T')[0]);
                    const fechaFin = fechaParaLitigante(resultado.fechaFin.toISOString().split('T')[0]);
                    
                    // Si el año es el mismo, simplificar
                    const añoInicio = resultado.fechaInicio.getFullYear();
                    const añoFin = resultado.fechaFin.getFullYear();
                    
                    if (añoInicio === añoFin) {
                      // Quitar el año de la fecha de inicio
                      const fechaInicioSinAño = fechaInicio.replace(` de ${añoInicio}`, '');
                      return `${fechaInicioSinAño} al ${fechaFin}`;
                    }
                    
                    return `${fechaInicio} al ${fechaFin}`;
                  })()}</p>
                  <p><strong>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaParaLitigante(formData.fechaPresentacion) : ''}</p>
                  <p><strong>Forma de presentación:</strong> {(() => {
                    const formas: {[key: string]: string} = {
                      'escrito': 'Por escrito',
                      'correo': 'Por correo',
                      'momento': 'Al momento de ser notificado',
                      'electronica': 'En forma electrónica'
                    };
                    return formas[formData.formaPresentacion] || formData.formaPresentacion;
                  })()}</p>
                  <p><strong>Días inhábiles excluidos:</strong> {(() => {
                    const fechaDesde = resultado.usandoFechaConocimiento && resultado.fechaConocimiento ? 
                      resultado.fechaConocimiento : 
                      (resultado.fechaNotificacion || resultado.fechaInicio);
                    const diasInhabilesNumerico = obtenerDiasInhabilesConNotas(fechaDesde, resultado.fechaFin, diasAdicionales, fundamentoAdicional, 'litigante', false);
                    return diasInhabilesNumerico.texto;
                  })()}</p>
                  </div>
                </div>
              )}
              
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
                    />
                  </div>
                </div>
              )}
              
              {tipoUsuario === 'servidor' && (
                <div className="p-4 rounded-lg mt-6" style={{ backgroundColor: '#F4EFE8', border: '1.5px solid #C5A770' }}>
                  <h3 className="font-bold mb-2" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Texto para Resolución:</h3>
                  <div 
                    className="text-sm font-['Arial'] leading-relaxed" 
                    style={{
                      textAlign: 'justify',
                      textJustify: 'inter-word'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generarTexto()
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\t/g, '')
                        .split('\n')
                        .map(paragraph => paragraph.trim())
                        .filter(paragraph => paragraph.length > 0)
                        .map(paragraph => `<p style="text-indent: 2em; margin-bottom: 1em;">${paragraph}</p>`)
                        .join('')
                    }}
                  />
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                {tipoUsuario === 'servidor' && (
                  <>
                    <button onClick={copiarCalendario} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                      Copiar calendario
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                      Copiar texto
                    </button>
                  </>
                )}
                <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', fechaConocimiento: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); setTipoFecha(''); }} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C5A770'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}>
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Sección para litigantes */}
            {tipoUsuario === 'litigante' && (
              <div className="mt-6 rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #C5A770', boxShadow: '0 4px 20px rgba(28, 28, 28, 0.08)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#1C1C1C', fontFamily: 'Playfair Display, serif' }}>Guardar Cálculo y Notificaciones</h3>
                  <Link href="/computos-guardados" className="text-blue-600 hover:underline text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Ver todos los cómputos guardados →
                  </Link>
                </div>
                
                <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Puedes guardar hasta 5 cálculos. Actualmente tienes {computosStorage.obtenerTodos().length} de 5 guardados.
                </p>
                
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
                  disabled={!numeroExpediente || computosStorage.obtenerTodos().length >= 5}
                  className="text-white px-6 py-2 rounded-lg disabled:bg-gray-400" 
                  style={{ backgroundColor: (!numeroExpediente || computosStorage.obtenerTodos().length >= 5) ? '#B0B0B0' : '#1C1C1C', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }} 
                  onMouseEnter={(e) => { if (numeroExpediente && computosStorage.obtenerTodos().length < 5) e.currentTarget.style.backgroundColor = '#C5A770'; }} 
                  onMouseLeave={(e) => { if (numeroExpediente && computosStorage.obtenerTodos().length < 5) e.currentTarget.style.backgroundColor = '#1C1C1C'; }}
                >
                  {computosStorage.obtenerTodos().length >= 5 ? 'Límite alcanzado (5/5)' : `Guardar Cálculo (${computosStorage.obtenerTodos().length}/5)`}
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
        
        {/* Lista de cálculos guardados para litigantes - COMENTADO */}
        {/* {tipoUsuario === 'litigante' && calculos.length > 0 && (
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
        )} */}
      </main>
    </div>
  );
}