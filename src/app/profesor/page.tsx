'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistroProfesor() {
  const router = useRouter();

  // === Helpers (definidos arriba para evitar errores de referencia) ===
  const profesorId = (p: any) =>
    p?.id ?? p?.id_profesor_designado ?? p?.id_profesor ?? p?.ID ?? null;

  const nombreProfesor = (p: any) => {
    const nombre = p?.nombre || '';
    const paterno = p?.apellido_paterno || '';
    const materno = p?.apellido_materno || '';
    return `${nombre} ${paterno} ${materno}`.trim();
  };

  // === Estados ===
  const [tipoRegistro, setTipoRegistro] = useState('');
  const [profesores, setProfesores] = useState<any[]>([]);
  const [carteles, setCarteles] = useState<any[]>([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(''); // guarda id (string)
  const [claveCartel, setClaveCartel] = useState('');
  const [nuevoProfesor, setNuevoProfesor] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    matricula: '',
    area_evaluar: '',
    telefono: '',
    correo: '',
  });

  // === Cargar datos de profesores y carteles ===
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [profRes, cartRes] = await Promise.all([fetch('/api/profesor'), fetch('/api/cartel')]);

        const profesoresData = await profRes.json();
        const cartelesData = await cartRes.json();

        setProfesores(Array.isArray(profesoresData) ? profesoresData : []);
        setCarteles(Array.isArray(cartelesData) ? cartelesData : []);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    obtenerDatos();
  }, []);

  // === Manejar cambios en los inputs ===
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let nuevoValor = value.toUpperCase();

    // Solo números en matrícula y teléfono
    if (name === 'matricula' || name === 'telefono') {
      nuevoValor = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setNuevoProfesor((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));
  };

  // === Envío del formulario ===
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validar que haya carteles cargados
    if (!carteles || carteles.length === 0) {
      alert('No hay carteles registrados para asignar.');
      return;
    }

    // ✅ Validar claveCartel
    const claveValida = carteles.some(
      (c) =>
        c?.clave_cartel &&
        claveCartel &&
        c.clave_cartel.toString().toUpperCase() === claveCartel.toString().toUpperCase()
    );

    if (!claveValida) {
      alert('Por favor selecciona una clave de cartel válida de la lista.');
      return;
    }

    // ✅ Determinar área a evaluar según el tipo de registro
    let areaEvaluar = '';

    if (tipoRegistro === 'nuevo') {
      areaEvaluar = nuevoProfesor.area_evaluar; // <-- Aquí sí tomamos el valor real
    } else if (tipoRegistro === 'registrado') {
      const profesorObj = profesores.find((p) => {
        const id = profesorId(p);
        return id !== null && id?.toString() === profesorSeleccionado;
      });
      areaEvaluar = profesorObj?.area_evaluar || '';
    }

    // Construir datos a enviar
    const datos = {
      profesorSeleccionado: tipoRegistro === 'registrado' ? profesorSeleccionado : null,
      claveCartel,
      nombre: nuevoProfesor.nombre,
      apellido_paterno: nuevoProfesor.apellido_paterno,
      apellido_materno: nuevoProfesor.apellido_materno,
      matricula: nuevoProfesor.matricula,
      telefono: nuevoProfesor.telefono,
      correo: nuevoProfesor.correo,
      area_evaluar: areaEvaluar,
    };

    try {
      const res = await fetch('/api/profesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        alert('Registro exitoso');

        // obtener la matrícula a enviar (seguro y sin errores)
        let matriculaEnviar = '';

        if (tipoRegistro === 'nuevo') {
          matriculaEnviar = nuevoProfesor.matricula;
        } else if (tipoRegistro === 'registrado') {
          const profesorObj = profesores.find((p) => {
            const id = profesorId(p);
            return id !== null && id?.toString() === profesorSeleccionado;
          });
          matriculaEnviar = profesorObj?.matricula ?? '';
        }

        const queryParams = new URLSearchParams({
  matricula_profesor: matriculaEnviar || '',
  clave_cartel: claveCartel || '',
});


router.push(`/rubrica?${queryParams.toString()}`);

        router.push(`/rubrica?${queryParams.toString()}`);
      } else {
        alert('Error al registrar profesor');
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Ocurrió un error al comunicarse con el servidor.');
    }
  };

  // === Estilos (mantenemos simple, funcional) ===
  const estilos = {
    fondo: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/fs/e04920100990617.5f15ce182ffd9.jpg)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      filter: 'brightness(0.6)',
      zIndex: -1,
    },
    contenedor: {
      position: 'relative' as const,
      maxWidth: '800px',
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
      fontWeight: 600,
    },
    input: {
      border: '1.5px solid #b30000',
      borderRadius: '8px',
      color: '#000000',
      textTransform: 'uppercase' as const,
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
    },
  };

  return (
    <>
      {/* 🔴 Botón fijo en esquina superior derecha */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10,
        }}
      >
        <Link href="/">
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
            Cerrar Formulario
          </button>
        </Link>
      </div>

      <div style={estilos.fondo}></div>

      <div style={estilos.contenedor}>
        <h2 style={{ color: '#b30000', textAlign: 'center' }}>Registro de Profesor</h2>

        <form onSubmit={manejarEnvio}>
          {/* === Tipo de registro === */}
          <div className="mb-3">
            <label style={estilos.label}>Tipo de Registro:</label>
            <select
              name="tipoRegistro"
              value={tipoRegistro}
              onChange={(e) => {
                setTipoRegistro(e.target.value);
                setProfesorSeleccionado('');
                setNuevoProfesor({
                  nombre: '',
                  apellido_paterno: '',
                  apellido_materno: '',
                  matricula: '',
                  area_evaluar: '',
                  telefono: '',
                  correo: '',
                });
              }}
              className="form-control"
              style={estilos.input}
              required
            >
              <option value="">-- Seleccionar tipo --</option>
              <option value="registrado">Profesor Registrado</option>
              <option value="nuevo">Nuevo Profesor</option>
            </select>
          </div>

          {/* === Profesor registrado === */}
          {tipoRegistro === 'registrado' && (
            <div style={estilos.bordeSeccion}>
              <h4 style={estilos.label}>Profesor Registrado</h4>
              <select
                name="profesorSeleccionado"
                value={profesorSeleccionado}
                onChange={(e) => setProfesorSeleccionado(e.target.value)}
                className="form-control mb-3"
                style={estilos.input}
                required
              >
                <option value="">-- Seleccionar Profesor --</option>
                {profesores.map((p) => {
                  const id = profesorId(p);
                  const nombre = nombreProfesor(p);
                  const area = p.area_evaluar || '';
                  return (
                    <option key={id ?? Math.random()} value={id?.toString() || ''}>
                      {nombre} {area ? `(${area})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* === Nuevo profesor === */}
          {tipoRegistro === 'nuevo' && (
            <div style={estilos.bordeSeccion}>
              <h4 style={estilos.label}>Nuevo Profesor</h4>

              <div className="mb-3">
                <label style={estilos.label}>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoProfesor.nombre}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                  required
                />
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Apellido Paterno:</label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={nuevoProfesor.apellido_paterno}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                  required
                />
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Apellido Materno:</label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={nuevoProfesor.apellido_materno}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                />
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Matrícula:</label>
                <input
                  type="text"
                  name="matricula"
                  value={nuevoProfesor.matricula}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                  maxLength={10}
                  required
                />
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Área a Evaluar:</label>
                <select
                  name="area_evaluar"
                  value={nuevoProfesor.area_evaluar}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                  required
                >
                  <option value="">-- Seleccionar Área --</option>
                  <option value="LICENCIATURA SEMESTRAL (L6)">LICENCIATURA SEMESTRAL (L6)</option>
                  <option value="CIENCIAS DE LA SALUD (NC)">CIENCIAS DE LA SALUD (NC)</option>
                </select>
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Teléfono:</label>
                <input
                  type="text"
                  name="telefono"
                  value={nuevoProfesor.telefono}
                  onChange={manejarCambio}
                  className="form-control"
                  style={estilos.input}
                  maxLength={10}
                  required
                />
              </div>

              <div className="mb-3">
                <label style={estilos.label}>Correo:</label>
                <input
                  type="email"
                  name="correo"
                  value={nuevoProfesor.correo}
                  onChange={(e) =>
                    setNuevoProfesor((prev) => ({
                      ...prev,
                      correo: e.target.value.toUpperCase(),
                    }))
                  }
                  className="form-control"
                  style={estilos.input}
                  required
                />
              </div>
            </div>
          )}

          {/* === Clave del cartel (siempre visible) === */}
          <div style={estilos.bordeSeccion}>
            <h4 style={estilos.label}>Clave del Cartel</h4>
            <input
              list="listaCarteles"
              name="claveCartel"
              value={claveCartel}
              onChange={(e) => setClaveCartel(e.target.value)}
              className="form-control mb-3"
              style={estilos.input as React.CSSProperties}
              placeholder="Buscar o seleccionar clave de cartel"
              required
            />
            <datalist id="listaCarteles">
              {carteles.map((c) => (
                <option key={c.id_cartel ?? Math.random()} value={c.clave_cartel} />
              ))}
            </datalist>
          </div>

          <button type="submit" style={estilos.boton as React.CSSProperties}>
            Registrar / Continuar
          </button>
        </form>
      </div>
    </>
  );
}
