// app/api/design/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Participante {
  id_participante: number;
  nombre_completo: string;
}

interface PodioItem {
  id_participante: number;
  nombre_completo: string;
  lugar: string;
}

export async function GET() {
  try {
    const result1: any = await db.query(
      `SELECT id_participante,
              CONCAT(nombre, ' ', apellido_paterno, ' ', IFNULL(apellido_materno, '')) AS nombre_completo
       FROM participantes
       WHERE id_categoria = 5
       ORDER BY nombre ASC`
    );
    const participantes = (Array.isArray(result1) ? result1[0] : result1) as Participante[];

    const result2: any = await db.query(
      `SELECT p.id_participante,
              CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) as nombre_completo,
              CASE
                WHEN c.primer_lugar = 1 THEN 'Primer Lugar'
                WHEN c.segundo_lugar = 1 THEN 'Segundo Lugar'
                WHEN c.tercer_lugar = 1 THEN 'Tercer Lugar'
              END as lugar
       FROM participantes p
       INNER JOIN podio_design c ON p.id_participante = c.id_participante
       WHERE p.id_categoria = 5
       ORDER BY FIELD(lugar, 'Primer Lugar', 'Segundo Lugar', 'Tercer Lugar')`
    );
    const podio = (Array.isArray(result2) ? result2[0] : result2) as PodioItem[];

    return NextResponse.json({ participantes, podio });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("GET /api/design Error:", msg);
    return NextResponse.json(
      { error: "Error al obtener datos: " + msg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id_primer, id_segundo, id_tercer } = data;

    // Limpiar tabla para solo un podio
    await db.execute(`DELETE FROM podio_design`);

    await db.execute(
      `INSERT INTO podio_design (id_participante, primer_lugar, segundo_lugar, tercer_lugar)
       VALUES (?, 1, 0, 0)`,
      [id_primer]
    );
    await db.execute(
      `INSERT INTO podio_design (id_participante, primer_lugar, segundo_lugar, tercer_lugar)
       VALUES (?, 0, 1, 0)`,
      [id_segundo]
    );
    await db.execute(
      `INSERT INTO podio_design (id_participante, primer_lugar, segundo_lugar, tercer_lugar)
       VALUES (?, 0, 0, 1)`,
      [id_tercer]
    );

    return NextResponse.json({
      message: "Podio guardado correctamente",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("POST /api/design Error:", msg);
    return NextResponse.json(
      { error: "Error al guardar el podio: " + msg },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await db.execute(`DELETE FROM podio_design`);
    return NextResponse.json({
      message: "Podio borrado correctamente",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DELETE /api/design Error:", msg);
    return NextResponse.json(
      { error: "Error al borrar el podio: " + msg },
      { status: 500 }
    );
  }
}
