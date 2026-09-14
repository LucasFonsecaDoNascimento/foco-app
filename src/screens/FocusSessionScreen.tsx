import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, AppState as RNAppState } from 'react-native';
import { useApp } from '../context/AppContext';
import { SessionKind } from '../types';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function FocusSessionScreen() {
  const { addSession, state } = useApp();
  const [kind, setKind] = useState<SessionKind>('foco');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Aviso: bloqueio real de outros apps no Android exige permissões nativas
  // (Serviço de Acessibilidade / Uso) que não existem no Expo Go. Por enquanto,
  // o "Modo Foco" é um lembrete visual + esta tela travada, não um bloqueio de SO.
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (nextState) => {
      if (running && kind === 'foco' && nextState === 'background') {
        // No futuro: registrar aqui uma "quebra de foco" se o usuário sair do app.
      }
    });
    return () => sub.remove();
  }, [running, kind]);

  const start = (selectedKind: SessionKind) => {
    setKind(selectedKind);
    setRunning(true);
    setElapsed(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current as number)) / 1000));
    }, 1000);
  };

  const stop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const duration = elapsed;
    if (duration < 10) {
      Alert.alert('Sessão muito curta', 'Sessões com menos de 10 segundos não são salvas.');
      setElapsed(0);
      return;
    }
    await addSession(kind, duration);
    Alert.alert(
      kind === 'foco' ? 'Sessão de foco registrada!' : 'Procrastinação registrada',
      `Duração: ${formatDuration(duration)}`
    );
    setElapsed(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.streak}>🔥 Sequência de foco: {state.currentStreak} dia(s)</Text>

      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatDuration(elapsed)}</Text>
        <Text style={styles.kindLabel}>
          {running ? (kind === 'foco' ? 'Em foco' : 'Procrastinando') : 'Parado'}
        </Text>
      </View>

      {!running ? (
        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.focusButton]} onPress={() => start('foco')}>
            <Text style={styles.buttonText}>Iniciar foco</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.procrastButton]}
            onPress={() => start('procrastinacao')}
          >
            <Text style={styles.buttonText}>Registrar procrastinação</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[styles.button, styles.stopButton]} onPress={stop}>
          <Text style={styles.buttonText}>Encerrar sessão</Text>
        </Pressable>
      )}

      <Text style={styles.hint}>
        Bloqueio automático de outros apps ainda não está disponível nesta versão — veja o README
        para os próximos passos técnicos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  streak: { fontSize: 16, fontWeight: '600' },
  timerBox: { alignItems: 'center', gap: 8 },
  timerText: { fontSize: 56, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kindLabel: { fontSize: 16, color: '#666' },
  buttonRow: { gap: 12, width: '100%' },
  button: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  focusButton: { backgroundColor: '#2f6f4f' },
  procrastButton: { backgroundColor: '#b23b3b' },
  stopButton: { backgroundColor: '#333', width: '100%' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { textAlign: 'center', color: '#888', fontSize: 12, marginTop: 12 },
});
