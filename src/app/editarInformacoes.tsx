import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';

export default function EditarInformacoes() {
  const rota = useRouter();
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [emailOriginal, setEmailOriginal] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('userNome');
      const emailSalvo = await AsyncStorage.getItem('userEmail');
      const senhaSalva = await AsyncStorage.getItem('userSenha');
      const telefoneSalvo = await AsyncStorage.getItem('userTelefone');

      if (nomeSalvo) setNome(nomeSalvo);
      if (emailSalvo) {
        setEmail(emailSalvo);
        setEmailOriginal(emailSalvo);
        const fotoSalva = await AsyncStorage.getItem(`userFoto_${emailSalvo}`);
        if (fotoSalva) setFotoPerfil(fotoSalva);
      }
      if (senhaSalva) setSenha(senhaSalva);
      if (telefoneSalvo) setTelefone(telefoneSalvo);
    };

    carregarDados();
  }, []);

  const validarSenha = (senha: string) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(senha);
  };

  const salvarDados = async () => {
    if (!nome.trim() || !senha.trim() || !telefone.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!validarSenha(senha)) {
      Alert.alert(
        'Senha inválida',
        'A senha deve ter pelo menos 6 caracteres e conter letras e números.'
      );
      return;
    }

    try {
      if (!emailOriginal) {
        Alert.alert('Erro', 'Email original não encontrado.');
        return;
      }

      const response = await fetch(`http://10.0.2.2:3000/logins/${emailOriginal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, telefone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar usuário.');
      }

      await AsyncStorage.setItem('userNome', nome);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userSenha', senha);
      await AsyncStorage.setItem('userTelefone', telefone);

      if (fotoPerfil) {
        await AsyncStorage.setItem(`userFoto_${email}`, fotoPerfil);
        if (emailOriginal !== email) {
          await AsyncStorage.removeItem(`userFoto_${emailOriginal}`);
        }
      }

      setEmailOriginal(email);

      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!', [
        { text: 'OK', onPress: () => rota.back() },
      ]);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const excluirConta = async () => {
    Alert.alert('Atenção', 'Tem certeza que deseja excluir sua conta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sim, excluir',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          rota.replace('/login');
        },
      },
    ]);
  };

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar fotos é necessária!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setFotoPerfil(uri);
      if (email) {
        await AsyncStorage.setItem(`userFoto_${email}`, uri);
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => rota.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Informações</Text>
      </View>

      <TouchableOpacity style={styles.fotoContainer} onPress={escolherImagem}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} />
        ) : (
          <View style={[styles.fotoPerfil, styles.placeholder]}>
            <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.nome}>{nome || 'Nome do Usuário'}</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#ccc"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputDisabled}>
          <Ionicons name="lock-closed" size={18} color="#aaa" style={{ marginRight: 6 }} />
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua nova senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu telefone"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        <TouchableOpacity style={[styles.btnSalvar, { width: '70%' }]} onPress={salvarDados}>
          <Text style={styles.txtBtnSalvar}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnExcluir} onPress={excluirConta}>
          <Text style={styles.txtExcluir}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203562',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titulo: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  fotoContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  fotoPerfil: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#506294',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    borderWidth: 1,
    borderColor: '#fff',
  },
  nome: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginTop: 10,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginTop: 6,
  },
  label: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#506294',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  inputDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A4B78',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  emailText: {
    color: '#aaa',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  btnSalvar: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    alignSelf: 'center',
    marginTop: 10,
  },
  txtBtnSalvar: {
    color: '#203562',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  btnExcluir: {
    borderRadius: 30,
    paddingVertical: 12,
    alignSelf: 'center',
    marginTop: 16,
  },
  txtExcluir: {
    color: '#f00',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
});
