// app/design/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Participante {
  id_participante: number;
  nombre_completo: string;
}

interface PodioItem {
  id_participante: number;
  nombre_completo: string;
  lugar: string;
}

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
  message: {
    color: "#8B0000",
    fontWeight: "600",
    textAlign: "center" as const,
    marginTop: "10px",
  },
  podioGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },
  podioCard: {
    border: "1px solid #8B0000",
    borderRadius: "8px",
    padding: "12px",
    backgroundColor: "rgba(255,255,255,0.95)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  lugarBox: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#8B0000",
    marginBottom: "5px",
  },
  nameBox: {
    fontSize: "16px",
    color: "#222",
  },
  noData: {
    textAlign: "center" as const,
    color: "#666",
    fontStyle: "italic",
  },
  assignedMessage: {
    textAlign: "center" as const,
    color: "#8B0000",
    fontWeight: "600",
    marginBottom: "20px",
  },
  backButton: {
    color: "#8B0000",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: "50%",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  selectContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  iconBox: {
    fontSize: "24px",
  },
};

export default function DesignPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [podio, setPodio] = useState<PodioItem[]>([]);
  const [primer, setPrimer] = useState<string>("");
  const [segundo, setSegundo] = useState<string>("");
  const [tercer, setTercer] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/design");
      if (!res.ok) {
        let errText = "Error fetching data";
        try {
          const errData = await res.json();
          errText = errData?.error ?? errText;
        } catch {
          // no hay JSON de error
        }
        throw new Error(errText);
      }
      const data = await res.json();
      setParticipantes(data.participantes || []);
      setPodio(data.podio || []);
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message ?? "Error al cargar datos");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    if (!primer || !segundo || !tercer) {
      setMessage("Selecciona todos los lugares");
      return;
    }
    if (primer === segundo || primer === tercer || segundo === tercer) {
      setMessage("No se permiten duplicados en los lugares");
      return;
    }
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_primer: Number(primer),
          id_segundo: Number(segundo),
          id_tercer: Number(tercer),
        }),
      });
      if (!res.ok) {
        let errText = "Error al guardar";
        try {
          const errData = await res.json();
          errText = errData?.error ?? errText;
        } catch {}
        throw new Error(errText);
      }
      setMessage("¡Podio guardado correctamente!");
      setPrimer("");
      setSegundo("");
      setTercer("");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message ?? "Error al guardar el podio");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de borrar el podio actual?")) {
      return;
    }
    try {
      const res = await fetch("/api/design", { method: "DELETE" });
      if (!res.ok) {
        let errText = "Error al borrar";
        try {
          const errData = await res.json();
          errText = errData?.error ?? errText;
        } catch {}
        throw new Error(errText);
      }
      setMessage("¡Podio borrado correctamente!");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message ?? "Error al borrar el podio");
    }
  };

  return (
    <main>
      <div style={estilos.fondo} />
      <div style={estilos.contenedor}>
        <Link href="/secciones" style={{ position: "absolute", top: "20px", left: "20px" }}>
          <div style={estilos.backButton} title="Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </div>
        </Link>
        <h1 style={estilos.titulo}>Podio - Design Speed (SolidWorks)</h1>

        {podio.length === 0 ? (
          <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={estilos.bordeSeccion}>
              <div style={estilos.selectContainer}>
                <div style={estilos.iconBox} aria-hidden>🏆</div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="primer" style={estilos.label}>Primer Lugar</label>
                  <select
                    id="primer"
                    value={primer}
                    onChange={(e) => setPrimer(e.target.value)}
                    style={estilos.select}
                  >
                    <option value="">Selecciona un participante</option>
                    {participantes.map((p) => (
                      <option key={p.id_participante} value={String(p.id_participante)}>
                        {p.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={estilos.selectContainer}>
                <div style={estilos.iconBox} aria-hidden>🏅</div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="segundo" style={estilos.label}>Segundo Lugar</label>
                  <select
                    id="segundo"
                    value={segundo}
                    onChange={(e) => setSegundo(e.target.value)}
                    style={estilos.select}
                  >
                    <option value="">Selecciona un participante</option>
                    {participantes.map((p) => (
                      <option key={p.id_participante} value={String(p.id_participante)}>
                        {p.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={estilos.selectContainer}>
                <div style={estilos.iconBox} aria-hidden>🎖️</div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="tercer" style={estilos.label}>Tercer Lugar</label>
                  <select
                    id="tercer"
                    value={tercer}
                    onChange={(e) => setTercer(e.target.value)}
                    style={estilos.select}
                  >
                    <option value="">Selecciona un participante</option>
                    {participantes.map((p) => (
                      <option key={p.id_participante} value={String(p.id_participante)}>
                        {p.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" style={estilos.botonPrincipal}>Guardar Podio</button>
            </div>
          </form>
        ) : (
          <div style={estilos.assignedMessage}>
            Podio ya asignado. Para cambiar, borra y asigna nuevo.
          </div>
        )}

        <h2 style={estilos.subtitulo}>Podio Actual</h2>
        <div style={estilos.bordeSeccion}>
          <div style={estilos.podioGrid}>
            {podio.length > 0 ? (
              podio.map((r) => (
                <div key={r.id_participante} style={estilos.podioCard}>
                  <div style={estilos.lugarBox}>{r.lugar}</div>
                  <div style={estilos.nameBox}>{r.nombre_completo}</div>
                </div>
              ))
            ) : (
              <p style={estilos.noData}>No hay podio asignado aún.</p>
            )}
          </div>
        </div>

        {podio.length > 0 && (
          <button onClick={handleDelete} style={estilos.botonEliminar}>Borrar Podio</button>
        )}

        {message && <p style={estilos.message}>{message}</p>}
      </div>

      <style jsx>{`
        input:focus,
        select:focus {
          box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.3);
        }
        button:hover {
          background-color: #a70000;
          transform: scale(1.03);
        }
        .botonSecundario:hover,
        .botonEliminar:hover {
          background-color: #555;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        main {
          animation: fadeIn 1s ease forwards;
        }
      `}</style>
    </main>
  );
}