import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members?: string[];
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams: result }) => {
        if (active) setTeams(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro inesperado');
      });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="teams-heading">
      <h2 id="teams-heading">Equipes</h2>
      <p>Conheça as equipes e seus integrantes.</p>
      {teams === null && !error && <p role="status">Carregando equipes...</p>}
      {error && <p role="alert">Não foi possível carregar as equipes. {error}</p>}
      {teams?.length === 0 && <p>Sem equipes cadastradas.</p>}
      {teams && teams.length > 0 && (
        <ul className="list-group">
          {teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? index}>
              <strong>{team.name}</strong>
              <span> — Mascote: {team.mascot}</span>
              <span> · {team.members?.length ?? 0} integrantes</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
