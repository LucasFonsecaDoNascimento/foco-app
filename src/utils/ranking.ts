import { FocusSession, Member, RankingEntry, WeeklyRankings } from '../types';

// Pesos do Campeonato Geral — a penalidade por procrastinação pesa mais
// forte do que o ganho por estudo, então uma semana ruim pode custar caro
// no acumulado (decisão registrada por Lucas).
export const PONTOS_POR_HORA_FOCO = 10;
export const PONTOS_BONUS_POR_DIA_DE_SEQUENCIA = 2;
export const PENALIDADE_POR_HORA_PROCRASTINACAO = 15;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function sessionsThisWeek(sessions: FocusSession[], now = new Date()): FocusSession[] {
  const weekStart = startOfWeek(now);
  return sessions.filter((s) => new Date(s.startedAt) >= weekStart);
}

export function totalHoursByKind(
  sessions: FocusSession[],
  kind: FocusSession['kind']
): number {
  const totalSeconds = sessions
    .filter((s) => s.kind === kind)
    .reduce((acc, s) => acc + s.durationSeconds, 0);
  return totalSeconds / 3600;
}

// Calcula o incremento de pontos do Campeonato Geral a partir de uma sessão
// recém-concluída e da sequência atual de dias em foco.
export function pontosDaSessao(session: FocusSession, streakAtual: number): number {
  const horas = session.durationSeconds / 3600;
  if (session.kind === 'foco') {
    const bonusSequencia = streakAtual * PONTOS_BONUS_POR_DIA_DE_SEQUENCIA;
    return horas * PONTOS_POR_HORA_FOCO + bonusSequencia;
  }
  return -(horas * PENALIDADE_POR_HORA_PROCRASTINACAO);
}

export function buildWeeklyRankings(
  members: Record<string, Member>,
  sessionsByMember: Record<string, FocusSession[]>
): WeeklyRankings {
  const bem: RankingEntry[] = [];
  const vergonha: RankingEntry[] = [];

  for (const memberId of Object.keys(members)) {
    const member = members[memberId];
    const sessions = sessionsThisWeek(sessionsByMember[memberId] || []);
    const horasFoco = totalHoursByKind(sessions, 'foco');
    const horasProcrastinacao = totalHoursByKind(sessions, 'procrastinacao');

    bem.push({ memberId, name: member.name, value: horasFoco });
    vergonha.push({ memberId, name: member.name, value: horasProcrastinacao });
  }

  bem.sort((a, b) => b.value - a.value);
  vergonha.sort((a, b) => b.value - a.value);

  return { rankingDoBem: bem, rankingDaVergonha: vergonha };
}

export function campeonatoGeral(members: Record<string, Member>): RankingEntry[] {
  return Object.values(members)
    .map((m) => ({ memberId: m.id, name: m.name, value: m.campeonatoPontos }))
    .sort((a, b) => b.value - a.value);
}
