"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IncubadoraAlumnoPage() {
  const router = useRouter();

  const [nombreProyecto, setNombreProyecto] = useState("");
  const [representante, setRepresentante] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
  });
  const [integrantes, setIntegrantes] = useState<
    { nombre: string; apellido_paterno: string; apellido_materno: string }[]
  >([]);

  // ------------------------------------------
  // VALIDAR Y FORZAR MAYÚSCULAS
  // ------------------------------------------
  const soloLetras = (value: string) => value.replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");

  const handleChangeProyecto = (e: any) => {
    setNombreProyecto(e.target.value.toUpperCase());
  };

  const handleChangeRepresentante = (e: any) => {
    const name = e.target.name;
    const value = soloLetras(e.target.value.toUpperCase());
    setRepresentante({ ...representante, [name]: value });
  };

  const handleChangeIntegrante = (index: number, e: any) => {
    const name = e.target.name;
    const value = soloLetras(e.target.value.toUpperCase());
    setIntegrantes((prev) =>
      prev.map((int, i) => (i === index ? { ...int, [name]: value } : int))
    );
  };

  const addIntegrante = () => {
    if (integrantes.length < 3) {
      setIntegrantes([
        ...integrantes,
        { nombre: "", apellido_paterno: "", apellido_materno: "" },
      ]);
    }
  };

  const removeIntegrante = (index: number) => {
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  // ------------------------------------------
  // ENVIAR FORMULARIO
  // ------------------------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Filtrar integrantes con nombre vacío
    const integrantesFiltrados = integrantes.filter((int) => int.nombre);

    const body = {
      nombre_proyecto: nombreProyecto,
      representante: {
        nombre: representante.nombre,
        apellido_paterno: representante.apellido_paterno,
        apellido_materno: representante.apellido_materno,
      },
      integrantes: integrantesFiltrados,
    };

    const res = await fetch("/api/incubadora_alumno", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message || data.error);

    if (data.message) {
      router.push("/registro-exitoso");
    }
  };

  // ------------------------------------------
  // ESTILOS (copiados del estilo de referencia, con ajustes para títulos)
  // ------------------------------------------
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
    botonAgregar: {
      backgroundColor: "#8B0000",
      color: "#fff",
      fontWeight: "600",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      transition: "0.3s ease",
      cursor: "pointer",
      marginTop: "15px",
      marginBottom: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
    botonEliminar: {
      backgroundColor: "#dc3545",
      color: "#fff",
      fontWeight: "600",
      border: "none",
      padding: "6px 12px",
      borderRadius: "6px",
      transition: "0.3s ease",
      cursor: "pointer",
      marginTop: "10px",
    },
  };

  // ------------------------------------------
  // RENDER FORM
  // ------------------------------------------
  return (
    <>
      <div style={estilos.fondo}></div>

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10 }}>
        <Link href="/">
          <button className="btn btn-outline-light">Cerrar Formulario</button>
        </Link>
      </div>

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>REGISTRO DE EQUIPO INCUBADORA</h1>

        <form onSubmit={handleSubmit} className="mt-3">
          {/* NOMBRE DEL PROYECTO */}
          <label style={estilos.label}>NOMBRE DEL PROYECTO</label>
          <input
            style={estilos.input}
            value={nombreProyecto}
            onChange={handleChangeProyecto}
            required
          />

          {/* REPRESENTANTE (ALUMNO 1) */}
          <h3 style={estilos.subtitulo}>ALUMNO 1 (REPRESENTANTE)</h3>

          <label style={estilos.label}>NOMBRE(S)</label>
          <input
            name="nombre"
            style={estilos.input}
            value={representante.nombre}
            onChange={handleChangeRepresentante}
            required
          />

          <label style={estilos.label}>APELLIDO PATERNO</label>
          <input
            name="apellido_paterno"
            style={estilos.input}
            value={representante.apellido_paterno}
            onChange={handleChangeRepresentante}
            required
          />

          <label style={estilos.label}>APELLIDO MATERNO</label>
          <input
            name="apellido_materno"
            style={estilos.input}
            value={representante.apellido_materno}
            onChange={handleChangeRepresentante}
            required
          />

          {/* INTEGRANTES DINÁMICOS */}
          {integrantes.map((integrante, index) => (
            <div key={index}>
              <h3 style={estilos.subtitulo}>ALUMNO {index + 2}</h3>

              <label style={estilos.label}>NOMBRE(S)</label>
              <input
                name="nombre"
                style={estilos.input}
                value={integrante.nombre}
                onChange={(e) => handleChangeIntegrante(index, e)}
              />

              <label style={estilos.label}>APELLIDO PATERNO</label>
              <input
                name="apellido_paterno"
                style={estilos.input}
                value={integrante.apellido_paterno}
                onChange={(e) => handleChangeIntegrante(index, e)}
              />

              <label style={estilos.label}>APELLIDO MATERNO</label>
              <input
                name="apellido_materno"
                style={estilos.input}
                value={integrante.apellido_materno}
                onChange={(e) => handleChangeIntegrante(index, e)}
              />

              <button
                type="button"
                style={estilos.botonEliminar}
                onClick={() => removeIntegrante(index)}
              >
                Eliminar Integrante
              </button>
            </div>
          ))}

          {integrantes.length < 3 && (
            <button
              type="button"
              style={estilos.botonAgregar}
              onClick={addIntegrante}
            >
              Agregar Integrante
            </button>
          )}

          <button style={estilos.botonPrincipal}>REGISTRAR EQUIPO</button>
        </form>
      </div>
    </>
  );
}