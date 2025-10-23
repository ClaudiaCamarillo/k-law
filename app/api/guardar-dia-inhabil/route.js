import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { fecha, fundamento, usuario, calculadora } = await request.json();

    // Validar datos requeridos
    if (!fecha || !fundamento || !calculadora) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Ruta del archivo CSV
    const csvPath = path.join(process.cwd(), 'dias-inhabiles-usuarios', 'registro-dias-inhabiles.csv');

    // Crear el registro con la fecha actual
    const fechaRegistro = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Formatear el registro CSV
    const nuevoRegistro = `${fecha},"${fundamento}","${usuario || 'Anónimo'}",${fechaRegistro},${calculadora}\n`;

    // Verificar si el archivo existe
    try {
      await fs.access(csvPath);
    } catch {
      // Si no existe, crear el directorio y archivo con headers
      await fs.mkdir(path.join(process.cwd(), 'dias-inhabiles-usuarios'), { recursive: true });
      await fs.writeFile(csvPath, 'Fecha,Fundamento Legal,Usuario,Fecha de Registro,Calculadora\n');
    }

    // Agregar el nuevo registro
    await fs.appendFile(csvPath, nuevoRegistro);

    return NextResponse.json({
      success: true,
      message: 'Día inhábil registrado correctamente'
    });

  } catch (error) {
    console.error('Error al guardar día inhábil:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}