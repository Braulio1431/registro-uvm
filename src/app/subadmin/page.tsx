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

  const obtenerCampoID = (tabla: string) => {
    const map: Record<string, string> = {
      profesores: 'id_profesor',
      individuales: 'id_alumno',
      equipo: 'id_alumno_equipo',
      alumnos_equipo: 'id_alumno_equipo',
      equipos: 'id_equipo',
      subadministradores: 'id_subadmin',
      profesores_designados: 'id_profesor_designado',
      rubricas_cartel: 'id_rubrica',
      participantes_cartel: 'id_participante',
      carteles: 'id_cartel',
    };
    return map[tabla.toLowerCase()] || 'id';
  };

  const cargar = async (tipo = 'todos') => {
    try {
      const url = tipo === 'todos' ? '/api/registros' : `/api/registros?tipo=${tipo}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) setData(Array.isArray(json) ? { [tipo]: json } : json);
      else setMensaje(json.error || 'Error al cargar registros');
    } catch {
      setMensaje('Error al conectar con el servidor');
    }
  };

  useEffect(() => {
    cargar('todos');
  }, []);

  const cerrarSesion = () => router.push('/');

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
    let nombres = "";
    let claveCartel = "";

 let gradoMadurez = "Nivel 1";
    if (claveCartel) {
      const primeraCifra = claveCartel.trim()[0];
      if (primeraCifra === "1") gradoMadurez = "Nivel 1";
      else if (primeraCifra === "2") gradoMadurez = "Nivel 2";
      else if (primeraCifra === "3") gradoMadurez = "Nivel 3";
    }
    if (tabla === "participantes_cartel") {
      const cartel = (data.carteles || []).find(c => c.id_cartel === r.id_cartel);
      if (cartel) {
        tituloCartel = cartel.titulo || "";
        programa = r.programa?.trim() || cartel.programa?.trim() || "";
        claveCartel = cartel.clave_cartel || "";
      }
      nombres = [
        limpiar(r.nombre_representante, r.apellido_paterno_representante, r.apellido_materno_representante),
        limpiar(r.integrante1_nombre, r.integrante1_apellido_paterno, r.integrante1_apellido_materno),
        limpiar(r.integrante2_nombre, r.integrante2_apellido_paterno, r.integrante2_apellido_materno),
        limpiar(r.integrante3_nombre, r.integrante3_apellido_paterno, r.integrante3_apellido_materno),
        limpiar(r.integrante4_nombre, r.integrante4_apellido_paterno, r.integrante4_apellido_materno)
      ].filter(Boolean).join(", ");
    }

    if (tabla === "carteles") {
      tituloCartel = r.titulo || "";
      programa = r.programa?.trim() || "";
      claveCartel = r.clave_cartel || "";
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
    }

    const nombreMostrar = nombres || tituloCartel;
  

    const loadImg = async (src: string) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };

    const fondo = await loadImg("/ReconocimientoUVM2.jpg");
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
    const yNombre = imgH * 0.460;
    const yTexto = imgH * 0.535;
    const maxWidth = imgW * 0.68;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(110, 110, 110);
    let fs = 88;
    doc.setFontSize(fs);
    while (fs > 32 && doc.getTextWidth(nombreMostrar) > maxWidth) {
      fs -= 2;
      doc.setFontSize(fs);
    }
    const nameLines = doc.splitTextToSize(nombreMostrar, maxWidth);
    doc.text(nameLines, centerX, yNombre, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(40);
    doc.setTextColor(90, 90, 90);

    const texto = `Por su destacada participación en la 19° edición del Foro de Investigación C1-25, obteniendo el ${lugar}° Lugar de la vertical de ${programa}.`;
    const textoLines = doc.splitTextToSize(texto, maxWidth);
    doc.text(textoLines, centerX, yTexto, { align: "center" });

    const safeName = nombreMostrar.replace(/[^\w]/g, "_");
    doc.save(`Reconocimiento_${safeName}.pdf`);
  };

  const TableRenderer = ({ tipo, rows }: { tipo: string; rows: Registro[] }) => {
    const [localRows, setLocalRows] = useState<Registro[]>(rows || []);
    const [filtros, setFiltros] = useState<Record<string, string>>({});
    const [refresh, setRefresh] = useState(0);

    useEffect(() => setLocalRows(rows || []), [rows]);
    const headers = localRows[0] ? Object.keys(localRows[0]) : [];

    const filtrados = localRows.filter(r =>
      Object.entries(filtros).every(([col, val]) =>
        String(r[col] ?? '').toLowerCase().includes(val.toLowerCase())
      )
    );

    if (!headers.length) return <p style={{ color: '#000' }}>No hay registros.</p>;

     if (tipo === "rubricas_cartel") {
  filtrados.sort((a, b) => {
    const pa = parseFloat(a.promedio || a.Promedio || 0);
    const pb = parseFloat(b.promedio || b.Promedio || 0);
    return pb - pa; // mayor a menor
  });
}

if (tipo === "carteles") {
  filtrados.sort((a, b) => {
    const pa = parseFloat(a.promedio || a.Promedio || 0);
    const pb = parseFloat(b.promedio || b.Promedio || 0);
    return pb - pa; // mayor a menor
  });
}
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#000' }}>
            <thead style={{ background: '#b71c1c', color: '#fff' }}>
              <tr>
                {headers.map(h => (
                  <th key={h} style={{ padding: '10px' }}>{h}</th>
                ))}
                <th style={{ padding: '10px' }}>Resultado</th>
                <th style={{ padding: '10px' }}>Reconocimiento</th>
              </tr>
              <tr style={{ background: '#f5f5f5' }}>
                {headers.map(h => (
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
                <th></th><th></th>
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
                  {headers.map(h => (
                    <td key={h} style={{ padding: '6px' }}>{r[h]}</td>
                  ))}
                  <td>
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
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundImage:
          'url(https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg)',
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
            <option value="profesores">Profesores responsables</option>
            <option value="individuales">Alumnos Individuales para competencias</option>
            <option value="equipo">Alumnos con Equipo para competencias</option>
            <option value="equipos">Equipos para competencias</option>
            <option value="subadministradores">Subadministradores</option>
            <option value="profesores_designados">Evaluadores de carteles</option>
            <option value="rubricas_cartel">Puntuacion de las Rúbricas</option>
            <option value="participantes_cartel">Participantes del Cartel</option>
            <option value="carteles">Carteles registrados </option>
          </select>

          <button
            onClick={cerrarSesion}
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
            Cerrar Sesión
          </button>
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
