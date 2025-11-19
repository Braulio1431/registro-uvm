import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { usuario, contrasena } = await req.json();

    // Buscar en Administradores
    const [adminRows]: any = await db.query(
      'SELECT * FROM Administradores WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (adminRows.length > 0) {
      return NextResponse.json({ tipo: 'admin', mensaje: 'Administrador autenticado' }, { status: 200 });
    }

    // Buscar en Subadministradores (usa matrícula o usuario según tu DB)
    const [subRows]: any = await db.query(
      'SELECT * FROM Subadministradores WHERE matricula = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (subRows.length > 0) {
      return NextResponse.json({ tipo: 'subadmin', mensaje: 'Subadministrador autenticado' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });

  } catch (err) {
    console.error('Error al autenticar:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
