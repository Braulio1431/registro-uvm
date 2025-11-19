'use client';

import Link from 'next/link';

export default function RegistroExitoso() {
  const estilos = {
    fondo: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage:
        'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(0.6)',
      zIndex: -1,
    },
    contenedor: {
      maxWidth: '600px',
      margin: '150px auto',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '40px',
      borderRadius: '12px',
      textAlign: 'center' as const,
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    },
  };

  return (
    <>
      <div style={estilos.fondo}></div>
      <div style={estilos.contenedor}>
        <h2 className="text-success mb-4">¡Registro exitoso!</h2>
        <p style={{ color: '#333', fontSize: '1.1rem' }}>
          Los datos del alumno o equipo se registraron correctamente.
        </p>
        <Link href="/">
          <button className="btn btn-danger mt-4">Regresar al registro</button>
        </Link>
      </div>
    </>
  );
}
