import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { buildWeeklyRankings, campeonatoGeral } from '../utils/ranking';
import { RankingEntry } from '../types';

type Tab = 'bem' | 'vergonha' | 'geral';

export default function RankingScreen() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('bem');

  // Nesta primeira versão (offline), o único participante com sessões reais
  // é o próprio usuário — os demais membros do grupo aparecerão quando houver
  // sincronização com um backend (ver README).
  const sessionsByMember = useMemo(() => ({ [state.userId]: state.sessions }), [
    state.sessions,
    state.userId,
  ]);

  const weekly = useMemo(
    () => buildWeeklyRankings(state.members, sessionsByMember),
    [state.members, sessionsByMember]
  );
  const geral = useMemo(() => campeonatoGeral(state.members), [state.members]);

  const data: RankingEntry[] =
    tab === 'bem' ? weekly.rankingDoBem : tab === 'vergonha' ? weekly.rankingDaVergonha : geral;

  const unit = tab === 'geral' ? 'pts' : 'h';

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TabButton label="Ranking do Bem" active={tab === 'bem'} onPress={() => setTab('bem')} />
        <TabButton
          label="Ranking da Vergonha"
          active={tab === 'vergonha'}
          onPress={() => setTab('vergonha')}
        />
        <TabButton
          label="Campeonato Geral"
          active={tab === 'geral'}
          onPress={() => setTab('geral')}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.memberId}
        contentContainerStyle={{ gap: 8, paddingTop: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Sem dados ainda esta semana.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.position}>{index + 1}º</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.value}>
              {item.value.toFixed(1)} {unit}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  tabButtonActive: { backgroundColor: '#2f6f4f' },
  tabButtonText: { color: '#333', fontSize: 13, fontWeight: '600' },
  tabButtonTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    gap: 12,
  },
  position: { fontWeight: '700', width: 32 },
  name: { flex: 1, fontSize: 15 },
  value: { fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
