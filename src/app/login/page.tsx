'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' });
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales),
    });

    const data = await res.json();

  if (res.ok) {
      if (data.tipo === 'admin') {
        sessionStorage.setItem('sesion', 'admin');
        router.push('/admin');
      } else if (data.tipo === 'subadmin') {
        sessionStorage.setItem('sesion', 'subadmin');
        router.push('/subadmin');
      }
    } else {
      setMensaje(data.error);
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
      filter: 'brightness(0.7)',
      zIndex: -1,
    },
    contenedor: {
      maxWidth: '500px',
      margin: '70px auto',
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      zIndex: 2,
    },
  };

  return (
    <>
      <div style={estilos.fondo}></div>

      <div style={estilos.contenedor}>
        <h2 className="text-center mb-4" style={{ color: 'black' }}>Inicio de Sesión (Coordinadores)</h2>
        {mensaje && <div className="alert alert-danger">{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'black' }}>Matrícula / Usuario</label>
            <input
              name="usuario"
              className="form-control border-danger"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ color: 'black' }}>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              className="form-control border-danger"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger w-100">
            Ingresar
          </button>
        </form>
      </div>
    </>
  );
}
