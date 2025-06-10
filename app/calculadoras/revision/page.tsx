'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { diasInhabilesData } from '../../diasInhabiles.js'

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
      if (diaFijo && !diasYaIncluidos.has(diaFijo.dia)) {
        if (!diasPorFundamento[diaFijo.fundamento]) {
          diasPorFundamento[diaFijo.fundamento] = [];
        }
        const diaTexto = diaFijo.fundamento.includes('Circular') ? fechaATexto(fechaStr) : diaFijo.dia;
        diasPorFundamento[diaFijo.fundamento].push(diaTexto);
        diasYaIncluidos.add(diaFijo.dia);
      }
      
      // Verificar días móviles
      const diasMoviles = calcularDiasMoviles(año);
      const diaMovil = diasMoviles.find(d => d.fecha === fechaStr);
      if (diaMovil) {
        const diaMovilInfo = diasAplicables.find(d => d.tipo === 'movil' && d.dia === diaMovil.tipo);
        if (!diasYaIncluidos.has(fechaATexto(fechaStr))) {
          let fundamentoMovil = 'artículo 74 de la Ley Federal del Trabajo';
          if (diaMovilInfo && diaMovilInfo.fundamento) {
            fundamentoMovil = diaMovilInfo.fundamento;
          }
          if (!diasPorFundamento[fundamentoMovil]) {
            diasPorFundamento[fundamentoMovil] = [];
          }
          diasPorFundamento[fundamentoMovil].push(fechaATexto(fechaStr));
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
  return 'bg-red-500 text-white font-bold';
}; 
 
  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Calendario del Cómputo</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400"></div>
            <span>Notificación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>Surte efectos</span>
          </div>
          <div className="flex items-center gap-2">
  <div className="w-4 h-4 bg-blue-400"></div>
  <span>Días hábiles del cómputo</span>
</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Días inhábiles del cómputo</span>
          </div>
        </div>
      </div>
      
     <div className="grid grid-cols-3 gap-1 text-xs" style={{maxWidth: '350px', transform: 'scale(0.5)', transformOrigin: 'top center'}}>
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
            <div key={idx} className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-center mb-2">
                {meses[mes.getMonth()]} {mes.getFullYear()}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div className="font-semibold">D</div>
                <div className="font-semibold">L</div>
                <div className="font-semibold">M</div>
                <div className="font-semibold">M</div>
                <div className="font-semibold">J</div>
                <div className="font-semibold">V</div>
                <div className="font-semibold">S</div>
                {dias.map((dia, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    {dia && (
                      <div className={`w-full h-full flex items-center justify-center rounded ${
                        obtenerClaseDia(new Date(mes.getFullYear(), mes.getMonth(), dia))
                      }`}>
                        {dia}
                      </div>
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
        fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
      }
      
      // El plazo inicia al día siguiente del que surte efectos
      const fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales, tipoUsuario);
      const fechaPres = tipoUsuario === 'servidor' ? new Date(formData.fechaPresentacion + 'T12:00:00') : null;
      const esOportuno = tipoUsuario === 'servidor' ? (fechaPres && fechaPres <= fechaFin) : null;
      
      const diasInhabilesInfo = obtenerDiasInhabilesConNotas(fechaInicio, fechaFin, diasAdicionales, fundamentoAdicional, tipoUsuario);
      
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
      
      // Calcular días restantes del plazo
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      let diasRestantes = 0;
      const fechaTemp = new Date(hoy);
      
      while (fechaTemp <= fechaFin) {
        if (!esDiaInhabil(fechaTemp, diasAdicionales, tipoUsuario)) {
          diasRestantes++;
        }
        fechaTemp.setDate(fechaTemp.getDate() + 1);
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
        fechaPresentacionTexto: fechaATexto(formData.fechaPresentacion),
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

  const generarTexto = () => {
    if (!resultado) return '';
    
    let texto = `El recurso de revisión ${formData.tipoRecurso} se interpuso de forma ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, conforme a lo previsto en el ${resultado.fundamento}, dado que ${resultado.resolucionImpugnada}, se notificó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, quien tiene el carácter de ${formData.parteRecurrente} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, por lo que la referida notificación surtió efectos ${resultado.textoSurte}, ${resultado.fechaSurteEfectosTexto}, de conformidad con lo dispuesto por el ${resultado.fundamentoSurte}, computándose el referido plazo del ${resultado.fechaInicioTexto} al ${resultado.fechaFinTexto}, sin contar los días ${resultado.diasInhabiles}.

Por ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    
    // Para servidores públicos, agregar formato con número de días
    if (tipoUsuario === 'servidor') {
      texto = `De conformidad con el ${resultado.fundamento}, el plazo de ${resultado.plazoTexto} días para interponer el recurso de revisión ${formData.tipoRecurso} inicia al día siguiente al en que surte efectos la notificación de ${resultado.resolucionImpugnada}.

` + texto;
    }
    
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
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-900">
                LegalCompute Pro
              </Link>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Modo: {tipoUsuario === 'litigante' ? 'Litigante' : 'Servidor Público'}
              </span>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Cambiar modo
            </Link>
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
                
                {tipoUsuario === 'servidor' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Presentación</label>
                    <input type="date" name="fechaPresentacion" value={formData.fechaPresentacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required={tipoUsuario === 'servidor'} />
                  </div>
                )}
                
                {tipoUsuario === 'servidor' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Forma de Presentación</label>
                    <select name="formaPresentacion" value={formData.formaPresentacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required={tipoUsuario === 'servidor'}>
                      <option value="">Seleccione...</option>
                      <option value="escrito">Por escrito</option>
                      <option value="correo">Por correo</option>
                      <option value="momento">Al momento de ser notificado</option>
                      <option value="electronica">En forma electrónica</option>
                    </select>
                  </div>
                )}
              </div>
              
              <button type="submit" disabled={calculando} className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
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
          <>
            {tipoUsuario === 'litigante' ? (
              // Vista simplificada para litigantes
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
                
                <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50">
                  <p className="text-lg mb-2">
                    <strong>Plazo legal:</strong> {resultado.plazo} días
                  </p>
                  <p className="text-lg mb-2">
                    <strong>Fundamento:</strong> {resultado.fundamento}
                  </p>
                  <p className="text-lg mb-2">
                    <strong>Fecha de notificación:</strong> {new Date(formData.fechaNotificacion + 'T12:00:00').getDate()} de {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][new Date(formData.fechaNotificacion + 'T12:00:00').getMonth()]} de {new Date(formData.fechaNotificacion + 'T12:00:00').getFullYear()}
                  </p>
                  <p className="text-lg mb-2">
                    <strong>Surte efectos:</strong> {resultado.fechaSurte.getDate()} de {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][resultado.fechaSurte.getMonth()]} de {resultado.fechaSurte.getFullYear()}
                  </p>
                  <p className="text-lg mb-2">
                    <strong>Período del cómputo:</strong> Del {resultado.fechaInicio.getDate()} de {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][resultado.fechaInicio.getMonth()]} de {resultado.fechaInicio.getFullYear()} al {resultado.fechaFin.getDate()} de {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][resultado.fechaFin.getMonth()]} de {resultado.fechaFin.getFullYear()}
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    Quedan {resultado.diasRestantes} días hábiles para el vencimiento
                  </p>
                  <p className="text-lg mt-3">
                    <strong>Días inhábiles excluidos:</strong> {resultado.diasInhabiles}
                  </p>
                </div>
                
                {resultado.notasAlPie && resultado.notasAlPie.length > 0 && (
                  <div className="mt-4 pt-4 border-t text-sm">
                    {resultado.notasAlPie.map((nota: string, idx: number) => (
                      <p key={idx} className="text-gray-600">{nota}</p>
                    ))}
                  </div>
                )}
                
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
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nuevo Cálculo
                </button>
              </div>
            ) : (
              // Vista completa para servidores públicos
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Resultado del Cálculo</h2>
                
                <div className={`p-4 rounded-lg mb-4 ${resultado.esOportuno ? 'bg-green-100 border border-green-500' : 'bg-red-100 border border-red-500'}`}>
                  <p className="text-lg font-semibold">
                    El recurso se presentó de forma: {' '}
                    <span className={resultado.esOportuno ? 'text-green-700' : 'text-red-700'}>
                      {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                    </span>
                  </p>
                  {resultado.esOportuno && resultado.diasRestantes > 0 && (
                    <p className="mt-2 text-sm">
                      Quedan <strong>{resultado.diasRestantes}</strong> días hábiles para el vencimiento
                    </p>
                  )}
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
                
                <Calendario 
                  fechaNotificacion={resultado.fechaNotificacion}
                  fechaSurte={resultado.fechaSurte}
                  fechaInicio={resultado.fechaInicio}
                  fechaFin={resultado.fechaFin}
                  diasAdicionales={diasAdicionales}
                  tipoUsuario={tipoUsuario}
                />
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h3 className="font-semibold mb-2">Texto para Resolución:</h3>
                  <div className="text-sm font-['Arial'] leading-relaxed whitespace-pre-wrap">
                    {generarTexto()}
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado al portapapeles'); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Copiar Texto
                  </button>
                  <button onClick={() => { setResultado(null); setFormData({ tipoRecurso: 'principal', resolucionImpugnada: '', parteRecurrente: '', fechaNotificacion: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); }} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Nuevo Cálculo
                  </button>
                </div>
              </div>
            )}
            
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
      </div>
    </div>
  );
}