import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Canonical keys used by frontend
const TABLAS_CANONICAS: Record<string, { nombre: string; idCampo: string; key: string }> = {
  profesores: { nombre: 'profesores', idCampo: 'id_profesor', key: 'profesores' },
  alumnos_individuales: { nombre: 'alumnos_individuales', idCampo: 'id_alumno', key: 'individuales' },
  alumnos_equipo: { nombre: 'alumnos_equipo', idCampo: 'id_alumno', key: 'equipo' },
  equipos: { nombre: 'equipos', idCampo: 'id_equipo', key: 'equipos' },
  subadministradores: { nombre: 'subadministradores', idCampo: 'id', key: 'subadministradores' },

  // NUEVAS TABLAS
  profesores_designados: { nombre: 'profesores_designados', idCampo: 'id_profesor_designado', key: 'profesores_designados' },
  rubricas_cartel: { nombre: 'rubricas_cartel', idCampo: 'id_rubrica', key: 'rubricas_cartel' },
  participantes_cartel: { nombre: 'participantes_cartel', idCampo: 'id_participante', key: 'participantes_cartel' },
  carteles: { nombre: 'carteles', idCampo: 'id_cartel', key: 'carteles' },
};


// Aliases
const ALIAS_MAP: Record<string, string> = {
  profesores: 'profesores',
  individuales: 'alumnos_individuales',
  alumnosindividuales: 'alumnos_individuales',
  alumnos_individuales: 'alumnos_individuales',
  alumnosIndividuales: 'alumnos_individuales',
  'alumnos individuales': 'alumnos_individuales',
  equipo: 'alumnos_equipo',
  alumnosequipo: 'alumnos_equipo',
  alumnosEquipo: 'alumnos_equipo',
  alumnos_equipo: 'alumnos_equipo',
  'alumnos con equipo': 'alumnos_equipo',
  'alumnosconequipo': 'alumnos_equipo',
  equipos: 'equipos',
  subadministradores: 'subadministradores',
  subadmin: 'subadministradores',
  'sub administrador': 'subadministradores',
  'Subadministradores': 'subadministradores',
  profesores_designados: 'profesores_designados',
  designados: 'profesores_designados',
  rubricas: 'rubricas_cartel',
  rubricas_cartel: 'rubricas_cartel',
  participantes_cartel: 'participantes_cartel',
  participantes: 'participantes_cartel',
  carteles: 'carteles',
};

function getTablaPorTipo(tipo?: string | null) {
  if (!tipo) return null;
  const key = tipo.toString().trim().toLowerCase();
  const mapped = ALIAS_MAP[key] || ALIAS_MAP[key.replace(/\s+/g, '')];
  const final = mapped || (Object.keys(TABLAS_CANONICAS).includes(key) ? key : null);
  if (!final) return null;
  return TABLAS_CANONICAS[final];
}

// ====================== GET ======================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tipo = url.searchParams.get('tipo');

    if (!tipo || tipo === 'todos') {
      const result: Record<string, any[]> = {};
      for (const entry of Object.values(TABLAS_CANONICAS)) {
        const [rows]: any = await db.query(`SELECT * FROM ${entry.nombre}`);
        result[entry.key] = rows;
      }
      return NextResponse.json(result);
    }

    const tabla = getTablaPorTipo(tipo);
    if (!tabla) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }

   let rows: any[] = [];

if (tabla.nombre === 'carteles') {
   const [result]: any = await db.query(`
      SELECT 
          c.*,
          AVG(r.promedio) AS promedio,
          MAX(r.fecha_evaluacion) AS fecha_evaluacion
      FROM carteles c
      LEFT JOIN rubricas_cartel r 
          ON c.clave_cartel = r.clave_cartel
      GROUP BY c.id_cartel
      ORDER BY c.id_cartel DESC
   `);

   rows = result;
} else {
   const [result]: any = await db.query(`SELECT * FROM ${tabla.nombre} ORDER BY ${tabla.idCampo} DESC`);
   rows = result;
}

// NUEVO: agregar programa y vertical a participantes_cartel
if (tabla.nombre === 'participantes_cartel') {
  const [result]: any = await db.query(`
    SELECT 
      p.*,
      c.programa AS programa,
      c.vertical AS vertical
    FROM participantes_cartel p
    LEFT JOIN carteles c
      ON p.id_cartel = c.id_cartel
    ORDER BY p.id_participante DESC
  `);

  return NextResponse.json(result);
}


    return NextResponse.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener registros:', error);
    return NextResponse.json({ error: 'Error al obtener registros' }, { status: 500 });
  }
}

// ====================== POST ======================
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const tipoBody = body?.tipo;
    const tipoQuery = url.searchParams.get('tabla') || url.searchParams.get('tipo');
    const tipo = (tipoBody || tipoQuery) as string | undefined;

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }

    const tabla = getTablaPorTipo(tipo);
    if (!tabla) {
      return NextResponse.json({ error: `Tipo de registro inválido: ${tipo}` }, { status: 400 });
    }

    const datos = { ...body };
    delete datos.tipo;

    if (Object.keys(datos).length === 0) {
      return NextResponse.json({ error: 'No hay datos para insertar' }, { status: 400 });
    }

    const columnas = Object.keys(datos).filter((col) => datos[col] !== undefined && datos[col] !== '');
    const valores = columnas.map((col) => datos[col]);

    if (columnas.length === 0) {
      return NextResponse.json({ error: 'Datos inválidos o vacíos' }, { status: 400 });
    }

    const placeholders = columnas.map(() => '?').join(', ');
    const [result]: any = await db.query(
      `INSERT INTO ${tabla.nombre} (${columnas.join(', ')}) VALUES (${placeholders})`,
      valores
    );

    const insertId = result?.insertId || result?.[0]?.insertId;
    if (!insertId) {
      return NextResponse.json({ mensaje: 'Insertado correctamente' });
    }

    const [nuevoRows]: any = await db.query(`SELECT * FROM ${tabla.nombre} WHERE ${tabla.idCampo} = ?`, [insertId]);
    return NextResponse.json((nuevoRows as any[])[0]);
  } catch (error) {
    console.error('❌ Error al agregar registro:', error);
    return NextResponse.json({ error: 'Error al agregar registro' }, { status: 500 });
  }
}

// ====================== PUT ======================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, id, ...datos } = body;

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }

    const tabla = getTablaPorTipo(tipo);
    if (!tabla) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requerido para actualizar' }, { status: 400 });
    }

    // 🔥 FIX: no enviar columnas que no existen en DB
    if (tipo === 'carteles') {
      delete datos.promedio;
      delete datos.fecha_evaluacion;
    }

    const columnas = Object.keys(datos)
      .map((col) => `${col} = ?`)
      .join(', ');

    const valores = [...Object.values(datos), id];

    await db.query(`UPDATE ${tabla.nombre} SET ${columnas} WHERE ${tabla.idCampo} = ?`, valores);
    return NextResponse.json({ mensaje: 'Registro actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar registro:', error);
    return NextResponse.json({ error: 'Error al actualizar registro' }, { status: 500 });
  }
}


// ====================== DELETE ======================
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tipo = url.searchParams.get('tipo');
    const id = url.searchParams.get('id');
    const confirm = url.searchParams.get('confirm');

    if (confirm === '1') {
      for (const entry of Object.values(TABLAS_CANONICAS)) {
        await db.query(`DELETE FROM ${entry.nombre}`);
      }
      return NextResponse.json({ mensaje: 'Todos los registros fueron eliminados.' });
    }

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }
    const tabla = getTablaPorTipo(tipo);
    if (!tabla) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requerido para eliminar un registro' }, { status: 400 });
    }

    await db.query(`DELETE FROM ${tabla.nombre} WHERE ${tabla.idCampo} = ?`, [id]);
    return NextResponse.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar registro:', error);
    return NextResponse.json({ error: 'Error al eliminar registro' }, { status: 500 });
  }
}
