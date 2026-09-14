import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AppState, FocusSession, Group, Member, SessionKind } from '../types';
import { loadState, saveState } from '../utils/storage';
import { generateId, generateInviteCode, todayKey } from '../utils/id';
import { pontosDaSessao } from '../utils/ranking';

interface AppContextValue {
  state: AppState;
  loading: boolean;
  addSession: (kind: SessionKind, durationSeconds: number) => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  joinGroupByCode: (code: string) => Promise<boolean>;
  setUserName: (name: string) => Promise<void>;
}

const defaultState = (): AppState => {
  const userId = generateId('user');
  return {
    userId,
    userName: 'Você',
    sessions: [],
    groups: [],
    members: {
      [userId]: { id: userId, name: 'Você', campeonatoPontos: 0 },
    },
    currentStreak: 0,
    lastFocusDay: null,
  };
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) setState(saved);
      setLoading(false);
    })();
  }, []);

  // Persiste a cada mudança (depois do carregamento inicial)
  useEffect(() => {
    if (!loading) {
      saveState(state);
    }
  }, [state, loading]);

  const addSession = useCallback(async (kind: SessionKind, durationSeconds: number) => {
    setState((prev) => {
      const now = new Date();
      const session: FocusSession = {
        id: generateId('session'),
        userId: prev.userId,
        kind,
        startedAt: new Date(now.getTime() - durationSeconds * 1000).toISOString(),
        endedAt: now.toISOString(),
        durationSeconds,
      };

      let newStreak = prev.currentStreak;
      let newLastFocusDay = prev.lastFocusDay;
      if (kind === 'foco') {
        const today = todayKey(now);
        if (prev.lastFocusDay !== today) {
          // primeira sessão de foco de hoje: verifica se ontem também teve foco
          const yesterday = todayKey(new Date(now.getTime() - 86400000));
          newStreak = prev.lastFocusDay === yesterday ? prev.currentStreak + 1 : 1;
          newLastFocusDay = today;
        }
      }

      const pontos = pontosDaSessao(session, newStreak);
      const member = prev.members[prev.userId];
      const updatedMember: Member = {
        ...member,
        campeonatoPontos: member.campeonatoPontos + pontos,
      };

      return {
        ...prev,
        sessions: [...prev.sessions, session],
        currentStreak: newStreak,
        lastFocusDay: newLastFocusDay,
        members: { ...prev.members, [prev.userId]: updatedMember },
      };
    });
  }, []);

  const createGroup = useCallback(
    async (name: string): Promise<Group> => {
      const group: Group = {
        id: generateId('group'),
        name,
        createdAt: new Date().toISOString(),
        memberIds: [state.userId],
        inviteCode: generateInviteCode(),
      };
      setState((prev) => ({ ...prev, groups: [...prev.groups, group] }));
      return group;
    },
    [state.userId]
  );

  const joinGroupByCode = useCallback(async (code: string): Promise<boolean> => {
    let joined = false;
    setState((prev) => {
      const group = prev.groups.find((g) => g.inviteCode.toUpperCase() === code.toUpperCase());
      if (!group) return prev;
      if (group.memberIds.includes(prev.userId)) {
        joined = true;
        return prev;
      }
      joined = true;
      const updatedGroup: Group = { ...group, memberIds: [...group.memberIds, prev.userId] };
      return {
        ...prev,
        groups: prev.groups.map((g) => (g.id === group.id ? updatedGroup : g)),
      };
    });
    return joined;
  }, []);

  const setUserName = useCallback(async (name: string) => {
    setState((prev) => ({
      ...prev,
      userName: name,
      members: {
        ...prev.members,
        [prev.userId]: { ...prev.members[prev.userId], name },
      },
    }));
  }, []);

  const value = useMemo(
    () => ({ state, loading, addSession, createGroup, joinGroupByCode, setUserName }),
    [state, loading, addSession, createGroup, joinGroupByCode, setUserName]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
