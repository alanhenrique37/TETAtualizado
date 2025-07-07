import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useNavigation, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const getProfilePhotoKey = (email: string) => `userFoto_${email}`;

const loadProfilePhoto = async (email: string) => {
  return await AsyncStorage.getItem(getProfilePhotoKey(email));
};

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userNome, setUserNome] = useState('');
  const [userFoto, setUserFoto] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('maisRecente');
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation();
  const rota = useRouter();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const carregarUsuario = async () => {
    try {
      const nome = await AsyncStorage.getItem('userNome');
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email || '');

      const foto = email ? await loadProfilePhoto(email) : null;
      const savedProjetos = await AsyncStorage.getItem('projetos');

      if (nome) setUserNome(nome);
      if (foto) setUserFoto(foto);
      if (savedProjetos) setProjetos(JSON.parse(savedProjetos));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarUsuario();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      'userNome',
      'userEmail',
      'userSenha',
      'userTelefone',
      `userFoto_${userEmail}`,
    ]);
    rota.push('/');
  };

  const projetosFiltrados = [...projetos]
    .filter(projeto =>
      projeto.nome?.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      switch (filterType) {
        case 'maisRecente':
          return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
        case 'maiorValor':
          return (parseFloat(b.valor) || 0) - (parseFloat(a.valor) || 0);
        case 'menorValor':
          return (parseFloat(a.valor) || 0) - (parseFloat(b.valor) || 0);
        default:
          return 0;
      }
    });

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo e Saudação alinhados */}
        <View style={styles.greetingContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.foto} />
          <View style={styles.coluna}>
            <Text
              style={styles.greetingText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userNome ? `E aí, ${userNome}!` : 'E aí,'}
            </Text>
            <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
          </View>
        </View>

        {/* Header com pesquisa e filtro */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#203562"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                style={styles.filterButton}
                activeOpacity={0.7}
              >
                <Ionicons name="filter-outline" size={24} color="#203562" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lista de projetos */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map(projeto => (
              <View key={projeto.id} style={styles.card}>
                <View style={styles.userRow}>
                  {projeto.userFoto ? (
                    <Image source={{ uri: projeto.userFoto }} style={styles.avatar} />
                  ) : (
                    <Ionicons name="person-circle-outline" size={50} color="#203562" />
                  )}
                  <View style={{ maxWidth: 200 }}>
                    <Text
                      style={styles.nome}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {projeto.userNome}
                    </Text>
                  </View>
                </View>

                <Text style={styles.projectTitle}>{projeto.nome}</Text>

                {/* Removida label "Descrição:" */}
                <Text style={styles.descricao}>{projeto.descricao}</Text>

                <Text style={styles.labelCenter}>
                  Preço e quantidade de pessoas na equipe
                </Text>
                <View style={styles.boxRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>R$ {projeto.valor}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      {projeto.numeroPessoas || '1 pessoa'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.contatoButton}
                  onPress={() =>
                    rota.push({
                      pathname: '/contato',
                      params: {
                        email: projeto.userEmail,
                        nome: projeto.userNome,
                        telefone: projeto.telefone,
                      },
                    })
                  }
                >
                  <Text style={styles.contatoButtonText}>Contato</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noProjetosText}>Nenhum projeto encontrado</Text>
          )}
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

      {/* Modal Filtro */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Projetos</Text>

            {['maisRecente', 'maiorValor', 'menorValor'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type)}
                style={styles.radioOption}
              >
                <Ionicons
                  name={filterType === type ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color="#203562"
                />
                <Text style={styles.radioText}>
                  {type === 'maisRecente'
                    ? 'Mais recentes'
                    : type === 'maiorValor'
                    ? 'Maior valor'
                    : 'Menor valor'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#203562' },
  content: { flex: 1 },

  header: {
    backgroundColor: '#203562',
    borderBottomWidth: 1,
    borderColor: '#203562',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 44,
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
    color: '#203562',
  },
  searchInput: {
    flex: 1,
    textAlign: 'left',
    color: '#203562',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    paddingRight: 36,
  },
  filterButton: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 4,
  },
  foto: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginRight: 12,
  },
  coluna: {
    flexDirection: 'column',
    maxWidth: 220,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  welcomeText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  nome: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#203562',
  },
  projectTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
  },
  descricao: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  labelCenter: {
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    color: '#203562',
    marginTop: 16,
    marginBottom: 10,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  infoBox: {
    borderWidth: 2,
    borderColor: '#203562',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  infoText: {
    fontWeight: 'bold',
    color: '#203562',
  },
  contatoButton: {
    backgroundColor: '#203562',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 50, // Aumentado para dar mais largura interna
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
    minWidth: 200, // Aumentado para garantir largura mínima maior
  },
  contatoButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  noProjetosText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 17,
    
    color: '#203562',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#203562',
    fontFamily: 'Poppins-Regular',
  },
  applyButton: {
    backgroundColor: '#203562',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
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
