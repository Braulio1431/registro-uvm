import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      matricula_profesor,
      clave_cartel,
      problema_investigacion,
      objetivos_justificacion,
      marco_teorico,
      metodologia,
      resultados,
      aplicacion_conocimiento,
      analisis_interpretacion,
      problematica_real,
      impacto_transferencia,
      originalidad_innovacion,
      presentacion_visual,
      comunicacion_oral,
    } = body;

    if (!matricula_profesor || !clave_cartel) {
      return NextResponse.json(
        { error: "Faltan la matrícula o la clave del cartel." },
        { status: 400 }
      );
    }

    const valores = [
      problema_investigacion,
      objetivos_justificacion,
      marco_teorico,
      metodologia,
      resultados,
      aplicacion_conocimiento,
      analisis_interpretacion,
      problematica_real,
      impacto_transferencia,
      originalidad_innovacion,
      presentacion_visual,
      comunicacion_oral,
    ].map((v) => Number(v)).filter((v) => !isNaN(v) && v > 0);

    const promedio =
      valores.length > 0
        ? valores.reduce((a, b) => a + b, 0) / valores.length
        : 0;

    const [resultado]: any = await db.query(
      `INSERT INTO rubricas_cartel (
        clave_cartel,
        matricula_profesor,
        problema_investigacion,
        objetivos_justificacion,
        marco_teorico,
        metodologia,
        resultados,
        aplicacion_conocimiento,
        analisis_interpretacion,
        problematica_real,
        impacto_transferencia,
        originalidad_innovacion,
        presentacion_visual,
        comunicacion_oral,
        promedio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clave_cartel,
        matricula_profesor,
        problema_investigacion ?? null,
        objetivos_justificacion ?? null,
        marco_teorico ?? null,
        metodologia ?? null,
        resultados ?? null,
        aplicacion_conocimiento ?? null,
        analisis_interpretacion ?? null,
        problematica_real ?? null,
        impacto_transferencia ?? null,
        originalidad_innovacion ?? null,
        presentacion_visual ?? null,
        comunicacion_oral ?? null,
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