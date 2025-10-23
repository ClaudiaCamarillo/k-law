// Función para convertir números a letras
function numeroALetras(numero) {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  numero = Math.floor(Number(numero));
  
  if (numero === 0) return 'CERO';
  if (numero === 100) return 'CIEN';
  if (numero === 1000) return 'MIL';
  
  let resultado = '';
  
  if (numero >= 1000) {
    let miles = Math.floor(numero / 1000);
    if (miles === 1) {
      resultado = 'MIL ';
    } else {
      resultado = unidades[miles] + ' MIL ';
    }
    numero = numero % 1000;
  }
  
  if (numero >= 100) {
    resultado += centenas[Math.floor(numero / 100)] + ' ';
    numero = numero % 100;
  }
  
  if (numero >= 10) {
    if (numero === 10) resultado += 'DIEZ';
    else if (numero === 11) resultado += 'ONCE';
    else if (numero === 12) resultado += 'DOCE';
    else if (numero === 13) resultado += 'TRECE';
    else if (numero === 14) resultado += 'CATORCE';
    else if (numero === 15) resultado += 'QUINCE';
    else if (numero < 20) resultado += 'DIECI' + unidades[numero - 10];
    else if (numero === 20) resultado += 'VEINTE';
    else if (numero < 30) resultado += 'VEINTI' + unidades[numero - 20];
    else {
      resultado += decenas[Math.floor(numero / 10)];
      if (numero % 10 > 0) resultado += ' Y ' + unidades[numero % 10];
    }
  } else if (numero > 0) {
    resultado += unidades[numero];
  }
  
  return resultado.trim();
}

// Función para formatear fechas en español
function fechaEnLetras(fecha) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const date = new Date(fecha);
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const año = date.getFullYear();
  return `${dia} de ${mes} de ${año}`;
}

// Estilos base para Legal Design
const legalDesignStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');
  
  :root {
    --color-primario: #0A1628;
    --color-secundario: #C9A961;
    --color-acento: #16a34a;
    --color-fondo: #F5F5F5;
    --color-texto: #374151;
    --color-borde: #e5e7eb;
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    color: var(--color-texto);
    line-height: 1.6;
    margin: 0;
    padding: 40px;
    background: white;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .header {
    background: linear-gradient(135deg, var(--color-primario) 0%, #1a2b44 100%);
    color: white;
    padding: 40px;
    border-radius: 20px 20px 0 0;
    position: relative;
    overflow: hidden;
  }
  
  .header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(201,169,97,0.1) 0%, transparent 70%);
    animation: pulse 20s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .header-content {
    position: relative;
    z-index: 1;
  }
  
  .doc-type {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.8;
    margin-bottom: 10px;
  }
  
  .doc-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 20px 0;
  }
  
  .doc-date {
    font-size: 14px;
    opacity: 0.9;
  }
  
  .section {
    margin: 30px 0;
    animation: fadeIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .section-icon {
    width: 40px;
    height: 40px;
    background: rgba(201,169,97,0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  
  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--color-primario);
    margin: 0;
  }
  
  .info-card {
    background: var(--color-fondo);
    border-left: 4px solid var(--color-secundario);
    padding: 20px;
    border-radius: 0 12px 12px 0;
    margin: 20px 0;
  }
  
  .highlight-box {
    background: rgba(201,169,97,0.1);
    border: 2px solid var(--color-secundario);
    padding: 20px;
    border-radius: 12px;
    margin: 20px 0;
  }
  
  .party-card {
    background: white;
    border: 2px solid var(--color-borde);
    border-radius: 12px;
    padding: 20px;
    margin: 15px 0;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
  }
  
  .party-card:hover {
    border-color: var(--color-secundario);
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }
  
  .party-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-primario) 0%, #1a2b44 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .party-info h3 {
    margin: 0 0 5px 0;
    color: var(--color-primario);
    font-weight: 600;
  }
  
  .party-info p {
    margin: 0;
    color: var(--color-texto);
    font-size: 14px;
  }
  
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  
  .timeline-item {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    position: relative;
  }
  
  .timeline-item::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    bottom: -30px;
    width: 2px;
    background: var(--color-borde);
  }
  
  .timeline-item:last-child::before {
    display: none;
  }
  
  .timeline-dot {
    width: 40px;
    height: 40px;
    background: var(--color-secundario);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    flex-shrink: 0;
    z-index: 1;
  }
  
  .timeline-content {
    flex: 1;
    background: var(--color-fondo);
    padding: 15px 20px;
    border-radius: 12px;
  }
  
  .timeline-content h4 {
    margin: 0 0 5px 0;
    color: var(--color-primario);
    font-weight: 600;
  }
  
  .timeline-content p {
    margin: 0;
    color: var(--color-texto);
    font-size: 14px;
  }
  
  .amount-display {
    background: linear-gradient(135deg, var(--color-secundario) 0%, #e5c370 100%);
    color: var(--color-primario);
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    margin: 20px 0;
    position: relative;
    overflow: hidden;
  }
  
  .amount-display::before {
    content: '$';
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 80px;
    opacity: 0.1;
    font-weight: bold;
  }
  
  .amount-label {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .amount-value {
    font-size: 36px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    margin: 0;
  }
  
  .amount-text {
    font-size: 14px;
    margin-top: 10px;
    opacity: 0.9;
  }
  
  .checklist {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 15px;
    padding: 15px;
    background: var(--color-fondo);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .checklist-item:hover {
    background: rgba(201,169,97,0.1);
  }
  
  .checklist-icon {
    width: 24px;
    height: 24px;
    background: var(--color-acento);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    flex-shrink: 0;
  }
  
  .checklist-content {
    flex: 1;
    color: var(--color-texto);
  }
  
  .signature-section {
    margin-top: 60px;
    display: flex;
    justify-content: space-around;
    gap: 40px;
  }
  
  .signature-box {
    text-align: center;
    flex: 1;
  }
  
  .signature-line {
    border-bottom: 2px solid var(--color-primario);
    margin: 60px 0 10px 0;
  }
  
  .signature-name {
    font-weight: 600;
    color: var(--color-primario);
    margin-bottom: 5px;
  }
  
  .signature-role {
    font-size: 14px;
    color: var(--color-texto);
  }
  
  .watermark-logo {
    position: fixed;
    bottom: 30px;
    right: 30px;
    opacity: 0.15;
    z-index: 1000;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
  
  .legal-footer {
    margin-top: 60px;
    padding-top: 30px;
    border-top: 2px solid var(--color-borde);
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
  }
  
  @media print {
    body {
      padding: 20px;
    }
    
    .header {
      background: var(--color-primario) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .party-card, .timeline-item, .checklist-item {
      break-inside: avoid;
    }
  }
`;

// Importar generador de estilos dinámicos
import { generateDynamicStyles, applyIndustryStyles } from './dynamic-styles.js'

// Función para generar plantillas con estilos personalizados
export function createLegalDesignTemplate(tipoDocumento, datos, config) {
  // Generar estilos base según la configuración
  const baseStyles = generateDynamicStyles(config)
  
  // Aplicar estilos específicos de industria si aplica
  const styles = applyIndustryStyles(config?.industry || 'general', baseStyles)
  
  // Obtener la plantilla correspondiente
  const template = legalDesignTemplates[tipoDocumento]
  if (!template) return null
  
  // Generar el documento con los estilos personalizados
  return template(datos, styles, config)
}

// Plantillas Legal Design
export const legalDesignTemplates = {
  'Contrato de Arrendamiento': (datos, customStyles, config) => {
    const montoEnLetras = numeroALetras(datos.renta);
    const fechaInicioLetras = fechaEnLetras(datos.fechaInicio);
    const fechaTermino = new Date(datos.fechaInicio);
    fechaTermino.setMonth(fechaTermino.getMonth() + parseInt(datos.duracion));
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Arrendamiento</title>
    <style>
        ${customStyles || legalDesignStyles}
        
        .legal-box {
            border: 2px solid var(--color-secundario);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            background: linear-gradient(135deg, rgba(201,169,97,0.03) 0%, rgba(201,169,97,0.01) 100%);
            position: relative;
            overflow: hidden;
        }
        
        .legal-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 6px;
            height: 100%;
            background: var(--color-secundario);
        }
        
        .legal-box-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 700;
            color: var(--color-primario);
        }
        
        .legal-box-content {
            font-size: 16px;
            line-height: 1.6;
            color: var(--color-texto);
        }
        
        .investment-box {
            background: linear-gradient(135deg, var(--color-primario) 0%, #1a2b44 100%);
            color: white;
            border-radius: 16px;
            padding: 35px;
            margin: 25px 0;
            text-align: center;
            box-shadow: 0 10px 30px rgba(10,22,40,0.3);
            position: relative;
            overflow: hidden;
        }
        
        .investment-box::after {
            content: '💰';
            position: absolute;
            top: -20px;
            right: -20px;
            font-size: 120px;
            opacity: 0.1;
        }
        
        .investment-amount {
            font-size: 48px;
            font-weight: 800;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .investment-details {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 20px;
        }
        
        .investment-detail {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        
        .property-showcase {
            background: white;
            border: 3px solid var(--color-secundario);
            border-radius: 16px;
            padding: 30px;
            margin: 25px 0;
            position: relative;
        }
        
        .property-showcase::before {
            content: '📍';
            position: absolute;
            top: -20px;
            left: 30px;
            font-size: 40px;
            background: white;
            padding: 0 10px;
        }
        
        .property-type {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--color-secundario);
            margin-bottom: 10px;
        }
        
        .property-address {
            font-size: 22px;
            font-weight: 700;
            color: var(--color-primario);
            line-height: 1.4;
        }
        
        .clause-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }
        
        .clause-card {
            background: var(--color-fondo);
            border-radius: 12px;
            padding: 20px;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .clause-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .clause-number {
            position: absolute;
            top: -10px;
            left: 20px;
            background: var(--color-secundario);
            color: var(--color-primario);
            font-weight: 700;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
        }
        
        .terms-timeline {
            position: relative;
            padding: 30px 0;
        }
        
        .terms-timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--color-secundario);
            transform: translateX(-50%);
        }
        
        .term-item {
            display: flex;
            align-items: center;
            margin: 30px 0;
            position: relative;
        }
        
        .term-item:nth-child(odd) {
            flex-direction: row-reverse;
        }
        
        .term-content {
            flex: 1;
            padding: 20px;
            background: white;
            border: 2px solid var(--color-borde);
            border-radius: 12px;
            margin: 0 30px;
        }
        
        .term-dot {
            width: 50px;
            height: 50px;
            background: var(--color-secundario);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="doc-type">DOCUMENTO LEGAL</div>
                <h1 class="doc-title">CONTRATO DE ARRENDAMIENTO</h1>
                <div class="doc-date">📅 Fecha de celebración: ${fechaInicioLetras}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">👥</div>
                <h2 class="section-title">PARTES CONTRATANTES</h2>
            </div>
            
            <div class="party-card">
                <div class="party-icon">🏠</div>
                <div class="party-info">
                    <h3>${datos.arrendador}</h3>
                    <p>En adelante "EL ARRENDADOR" • Propietario del inmueble</p>
                </div>
            </div>
            
            <div class="party-card">
                <div class="party-icon">🔑</div>
                <div class="party-info">
                    <h3>${datos.arrendatario}</h3>
                    <p>En adelante "EL ARRENDATARIO" • Inquilino</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="legal-box">
                <div class="legal-box-header">
                    <span>📋</span> OBJETO DEL CONTRATO
                </div>
                <div class="property-showcase">
                    <div class="property-type">${datos.tipoInmueble}</div>
                    <div class="property-address">${datos.inmueble}</div>
                </div>
                <div class="legal-box-content">
                    El ARRENDADOR otorga en arrendamiento al ARRENDATARIO el inmueble descrito, 
                    quien lo recibe en el estado físico en que se encuentra, manifestando que es 
                    apto para el uso convenido.
                </div>
            </div>
        </div>

        <div class="section">
            <div class="investment-box">
                <div style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">
                    💰 INVERSIÓN MENSUAL
                </div>
                <div class="investment-amount">
                    $${Number(datos.renta).toLocaleString('es-MX')} MXN
                </div>
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">
                    ${montoEnLetras} PESOS 00/100 M.N.
                </div>
                <div class="investment-details">
                    <div class="investment-detail">
                        <span>📅</span>
                        <span>Pago: Día 5 de cada mes</span>
                    </div>
                    <div class="investment-detail">
                        <span>🛡️</span>
                        <span>Depósito: 1 mes de renta</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">⏱️</div>
                <h2 class="section-title">VIGENCIA DEL CONTRATO</h2>
            </div>
            
            <div class="terms-timeline">
                <div class="term-item">
                    <div class="term-dot">🚀</div>
                    <div class="term-content">
                        <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">INICIO</h4>
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">${fechaInicioLetras}</p>
                    </div>
                </div>
                
                <div class="term-item">
                    <div class="term-dot">📆</div>
                    <div class="term-content">
                        <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">DURACIÓN</h4>
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">${datos.duracion} MESES</p>
                    </div>
                </div>
                
                <div class="term-item">
                    <div class="term-dot">🏁</div>
                    <div class="term-content">
                        <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">TÉRMINO</h4>
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">${fechaEnLetras(fechaTermino)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📑</div>
                <h2 class="section-title">CLÁUSULAS PRINCIPALES</h2>
            </div>
            
            <div class="clause-grid">
                <div class="clause-card">
                    <div class="clause-number">PRIMERA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">💵 FORMA DE PAGO</h4>
                    <p style="margin: 0;">La renta se pagará por mensualidades adelantadas, dentro de los primeros 5 días de cada mes, en el domicilio del ARRENDADOR o mediante transferencia bancaria.</p>
                </div>
                
                <div class="clause-card">
                    <div class="clause-number">SEGUNDA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">🏠 USO DEL INMUEBLE</h4>
                    <p style="margin: 0;">El inmueble se destinará exclusivamente para ${datos.tipoInmueble.toLowerCase()}, quedando prohibido darle un uso distinto sin consentimiento por escrito.</p>
                </div>
                
                <div class="clause-card">
                    <div class="clause-number">TERCERA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">🔧 MANTENIMIENTO</h4>
                    <p style="margin: 0;">El ARRENDATARIO se obliga a conservar el inmueble en el mismo buen estado en que lo recibe, siendo de su cuenta las reparaciones por deterioro.</p>
                </div>
                
                <div class="clause-card">
                    <div class="clause-number">CUARTA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">💡 SERVICIOS</h4>
                    <p style="margin: 0;">Los servicios de energía eléctrica, agua, gas e internet correrán por cuenta del ARRENDATARIO.</p>
                </div>
                
                <div class="clause-card">
                    <div class="clause-number">QUINTA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">🚫 SUBARRIENDO</h4>
                    <p style="margin: 0;">Queda prohibido al ARRENDATARIO subarrendar total o parcialmente el inmueble sin autorización escrita del ARRENDADOR.</p>
                </div>
                
                <div class="clause-card">
                    <div class="clause-number">SEXTA</div>
                    <h4 style="margin: 20px 0 10px 0; color: var(--color-primario);">⚖️ RESCISIÓN</h4>
                    <p style="margin: 0;">El incumplimiento de cualquier obligación dará derecho a la parte afectada para rescindir el contrato y exigir el pago de daños y perjuicios.</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">✅</div>
                <h2 class="section-title">OBLIGACIONES Y COMPROMISOS</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="legal-box">
                    <div class="legal-box-header">
                        <span>🏠</span> DEL ARRENDADOR
                    </div>
                    <ul class="checklist">
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Entregar el inmueble en condiciones de uso</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Garantizar el uso pacífico del inmueble</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Realizar reparaciones necesarias</div>
                        </li>
                    </ul>
                </div>
                
                <div class="legal-box">
                    <div class="legal-box-header">
                        <span>🔑</span> DEL ARRENDATARIO
                    </div>
                    <ul class="checklist">
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Pagar puntualmente la renta</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Conservar en buen estado el inmueble</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Pagar los servicios</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Permitir inspecciones con previo aviso</div>
                        </li>
                        <li class="checklist-item">
                            <div class="checklist-icon">✓</div>
                            <div class="checklist-content">Devolver el inmueble al término</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="info-card" style="background: #fef2f2; border-left-color: #ef4444;">
                <h3 style="margin: 0 0 15px 0; color: #dc2626; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">⚠️</span> CAUSALES DE RESCISIÓN
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #ef4444; font-size: 20px;">•</span>
                        <span>Falta de pago de 2 mensualidades</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #ef4444; font-size: 20px;">•</span>
                        <span>Subarrendamiento sin autorización</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #ef4444; font-size: 20px;">•</span>
                        <span>Uso distinto al pactado</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #ef4444; font-size: 20px;">•</span>
                        <span>Daños graves al inmueble</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.arrendador.toUpperCase()}</div>
                <div class="signature-role">EL ARRENDADOR</div>
            </div>
            
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.arrendatario.toUpperCase()}</div>
                <div class="signature-role">EL ARRENDATARIO</div>
            </div>
        </div>

        <div class="legal-footer">
            <p>Este contrato se rige por el Código Civil Federal y las disposiciones legales aplicables en materia de arrendamiento.</p>
            <p style="margin-top: 10px; font-size: 11px;">La validez legal de este documento está sujeta a la firma autógrafa de las partes.</p>
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" class="watermark-logo" alt="K-LAW" style="width: 180px; height: auto;">
</body>
</html>
    `;
  },

  'Demanda de Amparo Indirecto': (datos, customStyles, config) => {
    const fechaNotificacion = fechaEnLetras(datos.fechaNotificacion);
    const fechaHoy = fechaEnLetras(new Date());
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demanda de Amparo Indirecto</title>
    <style>${customStyles || legalDesignStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="doc-type">Juicio de Garantías</div>
                <h1 class="doc-title">DEMANDA DE AMPARO INDIRECTO</h1>
                <div class="doc-date">📅 Presentada el ${fechaHoy}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">⚖️</div>
                <h2 class="section-title">Información del Juicio</h2>
            </div>
            
            <div class="info-card">
                <p style="margin: 0 0 10px 0;"><strong>Promovente:</strong> ${datos.promovente}</p>
                <p style="margin: 0 0 10px 0;"><strong>Autoridad Responsable:</strong> ${datos.autoridadResponsable}</p>
                <p style="margin: 0;"><strong>Juzgado:</strong> Juez de Distrito en Materia de Amparo en turno</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📋</div>
                <h2 class="section-title">Acto Reclamado</h2>
            </div>
            
            <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; line-height: 1.6;">${datos.actoReclamado}</p>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--color-secundario);">
                    <p style="margin: 0;"><strong>📅 Fecha de notificación:</strong> ${fechaNotificacion}</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🛡️</div>
                <h2 class="section-title">Derechos Violados</h2>
            </div>
            
            <div class="info-card" style="background: #fef3c7; border-left-color: #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: var(--color-primario);">Preceptos Constitucionales</h3>
                <p style="margin: 0;">${datos.derechosViolados}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📝</div>
                <h2 class="section-title">Conceptos de Violación</h2>
            </div>
            
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-dot">1</div>
                    <div class="timeline-content">
                        <h4>Violación a la garantía de legalidad</h4>
                        <p>La autoridad responsable no fundó ni motivó debidamente su actuación, violando el artículo 16 constitucional.</p>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-dot">2</div>
                    <div class="timeline-content">
                        <h4>Violación a la garantía de audiencia</h4>
                        <p>Se transgrede el artículo 14 constitucional al no otorgar oportunidad de defensa previa.</p>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-dot">3</div>
                    <div class="timeline-content">
                        <h4>Incompetencia de la autoridad</h4>
                        <p>La autoridad carece de facultades legales para emitir el acto reclamado.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">💬</div>
                <h2 class="section-title">Argumentos Principales</h2>
            </div>
            
            ${datos.argumentos.split('\n').map((arg, index) => `
            <div class="checklist-item">
                <div class="checklist-icon">${index + 1}</div>
                <div class="checklist-content">${arg}</div>
            </div>
            `).join('')}
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🎯</div>
                <h2 class="section-title">Peticiones al Juzgado</h2>
            </div>
            
            <ul class="checklist">
                <li class="checklist-item">
                    <div class="checklist-icon">1</div>
                    <div class="checklist-content">Admitir la demanda de amparo</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">2</div>
                    <div class="checklist-content">Solicitar informe justificado a la autoridad responsable</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">3</div>
                    <div class="checklist-content">Conceder la suspensión provisional y definitiva</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">4</div>
                    <div class="checklist-content">Otorgar el amparo y protección de la Justicia Federal</div>
                </li>
            </ul>
        </div>

        <div class="signature-section">
            <div class="signature-box" style="max-width: 400px; margin: 0 auto;">
                <p style="margin-bottom: 20px; font-weight: 600;">PROTESTO LO NECESARIO</p>
                <div class="signature-line"></div>
                <div class="signature-name">${datos.promovente.toUpperCase()}</div>
                <div class="signature-role">QUEJOSO</div>
            </div>
        </div>

        <div class="legal-footer">
            <p>Demanda presentada con fundamento en los artículos 103 y 107 de la Constitución Política de los Estados Unidos Mexicanos y la Ley de Amparo</p>
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" class="watermark-logo" alt="K-LAW" style="width: 180px; height: auto;">
</body>
</html>
    `;
  },

  'Contrato de Servicios': (datos, customStyles, config) => {
    const honorariosEnLetras = numeroALetras(datos.honorarios);
    const fechaHoy = fechaEnLetras(new Date());
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Servicios</title>
    <style>${customStyles || legalDesignStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="doc-type">Contrato Profesional</div>
                <h1 class="doc-title">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
                <div class="doc-date">📅 ${fechaHoy}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">👥</div>
                <h2 class="section-title">Partes del Contrato</h2>
            </div>
            
            <div class="party-card">
                <div class="party-icon">💼</div>
                <div class="party-info">
                    <h3>${datos.prestador}</h3>
                    <p>Prestador de Servicios • Profesional independiente</p>
                </div>
            </div>
            
            <div class="party-card">
                <div class="party-icon">🏢</div>
                <div class="party-info">
                    <h3>${datos.cliente}</h3>
                    <p>Cliente • Contratante de servicios</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🎯</div>
                <h2 class="section-title">Servicios Contratados</h2>
            </div>
            
            <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; line-height: 1.8;">${datos.servicios}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">💰</div>
                <h2 class="section-title">Honorarios Profesionales</h2>
            </div>
            
            <div class="amount-display">
                <div class="amount-label">Total del Contrato</div>
                <p class="amount-value">$${Number(datos.honorarios).toLocaleString('es-MX')}</p>
                <div class="amount-text">${honorariosEnLetras} PESOS 00/100 M.N.</div>
            </div>
            
            <div class="info-card">
                <p style="margin: 0 0 10px 0;"><strong>💳 Forma de pago:</strong> ${datos.formaPago}</p>
                <p style="margin: 0;"><strong>📄 Incluye:</strong> IVA y comprobante fiscal</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">⏱️</div>
                <h2 class="section-title">Duración del Contrato</h2>
            </div>
            
            <div class="highlight-box" style="text-align: center;">
                <h3 style="margin: 0; color: var(--color-primario); font-size: 24px;">${datos.duracion}</h3>
                <p style="margin: 10px 0 0 0;">Prorrogable por acuerdo de las partes</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">✅</div>
                <h2 class="section-title">Compromisos del Prestador</h2>
            </div>
            
            <ul class="checklist">
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">Prestar los servicios con diligencia y profesionalismo</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">Mantener confidencialidad absoluta</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">Informar avances periódicamente</div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">Entregar resultados en tiempo acordado</div>
                </li>
            </ul>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🔐</div>
                <h2 class="section-title">Cláusulas Importantes</h2>
            </div>
            
            <div class="info-card" style="background: #fef3c7; border-left-color: #f59e0b;">
                <h4 style="margin: 0 0 10px 0;">🤐 Confidencialidad</h4>
                <p style="margin: 0;">Toda información compartida es estrictamente confidencial</p>
            </div>
            
            <div class="info-card" style="background: #dbeafe; border-left-color: #3b82f6;">
                <h4 style="margin: 0 0 10px 0;">📋 Propiedad Intelectual</h4>
                <p style="margin: 0;">Los derechos sobre el trabajo realizado pertenecen al cliente</p>
            </div>
            
            <div class="info-card" style="background: #f3f4f6; border-left-color: #6b7280;">
                <h4 style="margin: 0 0 10px 0;">👔 Relación Laboral</h4>
                <p style="margin: 0;">No existe relación laboral, solo prestación de servicios profesionales</p>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.prestador.toUpperCase()}</div>
                <div class="signature-role">EL PRESTADOR</div>
            </div>
            
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.cliente.toUpperCase()}</div>
                <div class="signature-role">EL CLIENTE</div>
            </div>
        </div>

        <div class="legal-footer">
            <p>Contrato celebrado conforme al Código Civil y normativa fiscal vigente</p>
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" class="watermark-logo" alt="K-LAW" style="width: 180px; height: auto;">
</body>
</html>
    `;
  },

  'Demanda de Amparo Directo': (datos, customStyles, config) => {
    const fechaHoy = fechaEnLetras(new Date());
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demanda de Amparo Directo</title>
    <style>${customStyles || legalDesignStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="doc-type">Juicio Constitucional</div>
                <h1 class="doc-title">DEMANDA DE AMPARO DIRECTO</h1>
                <div class="doc-date">📅 ${fechaHoy}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">⚖️</div>
                <h2 class="section-title">Datos del Juicio</h2>
            </div>
            
            <div class="info-card">
                <p style="margin: 0 0 10px 0;"><strong>Quejoso:</strong> ${datos.quejoso}</p>
                <p style="margin: 0 0 10px 0;"><strong>Sentencia Impugnada:</strong> ${datos.sentencia}</p>
                <p style="margin: 0;"><strong>Tribunal Responsable:</strong> ${datos.tribunal}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🎯</div>
                <h2 class="section-title">Vía Directa</h2>
            </div>
            
            <div class="highlight-box" style="background: rgba(34, 197, 94, 0.1); border-color: #22c55e;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                        ⚡
                    </div>
                    <div>
                        <h3 style="margin: 0; color: var(--color-primario);">Procedencia del Amparo Directo</h3>
                        <p style="margin: 5px 0 0 0;">Contra sentencias definitivas, laudos y resoluciones que pongan fin al juicio</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📋</div>
                <h2 class="section-title">Conceptos de Violación</h2>
            </div>
            
            <div class="timeline">
                ${datos.conceptosViolacion.split('\n').map((concepto, index) => `
                <div class="timeline-item">
                    <div class="timeline-dot" style="background: linear-gradient(135deg, var(--color-primario) 0%, #1a2b44 100%);">${index + 1}</div>
                    <div class="timeline-content">
                        <h4>Concepto ${index + 1}</h4>
                        <p>${concepto}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📚</div>
                <h2 class="section-title">Fundamentación Jurídica</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div class="info-card" style="background: #fef3c7; border-left-color: #f59e0b;">
                    <h4 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📜</span> Constitucional
                    </h4>
                    <p style="margin: 0; font-size: 14px;">Artículos 103 y 107 de la CPEUM</p>
                </div>
                
                <div class="info-card" style="background: #dbeafe; border-left-color: #3b82f6;">
                    <h4 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">⚖️</span> Ley de Amparo
                    </h4>
                    <p style="margin: 0; font-size: 14px;">Artículos 170 al 189</p>
                </div>
                
                <div class="info-card" style="background: #e0e7ff; border-left-color: #6366f1;">
                    <h4 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📖</span> Jurisprudencia
                    </h4>
                    <p style="margin: 0; font-size: 14px;">Criterios aplicables de la SCJN</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🔍</div>
                <h2 class="section-title">Análisis de Procedencia</h2>
            </div>
            
            <ul class="checklist">
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">
                        <strong>Sentencia definitiva:</strong> La resolución impugnada pone fin al juicio
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">
                        <strong>Agotamiento de recursos:</strong> No existen recursos ordinarios pendientes
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">
                        <strong>Violaciones procesales:</strong> Se hicieron valer oportunamente
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon">✓</div>
                    <div class="checklist-content">
                        <strong>Plazo legal:</strong> Presentado dentro de los 15 días hábiles
                    </div>
                </li>
            </ul>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🎯</div>
                <h2 class="section-title">Pretensiones</h2>
            </div>
            
            <div class="highlight-box">
                <div style="text-align: center;">
                    <div style="display: inline-block; background: var(--color-primario); color: white; padding: 20px 40px; border-radius: 12px; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 24px;">Amparo y Protección</h3>
                        <p style="margin: 10px 0 0 0;">de la Justicia Federal</p>
                    </div>
                    <p style="margin: 0; font-size: 16px; color: var(--color-texto);">
                        Para el efecto de que se deje sin efectos la sentencia reclamada y se dicte una nueva
                        conforme a derecho
                    </p>
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box" style="max-width: 400px; margin: 0 auto;">
                <p style="margin-bottom: 20px; font-weight: 600;">PROTESTO LO NECESARIO</p>
                <div class="signature-line"></div>
                <div class="signature-name">${datos.quejoso.toUpperCase()}</div>
                <div class="signature-role">QUEJOSO</div>
            </div>
        </div>

        <div class="legal-footer">
            <p>Demanda presentada ante el Tribunal Colegiado de Circuito en Materia que corresponda</p>
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" class="watermark-logo" alt="K-LAW" style="width: 180px; height: auto;">
</body>
</html>
    `;
  },

  'Contrato de Compraventa': (datos, customStyles, config) => {
    const precioEnLetras = numeroALetras(datos.precio);
    const fechaHoy = fechaEnLetras(new Date());
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Compraventa</title>
    <style>${customStyles || legalDesignStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="doc-type">Contrato de Transmisión de Propiedad</div>
                <h1 class="doc-title">CONTRATO DE COMPRAVENTA</h1>
                <div class="doc-date">📅 ${fechaHoy}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🤝</div>
                <h2 class="section-title">Partes Contratantes</h2>
            </div>
            
            <div class="party-card">
                <div class="party-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">💰</div>
                <div class="party-info">
                    <h3>${datos.vendedor}</h3>
                    <p>Vendedor • Propietario actual</p>
                </div>
            </div>
            
            <div class="party-card">
                <div class="party-icon" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">🏠</div>
                <div class="party-info">
                    <h3>${datos.comprador}</h3>
                    <p>Comprador • Nuevo propietario</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🏢</div>
                <h2 class="section-title">Objeto de la Compraventa</h2>
            </div>
            
            <div class="highlight-box" style="background: linear-gradient(135deg, rgba(201,169,97,0.1) 0%, rgba(201,169,97,0.05) 100%);">
                <h3 style="margin: 0 0 15px 0; color: var(--color-primario); font-size: 20px;">${datos.tipoPropiedad}</h3>
                <p style="margin: 0; font-size: 16px;"><strong>📍 Ubicación:</strong> ${datos.direccion}</p>
                ${datos.superficie ? `<p style="margin: 10px 0 0 0;"><strong>📐 Superficie:</strong> ${datos.superficie} metros cuadrados</p>` : ''}
                ${datos.descripcion ? `<p style="margin: 10px 0 0 0;"><strong>📋 Descripción:</strong> ${datos.descripcion}</p>` : ''}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">💎</div>
                <h2 class="section-title">Precio de Venta</h2>
            </div>
            
            <div class="amount-display" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                <div class="amount-label">Precio Total Acordado</div>
                <p class="amount-value">$${Number(datos.precio).toLocaleString('es-MX')}</p>
                <div class="amount-text">${precioEnLetras} PESOS 00/100 M.N.</div>
            </div>
            
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-dot" style="background: #22c55e;">💳</div>
                    <div class="timeline-content">
                        <h4>Forma de Pago</h4>
                        <p>${datos.formaPago || 'Pago de contado en una sola exhibición'}</p>
                    </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-dot" style="background: #3b82f6;">📄</div>
                    <div class="timeline-content">
                        <h4>Comprobante Fiscal</h4>
                        <p>Se expedirá factura correspondiente al momento del pago</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">📜</div>
                <h2 class="section-title">Declaraciones del Vendedor</h2>
            </div>
            
            <ul class="checklist">
                <li class="checklist-item">
                    <div class="checklist-icon" style="background: var(--color-primario);">1</div>
                    <div class="checklist-content">
                        <strong>Propiedad legítima:</strong> Es propietario legítimo del bien objeto de esta compraventa
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon" style="background: var(--color-primario);">2</div>
                    <div class="checklist-content">
                        <strong>Libre de gravámenes:</strong> El inmueble se encuentra libre de todo gravamen o limitación
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon" style="background: var(--color-primario);">3</div>
                    <div class="checklist-content">
                        <strong>Al corriente:</strong> Se encuentra al corriente en el pago de contribuciones y servicios
                    </div>
                </li>
                <li class="checklist-item">
                    <div class="checklist-icon" style="background: var(--color-primario);">4</div>
                    <div class="checklist-content">
                        <strong>Capacidad legal:</strong> Tiene plena capacidad legal para celebrar este contrato
                    </div>
                </li>
            </ul>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">🔄</div>
                <h2 class="section-title">Proceso de Transmisión</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="text-align: center; padding: 20px; background: var(--color-fondo); border-radius: 12px;">
                    <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; margin: 0 auto 15px;">
                        1
                    </div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">Firma del Contrato</h4>
                    <p style="margin: 0; font-size: 14px; color: var(--color-texto);">Acuerdo de voluntades</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: var(--color-fondo); border-radius: 12px;">
                    <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; margin: 0 auto 15px;">
                        2
                    </div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">Pago del Precio</h4>
                    <p style="margin: 0; font-size: 14px; color: var(--color-texto);">Liquidación total</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: var(--color-fondo); border-radius: 12px;">
                    <div style="width: 60px; height: 60px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; margin: 0 auto 15px;">
                        3
                    </div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">Escrituración</h4>
                    <p style="margin: 0; font-size: 14px; color: var(--color-texto);">Ante Notario Público</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: var(--color-fondo); border-radius: 12px;">
                    <div style="width: 60px; height: 60px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; margin: 0 auto 15px;">
                        4
                    </div>
                    <h4 style="margin: 0 0 5px 0; color: var(--color-primario);">Registro</h4>
                    <p style="margin: 0; font-size: 14px; color: var(--color-texto);">Inscripción en RPP</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="section-icon">⚠️</div>
                <h2 class="section-title">Obligaciones y Garantías</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="info-card" style="background: #fef2f2; border-left-color: #ef4444;">
                    <h4 style="margin: 0 0 10px 0;">🏠 Del Vendedor</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        <li>Entregar la posesión física y jurídica</li>
                        <li>Saneamiento para el caso de evicción</li>
                        <li>Responder por vicios ocultos</li>
                    </ul>
                </div>
                
                <div class="info-card" style="background: #f0fdf4; border-left-color: #22c55e;">
                    <h4 style="margin: 0 0 10px 0;">💰 Del Comprador</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        <li>Pagar el precio convenido</li>
                        <li>Recibir el bien objeto del contrato</li>
                        <li>Cubrir gastos de escrituración</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.vendedor.toUpperCase()}</div>
                <div class="signature-role">EL VENDEDOR</div>
            </div>
            
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${datos.comprador.toUpperCase()}</div>
                <div class="signature-role">EL COMPRADOR</div>
            </div>
        </div>

        <div class="legal-footer">
            <p>Contrato celebrado de conformidad con los artículos aplicables del Código Civil</p>
        </div>
    </div>
    
    <img src="/LOGO-KLAW.gif" class="watermark-logo" alt="K-LAW" style="width: 180px; height: auto;">
</body>
</html>
    `;
  }
};

export { numeroALetras, fechaEnLetras };