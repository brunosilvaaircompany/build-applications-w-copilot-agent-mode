import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points?: number;
  occurredAt?: string;
};

const activityNames: Record<string, string> = {
  run: 'Corrida',
  walk: 'Caminhada',
  cycle: 'Ciclismo',
  strength: 'Força',
  mobility: 'Mobilidade',
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities: result }) => {
        if (active) setActivities(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro inesperado');
      });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="activities-heading">
      <h2 id="activities-heading">Atividades</h2>
      <p>Acompanhe os minutos de atividade e os pontos das pessoas participantes.</p>
      {activities === null && !error && <p role="status">Carregando atividades...</p>}
      {error && <p role="alert">Não foi possível carregar as atividades. {error}</p>}
      {activities?.length === 0 && <p>Sem atividades registradas.</p>}
      {activities && activities.length > 0 && (
        <ul className="list-group">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? index}>
              <strong>{activityNames[activity.type] ?? activity.type}</strong>
              <span> — {activity.minutes} minutos</span>
              {activity.points !== undefined && <span> · {activity.points} pontos</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
