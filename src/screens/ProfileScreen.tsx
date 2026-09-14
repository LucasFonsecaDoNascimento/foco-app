import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { state, setUserName } = useApp();
  const [name, setName] = useState(state.userName);

  const save = async () => {
    if (!name.trim()) return;
    await setUserName(name.trim());
    Alert.alert('Salvo', 'Seu nome foi atualizado.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Seu nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Salvar</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.label}>Sessões registradas</Text>
      <Text style={styles.info}>{state.sessions.length} sessão(ões) no total</Text>

      <Text style={styles.footnote}>
        FocoApp v0.1 — primeira versão (offline, sem sincronização entre dispositivos).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  label: { fontWeight: '700', fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#2f6f4f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  info: { color: '#555' },
  footnote: { color: '#999', fontSize: 12, marginTop: 'auto', textAlign: 'center' },
});
