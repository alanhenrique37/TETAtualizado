import React, { useState, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation } from 'expo-router';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';

export default function Index() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [pagina, setPagina] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const conteudo = [
    {
      titulo: 'Bem-vindo à ponte entre ideias e soluções!',
      imagem: require('../../assets/images/parte1.png'),
    },
    {
      titulo: 'Transforme seu portfólio em vitrine. Comece agora.',
      imagem: require('../../assets/images/parte2.png'),
    },
    {
      titulo: 'E aí, vamos começar?',
      imagem: require('../../assets/images/parte3.png'),
    },
  ];

  const trocarPagina = (novoIndex) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPagina(novoIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const proximo = () => {
    if (pagina < conteudo.length - 1) {
      trocarPagina(pagina + 1);
    } else {
      navigation.navigate('cadastrar'); // Ajuste para sua rota real
    }
  };

  const voltar = () => {
    if (pagina > 0) {
      trocarPagina(pagina - 1);
    }
  };

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) { // STATE.END
      const { translationX } = nativeEvent;
      if (translationX < -50) {
        proximo();
      } else if (translationX > 50) {
        voltar();
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <View style={styles.container}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text
              style={[
                styles.titulo,
                pagina === conteudo.length - 1 && { marginBottom: 50 },
              ]}
            >
              {conteudo[pagina].titulo}
            </Text>

            <Image source={conteudo[pagina].imagem} style={styles.imagem} resizeMode="contain" />
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.botao,
              pagina === conteudo.length - 1 && { marginTop: 25 }
            ]}
            onPress={proximo}
          >
            <View style={styles.botaoConteudo}>
              <Text style={styles.textoBotao}>
                {pagina < conteudo.length - 1 ? 'Próximo' : 'Começar'}
              </Text>
              {pagina < conteudo.length - 1 && (
                <Image
                  source={require('../../assets/images/seta-direita.png')}
                  style={styles.seta}
                />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.indicadores}>
            {conteudo.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.bolinha,
                  pagina === index && styles.bolinhaAtiva,
                ]}
              />
            ))}
          </View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BF91FF  linear-gradient(0deg,rgba(32, 53, 98, 1) 100%, rgba(32, 53, 98, 1) 20%)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 33,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginBottom: 20,  // padrão para todas as outras páginas
    textAlign: 'center',
  },
  imagem: {
    width: 260,
    height: 260,
    marginBottom: 30,
  },
  botao: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 30,
    width: 180,
  },
  botaoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: {
    color: '#203562',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginRight: 4,
  },
  seta: {
    width: 20,
    height: 20,
  },
  indicadores: {
    flexDirection: 'row',
    gap: 10,
  },
  bolinha: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    opacity: 0.4,
    marginTop:30,
  },
  bolinhaAtiva: {
    backgroundColor: 'black',
    opacity: 1,
  },
});
