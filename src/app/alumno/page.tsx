"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AlumnoVisitaPage() {
  const campusList = [
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

  const [form, setForm] = useState({
    tipo_usuario: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    matricula: "",
    campus: "",
  });

  const router = useRouter();

  const handleChange = (e: any) => {
    let value = e.target.value.toUpperCase();

    // Matrícula solo números y máx 10 dígitos
    if (e.target.name === "matricula") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/alumno", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.msg);

    if (data.ok) {
      router.push("/registro-exitoso");
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
        <h1 style={estilos.titulo}>Registro de Visita</h1>

        <form onSubmit={handleSubmit} className="mt-3">
          {/* Tipo usuario */}
          <label style={estilos.label}>Tipo de usuario</label>
          <select
            name="tipo_usuario"
            style={estilos.select}
            value={form.tipo_usuario}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="ALUMNO">ALUMNO</option>
            <option value="PROFESOR">PROFESOR</option>
            <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
          </select>

          <label style={estilos.label}>Nombre</label>
          <input
            name="nombre"
            style={estilos.input}
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <label style={estilos.label}>Apellido paterno</label>
          <input
            name="apellido_paterno"
            style={estilos.input}
            value={form.apellido_paterno}
            onChange={handleChange}
            required
          />

          <label style={estilos.label}>Apellido materno</label>
          <input
            name="apellido_materno"
            style={estilos.input}
            value={form.apellido_materno}
            onChange={handleChange}
            required
          />

          <label style={estilos.label}>Matrícula (solo números, máx 10 dígitos)</label>
          <input
            name="matricula"
            style={estilos.input}
            value={form.matricula}
            onChange={handleChange}
            required
          />

          <label style={estilos.label}>Campus</label>
          <select
            name="campus"
            style={estilos.select}
            value={form.campus}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione campus...</option>

            {campusList.map((camp, i) => (
              <option key={i} value={camp}>
                {camp}
              </option>
            ))}
          </select>

          <button style={estilos.botonPrincipal}>Registrar visita</button>
        </form>
      </div>
    </>
  );
}