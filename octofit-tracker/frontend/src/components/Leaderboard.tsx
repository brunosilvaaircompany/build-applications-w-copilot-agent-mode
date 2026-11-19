import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then(({ leaderboard: result }) => {
        if (active) setLeaderboard(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro inesperado');
      });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading">Placar</h2>
      <p>Confira a classificação das equipes por pontos.</p>
      {leaderboard === null && !error && <p role="status">Carregando placar...</p>}
      {error && <p role="alert">Não foi possível carregar o placar. {error}</p>}
      {leaderboard?.length === 0 && <p>Sem classificação disponível.</p>}
      {leaderboard && leaderboard.length > 0 && (
        <ol className="list-group list-group-numbered">
          {leaderboard.map((entry) => (
            <li className="list-group-item" key={entry.rank}>
              <strong>{entry.teamName}</strong>
              <span> — {entry.totalPoints} pontos</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
