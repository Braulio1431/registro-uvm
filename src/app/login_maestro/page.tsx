"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";

export default function LoginMaestroPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const rutasCategoria: Record<string, string> = {
    sumo: "/sumo",
    minisumo: "/minisumo",
    laberinto: "/laberinto",
    ia:"/ia",
    retrogames: "/retrogame",
    puentes: "/puentes",
    design: "/design",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login_maestro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error en el inicio de sesión");
        return;
      }

      const categoria = data.maestro?.categorias_permitidas?.toLowerCase() || "";
const destino = rutasCategoria[categoria] || "/";
router.push(destino);

    } catch {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          'url("https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {/* CARD ESTILO MATRIMONY */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "40px",
          borderRadius: "10px",
          backdropFilter: "blur(8px)",
          background: "rgba(0, 0, 0, 0.60)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "white",
          boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        }}
      >
        {/* Título elegante */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "600",
            fontFamily: "serif",
            color: "white",
          }}
        >
          Acceso Maestro
        </h2>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          {/* Campo Usuario */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", opacity: 0.8 }}>Usuario</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "6px",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                paddingLeft: "10px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <User size={18} color="#E60000" style={{ marginRight: "8px" }} />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  background: "transparent",
                  color: "white",
                  outline: "none",
                  fontSize: "15px",
                }}
              />
            </div>
          </div>

          {/* Campo Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", opacity: 0.8 }}>Contraseña</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "6px",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                paddingLeft: "10px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <Lock size={18} color="#E60000" style={{ marginRight: "8px" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  background: "transparent",
                  color: "white",
                  outline: "none",
                  fontSize: "15px",
                }}
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p
              style={{
                background: "rgba(230,0,0,0.35)",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "13px",
                textAlign: "center",
                marginBottom: "15px",
                border: "1px solid rgba(230,0,0,0.55)",
              }}
            >
              {error}
            </p>
          )}

          {/* BOTÓN LOGIN */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#E60000",
              border: "none",
              color: "white",
              fontSize: "16px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Iniciar Sesión
          </motion.button>

          {/* VOLVER */}
          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <Link
              href="/secciones"
              style={{
                color: "#ffffffcc",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              Volver
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
