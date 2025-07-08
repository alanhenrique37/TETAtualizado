// EditarPost2.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

export default function EditarPost2() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const telefoneRef = useRef<any>(null);

  const [valor, setValor] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [telefone, setTelefone] = useState('');

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    async function carregar() {
      const projetos = await AsyncStorage.getItem('projetos');
      if (projetos) {
        const lista = JSON.parse(projetos);
        const projeto = lista.find((p: any) => String(p.id) === String(id));
        if (projeto) {
          setValor(projeto.valor?.toString() || '');
          setNumeroPessoas(projeto.numeroPessoas?.toString() || '');
          setTelefone(projeto.telefone || '');
        } else {
          Alert.alert('Erro', 'Projeto não encontrado.');
          router.back();
        }
      }
    }

    carregar();
  }, []);

  async function salvar() {
  if (!valor || !telefone) {
    Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
    return;
  }

  if (telefoneRef.current && !telefoneRef.current.isValid()) {
    Alert.alert('Erro', 'Telefone inválido.');
    return;
  }

  try {
    const response = await fetch(`http://10.0.2.2:3000/editar-projeto/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor,
        numeroPessoas,
        telefone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar projeto.');
    }

    // Atualizar AsyncStorage local
    const projetosStr = await AsyncStorage.getItem('projetos');
    if (projetosStr) {
      const projetos = JSON.parse(projetosStr);
      const index = projetos.findIndex((p: any) => String(p.id) === String(id));
      if (index !== -1) {
        projetos[index].valor = valor;
        projetos[index].numeroPessoas = numeroPessoas;
        projetos[index].telefone = telefone;
        await AsyncStorage.setItem('projetos', JSON.stringify(projetos));
      }
    }

    Alert.alert('Sucesso', 'Projeto atualizado com sucesso!');
    router.push('/meusProjetos');
  } catch (error: any) {
    console.error(error);
    Alert.alert('Erro', error.message || 'Erro ao atualizar projeto.');
  }
}


  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Editar Post</Text>
      </TouchableOpacity>

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Editar Post</Text>
      <Text style={styles.sub}>Ajuste os detalhes da sua ideia e deixe seu projeto ainda melhor.</Text>

      <TextInput
        placeholder="Valor (R$)"
        placeholderTextColor="#999"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Número de pessoas (opcional)"
        placeholderTextColor="#999"
        value={numeroPessoas}
        onChangeText={setNumeroPessoas}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInputMask
        type={'cel-phone'}
        options={{
          maskType: 'BRL',
          withDDD: true,
          dddMask: '(99) ',
        }}
        value={telefone}
        onChangeText={setTelefone}
        ref={telefoneRef}
        keyboardType="phone-pad"
        placeholder="(00)00000-0000"
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar Alterações</Text>
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
