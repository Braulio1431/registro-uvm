"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IncubadoraProfesorPage() {
  const router = useRouter();

  const [profesores, setProfesores] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);

  const [tipoProfesor, setTipoProfesor] = useState(""); // REGISTRADO / NUEVO

  const [profesorNuevo, setProfesorNuevo] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
  });

  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");

  // ---------------------------------------------------
  // CARGAR DATOS DESDE EL API
  // ---------------------------------------------------
  useEffect(() => {
    const cargarDatos = async () => {
      const res = await fetch("/api/incubadora_profesor");
      const data = await res.json();

      setProfesores(data.profesores || []);
      setEquipos(data.equipos || []);
    };

    cargarDatos();
  }, []);

  // ---------------------------------------------------
  // VALIDACIONES DE CAMPOS (SOLO LETRAS, SIN NÚMEROS)
  // ---------------------------------------------------
  const soloLetras = (value: string) => value.replace(/[^A-ZÁÉÍÓÚÑ ]/g, "");

  const handleChangeNuevo = (e: any) => {
    let value = e.target.value.toUpperCase();
    value = soloLetras(value);

    setProfesorNuevo({
      ...profesorNuevo,
      [e.target.name]: value,
    });
  };

  // ---------------------------------------------------
  // ENVIAR FORMULARIO AL API
  // ---------------------------------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!tipoProfesor) {
      alert("DEBE SELECCIONAR EL TIPO DE PROFESOR.");
      return;
    }

    if (!equipoSeleccionado) {
      alert("DEBE SELECCIONAR UN EQUIPO A CALIFICAR.");
      return;
    }

    let payload: any = {
      tipo_profesor: tipoProfesor,
      id_equipo: equipoSeleccionado,
    };

    if (tipoProfesor === "REGISTRADO") {
      if (!profesorSeleccionado) {
        alert("DEBE SELECCIONAR UN PROFESOR REGISTRADO.");
        return;
      }

      payload.profesor = { id_jurado: profesorSeleccionado };
    }

    if (tipoProfesor === "NUEVO") {
      if (
        !profesorNuevo.nombre ||
        !profesorNuevo.apellido_paterno ||
        !profesorNuevo.apellido_materno
      ) {
        alert("DEBE LLENAR LOS DATOS DEL NUEVO PROFESOR.");
        return;
      }

      payload.profesor = profesorNuevo;
    }

    const res = await fetch("/api/incubadora_profesor", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    alert(data.message || data.error || "Guardado correctamente");

    if (data.ok) {
      let profesorNombre = '';
      if (tipoProfesor === "REGISTRADO") {
        const prof = profesores.find(p => p.id_jurado === Number(profesorSeleccionado));
        if (!prof) {
          alert("No se encontró el profesor seleccionado.");
          return;
        }
        profesorNombre = `${prof.nombre} ${prof.apellido_paterno} ${prof.apellido_materno}`;
      } else {
        profesorNombre = `${profesorNuevo.nombre} ${profesorNuevo.apellido_paterno} ${profesorNuevo.apellido_materno}`;
      }
      const equipo = equipos.find(eq => eq.id_equipo === Number(equipoSeleccionado));
      if (!equipo) {
        alert("No se encontró el equipo seleccionado.");
        return;
      }
      const equipoNombre = equipo.nombre_proyecto || '';
      const idJurado = data.id_jurado;
      const idEquipo = equipoSeleccionado;
      router.push(`/incubadora_rubrica?id_equipo=${idEquipo}&id_jurado=${idJurado}&profesor_nombre=${encodeURIComponent(profesorNombre)}&equipo_nombre=${encodeURIComponent(equipoNombre)}`);
    }
  };

  // ---------------------------------------------------
  // ESTILOS GLOBALES INLINE
  // ---------------------------------------------------
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
    boton: {
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

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <>
      <div style={estilos.fondo}></div>

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10 }}>
        <Link href="/">
          <button className="btn btn-outline-light">Cerrar Formulario</button>
        </Link>
      </div>

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>REGISTRO DE PROFESOR</h1>

        <form onSubmit={handleSubmit}>
          {/* TIPO PROFESOR */}
          <label style={estilos.label}>TIPO DE PROFESOR</label>
          <select
            style={estilos.select}
            value={tipoProfesor}
            onChange={(e) => setTipoProfesor(e.target.value)}
            required
          >
            <option value="">SELECCIONE...</option>
            <option value="REGISTRADO">PROFESOR REGISTRADO</option>
            <option value="NUEVO">NUEVO PROFESOR</option>
          </select>

          {/* PROFESOR REGISTRADO */}
          {tipoProfesor === "REGISTRADO" && (
            <>
              <label style={estilos.label}>SELECCIONE PROFESOR</label>
              <select
                style={estilos.select}
                value={profesorSeleccionado}
                onChange={(e) => setProfesorSeleccionado(e.target.value)}
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

          {/* NUEVO PROFESOR */}
          {tipoProfesor === "NUEVO" && (
            <>
              <label style={estilos.label}>NOMBRE</label>
              <input
                name="nombre"
                style={estilos.input}
                value={profesorNuevo.nombre}
                onChange={handleChangeNuevo}
              />

              <label style={estilos.label}>APELLIDO PATERNO</label>
              <input
                name="apellido_paterno"
                style={estilos.input}
                value={profesorNuevo.apellido_paterno}
                onChange={handleChangeNuevo}
              />

              <label style={estilos.label}>APELLIDO MATERNO</label>
              <input
                name="apellido_materno"
                style={estilos.input}
                value={profesorNuevo.apellido_materno}
                onChange={handleChangeNuevo}
              />
            </>
          )}

          {/* EQUIPO */}
          <label style={estilos.label}>EQUIPO / NOMBRE DEL PROYECTO</label>
          <select
            style={estilos.select}
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
            required
          >
            <option value="">SELECCIONE...</option>
            {equipos.map((eq) => (
              <option key={eq.id_equipo} value={eq.id_equipo}>
                {eq.nombre_proyecto}
              </option>
            ))}
          </select>

          <button style={estilos.boton}>GUARDAR PROFESOR</button>
        </form>
      </div>
    </>
  );
}