import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// ⚙️ Conexión directa para asegurar compatibilidad
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '', // ajusta si tienes contraseña
  database: 'registroeventos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ GET: Obtener todos los profesores registrados
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id_profesor_designado,
        matricula,
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        correo,
        area_evaluar,
        clave_cartel
      FROM profesores_designados
      ORDER BY nombre ASC
    `);

    // 👇 Si no hay registros, devuelve array vacío
    if (!Array.isArray(rows)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error en GET /api/profesor:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesores', detalle: String(error) },
      { status: 500 }
    );
  }
}

// ✅ POST: Insertar nuevo profesor o asignar cartel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profesorSeleccionado,
      claveCartel,
      nombre,
      apellido_paterno,
      apellido_materno,
      matricula,
      area_evaluar,
      telefono,
      correo,
    } = body;

    if (profesorSeleccionado) {
      if (!claveCartel) {
        return NextResponse.json({ error: 'Debe seleccionar una clave de cartel' }, { status: 400 });
      }

      await pool.query(
        `UPDATE profesores_designados SET clave_cartel = ? WHERE id_profesor_designado = ?`,
        [claveCartel, profesorSeleccionado]
      );

      return NextResponse.json({ message: 'Clave de cartel asignada correctamente' });
    }

    if (!nombre || !apellido_paterno || !matricula || !telefono || !correo || !area_evaluar) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO profesores_designados 
      (matricula, nombre, apellido_paterno, apellido_materno, telefono, correo, area_evaluar, clave_cartel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matricula,
        nombre,
        apellido_paterno,
        apellido_materno ?? null,
        telefono,
        correo,
        area_evaluar,
        claveCartel ?? null,
      ]
    );

    return NextResponse.json({
      message: 'Profesor agregado correctamente',
      insertId: result.insertId,
    });
  } catch (error) {
    console.error('Error en POST /api/profesor:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
