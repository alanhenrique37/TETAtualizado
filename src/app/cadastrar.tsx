import { View, Alert, StyleSheet, TouchableOpacity, Text, Image, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  const [nomeErro, setNomeErro] = useState("");
  const [emailErro, setEmailErro] = useState("");
  const [senhaErro, setSenhaErro] = useState("");
  const [confirmarSenhaErro, setConfirmarSenhaErro] = useState("");
  const [telefoneErro, setTelefoneErro] = useState("");

  const navigation = useNavigation();
  const rota = useRouter();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,}$/;
    setNomeErro(nome && !nomeRegex.test(nome) ? "Nome inválido. Use apenas letras." : "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailErro(email && !emailRegex.test(email) ? "Email inválido." : "");

    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    setSenhaErro(senha && !senhaRegex.test(senha) ? "A senha deve conter ao menos 6 caracteres, letras e números." : "");

    setConfirmarSenhaErro(confirmarSenha && senha !== confirmarSenha ? "As senhas não coincidem." : "");

    const telefoneRegex = /^\(\d{2}\)\d{5}-\d{4}$/;
    setTelefoneErro(telefone && !telefoneRegex.test(telefone) ? "Telefone inválido. Use o formato (00)00000-0000." : "");
  }, [nome, email, senha, confirmarSenha, telefone]);

  async function create() {
    if (nomeErro || emailErro || senhaErro || confirmarSenhaErro || telefoneErro) {
      Alert.alert("Erro", "Corrija os campos antes de continuar.");
      return;
    }

    if (!nome || !email || !senha || !confirmarSenha || !telefone) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/logins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          telefone,
          tipo: 'usuario',
          foto_perfil: null,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        await AsyncStorage.setItem('userNome', nome);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userSenha', senha);
        await AsyncStorage.setItem('userTelefone', telefone);

        Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");

        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setTelefone("");

        rota.push('/login');
      } else {
        Alert.alert("Erro", data.message || "Erro ao cadastrar cliente.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => rota.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.titulo}>Seja bem vindo!</Text>
      <Text style={styles.subtitulo}>Crie sua conta</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-circle" size={20} color="#aaa" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Nome Completo" placeholderTextColor="#ccc" value={nome} onChangeText={setNome} />
      </View>
      {nomeErro ? <Text style={styles.erro}>{nomeErro}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#aaa" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#ccc" keyboardType="email-address" value={email} onChangeText={setEmail} />
      </View>
      {emailErro ? <Text style={styles.erro}>{emailErro}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="key" size={20} color="#aaa" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#ccc" secureTextEntry value={senha} onChangeText={setSenha} />
      </View>
      {senhaErro ? <Text style={styles.erro}>{senhaErro}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="key" size={20} color="#aaa" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Confirme sua senha" placeholderTextColor="#ccc" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />
      </View>
      {confirmarSenhaErro ? <Text style={styles.erro}>{confirmarSenhaErro}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#aaa" style={styles.icon} />
        <TextInputMask
          type={'custom'}
          options={{ mask: '(99)99999-9999' }}
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />
      </View>
      {telefoneErro ? <Text style={styles.erro}>{telefoneErro}</Text> : null}

      <TouchableOpacity style={styles.botao} onPress={create}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>Já tem uma conta?</Text>
      <TouchableOpacity onPress={() => rota.push('/login')}>
        <Text style={styles.loginLink}>Fazer Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203562',
    alignItems: 'center',
    justifyContent: 'center',
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
    resizeMode: 'contain',
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    textAlign: "center",
  },
  subtitulo: {
    color: '#fff',
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
    textAlign: "center",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 8,
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
  botao: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 12,
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
    marginTop: 15,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  loginLink: {
    fontFamily: "Poppins-Bold",
    textDecorationLine: 'underline',
    color: '#000',
  },
  erro: {
    width: '100%',
    color: '#ff5555',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
    paddingLeft: 12,
  },
});
