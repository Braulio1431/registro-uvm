"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RubricaIncubadoraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [equipos, setEquipos] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [profesorNombre, setProfesorNombre] = useState("");
  const [equipoNombre, setEquipoNombre] = useState("");

  const preguntas = [
    "EL NOMBRE DEL PROYECTO Y LA IMAGEN DE LA MARCA SON CONGRUENTES CON EL TIPO DE PRODUCTO / SERVICIO QUE OFRECE.",
    "LA EMPRESA PRETENDE PRODUCIR O DESARROLLAR PRODUCTOS O SERVICIOS QUE CUBREN NECESIDADES REALES.",
    "LA IDEA DEL MODELO DE NEGOCIO ES INNOVADORA DE TAL FORMA QUE LE PERMITE AL PROYECTO ALCANZAR EL CRECIMIENTO, LA DIVERSIFICACIÓN Y/O LA ENTRADA A NUEVOS MERCADOS.",
    "EL MODELO DE NEGOCIO CONSIDERA SOLUCIONES A PROBLEMÁTICAS RELEVANTES.",
    "EL PROYECTO IDENTIFICA CLARAMENTE LOS SEGMENTOS DE MERCADO, SUS COMPETIDORES Y LAS ESTRATEGIAS DE MARKETING.",
    "IDENTIFICA LA INFRAESTRUCTURA E INSUMOS QUE SON NECESARIOS.",
    "DESCRIBE LOS RECURSOS FINANCIEROS NECESARIOS, COSTOS Y ESTRUCTURA DE INGRESOS.",
    "LA IDEA, PRODUCTO O SERVICIO ESTÁ BIEN DEFINIDO Y PRESENTA VENTAJAS COMPARATIVAS RESPECTO A OTROS.",
  ];

  const [form, setForm] = useState({
    id_equipo: "",
    id_jurado: "",

    p_nombre_marca: "",
    p_necesidad_real: "",
    p_originalidad: "",
    p_pertinencia: "",
    p_mercado: "",
    p_proceso: "",
    p_finanzas: "",
    p_ventajas: "",

    acciones_futuras: "",
    comentarios_adicionales: "",
  });

  const camposRubrica = [
    "p_nombre_marca",
    "p_necesidad_real",
    "p_originalidad",
    "p_pertinencia",
    "p_mercado",
    "p_proceso",
    "p_finanzas",
    "p_ventajas",
  ];

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resEquipos = await fetch("/api/incubadora_profesor");
        const dataEquipos = await resEquipos.json();
        setProfesores(dataEquipos.profesores || []);
        setEquipos(dataEquipos.equipos || []);
      } catch (error) {
        console.error("ERROR AL CARGAR DATOS:", error);
      }
    }

    cargarDatos();

    const id_equipo = searchParams.get('id_equipo') || '';
    const id_jurado = searchParams.get('id_jurado') || '';
    const profesor_nombre = decodeURIComponent(searchParams.get('profesor_nombre') || '');
    const equipo_nombre = decodeURIComponent(searchParams.get('equipo_nombre') || '');

    setForm(prev => ({ ...prev, id_equipo, id_jurado }));
    setProfesorNombre(profesor_nombre);
    setEquipoNombre(equipo_nombre);
  }, [searchParams]);

  const handleChange = (e: any) => {
    let value = e.target.value.toUpperCase();
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validación rápida
    for (let campo of camposRubrica) {
      const valor = Number(form[campo as keyof typeof form]);
      if (!valor || valor < 1 || valor > 5) {
        alert("TODAS LAS CALIFICACIONES DEBEN SER DEL 1 AL 5.");
        return;
      }
    }

    if (!form.id_equipo) {
      alert("DEBE SELECCIONAR UN PROYECTO.");
      return;
    }

    if (!form.id_jurado) {
      alert("DEBE SELECCIONAR UN PROFESOR (JURADO).");
      return;
    }

    if (!form.acciones_futuras) {
      alert("DEBE SELECCIONAR LAS ACCIONES FUTURAS.");
      return;
    }

    const payload = {
      id_equipo: form.id_equipo,
      id_jurado: form.id_jurado,
      p_nombre_marca: Number(form.p_nombre_marca),
      p_necesidad_real: Number(form.p_necesidad_real),
      p_originalidad: Number(form.p_originalidad),
      p_pertinencia: Number(form.p_pertinencia),
      p_mercado: Number(form.p_mercado),
      p_proceso: Number(form.p_proceso),
      p_finanzas: Number(form.p_finanzas),
      p_ventajas: Number(form.p_ventajas),
      acciones_futuras: form.acciones_futuras,
      comentarios_adicionales: form.comentarios_adicionales,
    };

    const res = await fetch("/api/incubadora_rubrica", {
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
        <h1 style={estilos.titulo}>RÚBRICA DE INCUBADORA</h1>

        {profesorNombre && (
          <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px", color: "#8B0000" }}>
            Profesor: {profesorNombre}
          </p>
        )}

        {equipoNombre && (
          <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px", color: "#8B0000" }}>
            Proyecto: {equipoNombre}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* EQUIPO - Solo mostrar si no viene en params */}
          {!searchParams.get("id_equipo") && (
            <>
              <label style={estilos.label}>SELECCIONE EL PROYECTO</label>
              <select
                name="id_equipo"
                style={estilos.select}
                value={form.id_equipo}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE...</option>
                {equipos.map((e) => (
                  <option key={e.id_equipo} value={e.id_equipo}>
                    {e.nombre_proyecto}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* PROFESOR - Solo mostrar si no viene en params */}
          {!searchParams.get("id_jurado") && (
            <>
              <label style={estilos.label}>SELECCIONE AL PROFESOR (JURADO)</label>
              <select
                name="id_jurado"
                style={estilos.select}
                value={form.id_jurado}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE...</option>
                {profesores.map((p) => (
                  <option key={p.id_jurado} value={p.id_jurado}>
                    {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* PREGUNTAS */}
          {preguntas.map((pregunta, index) => (
            <div key={index}>
              <label style={estilos.label}>
                {index + 1}.- {pregunta}
              </label>
              <select
                name={camposRubrica[index]}
                style={estilos.select}
                value={form[camposRubrica[index] as keyof typeof form]}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONE (1-5)</option>
                <option value="1">1 - MUY MALO</option>
                <option value="2">2 - MALO</option>
                <option value="3">3 - REGULAR</option>
                <option value="4">4 - BUENO</option>
                <option value="5">5 - MUY BUENO</option>
              </select>
            </div>
          ))}

          {/* 9. ACCIONES FUTURAS */}
          <label style={estilos.label}>9.- EL PROYECTO DEBE:</label>
          <select
            name="acciones_futuras"
            style={estilos.select}
            value={form.acciones_futuras}
            onChange={handleChange}
            required
          >
            <option value="">SELECCIONE...</option>
            <option value="CONTINUAR FORTALECIENDO">CONTINUAR FORTALECIENDO</option>
            <option value="REDIRECCIONAR">REDIRECCIONAR</option>
            <option value="NO CONTINUAR">NO CONTINUAR</option>
          </select>

          {/* 10. COMENTARIOS */}
          <label style={estilos.label}>10.- COMENTARIOS ADICIONALES:</label>
          <textarea
            name="comentarios_adicionales"
            style={estilos.textarea}
            value={form.comentarios_adicionales}
            onChange={handleChange}
          />

          <button style={estilos.botonPrincipal}>ENVIAR EVALUACIÓN</button>
        </form>
      </div>
    </>
  );
}