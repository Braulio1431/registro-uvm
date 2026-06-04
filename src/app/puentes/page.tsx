'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Equipo = {
  id_equipo: number;
  nombre_equipo: string;
};

export default function PuentesRubricaPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [idEquipo, setIdEquipo] = useState<number | null>(null);

  // === PUNTAJES DE SELECTS ===
  const opciones530 = [
    { label: "Cumple (5 pts)", value: 5 },
    { label: "Parcial (3 pts)", value: 3 },
    { label: "No cumple (0 pts)", value: 0 },
  ];
  const opciones10 = [
    { label: "Sí (10 pts)", value: 10 },
    { label: "No (0 pts)", value: 0 },
  ];
  const opcionesDoc3 = [
    { label: "Sí (3 pts)", value: 3 },
    { label: "Parcial (1.5 pts)", value: 1.5 },
    { label: "No (0 pts)", value: 0 },
  ];
  const opcionesDoc4 = [
    { label: "Sí (4 pts)", value: 4 },
    { label: "Parcial (2 pts)", value: 2 },
    { label: "No (0 pts)", value: 0 },
  ];
  const opcionesOriginalidad = [
    { label: "Excelente (5 pts)", value: 5 },
    { label: "Regular (3 pts)", value: 3 },
    { label: "Baja (1 pt)", value: 1 },
  ];
  const opcionesReconocible = [
    { label: "Sí (5 pts)", value: 5 },
    { label: "No (0 pts)", value: 0 },
  ];

  // === ESTADOS DE LA RÚBRICA ===
  const [form, setForm] = useState({
    p_peso: 0,
    p_claro: 0,
    p_altura: 0,
    p_ancho: 0,
    p_cama_continua: 0,
    p_sin_pintura: 0,
    p_materiales_reciclados: 0,
    p_evitar_metales: 0,
    p_descripcion_geom: 0,
    p_metodologia: 0,
    p_memoria_calculo: 0,
    p_originalidad: 0,
    p_estructura_reconocible: 0,
    peso_puente: '',
    carga_maxima: '',
    eficiencia: 0,
    puntos_eficiencia: 0, // Agregado aquí
    comentarios: '',
  });

  const actualizar = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // === Cargar equipos categoría 6 ===
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await fetch('/api/puentes');
        const data = await res.json();
        if (data.ok) setEquipos(data.equipos);
      } catch (e) {
        console.error('Error cargando equipos:', e);
      }
    };
    fetchEquipos();
  }, []);

  // === Cálculo automático de eficiencia (P/W) ===
  useEffect(() => {
    const W = parseFloat(form.peso_puente);
    const P = parseFloat(form.carga_maxima);
    if (!isNaN(W) && W > 0 && !isNaN(P) && P > 0) {
      const R = P / W;
      actualizar("eficiencia", Number(R.toFixed(4)));
    } else {
      actualizar("eficiencia", 0);
    }
  }, [form.peso_puente, form.carga_maxima]);

  // === Puntaje total sin eficiencia ===
  const totalSinEficiencia =
    form.p_peso +
    form.p_claro +
    form.p_altura +
    form.p_ancho +
    form.p_cama_continua +
    form.p_sin_pintura +
    form.p_materiales_reciclados +
    form.p_evitar_metales +
    Number(form.p_descripcion_geom) +
    Number(form.p_metodologia) +
    Number(form.p_memoria_calculo) +
    form.p_originalidad +
    form.p_estructura_reconocible;

  // === Guardar en BD ===
  const enviar = async () => {
    if (!idEquipo) return alert("Selecciona un equipo");
    const total = totalSinEficiencia + form.puntos_eficiencia; // Cálculo del total
    const res = await fetch('/api/puentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_equipo: idEquipo,
        ...form,
        puntaje_total: total, // Agregado para enviar el total
      }),
    });
    const data = await res.json();
    if (data.ok) {
      alert("Calificación guardada");
      window.location.reload();
    } else {
      alert("Error al guardar");
    }
  };

  const estilos = {
    fondo: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundImage:
        'url("https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg")',
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      filter: "brightness(0.55) blur(1px)",
      zIndex: -1,
    },
    contenedor: {
      maxWidth: "900px",
      margin: "60px auto",
      backgroundColor: "rgba(255, 255, 255, 0.92)",
      padding: "40px",
      borderRadius: "18px",
      backdropFilter: "blur(6px)",
      boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.35)",
      border: "1px solid rgba(255,255,255,0.35)",
    },
    titulo: {
      color: "#8B0000",
      fontWeight: "800",
      textAlign: "center" as const,
      fontSize: "28px",
      marginBottom: "25px",
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
    },
    subtitulo: {
      color: "#8B0000",
      fontWeight: "700",
      marginBottom: "10px",
      fontSize: "18px",
      textTransform: "uppercase" as const,
      borderBottom: "2px solid #8B0000",
      paddingBottom: "5px",
    },
    bordeSeccion: {
      border: "2px solid #8B0000",
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "25px",
      backgroundColor: "rgba(255,255,255,0.95)",
      boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
    },
    label: {
      fontWeight: "600",
      color: "#222",
      marginBottom: "4px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1.8px solid #8B0000",
      borderRadius: "8px",
      marginBottom: "12px",
      color: "#000",
      fontWeight: "500",
      textTransform: "uppercase" as const,
      outline: "none",
      transition: "0.3s ease",
    },
    select: {
      width: "100%",
      padding: "10px",
      border: "1.8px solid #8B0000",
      borderRadius: "8px",
      marginBottom: "12px",
      color: "#000",
      fontWeight: "500",
      backgroundColor: "#fff",
      outline: "none",
      transition: "0.3s ease",
    },
    botonPrincipal: {
      backgroundColor: "#8B0000",
      color: "#fff",
      fontWeight: "700",
      border: "none",
      padding: "12px",
      borderRadius: "10px",
      transition: "0.3s ease",
      width: "100%",
      cursor: "pointer",
      marginTop: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    botonSecundario: {
      backgroundColor: "#444",
      color: "#fff",
      fontWeight: "600",
      padding: "8px 14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      marginTop: "8px",
    },
    botonEliminar: {
      backgroundColor: "#8B0000",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "8px",
    },
  };

  return (
    <>
      <div style={estilos.fondo}></div>
      <div className="position-fixed top-0 end-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 10 }}>
        <Link href="/">
          <button className="btn btn-outline-light">Cerrar Formulario</button>
        </Link>
      </div>
      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Rúbrica — Puentes de Material Reciclado</h1>
        {/* ============================
            SELECCIÓN DE EQUIPO
        ============================ */}
        <div className="mb-6">
          <label className="font-semibold" style={{ ...estilos.label, color: '#8B0000' }}>Seleccionar equipo:</label>
          <select
            style={estilos.select}
            onChange={(e) => setIdEquipo(Number(e.target.value))}
          >
            <option value="">-- Elegir --</option>
            {equipos.map((eq) => (
              <option key={eq.id_equipo} value={eq.id_equipo}>
                {eq.nombre_equipo}
              </option>
            ))}
          </select>
        </div>
        {/* ============================
            RÚBRICA
        ============================ */}
        <div style={estilos.bordeSeccion} className="space-y-4">
          {/* 5/3/0 items */}
          {[
            { key: "p_peso", label: "¿El peso del puente es menor o igual a 2kg?" },
            { key: "p_claro", label: "¿El claro libre es de 95cm?" },
            { key: "p_altura", label: "¿La altura es de 60cm?" },
            { key: "p_ancho", label: "¿El ancho es de 20cm?" },
            { key: "p_cama_continua", label: "¿Tiene cama horizontal continua?" },
            { key: "p_sin_pintura", label: "¿Está sin pintura ni recubrimientos?" },
          ].map((item) => (
            <div key={item.key}>
              <label style={{ ...estilos.label, color: '#000' }}>{item.label}</label>
              <select
                style={estilos.select}
                onChange={(e) => actualizar(item.key, Number(e.target.value))}
              >
                <option value="0">-- Seleccionar --</option>
                {opciones530.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
          ))}
          {/* 10 pts */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿Se utilizaron solo materiales reciclados?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_materiales_reciclados", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opciones10.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿Se evitaron metales estructurales o prefabricados?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_evitar_metales", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opciones10.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          {/* DOCUMENTACIÓN */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿Incluye Descripción Geométrica?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_descripcion_geom", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opcionesDoc3.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿Incluye Metodología de diseño?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_metodologia", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opcionesDoc4.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿Incluye Memoria de cálculo?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_memoria_calculo", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opcionesDoc3.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          {/* ORIGINALIDAD */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Originalidad en materiales y diseño:</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_originalidad", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opcionesOriginalidad.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          {/* RECONOCIBLE */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>¿La estructura es claramente reconocible como puente?</label>
            <select
              style={estilos.select}
              onChange={(e) => actualizar("p_estructura_reconocible", Number(e.target.value))}
            >
              <option value="0">-- Seleccionar --</option>
              {opcionesReconocible.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          {/* PRUEBA DE CARGA */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Peso del puente (W, kg):</label>
            <input
              type="number"
              style={estilos.input}
              value={form.peso_puente}
              onChange={(e) => actualizar("peso_puente", e.target.value)}
            />
          </div>
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Carga máxima soportada (P, kg):</label>
            <input
              type="number"
              style={estilos.input}
              value={form.carga_maxima}
              onChange={(e) => actualizar("carga_maxima", e.target.value)}
            />
          </div>
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Eficiencia estructural (R = P/W):</label>
            <input
              type="text"
              disabled
              style={{ ...estilos.input, backgroundColor: '#f0f0f0' }}
              value={form.eficiencia}
            />
          </div>
          {/* Puntos por eficiencia */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Puntos por eficiencia (Asignar 30 puntos al equipo con mayor R, y proporcionalmente a los demás):</label>
            <input
              type="number"
              min="0"
              max="30"
              style={estilos.input}
              value={form.puntos_eficiencia}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 30) {
                  actualizar("puntos_eficiencia", val);
                }
              }}
            />
          </div>
          {/* COMENTARIOS */}
          <div>
            <label style={{ ...estilos.label, color: '#000' }}>Comentarios (opcional):</label>
            <textarea
              style={{ ...estilos.input, textTransform: 'none' }}
              value={form.comentarios}
              onChange={(e) => actualizar("comentarios", e.target.value)}
            />
          </div>
          {/* TOTAL */}
          <div className="mt-6 text-xl font-bold text-center">
            Puntaje total: {(totalSinEficiencia + form.puntos_eficiencia).toFixed(2)} pts
          </div>
          {/* BOTÓN GUARDAR */}
          <button
            style={estilos.botonPrincipal}
            onClick={enviar}
          >
            Guardar Calificación
          </button>
        </div>
      </div>
    </>
  );
}