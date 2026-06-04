import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Canonical keys used by frontend
const TABLAS_CANONICAS: Record<string, { nombre: string; idCampo: string; key: string }> = {
  subadministradores: { nombre: 'subadministradores', idCampo: 'id', key: 'subadministradores' },
  // NUEVAS TABLAS
  profesores_designados: { nombre: 'profesores_designados', idCampo: 'id_profesor_designado', key: 'profesores_designados' },
  rubricas_cartel: { nombre: 'rubricas_cartel', idCampo: 'id_rubrica', key: 'rubricas_cartel' },
  participantes_cartel: { nombre: 'participantes_cartel', idCampo: 'id_participante', key: 'participantes_cartel' },
  carteles: { nombre: 'carteles', idCampo: 'id_cartel', key: 'carteles' },
  // TABLAS A AGREGAR
  equipos: { nombre: 'equipos', idCampo: 'id_equipo', key: 'equipos' },
  maestros_login: { nombre: 'maestros_login', idCampo: 'id_maestro', key: 'maestros_login' },
  profesores_acompanantes: { nombre: 'profesores_acompanantes', idCampo: 'id_profesor', key: 'profesores_acompanantes' },
  categorias_competencia: { nombre: 'categorias_competencia', idCampo: 'id_categoria', key: 'categorias_competencia' },
  participantes: { nombre: 'participantes', idCampo: 'id_participante', key: 'participantes' },
  // NUEVAS TABLAS AGREGADAS
  podio_design: { nombre: 'podio_design', idCampo: 'id_calificacion', key: 'podio_design' },
  visitas: { nombre: 'visitas', idCampo: 'id_visita', key: 'visitas' },
  // NUEVAS TABLAS INTEGRADAS
  alumno_equipo: { nombre: 'alumno_equipo', idCampo: 'id_equipo', key: 'alumno_equipo' },
  rubrica_incubadora: { nombre: 'rubrica_incubadora', idCampo: 'id_rubrica', key: 'rubrica_incubadora' },
  profesores_jurado: { nombre: 'profesores_jurado', idCampo: 'id_jurado', key: 'profesores_jurado' },
  profesoresmicro: { nombre: 'profesoresmicro', idCampo: 'id_profMicro', key: 'profesoresmicro' },
  equiposmicro: { nombre: 'equiposmicro', idCampo: 'id_equipoMicro', key: 'equiposmicro' },
  microrubrica: { nombre: 'microrubrica', idCampo: 'id_microRubrica', key: 'microrubrica' },
};

// Aliases
const ALIAS_MAP: Record<string, string> = {
  subadministradores: 'subadministradores',
  subadmin: 'subadministradores',
  'sub administrador': 'subadministradores',
  'Subadministradores': 'subadministradores',
  profesores_designados: 'profesores_designados',
  designados: 'profesores_designados',
  rubricas: 'rubricas_cartel',
  rubricas_cartel: 'rubricas_cartel',
  participantes_cartel: 'participantes_cartel',
  carteles: 'carteles',
  // ALIASES PARA TABLAS NUEVAS
  equipos: 'equipos',
  maestroslogin: 'maestros_login',
  maestros: 'maestros_login',
  'maestros login': 'maestros_login',
  profesoresacompanantes: 'profesores_acompanantes',
  profesores_acompanantes: 'profesores_acompanantes',
  'profesores acompanantes': 'profesores_acompanantes',
  categoriascompetencia: 'categorias_competencia',
  categorias_competencia: 'categorias_competencia',
  'categorias competencia': 'categorias_competencia',
  participantes: 'participantes',
  // ALIASES PARA LAS NUEVAS TABLAS
  podio_design: 'podio_design',
  podio: 'podio_design',
  'podio design': 'podio_design',
  visitas: 'visitas',
  // ALIASES PARA LAS TABLAS INTEGRADAS
  alumno_equipo: 'alumno_equipo',
  'alumno equipo': 'alumno_equipo',
  alumnosequipo: 'alumno_equipo',
  rubrica_incubadora: 'rubrica_incubadora',
  'rubrica incubadora': 'rubrica_incubadora',
  rubricasincubadora: 'rubrica_incubadora',
  profesores_jurado: 'profesores_jurado',
  'profesores jurado': 'profesores_jurado',
  profesoresjurado: 'profesores_jurado',
  profesoresmicro: 'profesoresmicro',
  'profesores micro': 'profesoresmicro',
  equiposmicro: 'equiposmicro',
  'equipos micro': 'equiposmicro',
  microrubrica: 'microrubrica',
  'micro rubrica': 'microrubrica',
};

function getTablaPorTipo(tipo?: string | null) {
  if (!tipo) return null;
  const key = tipo.toString().trim().toLowerCase();
  const mapped = ALIAS_MAP[key] || ALIAS_MAP[key.replace(/\s+/g, '')];
  const final = mapped || (Object.keys(TABLAS_CANONICAS).includes(key) ? key : null);
  if (!final) return null;
  return TABLAS_CANONICAS[final];
}

async function getRows(tabla: any) {
  let rows: any[] = [];
  if (tabla.nombre === 'carteles') {
    const [result]: any = await db.query(
      `SELECT c.*, AVG(r.promedio) AS promedio, MAX(r.fecha_evaluacion) AS fecha_evaluacion 
      FROM carteles c 
      LEFT JOIN rubricas_cartel r ON c.clave_cartel = r.clave_cartel 
      GROUP BY c.id_cartel 
      ORDER BY c.id_cartel DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'equipos') {
    const [result]: any = await db.query(
      `SELECT e.*, c.nombre_categoria, 
      CASE 
        WHEN e.id_categoria = 3 THEN (SELECT AVG(puntaje_total) FROM calificaciones_laberinto WHERE id_equipo = e.id_equipo)
        WHEN e.id_categoria = 6 THEN (SELECT AVG(puntaje_total) FROM calificaciones_puentes WHERE id_equipo = e.id_equipo)
        WHEN e.id_categoria = 7 THEN (SELECT AVG(puntaje_total) FROM calificaciones_retrogame WHERE id_equipo = e.id_equipo)
        ELSE NULL 
      END AS promedio 
      FROM equipos e 
      LEFT JOIN categorias_competencia c ON e.id_categoria = c.id_categoria 
      ORDER BY e.id_equipo DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'participantes') {
    const [result]: any = await db.query(
      `SELECT p.*, c.nombre_categoria, 
      CASE 
        WHEN p.id_categoria = 4 THEN (SELECT AVG(puntaje_total) FROM calificaciones_ia WHERE id_participante = p.id_participante)
        ELSE NULL 
      END AS promedio 
      FROM participantes p 
      LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
      ORDER BY p.id_participante DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'podio_design') {
    const [result]: any = await db.query(
      `SELECT pd.*, p.nombre, p.apellido_paterno, p.apellido_materno, p.matricula, p.campus, c.nombre_categoria 
      FROM podio_design pd 
      LEFT JOIN participantes p ON pd.id_participante = p.id_participante 
      LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
      ORDER BY pd.id_calificacion DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'participantes_cartel') {
    const [result]: any = await db.query(
      `SELECT p.*, c.programa AS programa, c.vertical AS vertical, c.clave_cartel AS clave_cartel 
      FROM participantes_cartel p 
      LEFT JOIN carteles c ON p.id_cartel = c.id_cartel 
      ORDER BY p.id_participante DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'alumno_equipo') {
    const [result]: any = await db.query(
      `SELECT a.*, 
      AVG( (r.p_nombre_marca + r.p_necesidad_real + r.p_originalidad + r.p_pertinencia + r.p_mercado + r.p_proceso + r.p_finanzas + r.p_ventajas) / 8 ) AS promedio
      FROM alumno_equipo a 
      LEFT JOIN rubrica_incubadora r ON a.id_equipo = r.id_equipo 
      GROUP BY a.id_equipo 
      ORDER BY a.id_equipo DESC`
    );
    rows = result;
  } else if (tabla.nombre === 'equiposmicro') {
    const [result]: any = await db.query(
      `SELECT e.*, 
      AVG(m.total) AS promedio
      FROM equiposmicro e 
      LEFT JOIN microrubrica m ON e.id_equipoMicro = m.id_equipoMicro 
      GROUP BY e.id_equipoMicro 
      ORDER BY e.id_equipoMicro DESC`
    );
    rows = result;
  } else {
    const [result]: any = await db.query(`SELECT * FROM ${tabla.nombre} ORDER BY ${tabla.idCampo} DESC`);
    rows = result;
  }
  return rows;
}

async function getColumns(tabla: any) {
  const [cols]: any = await db.query(`SHOW COLUMNS FROM ${tabla.nombre}`);
  let fields = cols.map((c: any) => c.Field);
  if (tabla.nombre === 'carteles') {
    fields.push('promedio', 'fecha_evaluacion');
  } else if (tabla.nombre === 'equipos') {
    fields.push('nombre_categoria', 'promedio');
  } else if (tabla.nombre === 'participantes') {
    fields.push('nombre_categoria', 'promedio');
  } else if (tabla.nombre === 'podio_design') {
    fields.push('nombre', 'apellido_paterno', 'apellido_materno', 'matricula', 'campus', 'nombre_categoria');
  } else if (tabla.nombre === 'participantes_cartel') {
    fields.push('programa', 'vertical', 'clave_cartel');
  } else if (tabla.nombre === 'alumno_equipo') {
    fields.push('promedio');
  } else if (tabla.nombre === 'equiposmicro') {
    fields.push('promedio');
  }
  return fields;
}

// ====================== GET ======================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tipo = url.searchParams.get('tipo');
    if (!tipo || tipo === 'todos') {
      const result: Record<string, any> = {};
      for (const entry of Object.values(TABLAS_CANONICAS)) {
        const rows = await getRows(entry);
        result[entry.key] = rows;
      }
      return NextResponse.json(result);
    }
    const tabla = getTablaPorTipo(tipo);
    if (!tabla) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }
    const rows = await getRows(tabla);
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
    // Remove the primary key field to let auto-increment handle it, unless provided
    if (tabla.nombre !== 'alumno_equipo') {
      delete datos[tabla.idCampo];
    }
    // For alumno_equipo, if ID not provided, calculate next ID manually
    if (tabla.nombre === 'alumno_equipo' && !datos[tabla.idCampo]) {
      const [maxRows]: any = await db.query(`SELECT MAX(${tabla.idCampo}) AS maxId FROM ${tabla.nombre}`);
      const maxId = maxRows[0].maxId || 0;
      datos[tabla.idCampo] = maxId + 1;
    }
    // 🔥 FIX: remove non-existent columns before insert
    if (tabla.nombre === 'carteles') {
      delete datos.promedio;
      delete datos.fecha_evaluacion;
    }
    if (tabla.nombre === 'participantes_cartel') {
      delete datos.programa;
      delete datos.vertical;
      delete datos.clave_cartel;
    }
    if (tabla.nombre === 'equipos' || tabla.nombre === 'participantes') {
      delete datos.nombre_categoria;
      delete datos.promedio;
    }
    if (tabla.nombre === 'podio_design') {
      delete datos.nombre;
      delete datos.apellido_paterno;
      delete datos.apellido_materno;
      delete datos.matricula;
      delete datos.campus;
      delete datos.nombre_categoria;
    }
    if (tabla.nombre === 'alumno_equipo') {
      delete datos.promedio;
    }
    if (tabla.nombre === 'equiposmicro') {
      delete datos.promedio;
    }
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
    const insertId = result?.insertId || result?.[0]?.insertId || datos[tabla.idCampo];
    if (!insertId) {
      return NextResponse.json({ mensaje: 'Insertado correctamente' });
    }
    // FIX: Use joined queries for special tables to return consistent data
    let nuevoRow: any;
    if (tabla.nombre === 'carteles') {
      const [nuevoRows]: any = await db.query(
        `SELECT c.*, AVG(r.promedio) AS promedio, MAX(r.fecha_evaluacion) AS fecha_evaluacion 
        FROM carteles c 
        LEFT JOIN rubricas_cartel r ON c.clave_cartel = r.clave_cartel 
        WHERE c.${tabla.idCampo} = ? 
        GROUP BY c.id_cartel`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'participantes_cartel') {
      const [nuevoRows]: any = await db.query(
        `SELECT p.*, c.programa AS programa, c.vertical AS vertical, c.clave_cartel AS clave_cartel 
        FROM participantes_cartel p 
        LEFT JOIN carteles c ON p.id_cartel = c.id_cartel 
        WHERE p.${tabla.idCampo} = ?`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'equipos') {
      const [nuevoRows]: any = await db.query(
        `SELECT e.*, c.nombre_categoria, 
        CASE 
          WHEN e.id_categoria = 3 THEN (SELECT AVG(puntaje_total) FROM calificaciones_laberinto WHERE id_equipo = e.id_equipo)
          WHEN e.id_categoria = 6 THEN (SELECT AVG(puntaje_total) FROM calificaciones_puentes WHERE id_equipo = e.id_equipo)
          WHEN e.id_categoria = 7 THEN (SELECT AVG(puntaje_total) FROM calificaciones_retrogame WHERE id_equipo = e.id_equipo)
          ELSE NULL 
        END AS promedio 
        FROM equipos e 
        LEFT JOIN categorias_competencia c ON e.id_categoria = c.id_categoria 
        WHERE e.${tabla.idCampo} = ?`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'participantes') {
      const [nuevoRows]: any = await db.query(
        `SELECT p.*, c.nombre_categoria, 
        CASE 
          WHEN p.id_categoria = 4 THEN (SELECT AVG(puntaje_total) FROM calificaciones_ia WHERE id_participante = p.id_participante)
          ELSE NULL 
        END AS promedio 
        FROM participantes p 
        LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
        WHERE p.${tabla.idCampo} = ?`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'podio_design') {
      const [nuevoRows]: any = await db.query(
        `SELECT pd.*, p.nombre, p.apellido_paterno, p.apellido_materno, p.matricula, p.campus, c.nombre_categoria 
        FROM podio_design pd 
        LEFT JOIN participantes p ON pd.id_participante = p.id_participante 
        LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
        WHERE pd.${tabla.idCampo} = ?`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'alumno_equipo') {
      const [nuevoRows]: any = await db.query(
        `SELECT a.*, 
        AVG( (r.p_nombre_marca + r.p_necesidad_real + r.p_originalidad + r.p_pertinencia + r.p_mercado + r.p_proceso + r.p_finanzas + r.p_ventajas) / 8 ) AS promedio
        FROM alumno_equipo a 
        LEFT JOIN rubrica_incubadora r ON a.id_equipo = r.id_equipo 
        WHERE a.${tabla.idCampo} = ? 
        GROUP BY a.id_equipo`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else if (tabla.nombre === 'equiposmicro') {
      const [nuevoRows]: any = await db.query(
        `SELECT e.*, 
        AVG(m.total) AS promedio
        FROM equiposmicro e 
        LEFT JOIN microrubrica m ON e.id_equipoMicro = m.id_equipoMicro 
        WHERE e.${tabla.idCampo} = ? 
        GROUP BY e.id_equipoMicro`,
        [insertId]
      );
      nuevoRow = nuevoRows[0];
    } else {
      const [nuevoRows]: any = await db.query(`SELECT * FROM ${tabla.nombre} WHERE ${tabla.idCampo} = ?`, [insertId]);
      nuevoRow = nuevoRows[0];
    }
    return NextResponse.json(nuevoRow);
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
    // Borrar campos calculados que no existen en BD real
    if (tabla.nombre === 'carteles') {
      delete datos.promedio;
      delete datos.fecha_evaluacion;
    }
    if (tabla.nombre === 'participantes_cartel') {
      delete datos.programa;
      delete datos.vertical;
      delete datos.clave_cartel;
    }
    if (tabla.nombre === 'equipos' || tabla.nombre === 'participantes') {
      delete datos.nombre_categoria;
      delete datos.promedio;
    }
    if (tabla.nombre === 'podio_design') {
      delete datos.nombre;
      delete datos.apellido_paterno;
      delete datos.apellido_materno;
      delete datos.matricula;
      delete datos.campus;
      delete datos.nombre_categoria;
    }
    if (tabla.nombre === 'alumno_equipo') {
      delete datos.promedio;
    }
    if (tabla.nombre === 'equiposmicro') {
      delete datos.promedio;
    }
    const keys = Object.keys(datos).filter((col) => datos[col] !== undefined && datos[col] !== '');
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }
    const setQuery = keys.map((col) => `${col} = ?`).join(', ');
    const valores = keys.map((col) => datos[col]);
    await db.query(
      `UPDATE ${tabla.nombre} SET ${setQuery} WHERE ${tabla.idCampo} = ?`,
      [...valores, id]
    );
    // RETURN — igual que POST, con JOINs especiales
    let updatedRow: any;
    if (tabla.nombre === 'carteles') {
      const [rows]: any = await db.query(
        `SELECT c.*, AVG(r.promedio) AS promedio, MAX(r.fecha_evaluacion) AS fecha_evaluacion 
        FROM carteles c 
        LEFT JOIN rubricas_cartel r ON c.clave_cartel = r.clave_cartel 
        WHERE c.${tabla.idCampo} = ? 
        GROUP BY c.id_cartel`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'participantes_cartel') {
      const [rows]: any = await db.query(
        `SELECT p.*, c.programa, c.vertical, c.clave_cartel 
        FROM participantes_cartel p 
        LEFT JOIN carteles c ON p.id_cartel = c.id_cartel 
        WHERE p.${tabla.idCampo} = ?`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'equipos') {
      const [rows]: any = await db.query(
        `SELECT e.*, c.nombre_categoria, 
        CASE 
          WHEN e.id_categoria = 3 THEN (SELECT AVG(puntaje_total) FROM calificaciones_laberinto WHERE id_equipo = e.id_equipo)
          WHEN e.id_categoria = 6 THEN (SELECT AVG(puntaje_total) FROM calificaciones_puentes WHERE id_equipo = e.id_equipo)
          WHEN e.id_categoria = 7 THEN (SELECT AVG(puntaje_total) FROM calificaciones_retrogame WHERE id_equipo = e.id_equipo)
          ELSE NULL 
        END AS promedio 
        FROM equipos e 
        LEFT JOIN categorias_competencia c ON e.id_categoria = c.id_categoria 
        WHERE e.${tabla.idCampo} = ?`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'participantes') {
      const [rows]: any = await db.query(
        `SELECT p.*, c.nombre_categoria, 
        CASE 
          WHEN p.id_categoria = 4 THEN (SELECT AVG(puntaje_total) FROM calificaciones_ia WHERE id_participante = p.id_participante)
          ELSE NULL 
        END AS promedio 
        FROM participantes p 
        LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
        WHERE p.${tabla.idCampo} = ?`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'podio_design') {
      const [rows]: any = await db.query(
        `SELECT pd.*, p.nombre, p.apellido_paterno, p.apellido_materno, p.matricula, p.campus, c.nombre_categoria 
        FROM podio_design pd 
        LEFT JOIN participantes p ON pd.id_participante = p.id_participante 
        LEFT JOIN categorias_competencia c ON p.id_categoria = c.id_categoria 
        WHERE pd.${tabla.idCampo} = ?`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'alumno_equipo') {
      const [rows]: any = await db.query(
        `SELECT a.*, 
        AVG( (r.p_nombre_marca + r.p_necesidad_real + r.p_originalidad + r.p_pertinencia + r.p_mercado + r.p_proceso + r.p_finanzas + r.p_ventajas) / 8 ) AS promedio
        FROM alumno_equipo a 
        LEFT JOIN rubrica_incubadora r ON a.id_equipo = r.id_equipo 
        WHERE a.${tabla.idCampo} = ? 
        GROUP BY a.id_equipo`,
        [id]
      );
      updatedRow = rows[0];
    } else if (tabla.nombre === 'equiposmicro') {
      const [rows]: any = await db.query(
        `SELECT e.*, 
        AVG(m.total) AS promedio
        FROM equiposmicro e 
        LEFT JOIN microrubrica m ON e.id_equipoMicro = m.id_equipoMicro 
        WHERE e.${tabla.idCampo} = ? 
        GROUP BY e.id_equipoMicro`,
        [id]
      );
      updatedRow = rows[0];
    } else {
      const [rows]: any = await db.query(
        `SELECT * FROM ${tabla.nombre} WHERE ${tabla.idCampo} = ?`,
        [id]
      );
      updatedRow = rows[0];
    }
    return NextResponse.json(updatedRow);
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
    // DELETE MASIVO
    if (confirm === '1') {
      try {
        for (const entry of Object.values(TABLAS_CANONICAS)) {
          await db.query(`DELETE FROM ${entry.nombre}`);
        }
        return NextResponse.json({ mensaje: 'Todos los registros fueron eliminados.' });
      } catch (err) {
        return NextResponse.json({ error: 'No se pudieron eliminar todas las tablas' }, { status: 500 });
      }
    }
    // Validar tipo
    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
    }
    const tabla = getTablaPorTipo(tipo);
    if (!tabla || !tabla.nombre || !tabla.idCampo) {
      return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 });
    }
    // Validar ID
    if (!id) {
      return NextResponse.json({ error: 'ID requerido para eliminar un registro' }, { status: 400 });
    }
    // DELETE por ID seguro
    const resultado = await db.query(
      `DELETE FROM ${tabla.nombre} WHERE ${tabla.idCampo} = ?`,
      [id]
    );
    return NextResponse.json({ mensaje: 'Registro eliminado correctamente', resultado });
  } catch (error) {
    console.error('❌ Error al eliminar registro:', error);
    return NextResponse.json({ error: 'Error interno en el servidor' }, { status: 500 });
  }
}