import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------------------
// GET -> REGRESA LISTA DE PROFESORES Y LISTA DE EQUIPOS
// ---------------------------------------------------------------------------------------
export async function GET() {
  try {
    const [profesores]: any = await db.query(`
      SELECT id_jurado, nombre, apellido_paterno, apellido_materno
      FROM profesores_jurado
      ORDER BY id_jurado DESC
    `);

    const [equipos]: any = await db.query(`
      SELECT id_equipo, nombre_proyecto
      FROM alumno_equipo
      ORDER BY id_equipo DESC
    `);

    return NextResponse.json({
      profesores: profesores || [],
      equipos: equipos || []
    });
  } catch (error) {
    console.error("Error en GET incubadora_profesor:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------------------
// POST -> REGISTRO DE NUEVO PROFESOR O SELECCIÓN DE PROFESOR YA REGISTRADO
// ---------------------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { tipo_profesor, profesor, id_equipo } = body;

    // ------------------------------
    // VALIDACIONES GENERALES
    // ------------------------------
    if (!tipo_profesor) {
      return NextResponse.json(
        { error: "Debe seleccionar si es profesor registrado o nuevo profesor." },
        { status: 400 }
      );
    }

    if (!id_equipo) {
      return NextResponse.json(
        { error: "Debe seleccionar un equipo (nombre del proyecto)." },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let id_jurado = null;

      // ---------------------------------------------
      // CASO 1: PROFESOR REGISTRADO
      // ---------------------------------------------
      if (tipo_profesor === "REGISTRADO") {
        if (!profesor?.id_jurado) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { error: "Debe seleccionar un profesor registrado." },
            { status: 400 }
          );
        }

        id_jurado = profesor.id_jurado;
      }

      // ---------------------------------------------
      // CASO 2: NUEVO PROFESOR
      // ---------------------------------------------
      if (tipo_profesor === "NUEVO") {
        if (
          !profesor?.nombre ||
          !profesor?.apellido_paterno ||
          !profesor?.apellido_materno
        ) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { error: "Faltan datos del nuevo profesor." },
            { status: 400 }
          );
        }

        // INSERTAR PROFESOR
        const [insertResult]: any = await connection.execute(
          `
          INSERT INTO profesores_jurado (nombre, apellido_paterno, apellido_materno)
          VALUES (?, ?, ?)
        `,
          [
            profesor.nombre.toUpperCase(),
            profesor.apellido_paterno.toUpperCase(),
            profesor.apellido_materno.toUpperCase(),
          ]
        );

        id_jurado = insertResult.insertId;
      }

      // SI LLEGA AQUÍ, YA TENEMOS id_jurado Y id_equipo VALIDOS
      await connection.commit();
      connection.release();

      return NextResponse.json({
        ok: true,
        id_jurado,
        message:
          tipo_profesor === "NUEVO"
            ? "Profesor registrado exitosamente."
            : "Profesor seleccionado correctamente."
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error interno en POST incubadora_profesor:", error);
      return NextResponse.json(
        { error: "Error al procesar la solicitud.", detalle: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general en POST incubadora_profesor:", error);
    return NextResponse.json(
      { error: "Error en la solicitud.", detalle: String(error) },
      { status: 500 }
    );
  }
}