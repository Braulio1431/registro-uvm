import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      matricula_profesor,
      clave_cartel,
      fundamentacion_teorica,
      viabilidad_proyecto,
      presentacion_actitud,
      defensa_cartel,
      resumen,
      introduccion,
      planteamiento_problema,
      justificacion,
      objetivos,
      hipotesis,
      metodologia,
      resultados_analisis,
      conclusiones,
      coherencia_referencias,
    } = body;

    if (!matricula_profesor || !clave_cartel) {
      return NextResponse.json(
        { error: "Faltan la matrícula o la clave del cartel." },
        { status: 400 }
      );
    }

    // Calcular promedio

const valores = [
  fundamentacion_teorica,
  viabilidad_proyecto,
  presentacion_actitud,
  defensa_cartel,
  resumen,
  introduccion,
  planteamiento_problema,
  justificacion,
  objetivos,
  hipotesis,
  metodologia,
  resultados_analisis,
  conclusiones,
  coherencia_referencias,
].map((v) => Number(v));

// 🔹 Calcular promedio de manera segura
const totalValidos = valores.filter((v) => !isNaN(v));
const promedio =
  totalValidos.length > 0
    ? totalValidos.reduce((a, b) => a + b, 0) / totalValidos.length
    : 0;


    // 🧩 INSERT corregido — devuelve el resultado real con insertId
    const [resultado]: any = await db.query(
      `INSERT INTO rubricas_cartel (
        clave_cartel,
        matricula_profesor,
        fundamentacion_teorica,
        viabilidad_proyecto,
        presentacion_actitud,
        defensa_cartel,
        resumen,
        introduccion,
        planteamiento_problema,
        justificacion,
        objetivos,
        hipotesis,
        metodologia,
        resultados_analisis,
        conclusiones,
        coherencia_referencias,
        promedio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clave_cartel,
        matricula_profesor,
        fundamentacion_teorica,
        viabilidad_proyecto,
        presentacion_actitud,
        defensa_cartel,
        resumen,
        introduccion,
        planteamiento_problema,
        justificacion,
        objetivos,
        hipotesis,
        metodologia,
        resultados_analisis,
        conclusiones,
        coherencia_referencias,
        promedio.toFixed(2),
      ]
    );

    return NextResponse.json({
      message: "Rúbrica guardada correctamente",
      id_rubrica: resultado.insertId ?? null,
      promedio: promedio.toFixed(2),
    });
  } catch (error: any) {
    console.error("Error al registrar la rúbrica:", error);
    return NextResponse.json(
      { error: "Error al registrar la rúbrica", detalle: error.message },
      { status: 500 }
    );
  }
}
