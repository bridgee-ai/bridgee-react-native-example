import React, { useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from 'react-native';
import { BridgeeSDK, MatchBundle } from '@bridgee-ai/react-native-sdk';

import { initBridgee, setAttributionPolicy, canResolveAttribution } from './src/bridgee';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const [consent, setConsent] = useState(false);
  const [nativeGoogle, setNativeGoogle] = useState(false);
  const updatePolicy = (nextConsent: boolean, nextGoogle: boolean) => {
    setConsent(nextConsent); setNativeGoogle(nextGoogle); setAttributionPolicy(nextConsent, nextGoogle);
  };

  async function handleFirstOpen() {
    if (!canResolveAttribution()) return;
    setLoading(true);
    try {
      await initBridgee();
      const bundle = new MatchBundle()
        .withName(name)
        .withEmail(email)
        .withPhone(phone);

      const utm = await BridgeeSDK.firstOpen(bundle);

      Alert.alert(
        'Resultado de atribuição (dry run)',
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

      <Text>Permitir atribuição para este teste</Text>
      <Switch accessibilityLabel="Consentimento de atribuição" value={consent} onValueChange={value => updatePolicy(value, nativeGoogle)} />
      <Text>Preservar atribuição nativa Google (não consultar Bridgee)</Text>
      <Switch accessibilityLabel="Atribuição nativa Google" value={nativeGoogle} onValueChange={value => updatePolicy(consent, value)} />
      <Text>Firebase é responsável por first_open. Este botão não confirma uma instalação.</Text>
      <View style={styles.button}>
        <Button
          title={loading ? 'Enviando...' : 'Consultar atribuição'}
          onPress={handleFirstOpen}
          disabled={loading || !consent || nativeGoogle}
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
