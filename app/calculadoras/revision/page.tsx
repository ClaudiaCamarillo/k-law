<<<<<<< HEAD
'use client'

import { useState } from 'react'
import Link from 'next/link'

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

// Datos de días inhábiles de la tabla de Google Sheets
const diasInhabilesData = [
  // Ley de Amparo
  { dia: 'sábados y domingos', fundamento: 'artículo 19 de la Ley de Amparo', tipo: 'finDeSemana' },
  { dia: '1 de enero', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '01-01' },
  { dia: '5 de febrero', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '02-05' },
  { dia: '21 de marzo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '03-21' },
  { dia: '1 de mayo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '05-01' },
  { dia: '5 de mayo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '05-05' },
  { dia: '14 de septiembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '09-14' },
  { dia: '16 de septiembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '09-16' },
  { dia: '12 de octubre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '10-12' },
  { dia: '20 de noviembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '11-20' },
  { dia: '25 de diciembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '12-25' },
  
  // Ley Federal del Trabajo
  { dia: 'primer lunes de febrero', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: 'tercer lunes de marzo', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: 'tercer lunes de noviembre', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: '1 de diciembre 2000', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2000-12-01' },
  { dia: '1 de diciembre 2006', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2006-12-01' },
  { dia: '1 de diciembre 2012', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2012-12-01' },
  { dia: '1 de diciembre 2018', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2018-12-01' },
  { dia: '1 de diciembre 2024', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2024-12-01' },
  { dia: '1 de diciembre 2030', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2030-12-01' },
  { dia: '1 de diciembre 2036', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2036-12-01' },
  
  // Circulares del CJF (ejemplos para 2024)
  { dia: '28 de marzo de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-03-28' },
  { dia: '29 de marzo de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-03-29' },
  { dia: '1 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-01' },
  { dia: '2 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-02' },
  { dia: '3 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-03' },
  { dia: '4 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-04' },
  { dia: '5 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-05' }
];

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

// Función para verificar si es día inhábil
function esDiaInhabil(fecha: Date, diasAdicionales: string[] = []): boolean {
  // Sábados y domingos
  if (fecha.getDay() === 0 || fecha.getDay() === 6) return true;
  
  const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const fechaStr = fecha.toISOString().split('T')[0];
  const año = fecha.getFullYear();
  
  // Días fijos
  if (diasInhabilesData.some(d => d.fecha === mesdia || d.fecha === fechaStr)) return true;
  
  // Días móviles
  const diasMoviles = calcularDiasMoviles(año);
  if (diasMoviles.some(d => d.fecha === fechaStr)) return true;
  
  // Días adicionales del usuario
  return diasAdicionales.includes(fechaStr);
}

// Función para el siguiente día hábil
function siguienteDiaHabil(fecha: Date, diasAdicionales: string[] = []): Date {
  const siguiente = new Date(fecha);
  siguiente.setDate(siguiente.getDate() + 1);
  while (esDiaInhabil(siguiente, diasAdicionales)) {
    siguiente.setDate(siguiente.getDate() + 1);
  }
  return siguiente;
}

// Función para calcular el plazo - CORREGIDA
function calcularPlazoReal(fechaInicio: Date, dias: number, diasAdicionales: string[] = []): Date {
  let fecha = new Date(fechaInicio);
  let diasHabiles = 1; // Empezamos en 1 porque fechaInicio ya es el primer día
  
  while (diasHabiles < dias) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha, diasAdicionales)) {
      diasHabiles++;
    }
  }
  
  return fecha;
}

// Función para obtener días inhábiles con notas al pie
function obtenerDiasInhabilesConNotas(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '') {
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
      // Verificar días fijos
      const diaFijo = diasInhabilesData.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(diaFijo.dia)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        // Para circulares, usar solo la fecha sin descripción adicional
        const diaTexto = diaFijo.fundamento.includes('Circular') ? fechaATexto(fechaStr) : diaFijo.dia;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(diaFijo.dia);
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasInhabilesData.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (diaMovilInfo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(fechaATexto(fechaStr));
          diasYaIncluidos.add(fechaATexto(fechaStr));
        }
      }
      
      // Días adicionales del usuario
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        diasPorFundamento[fundamento].push(fechaATexto(fechaStr));
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
          const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          diasTexto = diasTexto.concat(dias.map(dia => dia + superindice));
          notasAlPie.push(`${superindice} ${fundamento}`);
          numeroNota++;
        }
      }
    });
  });
  
  return {
    texto: diasTexto.join(', '),
    notas: notasAlPie
  };
}

export default function Calculadora() {
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    formaNotificacion: '',
    fechaPresentacion: '',
    formaPresentacion: ''
  });
  
  const [diasAdicionales, setDiasAdicionales] = useState<string[]>([]);
  const [nuevoDiaInhabil, setNuevoDiaInhabil] = useState('');
  const [fundamentoAdicional, setFundamentoAdicional] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [calculando, setCalculando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    
    setTimeout(() => {
      const plazo = formData.tipoRecurso === 'principal' ? 10 : 5;
      const fundamento = formData.tipoRecurso === 'principal' 
        ? 'artículo 86, fracción I, de la Ley de Amparo'
        : 'artículo 82 de la Ley de Amparo';
      
      const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
      let fechaSurte = new Date(fechaNotif);
      let textoSurte = '';
      let fundamentoSurte = '';
      
      const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                         (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
      
      if (esAutoridad) {
        textoSurte = 'el mismo día';
        fundamentoSurte = 'artículo 31, fracción II, de la Ley de Amparo';
      } else if (formData.formaNotificacion === 'electronica') {
        textoSurte = 'el mismo día en que se genera el acuse electrónico';
        fundamentoSurte = 'artículo 31, fracción III, de la Ley de Amparo';
      } else {
        textoSurte = 'al siguiente día hábil';
        fundamentoSurte = 'artículo 31, fracción I, de la Ley de Amparo';
        fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales);
      }
      
      // CORRECCIÓN: El plazo inicia al día siguiente del que surte efectos
      const fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales);
      
      // CORRECCIÓN: Usar la función corregida para calcular el plazo
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales);
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const esOportuno = fechaPres <= fechaFin;
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaInicio, fechaFin, diasAdicionales, fundamentoAdicional);
      
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
        'admision': 'el auto de admisión del recurso principal'
      };
      
      setResultado({
        esOportuno,
        plazo,
        fundamento,
        textoSurte,
        fundamentoSurte,
        fechaNotificacionTexto: fechaATexto(formData.fechaNotificacion),
        fechaSurteEfectosTexto: fechaATexto(fechaSurte.toISOString().split('T')[0]),
        fechaInicioTexto: fechaATexto(fechaInicio.toISOString().split('T')[0]),
        fechaFinTexto: fechaATexto(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionTexto: fechaATexto(formData.fechaPresentacion),
        diasInhabiles: diasInhabilesInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada
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
  
  const agregarDiaInhabil = () => {
    if (nuevoDiaInhabil && !diasAdicionales.includes(nuevoDiaInhabil)) {
      setDiasAdicionales([...diasAdicionales, nuevoDiaInhabil]);
      setNuevoDiaInhabil('');
    }
  };

  const generarTexto = () => {
    if (!resultado) return '';
    
    let texto = `El recurso de revisión ${formData.tipoRecurso} se interpuso de forma ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, conforme a lo previsto en el ${resultado.fundamento}, dado que ${resultado.resolucionImpugnada}, se notificó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, quien tiene el carácter de ${formData.parteRecurrente} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, por lo que la referida notificación surtió efectos ${resultado.textoSurte}, ${resultado.fechaSurteEfectosTexto}, de conformidad con lo dispuesto por el ${resultado.fundamentoSurte}, computándose el referido plazo del ${resultado.fechaInicioTexto} al ${resultado.fechaFinTexto}, sin contar los días ${resultado.diasInhabiles}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    
    // Agregar notas al pie si existen
    if (resultado.notasAlPie && resultado.notasAlPie.length > 0) {
      texto += '\n\n_________________\n';
      texto += resultado.notasAlPie.join('\n');
    }
    
    return texto;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              LegalCompute Pro
            </Link>
            <div className="text-sm text-gray-600">
              Plan Gratuito - 5 cálculos restantes
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Calculadora de Plazos - Recursos de Revisión</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Recurso</label>
                  <select name="tipoRecurso" value={formData.tipoRecurso} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="principal">Principal</option>
                    <option value="adhesivo">Adhesivo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Resolución Impugnada</label>
                  <select name="resolucionImpugnada" value={formData.resolucionImpugnada} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="sentencia">Sentencia</option>
                    <option value="auto">Auto de sobreseimiento</option>
                    <option value="admision">Auto de admisión</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Parte Recurrente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="autoridad">Autoridad</option>
                    <option value="quejoso">Quejoso</option>
                    <option value="tercero">Tercero interesado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Forma de Notificación</label>
                  <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="personal">Personalmente</option>
                    <option value="oficio">Por oficio</option>
                    <option value="lista">Por lista</option>
                    <option value="electronica">En forma electrónica</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Notificación</label>
                  <input type="date" name="fechaNotificacion" value={formData.fechaNotificacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Presentación</label>
                  <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Forma de Presentación</label>
                  <select name="formaPresentacion" value={formData.formaPresentacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="escrito">Por escrito</option>
                    <option value="correo">Por correo</option>
                    <option value="momento">Al momento de ser notificado</option>
                    <option value="electronica">En forma electrónica</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" disabled={calculando} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {calculando ? 'Calculando...' : 'Calcular Plazo'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Días Inhábiles Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Agregar día inhábil</label>
                  <div className="flex gap-2">
                    <input type="date" value={nuevoDiaInhabil} onChange={(e) => setNuevoDiaInhabil(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                    <button type="button" onClick={agregarDiaInhabil} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">
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
                          <span>{fechaATexto(dia)}</span>
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
        </div>
        
        {resultado && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${resultado.esOportuno ? 'bg-green-100 border border-green-500' : 'bg-red-100 border border-red-500'}`}>
              <p className="text-lg font-semibold">
                El recurso se presentó de forma: {' '}
                <span className={resultado.esOportuno ? 'text-green-700' : 'text-red-700'}>
                  {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                </span>
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Detalles del Cómputo:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Plazo legal:</strong> {resultado.plazo} días</p>
                <p><strong>Fundamento:</strong> {resultado.fundamento}</p>
                <p><strong>Fecha de notificación:</strong> {resultado.fechaNotificacionTexto}</p>
                <p><strong>Surte efectos:</strong> {resultado.fechaSurteEfectosTexto}</p>
                <p><strong>Período del cómputo:</strong> Del {resultado.fechaInicioTexto} al {resultado.fechaFinTexto}</p>
                <p><strong>Fecha de presentación:</strong> {resultado.fechaPresentacionTexto}</p>
                <p><strong>Días inhábiles excluidos:</strong> {resultado.diasInhabiles}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Texto para Resolución:</h3>
              <div className="text-sm font-['Arial'] leading-relaxed whitespace-pre-wrap">
                {generarTexto()}
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Copiar Texto
              </button>
              <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Nuevo Cálculo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
=======
'use client'

import { useState } from 'react'
import Link from 'next/link'

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

// Función para formato numérico de fecha (día y año numéricos, mes en letra)
function fechaFormato(fecha: string): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const fechaObj = new Date(fecha + 'T12:00:00');
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = fechaObj.getMonth();
  const año = fechaObj.getFullYear();
  
  return `${dia} de ${meses[mes]} de ${año}`;
}

// Datos de días inhábiles
const diasInhabilesData = [
  { dia: 'sábados y domingos', fundamento: 'artículo 19 de la Ley de Amparo', tipo: 'finDeSemana' },
  { dia: '1 de enero', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '01-01' },
  { dia: '5 de febrero', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '02-05' },
  { dia: '21 de marzo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '03-21' },
  { dia: '1 de mayo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '05-01' },
  { dia: '5 de mayo', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '05-05' },
  { dia: '14 de septiembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '09-14' },
  { dia: '16 de septiembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '09-16' },
  { dia: '12 de octubre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '10-12' },
  { dia: '20 de noviembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '11-20' },
  { dia: '25 de diciembre', fundamento: 'artículo 19 de la Ley de Amparo', fecha: '12-25' },
  { dia: 'primer lunes de febrero', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: 'tercer lunes de marzo', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: 'tercer lunes de noviembre', fundamento: 'artículo 74 de la Ley Federal del Trabajo', tipo: 'movil' },
  { dia: '1 de diciembre 2024', fundamento: 'artículo 74 de la Ley Federal del Trabajo', fecha: '2024-12-01' },
  { dia: '28 de marzo de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-03-28' },
  { dia: '29 de marzo de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-03-29' },
  { dia: '1 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-01' },
  { dia: '2 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-02' },
  { dia: '3 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-03' },
  { dia: '4 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-04' },
  { dia: '5 de abril de 2024', fundamento: 'Circular CCNO/7/2024', fecha: '2024-04-05' }
];

// Función para calcular días móviles
function calcularDiasMoviles(año: number) {
  const dias = [];
  
  const feb = new Date(año, 1, 1);
  while (feb.getDay() !== 1) feb.setDate(feb.getDate() + 1);
  dias.push({ fecha: feb.toISOString().split('T')[0], tipo: 'primer lunes de febrero' });
  
  const mar = new Date(año, 2, 1);
  while (mar.getDay() !== 1) mar.setDate(mar.getDate() + 1);
  mar.setDate(mar.getDate() + 14);
  dias.push({ fecha: mar.toISOString().split('T')[0], tipo: 'tercer lunes de marzo' });
  
  const nov = new Date(año, 10, 1);
  while (nov.getDay() !== 1) nov.setDate(nov.getDate() + 1);
  nov.setDate(nov.getDate() + 14);
  dias.push({ fecha: nov.toISOString().split('T')[0], tipo: 'tercer lunes de noviembre' });
  
  return dias;
}

// Función para verificar si es día inhábil
function esDiaInhabil(fecha: Date, diasAdicionales: string[] = []): boolean {
  if (fecha.getDay() === 0 || fecha.getDay() === 6) return true;
  
  const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const fechaStr = fecha.toISOString().split('T')[0];
  const año = fecha.getFullYear();
  
  if (diasInhabilesData.some(d => d.fecha === mesdia || d.fecha === fechaStr)) return true;
  
  const diasMoviles = calcularDiasMoviles(año);
  if (diasMoviles.some(d => d.fecha === fechaStr)) return true;
  
  return diasAdicionales.includes(fechaStr);
}

// Función para el siguiente día hábil
function siguienteDiaHabil(fecha: Date, diasAdicionales: string[] = []): Date {
  const siguiente = new Date(fecha);
  siguiente.setDate(siguiente.getDate() + 1);
  while (esDiaInhabil(siguiente, diasAdicionales)) {
    siguiente.setDate(siguiente.getDate() + 1);
  }
  return siguiente;
}

// FUNCIÓN CORREGIDA para calcular el plazo
function calcularPlazoReal(fechaInicio: Date, dias: number, diasAdicionales: string[] = []): Date {
  let fecha = new Date(fechaInicio);
  let diasHabiles = 1; // Empezamos en 1 porque el día de inicio cuenta
  
  // El primer día ya es el fechaInicio, entonces empezamos desde el día 2
  while (diasHabiles < dias) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha, diasAdicionales)) {
      diasHabiles++;
    }
  }
  
  return fecha;
}

// Función para obtener días inhábiles con notas al pie
function obtenerDiasInhabilesConNotas(inicio: Date, fin: Date, diasAdicionales: string[] = [], fundamentoAdicional: string = '') {
  const diasPorFundamento: {[key: string]: string[]} = {};
  const diasYaIncluidos = new Set<string>();
  let hayFinDeSemana = false;
  
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
      const diaFijo = diasInhabilesData.find(d => d.fecha === mesdia || d.fecha === fechaStr);
      if (diaFijo && !diasYaIncluidos.has(diaFijo.dia)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = diaFijo.fundamento.includes('Circular') ? fechaATexto(fechaStr) : diaFijo.dia;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(diaFijo.dia);
      }
      
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasInhabilesData.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (diaMovilInfo && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
          if (!diasPorFundamento[diaMovilInfo.fundamento]) {
            diasPorFundamento[diaMovilInfo.fundamento] = [];
          }
          diasPorFundamento[diaMovilInfo.fundamento].push(fechaATexto(fechaStr));
          diasYaIncluidos.add(fechaATexto(fechaStr));
        }
      }
      
      if (diasAdicionales.includes(fechaStr) && !diasYaIncluidos.has(fechaATexto(fechaStr))) {
        const fundamento = fundamentoAdicional || 'el acuerdo correspondiente';
        if (!diasPorFundamento[fundamento]) {
          diasPorFundamento[fundamento] = [];
        }
        diasPorFundamento[fundamento].push(fechaATexto(fechaStr));
        diasYaIncluidos.add(fechaATexto(fechaStr));
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  let diasTexto: string[] = [];
  let notasAlPie: string[] = [];
  let numeroNota = 1;
  const superindices = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  
  if (hayFinDeSemana) {
    diasTexto.push('sábados y domingos');
  }
  
  ordenFundamentos.forEach(fundamentoBuscado => {
    Object.keys(diasPorFundamento).forEach(fundamento => {
      if (fundamento.includes(fundamentoBuscado) || (fundamentoBuscado === 'usuario' && fundamento === fundamentoAdicional)) {
        const dias = diasPorFundamento[fundamento];
        if (dias && dias.length > 0) {
          const superindice = numeroNota <= 9 ? superindices[numeroNota - 1] : `(${numeroNota})`;
          diasTexto = diasTexto.concat(dias.map(dia => dia + superindice));
          notasAlPie.push(`${superindice} ${fundamento}`);
          numeroNota++;
        }
      }
    });
  });
  
  return {
    texto: diasTexto.join(', '),
    notas: notasAlPie
  };
}

// Componente de Calendario Visual
function CalendarioVisual({ fechaNotificacion, fechaSurte, fechaInicio, fechaFin, diasAdicionales }: any) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Obtener rango de meses a mostrar
  const fechaInicioObj = new Date(fechaInicio + 'T12:00:00');
  const fechaFinObj = new Date(fechaFin + 'T12:00:00');
  const fechaNotifObj = new Date(fechaNotificacion + 'T12:00:00');
  
  // Determinar el mes inicial (el menor entre notificación e inicio)
  const mesInicio = fechaNotifObj < fechaInicioObj ? fechaNotifObj.getMonth() : fechaInicioObj.getMonth();
  const añoInicio = fechaNotifObj < fechaInicioObj ? fechaNotifObj.getFullYear() : fechaInicioObj.getFullYear();
  const mesFin = fechaFinObj.getMonth();
  const añoFin = fechaFinObj.getFullYear();
  
  const calendarios = [];
  let mesActual = mesInicio;
  let añoActual = añoInicio;
  
  while (añoActual < añoFin || (añoActual === añoFin && mesActual <= mesFin)) {
    calendarios.push({ mes: mesActual, año: añoActual });
    mesActual++;
    if (mesActual > 11) {
      mesActual = 0;
      añoActual++;
    }
  }
  
  const renderCalendario = (mes: number, año: number) => {
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const dias = [];
    
    // Espacios vacíos antes del primer día
    for (let i = 0; i < primerDia; i++) {
      dias.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia);
      const fechaStr = fecha.toISOString().split('T')[0];
      const esInhabil = esDiaInhabil(fecha, diasAdicionales);
      
      let bgColor = '';
      let textColor = 'text-gray-700';
      let fontWeight = '';
      
      // Determinar color según el tipo de día
      if (fechaStr === fechaNotificacion) {
        bgColor = 'bg-yellow-300';
        textColor = 'text-black';
        fontWeight = 'font-bold';
      } else if (fechaStr === fechaSurte) {
        bgColor = 'bg-blue-400';
        textColor = 'text-white';
        fontWeight = 'font-bold';
      } else if (fecha >= fechaInicioObj && fecha <= fechaFinObj) {
        bgColor = 'bg-green-400';
        textColor = 'text-white';
        fontWeight = 'font-semibold';
      }
      
      if (esInhabil) {
        bgColor = bgColor || 'bg-red-100';
        textColor = 'text-red-600';
      }
      
      dias.push(
        <div
          key={dia}
          className={`h-10 border border-gray-200 flex items-center justify-center text-sm ${bgColor} ${textColor} ${fontWeight}`}
        >
          {dia}
        </div>
      );
    }
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-center mb-2">{meses[mes]} {año}</h4>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          <div className="font-semibold">Dom</div>
          <div className="font-semibold">Lun</div>
          <div className="font-semibold">Mar</div>
          <div className="font-semibold">Mié</div>
          <div className="font-semibold">Jue</div>
          <div className="font-semibold">Vie</div>
          <div className="font-semibold">Sáb</div>
          {dias}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="font-semibold mb-4">Calendario del Cómputo</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calendarios.map(({ mes, año }) => (
          <div key={`${mes}-${año}`}>
            {renderCalendario(mes, año)}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">Leyenda:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300"></div>
            <span>Notificación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400"></div>
            <span>Surte efectos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400"></div>
            <span>Días del cómputo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-600"></div>
            <span>Días inhábiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Calculadora() {
  const [tipoUsuario, setTipoUsuario] = useState<'litigante' | 'servidor' | null>(null);
  const [formData, setFormData] = useState({
    tipoRecurso: 'principal',
    resolucionImpugnada: '',
    parteRecurrente: '',
    fechaNotificacion: '',
    formaNotificacion: '',
    fechaPresentacion: '',
    formaPresentacion: ''
  });
  
  const [diasAdicionales, setDiasAdicionales] = useState<string[]>([]);
  const [nuevoDiaInhabil, setNuevoDiaInhabil] = useState('');
  const [fundamentoAdicional, setFundamentoAdicional] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [calculando, setCalculando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    
    setTimeout(() => {
      const plazo = formData.tipoRecurso === 'principal' ? 10 : 5;
      const fundamento = formData.tipoRecurso === 'principal' 
        ? 'artículo 86, fracción I, de la Ley de Amparo'
        : 'artículo 82 de la Ley de Amparo';
      
      const fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
      let fechaSurte = new Date(fechaNotif);
      let textoSurte = '';
      let fundamentoSurte = '';
      
      const esAutoridad = formData.parteRecurrente === 'autoridad' || 
                         (formData.parteRecurrente === 'tercero' && formData.formaNotificacion === 'oficio');
      
      if (esAutoridad) {
        textoSurte = 'el mismo día';
        fundamentoSurte = 'artículo 31, fracción II, de la Ley de Amparo';
      } else if (formData.formaNotificacion === 'electronica') {
        textoSurte = 'el mismo día en que se genera el acuse electrónico';
        fundamentoSurte = 'artículo 31, fracción III, de la Ley de Amparo';
      } else {
        textoSurte = 'al siguiente día hábil';
        fundamentoSurte = 'artículo 31, fracción I, de la Ley de Amparo';
        fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales);
      }
      
      const fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales);
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales);
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const esOportuno = fechaPres <= fechaFin;
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaInicio, fechaFin, diasAdicionales, fundamentoAdicional);
      
      const formasPresentacion: {[key: string]: string} = {
        'escrito': 'del sello del juzgado federal que obra en la primera página del mismo',
        'correo': 'del sobre que obra en el toca en que se actúa',
        'momento': 'de la constancia de notificación que obra en el juicio de amparo',
        'electronica': 'de la evidencia criptográfica del escrito que lo contiene'
      };
      
      const resoluciones: {[key: string]: string} = {
        'sentencia': 'la sentencia impugnada',
        'auto': 'el acuerdo impugnado',
        'admision': 'el auto de admisión del recurso principal'
      };
      
      setResultado({
        esOportuno,
        plazo,
        fundamento,
        textoSurte,
        fundamentoSurte,
        fechaNotificacion: formData.fechaNotificacion,
        fechaSurte: fechaSurte.toISOString().split('T')[0],
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        fechaPresentacion: formData.fechaPresentacion,
        fechaNotificacionTexto: fechaATexto(formData.fechaNotificacion),
        fechaSurteEfectosTexto: fechaATexto(fechaSurte.toISOString().split('T')[0]),
        fechaInicioTexto: fechaATexto(fechaInicio.toISOString().split('T')[0]),
        fechaFinTexto: fechaATexto(fechaFin.toISOString().split('T')[0]),
        fechaPresentacionTexto: fechaATexto(formData.fechaPresentacion),
        diasInhabiles: diasInhabilesInfo.texto,
        notasAlPie: diasInhabilesInfo.notas,
        formaPresentacion: formasPresentacion[formData.formaPresentacion] || formData.formaPresentacion,
        resolucionImpugnada: resoluciones[formData.resolucionImpugnada] || formData.resolucionImpugnada
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
  
  const agregarDiaInhabil = () => {
    if (nuevoDiaInhabil && !diasAdicionales.includes(nuevoDiaInhabil)) {
      setDiasAdicionales([...diasAdicionales, nuevoDiaInhabil]);
      setNuevoDiaInhabil('');
    }
  };

  const generarTexto = () => {
    if (!resultado) return '';
    
    let texto = `El recurso de revisión ${formData.tipoRecurso} se interpuso de forma ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, conforme a lo previsto en el ${resultado.fundamento}, dado que ${resultado.resolucionImpugnada}, se notificó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, quien tiene el carácter de ${formData.parteRecurrente} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, por lo que la referida notificación surtió efectos ${resultado.textoSurte}, ${resultado.fechaSurteEfectosTexto}, de conformidad con lo dispuesto por el ${resultado.fundamentoSurte}, computándose el referido plazo del ${resultado.fechaInicioTexto} al ${resultado.fechaFinTexto}, sin contar los días ${resultado.diasInhabiles}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    
    if (resultado.notasAlPie && resultado.notasAlPie.length > 0) {
      texto += '\n\n_________________\n';
      texto += resultado.notasAlPie.join('\n');
    }
    
    return texto;
  };

  // Si no ha seleccionado tipo de usuario, mostrar pantalla de selección
  if (!tipoUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
            LegalCompute Pro
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Selecciona tu perfil para continuar
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Opción Litigante */}
            <button
              onClick={() => setTipoUsuario('litigante')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400"
            >
              <div className="text-blue-600 text-5xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold mb-2">Soy Litigante</h2>
              <p className="text-gray-600">
                Cálculo rápido de plazos con fechas en formato numérico
              </p>
            </button>
            
            {/* Opción Servidor Público */}
            <button
              onClick={() => setTipoUsuario('servidor')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-400"
            >
              <div className="text-green-600 text-5xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold mb-2">Soy Servidor Público</h2>
              <p className="text-gray-600">
                Texto completo para resoluciones con calendario visual
              </p>
            </button>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pricing" className="text-blue-600 hover:underline">
              Ver planes de suscripción →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                setTipoUsuario(null);
                setResultado(null);
              }}
              className="text-2xl font-bold text-blue-900 hover:text-blue-700"
            >
              ← LegalCompute Pro
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
              </span>
              <Link href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                Ver Planes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Calculadora de Plazos - Recursos de Revisión</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Tipo de Recurso</label>
                  <select name="tipoRecurso" value={formData.tipoRecurso} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required>
                    <option value="principal">Principal</option>
                    <option value="adhesivo">Adhesivo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Resolución Impugnada</label>
                  <select name="resolucionImpugnada" value={formData.resolucionImpugnada} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required>
                    <option value="">Seleccione...</option>
                    <option value="sentencia">Sentencia</option>
                    <option value="auto">Auto de sobreseimiento</option>
                    <option value="admision">Auto de admisión</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Parte Recurrente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required>
                    <option value="">Seleccione...</option>
                    <option value="autoridad">Autoridad</option>
                    <option value="quejoso">Quejoso</option>
                    <option value="tercero">Tercero interesado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Forma de Notificación</label>
                  <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required>
                    <option value="">Seleccione...</option>
                    <option value="personal">Personalmente</option>
                    <option value="oficio">Por oficio</option>
                    <option value="lista">Por lista</option>
                    <option value="electronica">En forma electrónica</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Fecha de Notificación</label>
                  <input type="date" name="fechaNotificacion" value={formData.fechaNotificacion} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required />
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Fecha de Presentación</label>
                  <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-base md:text-sm font-medium mb-2">Forma de Presentación</label>
                  <select name="formaPresentacion" value={formData.formaPresentacion} onChange={handleChange} className="w-full p-3 md:p-2 border rounded-lg text-base md:text-sm" required>
                    <option value="">Seleccione...</option>
                    <option value="escrito">Por escrito</option>
                    <option value="correo">Por correo</option>
                    <option value="momento">Al momento de ser notificado</option>
                    <option value="electronica">En forma electrónica</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" disabled={calculando} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-base md:text-sm">
                {calculando ? 'Calculando...' : 'Calcular Plazo'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 text-base md:text-sm">Días Inhábiles Adicionales</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Agregar día inhábil</label>
                  <div className="flex gap-2">
                    <input type="date" value={nuevoDiaInhabil} onChange={(e) => setNuevoDiaInhabil(e.target.value)} className="flex-1 p-2 border rounded-lg text-base md:text-sm" />
                    <button type="button" onClick={agregarDiaInhabil} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-base md:text-sm">
                      Agregar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-base md:text-sm font-medium mb-2">Fundamento legal</label>
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Circular CCNO/1/2024" className="w-full p-2 border rounded-lg text-base md:text-sm" />
                </div>
                
                {diasAdicionales.length > 0 && (
                  <div className="mt-4">
                    <p className="text-base md:text-sm font-medium mb-2">Días agregados:</p>
                    <div className="space-y-1">
                      {diasAdicionales.map((dia) => (
                        <div key={dia} className="flex justify-between items-center bg-gray-50 p-2 rounded text-base md:text-sm">
                          <span>{fechaATexto(dia)}</span>
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
        </div>
        
        {/* Resultado para LITIGANTES */}
        {resultado && tipoUsuario === 'litigante' && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${resultado.esOportuno ? 'bg-green-100 border border-green-500' : 'bg-red-100 border border-red-500'}`}>
              <p className="text-lg font-semibold">
                El recurso se presentó de forma: {' '}
                <span className={resultado.esOportuno ? 'text-green-700' : 'text-red-700'}>
                  {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                </span>
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Fechas del Cómputo:</h3>
              <div className="space-y-2 text-base">
                <p><strong>Notificación:</strong> {fechaFormato(resultado.fechaNotificacion)}</p>
                <p><strong>Surte efectos:</strong> {fechaFormato(resultado.fechaSurte)}</p>
                <p><strong>Inicio del plazo:</strong> {fechaFormato(resultado.fechaInicio)}</p>
                <p><strong>Vencimiento del plazo:</strong> {fechaFormato(resultado.fechaFin)}</p>
                <p><strong>Fecha de presentación:</strong> {fechaFormato(resultado.fechaPresentacion)}</p>
                <p><strong>Plazo:</strong> {resultado.plazo} días</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setResultado(null);
                setFormData({
                  tipoRecurso: 'principal',
                  resolucionImpugnada: '',
                  parteRecurrente: '',
                  fechaNotificacion: '',
                  formaNotificacion: '',
                  fechaPresentacion: '',
                  formaPresentacion: ''
                });
              }}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Nuevo Cálculo
            </button>
          </div>
        )}
        
        {/* Resultado para SERVIDORES PÚBLICOS */}
        {resultado && tipoUsuario === 'servidor' && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
              
              <div className={`p-4 rounded-lg mb-4 ${resultado.esOportuno ? 'bg-green-100 border border-green-500' : 'bg-red-100 border border-red-500'}`}>
                <p className="text-lg font-semibold">
                  El recurso se presentó de forma: {' '}
                  <span className={resultado.esOportuno ? 'text-green-700' : 'text-red-700'}>
                    {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                  </span>
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Texto para Resolución:</h3>
                <div className="text-sm font-['Arial'] leading-relaxed whitespace-pre-wrap">
                  {generarTexto()}
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Copiar Texto
                </button>
                <button 
                  onClick={() => {
                    setResultado(null);
                    setFormData({
                      tipoRecurso: 'principal',
                      resolucionImpugnada: '',
                      parteRecurrente: '',
                      fechaNotificacion: '',
                      formaNotificacion: '',
                      fechaPresentacion: '',
                      formaPresentacion: ''
                    });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nuevo Cálculo
                </button>
              </div>
            </div>
            
            {/* Calendario Visual */}
            <CalendarioVisual
              fechaNotificacion={resultado.fechaNotificacion}
              fechaSurte={resultado.fechaSurte}
              fechaInicio={resultado.fechaInicio}
              fechaFin={resultado.fechaFin}
              diasAdicionales={diasAdicionales}
            />
          </div>
        )}
      </div>
    </div>
  );
>>>>>>> 0283ad6bcae620c9560b4d33cff9103f20122a5a
}