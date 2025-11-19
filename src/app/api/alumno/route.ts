// src/app/api/alumno/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const body = await req.json();
    const { categoria, subcategoria, tipoRegistro, nombreEquipo, alumnos, profesor } = body;

    console.log('📩 Datos recibidos:', body);

    if (!categoria || !alumnos || alumnos.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos incompletos.' });
    }

    await conn.beginTransaction();

    let idProfesor: number | null = null;

    if (profesor && profesor.nombre) {
      console.log('🧑‍🏫 Insertando profesor:', profesor);
      const [resProfesor]: any = await conn.query(
  `INSERT INTO profesores (nombre, apellido_paterno, apellido_materno, matricula, categoria, campus, tipo_profesor)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    profesor.nombre || null,
    profesor.apellidoPaterno || null,
    profesor.apellidoMaterno || null,
    profesor.matricula || null,
    profesor.categoria || null,
    profesor.campus || null,
    profesor.tipo_profesor || null,
  ]
);

      idProfesor = resProfesor.insertId || null;
      console.log('✅ Profesor insertado con id:', idProfesor);
    }

    if (tipoRegistro === 'equipo') {
      console.log('👥 Registrando equipo...');
      if (!nombreEquipo) {
        await conn.rollback();
        return NextResponse.json({ success: false, error: 'Falta el nombre del equipo.' });
      }

      const [resEquipo]: any = await conn.query(
        `INSERT INTO equipos (nombre_equipo, categoria, subcategoria, campus, id_profesor)
         VALUES (?, ?, ?, ?, ?)`,
        [nombreEquipo, categoria, subcategoria, alumnos[0].campus || null, idProfesor]
      );

      const idEquipo = resEquipo.insertId;
      console.log('✅ Equipo insertado con id:', idEquipo);

      for (const alumno of alumnos) {
        console.log('👤 Insertando alumno de equipo:', alumno);
        await conn.query(
  `INSERT INTO alumnos_equipo 
   (nombre, apellido_paterno, apellido_materno, matricula, telefono, carrera, semestre, campus, id_equipo) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    alumno.nombre,
    alumno.apellidoPaterno || null,
    alumno.apellidoMaterno || null,
    alumno.matricula,
    alumno.telefono || null,
    alumno.carrera,
    alumno.semestre || null,
    alumno.campus || null,
    idEquipo,
  ]
);

      }

      await conn.commit();
      return NextResponse.json({ success: true, mensaje: 'Equipo, alumnos y profesor registrados correctamente.' });
    }

    console.log('👤 Registrando alumno individual...');
    const a = alumnos[0];
    const subcategoriaDb = subcategoria && subcategoria.trim() !== '' ? subcategoria : null;

   await conn.query(
  `INSERT INTO alumnos_individuales 
   (nombre, apellido_paterno, apellido_materno, matricula, telefono, carrera, semestre, campus, categoria, subcategoria, id_profesor)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    a.nombre,
    a.apellidoPaterno || null,
    a.apellidoMaterno || null,
    a.matricula,
    a.telefono || null,
    a.carrera,
    a.semestre || null,
    a.campus || null,
    categoria,
    subcategoriaDb,
    idProfesor,
  ]
);



    await conn.commit();
    console.log('✅ Registro completado correctamente');
    return NextResponse.json({ success: true, mensaje: 'Alumno y profesor registrados exitosamente.' });
  } catch (error: any) {
    console.error('❌ ERROR DETECTADO:', error?.message || error);
    try {
      await conn.rollback();
    } catch {}
    return NextResponse.json({ success: false, error: error?.message || 'Error desconocido en el servidor.' });
  } finally {
    try {
      conn.release();
    } catch {}
  }
}