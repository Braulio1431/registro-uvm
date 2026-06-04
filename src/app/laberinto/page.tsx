"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LaberintoPage() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [ronda, setRonda] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_equipo: "",
    ronda: "1",
    p_dimensiones: "",
    p_ajuste: "",
    p_completo: "",
    p_salio: "",
    p_intentos: "",
    tiempo_segundos: "",
    puntos_tiempo: "",
    puntaje_total: "0",
    comentarios: "",
  });

  const getEquipos = async () => {
    try {
      const res = await fetch(`/api/laberinto?equipos=1&ronda=${ronda}`);
      const data = await res.json();
      setEquipos(data.equipos || []);
    } catch (err) {
      console.log("Error equipos:", err);
    }
  };

  const getRanking = async () => {
    try {
      const res = await fetch(`/api/laberinto?ranking=1&ronda=${ronda}`);
      const data = await res.json();
      setRanking(data.ranking || []);
    } catch (err) {
      console.log("Error ranking:", err);
    }
  };

  useEffect(() => {
    getEquipos();
    getRanking();
  }, [ronda]);

  const loadForm = async (id: string) => {
    if (!id) return;

    try {
      const res = await fetch(`/api/laberinto?getcalif=1&id_equipo=${id}&ronda=${ronda}`);
      const data = await res.json();

      if (data.calif) {
        const f = {
          ...form,
          ...data.calif,
          id_equipo: id,
          ronda: ronda.toString(),
          puntaje_total: calcularTotal(data.calif),
        };
        setForm(f);
      } else {
        setForm({
          id_equipo: id,
          ronda: ronda.toString(),
          p_dimensiones: "",
          p_ajuste: "",
          p_completo: "",
          p_salio: "",
          p_intentos: "",
          tiempo_segundos: "",
          puntos_tiempo: "",
          puntaje_total: "0",
          comentarios: "",
        });
      }
    } catch (err) {
      console.log("Error loadform:", err);
    }
  };

  const calcularTotal = (data: any) => {
    const total =
      (parseFloat(data.p_dimensiones) || 0) +
      (parseFloat(data.p_ajuste) || 0) +
      (parseFloat(data.p_completo) || 0) +
      (parseFloat(data.p_salio) || 0) +
      (parseFloat(data.p_intentos) || 0) +
      (parseFloat(data.puntos_tiempo) || 0);

    return total.toFixed(2);
  };

  const actualizarForm = (campo: string, valor: any) => {
    if (campo === "puntos_tiempo") {
      let v = parseInt(valor, 10);
      if (isNaN(v)) v = 0;
      v = Math.max(1, Math.min(20, v));
      valor = v.toString();
    }
    const newForm = { ...form, [campo]: valor };
    newForm.puntaje_total = calcularTotal(newForm);
    setForm(newForm);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/laberinto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.ok) {
        alert("Calificación registrada.");
        getRanking();
        // Limpiar el formulario
        setForm({
          id_equipo: "",
          ronda: ronda.toString(),
          p_dimensiones: "",
          p_ajuste: "",
          p_completo: "",
          p_salio: "",
          p_intentos: "",
          tiempo_segundos: "",
          puntos_tiempo: "",
          puntaje_total: "0",
          comentarios: "",
        });
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.log("Error submit:", err);
      alert("Error al enviar.");
    }

    setLoading(false);
  };

  const ocultarEquipo = async (id_equipo: number) => {
    if (!confirm("¿Seguro que deseas ocultar este equipo?")) return;

    // Actualización optimista: ocultar inmediatamente en el ranking local
    setRanking(ranking.filter((row) => row.id_equipo !== id_equipo));

    await fetch(`/api/laberinto?action=ocultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_equipo, ronda }),
    });

    getEquipos();
    getRanking();
  };

  const reiniciar = async () => {
    if (!confirm("¿Seguro que deseas reiniciar TODO?")) return;

    await fetch("/api/laberinto", { method: "DELETE" });

    alert("Reiniciado correctamente.");

    setRonda(1);
    setForm({ ...form, ronda: "1" });

    getEquipos();
    getRanking();
  };

  // Ordenar el ranking: puntaje desc, luego tiempo asc para desempate
  const sortedRanking = [...ranking].sort((a, b) => {
    const pa = parseFloat(a.puntaje_total) || 0;
    const pb = parseFloat(b.puntaje_total) || 0;
    if (pa !== pb) return pb - pa; // Mayor puntaje primero
    const ta = parseFloat(a.tiempo_segundos) || Infinity;
    const tb = parseFloat(b.tiempo_segundos) || Infinity;
    return ta - tb; // Menor tiempo primero en caso de empate
  });

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
    textarea: {
      width: "100%",
      padding: "10px",
      border: "1.8px solid #8B0000",
      borderRadius: "8px",
      marginBottom: "12px",
      color: "#000",
      fontWeight: "500",
      outline: "none",
      transition: "0.3s ease",
      minHeight: "80px",
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
    tabla: {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginTop: "20px",
    },
    th: {
      backgroundColor: "#8B0000",
      color: "#fff",
      padding: "10px",
      textAlign: "left" as const,
      fontWeight: "700",
    },
    td: {
      padding: "10px",
      border: "1px solid #ddd",
      color: "#222",
    },
  };

  return (
    <>
      <div style={estilos.fondo}></div>
      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Laberinto – Calificaciones</h1>

        <Link href="/">
          <button style={estilos.botonSecundario}>Regresar</button>
        </Link>

        <div style={{ marginTop: 20 }}>
          <label style={estilos.label}>Seleccionar ronda:</label>
          <select
            style={estilos.select}
            value={ronda}
            onChange={(e) => {
              const r = Number(e.target.value);
              setRonda(r);
              setForm({ ...form, ronda: r.toString(), id_equipo: "" });
            }}
          >
            <option value={1}>Ronda 1 – Preliminar</option>
            <option value={2}>Ronda 2 – Semifinal</option>
            <option value={3}>Ronda 3 – Final</option>
          </select>
        </div>

        <button
          onClick={reiniciar}
          style={estilos.botonEliminar}
        >
          Reiniciar todo
        </button>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <h2 style={estilos.subtitulo}>Registrar Calificación</h2>

          <div style={estilos.bordeSeccion}>
            <div>
              <label style={estilos.label}>Equipo:</label>
              <select
                style={estilos.select}
                value={form.id_equipo}
                onChange={(e) => {
                  actualizarForm("id_equipo", e.target.value);
                  loadForm(e.target.value);
                }}
              >
                <option value="">Seleccione...</option>
                {equipos.map((eq) => (
                  <option key={eq.id_equipo} value={eq.id_equipo}>
                    {eq.nombre_equipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={estilos.label}>¿Las dimensiones maximas del robot son 22cm de largo y 20cm de ancho?</label>
              <select
                style={estilos.select}
                value={form.p_dimensiones}
                onChange={(e) => actualizarForm("p_dimensiones", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="20">Sí (20 puntos)</option>
                <option value="10">Parcial (10 puntos)</option>
                <option value="0.5">No (0.5 puntos)</option>
              </select>
            </div>

            <div>
              <label style={estilos.label}>¿Se otorgo tiempo de ajuste?</label>
              <select
                style={estilos.select}
                value={form.p_ajuste}
                onChange={(e) => actualizarForm("p_ajuste", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="0.5">Sí (0.5 puntos)</option>
                <option value="10">Parcial (10 puntos)</option>
                <option value="20">No (20 puntos)</option>
              </select>
            </div>

            <div>
              <label style={estilos.label}>¿El robot completo el laberinto?</label>
              <select
                style={estilos.select}
                value={form.p_completo}
                onChange={(e) => actualizarForm("p_completo", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="20">Sí (20 puntos)</option>
                <option value="10">Parcial (10 puntos)</option>
                <option value="0.5">No (0.5 puntos)</option>
              </select>
            </div>

            <div>
              <label style={estilos.label}>¿El robot salió del recorrido?</label>
              <select
                style={estilos.select}
                value={form.p_salio}
                onChange={(e) => actualizarForm("p_salio", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="0.5">Si (0.5 puntos)</option>
                <option value="10">Parcial (10 puntos)</option>
                <option value="20">No (20 puntos)</option>
              </select>
            </div>

            <div>
              <label style={estilos.label}>¿En cuantos intentos lo realizó?</label>
              <select
                style={estilos.select}
                value={form.p_intentos}
                onChange={(e) => actualizarForm("p_intentos", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="20">Primer intento (20 puntos)</option>
                <option value="10">Segundo intento (10 puntos)</option>
                <option value="0.5">No completó (0.5 puntos)</option>
              </select>
            </div>

            <div>
              <label style={estilos.label}>Tiempo que se trado para completar el recorrido(segundos):</label>
              <input
                style={estilos.input}
                type="number"
                value={form.tiempo_segundos}
                onChange={(e) => actualizarForm("tiempo_segundos", e.target.value)}
              />
            </div>

            <div>
              <label style={estilos.label}>Puntos otorgados por tiempo:</label>
              <input
                style={estilos.input}
                type="number"
                min="1"
                max="20"
                step="1"
                value={form.puntos_tiempo}
                onChange={(e) => actualizarForm("puntos_tiempo", e.target.value)}
              />
            </div>

            <div>
              <label style={estilos.label}>Comentarios:</label>
              <textarea
                style={estilos.textarea}
                value={form.comentarios}
                onChange={(e) => actualizarForm("comentarios", e.target.value)}
              ></textarea>
            </div>

            <div>
              <label style={estilos.label}>Puntaje Total:</label>
              <input style={estilos.input} value={form.puntaje_total} readOnly />
            </div>
          </div>

          <button type="submit" disabled={loading} style={estilos.botonPrincipal}>
            {loading ? "Guardando..." : "Registrar Calificación"}
          </button>
        </form>

        <h2 style={estilos.subtitulo}>Ranking – Ronda {ronda}</h2>

        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Equipo</th>
              <th style={estilos.th}>Puntaje</th>
              <th style={estilos.th}>Tiempo</th>
              <th style={estilos.th}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {sortedRanking.map((row: any) => (
              <tr key={row.id_calificacion}>
                <td style={estilos.td}>{row.nombre_equipo}</td>
                <td style={estilos.td}>{row.puntaje_total}</td>
                <td style={estilos.td}>{row.tiempo_segundos}</td>
                <td style={estilos.td}>
                  <button
                    onClick={() => ocultarEquipo(row.id_equipo)}
                    style={estilos.botonEliminar}
                  >
                    Ocultar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}