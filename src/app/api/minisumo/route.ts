import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1️⃣ Obtener ID de la categoría sumo
    const [categoria]: any = await db.execute(
      "SELECT id_categoria FROM categorias_competencia WHERE LOWER(nombre_categoria) = 'minisumo'"
    );

    if (!categoria || categoria.length === 0) {
      return NextResponse.json(
        { error: "Categoría MINISUMO no encontrada" },
        { status: 404 }
      );
    }

    const idCategoria = categoria[0].id_categoria;

    // 2️⃣ Obtener equipos de esa categoría
    const [equipos]: any = await db.execute(
      "SELECT id_equipo, nombre_equipo FROM equipos WHERE id_categoria = ?",
      [idCategoria]
    );

    return NextResponse.json({
      categoria: "minisumo",
      total: equipos.length,
      equipos: equipos,
    });

  } catch (error: any) {
    console.error("Error en /api/minisumo:", error);
    return NextResponse.json(
      { error: "Error en el servidor", detalle: error.message },
      { status: 500 }
    );
  }
}
