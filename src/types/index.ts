// Tipos centrais do FocoApp

export type SessionKind = 'foco' | 'procrastinacao';

export interface FocusSession {
  id: string;
  userId: string;
  kind: SessionKind;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationSeconds: number;
  note?: string;
}

export interface Member {
  id: string;
  name: string;
  // Pontuação acumulada do Campeonato Geral (nunca reinicia)
  campeonatoPontos: number;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string; // ISO
  memberIds: string[];
  // convite simples por código, sem chat
  inviteCode: string;
}

export interface AppState {
  userId: string;
  userName: string;
  sessions: FocusSession[];
  groups: Group[];
  members: Record<string, Member>;
  // sequência atual de dias com foco (para bônus do Campeonato Geral)
  currentStreak: number;
  lastFocusDay: string | null; // YYYY-MM-DD
}

export interface RankingEntry {
  memberId: string;
  name: string;
  value: number; // horas de estudo, horas de procrastinação, ou pontos
}

export interface WeeklyRankings {
  rankingDoBem: RankingEntry[]; // mais estudou na semana
  rankingDaVergonha: RankingEntry[]; // mais procrastinou na semana
}
