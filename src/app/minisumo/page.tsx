"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Equipo = {
  id_equipo: number;
  nombre_equipo: string;
};

type Match = {
  id: string;
  equipo1: Equipo | null;
  equipo2: Equipo | null;
  ganador: Equipo | null;
  round: number;
};

export default function CompetenciasPage() {
  const router = useRouter();

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  const [rondas, setRondas] = useState<Match[][]>([]);
  const [playInMatch, setPlayInMatch] = useState<Match | null>(null);
  const [tercerLugar, setTercerLugar] = useState<Match | null>(null);
  const [podio, setPodio] = useState<{ primero: string; segundo: string; tercero: string } | null>(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await fetch("/api/minisumo");
        const data = await res.json();
        setEquipos(data.equipos || []);
      } catch (error) {
        console.error("Error cargando equipos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  const generarBracket = () => {
    if (equipos.length < 2) {
      alert("Debe haber mínimo 2 equipos.");
      return;
    }

    const mezcla = [...equipos].sort(() => Math.random() - 0.5);
    const arr = [...mezcla];

    let playIn: Match | null = null;

    if (arr.length % 2 !== 0) {
      const eq1 = arr.pop()!;
      const eq2 = arr.pop()!;

      playIn = {
        id: crypto.randomUUID(),
        equipo1: eq1,
        equipo2: eq2,
        ganador: null,
        round: 0,
      };
    }

    const primeraRonda: Match[] = [];
    for (let i = 0; i < arr.length; i += 2) {
      primeraRonda.push({
        id: crypto.randomUUID(),
        equipo1: arr[i],
        equipo2: arr[i + 1],
        ganador: null,
        round: 1,
      });
    }

    setPlayInMatch(playIn);
    setTercerLugar(null);
    setPodio(null);
    setRondas([primeraRonda]);
  };

  const setGanador = (roundIndex: number, matchId: string, equipo: Equipo) => {
    setRondas(prev =>
      prev.map((r, i) =>
        i !== roundIndex ? r : r.map(m => (m.id === matchId ? { ...m, ganador: equipo } : m))
      )
    );
  };

  const setGanadorPlayIn = (equipo: Equipo) => {
    if (!playInMatch) return;
    setPlayInMatch({ ...playInMatch, ganador: equipo });
  };

  const setGanadorTercerLugar = (equipo: Equipo) => {
    if (!tercerLugar) return;
    setTercerLugar({ ...tercerLugar, ganador: equipo });
  };

  const avanzarRonda = () => {
    const nuevasRondas = [...rondas];

    if (playInMatch && nuevasRondas.length === 1) {
      if (!playInMatch.ganador) {
        alert("Debes elegir ganador del Play-In.");
        return;
      }

      const primera = [...nuevasRondas[0]];

      let inserted = false;
      for (let i = 0; i < primera.length; i++) {
        if (!primera[i].equipo2) {
          primera[i].equipo2 = playInMatch.ganador;
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        primera.push({
          id: crypto.randomUUID(),
          equipo1: playInMatch.ganador,
          equipo2: null,
          ganador: null,
          round: 1,
        });
      }

      nuevasRondas[0] = primera;
      setPlayInMatch(null);
      setRondas(nuevasRondas);
      return;
    }

    const ultima = nuevasRondas[nuevasRondas.length - 1];
    if (!ultima) return;

    if (ultima.length === 1) {
      alert("Esta es la ronda final. Selecciona el ganador y genera el podio si aplica.");
      return;
    }

    if (ultima.some(m => !m.ganador)) {
      alert("Selecciona todos los ganadores de la ronda actual.");
      return;
    }

    const ganadores = ultima.map(m => m.ganador!) as Equipo[];
    const siguiente: Match[] = [];

    for (let i = 0; i < ganadores.length; i += 2) {
      siguiente.push({
        id: crypto.randomUUID(),
        equipo1: ganadores[i],
        equipo2: ganadores[i + 1] ?? null,
        ganador: null,
        round: nuevasRondas.length + 1,
      });
    }

    if (ganadores.length === 2 && ultima.length === 2) {
      const perdedores = ultima.map(m =>
        m.ganador!.id_equipo === m.equipo1!.id_equipo ? m.equipo2! : m.equipo1!
      );
      setTercerLugar({
        id: crypto.randomUUID(),
        equipo1: perdedores[0],
        equipo2: perdedores[1],
        ganador: null,
        round: 99,
      });
    }

    nuevasRondas.push(siguiente);
    setRondas(nuevasRondas);
  };

  const generarPodio = () => {
    if (rondas.length === 0) return;
    const finalRonda = rondas[rondas.length - 1];
    const finalMatch = finalRonda[0];
    if (!finalMatch?.ganador) {
      alert("Selecciona ganador de la final.");
      return;
    }
    if (tercerLugar && !tercerLugar.ganador) {
      alert("Selecciona ganador del 3er lugar.");
      return;
    }

    const primero = finalMatch.ganador!.nombre_equipo;
    const segundo =
      finalMatch.ganador!.id_equipo === finalMatch.equipo1?.id_equipo
        ? finalMatch.equipo2!.nombre_equipo
        : finalMatch.equipo1!.nombre_equipo;

    const tercero = tercerLugar?.ganador?.nombre_equipo || "No aplica";

    setPodio({ primero, segundo, tercero });
  };

  const MatchBox = ({ match, onWinner }: { match: Match; onWinner: (e: Equipo) => void }) => {
    return (
      <div className="match fadeIn">
        <div className="match-row">
          <div
            className={`team ${match.ganador?.id_equipo === match.equipo1?.id_equipo ? "win" : ""}`}
            onClick={() => match.equipo1 && onWinner(match.equipo1)}
          >
            {match.equipo1?.nombre_equipo ?? "—"}
          </div>

          <span className="vs">VS</span>

          <div
            className={`team ${match.ganador?.id_equipo === match.equipo2?.id_equipo ? "win" : ""}`}
            onClick={() => match.equipo2 && onWinner(match.equipo2)}
          >
            {match.equipo2?.nombre_equipo ?? "—"}
          </div>
        </div>

        {match.ganador && <div className="winner">✓ Ganador: {match.ganador.nombre_equipo}</div>}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container fadeIn">
        <h1 className="title">Brackets Automáticos</h1>

        <div className="buttons">
          <button onClick={() => { setRondas([]); setPlayInMatch(null); setTercerLugar(null); setPodio(null); }}>Reiniciar</button>
          <button onClick={() => router.push("/")}>Volver</button>
          <button onClick={generarBracket}>Generar Bracket</button>
          <button disabled={rondas.length === 0} onClick={avanzarRonda}>Avanzar Ronda</button>
        </div>

        {playInMatch && (
          <div className="section fadeIn">
            <h2>Match de Play-In</h2>
            <MatchBox match={playInMatch} onWinner={setGanadorPlayIn} />
          </div>
        )}

        <div className="grid">
          {rondas.map((round, rIndex) => (
            <div key={rIndex} className="col fadeIn">
              <h3>Ronda {rIndex + 1}</h3>
              {round.map(m => <MatchBox key={m.id} match={m} onWinner={e => setGanador(rIndex, m.id, e)} />)}
            </div>
          ))}
        </div>

        {tercerLugar && (
          <div className="section fadeIn">
            <h2>Match por el 3er lugar</h2>
            <MatchBox match={tercerLugar} onWinner={setGanadorTercerLugar} />
            <button className="podio-btn" onClick={generarPodio}>Generar Podio</button>
          </div>
        )}

        {podio && (
          <div className="podio fadeIn">
            <h2>🏆 Resultados Finales</h2>
            <p>🥇 {podio.primero}</p>
            <p>🥈 {podio.segundo}</p>
            <p>🥉 {podio.tercero}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          background-image: url("https://mir-s3-cdn-cf.behance.net/project_modules/1400/e04920100990617.5f15ce182ffd9.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .fadeIn {
          animation: fadeIn .4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .container {
          width: 100%;
          max-width: 1200px;
          background: rgba(20,20,20,0.7);
          backdrop-filter: blur(6px);
          padding: 30px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.08);
        }

        .title {
          text-align: center;
          font-size: 34px;
          color: #e53935;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 25px;
        }

        button {
          padding: 10px 18px;
          background: transparent;
          border: 1px solid #666;
          border-radius: 10px;
          color: #eee;
          cursor: pointer;
          transition: .3s;
        }

        button:hover {
          background: #e53935;
          border-color: #e53935;
        }

        button:disabled {
          opacity: .4;
          cursor: default;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .col h3 {
          text-align: center;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .match {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 12px;
          transition: .3s;
        }

        .match:hover {
          background: rgba(255,255,255,0.08);
        }

        .match-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .team {
          flex: 1;
          padding: 14px;
          text-align: center;
          background: rgba(255,255,255,0.12);
          border-radius: 12px;
          cursor: pointer;
          transition: .25s ease;
          border: 1px solid rgba(255,255,255,0.18);
          font-weight: 500;
          box-shadow: inset 0 0 6px rgba(255,255,255,0.05);
        }

        .team:hover {
          background: rgba(229,57,53,0.35);
          border-color: rgba(229,57,53,0.7);
          color: white;
          transform: translateY(-2px);
        }

        .team.win {
          background: #e53935;
          color: white;
          border-color: #e53935;
          box-shadow: 0 0 14px rgba(229, 57, 53, 0.9);
          transform: scale(1.05);
        }

        .vs {
          font-size: 14px;
          opacity: .7;
        }

        .winner {
          margin-top: 8px;
          font-size: 13px;
          color: #e53935;
          text-align: center;
        }

        .section {
          margin-top: 30px;
          text-align: center;
        }

        .podio-btn {
          margin-top: 10px;
          background: #ffeb3b;
          color: #000;
          border-color: #ffeb3b;
        }

        .podio {
          margin-top: 35px;
          background: rgba(0,0,0,0.4);
          padding: 25px;
          border-radius: 12px;
          text-align: center;
        }

        .podio h2 {
          color: #e53935;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}