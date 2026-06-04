<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute();
const router = useRouter();

// Dados Brutos
const questionario = ref(null);
const carregando = ref(true);

// Localização
const uidBlocoAtivo = ref(null);
const uidPerguntaAtiva = ref(null);

// Memória do Questionário
const respostas = ref({});
const pesoAcumulado = ref(0);

// Getters
const blocoAtual = computed(() => 
  questionario.value?.blocos.find(b => b.uid === uidBlocoAtivo.value)
);

const perguntaAtual = computed(() => 
  blocoAtual.value?.perguntas.find(p => p.uid === uidPerguntaAtiva.value)
);

// Lógica de carregamento de dados
const carregarDados = async () => {
  try {
    // Busca o questionário específico pelo ID da URL
    const response = await fetch(`http://localhost:3000/api/questionarios/${route.params.id}`);
    const dados = await response.json();
    
    questionario.value = dados;

    // Define o bloco inicial conforme definido no questionário 
    uidBlocoAtivo.value = dados.primeiro;

    // Define a pergunta inicial conforme definido no bloco
    if (blocoAtual.value) {
      uidPerguntaAtiva.value = blocoAtual.value.primeiro;
    }

  } catch (error) {
    console.error("Erro ao carregar o questionário:", error);
  } finally {
    carregando.value = false;
  }
}

// Redirecionador
const redirecionador = (destino) => {
  if (destino === 'calculoPeso') {
    const calc = blocoAtual.value.calculoPeso;
    let atendeRegra;

    switch (calc.regra) {
      case 'maior_que':
        atendeRegra = pesoAcumulado.value > calc.limiar;
        break;
      case 'menor_que':
        atendeRegra = pesoAcumulado.value < calc.limiar;
        break;
      default:
        atendeRegra = pesoAcumulado.value == calc.limiar; 
    }
    destino = atendeRegra ? calc.verdadeiro.proximo : calc.falso.proximo;
  }

  // se string, é o uid direto
  if (typeof destino === 'string') {
    uidPerguntaAtiva.value = destino;
    return;
  }
  // se objeto, vai para outro bloco ou finaliza questionário
  if (typeof destino === 'object' && destino !== null) {
    // Fim de questionário: paciente tem diagnóstico
    if (typeof destino.proximo === 'object' && destino.proximo.diagnostico) {
      alert("Diagnóstico: " + destino.proximo.diagnostico);//Finalizar questionário
      router.push('/');
      return;
    }

    // Pulo de Bloco: O proximo aponta para o UID do próximo bloco
    if (typeof destino.proximo === 'string') {
      uidBlocoAtivo.value = destino.proximo;
      
      if (blocoAtual.value) {
        uidPerguntaAtiva.value = blocoAtual.value.primeiro;
        pesoAcumulado.value = 0;
      }
      return;
    }
  }
  
  console.error("Caminho de navegação não identificado para:", destino);
};

const resolverLogica = (pergunta) => {
  let destinoFinal = null;
  const respostaDada = respostas.value[pergunta.uid]; 

  // --- PARTE A: SOMATÓRIA DE PESO (Apenas se o bloco for tipo 'peso') ---
  if (blocoAtual.value?.tipo === 'peso') {
    if (pergunta.tipo === 'escolha_unica') {
      // Nota: A semente nova tem "escolhido.peso", mas o nosso criador salva só "peso" direto. 
      // Aceitei os dois aqui pra não quebrar a sua semente gerada.
      const op = pergunta.configuracao.find(c => c.opcao === respostaDada?.opcao || c.opcao === respostaDada);
      const valorPeso = op?.peso ?? op?.escolhido?.peso ?? 0;
      pesoAcumulado.value += Number(valorPeso);
    } 
    else if (pergunta.tipo === 'numerico') {
      // Resolve limiar com dicionário de contexto (Uma maravilha comparado ao que era)
      let limiar = pergunta.configuracao.limiar;
      if (pergunta.contexto && typeof limiar === 'object') {
        const respContexto = respostas.value[pergunta.contexto];
        const chave = typeof respContexto === 'object' ? respContexto.opcao : respContexto;
        limiar = limiar[chave];
      }
      const atende = (pergunta.configuracao.regra === 'maior_que') 
        ? Number(respostaDada) > limiar 
        : Number(respostaDada) < limiar;
        
      const alvo = atende ? pergunta.configuracao.verdadeiro : pergunta.configuracao.falso;
      pesoAcumulado.value += Number(alvo?.peso ?? 0);
    }
  }

  // --- PARTE B: DEFINIÇÃO DA ROTA ---
  // Se a rota está fixa na raiz (Ex: Blocos de identificação e peso)
  if (pergunta.proximo) {
    destinoFinal = pergunta.proximo;
  } 
  // Se a rota está na opção escolhida (Bloco comum)
  else {
    if (pergunta.tipo === 'escolha_unica') {
      const op = pergunta.configuracao.find(c => c.opcao === respostaDada?.opcao || c.opcao === respostaDada);
      destinoFinal = op?.escolhido?.proximo ?? op?.proximo;
    } 
    else if (pergunta.tipo === 'numerico' || pergunta.tipo === 'equacao') {
      const valorAvaliado = (pergunta.tipo === 'equacao') ? calcularEquacao(pergunta) : respostaDada;
      
      let limiar = pergunta.configuracao.limiar;
      if (pergunta.contexto && typeof limiar === 'object') {
        const respContexto = respostas.value[pergunta.contexto];
        const chave = typeof respContexto === 'object' ? respContexto.opcao : respContexto;
        limiar = limiar[chave];
      }

      const atende = (pergunta.configuracao.regra === 'maior_que') 
        ? Number(valorAvaliado) > limiar 
        : Number(valorAvaliado) < limiar;

      const alvo = atende ? pergunta.configuracao.verdadeiro : pergunta.configuracao.falso;
      destinoFinal = alvo?.proximo;
    }
  }

  return destinoFinal;
};

const proximoPasso = () => {
  let destinoDoPasso = null;
  
  // CASO 1: Identificação mostra tudo de uma vez. Ignoramos as rotas internas e pegamos a pergunta que cospe o usuário pra fora do bloco.
  if (blocoAtual.value?.tipo === 'identificacao') {
    const perguntaDeSaida = blocoAtual.value.perguntas.find(p => typeof p.proximo === 'object');
    console.log(blocoAtual.value.perguntas);
    destinoDoPasso = perguntaDeSaida?.proximo;
  } 
  // CASO 2: Fluxo normal um por um
  else if (perguntaAtual.value) {
    destinoDoPasso = resolverLogica(perguntaAtual.value);
  }
  if (destinoDoPasso) redirecionador(destinoDoPasso);
};

const perguntasExibidas = computed(() => {
  // Se for identificação, mostra todas as perguntas do bloco 
  if (blocoAtual.value?.tipo === 'identificacao') {
    return blocoAtual.value.perguntas;
  }
  // Caso contrário, mostra apenas a pergunta ativa no fluxo
  return perguntaAtual.value ? [perguntaAtual.value] : [];
});

const estaRespondida = (pergunta) => {
  const valor = respostas.value[pergunta.uid];

  // Regras baseadas no tipo da pergunta
  switch (pergunta.tipo) {
    case 'texto':
      return valor !== undefined && valor.trim() !== '';
    case 'numerico':
      return typeof valor === 'number' && !isNaN(valor);
    case 'escolha_unica':
      return valor !== undefined && valor !== null;
    case 'escolha_multipla':
      return Array.isArray(valor) && valor.length > 0;
    case 'calculoPeso':
      return true; // Sempre válida, pois é automática
    default:
      return !!valor;
  }
};

const podeAvancar = computed(() => {
  if (perguntasExibidas.value.length === 0) return false;
  
  // O método every() garante que só retorne true se todas passarem no teste
  return perguntasExibidas.value.every(pergunta => {
    if (pergunta.tipo === 'calculoPeso' || pergunta.tipo === 'equacao') return true; else return estaRespondida(pergunta);});
});

///////////////////////////////////////////////////////
////////////////// EQUAÇÕES ///////////////////////////
///////////////////////////////////////////////////////
import evaluatex from 'evaluatex';

const calcularEquacao = (pergunta) => {
  const valoresParaCalculo = {};

  // Proteção básica para não quebrar se a estrutura não existir
  if (!pergunta.variaveis || !pergunta.equacao) return 0;

  pergunta.variaveis.forEach(v => {
    let valorFinal = 0;
    // Lemos a resposta pelo UID da variável
    const respostaBruta = respostas.value[v.uid];

    // Se a variável tem um mapeamento definido e ele não é vazio
    if (v.mapeamento && Object.keys(v.mapeamento).length > 0) {
      const chave = typeof respostaBruta === 'object' ? respostaBruta.opcao : respostaBruta;
      // Pega o valor no dicionário. Se não achar, assume 0 pra não dar NaN na fórmula
      valorFinal = v.mapeamento[chave] ?? 0;
    } else {
      // Se não tem mapeamento, é um input numérico direto
      valorFinal = Number(respostaBruta) || 0;
    }

    valoresParaCalculo[v.variavel] = valorFinal;
  });

  try {
    const fn = evaluatex(pergunta.equacao);
    const resultado = fn(valoresParaCalculo);
    return resultado.toFixed(2);
  } catch (err) {
    console.error("Erro na equação:", err);
    return "Erro";
  }
};

const obterValorVariavel = (v) => {
  let respostaBruta = respostas.value[v.uid];
  if (v.mapeamento && Object.keys(v.mapeamento).length > 0) {
    const chave = typeof respostaBruta === 'object' ? respostaBruta.opcao : respostaBruta;
    return v.mapeamento[chave] ?? 0;
  }
  return respostaBruta || 0;
};

// Caçador de IDs: transforma aquele UID feio no idInterno amigável para mostrar na tabela
const obterNomeVariavel = (uidBusca) => {
  for (const bloco of questionario.value.blocos) {
    const pEncontrada = bloco.perguntas.find(p => p.uid === uidBusca);
    if (pEncontrada) return pEncontrada.idInterno || pEncontrada.escopo;
  }
  return uidBusca; // Fallback caso o universo entre em colapso
};

const renderizarFormula = (formula) => {
  try {
    return window.katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    });
  } catch (err) {
    return formula;
  }
};

onMounted(carregarDados)
</script>

<template>
  <div v-if="carregando">Carregando questionário...</div>
  <main v-else-if="questionario" class="visualizer">
  <header v-if="blocoAtual">
    <h1>{{ questionario.titulo }}</h1>
    <p><strong>{{ blocoAtual.titulo }}</strong></p>
  </header>

  <section class="container-perguntas">
    <div v-for="pergunta in perguntasExibidas" :key="pergunta.idInterno" class="card-pergunta">
      <label class="escopo">{{ pergunta.escopo }}</label>

      <input v-if="pergunta.tipo === 'texto'" 
             type="text" 
             v-model="respostas[pergunta.uid]" />

      <input v-else-if="pergunta.tipo === 'numerico'" 
             type="number" 
             v-model.number="respostas[pergunta.uid]" />

      <div v-else-if="pergunta.tipo === 'escolha_unica'" class="lista-opcoes">
        <div v-for="opt in pergunta.configuracao" :key="opt.opcao" class="opcao-item">
          <input type="radio" 
                 :id="pergunta.idInterno + opt.opcao" 
                 :value="opt" 
                 v-model="respostas[pergunta.uid]" />
          <label :for="pergunta.idInterno + opt.opcao">{{ opt.opcao }}</label>
        </div>
      </div>

      <div v-else-if="pergunta.tipo === 'calculoPeso'" class="resultado-peso">
        <p>O peso acumulado foi:</p>
        <div class="valor-destaque">{{ pesoAcumulado }}</div>
      </div>

      <div v-if="pergunta.tipo === 'equacao'" class="container-equacao">
        <div class="quadro-formula" v-html="renderizarFormula(pergunta.equacao)"></div>

        <div class="detalhes-calculo">
          <h4>Valores das Variáveis:</h4>
          <table class="tabela-variaveis">
            <thead>
              <tr>
                <th>Símbolo</th>
                <th>Origem</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in pergunta.variaveis" :key="v.variavel">
                <td class="simbolo">{{ v.variavel }}</td>
                <td>{{ obterNomeVariavel(v.uid) }}</td>
                <td class="valor-num">{{ obterValorVariavel(v) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="resultado-box">
            <span>Resultado Calculado:</span>
            <span class="resultado-valor">{{ calcularEquacao(pergunta) }}</span>
          </div>
        </div>
      </div>
</div>

<div class="acoes-navegacao">
        <button 
            @click="proximoPasso" 
            :disabled="!podeAvancar" 
            class="btn-principal"
        >Confirmar  
        </button>
    </div>
  </section>
</main>
</template>

<style scoped>
.campo-identificacao { margin-bottom: 20px; display: flex; flex-direction: column; }
.campo-identificacao label { font-weight: bold; margin-bottom: 5px; }
.btn-continuar { margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #2c3e50; color: white; border: none; }

.tabela-variaveis {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.9em;
}

.tabela-variaveis th, .tabela-variaveis td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.simbolo { font-weight: bold; color: #2980b9; font-family: 'Times New Roman', serif; }
.valor-num { font-family: monospace; font-weight: bold; }

.resultado-valor {
    font-size: 1.4em;
  }
</style>