import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  userNome: string;
  userFoto: string | null;
  userEmail: string;
  numeroPessoas?: string;
  telefone: string;
}

export default function Perfil() {
  const rota = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const [userTelefone, setUserTelefone] = useState('');
  const [userFoto, setUserFoto] = useState<string | null>(null);
  const [meusProjetos, setMeusProjetos] = useState<Projeto[]>([]);
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const loadUserData = async () => {
      const nome = await AsyncStorage.getItem('userNome');
      const email = await AsyncStorage.getItem('userEmail');
      const senha = await AsyncStorage.getItem('userSenha');
      const telefone = await AsyncStorage.getItem('userTelefone');

      if (nome) setUserNome(nome);
      if (email) setUserEmail(email);
      if (senha) setUserSenha('*'.repeat(senha.length));
      if (telefone) setUserTelefone(telefone);

      if (email) {
        const foto = await AsyncStorage.getItem(`userFoto_${email}`);
        if (foto) setUserFoto(foto);
      }

      const projetosRaw = await AsyncStorage.getItem('projetos');
      if (projetosRaw) {
        const projetos: Projeto[] = JSON.parse(projetosRaw);
        const meus = projetos.filter(p => p.userEmail === email);
        setMeusProjetos(meus);
      }
    };

    loadUserData();
  }, []);

  const pickImage = async () => {
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
      setUserFoto(uri);
      if (userEmail) {
        await AsyncStorage.setItem(`userFoto_${userEmail}`, uri);
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => rota.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Meu Perfil</Text>
        </View>

        {/* Perfil */}
        <View style={styles.perfilContainer}>
          <TouchableOpacity onPress={pickImage}>
            {userFoto ? (
              <Image source={{ uri: userFoto }} style={styles.fotoPerfil} />
            ) : (
              <View style={[styles.fotoPerfil, styles.fotoPlaceholder]}>
                <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.nome}>{userNome || 'Nome do Usuário'}</Text>
            <Text style={styles.cargo}>{userEmail || 'email@email.com'}</Text>
          </View>
        </View>

        {/* Info adicionais */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Senha</Text>
          <Text style={styles.infoText}>{userSenha}</Text>

          <Text style={styles.infoLabel}>Telefone</Text>
          <Text style={styles.infoText}>{userTelefone}</Text>
        </View>

        {/* Botão editar */}
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => rota.push('/editarInformacoes')}
        >
          <Text style={styles.txtBtn}>Editar Informações</Text>
        </TouchableOpacity>

        {/* Título dos posts */}
        <Text style={styles.subtitulo}>
          Meus Posts <Text style={styles.qtdPosts}>({meusProjetos.length} posts)</Text>
        </Text>

        {/* Cards dos projetos */}
        <View style={styles.grid}>
          {meusProjetos.length > 0 ? (
            meusProjetos.map((projeto) => (
              <View style={styles.card} key={projeto.id}>
                <Text style={styles.cardTitulo}>{projeto.nome}</Text>
                <Text style={styles.cardTexto} numberOfLines={3}>
                  {projeto.descricao}
                </Text>
                <Text style={styles.cardTexto}>Valor: R$ {projeto.valor}</Text>
                <Text style={styles.cardTexto}>Data: {projeto.data}</Text>

                {/* Ver Tudo no canto inferior direito */}
                <View style={styles.verTudoContainer}>
                  <TouchableOpacity onPress={() => rota.push(`/meusProjetos`)}>
                    <Text style={styles.cardVerTudo}>Ver Tudo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#ccc', marginTop: 10 }}>Nenhum projeto encontrado.</Text>
          )}
        </View>

        {/* Ver todos geral */}
        <TouchableOpacity onPress={() => rota.push('/meusProjetos')}>
          <Text style={styles.verTodos}>Ver Todos</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, pathname === '/home' && styles.activeButton]}
          onPress={() => rota.push('/home')}
        >
          <Ionicons name="home" size={28} color="#203562" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, pathname === '/cadastrarprojeto' && styles.activeButton]}
          onPress={() => rota.push('/cadastrarprojeto')}
        >
          <Ionicons name="add-circle" size={35} color="#203562" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, pathname === '/informacoes' && styles.activeButton]}
          onPress={() => rota.push('/informacoes')}
        >
          {userFoto ? (
            <Image source={{ uri: userFoto }} style={styles.navProfileImage} />
          ) : (
            <Ionicons name="person" size={28} color="#203562" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#203562',
  },
  container: {
    flex: 1,
    backgroundColor: '#203562',
    paddingHorizontal: 20,
    marginBottom: 60,
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
  perfilContainer: {
    flexDirection: 'row',
    backgroundColor: '#3A4B78',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
    gap: 15,
  },
  fotoPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#506294',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPlaceholder: {
    borderWidth: 1,
    borderColor: '#fff',
  },
  nome: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cargo: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  infoBox: {
    backgroundColor: '#3A4B78',
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
  },
  infoLabel: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  btnEditar: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  txtBtn: {
    color: '#203562',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitulo: {
    color: '#fff',
    fontSize: 17,
    marginTop: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  qtdPosts: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Poppins-Regular',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    width: '47%',
  },
  cardTitulo: {
    fontFamily: 'Poppins-Bold',
    color: '#203562',
  },
  cardTexto: {
    color: '#333',
    fontSize: 13,
    marginVertical: 4,
    fontFamily: 'Poppins-Regular',
  },
  verTudoContainer: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  cardVerTudo: {
    color: '#203562',
    fontFamily: 'Poppins-Bold',

  },
  verTodos: {
    color: '#fff',
    textAlign: 'right',
    marginTop: 16,
    fontFamily: 'Poppins-Bold',
  
    marginBottom: 20,
  },
  navbar: {
    position: 'absolute',
    bottom: 10,
    left: '5%',
    right: '5%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 40,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activeButton: {
    borderWidth: 2,
    borderColor: '#203562',
  },
  navProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
