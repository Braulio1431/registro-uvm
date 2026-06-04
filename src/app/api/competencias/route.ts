import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const body = await req.json();
    const { categoria, participantes, profesor, nombreEquipo } = body;

    console.log("📩 Datos recibidos:", body);

    // ============================
    // VALIDACIONES
    // ============================
    if (!categoria) {
      return NextResponse.json({
        success: false,
        error: "La categoría es obligatoria.",
      });
    }

    if (!participantes || !Array.isArray(participantes) || participantes.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Se debe registrar al menos un participante.",
      });
    }

    const participantesValidos = participantes.filter(
      (p) => p && p.nombre && p.matricula
    );

    if (participantesValidos.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No hay participantes con datos válidos.",
      });
    }

    // Categorías individuales
    const categoriasIndividuales = [
      "ARTE GENERADO POR IA",
      "DESIGN SPEED (SOLIDWORKS)",
    ];

    const esIndividual = categoriasIndividuales.includes(categoria);

    if (esIndividual && participantesValidos.length > 1) {
      return NextResponse.json({
        success: false,
        error: "Esta categoría solo acepta un participante.",
      });
    }

    await conn.beginTransaction();

    // ============================
    // OBTENER id_categoria REAL
    // ============================
    const [catRow]: any = await conn.query(
      `SELECT id_categoria FROM categorias_competencia WHERE nombre_categoria = ?`,
      [categoria]
    );

    if (!catRow || catRow.length === 0) {
      await conn.rollback();
      return NextResponse.json({
        success: false,
        error: "La categoría no existe en la base de datos.",
      });
    }

    const idCategoria = catRow[0].id_categoria;

    // ============================
    // REGISTRO DEL PROFESOR (opcional)
    // ============================
    let idProfesor: number | null = null;

    if (profesor && profesor.nombre) {
      console.log("🧑‍🏫 Insertando profesor...");

      const [prof]: any = await conn.query(
        `INSERT INTO profesores_acompanantes
        (nombre, apellido_paterno, apellido_materno, matricula, telefono, campus, categoria, tipo_profesor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profesor.nombre,
          profesor.apellidoPaterno || null,
          profesor.apellidoMaterno || null,
          profesor.matricula || null,
          profesor.telefono || null,
          profesor.campus || null,
          categoria,
          profesor.tipo_profesor || null,
        ]
      );

      idProfesor = prof.insertId;
    }

    // ===================================
    // CATEGORÍA INDIVIDUAL
    // ===================================
    if (esIndividual) {
      console.log("👤 Registrando categoría individual...");

      const p = participantesValidos[0];

      const [res]: any = await conn.query(
  `INSERT INTO participantes
  (nombre, apellido_paterno, apellido_materno, matricula, telefono, carrera, semestre, campus, id_equipo, id_categoria)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
  [
    p.nombre,
    p.apellidoPaterno || null,
    p.apellidoMaterno || null,
    p.matricula,
    p.telefono || null,
    p.carrera,
    p.semestre,
    p.campus,
    idCategoria
  ]
);


      const idParticipante = res.insertId;

      // Asociar profesor si aplica
      if (idProfesor) {
        await conn.query(
          `UPDATE profesores_acompanantes
           SET id_participante = ?
           WHERE id_profesor = ?`,
          [idParticipante, idProfesor]
        );
      }

      await conn.commit();
      return NextResponse.json({
        success: true,
        mensaje: "Registro individual completado con éxito.",
      });
    }

    // ===================================
    // REGISTRO DE EQUIPO (categorías en equipo)
    // ===================================
    console.log("👥 Registrando equipo...");

    if (!nombreEquipo || typeof nombreEquipo !== "string") {
      await conn.rollback();
      return NextResponse.json({
        success: false,
        error: "El nombre del equipo es obligatorio.",
      });
    }

    const [resEquipo]: any = await conn.query(
      `INSERT INTO equipos (nombre_equipo, id_categoria)
       VALUES (?, ?)`,
      [nombreEquipo, idCategoria]
    );

    const idEquipo = resEquipo.insertId;

    console.log("✅ Equipo creado con ID:", idEquipo);

    // Insertar participantes
    for (const p of participantesValidos) {
      await conn.query(
        `INSERT INTO participantes 
        (nombre, apellido_paterno, apellido_materno, matricula, telefono, carrera, semestre, campus, id_equipo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.nombre,
          p.apellidoPaterno || null,
          p.apellidoMaterno || null,
          p.matricula,
          p.telefono || null,
          p.carrera,
          p.semestre,
          p.campus,
          idEquipo,
        ]
      );
    }

    if (idProfesor) {
      await conn.query(
        `UPDATE profesores_acompanantes
         SET id_equipo = ?
         WHERE id_profesor = ?`,
        [idEquipo, idProfesor]
      );
    }

    await conn.commit();

    return NextResponse.json({
      success: true,
      mensaje: "Equipo, participantes y profesor registrados correctamente.",
    });
  } catch (error: any) {
    console.error("❌ ERROR:", error.message || error);
    try {
      await conn.rollback();
    } catch {}
    return NextResponse.json({
      success: false,
      error: error?.message || "Error interno del servidor.",
    });
  } finally {
    try {
      conn.release();
    } catch {}
  }
}
