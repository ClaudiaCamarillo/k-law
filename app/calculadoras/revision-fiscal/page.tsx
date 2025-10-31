'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { diasInhabilesTFJA } from './diasInhabiles/index.js';
import { computosStorage } from '@/lib/computosStorage';

// Función para calcular días móviles
function calcularDiasMoviles(año) {
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
function esDiaInhabil(fecha, diasAdicionales = [], tipoUsuario = 'litigante') {
  if (!fecha || isNaN(fecha.getTime())) return false;
  
  // Sábados y domingos siempre son inhábiles
  if (fecha.getDay() === 0 || fecha.getDay() === 6) return true;
  
  const fechaStr = fecha.toISOString().split('T')[0];
  const año = fecha.getFullYear();
  
  // Verificar días fijos
  const diaFijo = diasInhabilesTFJA.find(d => {
    if (d.año === 'todos') {
      return d.fecha === fechaStr || (d.mes === fecha.getMonth() + 1 && d.dia === fecha.getDate());
    } else if (d.año === año) {
      return d.fecha === fechaStr || (d.mes === fecha.getMonth() + 1 && d.dia === fecha.getDate());
    }
    return false;
  });
  
  if (diaFijo) return true;
  
  // Verificar días móviles
  const diasMoviles = calcularDiasMoviles(año);
  if (diasMoviles.some(d => d.fecha === fechaStr)) return true;
  
  return diasAdicionales.includes(fechaStr);
}

// Componente de Calendario (exacto de inconformidad)
function Calendario({ 
  fechaNotificacion, 
  fechaSurte, 
  fechaInicio, 
  fechaFin, 
  diasAdicionales,
  tipoUsuario 
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
  
  const obtenerClaseDia = (fecha) => {
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
                          fechaDiaObj.setHours(12, 0, 0, 0);
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
                          
                          // Otros días del cómputo o inhábiles
                          const esDiaDelComputo = fechaDiaObj >= fechaInicio && fechaDiaObj <= fechaFin;
                          const esDiaInhabilDelComputo = esDiaDelComputo && esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
                          const esDiaHabilDelComputo = esDiaDelComputo && !esDiaInhabil(fechaDiaObj, diasAdicionales, tipoUsuario);
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
                            <div style={{fontSize: '8px'}}>
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

export default function CalculadoraRevisionFiscal() {
  const [tipoUsuario, setTipoUsuario] = useState('litigante');
  const [formData, setFormData] = useState({
    fechaNotificacion: '',
    formaNotificacion: '',
    fechaPresentacion: '',
    formaPresentacion: ''
  });
  
  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [diasAdicionales, setDiasAdicionales] = useState([]);
  const [mostrarGuardar, setMostrarGuardar] = useState(false);
  const [nombreCalculo, setNombreCalculo] = useState('');
  const [descripcionCalculo, setDescripcionCalculo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [limiteCalculos, setLimiteCalculos] = useState(5);
  const [calculosGuardados, setCalculosGuardados] = useState(0);
  // const [calculos, setCalculos] = useState([]); // Comentado según solicitud

  useEffect(() => {
    const tipo = localStorage.getItem('tipoUsuario') || 'litigante';
    setTipoUsuario(tipo);
    
    // Obtener información de cómputos guardados
    const computos = computosStorage.obtenerTodos();
    const computosRevision = computos.filter(c => c.tipo === 'revision-fiscal');
    setCalculosGuardados(computosRevision.length);
    setLimiteCalculos(computosStorage.obtenerLimite());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCalculando(true);
    
    setTimeout(() => {
      try {
        let fechaNotif = new Date(formData.fechaNotificacion + 'T12:00:00');
        
        // Si la notificación fue en día inhábil, se considera hecha en el siguiente día hábil
        while (esDiaInhabil(fechaNotif, diasAdicionales, tipoUsuario)) {
          fechaNotif.setDate(fechaNotif.getDate() + 1);
        }
        
        // Calcular cuando surte efectos (3 días hábiles después)
        const fechaSurte = new Date(fechaNotif);
        let diasContados = 0;
        
        while (diasContados < 3) {
          fechaSurte.setDate(fechaSurte.getDate() + 1);
          if (!esDiaInhabil(fechaSurte, diasAdicionales, tipoUsuario)) {
            diasContados++;
          }
        }
        
        const fechaInicio = new Date(fechaSurte);
        fechaInicio.setDate(fechaInicio.getDate() + 1);
        
        // Calcular fecha fin (15 días hábiles después del inicio)
        const fechaFin = new Date(fechaInicio);
        let diasHabilesContados = 0;
        
        while (diasHabilesContados < 15) {
          if (!esDiaInhabil(fechaFin, diasAdicionales, tipoUsuario)) {
            diasHabilesContados++;
          }
          if (diasHabilesContados < 15) {
            fechaFin.setDate(fechaFin.getDate() + 1);
          }
        }
        
        let textoSurte = '';
        let fundamentoSurte = 'artículo 65 de la Ley Federal de Procedimiento Contencioso Administrativo';
        
        if (formData.formaNotificacion === 'electronica') {
          textoSurte = 'al tercer día hábil siguiente a la notificación electrónica';
          fundamentoSurte = 'artículo 65, párrafo cuarto, de la Ley Federal de Procedimiento Contencioso Administrativo';
        } else if (formData.formaNotificacion === 'boletin') {
          textoSurte = 'al tercer día hábil siguiente a la publicación en el Boletín Jurisdiccional';
        }
        
        // Calcular días inhábiles excluidos
        const diasInhabiles = [];
        const fechaTemp = new Date(fechaNotif);
        while (fechaTemp <= fechaFin) {
          if (esDiaInhabil(fechaTemp, diasAdicionales, tipoUsuario)) {
            diasInhabiles.push(fechaTemp.toISOString().split('T')[0]);
          }
          fechaTemp.setDate(fechaTemp.getDate() + 1);
        }
        
        const esOportuno = formData.fechaPresentacion ? 
          new Date(formData.fechaPresentacion) <= fechaFin : 
          new Date() <= fechaFin;
        
        setResultado({
          plazo: 15,
          fundamento: 'artículo 63 de la Ley Federal de Procedimiento Contencioso Administrativo',
          textoSurte,
          fundamentoSurte,
          fechaNotificacion: fechaNotif,
          fechaSurte: fechaSurte,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          esOportuno,
          diasInhabiles
        });
      } catch (error) {
        alert('Error en el cálculo');
      }
      setCalculando(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copiarCalendario = async () => {
    try {
      const element = document.getElementById('calendario-visual');
      if (element) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            alert('Calendario copiado como imagen');
          }
        });
      }
    } catch (error) {
      alert('Error al copiar el calendario');
    }
  };

  const generarTextoDiasInhabilesResolucion = () => {
    if (!resultado || !resultado.diasInhabiles) return '';
    
    const diasPorMes = {};
    const años = new Set();
    
    // Filtrar solo sábados y domingos
    resultado.diasInhabiles.forEach(diaISO => {
      const fecha = new Date(diaISO + 'T12:00:00');
      if (fecha.getDay() === 0 || fecha.getDay() === 6) {
        const mesAno = `${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
        años.add(fecha.getFullYear());
        if (!diasPorMes[mesAno]) {
          diasPorMes[mesAno] = [];
        }
        diasPorMes[mesAno].push(fecha.getDate());
      }
    });
    
    if (Object.keys(diasPorMes).length === 0) return '';
    
    const textosMeses = [];
    const fechaInicio = new Date(resultado.fechaInicio);
    const fechaNotificacion = new Date(resultado.fechaNotificacion);
    
    Object.keys(diasPorMes).sort().forEach(mesAno => {
      const [mes, ano] = mesAno.split('-');
      const dias = diasPorMes[mesAno].sort((a, b) => a - b);
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const nombreMes = meses[parseInt(mes) - 1];
      
      const diasTexto = dias.map(dia => numeroATexto(dia));
      const ultimoDia = diasTexto.pop();
      const textoMes = diasTexto.length > 0 ? 
        `${diasTexto.join(', ')} y ${ultimoDia}` : 
        ultimoDia;
      
      textosMeses.push(`${textoMes} de ${nombreMes}`);
    });
    
    const añoTexto = Array.from(años).map(numeroATextoAño).join(' y ');
    
    // Determinar si los días son antes o después del inicio del cómputo
    const primerDiaInhabil = new Date(resultado.diasInhabiles[0] + 'T12:00:00');
    const antesDelInicio = primerDiaInhabil < fechaInicio;
    
    let textoFinal = '';
    if (antesDelInicio) {
      textoFinal = 'debiéndose descontar, antes del inicio, ';
    } else {
      textoFinal = 'debiéndose descontar ';
    }
    
    if (textosMeses.length === 1) {
      textoFinal += `${textosMeses[0]} de ${añoTexto}`;
    } else {
      textoFinal += textosMeses.join(', ') + ` de ${añoTexto}`;
    }
    
    textoFinal += ', por corresponder a sábados y domingos.';
    
    return textoFinal;
  };

  const generarTextoResolucion = () => {
    if (!resultado) return '';
    
    const formasNotificacion = {
      'electronica': 'en forma electrónica',
      'boletin': 'mediante Boletín Jurisdiccional'
    };
    
    const formasPresentacion = {
      'escrito': { accion: 'se presentó', evidencia: 'del sello del tribunal que obra en la primera página del mismo' },
      'correo': { accion: 'se depositó en el Servicio Postal Mexicano', evidencia: 'del sello plasmado en el sobre que contenía dicho oficio' },
      'electronica': { accion: 'se envió electrónicamente', evidencia: 'de la evidencia criptográfica del escrito que lo contiene' }
    };

    const presentacionInfo = formasPresentacion[formData.formaPresentacion] || formasPresentacion['correo'];
    const estadoOportunidad = resultado.esOportuno ? 'dentro' : 'fuera';
    const conclusionOportunidad = resultado.esOportuno ? 'oportunamente' : 'extemporáneamente';

    // Obtener fechas para comparación
    const fechaNotif = new Date(resultado.fechaNotificacion?.toISOString().split('T')[0] + 'T12:00:00');
    const fechaIni = new Date(resultado.fechaInicio?.toISOString().split('T')[0] + 'T12:00:00');
    const fechaF = new Date(resultado.fechaFin?.toISOString().split('T')[0] + 'T12:00:00');
    
    const añoNotif = fechaNotif.getFullYear();
    const mesNotif = fechaNotif.getMonth();
    
    // Generar textos de fechas con simplificación
    const fechaNotifTexto = fechaATextoCompleto(resultado.fechaNotificacion?.toISOString().split('T')[0]);
    
    // Para fecha de inicio, si es del mismo mes y año que notificación, simplificar
    const fechaInicioTexto = fechaATextoCompleto(resultado.fechaInicio?.toISOString().split('T')[0], {
      omitirAño: añoNotif === fechaIni.getFullYear(),
      omitirMes: mesNotif === fechaIni.getMonth() && añoNotif === fechaIni.getFullYear()
    });
    
    // Para fecha fin, usar "del citado año" si es el mismo año
    const fechaFinTexto = fechaATextoCompleto(resultado.fechaFin?.toISOString().split('T')[0], {
      usarDelCitado: añoNotif === fechaF.getFullYear() && mesNotif !== fechaF.getMonth()
    });
    
    let fechaPresentacionTexto = '[fecha de presentación]';
    if (formData.fechaPresentacion) {
      const fechaPres = new Date(formData.fechaPresentacion + 'T12:00:00');
      fechaPresentacionTexto = fechaATextoCompleto(formData.fechaPresentacion, {
        usarDelCitado: añoNotif === fechaPres.getFullYear() && fechaPres.getMonth() !== mesNotif && fechaPres.getMonth() !== fechaF.getMonth()
      });
    }

    const textoSurte = formData.formaNotificacion === 'electronica' ? 
      'al tercer día hábil siguiente' : 
      'al tercer día hábil siguiente';
    
    const fundamentoSurte = formData.formaNotificacion === 'electronica' ? 
      'artículo 65 párrafo cuarto, de la Ley Federal de Procedimiento Contencioso Administrativo' : 
      'artículo 65 de la Ley Federal de Procedimiento Contencioso Administrativo';

    const añoReferencia = new Date(resultado.fechaNotificacion).getFullYear();
    const añoTexto = numeroATextoAño(añoReferencia);

    let texto = `\tEl recurso de revisión fiscal fue presentado ${estadoOportunidad} del plazo de quince días que establece el artículo 63 de la Ley Federal de Procedimiento Contencioso Administrativo, ya que la sentencia impugnada se notificó ${formasNotificacion[formData.formaNotificacion]} a la autoridad recurrente el ${fechaNotifTexto}, por lo que surtió sus efectos ${textoSurte}, de conformidad con el ${fundamentoSurte} por lo que el plazo comprendió del ${fechaInicioTexto} al ${fechaFinTexto}; ${generarTextoDiasInhabilesResolucion()}

\tPor tanto, si el oficio mediante el cual se interpuso el recurso de revisión fiscal ${presentacionInfo.accion} el ${fechaPresentacionTexto}, como se advierte ${presentacionInfo.evidencia}, resulta evidente que se interpuso ${conclusionOportunidad}.`;

    return texto;
  };
  
  const guardarCalculo = () => {
    if (!nombreCalculo || !resultado) return;
    
    setGuardando(true);
    
    const calculo = {
      nombre: nombreCalculo,
      descripcion: descripcionCalculo,
      fecha: new Date().toISOString(),
      tipo: 'revision-fiscal',
      datos: {
        formData,
        resultado: {
          plazo: resultado.plazo,
          fundamento: resultado.fundamento,
          textoSurte: resultado.textoSurte,
          fundamentoSurte: resultado.fundamentoSurte,
          fechaNotificacion: resultado.fechaNotificacion?.toISOString(),
          fechaSurte: resultado.fechaSurte?.toISOString(),
          fechaInicio: resultado.fechaInicio?.toISOString(),
          fechaFin: resultado.fechaFin?.toISOString(),
          esOportuno: resultado.esOportuno,
          diasInhabiles: resultado.diasInhabiles
        },
        tipoUsuario
      }
    };
    
    const guardado = computosStorage.guardar(calculo);
    
    if (guardado.exito) {
      setMensajeGuardado('Cálculo guardado exitosamente');
      setMostrarGuardar(false);
      setNombreCalculo('');
      setDescripcionCalculo('');
      
      // Actualizar contador
      const computos = computosStorage.obtenerTodos();
      const computosRevision = computos.filter(c => c.tipo === 'revision-fiscal');
      setCalculosGuardados(computosRevision.length);
      
      setTimeout(() => {
        setMensajeGuardado('');
      }, 3000);
    } else {
      setMensajeGuardado(guardado.mensaje || 'Error al guardar el cálculo');
    }
    
    setGuardando(false);
  };

  const copiarTexto = () => {
    const texto = generarTextoResolucion();
    navigator.clipboard.writeText(texto).then(() => {
      alert('Texto copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar el texto');
    });
  };

  function formatearDiasInhabilesParaDetalles(texto) {
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

  const fechaATexto = (fechaISO) => {
    const fecha = new Date(fechaISO + 'T12:00:00');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const fechaATextoCompleto = (fechaISO, opciones = {}) => {
    const fecha = new Date(fechaISO + 'T12:00:00');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dia = numeroATexto(fecha.getDate());
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    // Si debe usar "del citado año" o variaciones
    if (opciones.usarDelCitado) {
      if (opciones.omitirMes) {
        return `${dia} del citado mes y año`;
      }
      return `${dia} de ${mes} del citado año`;
    }
    
    // Si debe omitir el año
    if (opciones.omitirAño) {
      if (opciones.omitirMes) {
        return dia;
      }
      return `${dia} de ${mes}`;
    }
    
    // Texto completo normal
    const añoTexto = numeroATextoAño(año);
    return `${dia} de ${mes} de ${añoTexto}`;
  };

  const numeroATexto = (num) => {
    const numeros = {
      1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
      11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
      21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco', 26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta', 31: 'treinta y uno'
    };
    return numeros[num] || num.toString();
  };

  const numeroATextoAño = (año) => {
    const miles = Math.floor(año / 1000);
    const resto = año % 1000;
    const centenas = Math.floor(resto / 100);
    const decenas = resto % 100;
    
    let resultado = '';
    
    if (miles === 2) {
      resultado = 'dos mil';
    }
    
    if (centenas > 0) {
      const centenaTexto = {
        1: 'ciento', 2: 'doscientos', 3: 'trescientos', 4: 'cuatrocientos', 5: 'quinientos',
        6: 'seiscientos', 7: 'setecientos', 8: 'ochocientos', 9: 'novecientos'
      };
      resultado += (resultado ? ' ' : '') + centenaTexto[centenas];
    }
    
    if (decenas > 0) {
      if (decenas <= 31) {
        resultado += (resultado ? ' ' : '') + numeroATexto(decenas);
      } else {
        const decenaTexto = {
          30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa'
        };
        const dec = Math.floor(decenas / 10) * 10;
        const unidad = decenas % 10;
        resultado += (resultado ? ' ' : '') + decenaTexto[dec];
        if (unidad > 0) {
          resultado += ' y ' + numeroATexto(unidad);
        }
      }
    }
    
    return resultado;
  };

  const generarTextoDiasInhabiles = () => {
    if (!resultado || !resultado.diasInhabiles) return 'Todos los sábados y domingos comprendidos en el período del cómputo';
    
    const diasTexto = [];
    
    // Obtener fechas límite para el texto de sábados y domingos
    let fechaInicial = resultado.fechaNotificacion;
    let fechaFinal = resultado.fechaFin;
    
    // Contar sábados y domingos
    let tieneSabadosDomingos = false;
    const diasFeriados = [];
    
    resultado.diasInhabiles.forEach(diaISO => {
      const fecha = new Date(diaISO + 'T12:00:00');
      if (fecha.getDay() === 0 || fecha.getDay() === 6) {
        tieneSabadosDomingos = true;
      } else {
        // Es un día feriado
        diasFeriados.push(diaISO);
      }
    });
    
    // Si hay sábados y domingos, agregarlos como texto general
    if (tieneSabadosDomingos) {
      const fechaInicialTexto = fechaATexto(fechaInicial.toISOString().split('T')[0]);
      const fechaFinalTexto = fechaATexto(fechaFinal.toISOString().split('T')[0]);
      diasTexto.push(`Todos los sábados y domingos comprendidos entre el ${fechaInicialTexto} y el ${fechaFinalTexto}¹`);
    }
    
    // Agregar días feriados si los hay
    if (diasFeriados.length > 0) {
      const diasFeriadosTexto = diasFeriados.map(dia => {
        const fecha = new Date(dia + 'T12:00:00');
        return `${fecha.getDate()}²`;
      }).join(', ');
      
      diasTexto.push(diasFeriadosTexto);
    }
    
    return diasTexto.join(', ');
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
            Revisión Fiscal (TFJA)
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
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Resolución Impugnada</label>
                  <input 
                    type="text" 
                    value="Sentencia dictada en el procedimiento contencioso administrativo" 
                    disabled 
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#3D3D3D', backgroundColor: 'transparent', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Parte Recurrente</label>
                  <input 
                    type="text" 
                    value="Autoridad demandada (TFJA)" 
                    disabled 
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#3D3D3D', backgroundColor: 'transparent', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Notificación</label>
                  <select 
                    name="formaNotificacion" 
                    value={formData.formaNotificacion} 
                    onChange={handleChange} 
                    className="k-law-select" 
                    style={{ border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.3s ease', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', width: '100%', padding: '0.75rem' }} 
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                    required 
                  >
                    <option value="">Seleccione...</option>
                    <option value="electronica">Electrónica</option>
                    <option value="boletin">Boletín Jurisdiccional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Notificación</label>
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
                
                {tipoUsuario === 'servidor' && (
                  <>
                    <div>
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Fecha de Presentación</label>
                      <input 
                        type="date" 
                        name="fechaPresentacion" 
                        value={formData.fechaPresentacion} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} 
                        onFocus={(e) => e.target.style.borderColor = '#C5A770'} 
                        onBlur={(e) => e.target.style.borderColor = '#1C1C1C'} 
                        suppressHydrationWarning={true}
                      />
                    </div>
                    
                    <div>
                      <label className="block" style={{ color: '#1C1C1C', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>Forma de Presentación</label>
                      <select 
                        name="formaPresentacion" 
                        value={formData.formaPresentacion} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #1C1C1C', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} 
                        onFocus={(e) => e.currentTarget.style.borderColor = '#C5A770'} 
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1C1C1C'} 
                        suppressHydrationWarning={true}
                      >
                        <option value="">Seleccione...</option>
                        <option value="escrito">Por escrito</option>
                        <option value="electronica">En forma electrónica</option>
                        <option value="correo">Por correo</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              
              {/* Sección para guardar cálculo */}
              {resultado && !mostrarGuardar && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F9F7F5', border: '1.5px solid #C5A770' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm" style={{ color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>
                        <strong>{calculosGuardados}</strong> de <strong>{limiteCalculos}</strong> cómputos guardados
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
                        Puedes ver todos tus cálculos en{' '}
                        <Link href="/computos-guardados" className="underline hover:text-blue-600" style={{ color: '#C5A770' }}>
                          Mis Cómputos
                        </Link>
                      </p>
                    </div>
                    <button
                      onClick={() => setMostrarGuardar(true)}
                      disabled={calculosGuardados >= limiteCalculos}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        calculosGuardados >= limiteCalculos
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}
                    >
                      {calculosGuardados >= limiteCalculos ? 'Límite alcanzado' : 'Guardar cálculo'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Formulario para guardar */}
              {mostrarGuardar && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F9F7F5', border: '1.5px solid #C5A770' }}>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1C1C' }}>
                    Guardar Cálculo
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nombre del cálculo"
                      value={nombreCalculo}
                      onChange={(e) => setNombreCalculo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ border: '1.5px solid #C5A770', fontFamily: 'Inter, sans-serif' }}
                    />
                    <textarea
                      placeholder="Descripción (opcional)"
                      value={descripcionCalculo}
                      onChange={(e) => setDescripcionCalculo(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ border: '1.5px solid #C5A770', fontFamily: 'Inter, sans-serif' }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={guardarCalculo}
                        disabled={!nombreCalculo || guardando}
                        className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setMostrarGuardar(false);
                          setNombreCalculo('');
                          setDescripcionCalculo('');
                        }}
                        className="px-4 py-2 rounded-lg hover:bg-gray-100"
                        style={{ border: '1.5px solid #C5A770', fontFamily: 'Inter, sans-serif', color: '#1C1C1C' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  {mensajeGuardado && (
                    <p className="mt-3 text-sm" style={{ color: mensajeGuardado.includes('Error') ? '#DC2626' : '#059669', fontFamily: 'Inter, sans-serif' }}>
                      {mensajeGuardado}
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-8 text-center">
                <button 
                  type="submit" 
                  disabled={calculando} 
                  className="w-full" 
                  style={{ 
                    width: '100%',
                    backgroundColor: calculando ? '#E5E5E5' : '#1C1C1C', 
                    color: calculando ? '#999' : '#F4EFE8', 
                    padding: '1rem 2rem', 
                    borderRadius: '25px', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    transition: 'all 0.3s ease', 
                    cursor: calculando ? 'not-allowed' : 'pointer', 
                    border: '1.5px solid #1C1C1C', 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.02em' 
                  }} 
                  onMouseEnter={(e) => { 
                    if (!calculando) { 
                      e.currentTarget.style.backgroundColor = '#C5A770'; 
                      e.currentTarget.style.borderColor = '#C5A770';
                      e.currentTarget.style.color = '#1C1C1C';
                    } 
                  }} 
                  onMouseLeave={(e) => { 
                    if (!calculando) { 
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
          
          <div className="space-y-6">
          </div>
        </section>
        
        {resultado && (
          <div style={{ 
            marginTop: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            padding: '2rem',
            border: '1.5px solid #C5A770'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1C1C1C',
              fontFamily: 'Playfair Display, serif'
            }}>Resultado del Cálculo</h2>
            
            <div style={{ 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1rem', 
              background: tipoUsuario === 'servidor' 
                ? (resultado.esOportuno ? 'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)') 
                : '#F9F7F5', 
              border: tipoUsuario === 'servidor' 
                ? `1.5px solid ${resultado.esOportuno ? '#C5A770' : '#dc2626'}` 
                : '1.5px solid #C5A770' 
            }}>
              {tipoUsuario === 'servidor' ? (
                <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1C1C1C' }}>
                  El recurso se presentó de forma: {' '}
                  <span className={resultado.esOportuno ? 'text-green-700' : 'text-red-600 font-bold'}>
                    {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
                  </span>
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1C1C1C', marginBottom: '0.5rem' }}>
                    Plazo legal: <span style={{ color: '#C5A770' }}>{resultado.plazo} días hábiles</span>
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#3D3D3D', marginBottom: '0.5rem' }}>
                    <strong>Fundamento:</strong> {resultado.fundamento}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#3D3D3D', marginBottom: '0.5rem' }}>
                    <strong>Fecha de notificación:</strong> {resultado.fechaNotificacion?.toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#3D3D3D', marginBottom: '0.5rem' }}>
                    <strong>Surte efectos:</strong> {resultado.fechaSurte?.toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#3D3D3D' }}>
                    <strong>Período del cómputo:</strong> Del {resultado.fechaInicio?.toLocaleDateString()} al {resultado.fechaFin?.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ 
              backgroundColor: 'transparent',
              padding: '1rem',
              borderRadius: '30px',
              marginBottom: '1rem',
              border: '2px solid #C5A770'
            }}>
              <h3 style={{ 
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1C1C1C',
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.125rem'
              }}>Detalles del Cómputo:</h3>
              <div className="space-y-1" style={{ fontSize: '0.875rem', color: '#1C1C1C', fontFamily: 'Inter, sans-serif' }}>
                <p><strong style={{ color: '#1C1C1C' }}>Plazo legal:</strong> {resultado.plazo} días hábiles</p>
                <p><strong style={{ color: '#1C1C1C' }}>Fundamento:</strong> {resultado.fundamento}</p>
                <p><strong style={{ color: '#1C1C1C' }}>Fecha de notificación:</strong> {fechaATexto(resultado.fechaNotificacion?.toISOString().split('T')[0])}</p>
                <p><strong style={{ color: '#1C1C1C' }}>Surte efectos:</strong> {fechaATexto(resultado.fechaSurte?.toISOString().split('T')[0])}</p>
                <p><strong style={{ color: '#1C1C1C' }}>Período del cómputo:</strong> Del {fechaATexto(resultado.fechaInicio?.toISOString().split('T')[0])} al {fechaATexto(resultado.fechaFin?.toISOString().split('T')[0])}</p>
                {tipoUsuario === 'servidor' && (
                  <p><strong style={{ color: '#1C1C1C' }}>Fecha de presentación:</strong> {formData.fechaPresentacion ? fechaATexto(formData.fechaPresentacion) : ''}</p>
                )}
                <p><strong style={{ color: '#1C1C1C' }}>Días inhábiles excluidos:</strong> {formatearDiasInhabilesParaDetalles(generarTextoDiasInhabiles())}</p>
              </div>
            </div>
            
            {tipoUsuario === 'servidor' && (
              <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
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
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Texto para Resolución:</h3>
                  <button 
                    onClick={copiarTexto}
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                  >
                    Copiar Texto
                  </button>
                </div>
                <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap border p-3 bg-white rounded" style={{ textAlign: 'justify' }}>
                  {generarTextoResolucion()}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-4">
              {tipoUsuario === 'servidor' && (
                <button 
                  onClick={copiarCalendario} 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Copiar calendario
                </button>
              )}
              <button 
                onClick={() => { 
                  setResultado(null); 
                  setFormData({ fechaNotificacion: '', formaNotificacion: '', fechaPresentacion: '', formaPresentacion: '' }); 
                }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Nuevo Cálculo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}