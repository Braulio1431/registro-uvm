import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ============================================================
   GET  -> Lista de equipos registrados
   ============================================================ */
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        id_equipo,
        nombre_proyecto,
        alumno1_nombre,
        alumno1_apellido_paterno,
        alumno1_apellido_materno
      FROM alumno_equipo
      ORDER BY id_equipo DESC
    `);

    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipos' },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST -> Registro de un equipo
   ============================================================ */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre_proyecto,
      representante,      // { nombre, apellido_paterno, apellido_materno }
      integrantes         // Array de hasta 3 integrantes más
    } = body;

    // ---------------------------------------------------------
    // VALIDAR CAMPOS OBLIGATORIOS
    // ---------------------------------------------------------
    if (
      !nombre_proyecto ||
      !representante ||
      !representante.nombre ||
      !representante.apellido_paterno ||
      !representante.apellido_materno
    ) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios del representante o del proyecto.' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // VALIDAR CANTIDAD DE PARTICIPANTES (1 a 4)
    // ---------------------------------------------------------
    const totalParticipantes = 1 + (integrantes?.length || 0);

    if (totalParticipantes < 1) {
      return NextResponse.json(
        { error: 'Debe haber al menos 1 participante (representante).' },
        { status: 400 }
      );
    }

    if (totalParticipantes > 4) {
      return NextResponse.json(
        { error: 'Solo se permiten hasta 4 participantes.' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // FORMATEAR INTEGRANTES FALTANTES
    // (rellena hasta 3 integrantes más con null)
    // ---------------------------------------------------------
    const integrantesCompletos = Array(3)
      .fill(null)
      .map((_, i) => integrantes?.[i] || {
        nombre: null,
        apellido_paterno: null,
        apellido_materno: null
      });

    // ---------------------------------------------------------
    // GUARDAR EN BD
    // ---------------------------------------------------------
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute(
        `INSERT INTO alumno_equipo (
          nombre_proyecto,

          alumno1_nombre,
          alumno1_apellido_paterno,
          alumno1_apellido_materno,

          alumno2_nombre,
          alumno2_apellido_paterno,
          alumno2_apellido_materno,

          alumno3_nombre,
          alumno3_apellido_paterno,
          alumno3_apellido_materno,

          alumno4_nombre,
          alumno4_apellido_paterno,
          alumno4_apellido_materno
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre_proyecto,

          representante.nombre,
          representante.apellido_paterno,
          representante.apellido_materno,

          integrantesCompletos[0].nombre,
          integrantesCompletos[0].apellido_paterno,
          integrantesCompletos[0].apellido_materno,

          integrantesCompletos[1].nombre,
          integrantesCompletos[1].apellido_paterno,
          integrantesCompletos[1].apellido_materno,

          integrantesCompletos[2].nombre,
          integrantesCompletos[2].apellido_paterno,
          integrantesCompletos[2].apellido_materno
        ]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({
        message: `Equipo registrado correctamente con ${totalParticipantes} integrante(s) ✅`
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error durante la transacción:', error);
      return NextResponse.json(
        { error: 'Error al registrar el equipo ❌', detalle: String(error) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud ❌', detalle: String(error) },
      { status: 500 }
    );
  }
}
