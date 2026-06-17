'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

type Registro = Record<string, any>;

export default function AdminPanel() {
  const [data, setData] = useState<{ [k: string]: Registro[] }>({});
  const [mensaje, setMensaje] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const lugaresRef = React.useRef<{ [tabla: string]: { [id: string]: number } }>({});
  const router = useRouter();

  // 🔒 Protección de ruta
  useEffect(() => {
    const sesion = sessionStorage.getItem('sesion');
    if (sesion !== 'admin') {
      router.replace('/');
    }
  }, []);

  const obtenerCampoID = (tabla: string) => {
    const map: Record<string, string> = {
      subadministradores: 'id',
      profesores_designados: 'id_profesor_designado',
      rubricas_cartel: 'id_rubrica',
      participantes_cartel: 'id_participante',
      carteles: 'id_cartel',
      equipos: 'id_equipo',
      maestros_login: 'id_maestro',
      profesores_acompanantes: 'id_profesor',
      categorias_competencia: 'id_categoria',
      participantes: 'id_participante',
      podio_design: 'id_calificacion',
      visitas: 'id_visita',
      profesores_jurado: 'id_jurado',
      rubrica_incubadora: 'id_rubrica',
      alumno_equipo: 'id_equipo',
      microrubrica: 'id_microRubrica',
      equiposmicro: 'id_equipoMicro',
      profesoresmicro: 'id_profMicro',
    };
    return map[tabla.toLowerCase()] || 'id';
  };

  const relatedTables: Record<string, string[]> = {
    equiposmicro: ['microrubrica'],
    alumno_equipo: ['rubrica_incubadora'],
  };

  const cargar = async (tipo = 'todos') => {
    try {
      let tiposToLoad = [tipo];
      if (relatedTables[tipo]) {
        tiposToLoad = [...tiposToLoad, ...relatedTables[tipo]];
      }
      const url = tipo === 'todos' ? '/api/registros' : `/api/registros?tipo=${tiposToLoad.join(',')}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        if (tipo !== 'todos') {
          setData(prev => ({ ...prev, ...json }));
        } else {
          setData(json);
        }
      } else {
        setMensaje(json.error || 'Error al cargar registros');
      }
    } catch {
      setMensaje('Error al conectar con el servidor');
    }
  };

  useEffect(() => {
    cargar('todos');
  }, []);

  const eliminarTodos = async () => {
    if (!confirm('¿Eliminar todos los registros?')) return;
    const res = await fetch('/api/registros?confirm=1', { method: 'DELETE' });
    const json = await res.json();
    if (res.ok) {
      setData({});
      setMensaje(json.mensaje || 'Eliminados correctamente');
    }
  };

  const descargarCSV = () => {
    if (filtro === 'todos') return alert('Selecciona una tabla para descargar');
    const key = filtro;
    const rows = data[key] || [];
    if (!rows.length) return alert('No hay registros para descargar');
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${key}.csv`;
    a.click();
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('sesion');
    router.push('/');
  };

  const asignarLugar = (tabla: string, id: string | number, lugar: number) => {
    if (!lugaresRef.current[tabla]) lugaresRef.current[tabla] = {};
    lugaresRef.current[tabla][String(id)] = lugar;
  };

  const imprimirReconocimiento = async (tabla: string, r: Registro) => {
    const idCampo = obtenerCampoID(tabla);
    const idVal = r[idCampo] ?? r.id;
    const lugar = lugaresRef.current[tabla]?.[String(idVal)];
    if (!lugar) return alert("Selecciona un lugar antes de imprimir");

    const limpiar = (...v: any[]) =>
      v.filter(x => x && x !== "null" && x !== "undefined" && x !== "").join(" ").trim();

    let tituloCartel = "";
    let programa = "";
    let categoria = "";
    let nombres = "";
    let nombreMostrar = "";
    let texto = "";

    // ================= CARTELES Y PARTICIPANTES_CARTEL =================
    if (tabla === "participantes_cartel") {
      const cartel = (data.carteles || []).find(c => c.id_cartel === r.id_cartel);

      if (cartel) {
        tituloCartel = cartel.titulo || "";
      }

      programa = r.programa?.trim() || "";

      nombres = [ 
        limpiar(r.nombre_representante, r.apellido_paterno_representante, r.apellido_materno_representante),
        limpiar(r.integrante1_nombre, r.integrante1_apellido_paterno, r.integrante1_apellido_materno),
        limpiar(r.integrante2_nombre, r.integrante2_apellido_paterno, r.integrante2_apellido_materno),
        limpiar(r.integrante3_nombre, r.integrante3_apellido_paterno, r.integrante3_apellido_materno),
        limpiar(r.integrante4_nombre, r.integrante4_apellido_paterno, r.integrante4_apellido_materno),
      ]
        .filter(Boolean)
        .join(", ");

      nombreMostrar = nombres || tituloCartel;

     const nivelMadurez = (data.carteles || []).find(c => c.id_cartel === r.id_cartel)?.nivel_de_madurez ?? '';
      texto = `Por su destacada participación en la 20° edición del Foro de Investigación C1-2026, obteniendo el ${lugar}° Lugar de la vertical de ${programa} con Nivel de Madurez ${nivelMadurez}.`;
    }

    if (tabla === "carteles") {
      tituloCartel = r.titulo || "";
      programa = r.programa?.trim() || "";

      const participantes = (data.participantes_cartel || []).filter(
        p => p.id_cartel === r.id_cartel
      );

      if (participantes.length) {
        nombres = participantes
          .map(p => {
            const items = [
              limpiar(p.nombre_representante, p.apellido_paterno_representante, p.apellido_materno_representante),
              limpiar(p.integrante1_nombre, p.integrante1_apellido_paterno, p.integrante1_apellido_materno),
              limpiar(p.integrante2_nombre, p.integrante2_apellido_paterno, p.integrante2_apellido_materno),
              limpiar(p.integrante3_nombre, p.integrante3_apellido_paterno, p.integrante3_apellido_materno),
              limpiar(p.integrante4_nombre, p.integrante4_apellido_paterno, p.integrante4_apellido_materno),
            ].filter(Boolean);
            return items.join(", ");
          })
          .join(" — ");
      }

      nombreMostrar = nombres || tituloCartel;

      texto = `Por su destacada participación en la 20° edición del Foro de Investigación C1-2026, obteniendo el ${lugar}° Lugar de la vertical de ${programa} con Nivel de Madurez ${r.nivel_de_madurez ?? ''}.`;
    }

    // ================= EQUIPOS =================
    if (tabla === "equipos") {
      nombreMostrar = r.nombre_equipo || "";

      categoria = r.nombre_categoria || "";

      texto = `Por su destacada participación en la 5° edición del Foro nacional de ingenierías, obteniendo el ${lugar}° Lugar de la categoria de ${categoria}.`;
    }

    // ================= PARTICIPANTES =================
    if (tabla === "participantes") {
      nombres = limpiar(r.nombre, r.apellido_paterno, r.apellido_materno);

      nombreMostrar = nombres;

      categoria = r.nombre_categoria || "";

      texto = `Por su destacada participación en la 5° edición del Foro nacional de ingenierías, obteniendo el ${lugar}° Lugar de la categoria de ${categoria}.`;
    }

    // ================= ALUMNO_EQUIPO =================
    if (tabla === "alumno_equipo") {
      nombreMostrar = r.nombre_proyecto || "";

      const lugaresTexto = ["", "PRIMER", "SEGUNDO", "TERCER"];
      texto = `Por obtener el ${lugaresTexto[lugar]} LUGAR del Programa "Incubadoras de Emprendimiento del Instituto de la Juventud del Municipio de Puebla - 2025".`;
    }

    // ================= EQUIPOSMICRO =================
    if (tabla === "equiposmicro") {
      nombreMostrar = r.nombre_proyecto || "";

      const lugaresTexto = ["", "PRIMER", "SEGUNDO", "TERCER"];
      texto = `Por obtener el ${lugaresTexto[lugar]} LUGAR en la Exposición de Carteles de Microeconomía para el "19vo Foro de investigación UVM".`;
    }

    // ================= IMAGEN =================
    const loadImg = async (src: string) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };

    const fondo = await loadImg("/ReconocimientoUVMmicro.jpg");

    const img = new Image();
    img.src = fondo as string;
    await new Promise(r => (img.onload = r));

    const imgW = img.width;
    const imgH = img.height;
    const centerX = imgW * 0.57;

    const doc = new jsPDF({
      orientation: imgW > imgH ? "landscape" : "portrait",
      unit: "px",
      format: [imgW, imgH]
    });

    doc.addImage(fondo as string, "JPEG", 0, 0, imgW, imgH);

    // ================= COORDENADAS =================
    const yNombre = imgH * 0.460;
    const yTexto = imgH * 0.54;

    // ================= NOMBRE =================
    doc.setFont("helvetica", "bold");
    doc.setTextColor(110, 110, 110); 

    let fs = 150; // más grande
    const maxWidth = imgW * 0.68;

    doc.setFontSize(fs);
    while (fs > 32 && doc.getTextWidth(nombreMostrar) > maxWidth) {
      fs -= 2;
      doc.setFontSize(fs);
    }

    const nameLines = doc.splitTextToSize(nombreMostrar, maxWidth);
    doc.text(nameLines, centerX, yNombre, { align: "center" });

    // ================= TEXTO FINAL =================
    doc.setFont("helvetica", "normal");
    doc.setFontSize(90); 
    doc.setTextColor(90, 90, 90);

    const textoLines = doc.splitTextToSize(texto, maxWidth);
    doc.text(textoLines, centerX, yTexto, { align: "center" });

    // ================= GUARDAR =================
    const safeName = nombreMostrar.replace(/[^\w]/g, "_");
    doc.save(`Reconocimiento_${safeName}.pdf`);
  };

  // === COMPONENTE TABLA ===
  const TableRenderer = ({ tipo, rows }: { tipo: string; rows: Registro[] }) => {
    const [localRows, setLocalRows] = useState<Registro[]>(rows || []);
    const [editando, setEditando] = useState<Record<number, boolean>>({});
    const [nuevos, setNuevos] = useState<Registro[]>([]);
    const [filtros, setFiltros] = useState<Record<string, string>>({});
    const [refresh, setRefresh] = useState(0);
    const [ordenPromedios, setOrdenPromedios] = useState<"none" | "desc">("none");

    const showResultadoReconocimiento = tipo === 'carteles' || tipo === 'participantes_cartel' || tipo === 'equipos' || tipo === 'participantes' || tipo === 'alumno_equipo' || tipo === 'equiposmicro';

    useEffect(() => setLocalRows(rows || []), [rows]);

    const headers = localRows[0] ? Object.keys(localRows[0]) : [];

    const getPromedio = (r: Registro) => {
      if (tipo === 'equiposmicro') {
        const rubricas = data.microrubrica || [];
        const forThis = rubricas.filter(rub => rub.id_equipoMicro === r.id_equipoMicro);
        const sum = forThis.reduce((s, rub) => s + parseFloat(rub.total || 0), 0);
        return forThis.length ? (sum / forThis.length).toFixed(1) : '0.0';
      } else if (tipo === 'alumno_equipo') {
        const rubricas = data.rubrica_incubadora || [];
        const forThis = rubricas.filter(rub => rub.id_equipo === r.id_equipo);
        const totals = forThis.map(rub => {
          return ['p_nombre_marca', 'p_necesidad_real', 'p_originalidad', 'p_pertinencia', 'p_mercado', 'p_proceso', 'p_finanzas', 'p_ventajas'].reduce((s, field) => s + (parseInt(rub[field] || 0)), 0);
        });
        const sum = totals.reduce((s, t) => s + t, 0);
        return forThis.length ? (sum / forThis.length).toFixed(1) : '0.0';
      }
      return parseFloat(r.promedio ?? 0).toFixed(1);
    };

    const filtrados = localRows.filter(r =>
      Object.entries(filtros).every(([col, val]) =>
        String(r[col] ?? '').toLowerCase().includes(val.toLowerCase())
      )
    );

    const manejarCambio = (idx: number, campo: string, valor: string) => {
      setLocalRows(prev => {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], [campo]: valor };
        return copia;
      });
    };

    const manejarCambioNuevo = (idx: number, campo: string, valor: string) => {
      setNuevos(prev => {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], [campo]: valor };
        return copia;
      });
    };

    const guardarCambios = async (idx: number) => {
      const registro = localRows[idx];
      const idCampo = obtenerCampoID(tipo);
      const idVal = registro[idCampo] ?? registro.id;
      const datos = { ...registro };
      delete datos[idCampo];
      const res = await fetch('/api/registros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id: idVal, ...datos }),
      });
      if (res.ok) {
        setEditando(prev => ({ ...prev, [idx]: false }));
        setData(prev => ({ ...prev, [tipo]: localRows }));
        setMensaje('Cambios guardados correctamente');
      }
    };

    const eliminarRegistro = async (idx: number) => {
      const registro = localRows[idx];
      const idCampo = obtenerCampoID(tipo);
      const idVal = registro[idCampo] ?? registro.id;
      if (!confirm('¿Eliminar este registro?')) return;
      const res = await fetch(`/api/registros?tipo=${tipo}&id=${idVal}`, { method: 'DELETE' });
      if (res.ok) {
        setLocalRows(prev => prev.filter((_, i) => i !== idx));
        setData(prev => ({ ...prev, [tipo]: prev[tipo].filter((_, i) => i !== idx) }));
      }
    };

    const agregarNuevo = () => {
      const nuevo: Registro = {};
      headers.forEach(h => (nuevo[h] = ''));
      setNuevos(prev => [...prev, nuevo]);
    };

    const guardarNuevo = async (idx: number) => {
      const registro = nuevos[idx];
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, ...registro }),
      });
      const json = await res.json();
      if (res.ok) {
        setLocalRows(prev => [...prev, json]);
        setNuevos(prev => prev.filter((_, i) => i !== idx));
        setData(prev => ({ ...prev, [tipo]: [...(prev[tipo] || []), json] }));
      }
    };

    const cancelarNuevo = (idx: number) => {
      setNuevos(prev => prev.filter((_, i) => i !== idx));
    };

    // === ORDENAR PROMEDIOS ===
    useEffect(() => {
      if (tipo === "carteles" || tipo === "rubricas_cartel" || tipo === "equipos" || tipo === "participantes" || tipo === "alumno_equipo" || tipo === "equiposmicro") {
        setLocalRows(prev =>
          [...prev].sort((a, b) => {
            const pa = parseFloat(getPromedio(a));
            const pb = parseFloat(getPromedio(b));
            return pb - pa; // mayor → menor
          })
        );
      }
    }, [rows, data]);

    if (!headers.length && !nuevos.length) return <p style={{ color: '#000' }}>No hay registros.</p>;

    const computedHeaders = (tipo === 'equiposmicro' || tipo === 'alumno_equipo') ? [...headers.filter(h => h !== 'promedio'), 'promedio'] : headers;

    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          padding: 25,
          marginBottom: 30,
        }}
      >
        <button
          onClick={agregarNuevo}
          style={{
            background: '#b71c1c',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: 6,
            marginBottom: 10,
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.3s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#d32f2f')}
          onMouseOut={e => (e.currentTarget.style.background = '#b71c1c')}
        >
          + Agregar registro
        </button>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#000' }}>
            <thead style={{ background: '#b71c1c', color: '#fff' }}>
              <tr>
                <th style={{ padding: '10px' }}>Acciones</th>
                {computedHeaders.map(h => (
                  <th key={h} style={{ padding: '10px' }}>{h}</th>
                ))}
                {showResultadoReconocimiento && <th style={{ padding: '10px' }}>Resultado</th>}
                {showResultadoReconocimiento && <th style={{ padding: '10px' }}>Reconocimiento</th>}
              </tr>
              <tr style={{ background: '#f5f5f5' }}>
                <th></th>
                {computedHeaders.map(h => (
                  <th key={h}>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={filtros[h] || ''}
                      onChange={e => setFiltros({ ...filtros, [h]: e.target.value })}
                      style={{
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        padding: 4,
                        color: '#000',
                      }}
                    />
                  </th>
                ))}
                {showResultadoReconocimiento && <th></th>}
                {showResultadoReconocimiento && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #ddd',
                    background: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                    color: '#000',
                  }}
                >
                  <td style={{ padding: '6px' }}>
                    {editando[idx] ? (
                      <>
                        <button onClick={() => guardarCambios(idx)}>💾</button>
                        <button onClick={() => setEditando({ ...editando, [idx]: false })}>✖</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditando({ ...editando, [idx]: true })}>✏️</button>
                        <button onClick={() => eliminarRegistro(idx)}>🗑️</button>
                      </>
                    )}
                  </td>
                  {computedHeaders.map(h => (
                    <td key={h} style={{ padding: '6px' }}>
                      {h === 'promedio' ? getPromedio(r) : 
                        (editando[idx] ? (
                          <input
                            value={r[h] ?? ''}
                            onChange={e => manejarCambio(idx, h, e.target.value)}
                            style={{
                              width: '100%',
                              border: '1px solid #ccc',
                              borderRadius: 4,
                              color: '#000',
                            }}
                          />
                        ) : (
                          r[h]
                        ))}
                    </td>
                  ))}
                  {showResultadoReconocimiento && <td>
                    {[1, 2, 3].map(n => {
                      const id = r[obtenerCampoID(tipo)] ?? r.id;
                      return (
                        <button
                          key={n}
                          onClick={() => {
                            asignarLugar(tipo, id, n);
                            setRefresh(prev => prev + 1);
                          }}
                          style={{
                            margin: 2,
                            background: lugaresRef.current[tipo]?.[String(id)] === n ? '#b71c1c' : 'transparent',
                            color: lugaresRef.current[tipo]?.[String(id)] === n ? 'white' : '#b71c1c',
                            border: '1px solid #b71c1c',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </td>}
                  {showResultadoReconocimiento && <td>
                    <button
                      onClick={() => imprimirReconocimiento(tipo, r)}
                      style={{
                        color: '#b71c1c',
                        background: 'transparent',
                        border: '1px solid #b71c1c',
                        borderRadius: 4,
                        padding: '2px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      🖨️
                    </button>
                  </td>}
                </tr>
              ))}
              {nuevos.map((r, idx) => (
                <tr
                  key={`nuevo-${idx}`}
                  style={{
                    borderBottom: '1px solid #ddd',
                    background: '#f0f8ff',
                    color: '#000',
                  }}
                >
                  <td style={{ padding: '6px' }}>
                    <button onClick={() => guardarNuevo(idx)}>💾</button>
                    <button onClick={() => cancelarNuevo(idx)}>✖</button>
                  </td>
                  {computedHeaders.map(h => (
                    <td key={h} style={{ padding: '6px' }}>
                      {h === 'promedio' ? 'N/A' : 
                      <input
                        value={r[h] ?? ''}
                        onChange={e => manejarCambioNuevo(idx, h, e.target.value)}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          color: '#000',
                        }}
                      />}
                    </td>
                  ))}
                  {showResultadoReconocimiento && <td></td>}
                  {showResultadoReconocimiento && <td></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // === INTERFAZ PRINCIPAL ===
  return (
    <div
      style={{
        backgroundImage:
          'url("https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        width: '100%',
        minHeight: '100vh',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: '30px 40px',
          maxWidth: 1300,
          width: '100%',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          color: '#000',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: '#b71c1c',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 25,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Panel de Coordinadores
        </h2>

        {/* === Barra === */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 25,
            background: 'rgba(250,250,250,0.95)',
            borderRadius: 12,
            padding: '20px 25px',
            marginBottom: 35,
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
          }}
        >
          <select
            value={filtro}
            onChange={e => {
              setFiltro(e.target.value);
              cargar(e.target.value);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #bdbdbd',
              color: '#000',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="todos">Mostrar todas</option>
            <option value="subadministradores">Subadministradores</option>
            <option value="profesores_designados">Evaluadores de carteles</option>
            <option value="rubricas_cartel">Puntuacion de las Rúbricas</option>
            <option value="participantes_cartel">Participantes del Cartel</option>
            <option value="carteles">Carteles registrados </option>
            <option value="equipos">Equipos</option>
            <option value="maestros_login">Maestros Login</option>
            <option value="profesores_acompanantes">Profesores Acompanantes</option>
            <option value="categorias_competencia">Categorias Competencia</option>
            <option value="participantes">Participantes</option>
            <option value="podio_design">Podio Design</option>
            <option value="visitas">Visitas</option>
            <option value="profesores_jurado">Profesores Jurado Incubadora</option>
            <option value="rubrica_incubadora">Rubrica Incubadora</option>
            <option value="alumno_equipo">Alumnos Equipo Incubadora</option>
            <option value="profesoresmicro">Profesores Evaluadores Micro</option>
            <option value="equiposmicro">Equipos Micro</option>
            <option value="microrubrica">Rubrica Micro</option>
          </select>

          {[
            { label: 'Refrescar', action: () => cargar(filtro) },
            { label: 'Descargar CSV', action: descargarCSV },
            { label: 'Eliminar Todos', action: eliminarTodos },
            { label: 'Cerrar Sesión', action: cerrarSesion },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#000',
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: 5,
                transition: 'color 0.3s, border-bottom 0.3s',
                borderBottom: '2px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#b71c1c';
                e.currentTarget.style.borderBottom = '2px solid #b71c1c';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.borderBottom = '2px solid transparent';
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* === Tablas === */}
        {filtro === 'todos' ? (
          Object.entries(data).map(([k, v]) => (
            <div key={k}>
              <h4
                style={{
                  color: '#b71c1c',
                  margin: '30px 0 15px',
                  fontSize: 20,
                  fontWeight: 700,
                  borderLeft: '6px solid #b71c1c',
                  paddingLeft: 10,
                }}
              >
                {k.replace(/_/g, ' ').toUpperCase()}
              </h4>
              <TableRenderer tipo={k} rows={v || []} />
            </div>
          ))
        ) : (
          <TableRenderer tipo={filtro} rows={data[filtro] || []} />
        )}
      </div>
    </div>
  );
}