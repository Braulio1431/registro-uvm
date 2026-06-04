// src/app/api/laberinto/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ======================================================
// POST: registrar calificación (upsert)
// ======================================================
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const body = await req.json();

    // -----------------------
    // OCULTAR EQUIPO (nueva lógica)
    // -----------------------
    if (url.searchParams.get("action") === "ocultar") {
      const { id_equipo, ronda } = body;

      if (!id_equipo || !ronda)
        return NextResponse.json({ ok: false, msg: "Faltan datos" }, { status: 400 });

      await db.execute(
        `UPDATE calificaciones_laberinto 
         SET visible = 0 
         WHERE id_equipo = ? AND ronda = ?`,
        [id_equipo, ronda]
      );

      return NextResponse.json({ ok: true, msg: "Equipo ocultado" });
    }

    // -----------------------
    // REGISTRO / UPDATE NORMAL
    // -----------------------
    const {
      id_equipo,
      ronda,
      p_dimensiones,
      p_ajuste,
      p_completo,
      p_salio,
      p_intentos,
      tiempo_segundos,
      puntos_tiempo,
      puntaje_total,
      comentarios,
    } = body;

    if (!id_equipo || !ronda)
      return NextResponse.json({ ok: false, msg: "Faltan datos obligatorios" }, { status: 400 });

    const [existe]: any = await db.execute(
      `SELECT COUNT(*) as c FROM calificaciones_laberinto 
       WHERE id_equipo = ? AND ronda = ?`,
      [id_equipo, ronda]
    );

    if (existe[0].c > 0) {
      await db.execute(
        `UPDATE calificaciones_laberinto SET
          p_dimensiones=?, p_ajuste=?, p_completo=?, p_salio=?, p_intentos=?,
          tiempo_segundos=?, puntos_tiempo=?, puntaje_total=?, comentarios=?, 
          fecha_registro=NOW()
         WHERE id_equipo=? AND ronda=?`,
        [
          p_dimensiones ?? 0, p_ajuste ?? 0, p_completo ?? 0, p_salio ?? 0, p_intentos ?? 0,
          tiempo_segundos ?? 0, puntos_tiempo ?? 0, puntaje_total ?? 0, comentarios ?? "",
          id_equipo, ronda
        ]
      );
    } else {
      await db.execute(
        `INSERT INTO calificaciones_laberinto
         (id_equipo, ronda, p_dimensiones, p_ajuste, p_completo, p_salio, p_intentos,
          tiempo_segundos, puntos_tiempo, puntaje_total, comentarios, visible, fecha_registro)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          id_equipo, ronda,
          p_dimensiones ?? 0, p_ajuste ?? 0, p_completo ?? 0, p_salio ?? 0, p_intentos ?? 0,
          tiempo_segundos ?? 0, puntos_tiempo ?? 0, puntaje_total ?? 0,
          comentarios ?? ""
        ]
      );
    }

    return NextResponse.json({ ok: true, msg: "Calificación guardada" });

  } catch (e) {
    console.error("POST laberinto ERROR:", e);
    return NextResponse.json({ ok: false, msg: "Error en POST" }, { status: 500 });
  }
}

// ======================================================
// DELETE: Reiniciar tabla
// ======================================================
export async function DELETE() {
  try {
    await db.execute("DELETE FROM calificaciones_laberinto");
    return NextResponse.json({ ok: true, msg: "Calificaciones reiniciadas" });
  } catch (e) {
    console.error("DELETE error:", e);
    return NextResponse.json({ ok: false, msg: "Error reiniciando" }, { status: 500 });
  }
}

// ======================================================
// GET: equipos, calificación, ranking
// ======================================================
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // ------------------------------------
    // GET equipos disponibles por ronda
    // ------------------------------------
    if (params.get("equipos") === "1") {
      const ronda = Number(params.get("ronda") || 1);

      if (ronda === 1) {
        const [rows]: any = await db.execute(
          `SELECT id_equipo, nombre_equipo
           FROM equipos
           WHERE id_categoria=3
           ORDER BY nombre_equipo ASC`
        );
        return NextResponse.json({ ok: true, equipos: rows });
      }

      // RONDA 2 o 3 → solo visibles de la ronda previa
      const rondaPrev = ronda - 1;

      const [rows]: any = await db.execute(
        `SELECT DISTINCT e.id_equipo, e.nombre_equipo
         FROM calificaciones_laberinto c
         JOIN equipos e ON e.id_equipo = c.id_equipo
         WHERE c.ronda=? AND c.visible=1
         ORDER BY e.nombre_equipo ASC`,
        [rondaPrev]
      );

      return NextResponse.json({ ok: true, equipos: rows });
    }

    // ------------------------------------
    // GET calificación especifica
    // ------------------------------------
    if (params.get("getcalif") === "1") {
      const id_equipo = params.get("id_equipo");
      const ronda = params.get("ronda");

      const [rows]: any = await db.execute(
        `SELECT * FROM calificaciones_laberinto
         WHERE id_equipo=? AND ronda=?`,
        [id_equipo, ronda]
      );
      return NextResponse.json({ ok: true, calif: rows[0] || null });
    }

    // ------------------------------------
    // GET ranking por ronda
    // ------------------------------------
    if (params.get("ranking") === "1") {
      const ronda = params.get("ronda");

      const [rows]: any = await db.execute(
        `SELECT c.*, e.nombre_equipo
         FROM calificaciones_laberinto c
         JOIN equipos e ON e.id_equipo = c.id_equipo
         WHERE c.ronda=? AND c.visible=1
         ORDER BY puntaje_total DESC`,
        [ronda]
      );

      return NextResponse.json({ ok: true, ranking: rows });
    }

    return NextResponse.json({ ok: false, msg: "Petición inválida" });

  } catch (e) {
    console.error("GET laberinto ERROR:", e);
    return NextResponse.json({ ok: false, msg: "Error en GET" }, { status: 500 });
  }
}