import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// =====================
// GET — Lista equipos categoría 6 (Puentes)
// =====================
export async function GET() {
  try {
    const [equipos] = await db.query(
      "SELECT * FROM equipos WHERE id_categoria = 6 ORDER BY nombre_equipo ASC"
    );

    return NextResponse.json({
      ok: true,
      equipos,
    });
  } catch (error) {
    console.error("Error GET equipos puentes:", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener equipos" },
      { status: 500 }
    );
  }
}

// =====================
// POST — Insertar calificación de la rúbrica
// =====================
export async function POST(req: Request) {

  try {
    const data = await req.json();

    const {
      id_equipo,

      p_peso,
      p_claro,
      p_altura,
      p_ancho,
      p_cama_continua,
      p_sin_pintura,

      p_materiales_reciclados,
      p_evitar_metales,

      p_descripcion_geom,
      p_metodologia,
      p_memoria_calculo,

      p_originalidad,
      p_estructura_reconocible,

      peso_puente,
      carga_maxima,
      eficiencia,
      puntos_eficiencia,

      puntaje_total,
      comentarios,
    } = data;

    // Insertar en la tabla de calificaciones de puentes
    const sql = `
      INSERT INTO calificaciones_puentes 
      (
        id_equipo,
        p_peso, p_claro, p_altura, p_ancho,
        p_cama_continua, p_sin_pintura,
        p_materiales_reciclados, p_evitar_metales,
        p_descripcion_geom, p_metodologia, p_memoria_calculo,
        p_originalidad, p_estructura_reconocible,
        peso_puente, carga_maxima, eficiencia, puntos_eficiencia,
        puntaje_total, comentarios
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id_equipo,

      p_peso,
      p_claro,
      p_altura,
      p_ancho,
      p_cama_continua,
      p_sin_pintura,

      p_materiales_reciclados,
      p_evitar_metales,

      p_descripcion_geom,
      p_metodologia,
      p_memoria_calculo,

      p_originalidad,
      p_estructura_reconocible,

      peso_puente,
      carga_maxima,
      eficiencia,
      puntos_eficiencia,

      puntaje_total,
      comentarios || null,
    ];

    await db.query(sql, values);

    return NextResponse.json({ ok: true, message: "Calificación guardada" });
  } catch (error) {
    console.error("Error POST puentes:", error);
    return NextResponse.json(
      { ok: false, message: "Error al guardar la calificación" },
      { status: 500 }
    );
  }
}

// =====================
// (Opcional) GET ALL — obtener todas las calificaciones
// =====================
export async function HEAD() {
  try {
    const [rows] = await db.query(
      `SELECT * FROM calificaciones_puentes ORDER BY fecha_calificacion DESC`
    );

    return NextResponse.json({ ok: true, calificaciones: rows });
  } catch (error) {
    console.error("Error HEAD puentes:", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener calificaciones" },
      { status: 500 }
    );
  }
}
