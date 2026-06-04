import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ------------------------------------------------------
// POST - GUARDAR EVALUACIÓN DE RÚBRICA
// ------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
      id_equipo, 
      id_jurado, 
      p_nombre_marca,
      p_necesidad_real,
      p_originalidad,
      p_pertinencia,
      p_mercado,
      p_proceso,
      p_finanzas,
      p_ventajas,
      acciones_futuras, 
      comentarios_adicionales 
    } = body;

    // VALIDACIONES
    if (!id_equipo || !id_jurado || !acciones_futuras) {
      return NextResponse.json(
        { error: "FALTAN DATOS OBLIGATORIOS." },
        { status: 400 }
      );
    }

    const camposRubrica = [
      "p_nombre_marca",
      "p_necesidad_real",
      "p_originalidad",
      "p_pertinencia",
      "p_mercado",
      "p_proceso",
      "p_finanzas",
      "p_ventajas",
    ];

    for (let campo of camposRubrica) {
      const valor = body[campo];
      if (typeof valor !== "number" || valor < 1 || valor > 5) {
        return NextResponse.json(
          { error: "CADA CALIFICACIÓN DEBE SER UN NÚMERO ENTRE 1 Y 5." },
          { status: 400 }
        );
      }
    }

    // Guardar en la base
    await db.query(
      `
      INSERT INTO rubrica_incubadora
      (id_equipo, id_jurado, p_nombre_marca, p_necesidad_real, p_originalidad, p_pertinencia, p_mercado, p_proceso, p_finanzas, p_ventajas, acciones_futuras, comentarios_adicionales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [id_equipo, id_jurado, p_nombre_marca, p_necesidad_real, p_originalidad, p_pertinencia, p_mercado, p_proceso, p_finanzas, p_ventajas, acciones_futuras, comentarios_adicionales]
    );

    return NextResponse.json({
      ok: true,
      message: "LA EVALUACIÓN SE HA REGISTRADO CORRECTAMENTE.",
    });
  } catch (error) {
    console.error("Error al procesar solicitud:", error);
    return NextResponse.json(
      { error: "ERROR AL PROCESAR LA SOLICITUD." },
      { status: 500 }
    );
  }
}    