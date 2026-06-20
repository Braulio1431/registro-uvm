'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Opciones por criterio: [label, valor]
type Opcion = { label: string; valor: number };

type Criterio = {
  name: string;
  label: string;
  opciones: Opcion[];
};

// Criterios Nivel 1
const criteriosN1: Criterio[] = [
  {
    name: 'problema_investigacion',
    label: '1. Problema de investigación (5%)',
    opciones: [
      { label: 'Problema general, poco delimitado', valor: 1 },
      { label: 'Problema claro y contextualizado', valor: 2 },
      { label: 'Problema específico con implicaciones prácticas', valor: 3 },
    ],
  },
  {
    name: 'objetivos_justificacion',
    label: '2. Objetivos y justificación (10%)',
    opciones: [
      { label: 'Objetivo general sin desarrollo', valor: 2 },
      { label: 'Objetivos claros y justificados', valor: 4 },
      { label: 'Objetivos estratégicos con enfoque de impacto', valor: 6 },
    ],
  },
  {
    name: 'marco_teorico',
    label: '3. Marco teórico, citas y referencias (10%)',
    opciones: [
      { label: 'Uso básico de fuentes', valor: 2 },
      { label: 'Integración adecuada de literatura', valor: 4 },
      { label: 'Análisis crítico y aportes originales', valor: 6 },
    ],
  },
];

// Criterios Nivel 2
const criteriosN2: Criterio[] = [
  {
    name: 'metodologia',
    label: '4. Metodología (15%)',
    opciones: [
      { label: 'Ausente o poco clara', valor: 1 },
      { label: 'Diseño metodológico coherente', valor: 2 },
      { label: 'Metodología validada y aplicada', valor: 3 },
    ],
  },
  {
    name: 'resultados',
    label: '5. Resultados (15%)',
    opciones: [
      { label: 'Hipotéticos o ausentes', valor: 3 },
      { label: 'Resultados preliminares', valor: 6 },
      { label: 'Resultados completos y validados', valor: 9 },
    ],
  },
  {
    name: 'aplicacion_conocimiento',
    label: '6. Aplicación del conocimiento (5%)',
    opciones: [
      { label: 'No se evidencia uso de conocimientos previos o adquiridos', valor: 1 },
      { label: 'Se aplican conocimientos básicos, pero sin profundidad ni integración', valor: 2 },
      { label: 'Se demuestra aplicación sólida, pertinente e integrada del conocimiento', valor: 3 },
    ],
  },
];

// Criterios Nivel 3
const criteriosN3: Criterio[] = [
  {
    name: 'analisis_interpretacion',
    label: '7. Análisis e interpretación (15%)',
    opciones: [
      { label: 'Descriptivo o superficial', valor: 3 },
      { label: 'Interpretación con base en datos', valor: 6 },
      { label: 'Análisis crítico con discusión profunda', valor: 9 },
    ],
  },
  {
    name: 'problematica_real',
    label: '8. Resuelve una problemática real y vigente (5%)',
    opciones: [
      { label: 'No se identifica una problemática clara', valor: 1 },
      { label: 'Se identifica una problemática, pero no se justifica su vigencia o relevancia', valor: 2 },
      { label: 'Se aborda una problemática actual, bien definida y con justificación clara', valor: 3 },
    ],
  },
  {
    name: 'impacto_transferencia',
    label: '9. Impacto y transferencia (10%)',
    opciones: [
      { label: 'No se contempla', valor: 2 },
      { label: 'Se menciona aplicación potencial', valor: 4 },
      { label: 'Propuesta concreta de transferencia, producto o publicación', valor: 6 },
    ],
  },
  {
    name: 'originalidad_innovacion',
    label: '10. Originalidad e innovación (10%)',
    opciones: [
      { label: 'Idea común o poco desarrollada', valor: 2 },
      { label: 'Elementos novedosos', valor: 4 },
      { label: 'Propuesta innovadora con valor agregado', valor: 6 },
    ],
  },
];

// Competencias genéricas (todos los niveles)
const criteriosGenericas: Criterio[] = [
  {
    name: 'presentacion_visual',
    label: '11. Presentación visual (5%)',
    opciones: [
      { label: 'Desorganizada o poco clara', valor: 1 },
      { label: 'Clara y funcional', valor: 2 },
      { label: 'Profesional, atractiva y comunicativa', valor: 3 },
    ],
  },
  {
    name: 'comunicacion_oral',
    label: '12. Comunicación oral y dominio (5%)',
    opciones: [
      { label: 'Dificultad para explicar el proyecto', valor: 1 },
      { label: 'Explicación clara y segura', valor: 2 },
      { label: 'Presentación convincente y con dominio del tema', valor: 3 },
    ],
  },
];

type Respuestas = Record<string, string>;

export default function RubricaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clave_cartel = searchParams.get('clave_cartel');
  const matricula_profesor = searchParams.get('matricula_profesor');

  const [respuestas, setRespuestas] = useState<Respuestas>({});

  // Construir lista de criterios (ahora siempre todos)
  const criteriosActivos: Criterio[] = [
    ...criteriosN1,
    ...criteriosN2,
    ...criteriosN3,
    ...criteriosGenericas,
  ];

  const handleChange = (name: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [name]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clave_cartel || !matricula_profesor) {
      alert('Error: faltan datos del profesor o cartel.');
      return;
    }

    // Validar que todos los criterios tienen respuesta
    const sinResponder = criteriosActivos.filter(
      (c) => !respuestas[c.name]
    );
    if (sinResponder.length > 0) {
      alert('Por favor responde todos los criterios antes de enviar.');
      return;
    }

    try {
      const res = await fetch('/api/rubrica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clave_cartel,
          matricula_profesor,
          ...respuestas,
        }),
      });

      if (res.ok) {
        router.push('/registro-exitoso');
      } else {
        alert('Error al guardar la rúbrica.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al enviar la evaluación.');
    }
  };

  // Estilos
  const estilos = {
    fondo: {
      position: 'fixed' as const,
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundImage:
        'url(https://mir-s3-cdn-cf.behance.net/project_modules/fs/e04920100990617.5f15ce182ffd9.jpg)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      filter: 'brightness(0.6)',
      zIndex: -1,
    },
    contenedor: {
      position: 'relative' as const,
      maxWidth: '900px',
      margin: '50px auto',
      backgroundColor: '#ffffff',
      padding: '35px',
      borderRadius: '16px',
      boxShadow: '0 4px 25px rgba(0,0,0,0.3)',
      zIndex: 1,
    },
    titulo: {
      color: '#b30000',
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
      marginBottom: '25px',
      textTransform: 'uppercase' as const,
    },
    seccionLabel: {
      backgroundColor: '#b30000',
      color: '#fff',
      fontWeight: 'bold' as const,
      padding: '6px 14px',
      borderRadius: '6px',
      marginBottom: '12px',
      display: 'inline-block',
    },
    botonEnviar: {
      backgroundColor: '#b30000',
      color: '#fff',
      fontWeight: 'bold' as const,
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      width: '100%',
      cursor: 'pointer',
    },
  };

  const seccionTitulo = (texto: string) => (
    <div style={estilos.seccionLabel}>{texto}</div>
  );

  return (
    <>
      <div style={estilos.fondo} />

      {/* Botón volver */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10 }}>
        <Link href="/profesor">
          <button
            style={{
              border: '2px solid #fff', color: '#fff', fontWeight: 'bold',
              borderRadius: '8px', padding: '8px 16px',
              backgroundColor: 'transparent', cursor: 'pointer',
            }}
          >
            Volver
          </button>
        </Link>
      </div>

      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Rúbrica de Evaluación de Cartel</h1>

        {/* Info cartel */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 bg-white p-4 border rounded-md">
          <div>
            <label className="font-semibold text-gray-700">Clave del cartel:</label>
            <input type="text" value={clave_cartel || ''} readOnly
              className="ml-2 border rounded-md px-2 py-1 bg-gray-100 text-gray-600" />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Matrícula del profesor:</label>
            <input type="text" value={matricula_profesor || ''} readOnly
              className="ml-2 border rounded-md px-2 py-1 bg-gray-100 text-gray-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {seccionTitulo('Nivel 1 — Exploración')}
          {criteriosN1.map((criterio) => (
            <CriterioCard key={criterio.name} criterio={criterio}
              valor={respuestas[criterio.name] || ''}
              onChange={(v) => handleChange(criterio.name, v)} />
          ))}

          {seccionTitulo('Nivel 2 — Proyecto estructurado')}
          {criteriosN2.map((criterio) => (
            <CriterioCard key={criterio.name} criterio={criterio}
              valor={respuestas[criterio.name] || ''}
              onChange={(v) => handleChange(criterio.name, v)} />
          ))}

          {seccionTitulo('Nivel 3 — Proyecto avanzado')}
          {criteriosN3.map((criterio) => (
            <CriterioCard key={criterio.name} criterio={criterio}
              valor={respuestas[criterio.name] || ''}
              onChange={(v) => handleChange(criterio.name, v)} />
          ))}

          {seccionTitulo('Competencias Genéricas')}
          {criteriosGenericas.map((criterio) => (
            <CriterioCard key={criterio.name} criterio={criterio}
              valor={respuestas[criterio.name] || ''}
              onChange={(v) => handleChange(criterio.name, v)} />
          ))}

          <button type="submit" style={estilos.botonEnviar}>
            Enviar evaluación
          </button>
        </form>
      </div>
    </>
  );
}

// Componente para cada criterio con sus opciones A/B/C
function CriterioCard({
  criterio, valor, onChange,
}: {
  criterio: Criterio;
  valor: string;
  onChange: (v: string) => void;
}) {
  const letras = ['A', 'B', 'C'];
  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm">
      <label className="font-semibold block mb-3 text-gray-800">{criterio.label}</label>
      <div className="flex flex-col gap-2">
        {criterio.opciones.map((opcion, i) => (
          <label key={opcion.valor}
            className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-red-700">
            <input
              type="radio"
              name={criterio.name}
              value={opcion.valor}
              checked={valor === String(opcion.valor)}
              onChange={() => onChange(String(opcion.valor))}
              required
            />
            <span className="font-bold text-red-700 w-5">{letras[i]}</span>
            <span>{opcion.label} <span className="text-gray-400 text-sm">({opcion.valor} pts)</span></span>
          </label>
        ))}
      </div>
    </div>
  );
}