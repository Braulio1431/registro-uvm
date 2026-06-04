'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Participante = {
  id_participante: number;
  nombre: string;
};

export default function CalificacionIA() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const [rubrica, setRubrica] = useState({
    p_innovacion_originalidad: 0,
    p_potencial_expresivo: 0,
    p_autoria_prompt: 0,
    p_diseno_prompts_personalizados: 0,
    p_calidad_composicion_detalle: 0,
    p_limpieza_resolucion: 0,
    p_coherencia_categoria: 0,
    p_capacidad_expresiva: 0,
    p_impacto_inmediato: 0,
    p_uso_creativo_IA: 0,
    p_descripcion_proceso: 0,
  });

  const [mensaje, setMensaje] = useState('');

  const maxScores = {
    p_innovacion_originalidad: 10,
    p_potencial_expresivo: 10,
    p_autoria_prompt: 10,
    p_diseno_prompts_personalizados: 10,
    p_calidad_composicion_detalle: 10,
    p_limpieza_resolucion: 10,
    p_coherencia_categoria: 10,
    p_capacidad_expresiva: 8,
    p_impacto_inmediato: 8,
    p_uso_creativo_IA: 7,
    p_descripcion_proceso: 7,
  };

  const questions = {
    p_innovacion_originalidad: '¿Qué tan innovadora y original es la idea central de la imagen (tema, personajes, escenario)?',
    p_potencial_expresivo: '¿Qué tan expresivo es el potencial visual de la imagen?',
    p_autoria_prompt: '¿Qué tan original es la autoría del prompt utilizado?',
    p_diseno_prompts_personalizados: '¿Qué tan bien diseñados están los prompts personalizados?',
    p_calidad_composicion_detalle: '¿Qué tan alta es la calidad de la composición y detalle en la imagen?',
    p_limpieza_resolucion: '¿Qué tan limpia y de alta resolución es la imagen?',
    p_coherencia_categoria: '¿Qué tan coherente es la imagen con la categoría seleccionada?',
    p_capacidad_expresiva: '¿Qué tan buena es la capacidad expresiva de la imagen?',
    p_impacto_inmediato: '¿Qué tan fuerte es el impacto inmediato de la imagen?',
    p_uso_creativo_IA: '¿Qué tan creativo es el uso de la IA en la generación de la imagen?',
    p_descripcion_proceso: '¿Qué tan detallada es la descripción del proceso de creación?',
  };

  // ================================
  // Cargar participantes categoría 4
  // ================================
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/ia');
      const data = await res.json();
      setParticipantes(data.participantes || []);
    }
    load();
  }, []);

  // ================================
  // Calcular total automático
  // ================================
  const puntajeTotal = Object.values(rubrica).reduce(
    (a, b) => a + Number(b),
    0
  );

  const totalMax = Object.values(maxScores).reduce((a, b) => a + b, 0);

  // ================================
  // Enviar calificación
  // ================================
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    if (!selected) {
      setMensaje('Selecciona un participante');
      return;
    }

    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_participante: selected,
          ...rubrica,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('✔ Calificación guardada correctamente');
        setSelected(null);
        setRubrica({
          p_innovacion_originalidad: 0,
          p_potencial_expresivo: 0,
          p_autoria_prompt: 0,
          p_diseno_prompts_personalizados: 0,
          p_calidad_composicion_detalle: 0,
          p_limpieza_resolucion: 0,
          p_coherencia_categoria: 0,
          p_capacidad_expresiva: 0,
          p_impacto_inmediato: 0,
          p_uso_creativo_IA: 0,
          p_descripcion_proceso: 0,
        });
      } else {
        setMensaje(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al conectar con servidor');
    }
  };

  const handleRubricaChange = (key: keyof typeof rubrica, value: number) => {
    const max = maxScores[key];
    const clampedValue = Math.max(0, Math.min(value, max));
    setRubrica({
      ...rubrica,
      [key]: clampedValue,
    });
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
        <h2 style={estilos.titulo}>
          Evaluación – Arte Generado por IA
        </h2>

        {mensaje && (
          <div className="alert alert-info text-center" style={{ color: '#000' }}>{mensaje}</div>
        )}

        <form onSubmit={enviar}>
          {/* ============================ */}
          {/* SELECT PARTICIPANTE */}
          {/* ============================ */}
          <div className="mb-4">
            <label className="form-label fw-bold" style={{ ...estilos.label, color: '#8B0000' }}>
              Seleccionar Participante
            </label>
            <select
              className="form-select"
              value={selected ?? ''}
              onChange={(e) => setSelected(Number(e.target.value))}
              style={estilos.select}
            >
              <option value="">-- Selecciona --</option>
              {participantes.map((p) => (
                <option key={p.id_participante} value={p.id_participante}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ============================ */}
          {/* RÚBRICA */}
          {/* ============================ */}
          <div style={estilos.bordeSeccion}>
            <h4 style={estilos.subtitulo}>
              Rúbrica de Evaluación
            </h4>

            {Object.keys(rubrica).map((key) => (
              <div className="mb-3" key={key}>
                <label className="form-label" style={{ ...estilos.label, color: '#000' }}>
                  {questions[key as keyof typeof questions]} (máx. {maxScores[key as keyof typeof maxScores]})
                </label>
                <input
                  type="number"
                  min={0}
                  max={maxScores[key as keyof typeof maxScores]}
                  className="form-control"
                  value={(rubrica as any)[key]}
                  onChange={(e) =>
                    handleRubricaChange(key as keyof typeof rubrica, Number(e.target.value))
                  }
                  style={estilos.input}
                />
              </div>
            ))}

            {/* ============================ */}
            {/* TOTAL */}
            {/* ============================ */}
            <h4
              style={{
                marginTop: '20px',
                color: '#000',
                fontWeight: 'bold',
                textAlign: 'center' as const,
              }}
            >
              TOTAL: {puntajeTotal} / {totalMax}
            </h4>
          </div>
 
          {/* ============================ */}
          {/* BOTÓN ENVIAR */}
          {/* ============================ */}
          <button
            type="submit"
            className="btn w-100 mt-4"
            style={estilos.botonPrincipal}
          >
            Guardar Calificación
          </button>
        </form>
      </div>
    </>
  );
}