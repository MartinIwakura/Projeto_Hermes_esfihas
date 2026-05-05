import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categorias = [
  { id: '1', nome: 'Carne', imagem: require('./assets/carne.jpg') },
  { id: '2', nome: 'Queijo', imagem: require('./assets/queijo.jpg') },
  { id: '3', nome: 'Calabresa', imagem: require('./assets/calabresa.jpg') },
];

const produtos = [
  {
    id: '1',
    nome: 'Esfiha de Carne',
    descricao: 'Deliciosa esfiha de carne moída temperada',
    preco: 6.9,
    imagem: require('./assets/carne.jpg'),
  },
  {
    id: '2',
    nome: 'Esfiha de Queijo',
    descricao: 'Queijo derretido delicioso',
    preco: 7.2,
    imagem: require('./assets/queijo.jpg'),
  },
  {
    id: '3',
    nome: 'Esfiha de Calabresa',
    descricao: 'Calabresa com cebola e queijo',
    preco: 7.5,
    imagem: require('./assets/calabresa.jpg'),
  },
];

export default function App() {
  const [tela, setTela] = useState('home');

  // perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  // endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // carrinho
  const [carrinho, setCarrinho] = useState([]);

  // pagamento
  const [formaPagamento, setFormaPagamento] = useState('');

  // animações
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [imagemAnimada, setImagemAnimada] = useState(null);

  const animarBotao = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const animarProduto = (imagem) => {
    setImagemAnimada(imagem);

    animX.setValue(0);
    animY.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);

    Animated.parallel([
      Animated.timing(animX, { toValue: 200, duration: 600, useNativeDriver: true }),
      Animated.timing(animY, { toValue: -350, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const buscarCEP = async (cepDigitado) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setRua(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      }
    } catch {}
  };

  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
    animarBotao();
    animarProduto(produto.imagem);
  };

  const removerItem = (index) => {
    const novo = [...carrinho];
    novo.splice(index, 1);
    setCarrinho(novo);
  };

  const total = carrinho.reduce((sum, item) => sum + item.preco, 0);

  // ===== PAGAMENTO =====
  if (tela === 'pagamento') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Pagamento</Text>

        {['Dinheiro', 'Cartão', 'Pix'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={styles.opcaoPagamento}
            onPress={() => setFormaPagamento(tipo)}
          >
            <Text>{tipo}</Text>
          </TouchableOpacity>
        ))}

        <Text style={{ margin: 10 }}>Total: R$ {total.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={() => {
            if (!formaPagamento) {
              alert('Escolha o pagamento');
              return;
            }

            alert(
              `Pedido confirmado!\n${nome}\n${rua}, ${cidade}\nPagamento: ${formaPagamento}`
            );

            setCarrinho([]);
            setTela('home');
          }}
        >
          <Text style={styles.textoFinalizar}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== PERFIL =====
  if (tela === 'perfil') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Perfil</Text>

        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />

        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChangeText={(text) => {
            setCep(text);
            buscarCEP(text);
          }}
        />

        <TextInput style={styles.input} placeholder="Rua" value={rua} onChangeText={setRua} />
        <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
        <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
        <TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} />

        <TouchableOpacity style={styles.button} onPress={() => setTela('home')}>
          <Text style={{ color: '#fff' }}>Salvar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== HOME =====
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Esfiha Express</Text>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setTela('perfil')}>
              <Ionicons name="person" size={28} color="#fff" />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View style={styles.cartIcon}>
                <Ionicons name="cart" size={28} color="#fff" />
                <Text style={styles.cartCount}>{carrinho.length}</Text>
              </View>
            </Animated.View>
          </View>
        </View>

        <Text style={styles.location}>
          {rua ? `${rua}, ${cidade}` : 'Informe seu endereço no perfil'}
        </Text>

        <TextInput style={styles.search} placeholder="Buscar esfihas..." />
      </View>

      <View style={styles.promo}>
        <Text style={styles.promoText}>Promoção do Dia: 20% OFF</Text>
      </View>

      <Text style={styles.sectionTitle}>Mais Pedidas</Text>

      <FlatList
        horizontal
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Image source={item.imagem} style={styles.categoryImage} />
            <Text>{item.nome}</Text>
          </View>
        )}
      />

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.imagem} style={styles.cardImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardDesc}>{item.descricao}</Text>
              <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => adicionarAoCarrinho(item)}>
              <Text style={{ color: '#fff' }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {imagemAnimada && (
        <Animated.Image
          source={imagemAnimada}
          style={[
            styles.flyingImage,
            {
              opacity,
              transform: [
                { translateX: animX },
                { translateY: animY },
                { scale: scale },
              ],
            },
          ]}
        />
      )}

      <View style={styles.carrinhoLista}>
        <FlatList
          data={carrinho}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.itemCarrinho}>
              <Text>{item.nome}</Text>
              <TouchableOpacity onPress={() => removerItem(index)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.carrinho}>
        <Text>Total: R$ {total.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={() => setTela('pagamento')}
        >
          <Text style={{ color: '#fff' }}>Ir para pagamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },

  header: {
    backgroundColor: '#FFA726',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  location: {
    color: '#fff',
    marginBottom: 10,
  },

  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
  },

  promo: {
    backgroundColor: '#D32F2F',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },

  promoText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  sectionTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },

  categoryItem: {
    alignItems: 'center',
    margin: 10,
  },

  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',

    // sombra (fica bonito no web também)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  cardDesc: {
    color: '#777',
    fontSize: 12,
  },

  cardPrice: {
    color: '#D32F2F',
    fontWeight: 'bold',
    marginTop: 5,
  },

  button: {
    backgroundColor: '#FFA726',
    padding: 12,
    borderRadius: 25,
  },

  carrinhoLista: {
    maxHeight: 150,
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  itemCarrinho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  carrinho: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },

  botaoFinalizar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  textoFinalizar: {
    color: '#fff',
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },

  opcaoPagamento: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  flyingImage: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    width: 80,
    height: 80,
  },
});