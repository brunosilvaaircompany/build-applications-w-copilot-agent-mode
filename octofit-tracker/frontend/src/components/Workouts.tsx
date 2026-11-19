import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason?: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>(
      `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
    )
      .then(({ suggestions: result }) => {
        if (active) setSuggestions(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro inesperado');
      });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="workouts-heading">
      <h2 id="workouts-heading">Sugestões de treino</h2>
      <p>Treinos recomendados para Mona com base no histórico de atividades.</p>
      {suggestions === null && !error && <p role="status">Carregando sugestões de treino...</p>}
      {error && <p role="alert">Não foi possível carregar as sugestões de treino. {error}</p>}
      {suggestions?.length === 0 && <p>Sem sugestões de treino no momento.</p>}
      {suggestions && suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((suggestion, index) => (
            <li className="list-group-item" key={`${suggestion.title}-${index}`}>
              <h3 className="h5">{suggestion.title}</h3>
              <p>Foco: {suggestion.focus} · {suggestion.minutes} minutos · Dificuldade: {suggestion.difficulty}</p>
              {suggestion.reason && <p className="mb-0">{suggestion.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
