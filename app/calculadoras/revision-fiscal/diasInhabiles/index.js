// Días inhábiles específicos para el Tribunal Federal de Justicia Administrativa
// Basado en los calendarios oficiales del TFJA

export const diasInhabilesTFJA = [
  // Días inhábiles constitucionales y legales que aplican siempre
  { año: 'todos', mes: 'todos', dia: 'sábados y domingos', fundamento: 'artículos 74 LFT, 19 Ley de Amparo', tipo: 'finDeSemana' },
  { año: 'todos', mes: 1, dia: 1, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Año Nuevo' },
  { año: 'todos', mes: 2, dia: 5, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Día de la Constitución' },
  { año: 'todos', mes: 3, dia: 21, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Natalicio de Benito Juárez' },
  { año: 'todos', mes: 5, dia: 1, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Día del Trabajo' },
  { año: 'todos', mes: 9, dia: 16, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Día de la Independencia' },
  { año: 'todos', mes: 11, dia: 20, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Revolución Mexicana' },
  { año: 'todos', mes: 12, dia: 25, fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Navidad' },
  // Días móviles que se trasladan al lunes (art. 74 LFT)
  { año: 'todos', mes: 'movil', dia: 'primer_lunes_febrero', fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Primer lunes de febrero en conmemoración del 5 de febrero', tipo: 'movil' },
  { año: 'todos', mes: 'movil', dia: 'tercer_lunes_marzo', fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Tercer lunes de marzo en conmemoración del 21 de marzo', tipo: 'movil' },
  { año: 'todos', mes: 'movil', dia: 'tercer_lunes_noviembre', fundamento: 'artículos 74 LFT, 19 Ley de Amparo', descripcion: 'Tercer lunes de noviembre en conmemoración del 20 de noviembre', tipo: 'movil' },

  // 2020
  { año: 2020, mes: 2, dia: 3, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 3 (en conmemoración del 5 de febrero)' },
  { año: 2020, mes: 3, dia: 9, fundamento: 'Acuerdo SS/8/2020', descripcion: 'Lunes 9 (día inhábil pero laborable, no correrán plazos procesales)' },
  { año: 2020, mes: 3, dia: 16, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 16 (en conmemoración del Benemérito de las Américas)' },
  { año: 2020, mes: 4, dia: 8, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Miércoles 8' },
  { año: 2020, mes: 4, dia: 9, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Jueves 9' },
  { año: 2020, mes: 4, dia: 10, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Viernes 10' },
  { año: 2020, mes: 5, dia: 1, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Viernes 1°' },
  { año: 2020, mes: 5, dia: 4, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 4' },
  { año: 2020, mes: 5, dia: 5, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Martes 5' },
  // Julio 2020 - periodo vacacional
  { año: 2020, mes: 7, dia: 15, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Miércoles 15 al Viernes 31 (primer periodo vacacional)' },
  { año: 2020, mes: 7, dia: 16, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 17, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 20, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 21, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 22, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 23, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 24, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 27, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 28, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 29, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 30, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 7, dia: 31, fundamento: 'Acuerdo SS/4/2020', descripcion: 'primer periodo vacacional' },
  { año: 2020, mes: 8, dia: 27, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Jueves 27 (en conmemoración del 27 de agosto, día del empleado del TFJA)' },
  { año: 2020, mes: 9, dia: 14, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 14' },
  { año: 2020, mes: 9, dia: 15, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Martes 15' },
  { año: 2020, mes: 9, dia: 16, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Miércoles 16' },
  { año: 2020, mes: 10, dia: 12, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 12' },
  { año: 2020, mes: 11, dia: 2, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 2' },
  { año: 2020, mes: 11, dia: 16, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 16 (en conmemoración del 20 de noviembre)' },
  // Diciembre 2020 - periodo vacacional
  { año: 2020, mes: 12, dia: 14, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Lunes 14 al Viernes 1° de Enero de 2021 (segundo periodo vacacional)' },
  { año: 2020, mes: 12, dia: 15, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 16, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 17, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 18, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 21, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 22, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 23, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 24, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 28, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 29, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 30, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2020, mes: 12, dia: 31, fundamento: 'Acuerdo SS/4/2020', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 1, dia: 1, fundamento: 'Acuerdo SS/4/2020', descripcion: 'Viernes 1° de Enero de 2021 (segundo periodo vacacional)' },

  // 2021
  { año: 2021, mes: 2, dia: 1, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Lunes 1 (en conmemoración del 5 de febrero)' },
  { año: 2021, mes: 3, dia: 15, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Lunes 15 (en conmemoración del Benemérito de las Américas)' },
  { año: 2021, mes: 3, dia: 31, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Miércoles 31' },
  { año: 2021, mes: 4, dia: 1, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Jueves 1' },
  { año: 2021, mes: 4, dia: 2, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Viernes 2' },
  { año: 2021, mes: 5, dia: 5, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Miércoles 5' },
  // Julio 2021 - periodo vacacional
  { año: 2021, mes: 7, dia: 15, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Jueves 15 al Viernes 30 (primer periodo vacacional)' },
  { año: 2021, mes: 7, dia: 16, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 19, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 20, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 21, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 22, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 23, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 26, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 27, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 28, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 29, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 7, dia: 30, fundamento: 'Acuerdo SS/3/2021', descripcion: 'primer periodo vacacional' },
  { año: 2021, mes: 8, dia: 27, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Viernes 27' },
  { año: 2021, mes: 9, dia: 15, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Miércoles 15' },
  { año: 2021, mes: 9, dia: 16, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Jueves 16' },
  { año: 2021, mes: 9, dia: 17, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Viernes 17' },
  { año: 2021, mes: 10, dia: 12, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Martes 12' },
  { año: 2021, mes: 11, dia: 1, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Lunes 1' },
  { año: 2021, mes: 11, dia: 2, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Martes 2' },
  { año: 2021, mes: 11, dia: 15, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Lunes 15 (en conmemoración del 20 de noviembre)' },
  // Diciembre 2021 - periodo vacacional
  { año: 2021, mes: 12, dia: 15, fundamento: 'Acuerdo SS/3/2021', descripcion: 'Miércoles 15 al Viernes 31 (segundo periodo vacacional)' },
  { año: 2021, mes: 12, dia: 16, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 17, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 20, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 21, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 22, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 23, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 24, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 27, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 28, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 29, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 30, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },
  { año: 2021, mes: 12, dia: 31, fundamento: 'Acuerdo SS/3/2021', descripcion: 'segundo periodo vacacional' },

  // 2022
  { año: 2022, mes: 2, dia: 7, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Lunes 7 (en conmemoración del 5 de febrero)' },
  { año: 2022, mes: 3, dia: 21, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Lunes 21 (en conmemoración del Benemérito de las Américas)' },
  { año: 2022, mes: 4, dia: 13, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Miércoles 13' },
  { año: 2022, mes: 4, dia: 14, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Jueves 14' },
  { año: 2022, mes: 4, dia: 15, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Viernes 15' },
  { año: 2022, mes: 5, dia: 5, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Jueves 5' },
  { año: 2022, mes: 5, dia: 6, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Viernes 6' },
  // Julio 2022 - periodo vacacional
  { año: 2022, mes: 7, dia: 15, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Viernes 15 al Viernes 29 (primer periodo vacacional)' },
  { año: 2022, mes: 7, dia: 18, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 19, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 20, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 21, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 22, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 25, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 26, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 27, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 28, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 7, dia: 29, fundamento: 'Acuerdo SS/3/2022', descripcion: 'primer periodo vacacional' },
  { año: 2022, mes: 9, dia: 15, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Jueves 15' },
  { año: 2022, mes: 9, dia: 16, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Viernes 16' },
  { año: 2022, mes: 10, dia: 12, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Miércoles 12' },
  { año: 2022, mes: 10, dia: 31, fundamento: 'Acuerdo SS/8/2022', descripcion: 'Lunes 31' },
  { año: 2022, mes: 11, dia: 1, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Martes 1' },
  { año: 2022, mes: 11, dia: 2, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Miércoles 2' },
  { año: 2022, mes: 11, dia: 21, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Lunes 21 (en conmemoración del 20 de noviembre)' },
  // Diciembre 2022 - periodo vacacional
  { año: 2022, mes: 12, dia: 15, fundamento: 'Acuerdo SS/3/2022', descripcion: 'Jueves 15 al Viernes 30 (segundo periodo vacacional)' },
  { año: 2022, mes: 12, dia: 16, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 19, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 20, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 21, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 22, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 23, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 26, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 27, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 28, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 29, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },
  { año: 2022, mes: 12, dia: 30, fundamento: 'Acuerdo SS/3/2022', descripcion: 'segundo periodo vacacional' },

  // 2023
  { año: 2023, mes: 2, dia: 6, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Lunes 6 (en conmemoración del 5 de febrero)' },
  { año: 2023, mes: 3, dia: 20, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Lunes 20 (en conmemoración del Benemérito de las Américas)' },
  { año: 2023, mes: 4, dia: 5, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Miércoles 5' },
  { año: 2023, mes: 4, dia: 6, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Jueves 6' },
  { año: 2023, mes: 4, dia: 7, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Viernes 7' },
  { año: 2023, mes: 5, dia: 1, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Lunes 1' },
  { año: 2023, mes: 5, dia: 5, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Viernes 5' },
  // Julio 2023 - periodo vacacional
  { año: 2023, mes: 7, dia: 17, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Del Lunes 17 al Lunes 31 (primer periodo vacacional)' },
  { año: 2023, mes: 7, dia: 18, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 19, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 20, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 21, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 24, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 25, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 26, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 27, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 28, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 7, dia: 31, fundamento: 'Acuerdo SS/4/2023', descripcion: 'primer periodo vacacional' },
  { año: 2023, mes: 9, dia: 14, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Jueves 14' },
  { año: 2023, mes: 9, dia: 15, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Viernes 15' },
  { año: 2023, mes: 10, dia: 12, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Jueves 12' },
  { año: 2023, mes: 10, dia: 31, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Martes 31 de octubre' },
  { año: 2023, mes: 11, dia: 1, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Miércoles 1' },
  { año: 2023, mes: 11, dia: 2, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Jueves 2' },
  { año: 2023, mes: 11, dia: 20, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Lunes 20' },
  // Diciembre 2023 - periodo vacacional
  { año: 2023, mes: 12, dia: 15, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Del Viernes 15 al Viernes 29 (segundo periodo vacacional)' },
  { año: 2023, mes: 12, dia: 18, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 19, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 20, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 21, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 22, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 25, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 26, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 27, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 28, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2023, mes: 12, dia: 29, fundamento: 'Acuerdo SS/4/2023', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 1, dia: 1, fundamento: 'Acuerdo SS/4/2023', descripcion: 'Lunes 1° de enero de 2024' },

  // 2024
  { año: 2024, mes: 2, dia: 5, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Lunes 5' },
  { año: 2024, mes: 3, dia: 18, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Lunes 18 (en conmemoración del 21 de marzo, día del Benemérito de las Américas)' },
  { año: 2024, mes: 3, dia: 27, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Miércoles 27' },
  { año: 2024, mes: 3, dia: 28, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Jueves 28' },
  { año: 2024, mes: 3, dia: 29, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Viernes 29' },
  { año: 2024, mes: 5, dia: 1, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Miércoles 1°' },
  // Julio 2024 - periodo vacacional
  { año: 2024, mes: 7, dia: 15, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Del Lunes 15 al Miércoles 31 (primer periodo vacacional)' },
  { año: 2024, mes: 7, dia: 16, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 17, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 18, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 19, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 22, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 23, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 24, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 25, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 26, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 29, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 30, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 7, dia: 31, fundamento: 'Acuerdo SS/1/2024', descripcion: 'primer periodo vacacional' },
  { año: 2024, mes: 8, dia: 26, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Lunes 26 (en conmemoración del 27 de agosto, día del empleado del TFJA)' },
  { año: 2024, mes: 9, dia: 16, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Lunes 16' },
  { año: 2024, mes: 10, dia: 1, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Martes 1° (con motivo de la transmisión del Poder Ejecutivo Federal)' },
  { año: 2024, mes: 11, dia: 1, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Viernes 1°' },
  { año: 2024, mes: 11, dia: 18, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Lunes 18 (en conmemoración del 20 de noviembre)' },
  // Diciembre 2024 - periodo vacacional
  { año: 2024, mes: 12, dia: 16, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Del Lunes 16 al Martes 31 (segundo periodo vacacional)' },
  { año: 2024, mes: 12, dia: 17, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 18, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 19, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 20, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 23, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 24, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 26, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 27, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 30, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2024, mes: 12, dia: 31, fundamento: 'Acuerdo SS/1/2024', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 1, dia: 1, fundamento: 'Acuerdo SS/1/2024', descripcion: 'Miércoles 1° de enero de 2025' },

  // 2025
  { año: 2025, mes: 1, dia: 1, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Miércoles 1°' },
  { año: 2025, mes: 2, dia: 3, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 3 (en conmemoración del 5 de febrero)' },
  { año: 2025, mes: 3, dia: 17, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 17 (en conmemoración del 21 de marzo, día del Benemérito de las Américas)' },
  { año: 2025, mes: 4, dia: 16, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Miércoles 16' },
  { año: 2025, mes: 4, dia: 17, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Jueves 17' },
  { año: 2025, mes: 4, dia: 18, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Viernes 18' },
  { año: 2025, mes: 5, dia: 1, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Jueves 1°' },
  { año: 2025, mes: 5, dia: 2, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Viernes 2' },
  { año: 2025, mes: 5, dia: 5, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 5' },
  // Julio 2025 - periodo vacacional
  { año: 2025, mes: 7, dia: 14, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Del Lunes 14 al Jueves 31 (primer periodo vacacional)' },
  { año: 2025, mes: 7, dia: 15, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 16, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 17, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 18, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 21, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 22, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 23, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 24, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 25, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 28, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 29, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 30, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 7, dia: 31, fundamento: 'Acuerdo SS/3/2025', descripcion: 'primer periodo vacacional' },
  { año: 2025, mes: 8, dia: 1, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Viernes 1°' },
  { año: 2025, mes: 8, dia: 25, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 25 (en conmemoración del 27 de agosto, día del empleado del TFJA)' },
  { año: 2025, mes: 9, dia: 15, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 15' },
  { año: 2025, mes: 9, dia: 16, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Martes 16' },
  { año: 2025, mes: 11, dia: 17, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Lunes 17 (en conmemoración del 20 de noviembre)' },
  // Diciembre 2025 - periodo vacacional
  { año: 2025, mes: 12, dia: 15, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Del Lunes 15 al Miércoles 31 (segundo periodo vacacional)' },
  { año: 2025, mes: 12, dia: 16, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 17, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 18, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 19, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 22, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 23, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 24, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 26, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 29, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 30, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2025, mes: 12, dia: 31, fundamento: 'Acuerdo SS/3/2025', descripcion: 'segundo periodo vacacional' },
  { año: 2026, mes: 1, dia: 1, fundamento: 'Acuerdo SS/3/2025', descripcion: 'Jueves 1° de enero de 2026' }
];

// Función para calcular días móviles según artículo 74 LFT
function calcularDiasMovilesLFT(año) {
  const diasMoviles = [];
  
  // Primer lunes de febrero (en conmemoración del 5 de febrero)
  const primerLunesFebrero = new Date(año, 1, 1); // 1 de febrero
  while (primerLunesFebrero.getDay() !== 1) { // Buscar el primer lunes
    primerLunesFebrero.setDate(primerLunesFebrero.getDate() + 1);
  }
  diasMoviles.push({
    fecha: primerLunesFebrero,
    descripcion: 'Primer lunes de febrero en conmemoración del 5 de febrero',
    fundamento: 'artículos 74 LFT, 19 Ley de Amparo'
  });
  
  // Tercer lunes de marzo (en conmemoración del 21 de marzo)
  const tercerLunesMarzo = new Date(año, 2, 1); // 1 de marzo
  while (tercerLunesMarzo.getDay() !== 1) { // Buscar el primer lunes
    tercerLunesMarzo.setDate(tercerLunesMarzo.getDate() + 1);
  }
  tercerLunesMarzo.setDate(tercerLunesMarzo.getDate() + 14); // Tercer lunes
  diasMoviles.push({
    fecha: tercerLunesMarzo,
    descripcion: 'Tercer lunes de marzo en conmemoración del 21 de marzo',
    fundamento: 'artículos 74 LFT, 19 Ley de Amparo'
  });
  
  // Tercer lunes de noviembre (en conmemoración del 20 de noviembre)
  const tercerLunesNoviembre = new Date(año, 10, 1); // 1 de noviembre
  while (tercerLunesNoviembre.getDay() !== 1) { // Buscar el primer lunes
    tercerLunesNoviembre.setDate(tercerLunesNoviembre.getDate() + 1);
  }
  tercerLunesNoviembre.setDate(tercerLunesNoviembre.getDate() + 14); // Tercer lunes
  diasMoviles.push({
    fecha: tercerLunesNoviembre,
    descripcion: 'Tercer lunes de noviembre en conmemoración del 20 de noviembre',
    fundamento: 'artículos 74 LFT, 19 Ley de Amparo'
  });
  
  return diasMoviles;
}

// Función para verificar si una fecha es día inhábil
export function esDiaInhabil(fecha, año) {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const diaSemana = fecha.getDay();
  
  // Sábados y domingos son siempre inhábiles
  if (diaSemana === 0 || diaSemana === 6) {
    return true;
  }
  
  // Debug específico para marzo 2024
  if (año === 2024 && mes === 3) {
    console.log(`Verificando ${dia} marzo 2024`);
    if (dia === 18 || dia === 27 || dia === 28 || dia === 29) {
      console.log(`Día ${dia} marzo 2024 - ES INHÁBIL según TFJA`);
      return true;
    }
  }
  
  // Verificar días móviles del artículo 74 LFT
  const diasMovilesLFT = calcularDiasMovilesLFT(año);
  const esDiaMovil = diasMovilesLFT.some(diaMovil => {
    return diaMovil.fecha.getTime() === fecha.getTime();
  });
  
  if (esDiaMovil) {
    return true;
  }
  
  // Verificar días específicos del año
  const encontrado = diasInhabilesTFJA.some(diaInhabil => {
    // Días que aplican para todos los años
    if (diaInhabil.año === 'todos') {
      if (diaInhabil.tipo === 'finDeSemana') {
        return diaSemana === 0 || diaSemana === 6;
      }
      if (diaInhabil.mes === 'todos') {
        return false; // Solo para casos especiales
      }
      if (diaInhabil.tipo === 'movil') {
        return false; // Ya verificados arriba
      }
      return diaInhabil.mes === mes && diaInhabil.dia === dia;
    }
    
    // Días específicos de un año
    const coincide = diaInhabil.año === año && diaInhabil.mes === mes && diaInhabil.dia === dia;
    if (coincide) {
      console.log('Día inhábil encontrado:', diaInhabil.descripcion);
    }
    return coincide;
  });
  
  return encontrado;
}

// Función para obtener el siguiente día hábil
export function siguienteDiaHabil(fecha) {
  const nuevaFecha = new Date(fecha);
  const año = nuevaFecha.getFullYear();
  
  do {
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
  } while (esDiaInhabil(nuevaFecha, año));
  
  return nuevaFecha;
}

// Función para contar días hábiles entre dos fechas
export function contarDiasHabiles(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const año = inicio.getFullYear();
  let contador = 0;
  let fechaActual = new Date(inicio);
  
  while (fechaActual < fin) {
    if (!esDiaInhabil(fechaActual, año)) {
      contador++;
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return contador;
}