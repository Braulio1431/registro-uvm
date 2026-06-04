"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function CompetenciasPage() {
  const categorias = [
    "SUMO",
    "MINISUMO",
    "SOLUCIÓN DE LABERINTO",
    "ARTE GENERADO POR IA",
    "DESIGN SPEED (SOLIDWORKS)",
    "PUENTES DE MATERIAL RECICLADO",
    "RETROGAME 8 BITS",
    "3ER CONCURSO NACIONAL DE INVENTORES LINCE",
  ];

  const categoriasIndividuales = [
    "ARTE GENERADO POR IA",
    "DESIGN SPEED (SOLIDWORKS)",
  ];

  // CARRERAS UVM
  const carreras = [
    "BIOQUIMICA",
    "BIOTECNOLOGIA",
    "ELECTRONICA",
    "FISICA",
    "INGENIERIA BIOMEDICA",
    "INGENIERIA CIVIL",
    "INGENIERÍA EN ANIMACIÓN E INTERACTIVIDAD",
    "INGENIERIA EN CIENCIAS DE DATOS",
    "INGENIERIA EN DESARROLLO DE VIDEOJUEGOS",
    "INGENIERIA EN ENERGIA Y DESARROLLO SUSTENTABLE",
    "INGENIERIA EN MECATRONICA CON ENFOQUE AUTOMOTRIZ",
    "INGENIERIA EN PETROLEO Y GAS",
    "INGENIERIA EN ROBOTICA",
    "INGENIERÍA EN SISTEMAS COMPUTACIONALES",
    "INGENIERIA INDUSTRIAL Y DE SISTEMAS",
    "INGENIERIA MECANICA INDUSTRIAL",
    "INGENIERÍA MECATRÓNICA",
    "INTELIGENCIA ARTIFICIAL Y CIENCIAS DE DATOS",
  ];

  // SEMESTRES 1 A 10
  const semestres = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  // CAMPUS UVM
  const campusUVM = [
    "AGUASCALIENTES",
    "CHIHUAHUA",
    "CIUDAD JUÁREZ",
    "CIUDAD VICTORIA",
    "COYOACÁN - TLALPAN",
    "CUERNAVACA",
    "GUADALAJARA NORTE",
    "GUADALAJARA SUR",
    "HERMOSILLO",
    "HISPANO",
    "LOMAS VERDES",
    "MÉRIDA",
    "MONTERREY",
    "NUEVO LAREDO",
    "PUEBLA",
    "QUERÉTARO",
    "SAN RAFAEL",
    "SAN LUIS POTOSÍ",
    "TEXCOCO",
    "TOLUCA",
    "TORREÓN",
    "TUXTLA",
    "VERACRUZ",
    "VILLAHERMOSA",
    "ZAPOPAN",
  ];

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
    botonPrincipalHover: {
      backgroundColor: "#a70000",
      transform: "scale(1.03)",
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

  const [categoria, setCategoria] = useState("");
  const [participantes, setParticipantes] = useState<any[]>([
    {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      matricula: "",
      telefono: "",
      carrera: "",
      semestre: "",
      campus: "",
    },
  ]);

  const [nombreEquipo, setNombreEquipo] = useState("");
  const [profesorActivo, setProfesorActivo] = useState(false);

  const [profesor, setProfesor] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    matricula: "",
    telefono: "",
    campus: "",
    tipo_profesor: "",
  });

  const esIndividual = categoria && categoriasIndividuales.includes(categoria);

  const router = useRouter();

  // ==========================================================
  // NORMALIZADORES
  // ==========================================================

  const aMayus = (txt: string) => txt.toUpperCase();

  const soloNumeros10 = (txt: string) => txt.replace(/\D/g, "").slice(0, 10);

  // ==========================================================
  // PARTICIPANTES
  // ==========================================================

  const agregarParticipante = () => {
    if (esIndividual) return;
    if (participantes.length >= 5) return alert("Máximo 5 participantes.");

    setParticipantes([
      ...participantes,
      {
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        matricula: "",
        telefono: "",
        carrera: "",
        semestre: "",
        campus: "",
      },
    ]);
  };

  const eliminarParticipante = (index: number) => {
    if (participantes.length === 1) return;

    const copia = [...participantes];
    copia.splice(index, 1);
    setParticipantes(copia);
  };

  const actualizarParticipante = (index: number, campo: string, valor: string) => {
    const copia = [...participantes];

    if (campo === "telefono" || campo === "matricula") {
      copia[index][campo] = soloNumeros10(valor);
    } else {
      copia[index][campo] = aMayus(valor);
    }

    setParticipantes(copia);
  };

  // ==========================================================
  // ENVIAR FORMULARIO
  // ==========================================================

  const enviarRegistro = async () => {
    if (!categoria) return alert("Seleccione una categoría.");

    if (!esIndividual && nombreEquipo.trim().length === 0)
      return alert("Ingrese el nombre del equipo.");

    const payload: any = {
      categoria: aMayus(categoria),
      nombreEquipo: esIndividual ? null : aMayus(nombreEquipo),
      participantes: participantes.map((p) => ({
        ...p,
        nombre: aMayus(p.nombre),
        apellidoPaterno: aMayus(p.apellidoPaterno),
        apellidoMaterno: aMayus(p.apellidoMaterno),
        carrera: aMayus(p.carrera),
        semestre: aMayus(p.semestre),
        campus: aMayus(p.campus),
      })),
      profesor: profesorActivo
        ? {
            ...profesor,
            nombre: aMayus(profesor.nombre),
            apellidoPaterno: aMayus(profesor.apellidoPaterno),
            apellidoMaterno: aMayus(profesor.apellidoMaterno),
            matricula: soloNumeros10(profesor.matricula),
            telefono: soloNumeros10(profesor.telefono),
            campus: aMayus(profesor.campus),
            tipo_profesor: aMayus(profesor.tipo_profesor),
          }
        : null,
    };

    console.log("📦 Enviando JSON:", payload);

    try {
      const res = await fetch("/api/competencias", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/registro-exitoso");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error en el servidor.");
    }
  };

  return (
    <>
      <div style={estilos.fondo} />

<div className="position-absolute top-0 end-0 mt-3 me-3 d-flex flex-column gap-2">
  <Link href="/">
    <button className="btn btn-outline-light">Cerrar Formulario</button>
  </Link>
</div>

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Registro de Competencias</h1>

        {/* ===================================
              CATEGORÍA
        =================================== */}
        <label style={estilos.label}>Categoría:</label>
        <select
          style={estilos.select}
          value={categoria}
          onChange={(e) => {
            setCategoria(aMayus(e.target.value));
            setParticipantes([
              {
                nombre: "",
                apellidoPaterno: "",
                apellidoMaterno: "",
                matricula: "",
                telefono: "",
                carrera: "",
                semestre: "",
                campus: "",
              },
            ]);
          }}
        >
          <option value="">Seleccione...</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* ===================================
              EQUIPO
        =================================== */}
        {!esIndividual && categoria && (
          <>
            <label style={estilos.label}>Nombre del equipo:</label>
            <input
              style={estilos.input}
              type="text"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(aMayus(e.target.value))}
            />
          </>
        )}

        <h3 style={estilos.subtitulo}>Participantes ({esIndividual ? "Individual" : "Equipo"})</h3>

        {participantes.map((p, index) => (
          <div
            key={index}
            style={estilos.bordeSeccion}
          >
            <h4 style={estilos.subtitulo}>Participante {index + 1}</h4>

            <input
              style={estilos.input}
              placeholder="Nombre"
              value={p.nombre}
              onChange={(e) =>
                actualizarParticipante(index, "nombre", e.target.value)
              }
            />

            <input
              style={estilos.input}
              placeholder="Apellido paterno"
              value={p.apellidoPaterno}
              onChange={(e) =>
                actualizarParticipante(index, "apellidoPaterno", e.target.value)
              }
            />

            <input
              style={estilos.input}
              placeholder="Apellido materno"
              value={p.apellidoMaterno}
              onChange={(e) =>
                actualizarParticipante(index, "apellidoMaterno", e.target.value)
              }
            />

            <input
              style={estilos.input}
              placeholder="Matrícula"
              value={p.matricula}
              onChange={(e) =>
                actualizarParticipante(index, "matricula", e.target.value)
              }
            />

            <input
              style={estilos.input}
              placeholder="Teléfono"
              value={p.telefono}
              onChange={(e) =>
                actualizarParticipante(index, "telefono", e.target.value)
              }
            />

            {/* ===================================
                  SELECT CARRERA
            =================================== */}
            <label style={estilos.label}>Carrera: </label>
            <select
              style={estilos.select}
              value={p.carrera}
              onChange={(e) =>
                actualizarParticipante(index, "carrera", e.target.value)
              }
            >
              <option value="">Seleccione...</option>
              {carreras.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* ===================================
                  SELECT SEMESTRE
            =================================== */}
            <label style={estilos.label}>Semestre: </label>
            <select
              style={estilos.select}
              value={p.semestre}
              onChange={(e) =>
                actualizarParticipante(index, "semestre", e.target.value)
              }
            >
              <option value="">Seleccione...</option>
              {semestres.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* ===================================
                  SELECT CAMPUS
            =================================== */}
            <label style={estilos.label}>Campus: </label>
            <select
              style={estilos.select}
              value={p.campus}
              onChange={(e) =>
                actualizarParticipante(index, "campus", e.target.value)
              }
            >
              <option value="">Seleccione...</option>
              {campusUVM.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {!esIndividual && participantes.length > 1 && index > 0 && (
              <button style={estilos.botonEliminar} onClick={() => eliminarParticipante(index)}>
                Eliminar participante
              </button>
            )}
          </div>
        ))}

        {!esIndividual && (
          <button style={estilos.botonSecundario} onClick={agregarParticipante}>Agregar participante</button>
        )}

        {/* ===================================
              PROFESOR
        =================================== */}
        <h3 style={estilos.subtitulo}>Profesor acompañante</h3>

        <label style={estilos.label}>
          <input
            type="checkbox"
            checked={profesorActivo}
            onChange={() => setProfesorActivo(!profesorActivo)}
          />
          Registrar profesor
        </label>

        {profesorActivo && (
          <div style={estilos.bordeSeccion}>
            <input
              style={estilos.input}
              placeholder="Nombre"
              value={profesor.nombre}
              onChange={(e) =>
                setProfesor({ ...profesor, nombre: aMayus(e.target.value) })
              }
            />

            <input
              style={estilos.input}
              placeholder="Apellido paterno"
              value={profesor.apellidoPaterno}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  apellidoPaterno: aMayus(e.target.value),
                })
              }
            />

            <input
              style={estilos.input}
              placeholder="Apellido materno"
              value={profesor.apellidoMaterno}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  apellidoMaterno: aMayus(e.target.value),
                })
              }
            />

            <input
              style={estilos.input}
              placeholder="Matrícula"
              value={profesor.matricula}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  matricula: soloNumeros10(e.target.value),
                })
              }
            />

            <input
              style={estilos.input}
              placeholder="Teléfono"
              value={profesor.telefono}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  telefono: soloNumeros10(e.target.value),
                })
              }
            />

            {/* CAMPUS PROFESOR */}
            <label style={estilos.label}>Campus:</label>
            <select
              style={estilos.select}
              value={profesor.campus}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  campus: aMayus(e.target.value),
                })
              }
            >
              <option value="">Seleccione...</option>
              {campusUVM.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label style={estilos.label}>Tipo de profesor:</label>
            <select
              style={estilos.select}
              value={profesor.tipo_profesor}
              onChange={(e) =>
                setProfesor({
                  ...profesor,
                  tipo_profesor: aMayus(e.target.value),
                })
              }
            >
              <option value="">Seleccione...</option>
              <option value="POR HORAS">POR HORAS</option>
              <option value="TIEMPO COMPLETO">TIEMPO COMPLETO</option>
            </select>
          </div>
        )}

        <button style={estilos.botonPrincipal} onClick={enviarRegistro}>Enviar registro</button>
      </div>
    </>
  );
}