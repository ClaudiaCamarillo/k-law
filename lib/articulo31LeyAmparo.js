// Funciones para implementar correctamente el artículo 31 de la Ley de Amparo

/**
 * Determina cuándo surte efectos una notificación según el artículo 31 de la Ley de Amparo
 * @param {string} tipoNotificacion - Tipo de notificación (personal, lista, oficio, electronica)
 * @param {string} parteRecurrente - Tipo de parte (autoridad, quejoso, tercero)
 * @param {boolean} esAutoridadTercero - Si el tercero interesado es autoridad
 * @returns {string} - Descripción de cuándo surte efectos
 */
export function getCuandoSurteEfectos(tipoNotificacion, parteRecurrente, esAutoridadTercero = false) {
  // Fracción III del artículo 31 - Notificaciones electrónicas (aplica a cualquier parte)
  if (tipoNotificacion === 'electronica') {
    return 'el mismo día en que se genera el acuse electrónico';
  }

  // Fracción I del artículo 31 - Autoridades responsables y notificaciones por oficio
  if (parteRecurrente === 'autoridad' || tipoNotificacion === 'oficio') {
    return 'el mismo día';
  }

  // Cuando un tercero interesado es autoridad (también aplica fracción I)
  if (parteRecurrente === 'tercero' && esAutoridadTercero) {
    return 'el mismo día';
  }

  // Fracción II del artículo 31 - Las demás partes (quejosos y terceros que no son autoridades)
  // Notificaciones personales o por lista
  if (tipoNotificacion === 'personal' || tipoNotificacion === 'lista') {
    return 'al siguiente día hábil';
  }

  // Notificación por oficio a partes que no son autoridades (poco común pero posible)
  if (tipoNotificacion === 'oficio') {
    return 'al siguiente día hábil';
  }

  // Por defecto (no debería llegar aquí)
  return 'al siguiente día hábil';
}

/**
 * Calcula la fecha en que surte efectos la notificación
 * @param {Date} fechaNotificacion - Fecha de la notificación
 * @param {string} tipoNotificacion - Tipo de notificación
 * @param {string} parteRecurrente - Tipo de parte
 * @param {boolean} esAutoridadTercero - Si el tercero interesado es autoridad
 * @param {Function} esDiaInhabil - Función para verificar si es día inhábil
 * @param {Function} siguienteDiaHabil - Función para obtener el siguiente día hábil
 * @param {string[]} diasAdicionales - Días inhábiles adicionales
 * @param {string} tipoUsuario - Tipo de usuario (litigante o servidor)
 * @returns {Date} - Fecha en que surte efectos
 */
export function calcularFechaSurteEfectos(
  fechaNotificacion, 
  tipoNotificacion, 
  parteRecurrente, 
  esAutoridadTercero,
  esDiaInhabil,
  siguienteDiaHabil,
  diasAdicionales,
  tipoUsuario
) {
  // Primero verificamos si la notificación se hizo en día inhábil
  // Si es así, se considera realizada el siguiente día hábil
  let fechaNotificacionAjustada = new Date(fechaNotificacion);
  
  if (esDiaInhabil(fechaNotificacionAjustada, diasAdicionales, tipoUsuario)) {
    fechaNotificacionAjustada = siguienteDiaHabil(fechaNotificacionAjustada, diasAdicionales, tipoUsuario);
  }

  // Ahora determinamos cuándo surte efectos según el artículo 31
  const cuandoSurte = getCuandoSurteEfectos(tipoNotificacion, parteRecurrente, esAutoridadTercero);
  
  let fechaSurte = new Date(fechaNotificacionAjustada);

  if (cuandoSurte === 'al siguiente día hábil') {
    // Fracción II - surte efectos al día siguiente hábil
    fechaSurte = siguienteDiaHabil(fechaSurte, diasAdicionales, tipoUsuario);
  }
  // Si es "el mismo día" o "el mismo día en que se genera el acuse electrónico", 
  // la fecha que surte efectos es la misma fecha de notificación ajustada

  return fechaSurte;
}

/**
 * Obtiene el fundamento legal para el surtimiento de efectos
 * @param {string} tipoNotificacion - Tipo de notificación
 * @param {string} parteRecurrente - Tipo de parte
 * @param {boolean} esAutoridadTercero - Si el tercero interesado es autoridad
 * @returns {string} - Fundamento legal
 */
export function getFundamentoSurtimientoEfectos(tipoNotificacion, parteRecurrente, esAutoridadTercero = false) {
  // Fracción III - Notificaciones electrónicas
  if (tipoNotificacion === 'electronica') {
    return 'artículo 31, fracción III, de la Ley de Amparo';
  }

  // Fracción I - Autoridades y notificaciones por oficio
  if (parteRecurrente === 'autoridad' || (parteRecurrente === 'tercero' && esAutoridadTercero) || tipoNotificacion === 'oficio') {
    return 'artículo 31, fracción I, de la Ley de Amparo';
  }

  // Fracción II - Las demás partes
  return 'artículo 31, fracción II, de la Ley de Amparo';
}

/**
 * Genera el texto explicativo sobre cuándo surte efectos la notificación
 * @param {string} tipoNotificacion - Tipo de notificación
 * @param {string} parteRecurrente - Tipo de parte
 * @param {boolean} esAutoridadTercero - Si el tercero interesado es autoridad
 * @returns {string} - Texto explicativo
 */
export function getTextoExplicativoSurtimientoEfectos(tipoNotificacion, parteRecurrente, esAutoridadTercero = false) {
  const fundamento = getFundamentoSurtimientoEfectos(tipoNotificacion, parteRecurrente, esAutoridadTercero);
  
  if (tipoNotificacion === 'electronica') {
    return `De conformidad con el ${fundamento}, las notificaciones electrónicas surten efectos el mismo día en que se genera el acuse electrónico, sin importar quién sea la parte.`;
  }

  if (parteRecurrente === 'autoridad' || (parteRecurrente === 'tercero' && esAutoridadTercero) || tipoNotificacion === 'oficio') {
    return `De conformidad con el ${fundamento}, las notificaciones ${tipoNotificacion === 'oficio' ? 'por oficio' : 'a las autoridades'} surten efectos el mismo día en que se practican.`;
  }

  return `De conformidad con el ${fundamento}, las notificaciones a las partes que no son autoridades surten efectos al día siguiente hábil de aquel en que se realizan.`;
}