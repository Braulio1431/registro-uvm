'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroCartel() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [vertical, setVertical] = useState('');
  const [programa, setPrograma] = useState('');
  const [semestres, setSemestres] = useState<string[]>([]);
  const [profesorAsesor, setProfesorAsesor] = useState('');
  const [correoAsesor, setCorreoAsesor] = useState('');
  const [asignaturaRelacionada, setAsignaturaRelacionada] = useState('');
  const [esABP_ABI, setEsABP_ABI] = useState('');
  const [participantes, setParticipantes] = useState(
    Array(5).fill({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      correo: '',
    })
  );

  const verticales: Record<string, string[]> = {
    'LICENCIATURA SEMESTRAL MIXTA (L6)': ['ARQUITECTURA', 'DISEÑO DE INTERIORES (NABA)', 'DISEÑO DE LA MODA E INDUSTRIA DEL VESTIDO ()', 
      'DISEÑO INDUSTRIAL (NABA)', 'DISEÑO MULTIMEDIA', 'DISEÑO Y COMUNICACION GRAFICA (NABA)', 
      'COMUNICACION Y MEDIOS DIGITALES', 'CRIMINOLOGIA', 'DERECHO', 'EDUCACION', 'LENGUAS EXTRANJERAS', 
      'PEDAGOGIA', 'RELACIONES INTERNACIONALES', 'ADMINISTRACION TURISTICA Y HOTELERA', 
      'GASTRONOMIA INTERNACIONAL (KENDALL)', 'PSICOLOGIA', 'PUBLICIDAD Y RELACIONES PUBLICAS',
      'ACTUARIA', 'ADMINISTRACION DE EMPRESAS', 'ADMINISTRACION DE EMPRESAS DEL ENTRETENIMIENTO',
      'ADMINISTRACION DE NEGOCIOS INTERNACIONALES', 'LICENCIATURA EN COMERCIO Y LOGISTICA INTERNACIONALES', 'CONTADURIA PUBLICA Y FINANZAS',
      'MERCADOTECNIA', 'MERCADOTECNIA DEPORTIVA INTERNACIONAL', 'MERCADOTECNIA Y PUBLICIDAD EN ENTORNOS DIGITALES', 'INGENIERIA BIOMEDICA',
      'INGENIERIA CIVIL', 'ELECTRONICA', 'INGENIERIA EN ANIMACION E INTERACTIVIDAD', 'BIOTECNOLOGIA',
      'INGENIERIA EN CIENCIA DE DATOS', 'INGENIERIA EN DESARROLLO DE VIDEOJUEGOS', 'INTELIGENCIA ARTIFICIAL Y CIENCIA DE DATOS',
      'INGENIERIA EN SISTEMAS COMPUTACIONALES', 'INGENIERIA INDUSTRIAL Y DE SISTEMAS', 'INGENIERIA MECANICA INDUSTRIAL',
      'INGENIERIA MECATRONICA', 'INGENIERIA MECATRONICA CON ENFOQUE AUTOMOTRIZ', 'CIENCIAS SOCIALES', 
      'DISEÑO', 'EXTERNO', 'HOSPITALIDAD', 'INGENIERIAS', 'NEGOCIOS'],


    'CIENCIAS DE LA SALUD (NC)': ['BIOTECNOLOGIA', 'CULTURA FISICA Y DEPORTE', 'ENFERMERIA', 
      'FISIOTERAPIA', 'MEDICINA', 'MEDICINA VETERINARIA Y ZOOTECNIA', 
      'NUTRICION', 'PSICOLOGIA', 'QUIMICO FARMACEUTICO BIOTECNOLOGO', 'INGENIERIA EN BIOTECNOLOGIA', 'QFBT',],
  };

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
      maxWidth: '800px',
      margin: '50px auto',
      backgroundColor: '#ffffff',
      padding: '35px',
      borderRadius: '16px',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.3)',
    },
    titulo: {
      color: '#b30000',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '25px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
    },
    subtitulo: {
      color: '#b30000',
      fontWeight: 'bold',
      marginBottom: '10px',
      borderBottom: '2px solid #b30000',
      paddingBottom: '5px',
      textTransform: 'uppercase' as const,
    },
    bordeSeccion: {
      border: '2px solid #b30000',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    label: {
      color: '#000000',
      fontWeight: '600',
    },
    input: {
      border: '1.5px solid #b30000',
      borderRadius: '8px',
      color: '#000000',
      textTransform: 'uppercase' as const,
      width: '100%',
      padding: '8px',
      marginBottom: '10px',
    },
    boton: {
      backgroundColor: '#b30000',
      color: '#ffffff',
      fontWeight: 'bold',
      border: 'none',
      padding: '10px',
      borderRadius: '8px',
      transition: '0.3s ease',
      width: '100%',
      cursor: 'pointer',
    },
  };

  // Maneja cambios en campos de participantes.
  // - convierte a MAYÚSCULAS los campos de texto (excepto correo y telefono)
  // - telefono: solo dígitos y máximo 10
  const manejarCambioParticipante = (index: number, campo: string, valor: string) => {
    const nuevos = [...participantes];

    if (campo === 'telefono') {
      // solo números y máximo 10 dígitos
      valor = valor.replace(/\D/g, '').slice(0, 10);
    } else if (campo !== 'correo') {
      // convertir a mayúsculas para los campos de nombre/apellidos
      valor = valor.toUpperCase();
    }

    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setParticipantes(nuevos);
  };

  const manejarCambioSemestre = (valor: string) => {
    if (semestres.includes(valor)) {
      setSemestres(semestres.filter((v) => v !== valor));
    } else if (semestres.length < 5) {
      setSemestres([...semestres, valor]);
    }
  };

  const mostrarMensaje = (mensaje: string) => {
    console.log(mensaje);
    const modal = document.createElement('div');
    modal.className =
      'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-2xl z-[100] text-center max-w-sm';
    modal.innerHTML = `
      <p class="text-lg font-semibold text-gray-800 mb-4">${mensaje}</p>
      <button onclick="this.parentNode.remove()" class="px-4 py-2 bg-[#b30000] text-white rounded-lg hover:bg-red-700 transition">Cerrar</button>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.remove(), 4000);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    const representante = participantes[0];
    const integrantes = participantes.slice(1).filter(
      (p) => p.nombre || p.apellidoPaterno || p.apellidoMaterno
    );

    if (!representante.nombre || integrantes.length < 1) {
      mostrarMensaje('Debe haber al menos un representante y un integrante.');
      return;
    }

    // Aquí mantengo las conversiones a mayúsculas (excepto correos y teléfono),
    // tal como solicitaste que no se perdieran.
    const datos = {
      titulo_cartel: titulo.toUpperCase(),
      vertical: vertical.toUpperCase(),
      programa: programa.toUpperCase(),
      profesor_designado: profesorAsesor.toUpperCase(),
      correo_profesor_designado: correoAsesor.trim(), // correo no se fuerza a mayúsculas
      asignatura_relacionada: asignaturaRelacionada.toUpperCase(),
      es_asignatura_ABP_ABI: esABP_ABI.toUpperCase(),
      representante: {
        nombre: representante.nombre.toUpperCase().trim(),
        apellido_paterno: representante.apellidoPaterno.toUpperCase().trim(),
        apellido_materno: representante.apellidoMaterno.toUpperCase().trim(),
        telefono: representante.telefono.trim(),
        correo: representante.correo.trim(),
      },
      integrantes: integrantes.map((i) => ({
        nombre: i.nombre ? i.nombre.toUpperCase().trim() : null,
        apellido_paterno: i.apellidoPaterno ? i.apellidoPaterno.toUpperCase().trim() : null,
        apellido_materno: i.apellidoMaterno ? i.apellidoMaterno.toUpperCase().trim() : null,
      })),
      semestres,
    };

    try {
      const res = await fetch('/api/cartel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const data = await res.json();

      // Redirección en caso de registro exitoso
      if (res.ok) {
  router.push('/registro-exitoso');
  return;
}

      if (res.ok) {
        mostrarMensaje('Cartel registrado correctamente ✅');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        mostrarMensaje(`Error al registrar el cartel ❌\n${data.error || ''}`);
      }
    } catch (error) {
      console.error(error);
      mostrarMensaje('Error de conexión con el servidor ❌');
    }
  };

  return (
    <>
      <div style={estilos.fondo}></div>

      <div className="absolute top-4 right-4 z-10">
        <a href="/" className="inline-block">
          <button
            type="button"
            className="
              px-4 py-2 text-sm font-semibold rounded-full border-2 
              text-white bg-transparent border-white 
              hover:bg-white hover:text-[#b30000] transition-colors
              shadow-lg
            "
          >
            Cerrar Formulario
          </button>
        </a>
      </div>

      <form style={estilos.contenedor} onSubmit={manejarEnvio}>
        <h2 style={estilos.titulo}>REGISTRO DE CARTEL</h2>

        <div style={estilos.bordeSeccion}>
          {/* Campos del cartel */}
          <label style={estilos.label}>Título del Cartel:</label>
          <input style={estilos.input} type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

          <label style={estilos.label}>Vertical:</label>
          <select style={estilos.input} value={vertical} onChange={(e) => setVertical(e.target.value)} required>
            <option value="">SELECCIONE UNA OPCIÓN</option>
            {Object.keys(verticales).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

       {vertical && (
  <>
    <label style={estilos.label}>Programa:</label>
    <input
      list="listaProgramas"
      style={estilos.input}
      type="text"
      value={programa}
      onChange={(e) => setPrograma(e.target.value.toUpperCase())}
      onBlur={() => {
        const lista = verticales[vertical].map(p => p.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase());
        if (!lista.includes(programa.toUpperCase())) {
          setPrograma(''); // obliga a elegir una opción válida
          alert('Selecciona un programa válido de la lista');
        }
      }}
      placeholder="Escribe o selecciona un programa"
      required
    />
    <datalist id="listaProgramas">
      {verticales[vertical]
        .map((p) => p.replace(/\s*\([^)]*\)/g, '').trim()) // quita texto entre paréntesis
        .filter((p) =>
          p.toUpperCase().includes(programa.toUpperCase())
        )
        .map((p) => (
          <option key={p} value={p} />
        ))}
    </datalist>
  </>
)}


          <label style={estilos.label}>Semestres (elige los semestres de tu equipo):</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {Array.from({ length: 10 }, (_, i) => (
              <label key={i} className="flex items-center space-x-1 text-sm text-black">
                <input
                  type="checkbox"
                  checked={semestres.includes(String(i + 1))}
                  onChange={() => manejarCambioSemestre(String(i + 1))}
                />
                <span className="text-black">{i + 1}</span>
              </label>
            ))}
          </div>

          <label style={estilos.label}>Profesor Asesor (Nombre completo):</label>
          <input style={estilos.input} type="text" value={profesorAsesor} onChange={(e) => setProfesorAsesor(e.target.value)} required />

          <label style={estilos.label}>Correo Institucional del Profesor:</label>
          <input style={estilos.input} type="email" value={correoAsesor} onChange={(e) => setCorreoAsesor(e.target.value)} required />

          <label style={estilos.label}>Asignatura Relacionada:</label>
          <input style={estilos.input} type="text" value={asignaturaRelacionada} onChange={(e) => setAsignaturaRelacionada(e.target.value)} required />

          <label style={estilos.label}>¿Es asignatura ABP/ABI?:</label>
          <select style={estilos.input} value={esABP_ABI} onChange={(e) => setEsABP_ABI(e.target.value)} required>
            <option value="">Seleccione</option>
            <option value="SÍ">SÍ</option>
            <option value="NO">NO</option>
          </select>
        </div>

        {participantes.map((p, index) => (
          <div key={index} style={estilos.bordeSeccion}>
            <h4 style={estilos.subtitulo}>
              {index === 0 ? 'Representante' : `Integrante ${index}`}
            </h4>

            <label style={estilos.label}>Nombre(s):</label>
            <input
              style={estilos.input}
              type="text"
              value={p.nombre}
              onChange={(e) => manejarCambioParticipante(index, 'nombre', e.target.value)}
              required={index === 0}
            />

            <label style={estilos.label}>Apellido Paterno:</label>
            <input
              style={estilos.input}
              type="text"
              value={p.apellidoPaterno}
              onChange={(e) => manejarCambioParticipante(index, 'apellidoPaterno', e.target.value)}
              required={index === 0}
            />

            <label style={estilos.label}>Apellido Materno:</label>
            <input
              style={estilos.input}
              type="text"
              value={p.apellidoMaterno}
              onChange={(e) => manejarCambioParticipante(index, 'apellidoMaterno', e.target.value)}
              required={index === 0}
            />

            {index === 0 && (
              <>
                <label style={estilos.label}>Teléfono:</label>
                <input
                  style={estilos.input}
                  type="tel"
                  value={p.telefono}
                  onChange={(e) => manejarCambioParticipante(index, 'telefono', e.target.value)}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />

                <label style={estilos.label}>Correo Institucional:</label>
                <input
                  style={estilos.input}
                  type="email"
                  value={p.correo}
                  onChange={(e) => manejarCambioParticipante(index, 'correo', e.target.value)}
                  required
                />
              </>
            )}
          </div>
        ))}

        <button style={estilos.boton} type="submit">
          Registrar Cartel
        </button>
      </form>
    </>
  );
}
