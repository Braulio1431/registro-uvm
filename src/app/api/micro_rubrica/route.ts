import { NextResponse } from "next/server";
import { db } from "@/lib/db";


// ------------------------------------------------------
// POST - GUARDAR EVALUACIÓN DE RÚBRICA
// ------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
      id_equipoMicro, 
      id_profMicro, 
      resumen,
      introduccion,
      fundamentacion_teorica,
      objetivo_general,
      metodologia,
      resultados_discusion,
      producto_esperado,
      formato_cartel,
      presentacion_oral,
      referencias_bibliograficas
    } = body;

    // VALIDACIONES
    if (!id_equipoMicro || !id_profMicro) {
      return NextResponse.json(
        { error: "FALTAN DATOS OBLIGATORIOS." },
        { status: 400 }
      );
    }

    const camposRubrica = [
      "resumen",
      "introduccion",
      "fundamentacion_teorica",
      "objetivo_general",
      "metodologia",
      "resultados_discusion",
      "producto_esperado",
      "formato_cartel",
      "presentacion_oral",
      "referencias_bibliograficas",
    ];

    const allowedValues = [0, 0.6, 0.8, 0.9, 1];

    let total = 0;

    for (let campo of camposRubrica) {
      const valor = body[campo];
      if (typeof valor !== "number" || !allowedValues.includes(valor)) {
        return NextResponse.json(
          { error: "CADA CALIFICACIÓN DEBE SER UNO DE: 0, 0.6, 0.8, 0.9, 1." },
          { status: 400 }
        );
      }
      total += valor;
    }

    // Guardar en la base
    await db.query(
      `
      INSERT INTO microRubrica
      (id_equipoMicro, id_profMicro, resumen, introduccion, fundamentacion_teorica, objetivo_general, metodologia, resultados_discusion, producto_esperado, formato_cartel, presentacion_oral, referencias_bibliograficas, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [id_equipoMicro, id_profMicro, resumen, introduccion, fundamentacion_teorica, objetivo_general, metodologia, resultados_discusion, producto_esperado, formato_cartel, presentacion_oral, referencias_bibliograficas, total]
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
  