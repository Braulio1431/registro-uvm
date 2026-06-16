import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      matricula_profesor,
      clave_cartel,
      nivel_madurez,
      // Nivel 1
      problema_investigacion,
      objetivos_justificacion,
      marco_teorico,
      // Nivel 2
      metodologia,
      resultados,
      aplicacion_conocimiento,
      // Nivel 3
      analisis_interpretacion,
      problematica_real,
      impacto_transferencia,
      originalidad_innovacion,
      // Competencias genéricas (todos los niveles)
      presentacion_visual,
      comunicacion_oral,
    } = body;

    if (!matricula_profesor || !clave_cartel || !nivel_madurez) {
      return NextResponse.json(
        { error: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    // Construir array de valores según nivel de madurez
    // Nivel 1: criterios 1,2,3 + genéricas (11,12)
    // Nivel 2: criterios 1-6 + genéricas
    // Nivel 3: criterios 1-10 + genéricas
    const nivel = Number(nivel_madurez);

    const valoresBase = [
      problema_investigacion,
      objetivos_justificacion,
      marco_teorico,
      presentacion_visual,
      comunicacion_oral,
    ];

    const valoresNivel2 = [
      ...valoresBase,
      metodologia,
      resultados,
      aplicacion_conocimiento,
    ];

    const valoresNivel3 = [
      ...valoresNivel2,
      analisis_interpretacion,
      problematica_real,
      impacto_transferencia,
      originalidad_innovacion,
    ];

    const valores =
      nivel === 1 ? valoresBase :
      nivel === 2 ? valoresNivel2 :
      valoresNivel3;

    const valoresValidos = valores
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && v > 0);

    const promedio =
      valoresValidos.length > 0
        ? valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length
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