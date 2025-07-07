import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
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

  return !fontsLoaded ? null : (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#203562" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons name="filter-outline" size={24} color="#203562" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            style={styles.userIcon}
          >
            {userFoto ? (
              <Image source={{ uri: userFoto }} style={styles.userPhoto} />
            ) : (
              <View style={[styles.userPhoto, styles.photoPlaceholder]}>
                <Text style={styles.photoPlaceholderText}>
                  {userNome ? userNome.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={styles.dropdown}>
            <Text style={styles.userName}>{userNome || 'Usuário'}</Text>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                rota.push('/meusprojetos');
              }}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownButtonText}>Meus Projetos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                rota.push('/informacoes');
              }}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownButtonText}>Gerenciar Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {userNome ? `Olá, ${userNome}!` : 'Olá!'}
          </Text>
          <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
        </View>

        <TouchableOpacity
          onPress={() => rota.push('/cadastrarprojeto')}
          style={styles.cadastrarButton}
        >
          <Text style={styles.cadastrarButtonText}>Cadastrar Projeto</Text>
        </TouchableOpacity>

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
                    <Ionicons name="person-circle-outline" size={60} color="#203562" />
                  )}
                  <View>
                    <Text style={styles.nome}>{projeto.userNome}</Text>
                  </View>
                </View>

                <Text style={styles.label}>Projeto:</Text>
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

                <Text style={[styles.labelCenter, { marginTop: 12 }]}>
                 
                </Text>
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
  scroll: { padding: 20, paddingBottom: 100 },
  header: {
    backgroundColor: '#203562',
    borderBottomWidth: 1,
    borderColor: '#203562',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
    color: '#203562',
  },
  searchInput: {
    flex: 1,
    color: '#203562',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  filterButton: {
    padding: 8,
  },
  userIcon: {
    padding: 4,
  },
  userPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  photoPlaceholder: {
    backgroundColor: '#203562',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#203562',
    fontFamily: 'Poppins-Bold',
  },
  dropdownButton: {
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#203562',
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  welcomeText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  cadastrarButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cadastrarButtonText: {
    color: '#203562',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  nome: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#203562' },
  label: { fontFamily: 'Poppins-SemiBold', color: '#203562', marginTop: 10, marginBottom: 4 },
  descricao: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
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
  infoText: { fontWeight: 'bold', color: '#203562' },
  contatoButton: {
    backgroundColor: '#203562',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  contatoButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
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
});
