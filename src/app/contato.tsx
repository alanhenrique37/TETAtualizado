import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Contato() {
  const router = useRouter();
  const { nome, email, telefone } = useLocalSearchParams();
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    const carregarFoto = async () => {
      if (email) {
        const fotoSalva = await AsyncStorage.getItem(`userFoto_${email}`);
        if (fotoSalva) setFoto(fotoSalva);
      }
    };

    carregarFoto();
  }, [email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contato do Cadastrante</Text>

      {foto ? (
        <Image source={{ uri: foto }} style={styles.profileImage} />
      ) : (
        <Text style={styles.noImageText}>Foto não disponível</Text>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>{nome || 'Não informado'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'Não informado'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.value}>{telefone || 'Não informado'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 30,
  },
  noImageText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginBottom: 30,
  },
  infoContainer: { marginBottom: 20 },
  label: { fontWeight: 'bold', fontSize: 16, color: '#555' },
  value: { fontSize: 18, color: '#000', marginTop: 4 },
  button: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
