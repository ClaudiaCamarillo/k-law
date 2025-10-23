import { NextResponse } from 'next/server'
import { legalDesignTemplates, createLegalDesignTemplate } from './legal-design-templates.js'

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
  
  // Miles
  if (numero >= 1000) {
    let miles = Math.floor(numero / 1000);
    if (miles === 1) {
      resultado = 'MIL ';
    } else {
      resultado = unidades[miles] + ' MIL ';
    }
    numero = numero % 1000;
  }
  
  // Centenas
  if (numero >= 100) {
    resultado += centenas[Math.floor(numero / 100)] + ' ';
    numero = numero % 100;
  }
  
  // Decenas y unidades
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

// Plantillas de documentos profesionales
const plantillas = {
  'Contrato de Arrendamiento': (datos) => {
    const montoEnLetras = numeroALetras(datos.renta);
    const fechaInicioLetras = fechaEnLetras(datos.fechaInicio);
    const fechaTermino = new Date(datos.fechaInicio);
    fechaTermino.setMonth(fechaTermino.getMonth() + parseInt(datos.duracion));
    const fechaTerminoLetras = fechaEnLetras(fechaTermino);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Arrendamiento</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .fecha {
            text-align: right;
            margin-bottom: 30px;
        }
        .declaracion {
            margin-bottom: 20px;
        }
        .clausula {
            margin-bottom: 15px;
        }
        .firma-section {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
        }
        .firma {
            text-align: center;
            width: 40%;
        }
        .firma-linea {
            border-top: 1px solid #000;
            margin-top: 60px;
            margin-bottom: 5px;
        }
        strong {
            font-weight: bold;
        }
        @media print {
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        CONTRATO DE ARRENDAMIENTO DE ${datos.tipoInmueble.toUpperCase()}
    </div>

    <div class="fecha">
        En la ciudad de México, a ${fechaInicioLetras}
    </div>

    <p>
        CONTRATO DE ARRENDAMIENTO QUE CELEBRAN POR UNA PARTE EL C. <strong>${datos.arrendador.toUpperCase()}</strong>, 
        A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ <strong>"EL ARRENDADOR"</strong>, Y POR 
        LA OTRA PARTE EL C. <strong>${datos.arrendatario.toUpperCase()}</strong>, A QUIEN SE LE DENOMINARÁ <strong>"EL ARRENDATARIO"</strong>, 
        AMBAS PARTES CON CAPACIDAD LEGAL PARA CONTRATAR Y OBLIGARSE, AL 
        TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:
    </p>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">DECLARACIONES</div>

    <div class="declaracion">
        <strong>I. DECLARA "EL ARRENDADOR":</strong><br><br>
        a) Ser legítimo propietario del inmueble tipo ${datos.tipoInmueble.toLowerCase()} ubicado en ${datos.inmueble}.<br><br>
        b) Que el inmueble objeto del presente contrato se encuentra en perfectas condiciones de uso y habitabilidad.<br><br>
        c) Que tiene plena capacidad legal para obligarse en los términos del presente contrato.<br><br>
        d) Que es su voluntad dar en arrendamiento el inmueble descrito en el inciso a) de esta declaración.
    </div>

    <div class="declaracion">
        <strong>II. DECLARA "EL ARRENDATARIO":</strong><br><br>
        a) Ser mayor de edad y tener plena capacidad legal para obligarse en los términos del presente contrato.<br><br>
        b) Que conoce las condiciones físicas en que se encuentra el inmueble materia de este contrato y que las mismas son de su entera satisfacción.<br><br>
        c) Que es su voluntad tomar en arrendamiento el inmueble objeto del presente contrato.<br><br>
        d) Que cuenta con los recursos económicos suficientes para cumplir con las obligaciones que contrae.
    </div>

    <div class="declaracion">
        <strong>III. DECLARAN AMBAS PARTES:</strong><br><br>
        Que es su libre voluntad celebrar el presente contrato, sin que medie error, dolo, violencia o cualquier otro vicio del consentimiento que pudiera invalidarlo.
    </div>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">CLÁUSULAS</div>

    <div class="clausula">
        <strong>PRIMERA.- OBJETO DEL CONTRATO.</strong> "EL ARRENDADOR" da en arrendamiento a "EL ARRENDATARIO" 
        el inmueble tipo ${datos.tipoInmueble.toLowerCase()} ubicado en ${datos.inmueble}, el cual se entrega 
        en perfectas condiciones de uso, con todos sus servicios funcionando correctamente.
    </div>

    <div class="clausula">
        <strong>SEGUNDA.- MONTO DE LA RENTA.</strong> "EL ARRENDATARIO" se obliga a pagar a "EL ARRENDADOR" 
        por concepto de renta mensual la cantidad de <strong>$${Number(datos.renta).toFixed(2)} 
        (${montoEnLetras} PESOS 00/100 M.N.)</strong>, cantidad que deberá ser cubierta por mensualidades adelantadas 
        dentro de los primeros cinco días de cada mes.
    </div>

    <div class="clausula">
        <strong>TERCERA.- PLAZO.</strong> El presente contrato tendrá una vigencia de <strong>${datos.duracion} 
        (${numeroALetras(datos.duracion)}) MESES</strong>, contados a partir del día ${fechaInicioLetras} 
        y concluyendo el día ${fechaTerminoLetras}, fecha en la cual "EL ARRENDATARIO" se obliga a 
        desocupar y entregar el inmueble objeto de este contrato.
    </div>

    <div class="clausula">
        <strong>CUARTA.- DEPÓSITO EN GARANTÍA.</strong> "EL ARRENDATARIO" entrega en este acto a 
        "EL ARRENDADOR" la cantidad equivalente a un mes de renta como depósito en garantía, 
        mismo que le será devuelto al término del contrato, siempre y cuando el inmueble sea 
        entregado en las mismas condiciones en que se recibe, salvo el deterioro normal por el uso.
    </div>

    <div class="clausula">
        <strong>QUINTA.- OBLIGACIONES DEL ARRENDATARIO.</strong> "EL ARRENDATARIO" se obliga a:<br><br>
        a) Pagar puntualmente la renta en la forma y términos convenidos.<br>
        b) Conservar el inmueble en el mismo estado en que lo recibe.<br>
        c) Dar aviso inmediato a "EL ARRENDADOR" de cualquier deterioro o desperfecto que sufra el inmueble.<br>
        d) No subarrendar ni ceder los derechos del presente contrato sin consentimiento por escrito de "EL ARRENDADOR".<br>
        e) Permitir a "EL ARRENDADOR" la inspección del inmueble cuando lo solicite.<br>
        f) Pagar los servicios de energía eléctrica, agua, gas y cualquier otro que consuma.<br>
        g) No realizar modificaciones al inmueble sin autorización por escrito.
    </div>

    <div class="clausula">
        <strong>SEXTA.- OBLIGACIONES DEL ARRENDADOR.</strong> "EL ARRENDADOR" se obliga a:<br><br>
        a) Entregar el inmueble en condiciones de uso y habitabilidad.<br>
        b) Mantener al arrendatario en el uso y goce pacífico del inmueble durante la vigencia del contrato.<br>
        c) Realizar las reparaciones necesarias para conservar el inmueble en estado de servir para el uso convenido.<br>
        d) No aumentar la renta durante la vigencia del presente contrato.
    </div>

    <div class="clausula">
        <strong>SÉPTIMA.- SERVICIOS.</strong> Los gastos por concepto de consumo de energía eléctrica, agua, 
        gas, teléfono, internet y cualquier otro servicio, serán por cuenta exclusiva de "EL ARRENDATARIO".
    </div>

    <div class="clausula">
        <strong>OCTAVA.- MEJORAS.</strong> Las mejoras o modificaciones que "EL ARRENDATARIO" desee realizar 
        al inmueble, deberán ser autorizadas previamente y por escrito por "EL ARRENDADOR", quedando en 
        beneficio del inmueble sin derecho a compensación alguna.
    </div>

    <div class="clausula">
        <strong>NOVENA.- TERMINACIÓN ANTICIPADA.</strong> En caso de que "EL ARRENDATARIO" desee dar por 
        terminado el presente contrato antes del plazo convenido, deberá notificarlo a "EL ARRENDADOR" 
        con treinta días de anticipación y cubrir una penalización equivalente a un mes de renta.
    </div>

    <div class="clausula">
        <strong>DÉCIMA.- CAUSAS DE RESCISIÓN.</strong> Serán causas de rescisión del presente contrato:<br><br>
        a) La falta de pago de dos o más mensualidades de renta.<br>
        b) El subarrendamiento total o parcial del inmueble sin consentimiento.<br>
        c) Destinar el inmueble a un uso distinto al convenido.<br>
        d) La realización de actos que causen deterioro grave al inmueble.<br>
        e) El incumplimiento de cualquiera de las obligaciones establecidas en este contrato.
    </div>

    <div class="clausula">
        <strong>DÉCIMA PRIMERA.- ENTREGA DEL INMUEBLE.</strong> Al término del presente contrato, 
        "EL ARRENDATARIO" se obliga a entregar el inmueble en las mismas condiciones en que lo recibió, 
        salvo el deterioro normal por el uso, completamente desocupado y con los servicios al corriente.
    </div>

    <div class="clausula">
        <strong>DÉCIMA SEGUNDA.- DOMICILIOS.</strong> Las partes señalan como sus domicilios para 
        oír y recibir notificaciones los siguientes:<br><br>
        "EL ARRENDADOR": ${datos.inmueble}<br>
        "EL ARRENDATARIO": ${datos.inmueble}
    </div>

    <div class="clausula">
        <strong>DÉCIMA TERCERA.- JURISDICCIÓN.</strong> Para la interpretación y cumplimiento del presente 
        contrato, las partes se someten expresamente a la jurisdicción de los tribunales competentes de 
        esta ciudad, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su 
        domicilio presente o futuro.
    </div>

    <p style="margin-top: 40px;">
        Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, 
        lo firman de conformidad en dos ejemplares originales, quedando uno en poder de cada parte.
    </p>

    <div class="firma-section">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL ARRENDADOR"</strong><br>
            ${datos.arrendador.toUpperCase()}
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL ARRENDATARIO"</strong><br>
            ${datos.arrendatario.toUpperCase()}
        </div>
    </div>
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
    `;
  },

  'Demanda de Amparo Indirecto': (datos) => {
    const fechaNotificacion = fechaEnLetras(datos.fechaNotificacion);
    const fechaHoy = fechaEnLetras(new Date());
    const año = new Date().getFullYear();
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demanda de Amparo Indirecto</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm 3cm 2.5cm 3cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 2;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .expediente {
            text-align: right;
            font-weight: bold;
            margin-bottom: 20px;
            font-size: 11pt;
        }
        .juzgado {
            text-align: left;
            margin-bottom: 15px;
            font-size: 11pt;
            line-height: 1.5;
        }
        .destinatario {
            margin-bottom: 25px;
            font-weight: bold;
            line-height: 1.5;
        }
        .asunto {
            text-align: right;
            margin-bottom: 30px;
            font-weight: bold;
            text-decoration: underline;
        }
        p {
            margin-bottom: 20px;
            text-indent: 60px;
        }
        .sin-sangria {
            text-indent: 0;
        }
        .concepto {
            margin-bottom: 25px;
        }
        .concepto-titulo {
            font-weight: bold;
            text-align: center;
            margin: 30px 0 20px 0;
            text-decoration: underline;
        }
        .petitorios {
            margin-top: 40px;
        }
        .petitorios p {
            text-indent: 0;
            margin-left: 60px;
        }
        .firma {
            text-align: center;
            margin-top: 100px;
        }
        .firma-linea {
            border-top: 1px solid #000;
            width: 350px;
            margin: 80px auto 5px;
        }
        .fundamentos {
            margin: 30px 0;
        }
        strong {
            font-weight: bold;
        }
        .datos-profesionales {
            margin-top: 40px;
            font-size: 11pt;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="expediente">
        JUICIO DE AMPARO INDIRECTO<br>
        EXPEDIENTE: _____/${año}
    </div>

    <div class="juzgado">
        JUZGADO _____ DE DISTRITO EN MATERIA<br>
        DE AMPARO Y JUICIOS FEDERALES EN EL<br>
        ESTADO DE MÉXICO
    </div>

    <div class="destinatario">
        C. JUEZ DE DISTRITO EN MATERIA DE AMPARO<br>
        Y JUICIOS FEDERALES EN TURNO EN EL<br>
        ESTADO DE MÉXICO<br>
        P R E S E N T E
    </div>

    <div class="asunto">
        ASUNTO: SE PROMUEVE JUICIO DE<br>
        AMPARO INDIRECTO.
    </div>

    <p>
        <strong>${datos.promovente.toUpperCase()}</strong>, por mi propio derecho, mexicano(a), mayor de edad, 
        con capacidad legal para comparecer en juicio, señalando como domicilio para oír y recibir toda clase 
        de notificaciones y documentos el ubicado en <strong>${datos.inmueble || 'CALLE ___, NÚMERO ___, COLONIA ___, C.P. _____, EN ESTA CIUDAD'}</strong>, 
        autorizando en términos amplios del artículo 12 de la Ley de Amparo a los CC. Licenciados en Derecho 
        _________________ y _________________, con cédulas profesionales números _________ y _________ 
        respectivamente, así como a los CC. _________________ y _________________, ante Usted con el debido 
        respeto comparezco para exponer:
    </p>

    <p>
        Que por medio del presente escrito, con fundamento en lo dispuesto por los artículos 1°, 14, 16, 17, 
        103, fracción I, y 107 de la Constitución Política de los Estados Unidos Mexicanos; 1°, fracción I, 
        2°, 5°, fracción I, 6°, 17, 18, 19, 20, 21, 61, fracción XXIII, 107, 108, 110, 111, 112, 113, 114, 
        115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 138, 139, 140, 
        141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155 y demás relativos y aplicables 
        de la Ley de Amparo, vengo en tiempo y forma a promover <strong>JUICIO DE AMPARO INDIRECTO</strong>, 
        contra los actos de las autoridades que más adelante preciso, al tenor de los siguientes:
    </p>

    <div class="concepto-titulo">CAPÍTULO DE PROCEDENCIA</div>

    <div class="concepto-titulo">I.- NOMBRE Y DOMICILIO DE LA PARTE QUEJOSA</div>
    <p class="sin-sangria">
        La suscrita <strong>${datos.promovente.toUpperCase()}</strong>, con domicilio procesal señalado en el 
        proemio del presente escrito.
    </p>

    <div class="concepto-titulo">II.- AUTORIDADES RESPONSABLES</div>
    <p class="sin-sangria">
        Señalo como autoridad responsable a:
    </p>
    <p class="sin-sangria" style="margin-left: 60px;">
        <strong>A) ORDENADORA:</strong><br>
        <strong>${datos.autoridadResponsable.toUpperCase()}</strong>, con domicilio ampliamente conocido en esta ciudad.
    </p>
    <p class="sin-sangria" style="margin-left: 60px;">
        <strong>B) EJECUTORAS:</strong><br>
        Las que resulten responsables de la ejecución del acto reclamado.
    </p>

    <div class="concepto-titulo">III.- NORMA GENERAL, ACTO U OMISIÓN QUE SE RECLAMA</div>
    <p class="sin-sangria">
        De las autoridades señaladas como responsables, reclamo los siguientes actos:
    </p>
    <p style="margin-left: 60px;">
        <strong>DE LA AUTORIDAD ORDENADORA:</strong> ${datos.actoReclamado}
    </p>
    <p style="margin-left: 60px;">
        <strong>DE LAS AUTORIDADES EJECUTORAS:</strong> La ejecución material del acto reclamado, así como todas 
        las consecuencias que de hecho y por derecho se deriven o puedan derivarse directa o indirectamente del mismo.
    </p>
    <p>
        Es importante señalar que el acto reclamado me fue notificado el día <strong>${fechaNotificacion}</strong>, 
        por lo que el presente juicio de amparo se promueve dentro del término de quince días hábiles que establece 
        el artículo 17 de la Ley de Amparo, tomando en consideración que se descuentan del cómputo los días sábados 
        y domingos, así como los días inhábiles que determine el Consejo de la Judicatura Federal.
    </p>

    <div class="concepto-titulo">IV.- BAJO PROTESTA DE DECIR VERDAD, MANIFESTACIÓN DE LOS HECHOS O ABSTENCIONES 
    QUE CONSTITUYEN LOS ANTECEDENTES DEL ACTO RECLAMADO</div>
    <p>
        Bajo protesta de decir verdad, manifiesto a Su Señoría que los hechos y antecedentes del caso son los siguientes:
    </p>
    ${datos.argumentos.split('\n').map((parrafo, index) => `
    <p>
        <strong>${index + 1}.-</strong> ${parrafo}
    </p>
    `).join('')}

    <div class="concepto-titulo">V.- PRECEPTOS CONSTITUCIONALES Y CONVENCIONALES QUE CONTIENEN LOS DERECHOS 
    HUMANOS Y LAS GARANTÍAS CUYA VIOLACIÓN SE RECLAMA</div>
    <p>
        Se estiman violados en mi perjuicio los derechos humanos y garantías contenidos en los artículos:
    </p>
    <p style="margin-left: 60px;">
        ${datos.derechosViolados}
    </p>
    <p>
        Así como los derechos humanos contenidos en los tratados internacionales de los que el Estado Mexicano 
        es parte, específicamente la Convención Americana sobre Derechos Humanos y el Pacto Internacional de 
        Derechos Civiles y Políticos.
    </p>

    <div class="concepto-titulo">CAPÍTULO DE SUSPENSIÓN</div>
    <p>
        Con fundamento en los artículos 125, 126, 127, 128, 129, 130, 131, 138, 139, 140, 141, 142, 143, 144, 
        145, 146, 147, 148, 149, 150, 151, 152, 153, 154 y 155 de la Ley de Amparo, solicito se decrete la 
        SUSPENSIÓN PROVISIONAL y en su momento la DEFINITIVA del acto reclamado, para el efecto de que las 
        cosas se mantengan en el estado que actualmente guardan y no se ejecute en mi perjuicio el acto reclamado.
    </p>

    <div class="concepto-titulo">CAPÍTULO DE CONCEPTOS DE VIOLACIÓN</div>
    
    <div class="concepto">
        <p><strong>PRIMERO.- VIOLACIÓN A LOS PRINCIPIOS DE LEGALIDAD Y SEGURIDAD JURÍDICA.</strong> 
        El acto reclamado viola en mi perjuicio los derechos humanos de legalidad y seguridad jurídica 
        consagrados en los artículos 14 y 16 de la Constitución Política de los Estados Unidos Mexicanos, 
        en relación con el artículo 8 de la Convención Americana sobre Derechos Humanos.</p>
        
        <p>Lo anterior es así, toda vez que la autoridad responsable emitió el acto reclamado sin fundar ni 
        motivar debidamente su determinación, vulnerando con ello el principio de legalidad que debe regir 
        todo acto de autoridad. En efecto, el artículo 16 constitucional, en su primer párrafo establece:</p>

        <p style="margin-left: 60px; font-style: italic;">
        "Nadie puede ser molestado en su persona, familia, domicilio, papeles o posesiones, sino en virtud 
        de mandamiento escrito de la autoridad competente, que funde y motive la causa legal del procedimiento..."
        </p>

        <p>En el caso concreto, la autoridad responsable fue omisa en cumplir con este mandato constitucional, 
        pues no expresó con claridad y precisión los preceptos legales aplicables al caso concreto, ni tampoco 
        expuso las razones particulares o causas inmediatas que tomó en consideración para la emisión del acto.</p>
    </div>

    <div class="concepto">
        <p><strong>SEGUNDO.- VIOLACIÓN AL PRINCIPIO DE AUDIENCIA Y DEBIDO PROCESO.</strong> 
        Se transgrede en mi perjuicio la garantía de audiencia consagrada en el artículo 14 constitucional, 
        segundo párrafo, que a la letra dice:</p>

        <p style="margin-left: 60px; font-style: italic;">
        "Nadie podrá ser privado de la libertad o de sus propiedades, posesiones o derechos, sino mediante 
        juicio seguido ante los tribunales previamente establecidos, en el que se cumplan las formalidades 
        esenciales del procedimiento y conforme a las Leyes expedidas con anterioridad al hecho."
        </p>

        <p>La autoridad responsable violó esta garantía fundamental al no otorgarme la oportunidad de ser oído 
        y vencido en juicio previo a la emisión del acto reclamado, privándome así de la posibilidad de 
        ofrecer pruebas y alegar lo que a mi derecho conviniera.</p>
    </div>

    <div class="concepto">
        <p><strong>TERCERO.- INCOMPETENCIA DE LA AUTORIDAD RESPONSABLE.</strong> 
        La autoridad señalada como responsable carece de competencia legal para emitir el acto reclamado, 
        violando con ello lo dispuesto por el artículo 16 de la Constitución Federal, que exige que todo 
        acto de molestia provenga de autoridad competente.</p>
    </div>

    <div class="petitorios">
        <div class="concepto-titulo">P U N T O S   P E T I T O R I O S</div>
        
        <p><strong>PRIMERO.-</strong> Se me tenga por presentada en tiempo y forma legal, promoviendo juicio de 
        amparo indirecto en contra de las autoridades y por los actos que han quedado precisados en el cuerpo 
        de esta demanda.</p>
        
        <p><strong>SEGUNDO.-</strong> Se me tenga por señalado domicilio para oír y recibir notificaciones y por 
        autorizadas a las personas indicadas en el proemio de este escrito.</p>
        
        <p><strong>TERCERO.-</strong> Se admita a trámite la presente demanda de amparo y se ordene formar y 
        registrar el expediente respectivo.</p>
        
        <p><strong>CUARTO.-</strong> Se requiera a las autoridades responsables para que rindan su informe 
        justificado dentro del término de ley.</p>
        
        <p><strong>QUINTO.-</strong> Se decrete la SUSPENSIÓN PROVISIONAL del acto reclamado y, seguidos los 
        trámites de ley, se conceda la SUSPENSIÓN DEFINITIVA.</p>
        
        <p><strong>SEXTO.-</strong> En su oportunidad, previos los trámites de ley, se dicte sentencia en la 
        que se me conceda el AMPARO Y PROTECCIÓN DE LA JUSTICIA FEDERAL.</p>
    </div>

    <div class="firma">
        <p><strong>PROTESTO LO NECESARIO</strong></p>
        <p style="margin-bottom: 10px;">En la Ciudad de México, a ${fechaHoy}.</p>
        <div class="firma-linea"></div>
        <strong>${datos.promovente.toUpperCase()}</strong>
    </div>

    <div class="datos-profesionales">
        <p class="sin-sangria">
            <strong>AUTORIZADOS EN TÉRMINOS DEL ARTÍCULO 12 DE LA LEY DE AMPARO:</strong><br>
            LIC. ___________________________ CÉD. PROF. __________<br>
            LIC. ___________________________ CÉD. PROF. __________
        </p>
    </div>
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
    `;
  },

  'Contrato de Servicios': (datos) => {
    const honorariosEnLetras = numeroALetras(datos.honorarios);
    const fechaHoy = fechaEnLetras(new Date());
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestación de Servicios Profesionales</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .fecha {
            text-align: right;
            margin-bottom: 30px;
        }
        .clausula {
            margin-bottom: 15px;
        }
        .firma-section {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
        }
        .firma {
            text-align: center;
            width: 40%;
        }
        .firma-linea {
            border-top: 1px solid #000;
            margin-top: 60px;
            margin-bottom: 5px;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES
    </div>

    <div class="fecha">
        ${fechaHoy}
    </div>

    <p>
        CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES QUE CELEBRAN POR UNA PARTE 
        <strong>${datos.prestador.toUpperCase()}</strong>, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ 
        <strong>"EL PRESTADOR"</strong>, Y POR LA OTRA <strong>${datos.cliente.toUpperCase()}</strong>, 
        A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ <strong>"EL CLIENTE"</strong>, AL TENOR DE LAS 
        SIGUIENTES DECLARACIONES Y CLÁUSULAS:
    </p>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">DECLARACIONES</div>

    <p><strong>I. DECLARA "EL PRESTADOR":</strong></p>
    <p>a) Ser una persona física con actividad empresarial, con capacidad legal para obligarse en los términos del presente contrato.</p>
    <p>b) Que cuenta con los conocimientos, experiencia y recursos necesarios para prestar los servicios objeto del presente contrato.</p>
    <p>c) Que está dado de alta ante el Servicio de Administración Tributaria y al corriente en sus obligaciones fiscales.</p>

    <p><strong>II. DECLARA "EL CLIENTE":</strong></p>
    <p>a) Ser una persona física/moral con plena capacidad legal para contratar y obligarse.</p>
    <p>b) Que requiere de los servicios profesionales de "EL PRESTADOR".</p>
    <p>c) Que cuenta con los recursos económicos suficientes para cubrir los honorarios pactados.</p>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">CLÁUSULAS</div>

    <div class="clausula">
        <strong>PRIMERA.- OBJETO.</strong> "EL PRESTADOR" se obliga a proporcionar a "EL CLIENTE" 
        los siguientes servicios profesionales: ${datos.servicios}
    </div>

    <div class="clausula">
        <strong>SEGUNDA.- HONORARIOS.</strong> "EL CLIENTE" pagará a "EL PRESTADOR" por concepto de 
        honorarios profesionales la cantidad de <strong>$${Number(datos.honorarios).toFixed(2)} 
        (${honorariosEnLetras} PESOS 00/100 M.N.)</strong> más el Impuesto al Valor Agregado correspondiente.
    </div>

    <div class="clausula">
        <strong>TERCERA.- FORMA DE PAGO.</strong> Los honorarios serán pagados de la siguiente manera: 
        <strong>${datos.formaPago}</strong>. "EL PRESTADOR" expedirá el comprobante fiscal correspondiente 
        por cada pago que reciba.
    </div>

    <div class="clausula">
        <strong>CUARTA.- VIGENCIA.</strong> El presente contrato tendrá una duración de <strong>${datos.duracion}</strong>, 
        contados a partir de la firma del presente instrumento, pudiendo prorrogarse por acuerdo expreso de las partes.
    </div>

    <div class="clausula">
        <strong>QUINTA.- OBLIGACIONES DEL PRESTADOR.</strong> "EL PRESTADOR" se obliga a:<br>
        a) Prestar los servicios con la diligencia, eficiencia y cuidado apropiados.<br>
        b) Guardar estricta confidencialidad sobre la información de "EL CLIENTE".<br>
        c) Informar periódicamente sobre el avance de los servicios.<br>
        d) Entregar los trabajos en los plazos acordados.
    </div>

    <div class="clausula">
        <strong>SEXTA.- OBLIGACIONES DEL CLIENTE.</strong> "EL CLIENTE" se obliga a:<br>
        a) Pagar puntualmente los honorarios pactados.<br>
        b) Proporcionar la información necesaria para la prestación de los servicios.<br>
        c) Otorgar las facilidades necesarias para el desarrollo de los servicios.
    </div>

    <div class="clausula">
        <strong>SÉPTIMA.- CONFIDENCIALIDAD.</strong> "EL PRESTADOR" se obliga a mantener en estricta 
        confidencialidad toda la información que le sea proporcionada por "EL CLIENTE", obligación que 
        subsistirá aún después de terminado el presente contrato.
    </div>

    <div class="clausula">
        <strong>OCTAVA.- PROPIEDAD INTELECTUAL.</strong> Los derechos de propiedad intelectual que se 
        generen con motivo de la prestación de los servicios serán propiedad de "EL CLIENTE".
    </div>

    <div class="clausula">
        <strong>NOVENA.- RELACIÓN LABORAL.</strong> Las partes convienen que "EL PRESTADOR" no tendrá 
        relación laboral alguna con "EL CLIENTE", por lo que no tendrá derecho a prestaciones laborales.
    </div>

    <div class="clausula">
        <strong>DÉCIMA.- RESCISIÓN.</strong> Serán causas de rescisión del presente contrato el 
        incumplimiento de cualquiera de las obligaciones establecidas en el mismo.
    </div>

    <div class="clausula">
        <strong>DÉCIMA PRIMERA.- JURISDICCIÓN.</strong> Para la interpretación y cumplimiento del presente 
        contrato, las partes se someten a la jurisdicción de los tribunales competentes de esta ciudad.
    </div>

    <p style="margin-top: 40px;">
        Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, 
        lo firman de conformidad por duplicado.
    </p>

    <div class="firma-section">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL PRESTADOR"</strong><br>
            ${datos.prestador.toUpperCase()}
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL CLIENTE"</strong><br>
            ${datos.cliente.toUpperCase()}
        </div>
    </div>
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
    `;
  },

  'Contrato de Compraventa': (datos) => {
    const precioEnLetras = numeroALetras(datos.precio);
    const fechaHoy = fechaEnLetras(new Date());
    const fechaEntrega = fechaEnLetras(datos.fechaEntrega);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Compraventa</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .fecha {
            text-align: right;
            margin-bottom: 30px;
        }
        .clausula {
            margin-bottom: 15px;
        }
        .firma-section {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
        }
        .firma {
            text-align: center;
            width: 40%;
        }
        .firma-linea {
            border-top: 1px solid #000;
            margin-top: 60px;
            margin-bottom: 5px;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        CONTRATO DE COMPRAVENTA
    </div>

    <div class="fecha">
        ${fechaHoy}
    </div>

    <p>
        CONTRATO DE COMPRAVENTA QUE CELEBRAN POR UNA PARTE <strong>${datos.vendedor.toUpperCase()}</strong>, 
        A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ <strong>"EL VENDEDOR"</strong>, Y POR LA OTRA 
        <strong>${datos.comprador.toUpperCase()}</strong>, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ 
        <strong>"EL COMPRADOR"</strong>, AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:
    </p>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">DECLARACIONES</div>

    <p><strong>I. DECLARA "EL VENDEDOR":</strong></p>
    <p>a) Ser legítimo propietario del bien objeto de este contrato.</p>
    <p>b) Que el bien se encuentra libre de gravámenes, limitaciones o cargas.</p>
    <p>c) Que tiene plena capacidad legal para enajenar el bien materia de este contrato.</p>

    <p><strong>II. DECLARA "EL COMPRADOR":</strong></p>
    <p>a) Tener capacidad legal para adquirir el bien objeto de este contrato.</p>
    <p>b) Que conoce las características y condiciones del bien que adquiere.</p>
    <p>c) Que cuenta con los recursos económicos necesarios para el pago del precio pactado.</p>

    <div class="header" style="font-size: 12pt; margin-top: 30px;">CLÁUSULAS</div>

    <div class="clausula">
        <strong>PRIMERA.- OBJETO.</strong> "EL VENDEDOR" vende y "EL COMPRADOR" adquiere el siguiente bien: 
        ${datos.bien}
    </div>

    <div class="clausula">
        <strong>SEGUNDA.- PRECIO.</strong> El precio de la compraventa es la cantidad de 
        <strong>$${Number(datos.precio).toFixed(2)} (${precioEnLetras} PESOS 00/100 M.N.)</strong>, 
        cantidad que "EL COMPRADOR" pagará a "EL VENDEDOR" en la forma establecida en la siguiente cláusula.
    </div>

    <div class="clausula">
        <strong>TERCERA.- FORMA DE PAGO.</strong> El precio será pagado de la siguiente manera: 
        <strong>${datos.formaPago}</strong>.
    </div>

    <div class="clausula">
        <strong>CUARTA.- ENTREGA.</strong> "EL VENDEDOR" se obliga a entregar el bien objeto de este 
        contrato el día <strong>${fechaEntrega}</strong>, en el domicilio señalado por "EL COMPRADOR".
    </div>

    <div class="clausula">
        <strong>QUINTA.- SANEAMIENTO.</strong> "EL VENDEDOR" se obliga al saneamiento para el caso de 
        evicción del bien materia de este contrato, en los términos establecidos por la ley.
    </div>

    <div class="clausula">
        <strong>SEXTA.- GASTOS.</strong> Los gastos que se originen con motivo de la celebración del 
        presente contrato serán cubiertos por ambas partes en partes iguales.
    </div>

    <div class="clausula">
        <strong>SÉPTIMA.- VICIOS OCULTOS.</strong> "EL VENDEDOR" responde por los vicios ocultos del 
        bien objeto de la compraventa, aunque los ignorase, en los términos de ley.
    </div>

    <div class="clausula">
        <strong>OCTAVA.- TRANSMISIÓN DE PROPIEDAD.</strong> La propiedad del bien se transmitirá a 
        "EL COMPRADOR" al momento del pago total del precio pactado.
    </div>

    <div class="clausula">
        <strong>NOVENA.- JURISDICCIÓN.</strong> Para todo lo relativo a la interpretación y cumplimiento 
        del presente contrato, las partes se someten a la jurisdicción de los tribunales competentes.
    </div>

    <p style="margin-top: 40px;">
        Enteradas las partes del contenido y alcance legal del presente contrato, lo firman de 
        conformidad por duplicado.
    </p>

    <div class="firma-section">
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL VENDEDOR"</strong><br>
            ${datos.vendedor.toUpperCase()}
        </div>
        <div class="firma">
            <div class="firma-linea"></div>
            <strong>"EL COMPRADOR"</strong><br>
            ${datos.comprador.toUpperCase()}
        </div>
    </div>
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
    `;
  },

  'Demanda de Amparo Directo': (datos) => {
    const fechaHoy = fechaEnLetras(new Date());
    const año = new Date().getFullYear();
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demanda de Amparo Directo</title>
    <style>
        @page {
            size: letter;
            margin: 2.5cm 3cm 2.5cm 3cm;
        }
        @media print {
            img[alt="K-LAW"] {
                position: fixed !important;
                bottom: 30px !important;
                right: 30px !important;
                opacity: 0.15 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 2;
            text-align: justify;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .encabezado {
            text-align: center;
            font-weight: bold;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        .expediente {
            text-align: right;
            margin-bottom: 20px;
            font-size: 11pt;
            line-height: 1.5;
        }
        .destinatario {
            margin-bottom: 25px;
            font-weight: bold;
            line-height: 1.5;
        }
        .asunto {
            text-align: right;
            margin-bottom: 30px;
            font-weight: bold;
            text-decoration: underline;
            line-height: 1.5;
        }
        p {
            margin-bottom: 20px;
            text-indent: 60px;
        }
        .sin-sangria {
            text-indent: 0;
        }
        .concepto {
            margin-bottom: 25px;
        }
        .concepto-titulo {
            font-weight: bold;
            text-align: center;
            margin: 35px 0 25px 0;
            text-decoration: underline;
        }
        .petitorios {
            margin-top: 40px;
        }
        .petitorios p {
            text-indent: 0;
            margin-left: 60px;
        }
        .firma {
            text-align: center;
            margin-top: 100px;
        }
        .firma-linea {
            border-top: 1px solid #000;
            width: 350px;
            margin: 80px auto 5px;
        }
        strong {
            font-weight: bold;
        }
        .cita-legal {
            margin-left: 60px;
            font-style: italic;
            margin-bottom: 20px;
        }
        .datos-profesionales {
            margin-top: 40px;
            font-size: 11pt;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="encabezado">
        DEMANDA DE AMPARO DIRECTO
    </div>

    <div class="expediente">
        <strong>JUICIO DE AMPARO DIRECTO</strong><br>
        <strong>EXPEDIENTE:</strong> ${datos.sentencia}<br>
        <strong>QUEJOSO:</strong> ${datos.quejoso.toUpperCase()}<br>
        <strong>TERCERO INTERESADO:</strong> _____________
    </div>

    <div class="destinatario">
        H. ${datos.tribunal.toUpperCase()}<br>
        P R E S E N T E
    </div>

    <div class="asunto">
        ASUNTO: SE INTERPONE DEMANDA<br>
        DE AMPARO DIRECTO.
    </div>

    <p>
        <strong>${datos.quejoso.toUpperCase()}</strong>, por mi propio derecho, con la personalidad que tengo 
        debidamente reconocida y acreditada en los autos del expediente número <strong>${datos.sentencia}</strong>, 
        del índice de ese H. Tribunal, señalando como domicilio para oír y recibir notificaciones el ubicado en 
        _________________________________, autorizando para tales efectos, así como para imponerse de los autos, 
        en los términos más amplios del artículo 12 de la Ley de Amparo, a los CC. Licenciados en Derecho 
        _________________________ y _________________________, con cédulas profesionales números _________ y 
        _________ respectivamente, expedidas por la Dirección General de Profesiones de la Secretaría de Educación 
        Pública, así como a los CC. _________________________ y _________________________, ante Usted con el 
        debido respeto comparezco para exponer:
    </p>

    <p>
        Que por medio del presente escrito, con fundamento en lo dispuesto por los artículos 103, fracción I, 
        y 107, fracciones III, inciso a), y V, de la Constitución Política de los Estados Unidos Mexicanos; 
        170, fracción I, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 
        187, 188, 189, 190 y demás relativos y aplicables de la Ley de Amparo, vengo en tiempo y forma a 
        interponer <strong>DEMANDA DE AMPARO DIRECTO</strong> en contra de:
    </p>

    <div class="concepto-titulo">AUTORIDAD RESPONSABLE</div>
    <p class="sin-sangria" style="margin-left: 60px;">
        <strong>${datos.tribunal.toUpperCase()}</strong>, con domicilio ampliamente conocido.
    </p>

    <div class="concepto-titulo">ACTO RECLAMADO</div>
    <p class="sin-sangria" style="margin-left: 60px;">
        La sentencia definitiva de fecha _____________, dictada por la autoridad responsable dentro del 
        expediente número <strong>${datos.sentencia}</strong>, mediante la cual se resolvió en forma 
        desfavorable a mis intereses el juicio _________________ promovido por el suscrito.
    </p>

    <div class="concepto-titulo">FECHA DE NOTIFICACIÓN</div>
    <p>
        La resolución que constituye el acto reclamado me fue notificada el día _____________, por lo que 
        el presente juicio de amparo se promueve dentro del término de quince días que establece el artículo 
        17 de la Ley de Amparo.
    </p>

    <div class="concepto-titulo">TERCERO INTERESADO</div>
    <p class="sin-sangria" style="margin-left: 60px;">
        Señalo como tercero interesado a _________________________________, con domicilio en 
        _________________________________.
    </p>

    <div class="concepto-titulo">PRECEPTOS CONSTITUCIONALES VIOLADOS</div>
    <p>
        Se estiman violados en mi perjuicio los artículos 1°, 14, 16 y 17 de la Constitución Política de 
        los Estados Unidos Mexicanos, así como los artículos 8 y 25 de la Convención Americana sobre Derechos 
        Humanos, y 14 del Pacto Internacional de Derechos Civiles y Políticos.
    </p>

    <div class="concepto-titulo">CONCEPTOS DE VIOLACIÓN</div>
    
    ${datos.conceptosViolacion.split('\n').map((concepto, index) => {
        const numerales = ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO'];
        return `
    <div class="concepto">
        <p><strong>${numerales[index] || `${index + 1}°`}.- VIOLACIÓN A LAS GARANTÍAS DE LEGALIDAD Y SEGURIDAD JURÍDICA.</strong></p>
        
        <p>${concepto}</p>
        
        <p>La autoridad responsable viola en mi perjuicio las garantías de legalidad y seguridad jurídica 
        consagradas en los artículos 14 y 16 constitucionales, toda vez que la sentencia reclamada carece 
        de la debida fundamentación y motivación, además de que se realizó una incorrecta valoración de las 
        pruebas ofrecidas y una indebida aplicación de la ley.</p>

        <p>En efecto, la Suprema Corte de Justicia de la Nación ha establecido en jurisprudencia firme que 
        toda resolución jurisdiccional debe estar debidamente fundada y motivada, entendiéndose por lo primero 
        que ha de expresarse con precisión el precepto legal aplicable al caso y por lo segundo que deben 
        señalarse con precisión las circunstancias especiales, razones particulares o causas inmediatas que 
        se hayan tenido en consideración para la emisión del acto.</p>

        <p>Sirve de apoyo a lo anterior la jurisprudencia emitida por el Pleno de la Suprema Corte de Justicia 
        de la Nación, visible en el Semanario Judicial de la Federación, que señala:</p>

        <p class="cita-legal">
        "FUNDAMENTACIÓN Y MOTIVACIÓN. De acuerdo con el artículo 16 de la Constitución Federal, todo acto 
        de autoridad debe estar adecuada y suficientemente fundado y motivado, entendiéndose por lo primero 
        que ha de expresarse con precisión el precepto legal aplicable al caso..."
        </p>
    </div>
    `;
    }).join('')}

    <div class="concepto">
        <p><strong>VIOLACIÓN AL PRINCIPIO DE EXHAUSTIVIDAD.</strong></p>
        
        <p>La sentencia reclamada viola el principio de exhaustividad que debe regir toda resolución judicial, 
        ya que la autoridad responsable fue omisa en analizar todos y cada uno de los argumentos y pruebas 
        que fueron planteados durante el juicio, lo que se traduce en una violación a mis garantías de 
        legalidad y seguridad jurídica.</p>
    </div>

    <div class="concepto">
        <p><strong>INCORRECTA VALORACIÓN DE PRUEBAS.</strong></p>
        
        <p>La autoridad responsable realizó una incorrecta valoración de las pruebas aportadas al juicio, 
        otorgándoles un alcance y valor probatorio que no les corresponde, además de que dejó de analizar 
        pruebas fundamentales para la resolución del asunto, violando con ello las reglas de la lógica y 
        de la sana crítica.</p>
    </div>

    <div class="petitorios">
        <div class="concepto-titulo">P U N T O S   P E T I T O R I O S</div>
        
        <p><strong>PRIMERO.-</strong> Se me tenga por presentado interponiendo DEMANDA DE AMPARO DIRECTO en 
        contra de la sentencia definitiva dictada por ese H. Tribunal.</p>
        
        <p><strong>SEGUNDO.-</strong> Se me tenga por señalado domicilio para oír y recibir notificaciones y 
        por autorizadas a las personas indicadas en el proemio de este escrito.</p>
        
        <p><strong>TERCERO.-</strong> Se admita a trámite la presente demanda de amparo directo, ordenándose 
        formar el cuaderno de antecedentes respectivo.</p>
        
        <p><strong>CUARTO.-</strong> Se ordene emplazar al tercero interesado para que comparezca a juicio 
        si a sus intereses conviene.</p>
        
        <p><strong>QUINTO.-</strong> Se rinda el informe justificado correspondiente y se remitan los autos 
        originales al Tribunal Colegiado de Circuito en Materia __________ que por turno corresponda.</p>
        
        <p><strong>SEXTO.-</strong> En su oportunidad, el Tribunal Colegiado de Circuito que conozca del 
        asunto dicte sentencia concediendo el AMPARO Y PROTECCIÓN DE LA JUSTICIA FEDERAL solicitados.</p>
    </div>

    <div class="firma">
        <p><strong>PROTESTO LO NECESARIO</strong></p>
        <p style="margin-bottom: 10px;">${fechaHoy}</p>
        <div class="firma-linea"></div>
        <strong>${datos.quejoso.toUpperCase()}</strong><br>
        <span style="font-size: 11pt;">QUEJOSO</span>
    </div>

    <div class="datos-profesionales">
        <p class="sin-sangria">
            <strong>AUTORIZADOS EN TÉRMINOS DEL ARTÍCULO 12 DE LA LEY DE AMPARO:</strong><br><br>
            _________________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_________________________________<br>
            LIC. _____________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LIC. _____________________<br>
            CÉD. PROF. __________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CÉD. PROF. __________
        </p>
    </div>
    <img src="/LOGO-KLAW.gif" alt="K-LAW" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 180px;
        height: auto;
        opacity: 0.15;
        z-index: 1000;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    ">
</body>
</html>
    `;
  }
};

export async function POST(req) {
  try {
    const { tipoDocumento, datos, legalDesign, config } = await req.json()

    if (!tipoDocumento || !datos) {
      return NextResponse.json(
        { error: 'Tipo de documento y datos son requeridos' },
        { status: 400 }
      )
    }

    let documentoGenerado;
    
    if (legalDesign) {
      // Usar plantilla de Legal Design con configuración personalizada
      documentoGenerado = createLegalDesignTemplate(tipoDocumento, datos, config)
      
      if (!documentoGenerado) {
        // Si no hay plantilla de Legal Design, usar la tradicional
        const plantilla = plantillas[tipoDocumento]
        if (!plantilla) {
          return NextResponse.json(
            { error: 'Tipo de documento no soportado' },
            { status: 400 }
          )
        }
        documentoGenerado = plantilla(datos)
      }
    } else {
      // Usar plantilla tradicional
      const plantilla = plantillas[tipoDocumento]
      if (!plantilla) {
        return NextResponse.json(
          { error: 'Tipo de documento no soportado' },
          { status: 400 }
        )
      }
      documentoGenerado = plantilla(datos)
    }

    return NextResponse.json({ 
      documento: documentoGenerado,
      success: true 
    })

  } catch (error) {
    console.error('Error al generar documento:', error)
    
    return NextResponse.json({ 
      error: 'Error al generar el documento',
      success: false
    }, { status: 500 })
  }
}