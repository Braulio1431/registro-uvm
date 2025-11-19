'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AlumnoForm = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  matricula: string;
  telefono: string;
  carrera: string;
  semestre: string;
  campus: string;
};

type ProfesorForm = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  matricula: string;
  categoria: string;
  campus: string;
  tipo_profesor: string;
};

type FormularioState = {
  categoria: string;
  subcategoria: string;
  integrantes: number;
  tipoRegistro: 'individual' | 'equipo';
  nombreEquipo: string;
  alumnos: AlumnoForm[];
  profesor: ProfesorForm | null;
};

export default function RegistrarAlumno() {
  const router = useRouter();

  const [formulario, setFormulario] = useState<FormularioState>({
    categoria: '',
    subcategoria: '',
    integrantes: 0,
    tipoRegistro: 'individual',
    nombreEquipo: '',
    alumnos: [
      {
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        matricula: '',
        telefono: '',
        carrera: '',
        semestre: '',
        campus: '',
      },
    ],
    profesor: null,
  });

  const [mensaje, setMensaje] = useState('');

  // Subcategorías: claves y valores en MAYÚSCULAS (para que encaje con la selección en mayúsculas)
  const subcategorias: Record<string, string[]> = {
    TALLERES: ['BASKET', 'AJEDREZ', 'FÚTBOL'],
    COMPETENCIAS: [
      'SUMO',
      'MINISUMO',
      'SOLUCIÓN DE LABERINTO',
      'ARTE GENERADO POR IA',
      'DESIGN SPEED (SOLIDWORKS)',
      'PUENTES DE MATERIAL RECICLADO',
      'RETROGAME 8 BITS',
      '3ER CONCURSO NACIONAL DE INVENTORES LINCE',
    ],
    'PRESENTACIÓN DE PROYECTOS': ['CIENCIAS', 'INGENIERÍAS', 'ARTES'],
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Guardar categoría en MAYÚSCULAS
    const categoria = e.target.value.toUpperCase();
    setFormulario({
      categoria,
      subcategoria: '',
      integrantes: 0,
      tipoRegistro: 'individual',
      nombreEquipo: '',
      alumnos: [
        {
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          matricula: '',
          telefono: '',
          carrera: '',
          semestre: '',
          campus: '',
        },
      ],
      profesor: null,
    });
    setMensaje('');
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Guardar subcategoría en MAYÚSCULAS
    const subcategoria = e.target.value.toUpperCase();
    let integrantes = 1;
    let tipoRegistro: 'individual' | 'equipo' = 'individual';

    if (formulario.categoria === 'COMPETENCIAS') {
      // Competencias con registro individual
      const individuales = ['DESIGN SPEED (SOLIDWORKS)', 'ARTE GENERADO POR IA'];
      if (individuales.includes(subcategoria)) {
        integrantes = 1;
        tipoRegistro = 'individual';
      } else {
        // Todas las demás son en equipo de 5
        integrantes = 5;
        tipoRegistro = 'equipo';
      }
    } else if (formulario.categoria === 'PRESENTACIÓN DE PROYECTOS') {
      integrantes = 4;
      tipoRegistro = 'equipo';
    }

    setFormulario((prev) => ({
      ...prev,
      subcategoria,
      integrantes,
      tipoRegistro,
      nombreEquipo: '',
      alumnos: Array.from({ length: integrantes }, () => ({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        matricula: '',
        telefono: '',
        carrera: '',
        semestre: '',
        campus: '',
      })),
    }));

    setMensaje('');
  };

  // handleAlumnoChange ahora permite escribir números en matricula/telefono
  const handleAlumnoChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormulario((prev) => {
      const alumnos = [...prev.alumnos];
      if (!alumnos[index]) {
        alumnos[index] = {
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          matricula: '',
          telefono: '',
          carrera: '',
          semestre: '',
          campus: '',
        };
      }

      let nuevoValor: string | number = value;

      // Si el campo es matricula o telefono: solo números y máximo 10 dígitos
      if (name === 'matricula' || name === 'telefono') {
        nuevoValor = value.replace(/[^0-9]/g, '').slice(0, 10);
      } else {
        // otros campos: forzar mayúsculas
        nuevoValor = typeof value === 'string' ? value.toUpperCase() : value;
      }

      alumnos[index] = {
        ...alumnos[index],
        // @ts-ignore asignamos por name dinámico
        [name]: nuevoValor,
      };
      return { ...prev, alumnos };
    });
  };

  const handleNombreEquipoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario((prev) => ({ ...prev, nombreEquipo: e.target.value.toUpperCase() }));
  };

  // Manejo de cambios en profesor — ahora trata matricula como numérico y demás en MAYÚSCULAS
  const handleProfesorChange = (field: keyof ProfesorForm, value: string) => {
    setFormulario((prev) => ({
      ...prev,
      profesor: {
        ...(prev.profesor ?? {
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          matricula: '',
          categoria: 'VISITAS',
          campus: '',
          tipo_profesor: 'tiempo completo',
        }),
        [field]:
          field === 'matricula'
            ? value.replace(/[^0-9]/g, '').slice(0, 10)
            : field === 'tipo_profesor' || field === 'categoria'
            ? value.toUpperCase()
            : value.trim().toUpperCase(),
      },
    }));
  };

  const validarAntesDeEnviar = (): { ok: boolean; error?: string } => {
    if (!formulario.categoria) return { ok: false, error: 'Selecciona una categoría' };
    if (subcategorias[formulario.categoria] && !formulario.subcategoria)
      return { ok: false, error: 'Selecciona una subcategoría' };

    if (formulario.tipoRegistro === 'equipo') {
      if (!formulario.nombreEquipo || formulario.nombreEquipo.trim().length < 2)
        return { ok: false, error: 'Ingresa un nombre de equipo válido' };
      for (let i = 0; i < formulario.alumnos.length; i++) {
        const a = formulario.alumnos[i];
        if (!a.nombre || !a.matricula || !a.carrera)
          return { ok: false, error: `Completa los datos del Alumno ${i + 1}` };
      }
    } else {
      const a = formulario.alumnos[0];
      if (!a.nombre || !a.matricula || !a.carrera) return { ok: false, error: 'Completa los datos del alumno' };
    }

    if (formulario.profesor) {
      if (!formulario.profesor.nombre || !formulario.profesor.matricula || !formulario.profesor.campus)
        return { ok: false, error: 'Si registras profesor, completa nombre, matrícula y campus' };
      // tipo_profesor y categoria tienen valores por defecto
    }

    return { ok: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    const valid = validarAntesDeEnviar();
    if (!valid.ok) {
      setMensaje(valid.error || 'Error de validación');
      return;
    }

    // Payload adaptado a los campos del page profesor
    const payload: any = {
      categoria: formulario.categoria,
      subcategoria: formulario.subcategoria || null,
      tipoRegistro: formulario.tipoRegistro,
      nombreEquipo: formulario.tipoRegistro === 'equipo' ? formulario.nombreEquipo : null,
      alumnos: formulario.alumnos.map((a) => ({
        nombre: a.nombre.trim(),
        apellidoPaterno: a.apellidoPaterno.trim(),
        apellidoMaterno: a.apellidoMaterno.trim(),
        matricula: a.matricula.trim(),
        telefono: a.telefono ? a.telefono.trim() : null,
        carrera: a.carrera.trim(),
        semestre: a.semestre ? a.semestre.trim() : null,
        campus: a.campus ? a.campus.trim() : null,
      })),
      profesor: formulario.profesor
        ? {
            nombre: formulario.profesor.nombre.trim(),
            apellidoPaterno: formulario.profesor.apellidoPaterno.trim(),
            apellidoMaterno: formulario.profesor.apellidoMaterno.trim(),
            matricula: formulario.profesor.matricula.trim(),
            categoria: formulario.profesor.categoria || formulario.categoria || 'VISITAS',
            campus: formulario.profesor.campus.trim(),
            tipo_profesor: formulario.profesor.tipo_profesor || 'tiempo completo',
          }
        : null,
    };

    try {
      const res = await fetch('/api/alumno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && (data.mensaje || data.success)) {
        router.push('/registro-exitoso');
      } else {
        setMensaje(data.error || 'Error en servidor');
      }
    } catch (err) {
      console.error(err);
      setMensaje('Error al conectar con el servidor');
    }
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
      textTransform: 'uppercase' as const, // muestra en mayúsculas visualmente
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
      <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex flex-column gap-2">
        <Link href="/">
          <button className="btn btn-outline-light">Cerrar Formulario</button>
        </Link>
      </div>

      <div style={estilos.fondo}></div>
      <div style={estilos.contenedor}>
        <h2 style={estilos.titulo}>Registro de Alumnos</h2>

        {mensaje && <div className="alert alert-danger text-center">{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          {/* Categoría */}
          <div className="mb-3">
            <label className="form-label fw-bold text-danger">Categoría</label>
            <select
              value={formulario.categoria}
              onChange={handleCategoriaChange}
              className="form-select"
              style={estilos.input}
              required
            >
              <option value="">-- Seleccione categoría --</option>
              <option value="TALLERES">TALLERES</option>
              <option value="COMPETENCIAS">COMPETENCIAS</option>
              <option value="PRESENTACIÓN DE PROYECTOS">PRESENTACIÓN DE PROYECTOS</option>
              <option value="VISITAS">VISITAS</option>
            </select>
          </div>

          {/* Subcategoría */}
          {subcategorias[formulario.categoria] && (
            <div className="mb-3">
              <label className="form-label fw-bold text-danger">Subcategoría</label>
              <select
                value={formulario.subcategoria}
                onChange={handleSubcategoriaChange}
                className="form-select"
                style={estilos.input}
                required={true} // <--- fuerza que siempre se seleccione
              >
                <option value="">-- Seleccione subcategoría --</option>
                {subcategorias[formulario.categoria].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nombre del equipo */}
          {formulario.tipoRegistro === 'equipo' && formulario.subcategoria && (
            <div className="mb-3">
              <label className="form-label fw-bold text-danger">Nombre del equipo</label>
              <input
                className="form-control"
                value={formulario.nombreEquipo}
                onChange={handleNombreEquipoChange}
                placeholder="Nombre del equipo"
                style={estilos.input}
                required
              />
            </div>
          )}

          {/* Datos de alumnos */}
          {formulario.subcategoria && (
            <>
              {formulario.alumnos.map((al, i) => (
                <div key={i} style={estilos.bordeSeccion}>
                  <h5 style={{ color: '#b30000', fontWeight: 'bold' }}>Alumno {i + 1}</h5>

                  <div className="mb-2">
                    <label className="form-label">Nombre(s)</label>
                    <input
                      name="nombre"
                      value={al.nombre || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-control"
                      style={estilos.input}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Apellido Paterno</label>
                    <input
                      name="apellidoPaterno"
                      value={al.apellidoPaterno || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-control"
                      style={estilos.input}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Apellido Materno</label>
                    <input
                      name="apellidoMaterno"
                      value={al.apellidoMaterno || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-control"
                      style={estilos.input}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Matrícula</label>
                    <input
                      name="matricula"
                      type="text"
                      value={al.matricula || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-control"
                      style={estilos.input}
                      maxLength={10}
                      required
                      placeholder="Ingresa tu matricula"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Teléfono</label>
                    <input
                      name="telefono"
                      type="text"
                      value={al.telefono || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-control"
                      style={estilos.input}
                      maxLength={10}
                      required
                      placeholder="Ingresa tu teléfono"
                    />
                  </div>

                  {/* Carrera */}
                  <div className="mb-2">
                    <label className="form-label">Carrera</label>
                    <select
                      name="carrera"
                      value={al.carrera || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-select"
                      style={estilos.input}
                      required
                    >
                      <option value="">Seleccione una carrera</option>
                      <option>BIOQUIMICA</option>
                      <option>BIOTECNOLOGIA</option>
                      <option>ELECTRONICA</option>
                      <option>FISICA</option>
                      <option>INGENIERIA BIOMEDICA</option>
                      <option>INGENIERIA CIVIL</option>
                      <option>INGENIERÍA EN ANIMACIÓN E INTERACTIVIDAD</option>
                      <option>INGENIERIA EN CIENCIAS DE DATOS</option>
                      <option>INGENIERIA EN DESARROLLO DE VIDEOJUEGOS</option>
                      <option>INGENIERIA EN ENERGIA Y DESARROLLO SUSTENTABLE</option>
                      <option>INGENIERIA EN MECATRONICA CON ENFOQUE AUTOMOTRIZ</option>
                      <option>INGENIERIA EN PETROLEO Y GAS</option>
                      <option>INGENIERIA EN ROBOTICA</option>
                      <option>INGENIERÍA EN SISTEMAS COMPUTACIONALES</option>
                      <option>INGENIERIA INDUSTRIAL Y DE SISTEMAS</option>
                      <option>INGENIERIA MECANICA INDUSTRIAL</option>
                      <option>INGENIERÍA MECATRÓNICA</option>
                      <option>INTELIGENCIA ARTIFICIAL Y CIENCIAS DE DATOS</option>
                    </select>
                  </div>

                  {/* Semestre */}
                  <div className="mb-2">
                    <label className="form-label">Semestre</label>
                    <select
                      name="semestre"
                      value={al.semestre || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-select"
                      style={estilos.input}
                    >
                      <option value="">Seleccione un semestre</option>
                      {Array.from({ length: 10 }, (_, k) => (
                        <option key={k + 1}>{k + 1}</option>
                      ))}
                    </select>
                  </div>

                  {/* Campus */}
                  <div className="mb-2">
                    <label className="form-label">Campus</label>
                    <select
                      name="campus"
                      value={al.campus || ''}
                      onChange={(e) => handleAlumnoChange(i, e)}
                      className="form-select"
                      style={estilos.input}
                      required
                    >
                      <option value="">Seleccione un campus</option>
                      <option>AGUASCALIENTES</option>
                      <option>CHIHUAHUA</option>
                      <option>CIUDAD JUÁREZ</option>
                      <option>CIUDAD VICTORIA</option>
                      <option>COYOACÁN - TLALPAN</option>
                      <option>CUERNAVACA</option>
                      <option>GUADALAJARA NORTE</option>
                      <option>GUADALAJARA SUR</option>
                      <option>HERMOSILLO</option>
                      <option>HISPANO</option>
                      <option>LOMAS VERDES</option>
                      <option>MÉRIDA</option>
                      <option>MONTERREY</option>
                      <option>NUEVO LAREDO</option>
                      <option>PUEBLA</option>
                      <option>QUERÉTARO</option>
                      <option>SAN RAFAEL</option>
                      <option>SAN LUIS POTOSÍ</option>
                      <option>TEXCOCO</option>
                      <option>TOLUCA</option>
                      <option>TORREÓN</option>
                      <option>TUXTLA</option>
                      <option>VERACRUZ</option>
                      <option>VILLAHERMOSA</option>
                      <option>ZAPOPAN</option>
                    </select>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn w-100"
              style={{ backgroundColor: '#b30000', color: 'white', fontWeight: 'bold' }}
              type="submit"
            >
              Registrar
            </button>
          </div>

          {/* Checkbox para registrar profesor */}
          <div className="form-check mb-3 mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="checkboxProfesor"
              checked={!!formulario.profesor}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormulario((prev) => ({
                    ...prev,
                    profesor: {
                      nombre: '',
                      apellidoPaterno: '',
                      apellidoMaterno: '',
                      matricula: '',
                      categoria: 'VISITAS',
                      campus: '',
                      tipo_profesor: 'tiempo completo',
                    },
                  }));
                } else {
                  setFormulario((prev) => ({ ...prev, profesor: null }));
                }
              }}
            />
            <label className="form-check-label fw-bold text-danger" htmlFor="checkboxProfesor">
              Registrar profesor responsable
            </label>
          </div>

          {/* Formulario del profesor */}
          {formulario.profesor && (
            <div style={estilos.bordeSeccion}>
              <h5 style={{ color: '#b30000', fontWeight: 'bold' }}>Profesor Responsable</h5>

              <div className="mb-2">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  value={formulario.profesor.nombre || ''}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, nombre: e.target.value.toUpperCase() },
                    }))
                  }
                  className="form-control"
                  style={estilos.input}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Apellido Paterno</label>
                <input
                  type="text"
                  value={formulario.profesor.apellidoPaterno || ''}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, apellidoPaterno: e.target.value.toUpperCase() },
                    }))
                  }
                  className="form-control"
                  style={estilos.input}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Apellido Materno</label>
                <input
                  type="text"
                  value={formulario.profesor.apellidoMaterno || ''}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, apellidoMaterno: e.target.value.toUpperCase() },
                    }))
                  }
                  className="form-control"
                  style={estilos.input}
                />
              </div>

              {/* Matrícula */}
              <div className="mb-2">
                <label className="form-label">Matrícula</label>
                <input
                  name="matricula"
                  type="text"
                  value={formulario.profesor?.matricula || ''}
                  onChange={(e) => {
                    // Solo números y máximo 10 dígitos
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    handleProfesorChange('matricula', onlyNums);
                  }}
                  className="form-control"
                  style={estilos.input}
                  maxLength={10}
                  required
                  placeholder="Ingresa tu matrícula"
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Categoría</label>
                <select
                  value={formulario.profesor.categoria || 'VISITAS'}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, categoria: e.target.value.toUpperCase() },
                    }))
                  }
                  className="form-select"
                  style={estilos.input}
                >
                  <option value="VISITAS">VISITAS</option>
                  <option value="COMPETENCIAS">COMPETENCIAS</option>
                  <option value="TALLERES">TALLERES</option>
                  <option value="PRESENTACIÓN DE PROYECTOS">PRESENTACIÓN DE PROYECTOS</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">Campus</label>
                <select
                  value={formulario.profesor.campus || ''}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, campus: e.target.value.toUpperCase() },
                    }))
                  }
                  className="form-select"
                  style={estilos.input}
                  required
                >
                  <option value="">Seleccione un campus</option>
                  <option>AGUASCALIENTES</option>
                  <option>CHIHUAHUA</option>
                  <option>CIUDAD JUÁREZ</option>
                  <option>CIUDAD VICTORIA</option>
                  <option>COYOACÁN - TLALPAN</option>
                  <option>CUERNAVACA</option>
                  <option>GUADALAJARA NORTE</option>
                  <option>GUADALAJARA SUR</option>
                  <option>HERMOSILLO</option>
                  <option>HISPANO</option>
                  <option>LOMAS VERDES</option>
                  <option>MÉRIDA</option>
                  <option>MONTERREY</option>
                  <option>NUEVO LAREDO</option>
                  <option>PUEBLA</option>
                  <option>QUERÉTARO</option>
                  <option>SAN RAFAEL</option>
                  <option>SAN LUIS POTOSÍ</option>
                  <option>TEXCOCO</option>
                  <option>TOLUCA</option>
                  <option>TORREÓN</option>
                  <option>TUXTLA</option>
                  <option>VERACRUZ</option>
                  <option>VILLAHERMOSA</option>
                  <option>ZAPOPAN</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">Tipo de Profesor</label>
                <select
                  value={formulario.profesor.tipo_profesor || 'tiempo completo'}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      profesor: { ...prev.profesor!, tipo_profesor: e.target.value },
                    }))
                  }
                  className="form-select"
                  style={estilos.input}
                >
                  <option value="tiempo completo">Tiempo completo</option>
                  <option value="por horas">Por horas</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
      <style jsx>{`
        label.form-label {
          color: #000000 !important;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
