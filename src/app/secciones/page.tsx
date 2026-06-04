"use client";

import Link from "next/link";
import {
  Cpu,
  Shield,
  Layers,
  Image,
  PenTool,
  Recycle,
  Gamepad2,
  Lightbulb,
  ArrowLeft
} from "lucide-react";

export default function SeccionesPage() {
  const opciones = [
    { nombre: "Brackets SUMO", tipo: "sumo", icon: <Shield size={85} /> },
    { nombre: "Brackets MINISUMO", tipo: "minisumo", icon: <Layers size={85} /> },
    { nombre: "Rúbrica - Solución de Laberinto", tipo: "laberinto", icon: <Cpu size={85} /> },
    { nombre: "Rúbrica - Arte generado por IA", tipo: "ia", icon: <Image size={85} /> },
    { nombre: "Rúbrica - Design Speed", tipo: "design", icon: <PenTool size={85} /> },
    { nombre: "Rúbrica - Puentes de material reciclado", tipo: "puentes", icon: <Recycle size={85} /> },
    { nombre: "Rúbrica - Retrogames 8 Bits", tipo: "retrogames", icon: <Gamepad2 size={85} /> },
    { nombre: "Rúbrica - 3er Concurso Nacional de Inventores Linces", tipo: "inventores", icon: <Lightbulb size={85} /> }
  ];

  return (
    <main className="page-bg">
      <div className="overlay" />

      <div className="content-wrapper">
        <Link href="/" className="back-link">
          <div className="back-button">
            <ArrowLeft size={32} />
          </div>
        </Link>

        <h1 className="titulo">Selecciona la Categoría</h1>

        <div className="grid">
          {opciones.map((op, i) => (
            <Link key={i} href={`/login_maestro?tipo=${op.tipo}`} className="clean-link">
              <div className="card">

                <div className="icon-box">
                  {op.icon}
                </div>

                <div className="title-box">
                  <span className="virtual-title">{op.nombre}</span>
                  <div className="underline"></div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .clean-link {
          text-decoration: none !important;
        }

        .page-bg {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          position: relative;
          animation: fadeIn 1s ease forwards;
          background-image: url("https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg");
          background-size: cover;
          background-position: center;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.62);
          backdrop-filter: blur(4px);
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1250px;
          text-align: center;
        }

        .back-link {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 20;
        }

        .back-button {
          color: white;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.22);
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.35s ease;
          cursor: pointer;
          box-shadow: 0 5px 22px rgba(0,0,0,0.35);
          backdrop-filter: blur(5px);
        }

        .back-button:hover {
          border-color: #C40000;
          background: rgba(255,0,0,0.15);
          transform: translateY(-3px);
          box-shadow: 0 14px 35px rgba(0,0,0,0.50);
          color: #ff4d4d;
        }

        .titulo {
          color: white;
          font-size: 48px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 45px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.6);
          text-transform: uppercase;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 35px;
        }

        .card {
          background: rgba(255,255,255,0.06);
          border-radius: 18px;
          border: 1.5px solid rgba(255,255,255,0.22);
          padding: 35px 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: 0.35s ease;
          cursor: pointer;
          box-shadow: 0 5px 22px rgba(0,0,0,0.35);
          backdrop-filter: blur(5px);
          min-height: 310px;
        }

        .card:hover {
          border-color: #C40000;
          background: rgba(255,0,0,0.15);
          transform: translateY(-6px);
          box-shadow: 0 14px 35px rgba(0,0,0,0.50);
        }

        .icon-box {
          color: white;
          margin-bottom: 20px;
          transition: transform 0.35s ease;
        }

        .card:hover .icon-box {
          transform: scale(1.12);
          color: #ff4d4d;
        }

        .virtual-title {
          color: white;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.45);
        }

        .underline {
          width: 0%;
          height: 3px;
          background: #CC0000;
          border-radius: 20px;
          margin: 8px auto 0;
          transition: width 0.38s ease;
        }

        .card:hover .underline {
          width: 80%;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}