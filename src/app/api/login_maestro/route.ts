import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { usuario, password } = await req.json();

    if (!usuario || !password) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos" },
        { status: 400 }
      );
    }

    // Buscar maestro
    const [rows]: any = await db.execute(
      `SELECT id_maestro, nombre, apellido_paterno, apellido_materno,
              usuario, categorias_permitidas, activo
       FROM maestros_login
       WHERE usuario = ? AND password = ?`,
      [usuario, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, mensaje: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const maestro = rows[0];

    if (!maestro.activo) {
      return NextResponse.json(
        { ok: false, mensaje: "Este maestro está inactivo" },
        { status: 403 }
      );
    }

    // 🔥 NORMALIZAR LA CATEGORÍA ANTES DE ENVIARLA
    const categoriaLimpia = String(maestro.categorias_permitidas)
      .trim()
      .toLowerCase()
      .replace(/'/g, ""); // quita comillas simples si las trae

    return NextResponse.json({
      ok: true,
      maestro: {
        id: maestro.id_maestro,
        nombre: maestro.nombre,
        apellido_paterno: maestro.apellido_paterno,
        apellido_materno: maestro.apellido_materno,
        usuario: maestro.usuario,
        categorias_permitidas: categoriaLimpia,
      },
    });
  } catch (error) {
    console.log("Error login maestro:", error);
    return NextResponse.json(
      { ok: false, mensaje: "Error en el servidor" },
      { status: 500 }
    );
  }
}
