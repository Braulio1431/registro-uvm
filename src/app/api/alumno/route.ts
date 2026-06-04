import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tipo_usuario,
      nombre,
      apellido_paterno,
      apellido_materno,
      matricula,
      campus
    } = body;

    if (
      !tipo_usuario ||
      !nombre ||
      !apellido_paterno ||
      !apellido_materno ||
      !matricula ||
      !campus
    ) {
      return NextResponse.json(
        { ok: false, msg: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    await db.execute(
      `INSERT INTO visitas 
      (tipo_usuario, nombre, apellido_paterno, apellido_materno, matricula, campus)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tipo_usuario,
        nombre,
        apellido_paterno,
        apellido_materno,
        matricula,
        campus
      ]
    );

    return NextResponse.json({ ok: true, msg: "Visita registrada correctamente" });
  } catch (error) {
    console.error("Error registrando visita:", error);
    return NextResponse.json(
      { ok: false, msg: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
