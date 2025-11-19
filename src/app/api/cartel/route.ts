import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET -> lista de carteles (clave_cartel + titulo)
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT id_cartel, clave_cartel, titulo AS titulo_cartel
      FROM carteles
      ORDER BY id_cartel DESC
    `);
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error al obtener carteles:', error);
    return NextResponse.json({ error: 'Error al obtener carteles' }, { status: 500 });
  }
}

/* --- AQUI PEGA TU POST ORIGINAL SIN CAMBIOS --- */
/* Tu POST existente (el que me compartiste antes) debe quedar justo aquí. */
export async function POST(request: Request) {
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
      semestres
    } = body;

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
      !semestres
    ) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios en el formulario.' },
        { status: 400 }
      );
    }

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

    const semestresTexto = Array.isArray(semestres) ? semestres.join(', ') : semestres;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        `INSERT INTO carteles (
          clave_cartel,
          titulo,
          vertical,
          programa,
          profesor_designado,
          correo_profesor_designado,
          asignatura_relacionada,
          es_asignatura_ABI_ABP
        ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`,
        [
          titulo_cartel,
          vertical,
          programa,
          profesor_designado,
          correo_profesor_designado,
          asignatura_relacionada,
          es_asignatura_ABP_ABI
        ]
      );

      const id_cartel = (result as any).insertId;

      const integrantesCompletos = Array(4)
        .fill(null)
        .map((_, i) => integrantes?.[i] || { nombre: null, apellido_paterno: null, apellido_materno: null });

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
        message: `Cartel registrado correctamente con ${cantidadParticipantes} participante(s) ✅`
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error interno durante la transacción:', error);
      return NextResponse.json({ error: 'Error al registrar el cartel ❌', detalle: String(error) }, { status: 500 });
    }
  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud ❌', detalle: String(error) }, { status: 500 });
  }
}
