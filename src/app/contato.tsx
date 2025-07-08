import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useRouter,
  useLocalSearchParams,
  usePathname,
  useNavigation,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Contato() {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const { nome, email, telefone } = useLocalSearchParams();

  const [foto, setFoto] = useState<string | null>(null);
  const [userFoto, setUserFoto] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const carregarFotos = async () => {
      if (email) {
        const fotoCadastrante = await AsyncStorage.getItem(`userFoto_${email}`);
        if (fotoCadastrante) setFoto(fotoCadastrante);
      }

      const emailLogado = await AsyncStorage.getItem('userEmail');
      if (emailLogado) {
        const minhaFoto = await AsyncStorage.getItem(`userFoto_${emailLogado}`);
        if (minhaFoto) setUserFoto(minhaFoto);
      }
    };

    carregarFotos();
  }, [email]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header igual ao de Informações */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Contato</Text>
        </View>

        {foto ? (
          <Image source={{ uri: foto }} style={styles.profileImage} />
        ) : (
          <View style={styles.noImageBox}>
            <Ionicons name="person-circle-outline" size={100} color="#fff" />
            <Text style={styles.noImageText}>Foto não disponível</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{nome || 'Não informado'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email || 'Não informado'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.value}>{telefone || 'Não informado'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navbar com foto do usuário logado */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, pathname === '/home' && styles.activeButton]}
          onPress={() => router.push('/home')}
        >
          <Ionicons name="home" size={28} color="#203562" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, pathname === '/cadastrarprojeto' && styles.activeButton]}
          onPress={() => router.push('/cadastrarprojeto')}
        >
          <Ionicons name="add-circle" size={35} color="#203562" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, pathname === '/informacoes' && styles.activeButton]}
          onPress={() => router.push('/informacoes')}
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
    padding: 20,
    paddingBottom: 100,
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 30,
  },
  noImageBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  noImageText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 6,
  },
  infoContainer: {
    backgroundColor: '#3A4B78',
    width: '100%',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#ccc',
    fontFamily: 'Poppins-Regular',
  },
  value: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#203562',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
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
