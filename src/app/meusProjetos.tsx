import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, usePathname, useNavigation } from 'expo-router';
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

export default function MeusProjetos() {
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFoto, setUserFoto] = useState<string | null>(null);
  const [projetosDoUsuario, setProjetosDoUsuario] = useState<Projeto[]>([]);
  const rota = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const carregar = async () => {
    const nome = await AsyncStorage.getItem('userNome');
    const email = await AsyncStorage.getItem('userEmail');
    const foto = email ? await AsyncStorage.getItem(`userFoto_${email}`) : null;
    const all = await AsyncStorage.getItem('projetos');
    setUserNome(nome || '');
    
    setUserEmail(email || '');
    setUserFoto(foto);
    if (all && email) {
      const arr: Projeto[] = JSON.parse(all);
      setProjetosDoUsuario(arr.filter(p => p.userEmail === email));
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  useFocusEffect(
    React.useCallback(() => {
      carregar();
    }, [])
  );

  // Função para excluir um projeto
  const excluirProjeto = (id: string) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este post?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              // Requisição para excluir no backend
              const response = await fetch(`http://10.0.2.2:3000/projetos/${id}`, {
                method: 'DELETE',
              });
  
              const data = await response.json();
  
              if (!response.ok) {
                throw new Error(data.message || 'Erro ao excluir projeto no servidor.');
              }
  
              // Remove localmente (AsyncStorage + state)
              const novosProjetos = projetosDoUsuario.filter(p => p.id !== id);
              setProjetosDoUsuario(novosProjetos);
  
              const allProjetosRaw = await AsyncStorage.getItem('projetos');
              if (allProjetosRaw) {
                const allProjetos: Projeto[] = JSON.parse(allProjetosRaw);
                const atualizados = allProjetos.filter(p => p.id !== id);
                await AsyncStorage.setItem('projetos', JSON.stringify(atualizados));
              }
  
              Alert.alert("Sucesso", "Post excluído com sucesso!");
            } catch (error: any) {
              console.error("Erro ao excluir projeto:", error);
              Alert.alert("Erro", error.message || "Erro ao excluir projeto.");
            }
          }
        }
      ]
    );
  
  
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => rota.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Posts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {projetosDoUsuario.map(projeto => (
          <View key={projeto.id} style={styles.card}>
            <View style={styles.userRow}>
              {userFoto ? (
                <Image source={{ uri: userFoto }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle-outline" size={60} color="#203562" />
              )}
              <View>
                <Text style={styles.nome}>{userNome}</Text>
              </View>
            </View>

            <Text style={styles.label}>Projeto:</Text>
            <Text style={styles.descricao}>{projeto.descricao}</Text>

            <Text style={styles.labelCenter}>Preço e quantidade de pessoas na equipe</Text>
            <View style={styles.boxRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>R$ {projeto.valor}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{projeto.numeroPessoas || '1 pessoa'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.btnEditar, { flex: 1, marginRight: 10 }]}
                onPress={() => rota.push({ pathname: '/editarpost1', params: { id: projeto.id } })}
              >
                <Text style={styles.btnEditarText}>Editar Post</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnExcluir, { flex: 1 }]}
                onPress={() => excluirProjeto(projeto.id)}
              >
                <Text style={styles.btnExcluirText}>Excluir Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#203562' },
  scroll: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20, gap: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  nome: { fontSize: 16,  fontFamily: 'Poppins-Bold', color: '#000' },
  cargo: { fontSize: 13, color: '#666' },
  label: {  fontFamily: 'Poppins-SemiBold', color: '#000', marginTop: 10, marginBottom: 4 },
  descricao: { color: '#444', fontSize: 14, lineHeight: 20, fontFamily: 'Poppins-Regular' },
  labelCenter: {
    textAlign: 'center', fontFamily: 'Poppins-SemiBold', color: '#000', marginTop: 16, marginBottom: 10,
  },
  boxRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 20,
  },
  infoBox: {
    borderWidth: 2, borderColor: '#203562', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16,
  },
  infoText: { fontWeight: 'bold', color: '#203562' },
  btnEditar: {
    backgroundColor: '#203562', borderRadius: 25, paddingVertical: 10, alignItems: 'center',
  },
  btnEditarText: { color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize:13, },
  btnExcluir: {
    backgroundColor: '#cc3333', borderRadius: 25, paddingVertical: 10, alignItems: 'center',
  },
  btnExcluirText: { color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize:12, },
  navbar: {
    position: 'absolute', bottom: 10, left: '5%', right: '5%', backgroundColor: '#fff',
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12,
    borderRadius: 40, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  navButton: {
    justifyContent: 'center', alignItems: 'center', width: 50, height: 50, borderRadius: 25,
  },
  activeButton: { borderWidth: 2, borderColor: '#203562' },
  navProfileImage: { width: 30, height: 30, borderRadius: 15 },
});
