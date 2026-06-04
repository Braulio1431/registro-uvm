import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ======================================================
// GET → Obtener lista de carteles
// ======================================================
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        id_cartel, 
        clave_cartel, 
        titulo AS titulo_cartel,
        nivel_de_madurez
      FROM carteles
      ORDER BY id_cartel DESC
    `);

    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error al obtener carteles:', error);
    return NextResponse.json(
      { error: 'Error al obtener carteles' },
      { status: 500 }
    );
  }
}

// ======================================================
// POST → Registrar nuevo cartel
// ======================================================
export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();

    const {
      titulo_cartel,
      vertical,
      programa,
      profesor_designado,
      correo_profesor_designado,
      asignatura_relacionada,
      es_asignatura_ABP_ABI,
      representante,
      integrantes,
      semestres,
      nivel_de_madurez
    } = body;

    // ==================================================
    // VALIDACIONES PRINCIPALES
    // ==================================================
    if (
      !titulo_cartel ||
      !vertical ||
      !programa ||
      !profesor_designado ||
      !correo_profesor_designado ||
      !asignatura_relacionada ||
      es_asignatura_ABP_ABI === undefined ||
      !representante ||
      !representante.nombre ||
      !representante.apellido_paterno ||
      !representante.apellido_materno ||
      !representante.telefono ||
      !representante.correo ||
      !semestres ||
      !nivel_de_madurez
    ) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios en el formulario.' },
        { status: 400 }
      );
    }

    // ==================================================
    // VALIDACIÓN ENUM nivel_de_madurez
    // ==================================================
    const nivelesPermitidos = ['1', '2', '3'];
    if (!nivelesPermitidos.includes(String(nivel_de_madurez))) {
      return NextResponse.json(
        { error: 'Nivel de madurez inválido. Solo se permite 1, 2 o 3.' },
        { status: 400 }
      );
    }

    // ==================================================
    // VALIDACIÓN PARTICIPANTES
    // ==================================================
    const cantidadParticipantes = 1 + (integrantes?.length || 0);

    if (cantidadParticipantes < 2) {
      return NextResponse.json(
        { error: 'Debe haber al menos 2 participantes (representante + 1 integrante).' },
        { status: 400 }
      );
    }

    if (cantidadParticipantes > 5) {
      return NextResponse.json(
        { error: 'Solo se permiten hasta 5 participantes (representante + 4 integrantes).' },
        { status: 400 }
      );
    }

    const semestresTexto = Array.isArray(semestres)
      ? semestres.join(', ')
      : semestres;

    // ==================================================
    // TRANSACCIÓN
    // ==================================================
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==================================================
    // INSERT CARTEL
    // ==================================================
    const [result]: any = await connection.execute(
      `INSERT INTO carteles (
        clave_cartel,
        titulo,
        vertical,
        programa,
        profesor_designado,
        correo_profesor_designado,
        asignatura_relacionada,
        es_asignatura_ABI_ABP,
        nivel_de_madurez
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo_cartel,
        vertical,
        programa,
        profesor_designado,
        correo_profesor_designado,
        asignatura_relacionada,
        es_asignatura_ABP_ABI,
        String(nivel_de_madurez)
      ]
    );

    const id_cartel = result.insertId;

    // ==================================================
    // PREPARAR INTEGRANTES (máximo 4)
    // ==================================================
    const integrantesCompletos = Array(4)
      .fill(null)
      .map((_, i) =>
        integrantes?.[i] || {
          nombre: null,
          apellido_paterno: null,
          apellido_materno: null
        }
      );

    // ==================================================
    // INSERT PARTICIPANTES
    // ==================================================
    await connection.execute(
      `INSERT INTO participantes_cartel (
        id_cartel,
        nombre_representante,
        apellido_paterno_representante,
        apellido_materno_representante,
        telefono_representante,
        correo_representante,
        semestres,
        integrante1_nombre,
        integrante1_apellido_paterno,
        integrante1_apellido_materno,
        integrante2_nombre,
        integrante2_apellido_paterno,
        integrante2_apellido_materno,
        integrante3_nombre,
        integrante3_apellido_paterno,
        integrante3_apellido_materno,
        integrante4_nombre,
        integrante4_apellido_paterno,
        integrante4_apellido_materno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_cartel,
        representante.nombre,
        representante.apellido_paterno,
        representante.apellido_materno,
        representante.telefono,
        representante.correo,
        semestresTexto,
        integrantesCompletos[0].nombre,
        integrantesCompletos[0].apellido_paterno,
        integrantesCompletos[0].apellido_materno,
        integrantesCompletos[1].nombre,
        integrantesCompletos[1].apellido_paterno,
        integrantesCompletos[1].apellido_materno,
        integrantesCompletos[2].nombre,
        integrantesCompletos[2].apellido_paterno,
        integrantesCompletos[2].apellido_materno,
        integrantesCompletos[3].nombre,
        integrantesCompletos[3].apellido_paterno,
        integrantesCompletos[3].apellido_materno
      ]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({
      message: `Cartel registrado correctamente con ${cantidadParticipantes} participante(s) ✅`,
      id_cartel,
      nivel_de_madurez
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error('Error al registrar cartel:', error);

    return NextResponse.json(
      {
        error: 'Error al registrar el cartel ❌',
        detalle: String(error)
      },
      { status: 500 }
    );
  }
}