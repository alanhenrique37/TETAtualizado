import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const rota = useRouter();
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailErro(email && !emailRegex.test(email) ? 'Email inválido.' : '');
    setSenhaErro(senha && senha.length < 6 ? 'A senha deve ter pelo menos 6 caracteres.' : '');
  }, [email, senha]);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert('Preencha todos os campos.');
      return;
    }

    if (emailErro || senhaErro) {
      alert('Corrija os erros antes de continuar.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        await AsyncStorage.setItem('userNome', user.nome);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userSenha', senha);
        await AsyncStorage.setItem('userTelefone', user.telefone); // <-- Esta linha agora funciona!

        alert('Login realizado!');
        rota.push('/home');
      } else {
        alert(data.message || 'Email ou senha inválidos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao conectar ao servidor.');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => rota.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.titulo}>Bem vindo de volta!</Text>
      <Text style={styles.subtitulo}>Faça login na sua conta</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {emailErro ? <Text style={styles.erro}>{emailErro}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {senhaErro ? <Text style={styles.erro}>{senhaErro}</Text> : null}

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'column', marginTop: 15 }}>
        <Text style={styles.loginText}>Ainda não tem uma conta? </Text>
        <TouchableOpacity onPress={() => rota.push('/cadastrar')}>
          <Text style={styles.loginLink}>Criar Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203562',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  voltar: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    marginTop: 80,
    resizeMode: 'contain',
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  subtitulo: {
    color: '#fff',
    marginBottom: 28,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  erro: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  botao: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '70%',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#203562',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  loginText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    fontFamily: 'Poppins-Bold',
    textDecorationLine: 'underline',
    color: '#000',
    textAlign: 'center',
  },
});
