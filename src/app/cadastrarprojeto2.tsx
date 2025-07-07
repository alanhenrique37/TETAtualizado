import React, { useEffect, useState } from 'react';
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

export default function CadastrarProjeto2() {
  const router = useRouter();
  const navigation = useNavigation();

  const [valor, setValor] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [telefone, setTelefone] = useState('');

  const [erroValor, setErroValor] = useState(false);
  const [erroNumeroPessoas, setErroNumeroPessoas] = useState(false);
  const [erroTelefone, setErroTelefone] = useState(false);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  async function cadastrarProjeto() {
    let temErro = false;

    const valorNum = parseFloat(valor.replace(',', '.'));
    if (!valor.trim() || isNaN(valorNum) || valorNum <= 0) {
      setErroValor(true);
      temErro = true;
    } else {
      setErroValor(false);
    }

    const numPessoasNum = parseInt(numeroPessoas);
    if (!numeroPessoas.trim() || isNaN(numPessoasNum) || numPessoasNum <= 0 || !/^\d+$/.test(numeroPessoas.trim())) {
      setErroNumeroPessoas(true);
      temErro = true;
    } else {
      setErroNumeroPessoas(false);
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (!telefone.trim() || telefoneLimpo.length < 10) {
      setErroTelefone(true);
      temErro = true;
    } else {
      setErroTelefone(false);
    }

    if (temErro) {
      Alert.alert('Atenção', 'Preencha corretamente todos os campos destacados.');
      return;
    }

    try {
      const projetoBase = await AsyncStorage.getItem('novoProjeto');
      const userEmail = await AsyncStorage.getItem('userEmail');

      if (!projetoBase || !userEmail) {
        Alert.alert('Erro', 'Informações do projeto ou usuário não encontradas.');
        return;
      }

      const { nome, descricao } = JSON.parse(projetoBase);

      const response = await fetch('http://10.0.2.2:3000/cadastrar-projeto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          descricao,
          valor,
          telefone,
          numeroPessoas,
          email_autor: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.removeItem('novoProjeto');
        Alert.alert('Sucesso', 'Projeto cadastrado com sucesso!');
        router.push('/home');
      } else {
        console.error('Erro backend:', data);
        Alert.alert('Erro', data.message || 'Erro ao cadastrar projeto.');
      }
    } catch (error) {
      console.error('Erro geral:', error);
      Alert.alert('Erro', 'Erro ao conectar com o servidor.');
    }
  }

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
        Agora adicione os detalhes finais para tornar seu projeto ainda mais completo.
      </Text>

      <TextInput
        placeholder="Valor estimado (ex: 1500)"
        placeholderTextColor="#999"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        style={[styles.input, erroValor && styles.inputErro]}
      />

      <TextInput
        placeholder="Quantidade de pessoas"
        placeholderTextColor="#999"
        value={numeroPessoas}
        onChangeText={setNumeroPessoas}
        keyboardType="numeric"
        style={[styles.input, erroNumeroPessoas && styles.inputErro]}
      />

      <TextInput
        placeholder="Telefone para contato"
        placeholderTextColor="#999"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        style={[styles.input, erroTelefone && styles.inputErro]}
      />

      <TouchableOpacity style={styles.botao} onPress={cadastrarProjeto}>
        <Text style={styles.botaoTexto}>Postar</Text>
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
  inputErro: {
    borderWidth: 2,
    borderColor: 'red',
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
