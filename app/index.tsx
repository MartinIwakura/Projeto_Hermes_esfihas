import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../firebase/firebaseConfig';

type Categoria = {
  id: string;
  nome: string;
  imagem: ImageSourcePropType;
};

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: ImageSourcePropType;
  categoria: 'salgada' | 'doce' | 'bebida'; // Tipagem da nova propriedade
};

const produtos: Produto[] = [
  {
    id: '1',
    nome: 'Esfiha de Carne',
    descricao: 'Tradicional carne moída perfeitamente temperada com especiarias da casa',
    preco: 6.25,
    imagem: require('../assets/carne.jpg'),
    categoria: 'salgada'
  },
  {
    id: '2',
    nome: 'Esfiha de Frango',
    descricao: 'Frango desfiado suculento e levemente temperado',
    preco: 6.25,
    imagem: require('../assets/esfiha-frango.jpg'),
    categoria: 'salgada'
  },
  {
    id: '3',
    nome: 'Esfiha de Presunto e Queijo',
    descricao: 'Clássica combinação de presunto picadinho com muçarela derretida',
    preco: 6.25,
    imagem: require('../assets/presunto.png'),
    categoria: 'salgada'
  },
  {
    id: '4',
    nome: 'Esfiha de Queijo',
    descricao: 'Muçarela especial derretida com um toque leve de ervas',
    preco: 6.25,
    imagem: require('../assets/queijo.jpg'),
    categoria: 'salgada'
  },
  {
    id: '5',
    nome: 'Esfiha de Calabresa',
    descricao: 'Calabresa moída de primeira com cebola e cobertura de muçarela',
    preco: 6.25,
    imagem: require('../assets/calabresa.jpg'),
    categoria: 'salgada'
  },
  {
    id: '6',
    nome: 'Esfiha de Frango com Catupiry',
    descricao: 'Frango desfiado cremoso com o legítimo Catupiry original',
    preco: 6.25,
    imagem: require('../assets/FrangoCatu.jpg'),
    categoria: 'salgada'
  },
  {
    id: '7',
    nome: 'Esfiha de Chocolate',
    descricao: 'Generosa camada de chocolate ao leite cremoso com granulado crocante',
    preco: 7.50,
    imagem: require('../assets/chocolate.png'),
    categoria: 'doce'
  },
  {
    id: '8',
    nome: 'Esfiha de Doce de Leite',
    descricao: 'Doce de leite pastoso premium, cremoso na medida certa',
    preco: 7.25,
    imagem: require('../assets/docedeleite.png'),
    categoria: 'doce'
  },
  {
    id: '9',
    nome: 'Savory & Sweet',
    descricao: 'Sofisticada combinação de chocolate meio amargo com frutas vermelhas selecionadas',
    preco: 7.25,
    imagem: require('../assets/SeS.png'),
    categoria: 'doce'
  },
  {
    id: '10',
    nome: 'Esfiha de Ovomaltine',
    descricao: 'Creme de chocolate cremoso salpicado com flocos crocantes de Ovomaltine',
    preco: 7.25,
    imagem: require('../assets/ovomaltine.png'),
    categoria: 'doce'
  },
  {
    id: '11',
    nome: 'Esfiha Quatro Queijos',
    descricao: 'Blend perfeito de muçarela, provolone, parmesão e um toque de requeijão',
    preco: 7.25,
    imagem: require('../assets/quatroqueijos.png'),
    categoria: 'salgada'
  },
  {
    id: '12',
    nome: 'H2OH! Limão',
    descricao: 'Bebida leve levemente gaseificada com suco natural de limão',
    preco: 7.25,
    imagem: require('../assets/h20.jpg'),
    categoria: 'bebida'
  },
  {
    id: '13',
    nome: 'Coca-Cola Lata',
    descricao: 'Refrigerante lata 350ml trincando de gelada',
    preco: 5.50,
    imagem: require('../assets/coca_lata.png'),
    categoria: 'bebida'
  },
  {
    id: '14',
    nome: 'Coca-Cola 600ml',
    descricao: 'Refrigerante 600ml ideal para acompanhar sua refeição',
    preco: 7.50,
    imagem: require('../assets/coca_600.png'),
    categoria: 'bebida'
  },
  {
    id: '15',
    nome: 'Coca-Cola KS (Vidro)',
    descricao: 'A clássica Coca-Cola Garrafa de Vidro 290ml',
    preco: 6.00,
    imagem: require('../assets/coca.png'),
    categoria: 'bebida'
  },
  {
    id: '16',
    nome: 'Guaraná Antarctica Lata',
    descricao: 'Refrigerante lata 350ml bem gelado',
    preco: 5.50,
    imagem: require('../assets/guarana_lata.png'),
    categoria: 'bebida'
  },
  {
    id: '17',
    nome: 'Guaraná Antarctica 600ml',
    descricao: 'Refrigerante guaraná 600ml bem gelado',
    preco: 7.50,
    imagem: require('../assets/guarana_600.png'),
    categoria: 'bebida'
  },
  {
    id: '18',
    nome: 'Suco de Laranja Integral',
    descricao: 'Suco natural de laranja 400ml feito na hora',
    preco: 8.50,
    imagem: require('../assets/suco_laranja.png'),
    categoria: 'bebida'
  },
  {
    id: '19',
    nome: 'Água Mineral Sem Gás',
    descricao: 'Garrafa de água mineral 500ml',
    preco: 4.00,
    imagem: require('../assets/agua_mineral.png'),
    categoria: 'bebida'
  },
  {
    id: '20',
    nome: 'Água Mineral Com Gás',
    descricao: 'Garrafa de água mineral com gás 500ml',
    preco: 4.50,
    imagem: require('../assets/agua_gas.png'),
    categoria: 'bebida'
  }
];

export default function App() {
  const [tela, setTela] = useState('login');
  const [usuario, setUsuario] = useState<User | null>(null);

  // login/cadastro
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [modoLogin, setModoLogin] = useState(true);
  const [erroLogin, setErroLogin] = useState('');

  // perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  // endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // carrinho e pagamento
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [pedidosAnteriores, setPedidosAnteriores] = useState<any[]>([]);
  
  // Estado para armazenar o último pedido ativo no Delivery
  const [ultimoPedido, setUltimoPedido] = useState<any | null>(null);

  // Filtro de categorias por botões
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('todas');

  // animações
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [imagemAnimada, setImagemAnimada] = useState<ImageSourcePropType | null>(null);

  // filtrar
  const [busca, setBusca] = useState('');

  // Observa estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        setTela('home');
        carregarPedidos(user.uid);
        carregarPerfil(user.uid); // Busca dados cadastrados no banco
      } else {
        setUsuario(null);
        setTela('login');
      }
    });
    return unsubscribe;
  }, []);

  // BackHandler para gerenciar a navegação física
  useEffect(() => {
    const backAction = () => {
      if (tela !== 'home' && tela !== 'login') {
        setTela('home');
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [tela]);

  const carregarPedidos = async (uid: string) => {
    try {
      const q = query(collection(db, 'pedidos'), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const listaOrdenada = lista.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      
      setPedidosAnteriores(listaOrdenada);

      if (listaOrdenada.length > 0) {
        setUltimoPedido(listaOrdenada[0]);
      } else {
        setUltimoPedido(null);
      }
    } catch (error) {
      console.log("Erro ao carregar pedidos:", error);
    }
  };

  const carregarPerfil = async (uid: string) => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const dados = docSnap.data();
        setNome(dados.nome || '');
        setEmail(dados.email || '');
        setCep(dados.cep || '');
        setRua(dados.rua || '');
        setBairro(dados.bairro || '');
        setCidade(dados.cidade || '');
        setEstado(dados.estado || '');
      } else {
        // Limpa caso mude de conta e a nova não possua dados gravados ainda
        setNome('');
        setEmail('');
        setCep('');
        setRua('');
        setBairro('');
        setCidade('');
        setEstado('');
      }
    } catch (error) {
      console.log("Erro ao carregar perfil:", error);
    }
  };

  const salvarPerfilNoFirebase = async () => {
    if (!usuario) return;
    try {
      await setDoc(doc(db, 'usuarios', usuario.uid), {
        nome,
        email,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        atualizadoEm: new Date().toISOString()
      });
      alert('Perfil atualizado com sucesso!');
      setTela('home');
    } catch (error) {
      alert('Erro ao salvar o perfil.');
      console.log(error);
    }
  };

  const fazerLogin = async () => {
    setErroLogin('');
    try {
      await signInWithEmailAndPassword(auth, emailLogin, senhaLogin);
    } catch (e) {
      setErroLogin('Email ou senha inválidos.');
    }
  };

  const fazerCadastro = async () => {
    setErroLogin('');
    try {
      await createUserWithEmailAndPassword(auth, emailLogin, senhaLogin);
    } catch (e) {
      setErroLogin('Erro ao cadastrar. Verifique o email e a senha (mín. 6 caracteres).');
    }
  };

  const fazerLogout = async () => {
    await signOut(auth);
  };

  const salvarPedido = async () => {
  if (!usuario) return;

  // Verifica se a rua ou o cep foram preenchidos de verdade (removendo espaços em branco)
  const temEnderecoDigitado = (typeof rua === 'string' && rua.trim() !== '') || (typeof cep === 'string' && cep.trim() !== '');

  // Se tem endereço, monta a string completa. Se não tem, vira Retirada no Balcão.
  const enderecoCompleto = temEnderecoDigitado 
    ? `${rua}, ${bairro}, ${cidade} - ${estado}` 
    : 'Retirada no Balcão';
  
  await addDoc(collection(db, 'pedidos'), {
    uid: usuario.uid,
    email: usuario.email,
    itens: carrinho.map(p => ({ nome: p.nome, preco: p.preco })),
    total,
    formaPagamento,
    endereco: enderecoCompleto,
    criadoEm: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),  });
};

  const animarBotao = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const animarProduto = (imagem: ImageSourcePropType) => {
    setImagemAnimada(imagem);
    animX.setValue(0);
    animY.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(animX, { toValue: 120, duration: 600, useNativeDriver: true }),
      Animated.timing(animY, { toValue: 300, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const buscarCEP = async (cepDigitado: string) => {
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

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho([...carrinho, produto]);
    animarBotao();
    animarProduto(produto.imagem);
  };

  const removerItem = (index: number) => {
    const novo = [...carrinho];
    novo.splice(index, 1);
    setCarrinho(novo);
  };

  const total = carrinho.reduce((sum, item) => sum + item.preco, 0);

  // Filtra por categoria E por texto simultaneamente
const produtosFiltrados = produtos.filter(p => {
  const matchesBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
  
  // Se for 'todas', traz tudo que NÃO for bebida. Caso contrário, segue o filtro normal.
  const matchesCategoria = categoriaSelecionada === 'todas' 
    ? p.categoria !== 'bebida' 
    : p.categoria === categoriaSelecionada;

  return matchesBusca && matchesCategoria;
});

  // ===== TELA: LOGIN TRATADA COM LOGO VERDADEIRO =====
  if (tela === 'login') {
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.container, { justifyContent: 'center', backgroundColor: '#fff', paddingTop: 0 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginLogoContainer}>
            <Image 
              source={require('../assets/hermes_sabor.jpeg')} 
              style={styles.loginLogo} 
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 20 }]}>
            {modoLogin ? 'Acesse sua conta' : 'Crie sua conta'}
          </Text>

          <View style={{ paddingHorizontal: 15 }}>
            <TextInput
              style={styles.inputLogin}
              placeholder="Email"
              value={emailLogin}
              onChangeText={setEmailLogin}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.inputLogin}
              placeholder="Senha"
              value={senhaLogin}
              onChangeText={setSenhaLogin}
              secureTextEntry
            />

            {erroLogin ? <Text style={{ color: 'red', marginHorizontal: 10, marginBottom: 10 }}>{erroLogin}</Text> : null}

            <TouchableOpacity
              style={styles.botaoFinalizar}
              onPress={modoLogin ? fazerLogin : fazerCadastro}
            >
              <Text style={styles.textoFinalizar}>{modoLogin ? 'Entrar' : 'Cadastrar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ marginTop: 20 }} 
              onPress={() => { setModoLogin(!modoLogin); setErroLogin(''); }}
            >
              <Text style={{ textAlign: 'center', color: '#FFA726', fontWeight: '500' }}>
                {modoLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ===== TELA: PAGAMENTO =====
  if (tela === 'pagamento') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text style={{ marginLeft: 15, marginTop: 10, color: '#555' }}>
          Selecione a forma de pagamento:
        </Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formaPagamento}
            onValueChange={(itemValue) => setFormaPagamento(itemValue)}
            dropdownIconColor="#FFA726"
          >
            <Picker.Item label="Clique para selecionar..." value="" enabled={false} />
            <Picker.Item label="A Vista" value="A Vista" />
            <Picker.Item label="Cartão de Crédito/Débito" value="Cartão" />
            <Picker.Item label="Pix" value="Pix" />
          </Picker>
        </View>

        <Text style={{ margin: 15, fontWeight: 'bold', fontSize: 16 }}>
          Total: R$ {total.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={async () => {
            if (!formaPagamento) { alert('Por favor, escolha o pagamento'); return; }
            await salvarPedido();
            alert('Pedido confirmado! Acompanhe o status na aba Delivery.');
            setCarrinho([]);
            setFormaPagamento('');
            await carregarPedidos(usuario!.uid);
            setTela('delivery');
          }}
        >
          <Text style={styles.textoFinalizar}>Confirmar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ margin: 15 }} onPress={() => setTela('home')}>
          <Text style={{ color: '#999', textAlign: 'center' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== TELA PRINCIPAL =====
  return (
    <View style={styles.container}>
      {/* HEADER FIXO - CONFIGURADO PARA APARECER SOMANTE NA HOME */}
      {tela === 'home' && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Hermes Esfihas</Text>
          </View>
          <Text style={styles.location}>
            {rua ? `${rua}, ${cidade}` : 'Informe seu endereço no perfil'}
          </Text>
          <TextInput
            style={styles.search}
            placeholder="Buscar esfihas..."
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      )}

      {/* CONTEÚDO DINÂMICO BASEADO NA ABA ATUAL */}
      <ScrollView style={{ flex: 1 }}>
        
        {/* ABA: CARDÁPIO (HOME) */}
        {tela === 'home' && (
          <View>
            <View style={styles.bannerContainer}>
              <Image 
                source={require('../assets/banner1.png')} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>

            

            {/* SEÇÃO DOS BOTÕES DE FILTRO POR CATEGORIA */}
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, categoriaSelecionada === 'todas' && styles.filterButtonActive]}
                onPress={() => setCategoriaSelecionada('todas')}
              >
                <Text style={[styles.filterButtonText, categoriaSelecionada === 'todas' && styles.filterButtonTextActive]}>Todas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterButton, categoriaSelecionada === 'salgada' && styles.filterButtonActive]}
                onPress={() => setCategoriaSelecionada('salgada')}
              >
                <Text style={[styles.filterButtonText, categoriaSelecionada === 'salgada' && styles.filterButtonTextActive]}>Salgadas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterButton, categoriaSelecionada === 'doce' && styles.filterButtonActive]}
                onPress={() => setCategoriaSelecionada('doce')}
              >
                <Text style={[styles.filterButtonText, categoriaSelecionada === 'doce' && styles.filterButtonTextActive]}>Doces</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterButton, categoriaSelecionada === 'bebida' && styles.filterButtonActive]}
                onPress={() => setCategoriaSelecionada('bebida')}
              >
                <Text style={[styles.filterButtonText, categoriaSelecionada === 'bebida' && styles.filterButtonTextActive]}>Bebidas</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Cardápio</Text>
            {produtosFiltrados.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#999', marginTop: 25 }}>Nenhuma esfiha encontrada nesta categoria.</Text>
            ) : (
              produtosFiltrados.map((item) => (
                <View style={styles.card} key={item.id}>
                  <Image source={item.imagem} style={styles.cardImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.nome}</Text>
                    <Text style={styles.cardDesc}>{item.descricao}</Text>
                    <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={() => adicionarAoCarrinho(item)}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ABA: HISTÓRICO DE PEDIDOS */}
        {tela === 'pedidos' && (
          <View style={{ padding: 15 }}>
            <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 15 }]}>Meus Pedidos</Text>
            {pedidosAnteriores.length === 0 ? (
              <Text style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>Nenhum pedido feito ainda.</Text>
            ) : (
              pedidosAnteriores.map((item) => (
                <View style={[styles.card, { flexDirection: 'column', alignItems: 'flex-start', padding: 15 }]} key={item.id}>
                  <Text style={styles.cardTitle}>Pedido — {item.criadoEm?.slice(0, 10)}</Text>
                  <Text style={{ color: '#777', marginVertical: 4 }}>{item.itens.map((i: any) => i.nome).join(', ')}</Text>
                  <Text style={styles.cardPrice}>Total: R$ {Number(item.total).toFixed(2)}</Text>
                  <Text style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{item.formaPagamento} · {item.endereco}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ABA DE DELIVERY INTELIGENTE */}
        {tela === 'delivery' && (
          <View style={{ padding: 20 }}>
            <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 20 }]}>Acompanhar Entrega</Text>
            
            {!ultimoPedido ? (
              <View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 20 }}>
                <Ionicons name="bicycle-outline" size={70} color="#ccc" />
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 15, color: '#333' }}>
                  Nenhuma entrega ativa
                </Text>
                <Text style={{ color: '#777', textAlign: 'center', marginTop: 8, fontSize: 13, lineHeight: 18 }}>
                  Você não possui nenhum pedido em andamento no momento. Vá até o cardápio para fazer sua escolha!
                </Text>
                <TouchableOpacity style={[styles.botaoFinalizar, { backgroundColor: '#FFA726', marginTop: 25 }]} onPress={() => setTela('home')}>
                  <Text style={styles.textoFinalizar}>Ver Cardápio</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.deliveryStatusCard}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statusTitle}>Pedido Recebido</Text>
                      <Text style={styles.statusTime}>Registrado às {ultimoPedido.criadoEm?.slice(11, 16)}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>

                  <View style={[styles.statusLine, { backgroundColor: '#ddd' }]} />

                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#ccc' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statusTitle, { color: '#aaa' }]}>Em Preparação</Text>
                      <Text style={styles.statusTime}>As esfihas estão indo para o forno</Text>
                    </View>
                    <Ionicons name="time-outline" size={24} color="#ccc" />
                  </View>

                  <View style={[styles.statusLine, { backgroundColor: '#ddd' }]} />

                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#ccc' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statusTitle, { color: '#aaa' }]}>Saiu para Entrega</Text>
                      <Text style={styles.statusTime}>O motoboy já vai coletar</Text>
                    </View>
                    <Ionicons name="bicycle-outline" size={24} color="#ccc" />
                  </View>
                </View>

                <View style={[styles.perfilCard, { marginTop: 15, padding: 15 }]}>
                  <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 5 }}>Detalhes da Entrega:</Text>
                  <Text style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>
                     Itens: {ultimoPedido.itens?.map((i: any) => i.nome).join(', ')}
                  </Text>
                  <Text style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>
                     Total: R$ {Number(ultimoPedido.total).toFixed(2)} | {ultimoPedido.formaPagamento}
                  </Text>
                  <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
                  <Text style={{ color: '#777', fontSize: 12 }}>
                    📍 {ultimoPedido.endereco}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ABA: CARRINHO EMBUTIDO */}
        {tela === 'carrinhoAba' && (
          <View style={{ padding: 15 }}>
            <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 15 }]}>Seu Carrinho</Text>
            
            {carrinho.length === 0 ? (
              <Text style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>Seu carrinho está vazio.</Text>
            ) : (
              <View>
                {carrinho.map((item, index) => (
                  <View style={styles.itemCarrinho} key={index}>
                    <Text style={{ fontWeight: '500' }}>{item.nome}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                      <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>R$ {item.preco.toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => removerItem(index)}>
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.divisor} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Total:</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>R$ {total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.botaoFinalizar} onPress={() => setTela('pagamento')}>
                  <Text style={styles.textoFinalizar}>Ir para o Pagamento</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ABA: PERFIL */}
        {tela === 'perfil' && (
          <View>
            <View style={styles.perfilHeader}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#FFA726" />
              </View>
              <Text style={styles.perfilNome}>{nome || 'Nome do Usuário'}</Text>
              <Text style={styles.perfilEmail}>{usuario?.email}</Text>
            </View>

            <View style={{ paddingHorizontal: 15 }}>
              <Text style={styles.perfilSubtitulo}>Dados Pessoais</Text>
              <View style={styles.perfilCard}>
                <TextInput style={styles.inputPerfil} placeholder="Nome Completo" value={nome} onChangeText={setNome} />
                <TextInput style={styles.inputPerfil} placeholder="Email de contato" value={email} onChangeText={setEmail} />
              </View>

              <Text style={styles.perfilSubtitulo}>Endereço de Entrega</Text>
              <View style={styles.perfilCard}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[styles.inputPerfil, { flex: 1, marginBottom: 10 }]}
                    placeholder="CEP"
                    value={cep}
                    maxLength={8}
                    keyboardType="numeric"
                    onChangeText={(t) => { setCep(t); buscarCEP(t); }}
                  />
                  <View style={styles.badgeCep}>
                    <Text style={{ color: '#FFA726', fontSize: 12, fontWeight: 'bold' }}>ViaCEP</Text>
                  </View>
                </View>

                <TextInput style={styles.inputPerfil} placeholder="Rua / Logradouro" value={rua} onChangeText={setRua} />
                <TextInput style={styles.inputPerfil} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TextInput style={[styles.inputPerfil, { flex: 2 }]} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
                  <TextInput style={[styles.inputPerfil, { flex: 1 }]} placeholder="UF" value={estado} onChangeText={setEstado} autoCapitalize="characters" maxLength={2} />
                </View>
              </View>

              {/* Aciona a função que salva no Firebase */}
              <TouchableOpacity style={styles.botaoSalvarPerfil} onPress={salvarPerfilNoFirebase}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.textoFinalizar}>Salvar Alterações</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoSairPerfil} onPress={fazerLogout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.textoFinalizar}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ANIMAÇÃO DA IMAGEM VOANDO */}
      {imagemAnimada && (
        <Animated.Image
          source={imagemAnimada}
          style={[styles.flyingImage, { opacity, transform: [{ translateX: animX }, { translateY: animY }, { scale: scale }] }]}
        />
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setTela('home')}>
          <Ionicons name={tela === 'home' ? "restaurant" : "restaurant-outline"} size={22} color={tela === 'home' ? '#FFA726' : '#777'} />
          <Text style={[styles.navText, tela === 'home' && styles.navTextActive]}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setTela('pedidos')}>
          <Ionicons name={tela === 'pedidos' ? "receipt" : "receipt-outline"} size={22} color={tela === 'pedidos' ? '#FFA726' : '#777'} />
          <Text style={[styles.navText, tela === 'pedidos' && styles.navTextActive]}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setTela('delivery')}>
          <Ionicons name={tela === 'delivery' ? "bicycle" : "bicycle-outline"} size={24} color={tela === 'delivery' ? '#FFA726' : '#777'} />
          <Text style={[styles.navText, tela === 'delivery' && styles.navTextActive]}>Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setTela('carrinhoAba')}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={{ position: 'relative' }}>
              <Ionicons name={tela === 'carrinhoAba' ? "cart" : "cart-outline"} size={24} color={tela === 'carrinhoAba' ? '#FFA726' : '#777'} />
              {carrinho.length > 0 && <Text style={styles.badgeCarrinho}>{carrinho.length}</Text>}
            </View>
          </Animated.View>
          <Text style={[styles.navText, tela === 'carrinhoAba' && styles.navTextActive]}>Carrinho</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setTela('perfil')}>
          <Ionicons name={tela === 'perfil' ? "person" : "person-outline"} size={22} color={tela === 'perfil' ? '#FFA726' : '#777'} />
          <Text style={[styles.navText, tela === 'perfil' && styles.navTextActive]}>Perfil</Text>
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
    marginTop: 5,
    fontSize: 13,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  bannerContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: 160,
  },
  sectionTitle: {
    marginLeft: 15,
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryItem: {
    alignItems: 'center',
    margin: 10,
    width: 65,
  },
  categoryImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#FFA726',
    borderColor: '#FFA726',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardDesc: {
    color: '#777',
    fontSize: 12,
    marginVertical: 2,
  },
  cardPrice: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFA726',
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCarrinho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  divisor: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  botaoFinalizar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  textoFinalizar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputLogin: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 5, 
    overflow: 'hidden', 
  },
  flyingImage: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    width: 60,
    height: 60,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingBottom: 38, 
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
  navTextActive: {
    color: '#FFA726',
    fontWeight: 'bold',
  },
  badgeCarrinho: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: 'red',
    color: '#fff',
    borderRadius: 9,
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 18,
  },
  perfilHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  perfilNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  perfilEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  perfilSubtitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 8,
    marginLeft: 5,
  },
  perfilCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 10,
  },
  inputPerfil: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
  },
  badgeCep: {
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 35,
    alignSelf: 'center',
  },
  botaoSalvarPerfil: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoSairPerfil: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,   
    marginTop: 25,    
  },
  loginLogo: {
    width: 340,
    height: 220,
  },
  deliveryStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  statusTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statusLine: {
    width: 2,
    height: 30,
    marginLeft: 5,
    marginVertical: 4,
  },
});