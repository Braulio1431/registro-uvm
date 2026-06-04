"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function MicroRubricaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [equipos, setEquipos] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [profesorNombre, setProfesorNombre] = useState("");
  const [equipoNombre, setEquipoNombre] = useState("");

  const criterios = [
    "RESUMEN",
    "INTRODUCCIÓN",
    "FUNDAMENTACIÓN TEÓRICA",
    "OBJETIVO GENERAL",
    "METODOLOGÍA",
    "RESULTADOS Y DISCUSIÓN",
    "PRODUCTO ESPERADO",
    "FORMATO DEL CARTEL",
    "PRESENTACIÓN ORAL",
    "REFERENCIAS BIBLIOGRÁFICAS",
  ];

  const [form, setForm] = useState({
    id_equipoMicro: "",
    id_profMicro: "",

    resumen: "",
    introduccion: "",
    fundamentacion_teorica: "",
    objetivo_general: "",
    metodologia: "",
    resultados_discusion: "",
    producto_esperado: "",
    formato_cartel: "",
    presentacion_oral: "",
    referencias_bibliograficas: "",
  });

  const camposRubrica = [
    "resumen",
    "introduccion",
    "fundamentacion_teorica",
    "objetivo_general",
    "metodologia",
    "resultados_discusion",
    "producto_esperado",
    "formato_cartel",
    "presentacion_oral",
    "referencias_bibliograficas",
  ];

  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await fetch("/api/profesormicro");
        const data = await res.json();
        setProfesores(data.profesores || []);
        setEquipos(data.equipos || []);
      } catch (error) {
        console.error("ERROR AL CARGAR DATOS:", error);
      }
    }

    cargarDatos();

    const id_equipoMicro = searchParams.get('id_equipoMicro') || '';
    const id_profMicro = searchParams.get('id_profMicro') || '';
    const profesor_nombre = decodeURIComponent(searchParams.get('profesor_nombre') || '');
    const equipo_nombre = decodeURIComponent(searchParams.get('equipo_nombre') || '');

    setForm(prev => ({ ...prev, id_equipoMicro, id_profMicro }));
    setProfesorNombre(profesor_nombre);
    setEquipoNombre(equipo_nombre);
  }, [searchParams]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validación rápida
    const allowedValues = [0, 0.6, 0.8, 0.9, 1];
    for (let campo of camposRubrica) {
      const valorStr = form[campo as keyof typeof form];
      const valor = Number(valorStr);
      if (isNaN(valor) || !allowedValues.includes(valor)) {
        alert("TODAS LAS CALIFICACIONES DEBEN SER UNO DE: 0, 0.6, 0.8, 0.9, 1.");
        return;
      }
    }

    if (!form.id_equipoMicro) {
      alert("DEBE SELECCIONAR UN PROYECTO.");
      return;
    }

    if (!form.id_profMicro) {
      alert("DEBE SELECCIONAR UN PROFESOR (JURADO).");
      return;
    }

    const payload = {
      id_equipoMicro: form.id_equipoMicro,
      id_profMicro: form.id_profMicro,
      resumen: Number(form.resumen),
      introduccion: Number(form.introduccion),
      fundamentacion_teorica: Number(form.fundamentacion_teorica),
      objetivo_general: Number(form.objetivo_general),
      metodologia: Number(form.metodologia),
      resultados_discusion: Number(form.resultados_discusion),
      producto_esperado: Number(form.producto_esperado),
      formato_cartel: Number(form.formato_cartel),
      presentacion_oral: Number(form.presentacion_oral),
      referencias_bibliograficas: Number(form.referencias_bibliograficas),
    };

    const res = await fetch("/api/micro_rubrica", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(data.message || data.error);

    if (data.ok) {
      router.push("/registro-exitoso");
    }
  };

  // ESTILOS (copiados del estilo de referencia)
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
      position: "relative" as const,
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
      fontSize: "20px",
      marginTop: "20px",
      marginBottom: "10px",
      letterSpacing: "1px",
      textTransform: "uppercase" as const,
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
      textTransform: "uppercase" as const,
      outline: "none",
      transition: "0.3s ease",
    },
    textarea: {
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
      minHeight: "120px",
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
  };

  return (
    <>
      <div style={estilos.fondo}></div>

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10 }}>
        <Link href="/">
          <button className="btn btn-outline-light">Cerrar Formulario</button>
        </Link>
      </div>

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>RÚBRICA MICRO</h1>

        {profesorNombre && (
          <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px", color: "#8B0000" }}>
            Evaluador: {profesorNombre}
          </p>
        )}

        {equipoNombre && (
          <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px", color: "#8B0000" }}>
            Proyecto: {equipoNombre}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* EQUIPO - Solo mostrar si no viene en params */}
          {!searchParams.get("id_equipoMicro") && (
            <>
              <label style={estilos.label}>SELECCIONE EL PROYECTO</label>
              <select
                name="id_equipoMicro"
                style={estilos.select}
                value={form.id_equipoMicro}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE...</option>
                {equipos.map((e) => (
                  <option key={e.id_equipoMicro} value={e.id_equipoMicro}>
                    {e.nombre_proyecto}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* PROFESOR - Solo mostrar si no viene en params */}
          {!searchParams.get("id_profMicro") && (
            <>
              <label style={estilos.label}>SELECCIONE AL PROFESOR (JURADO)</label>
              <select
                name="id_profMicro"
                style={estilos.select}
                value={form.id_profMicro}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE...</option>
                {profesores.map((p) => (
                  <option key={p.id_profMicro} value={p.id_profMicro}>
                    {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* CRITERIOS */}
          {criterios.map((criterio, index) => (
            <div key={index}>
              <label style={estilos.label}>
                {index + 1}.- {criterio}
              </label>
              <select
                name={camposRubrica[index]}
                style={estilos.select}
                value={form[camposRubrica[index] as keyof typeof form]}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE (NECSITA MEJORA (0), SATISFACTORIO(0.6), BUENO (0.8), MUY BUENO (0.9),EXCELENTE (1))</option>
                <option value="0">NECESITA MEJORAR</option>
                <option value="0.6">SATISFACTORIO</option>
                <option value="0.8">BUENO</option>
                <option value="0.9">MUY BUENO</option>
                <option value="1">EXCELENTE</option>
              </select>
            </div>
          ))}

          <button style={estilos.botonPrincipal}>ENVIAR EVALUACIÓN</button>
        </form>
      </div>
    </>
  );
}