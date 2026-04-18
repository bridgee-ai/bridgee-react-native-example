import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BridgeeSDK, MatchBundle } from '@bridgee-ai/react-native-sdk';

import { initBridgee } from './src/bridgee';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initBridgee().catch((e) =>
      Alert.alert('Erro ao inicializar Bridgee', String(e)),
    );
  }, []);

  async function handleFirstOpen() {
    setLoading(true);
    try {
      const bundle = new MatchBundle()
        .withName(name)
        .withEmail(email)
        .withPhone(phone);

      const utm = await BridgeeSDK.firstOpen(bundle);

      Alert.alert(
        'Atribuição recebida',
        `source: ${utm.utm_source}\nmedium: ${utm.utm_medium}\ncampaign: ${utm.utm_campaign}`,
      );
    } catch (e) {
      Alert.alert('Erro', String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bridgee-AI — Exemplo RN</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.button}>
        <Button
          title={loading ? 'Enviando...' : 'Bridgee First Open'}
          onPress={handleFirstOpen}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { marginTop: 12 },
});
