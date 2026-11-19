import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'HttpError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw new HttpError('Informe os dados da atividade.', 400);
  const { userId, teamId, type, minutes } = input;
  const activityTypes = ['run', 'walk', 'cycle', 'strength', 'mobility'];
  if (
    typeof userId !== 'string' ||
    !Types.ObjectId.isValid(userId) ||
    typeof teamId !== 'string' ||
    !Types.ObjectId.isValid(teamId) ||
    typeof type !== 'string' ||
    !activityTypes.includes(type) ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    !Number.isInteger(minutes) ||
    minutes < 1
  ) {
    throw new HttpError('Informe uma pessoa, uma equipe e dados válidos para a atividade.', 400);
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw new HttpError('A pessoa ou a equipe informada não foi encontrada.', 404);

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw new HttpError('Informe os dados da equipe.', 400);
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw new HttpError('Informe o nome da equipe.', 400);
  if (typeof mascot !== 'string' || !mascot.trim()) throw new HttpError('Informe o mascote da equipe.', 400);
  if (!Array.isArray(members)) {
    throw new HttpError('A lista de integrantes da equipe é inválida.', 400);
  }

  const memberIds = members.filter((member): member is string => typeof member === 'string');
  if (
    memberIds.length !== members.length ||
    memberIds.some((member) => !Types.ObjectId.isValid(member))
  ) {
    throw new HttpError('A lista de integrantes da equipe é inválida.', 400);
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  if (uniqueMemberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (memberCount !== uniqueMemberIds.length) throw new HttpError('Um ou mais integrantes não foram encontrados.', 404);
  }
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([Team.find().lean(), Activity.find().lean()]);
  const pointsByTeam = new Map<string, number>();
  for (const activity of activities) {
    const key = String(activity.team);
    pointsByTeam.set(key, (pointsByTeam.get(key) ?? 0) + (activity.points ?? 0));
  }

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(String(team._id)) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw new HttpError('Pessoa não encontrada para gerar sugestões de treino.', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focusByActivity: Record<string, string> = {
    run: 'endurance',
    walk: 'endurance',
    cycle: 'endurance',
    strength: 'strength',
    mobility: 'mobility',
  };
  const activityFocus = recentActivity ? focusByActivity[recentActivity.type] : undefined;
  const preferredFocus = activityFocus ?? user.fitnessGoal;
  let workouts = await Workout.find({ focus: preferredFocus }).sort({ title: 1 }).lean();
  if (workouts.length === 0 && user.fitnessGoal !== preferredFocus) {
    workouts = await Workout.find({ focus: user.fitnessGoal }).sort({ title: 1 }).lean();
  }

  const activityNames: Record<string, string> = {
    run: 'corrida',
    walk: 'caminhada',
    cycle: 'ciclismo',
    strength: 'treino de força',
    mobility: 'mobilidade',
  };
  return workouts.map((workout) => ({
    ...workout,
    reason: recentActivity && workout.focus === activityFocus
      ? `Recomendado com base na sua atividade recente de ${activityNames[recentActivity.type] ?? recentActivity.type}.`
      : `Recomendado com base na sua meta de ${user.fitnessGoal}.`,
  }));
}

export { User };
