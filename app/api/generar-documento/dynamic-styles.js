// Función para generar estilos CSS dinámicos basados en la configuración
export function generateDynamicStyles(config) {
  const defaultColors = {
    primary: '#0A1628',
    secondary: '#C9A961',
    accent: '#16a34a',
    background: '#F5F5F5'
  }
  
  const colors = config?.colors || defaultColors
  const designStyle = config?.designStyle || 'moderno'
  
  // Estilos base comunes
  const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');
    
    :root {
      --color-primario: ${colors.primary};
      --color-secundario: ${colors.secondary};
      --color-acento: ${colors.accent};
      --color-fondo: ${colors.background};
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
  `
  
  // Estilos específicos según el estilo de diseño
  if (designStyle === 'conservador') {
    return baseStyles + `
      /* Estilo Conservador */
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 2;
      }
      
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding: 20px;
        border-bottom: 3px double var(--color-primario);
      }
      
      .doc-title {
        font-size: 18pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: var(--color-primario);
        margin: 20px 0;
      }
      
      .section {
        margin: 30px 0;
      }
      
      .section-title {
        font-size: 14pt;
        font-weight: bold;
        color: var(--color-primario);
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .clausula {
        margin: 20px 0;
        text-align: justify;
      }
      
      .clausula strong {
        color: var(--color-primario);
      }
      
      .firma-section {
        margin-top: 60px;
        display: flex;
        justify-content: space-around;
      }
      
      .firma-box {
        text-align: center;
        width: 40%;
      }
      
      .firma-line {
        border-bottom: 2px solid var(--color-primario);
        margin: 60px 0 10px 0;
      }
      
      .legal-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid var(--color-borde);
        text-align: center;
        font-size: 10pt;
        color: #6b7280;
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
      
      @media print {
        @page {
          margin: 2.5cm;
        }
        
        .watermark-logo {
          position: fixed !important;
          bottom: 30px !important;
          right: 30px !important;
          opacity: 0.15 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  }
  
  // Estilo Moderno (por defecto)
  return baseStyles + `
    /* Estilo Moderno */
    .header {
      background: linear-gradient(135deg, var(--color-primario) 0%, ${colors.primary}dd 100%);
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
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
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
      background: ${colors.secondary}20;
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
      background: ${colors.secondary}10;
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
    
    .amount-display {
      background: linear-gradient(135deg, var(--color-secundario) 0%, ${colors.secondary}dd 100%);
      color: var(--color-primario);
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      margin: 20px 0;
      position: relative;
      overflow: hidden;
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
      background: ${colors.secondary}10;
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
    
    .legal-footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid var(--color-borde);
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
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
    
    @media print {
      @page {
        margin: 2cm;
      }
      
      body {
        padding: 20px;
      }
      
      .header {
        background: var(--color-primario) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .party-card, .checklist-item {
        break-inside: avoid;
      }
      
      .watermark-logo {
        position: fixed !important;
        bottom: 30px !important;
        right: 30px !important;
        opacity: 0.15 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `
}

// Función para aplicar estilos específicos por industria
export function applyIndustryStyles(industry, baseStyles) {
  const industryModifications = {
    inmobiliaria: `
      .property-showcase {
        background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
        border: 3px solid #ea580c;
        padding: 30px;
        border-radius: 16px;
        margin: 20px 0;
      }
      
      .property-icon {
        color: #ea580c;
        font-size: 48px;
      }
    `,
    tech: `
      .tech-card {
        background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%);
        color: white;
        padding: 30px;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      }
      
      .tech-pattern {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0.1;
        font-size: 200px;
      }
      
      code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }
    `,
    servicios: `
      .service-timeline {
        position: relative;
        padding-left: 30px;
      }
      
      .service-timeline::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #2563eb;
      }
      
      .service-milestone {
        position: relative;
        margin-bottom: 30px;
      }
      
      .service-milestone::before {
        content: '';
        position: absolute;
        left: -25px;
        top: 5px;
        width: 12px;
        height: 12px;
        background: white;
        border: 3px solid #2563eb;
        border-radius: 50%;
      }
    `,
    salud: `
      .health-banner {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-left: 5px solid #10b981;
        padding: 20px;
        margin: 20px 0;
        border-radius: 0 12px 12px 0;
      }
      
      .health-icon {
        color: #059669;
        background: #d1fae5;
        padding: 10px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      
      .medical-info {
        background: white;
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
      }
    `
  }
  
  return baseStyles + (industryModifications[industry] || '')
}