import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

export default function CadastrarProjeto1() {
  const router = useRouter();
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const avancar = async () => {
    if (!nomeProjeto.trim() || !descricao.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de continuar.');
      return;
    }

    const dadosProjeto = {
      nome: nomeProjeto,
      descricao: descricao,
    };

    await AsyncStorage.setItem('novoProjeto', JSON.stringify(dadosProjeto));
    router.push('/cadastrarprojeto2'); // Etapa 2
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Novo Projeto</Text>
      </TouchableOpacity>

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Novo Projeto</Text>
      <Text style={styles.sub}>
        Dê um nome e uma descrição para sua ideia. Isso ajuda outros a entenderem seu projeto.
      </Text>

      <TextInput
        placeholder="Nome do projeto"
        placeholderTextColor="#999"
        value={nomeProjeto}
        onChangeText={setNomeProjeto}
        style={styles.input}
      />

      <TextInput
        placeholder="Descrição do projeto\nDica: Seja claro e inspirador!"
        placeholderTextColor="#999"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        style={[styles.input, { height: 160, textAlignVertical: 'top' }]}
      />

      <TouchableOpacity style={styles.botao} onPress={avancar}>
        <Text style={styles.botaoTexto}>Avançar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203562',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  sub: {
    color: '#fff',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    fontSize: 15,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  botao: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginTop: 20,
  },
  botaoTexto: {
    color: '#203562',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});
