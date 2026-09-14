import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { sessionsThisWeek, totalHoursByKind } from '../utils/ranking';

export default function HomeScreen() {
  const { state } = useApp();

  const week = useMemo(() => sessionsThisWeek(state.sessions), [state.sessions]);
  const horasFoco = totalHoursByKind(week, 'foco');
  const horasProcrastinacao = totalHoursByKind(week, 'procrastinacao');
  const pontosGerais = state.members[state.userId]?.campeonatoPontos ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Olá, {state.userName} 👋</Text>
      <Text style={styles.subtitle}>Seu resumo desta semana</Text>

      <View style={styles.cardsRow}>
        <StatCard label="Foco" value={`${horasFoco.toFixed(1)}h`} color="#2f6f4f" />
        <StatCard label="Procrastinação" value={`${horasProcrastinacao.toFixed(1)}h`} color="#b23b3b" />
      </View>

      <View style={styles.cardsRow}>
        <StatCard label="Sequência" value={`${state.currentStreak} dia(s)`} color="#3b5bb2" />
        <StatCard label="Pontos (Geral)" value={pontosGerais.toFixed(0)} color="#8a5cb2" />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Como funciona o FocoRank</Text>
        <Text style={styles.infoText}>
          • Ranking do Bem: quem mais estudou na semana{'\n'}
          • Ranking da Vergonha: quem mais procrastinou na semana{'\n'}
          • Campeonato Geral: pontos acumulados desde a criação do grupo, com bônus por
          sequência e penalidade alta por procrastinação
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  greeting: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardsRow: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  cardValue: { fontSize: 22, fontWeight: '700' },
  cardLabel: { fontSize: 12, color: '#666' },
  infoBox: { backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16, marginTop: 8 },
  infoTitle: { fontWeight: '700', marginBottom: 8 },
  infoText: { color: '#555', lineHeight: 20 },
});
