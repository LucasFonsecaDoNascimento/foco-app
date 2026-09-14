import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, Share } from 'react-native';
import { useApp } from '../context/AppContext';

export default function GroupsScreen() {
  const { state, createGroup, joinGroupByCode } = useApp();
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    const group = await createGroup(newGroupName.trim());
    setNewGroupName('');
    Alert.alert('Grupo criado', `Código de convite: ${group.inviteCode}`);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const ok = await joinGroupByCode(joinCode.trim());
    setJoinCode('');
    if (!ok) Alert.alert('Código inválido', 'Não encontramos um grupo com esse código.');
  };

  const shareCode = async (code: string, name: string) => {
    try {
      await Share.share({
        message: `Entra no meu grupo "${name}" no FocoApp! Código: ${code}`,
      });
    } catch {
      // usuário cancelou o compartilhamento, sem problema
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.label}>Criar novo grupo</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Nome do grupo"
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
          <Pressable style={styles.smallButton} onPress={handleCreate}>
            <Text style={styles.smallButtonText}>Criar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Entrar com código</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Código de convite"
            autoCapitalize="characters"
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <Pressable style={styles.smallButton} onPress={handleJoin}>
            <Text style={styles.smallButtonText}>Entrar</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.label}>Meus grupos</Text>
      <FlatList
        data={state.groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Você ainda não faz parte de nenhum grupo.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupInfo}>
              {item.memberIds.length} membro(s) · código {item.inviteCode}
            </Text>
            <Pressable onPress={() => shareCode(item.inviteCode, item.name)}>
              <Text style={styles.shareLink}>Compartilhar convite</Text>
            </Pressable>
          </View>
        )}
      />

      <Text style={styles.hint}>
        Nesta primeira versão os grupos e o ranking funcionam localmente no aparelho. Para grupos
        com dados sincronizados entre participantes reais, é preciso um backend — ver README.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  formBox: { gap: 8 },
  label: { fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButton: {
    backgroundColor: '#2f6f4f',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  groupCard: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 12, gap: 4 },
  groupName: { fontSize: 16, fontWeight: '600' },
  groupInfo: { color: '#666', fontSize: 13 },
  shareLink: { color: '#2f6f4f', fontWeight: '600', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 8 },
  hint: { textAlign: 'center', color: '#888', fontSize: 12 },
});
