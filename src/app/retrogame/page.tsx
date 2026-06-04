"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RetrogameRubrica() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Campos del formulario
  const [form, setForm] = useState({
    p_funcionalidad_juego: "",
    p_calidad_codigo: "",
    p_aplicacion_conocimientos: "",
    p_presentacion_visual_sonora: "",
  });

  // ============================
  // Cargar equipos categoría 7
  // ============================
  useEffect(() => {
    async function fetchEquipos() {
      try {
        const res = await fetch("/api/retrogame");
        const data = await res.json();
        console.log("Equipos cargados:", data);
        setEquipos(data.equipos || []);
      } catch (err) {
        console.error("Error al cargar equipos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipos();
  }, []);

  // ============================
  // Manejar cambios en inputs
  // ============================
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ============================
  // Enviar formulario
  // ============================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedEquipo) {
      setMessage("Debes seleccionar un equipo.");
      return;
    }

    try {
      const res = await fetch("/api/retrogame", {
        method: "POST",
        body: JSON.stringify({
          id_equipo: selectedEquipo,
          ...form,
        }),
      });

      const data = await res.json();
      console.log("Respuesta:", data);

      if (data.error) {
        setMessage(data.error);
        return;
      }

      setMessage("Calificación guardada correctamente ");

      // Limpiar formulario
      setForm({
        p_funcionalidad_juego: "",
        p_calidad_codigo: "",
        p_aplicacion_conocimientos: "",
        p_presentacion_visual_sonora: "",
      });
      setSelectedEquipo(null);

    } catch (err) {
      console.error(err);
      setMessage("Error al enviar la calificación.");
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
        <h1 style={estilos.titulo}>
          Calificación – RETROGAME 8 BITS
        </h1>

        {/* --------------------------- */}
        {/* Seleccionar equipo           */}
        {/* --------------------------- */}
        <div className="mb-4">
          <label className="form-label fw-bold" style={{ ...estilos.label, color: '#8B0000' }}>
            Seleccionar equipo
          </label>
          {loading ? (
            <p>Cargando equipos...</p>
          ) : (
            <select
              value={selectedEquipo || ""}
              onChange={(e) => setSelectedEquipo(Number(e.target.value))}
              style={estilos.select}
            >
              <option value="">-- Seleccionar --</option>
              {equipos.map((eq: any) => (
                <option key={eq.id_equipo} value={eq.id_equipo}>
                  {eq.nombre_equipo}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* --------------------------- */}
        {/* Formulario de rúbrica       */}
        {/* --------------------------- */}
        {selectedEquipo && (
          <div style={estilos.bordeSeccion}>
            <h2 style={estilos.subtitulo}>Rúbrica de Evaluación</h2>
            <form onSubmit={handleSubmit}>
              {/* Preguntas */}
              {[
                {
                  key: "p_funcionalidad_juego",
                  label: "¿El videojuego se puede ejecutar y jugar de forma estable y completa?",
                },
                {
                  key: "p_calidad_codigo",
                  label: "¿El código está estructurado, es legible y demuestra buenas prácticas de programación?",
                },
                {
                  key: "p_aplicacion_conocimientos",
                  label: "¿El juego aplica conceptos de desarrollo de manera amplia y/o demuestra innovación en sus mecánicas?",
                },
                {
                  key: "p_presentacion_visual_sonora",
                  label: "¿La presentación visual y sonora es coherente, estética y se alinea de manera efectiva con el tema retro?",
                },
              ].map((q) => (
                <div key={q.key} className="mb-3">
                  <label className="form-label" style={{ ...estilos.label, color: '#000' }}>{q.label}</label>
                  <select
                    name={q.key}
                    value={(form as any)[q.key]}
                    onChange={handleChange}
                    required
                    style={estilos.select}
                  >
                    <option value="">-- Selecciona una opción --</option>
                    <option value="3">3 - Excelente</option>
                    <option value="2">2 - Bueno</option>
                    <option value="1">1 - Deficiente</option>
                    <option value="0.5">0.5 - Nulo</option>
                  </select>
                </div>
              ))}

              <button
                type="submit"
                style={estilos.botonPrincipal}
              >
                Guardar Calificación
              </button>
            </form>
          </div>
        )}

        {/* Mensaje */}
        {message && (
          <div className="alert alert-info text-center" style={{ color: '#000' }}>{message}</div>
        )}
      </div>
    </>
  );
}