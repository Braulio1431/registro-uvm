'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

type Registro = Record<string, any>;

export default function AdminPanel() {
  const [data, setData] = useState<{ [k: string]: Registro[] }>({});
  const [mensaje, setMensaje] = useState('');
  const [lugares, setLugares] = useState<{ [tabla: string]: { [id: string]: number } }>({});
  const [filtrosLocales, setFiltrosLocales] = useState<{ [tabla: string]: { [columna: string]: string } }>({});
  const [filtro, setFiltro] = useState('todos');
  const router = useRouter();

  const obtenerCampoID = (tabla: string) => {
    switch (String(tabla).toLowerCase()) {
      case 'profesores':
        return 'id_profesor';
      case 'alumnosindividuales':
      case 'individuales':
        return 'id_alumno';
      case 'alumnosequipo':
      case 'equipo':
        return 'id_alumno_equipo';
      case 'equipos':
        return 'id_equipo';
      case 'subadministradores':
        return 'id_subadmin';
      default:
        return 'id';
    }
  };

  // Declaración por hoisting: evita problemas si useEffect se define antes.
  async function cargar(tipo = 'todos') {
    try {
      const url = tipo === 'todos' ? '/api/registros' : `/api/registros?tipo=${encodeURIComponent(tipo)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        if (Array.isArray(json)) setData({ [tipo]: json });
        else setData(json);
        setMensaje('');
      } else {
        setMensaje(json.error || 'Error al cargar los registros');
      }
    } catch (err) {
      console.error(err);
      setMensaje('Error de conexión al cargar registros');
    }
  }

  useEffect(() => {
    cargar(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const asignarLugar = (tabla: string, id: string | number, lugar: number) => {
    setLugares(prev => ({
      ...prev,
      [tabla]: { ...prev[tabla], [String(id)]: lugar },
    }));
  };

  const imprimirReconocimiento = (tabla: string, r: Registro) => {
    const idCampo = obtenerCampoID(tabla);
    const idVal = r[idCampo] ?? r.id ?? r.id_equipo ?? r.id_alumno ?? r.id_profesor;
    const lugar = lugares[tabla]?.[String(idVal)];
    if (!lugar) {
      alert('Selecciona un lugar antes de imprimir');
      return;
    }

    let nombres = '';
    if (tabla === 'equipos') {
      const alumnosEquipo = data.alumnosEquipo || data.equipo || data['alumnosEquipo'] || [];
      const integrantes = (alumnosEquipo as Registro[]).filter(a => (a.id_equipo ?? a.id_alumno_equipo) === idVal);
      nombres = integrantes.map(a => a.nombre).join(', ') || 'Sin integrantes';
    } else {
      nombres = r.nombre || '';
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const img = new Image();
    img.src = '/certificado.jpeg';
    img.onload = () => {
      try {
        doc.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
      } catch {}
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(String(nombres), pageWidth / 2, 240, { align: 'center' });
      doc.setDrawColor(150, 0, 0);
      doc.setLineWidth(1.5);
      doc.line(pageWidth / 2 - 200, 250, pageWidth / 2 + 200, 250);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      if (tabla !== 'equipos') doc.text(`Matrícula: ${r.matricula || 'N/A'}`, pageWidth / 2, 300, { align: 'center' });
      doc.text(`Categoría: ${r.categoria || 'N/A'}`, pageWidth / 2, 320, { align: 'center' });
      doc.text(`Campus: ${r.campus || 'N/A'}`, pageWidth / 2, 340, { align: 'center' });
      doc.text(`Lugar obtenido: ${lugar}° Lugar`, pageWidth / 2, 360, { align: 'center' });
      doc.setFontSize(16);
      doc.setFont('helvetica', 'italic');
      doc.text('Por su destacada participación y compromiso.', pageWidth / 2, 410, { align: 'center' });
      doc.save(`Reconocimiento_${(r.nombre || 'participante').toString().replace(/\s+/g, '_')}.pdf`);
    };
    img.onerror = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Reconocimiento', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(`Nombre: ${nombres}`, 40, 140);
      if (tabla !== 'equipos') doc.text(`Matrícula: ${r.matricula || 'N/A'}`, 40, 160);
      doc.text(`Categoría: ${r.categoria || 'N/A'}`, 40, 180);
      doc.text(`Campus: ${r.campus || 'N/A'}`, 40, 200);
      doc.text(`Lugar obtenido: ${lugar}° Lugar`, 40, 220);
      doc.text('¡Felicidades por tu destacada participación!', 40, 260);
      doc.save(`Reconocimiento_${(r.nombre || 'participante').toString().replace(/\s+/g, '_')}.pdf`);
    };
  };

  // Renderizador de tabla (sin acciones de editar/eliminar/agregar)
  function TableRenderer({ rows, tipo }: { rows: Registro[]; tipo: string }) {
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const filtrosTabla = filtrosLocales[tipo] || {};
    const filteredRows = (rows || []).filter(row =>
      headers.every(h =>
        !filtrosTabla[h] || String(row[h] ?? '').toLowerCase().includes((filtrosTabla[h] || '').toLowerCase())
      )
    );

    if (!headers.length) {
      return <div style={{ padding: 10, color: '#b00020', fontWeight: 600 }}>No hay registros</div>;
    }

    return (
      <div style={{ overflowX: 'auto', marginBottom: 25 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 10, overflow: 'hidden', fontFamily: 'Arial, sans-serif', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <thead style={{ backgroundColor: '#b71c1c', color: '#fff' }}>
            <tr>
              {headers.map(h => <th key={h} style={{ padding: 10, border: '1px solid #a10f0f', textTransform: 'capitalize' }}>{h}</th>)}
              <th style={{ padding: 10, border: '1px solid #a10f0f' }}>Resultados</th>
              <th style={{ padding: 10, border: '1px solid #a10f0f' }}>Reconocimiento</th>
            </tr>
            <tr style={{ backgroundColor: '#fbe9e7' }}>
              {headers.map(h => (
                <th key={h}>
                  <input type="text" placeholder="Filtrar..." value={filtrosTabla[h] || ''} onChange={e => setFiltrosLocales(prev => ({ ...prev, [tipo]: { ...prev[tipo], [h]: e.target.value } }))} style={{ width: '100%', padding: '4px 6px', border: '1px solid #b71c1c', borderRadius: 4, color: '#000', backgroundColor: '#fff', fontSize: '0.85em' }} />
                </th>
              ))}
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f5f5' }}>
                {headers.map((campo, i) => (
                  <td key={i} style={{ border: '1px solid #ddd', padding: 8, color: '#000' }}>
                    {String(r[campo] ?? '')}
                  </td>
                ))}

                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                  {[1, 2, 3].map(n => {
                    const idForBtn = r[obtenerCampoID(tipo)] ?? r.id ?? r.id_equipo ?? r.id_alumno ?? r.id_profesor;
                    return (
                      <button key={n} onClick={() => asignarLugar(tipo, idForBtn, n)} style={{ minWidth: 35, fontWeight: 600, margin: '0 2px', backgroundColor: lugares[tipo]?.[String(idForBtn)] === n ? '#b71c1c' : 'transparent', color: lugares[tipo]?.[String(idForBtn)] === n ? '#fff' : '#b71c1c', border: '1px solid #b71c1c', borderRadius: 4, cursor: 'pointer', padding: '4px 6px' }}>{n}</button>
                    );
                  })}
                </td>

                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                  <button onClick={() => imprimirReconocimiento(tipo, r)} style={{ backgroundColor: '#b71c1c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer' }}>Imprimir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // UI principal (botones: Refrescar y Cerrar sesión — lo que pediste conservar)
  return (
    <>
      <div style={{ position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/fs/e04920100990617.5f15ce182ffd9.jpg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'brightness(0.7)', zIndex: -1 }}></div>

      <div style={{ maxWidth: 1200, margin: '50px auto', backgroundColor: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', zIndex: 2 }}>
        <h2 style={{ color: 'black', textAlign: 'center', marginBottom: 20 }}>Panel de Sub-Coordinadores</h2>

        {mensaje && <div style={{ backgroundColor: '#eaf4ff', padding: 10, borderRadius: 8, marginBottom: 12 }}>{mensaje}</div>}

        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filtro} onChange={e => { setFiltro(e.target.value); cargar(e.target.value); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #b71c1c', background: '#fff', color: '#b71c1c', fontWeight: 500 }}>
            <option value="todos">Mostrar todas las secciones</option>
            <option value="profesores">Profesores</option>
            <option value="individuales">Alumnos Individuales</option>
            <option value="equipo">Alumnos con Equipo</option>
            <option value="equipos">Equipos</option>
            <option value="subadministradores">Subadministradores</option>
          </select>

          <button onClick={() => cargar(filtro)} style={{ background: '#b71c1c', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>Refrescar</button>

          <button onClick={() => router.push('/alumno')} style={{ background: 'transparent', color: '#b71c1c', border: '1px solid #b71c1c', borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>Cerrar sesión</button>
        </div>

        {filtro === 'todos' ? (
          <>
            <h4 style={{ color: '#b71c1c', marginTop: 20 }}>Profesores</h4>
            <TableRenderer rows={data.profesores || []} tipo="profesores" />

            <h4 style={{ color: '#b71c1c', marginTop: 20 }}>Alumnos Individuales</h4>
            <TableRenderer rows={data.individuales || data.alumnosIndividuales || []} tipo="individuales" />

            <h4 style={{ color: '#b71c1c', marginTop: 20 }}>Alumnos con Equipo</h4>
            <TableRenderer rows={data.equipo || data.alumnosEquipo || []} tipo="equipo" />

            <h4 style={{ color: '#b71c1c', marginTop: 20 }}>Equipos</h4>
            <TableRenderer rows={data.equipos || []} tipo="equipos" />

            <h4 style={{ color: '#b71c1c', marginTop: 20 }}>Subadministradores</h4>
            <TableRenderer rows={data.subadministradores || []} tipo="subadministradores" />
          </>
        ) : (
          <>
            <h4 style={{ color: '#b71c1c', textTransform: 'capitalize', marginTop: 20 }}>{filtro}</h4>
            <TableRenderer rows={data[filtro] || []} tipo={filtro} />
          </>
        )}
      </div>
    </>
  );
}
