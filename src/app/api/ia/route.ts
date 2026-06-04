import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ======================================================
// GET → Lista todos los participantes de categoría 4 (IA)
// ======================================================
export async function GET() {
  try {
    const [participantes] = await db.query(
      `SELECT id_participante, nombre 
       FROM participantes 
       WHERE id_categoria = 4 
       ORDER BY nombre ASC`
    );

    return NextResponse.json({ participantes });
  } catch (error) {
    console.error("GET /api/ia Error:", error);
    return NextResponse.json(
      { error: "Error al obtener participantes" },
      { status: 500 }
    );
  }
}

// ======================================================
// POST → Guarda la calificación IA en SQL directo
// ======================================================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      id_participante,
      p_innovacion_originalidad,
      p_potencial_expresivo,
      p_autoria_prompt,
      p_diseno_prompts_personalizados,
      p_calidad_composicion_detalle,
      p_limpieza_resolucion,
      p_coherencia_categoria,
      p_capacidad_expresiva,
      p_impacto_inmediato,
      p_uso_creativo_IA,
      p_descripcion_proceso,
    } = data;

    // ============================================
    // Calcular puntaje total
    // ============================================
    const puntaje_total =
      p_innovacion_originalidad +
      p_potencial_expresivo +
      p_autoria_prompt +
      p_diseno_prompts_personalizados +
      p_calidad_composicion_detalle +
      p_limpieza_resolucion +
      p_coherencia_categoria +
      p_capacidad_expresiva +
      p_impacto_inmediato +
      p_uso_creativo_IA +
      p_descripcion_proceso;

    // ============================================
    // INSERT con mysql2
    // ============================================
    const insertQuery = `
      INSERT INTO calificaciones_IA (
        id_participante,
        p_innovacion_originalidad,
        p_potencial_expresivo,
        p_autoria_prompt,
        p_diseno_prompts_personalizados,
        p_calidad_composicion_detalle,
        p_limpieza_resolucion,
        p_coherencia_categoria,
        p_capacidad_expresiva,
        p_impacto_inmediato,
        p_uso_creativo_IA,
        p_descripcion_proceso,
        puntaje_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(insertQuery, [
      id_participante,
      p_innovacion_originalidad,
      p_potencial_expresivo,
      p_autoria_prompt,
      p_diseno_prompts_personalizados,
      p_calidad_composicion_detalle,
      p_limpieza_resolucion,
      p_coherencia_categoria,
      p_capacidad_expresiva,
      p_impacto_inmediato,
      p_uso_creativo_IA,
      p_descripcion_proceso,
      puntaje_total
    ]);

    return NextResponse.json({
      message: "Calificación guardada correctamente",
      puntaje_total,
    });

  } catch (error) {
    console.error("POST /api/ia Error:", error);
    return NextResponse.json(
      { error: "Error al guardar la calificación" },
      { status: 500 }
    );
  }
}
