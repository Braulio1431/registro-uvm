import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const RETROGAME_CATEGORY_ID = 7; 

// =========================
// GET → Obtener equipos de RETROGAME 8 BITS
// =========================
export async function GET() {
  try {
    const [equipos]: any = await db.query(
      "SELECT id_equipo, nombre_equipo FROM equipos WHERE id_categoria = ?",
      [RETROGAME_CATEGORY_ID]
    );

    return NextResponse.json({ equipos });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo equipos", detalles: error.message },
      { status: 500 }
    );
  }
}

// =========================
// POST → Guardar calificación de RETROGAME
// =========================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id_equipo,
      p_funcionalidad_juego,
      p_calidad_codigo,
      p_aplicacion_conocimientos,
      p_presentacion_visual_sonora
    } = body;

    // Validación mínima
    if (!id_equipo) {
      return NextResponse.json(
        { error: "Falta el id_equipo" },
        { status: 400 }
      );
    }

    // Calcular puntaje total
    const puntaje_total =
      Number(p_funcionalidad_juego) +
      Number(p_calidad_codigo) +
      Number(p_aplicacion_conocimientos) +
      Number(p_presentacion_visual_sonora);

    // Insert en la tabla
    await db.query(
      `INSERT INTO calificaciones_retrogame 
      (id_equipo, p_funcionalidad_juego, p_calidad_codigo, p_aplicacion_conocimientos, p_presentacion_visual_sonora, puntaje_total)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_equipo,
        p_funcionalidad_juego,
        p_calidad_codigo,
        p_aplicacion_conocimientos,
        p_presentacion_visual_sonora,
        puntaje_total
      ]
    );

    return NextResponse.json({
      mensaje: "Calificación guardada correctamente",
      puntaje_total
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error guardando la calificación", detalles: error.message },
      { status: 500 }
    );
  }
}
