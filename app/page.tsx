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
    if (año === 2024) return 'dos mil veinticuatro';
    if (año === 2025) return 'dos mil veinticinco';
    if (año === 2023) return 'dos mil veintitrés';
    return año.toString();
  };
  
  return `${dias[dia]} de ${meses[mes]} de ${añoEnTexto(año)}`;
}

// Todos los días inhábiles
const todosLosDiasInhabiles = {
  // Ley de Amparo
  leyAmparo: [
    { fecha: '01-01', descripcion: 'uno de enero' },
    { fecha: '02-05', descripcion: 'cinco de febrero' },
    { fecha: '03-21', descripcion: 'veintiuno de marzo' },
    { fecha: '05-01', descripcion: 'uno de mayo' },
    { fecha: '05-05', descripcion: 'cinco de mayo' },
    { fecha: '09-16', descripcion: 'dieciséis de septiembre' },
    { fecha: '10-12', descripcion: 'doce de octubre' },
    { fecha: '11-20', descripcion: 'veinte de noviembre' },
    { fecha: '12-25', descripcion: 'veinticinco de diciembre' }
  ],
  // Semana Santa 2024
  semanaSanta2024: [
    '2024-03-28', '2024-03-29', // Jueves y Viernes Santo
    '2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05' // Semana de Pascua
  ],
  // Paro judicial 2024
  paro2024: [
    '2024-10-21', '2024-10-22', '2024-10-23'
  ]
};

// Función para calcular días móviles LFT
function calcularLunesLFT(año: number) {
  const lunes = [];
  
  // Primer lunes de febrero
  const feb = new Date(año, 1, 1);
  while (feb.getDay() !== 1) feb.setDate(feb.getDate() + 1);
  lunes.push(feb.toISOString().split('T')[0]);
  
  // Tercer lunes de marzo
  const mar = new Date(año, 2, 1);
  while (mar.getDay() !== 1) mar.setDate(mar.getDate() + 1);
  mar.setDate(mar.getDate() + 14);
  lunes.push(mar.toISOString().split('T')[0]);
  
  // Tercer lunes de noviembre
  const nov = new Date(año, 10, 1);
  while (nov.getDay() !== 1) nov.setDate(nov.getDate() + 1);
  nov.setDate(nov.getDate() + 14);
  lunes.push(nov.toISOString().split('T')[0]);
  
  // 1 de diciembre cada 6 años
  if ([2024, 2030, 2036, 2042, 2048].includes(año)) {
    lunes.push(`${año}-12-01`);
  }
  
  return lunes;
}

// Función para verificar si es día inhábil
function esDiaInhabil(fecha: Date, diasAdicionales: string[] = []): boolean {
  // Sábados y domingos
  if (fecha.getDay() === 0 || fecha.getDay() === 6) return true;
  
  const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const fechaStr = fecha.toISOString().split('T')[0];
  
  // Días de Ley de Amparo
  if (todosLosDiasInhabiles.leyAmparo.some(d => d.fecha === mesdia)) return true;
  
  // Semana Santa 2024
  if (todosLosDiasInhabiles.semanaSanta2024.includes(fechaStr)) return true;
  
  // Paro 2024
  if (todosLosDiasInhabiles.paro2024.includes(fechaStr)) return true;
  
  // Días móviles LFT
  const lunesLFT = calcularLunesLFT(fecha.getFullYear());
  if (lunesLFT.includes(fechaStr)) return true;
  
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

// Función para calcular el plazo
function calcularPlazoReal(fechaInicio: Date, dias: number, diasAdicionales: string[] = []): Date {
  let fecha = new Date(fechaInicio);
  let diasHabiles = 0;
  
  while (diasHabiles < dias) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha, diasAdicionales)) {
      diasHabiles++;
    }
  }
  
  return fecha;
}

// Función para obtener días inhábiles en texto
function obtenerDiasInhabilesTexto(inicio: Date, fin: Date, diasAdicionales: string[] = []) {
  const diasPorFundamento: {[key: string]: string[]} = {
    'artículo 19 de la Ley de Amparo': [],
    'artículo 74 de la Ley Federal del Trabajo': [],
    'Acuerdo del Pleno del CJF': [],
    'usuario': []
  };
  
  let hayFinDeSemana = false;
  const fecha = new Date(inicio);
  
  while (fecha <= fin) {
    const mesdia = `${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const fechaStr = fecha.toISOString().split('T')[0];
    
    if (fecha.getDay() === 0 || fecha.getDay() === 6) {
      hayFinDeSemana = true;
    } else {
      // Ley de Amparo
      const diaAmparo = todosLosDiasInhabiles.leyAmparo.find(d => d.fecha === mesdia);
      if (diaAmparo) {
        diasPorFundamento['artículo 19 de la Ley de Amparo'].push(diaAmparo.descripcion);
      }
      
      // LFT
      const lunesLFT = calcularLunesLFT(fecha.getFullYear());
      if (lunesLFT.includes(fechaStr)) {
        diasPorFundamento['artículo 74 de la Ley Federal del Trabajo'].push(fechaATexto(fechaStr));
      }
      
      // Semana Santa
      if (todosLosDiasInhabiles.semanaSanta2024.includes(fechaStr)) {
        diasPorFundamento['Acuerdo del Pleno del CJF'].push(fechaATexto(fechaStr) + ' (Semana Santa)');
      }
      
      // Paro
      if (todosLosDiasInhabiles.paro2024.includes(fechaStr)) {
        diasPorFundamento['Acuerdo del Pleno del CJF'].push(fechaATexto(fechaStr) + ' (paro judicial)');
      }
      
      // Adicionales
      if (diasAdicionales.includes(fechaStr)) {
        diasPorFundamento['usuario'].push(fechaATexto(fechaStr));
      }
    }
    
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Construir texto
  let diasTexto = [];
  if (hayFinDeSemana) diasTexto.push('sábados y domingos');
  diasTexto = diasTexto.concat(diasPorFundamento['artículo 19 de la Ley de Amparo']);
  
  return {
    principal: diasTexto.join(', '),
    porFundamento: diasPorFundamento
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
      
      const fechaInicio = siguienteDiaHabil(fechaSurte, diasAdicionales);
      const fechaFin = calcularPlazoReal(fechaInicio, plazo, diasAdicionales);
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      const esOportuno = fechaPres <= fechaFin;
      
      const diasInhabiles = obtenerDiasInhabilesTexto(fechaInicio, fechaFin, diasAdicionales);
      
      const formasPresentacion: {[key: string]: string} = {
        'sello': 'del sello del juzgado federal que obra en la primera página del mismo',
        'sobre': 'del sobre que obra en el toca en que se actúa',
        'constancia': 'de la constancia de notificación que obra en el juicio de amparo',
        'evidencia': 'de la evidencia criptográfica del escrito que lo contiene'
      };
      
      const resoluciones: {[key: string]: string} = {
        'sentencia': 'la sentencia impugnada',
        'acuerdo': 'el acuerdo impugnado',
        'auto': 'el auto de admisión del recurso principal'
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
        diasInhabiles: diasInhabiles.principal,
        diasPorFundamento: diasInhabiles.porFundamento,
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
    
    let texto = `El recurso de revisión ${formData.tipoRecurso} se interpuso de forma ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}, conforme a lo previsto en el ${resultado.fundamento}, dado que ${resultado.resolucionImpugnada}, se notificó ${formData.formaNotificacion === 'personal' ? 'personalmente' : formData.formaNotificacion === 'oficio' ? 'por oficio' : formData.formaNotificacion === 'lista' ? 'por lista' : 'en forma electrónica'} a la parte recurrente, quien tiene el carácter de ${formData.parteRecurrente} en el juicio de amparo, el ${resultado.fechaNotificacionTexto}, por lo que la referida notificación surtió efectos ${resultado.textoSurte}, ${resultado.fechaSurteEfectosTexto}, de conformidad con lo dispuesto por el ${resultado.fundamentoSurte}, computándose el referido plazo del ${resultado.fechaInicioTexto} al ${resultado.fechaFinTexto}, sin contar los días ${resultado.diasInhabiles}, de conformidad con el artículo 19 de la Ley de Amparo`;
    
    // Agregar otros fundamentos
    const fundamentos = resultado.diasPorFundamento;
    
    if (fundamentos['artículo 74 de la Ley Federal del Trabajo'].length > 0) {
      texto += `; y ${fundamentos['artículo 74 de la Ley Federal del Trabajo'].join(', ')}, con fundamento en el artículo 74 de la Ley Federal del Trabajo`;
    }
    
    if (fundamentos['Acuerdo del Pleno del CJF'].length > 0) {
      texto += `; y ${fundamentos['Acuerdo del Pleno del CJF'].join(', ')}, con fundamento en el Acuerdo del Pleno del CJF`;
    }
    
    if (fundamentos['usuario'].length > 0) {
      texto += `; y ${fundamentos['usuario'].join(', ')}, con fundamento en ${fundamentoAdicional || 'el acuerdo correspondiente'}`;
    }
    
    texto += `.\n\nPor ende, si el referido medio de impugnación se interpuso el ${resultado.fechaPresentacionTexto}, como se aprecia ${resultado.formaPresentacion}, es inconcuso que su presentación es ${resultado.esOportuno ? 'oportuna' : 'extemporánea'}.`;
    
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
                    <option value="sentencia">la sentencia impugnada</option>
                    <option value="acuerdo">el acuerdo impugnado</option>
                    <option value="auto">el auto de admisión del recurso principal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Parte Recurrente</label>
                  <select name="parteRecurrente" value={formData.parteRecurrente} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="autoridad">autoridad</option>
                    <option value="quejoso">quejoso</option>
                    <option value="tercero">tercero interesado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Forma de Notificación</label>
                  <select name="formaNotificacion" value={formData.formaNotificacion} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                    <option value="">Seleccione...</option>
                    <option value="personal">personalmente</option>
                    <option value="oficio">por oficio</option>
                    <option value="lista">por lista</option>
                    <option value="electronica">en forma electrónica</option>
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
                    <option value="sello">del sello del juzgado federal</option>
                    <option value="sobre">del sobre que obra en el toca</option>
                    <option value="constancia">de la constancia de notificación</option>
                    <option value="evidencia">de la evidencia criptográfica</option>
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
                  <input type="text" value={fundamentoAdicional} onChange={(e) => setFundamentoAdicional(e.target.value)} placeholder="Ej: Acuerdo General 1/2024" className="w-full p-2 border rounded-lg text-sm" />
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
                <p><strong>Días inhábiles (Ley de Amparo):</strong> {resultado.diasInhabiles}</p>
                {resultado.diasPorFundamento['artículo 74 de la Ley Federal del Trabajo'].length > 0 && (
                  <p><strong>Días inhábiles (LFT):</strong> {resultado.diasPorFundamento['artículo 74 de la Ley Federal del Trabajo'].join(', ')}</p>
                )}
                {resultado.diasPorFundamento['Acuerdo del Pleno del CJF'].length > 0 && (
                  <p><strong>Días inhábiles (CJF):</strong> {resultado.diasPorFundamento['Acuerdo del Pleno del CJF'].join(', ')}</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Texto para Resolución:</h3>
              <div className="text-sm font-['Arial'] leading-relaxed whitespace-pre-wrap">
                {generarTexto()}
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(generarTexto()); alert('Texto copiado'); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
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
}