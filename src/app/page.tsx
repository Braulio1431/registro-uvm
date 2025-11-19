'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import {
  Menu,
  X,
  BookMarked,
  User,
  Users,
  ClipboardList,
  Trophy,
  MapPin,
  Home,
} from 'lucide-react';

// === IMÁGENES ===
const BACKGROUND_IMAGES = [
  {
    src: "/imagen_campus6.webp",
    blur: "/imagen_campus6-mini.webp"
  },
  { 
    src: "/imagen_campus7.webp",
    blur: "/imagen_campus7.webp"
  },
  { 
    src: "/imagen_campus8.webp",
    blur: "/imagen_campus8.webp"
  },
  { 
    src: "/imagen_campus9.webp",
    blur: "/imagen_campus9.webp"
  },
];


export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  // control de carga
  const [loading, setLoading] = useState(true);

  // control de carga de imágenes FULL
  const [loadedFull, setLoadedFull] = useState<{ [key: number]: boolean }>({
    0: false
  });

  // quitar preloader rápido
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 60);
    return () => clearTimeout(t);
  }, []);

  // carrusel inteligente (solo si la siguiente imagen ya cargó)
  useEffect(() => {
    const next = (currentIndex + 1) % BACKGROUND_IMAGES.length;
    if (!loadedFull[next]) return;

    const tm = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % BACKGROUND_IMAGES.length);
    }, 6000);

    return () => clearInterval(tm);
  }, [currentIndex, loadedFull]);

  const menu = [
    { label: 'Registro de Carteles', href: '/cartel', icon: BookMarked },
    { label: 'Acceso de Profesores', href: '/profesor', icon: User },
    { label: 'Acceso de Coordinadores', href: '/login', icon: Users },
    { label: 'Registro de Talleres', href: '/alumno', icon: ClipboardList },
    { label: 'Competencias', href: '/alumno', icon: Trophy },
    { label: 'Presentación de Proyectos', href: '/alumno', icon: Home },
    { label: 'Visitas', href: '/alumno', icon: MapPin },
  ];

  // === PRELOADER ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#b60000] text-white gap-6">

        <div className="flex flex-col items-center">
          <div className="text-4xl font-extrabold tracking-widest">UVM</div>
          <p className="text-sm opacity-80 -mt-1">Universidad del Valle de México</p>
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />

        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1/2 h-full bg-white"
          />
        </div>

        <p className="text-sm opacity-80">Cargando plataforma...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex text-black relative overflow-hidden"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
    >
      {/* FONDO OPTIMIZADO */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        {/* === PRIMERA IMAGEN — MINI INSTANTÁNEA + FULL === */}
        <div className="absolute inset-0"
          style={{
            opacity: currentIndex === 0 ? 1 : 0,
            transition: "opacity 1.4s ease-in-out"
          }}
        >
          {/* MINI visible instantánea */}
          <Image
            src={BACKGROUND_IMAGES[0].blur}
            alt="Mini fondo"
            fill
            priority
            unoptimized
            style={{ objectFit: "cover" }}
          />

          {/* FULL aparece cuando carga */}
          <Image
            src={BACKGROUND_IMAGES[0].src}
            alt="Fondo grande"
            fill
            unoptimized
            priority
            onLoadingComplete={() =>
              setLoadedFull((p) => ({ ...p, 0: true }))
            }
            style={{
              objectFit: "cover",
              opacity: loadedFull[0] ? 1 : 0,
              transition: "opacity 1.4s ease-in-out"
            }}
          />
        </div>

        {/* === RESTO DE IMÁGENES === */}
        {BACKGROUND_IMAGES.slice(1).map((img, i) => {
          const idx = i + 1;
          return (
            <motion.div
              key={idx}
              className="absolute inset-0"
              animate={{ opacity: currentIndex === idx ? 1 : 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            >
              <Image
                src={img.src}
                alt={`Fondo ${idx + 1}`}
                fill
                unoptimized
                loading="lazy"
                onLoadingComplete={() =>
                  setLoadedFull((p) => ({ ...p, [idx]: true }))
                }
                style={{ objectFit: "cover" }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* === SIDEBAR DESKTOP (NO MODIFICADO) === */}
      <aside
        className={`hidden md:flex flex-col bg-[#b60000] text-white shadow-2xl z-40
          ${collapsed ? 'w-24' : 'w-64'} transition-[width] duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-bold text-lg text-[#b60000]">U</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold leading-none">UVM Linces</h1>
                <p className="text-xs mt-0.5 text-white/80">Registro de eventos</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-md hover:bg-white/10 transition"
          >
            {collapsed ? <Menu size={22} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-6">
          <ul className="flex flex-col gap-2">
            {menu.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.label}>
                  <a href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/15 transition cursor-pointer ${
                        collapsed ? 'justify-center' : ''
                      }`}
                    >
                      <Icon size={20} />
                      {!collapsed && <span className="text-sm font-medium">{m.label}</span>}
                    </motion.div>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-white/20 text-xs text-center text-white/70">
          © {new Date().getFullYear()} UVM
        </div>
      </aside>

      {/* === SIDEBAR MÓVIL (NO MODIFICADO) === */}
      <div className="md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-[#b60000] text-white p-2 rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <div
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 bg-black/40"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 120 }}
                className="absolute left-0 top-0 bottom-0 w-64 bg-[#b60000] text-white shadow-2xl p-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold">UVM Linces</h2>
                    <p className="text-xs text-white/80">Registro de eventos</p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav>
                  <ul className="flex flex-col gap-2">
                    {menu.map((m) => {
                      const Icon = m.icon;
                      return (
                        <li key={m.label}>
                          <a
                            href={m.href}
                            onClick={() => setSidebarOpen(false)}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/15 transition cursor-pointer"
                            >
                              <Icon size={18} />
                              <span className="text-sm font-medium text-white">{m.label}</span>
                            </motion.div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 min-h-screen relative">
        <footer className="absolute bottom-4 left-0 right-0 text-center z-10">
          <div className="text-xs text-white/90 drop-shadow-md">
            © {new Date().getFullYear()} Universidad del Valle de México — Todos los derechos reservados.
          </div>
        </footer>
      </main>
    </div>
  );
}
