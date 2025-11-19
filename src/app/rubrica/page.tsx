'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RubricaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 Obtenemos clave_cartel y matricula_profesor desde la URL
  const clave_cartel = searchParams.get('clave_cartel');
  const matricula_profesor = searchParams.get('matricula_profesor');

  const [respuestas, setRespuestas] = useState({
    fundamentacion_teorica: '',
    viabilidad_proyecto: '',
    presentacion_actitud: '',
    defensa_cartel: '',
    resumen: '',
    introduccion: '',
    planteamiento_problema: '',
    justificacion: '',
    objetivos: '',
    hipotesis: '',
    metodologia: '',
    resultados_analisis: '',
    conclusiones: '',
    coherencia_referencias: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRespuestas({ ...respuestas, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clave_cartel || !matricula_profesor) {
      alert('Error: faltan datos del profesor o cartel.');
      return;
    }

    const valores = Object.values(respuestas).map(Number);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    try {
      const res = await fetch('/api/rubrica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clave_cartel,
          matricula_profesor,
          ...respuestas,
          promedio,
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

  const preguntas = [
    { name: 'fundamentacion_teorica', label: '1. Fundamentación teórica del proyecto. Se observa una excelente argumentación utilizando fuentes de información confiables que reflejan los antecedentes del proyecto y un claro objetivo' },
    { name: 'viabilidad_proyecto', label: '2. VViabilidad del proyecto (aplicabilidad y beneficio) ' },
    { name: 'presentacion_actitud', label: '3. Presentación (vestimenta) y actitud de los alumnos. Liderazgo en el desarrollo de ideas ' },
    { name: 'defensa_cartel', label: '4. Defensa del cartel. Dominio del tema por parte del estudiante' },
    { name: 'resumen', label: '5. Resumen. En el resumen describe los objetivos del trabajo, la metodología general con los resultados más relevantes. ' },
    { name: 'introduccion', label: '6. Introducción: Realiza una revisión bibliográfica donde plantea ordenadamente el tema de investigación, su importancia e implicaciones. Incluye las referencia bibliográficas o hemerográficas en el texto.' },
    { name: 'planteamiento_problema', label: '7. Planteamiento del problema: El planteamiento responde a la pregunta ¿qué voy a investigar? ' },
    { name: 'justificacion', label: '8. Justificación: Responde a la pregunta ¿por qué voy a investigar? ' },
    { name: 'objetivos', label: '9. Objetivos: Responden a la pregunta ¿para qué voy a investigar? ' },
    { name: 'hipotesis', label: '10. Hipótesis: constituye un juicio de posibilidad que expresa la relación causa efecto (si vs entonces) que se pretende verificar. ' },
    { name: 'metodologia', label: '11. Metodología: Describe el procedimiento experimental de forma que responde a la pregunta ¿Cómo se va a investigar?' },
    { name: 'resultados_analisis', label: '12. Resultados y análisis de resultados: Recopila y ordena los datos obtenidos presentándolos en párrafos, cuadros o gráficos claramente identificados. Interpreta y analiza los resultados obtenidos comparativamente con la bibliografía consultada -Indica las aplicaciones teóricas.' },
    { name: 'conclusiones', label: '13. Conclusiones: Redacta con sus propias palabras si se cumplen o no los objetivos en base al análisis de los resultados.' },
    { name: 'coherencia_referencias', label: '14. Coherencia de las referencias bibliográficas. Incluye todas las referencias citadas en formato APA y tienen relación con el proyecto. ' },
  ];

  // 🎨 Estilos visuales
  const estilos = {
    fondo: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
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
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.3)',
      zIndex: 1,
    },
    titulo: {
      color: '#b30000',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '25px',
      textTransform: 'uppercase' as const,
    },
    botonEnviar: {
      backgroundColor: '#b30000',
      color: '#fff',
      fontWeight: 'bold',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      width: '100%',
      transition: '0.3s ease',
      cursor: 'pointer',
    },
  };

  return (
    <>

      <div style={estilos.fondo}></div>

      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10,
        }}
      >
        <Link href="/profesor">
          <button
            className="btn btn-outline-light"
            style={{
              border: '2px solid #fff',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              transition: '0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#b30000';
              (e.target as HTMLButtonElement).style.borderColor = '#b30000';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.borderColor = '#fff';
            }}
          >
            Volver
          </button>
        </Link>
      </div>

      {/* 🔴 Contenedor principal */}
      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Rúbrica de Evaluación de Cartel</h1>

        {/* 🔹 Mostrar clave_cartel y matricula_profesor */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-white p-4 border rounded-md">
          <div>
            <label className="font-semibold text-gray-700">Clave del cartel:</label>
            <input
              type="text"
              value={clave_cartel || 'No disponible'}
              readOnly
              className="ml-2 border rounded-md px-2 py-1 bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Matrícula del profesor:</label>
            <input
              type="text"
              value={matricula_profesor || 'No disponible'}
              readOnly
              className="ml-2 border rounded-md px-2 py-1 bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {preguntas.map((pregunta) => (
            <div key={pregunta.name} className="bg-white p-4 border rounded-lg shadow-sm">
              <label className="font-semibold block mb-2 text-gray-800">{pregunta.label}</label>
              <div className="flex gap-6 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name={pregunta.name}
                      value={num}
                      checked={respuestas[pregunta.name as keyof typeof respuestas] === String(num)}
                      onChange={handleChange}
                      required
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            style={estilos.botonEnviar}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#7a0000')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#b30000')}
          >
            Enviar evaluación
          </button>
        </form>
      </div>
    </>
  );
}
