<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Dados Brutos
const questionario = ref(null)
const carregando = ref(true)

// Localização
const idBlocoAtivo = ref(null)
const idPerguntaAtiva = ref(null)

// Memória do Questionário
const respostas = ref({}) // { idPergunta: valor }
const pesoAcumulado = ref(0) // Para blocos do tipo "peso"

// Getters
const blocoAtual = computed(() => 
  questionario.value?.blocos.find(b => b.idInterno === idBlocoAtivo.value)
)

const perguntaAtual = computed(() => 
  blocoAtual.value?.perguntas.find(p => p.idInterno === idPerguntaAtiva.value)
)

// Lógica de carregamento de dados
const carregarDados = async () => {
  try {
    // Busca o questionário específico pelo ID da URL
    const response = await fetch(`http://localhost:3000/api/questionarios/${route.params.id}`)
    const dados = await response.json()
    
    questionario.value = dados

    // Define o bloco inicial conforme definido no questionário 
    idBlocoAtivo.value = dados.primeiro 
    
    // Define a pergunta inicial conforme definido no bloco
    if (blocoAtual.value) {
      idPerguntaAtiva.value = blocoAtual.value.primeiro
    }

  } catch (error) {
    console.error("Erro ao carregar o questionário:", error)
  } finally {
    carregando.value = false
  }
}

// Redirecionador
const redirecionador = (configuracaoDaResposta) => {
  // Pegamos o objeto 'proximo' da configuração
  const destino = configuracaoDaResposta.proximo;

  // CASO A: Próxima Pergunta (String simples) 
  if (typeof destino === 'string') {
    idPerguntaAtiva.value = destino;
    return;
  }

  // CASO B: Objeto (Fim de Bloco ou Fim de Questionário) 
  if (typeof destino === 'object' && destino !== null) {
    
    // CASO B.1: Fim de Questionário (Objeto dentro de Objeto com 'diagnostico')
    if (typeof destino.proximo === 'object' && destino.proximo.diagnostico) {
      alert(destino.proximo.diagnostico)//finalizarQuestionario(destino.proximo.diagnostico);
      return;
    }

    // CASO B.2: Fim de Bloco (Objeto com 'proximo' apontando para ID de bloco)
    if (typeof destino.proximo === 'string') {
      idBlocoAtivo.value = destino.proximo;
      
      // Ao trocar o bloco, precisamos resetar para a primeira pergunta do novo bloco
      if (blocoAtual.value) {
        idPerguntaAtiva.value = blocoAtual.value.primeiro;
      }
      return;
    }
  }

  console.error("Caminho de navegação não identificado para:", destino);
};

const resolverLogica = (pergunta) => {
  // Começamos com a configuração bruta do banco de dados
  let configEfetiva = pergunta.configuracao; 

  // CONTEXTO: Se a pergunta depende de uma resposta anterior
  if (pergunta.contexto) {
    // Buscamos a pergunta que serve de contexto para saber o TIPO dela
    const perguntaContexto = questionario.value.blocos
        .find(b => b.idInterno === "idp").perguntas
        .find(p => p.idInterno === pergunta.contexto);
    console.log("PERGUNTA CONTEXTO: ", perguntaContexto) 

    const valorContexto = respostas.value[pergunta.contexto];
    console.log("VALOR CONTEXTO: ", valorContexto)

    if (perguntaContexto.tipo === 'escolha_unica') {
      console.log("CONFIG EFETIVA PRÉ FILTRO: ", configEfetiva)
      const termoParaBusca = typeof valorContexto === 'object' ? valorContexto.opcao : valorContexto;
      const itemConfig = configEfetiva.find(c => c.opcao === termoParaBusca);
      configEfetiva = itemConfig?.escolhido || configEfetiva;
      console.log("CONFIG EFETIVA PÓS FILTRO: ", configEfetiva)
    } 
    else if (perguntaContexto.tipo === 'numerico') {
      // TODO: TESTAR
      const itemConfig = configEfetiva.find(c => avaliarRegra(c, valorContexto));
      configEfetiva = itemConfig?.escolhido || configEfetiva;
    }
  }
  let logicaFinal = null;

  // CASO: Perguntas Numéricas ou Cálculo de Peso
  if (pergunta.tipo === 'numerico' || pergunta.tipo === 'calculoPeso') {
    // Escolhe o valor: ou o digitado no input, ou o acumulado do bloco de peso
    const valorParaComparar = (pergunta.tipo === 'calculoPeso') 
      ? pesoAcumulado.value 
      : respostas.value[pergunta.idInterno];

    const atendeRegra = (configEfetiva.regra === 'maior_que')
      ? valorParaComparar > configEfetiva.limiar
      : valorParaComparar < configEfetiva.limiar;
    console.log(valorParaComparar, atendeRegra, configEfetiva)
    logicaFinal = atendeRegra ? configEfetiva.verdadeiro : configEfetiva.falso;
  } 
  
  // CASO: Escolha Única
  else if (pergunta.tipo === 'escolha_unica') {
    const opcaoSelecionada = respostas.value[pergunta.idInterno];
    logicaFinal = opcaoSelecionada.escolhido || opcaoSelecionada;
  }

  // Se a lógica da pergunta for 'peso', somamos o valor ao totalizador
  if (pergunta.logica === 'peso' && logicaFinal?.peso !== undefined) {
    pesoAcumulado.value += logicaFinal.peso;
    console.log(`Peso somado! Total agora: ${pesoAcumulado.value}`);
  }

  // Retornamos apenas o pedaço que contém o atributo 'proximo' para o redirecionador
  console.log(logicaFinal)
  return logicaFinal;
};

const proximoPasso = () => {
  let logicaParaRedirecionar = null;

  // CASO 1: Bloco de Identificação (Várias perguntas na tela) 
  if (blocoAtual.value?.tipo === 'identificacao') {
    // Procuramos qual pergunta deste bloco contém a "saída" (o objeto proximo)
    const perguntaDeSaida = blocoAtual.value.perguntas.find(p => 
      typeof p.configuracao.proximo === 'object'
    );
    logicaParaRedirecionar = perguntaDeSaida.configuracao;
  } 
  
  // CASO 2: Perguntas Individuais (Fluxo normal)
  else if (perguntaAtual.value) {
    logicaParaRedirecionar = resolverLogica(perguntaAtual.value);
  }

  // Com o destino resolvido, chamamos o seu Redirecionador
  if (logicaParaRedirecionar) {
    redirecionador(logicaParaRedirecionar);
  }
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
  const valor = respostas.value[pergunta.idInterno];

  // Regras baseadas no tipo da pergunta [cite: 13, 14, 15]
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
      return true; // Sempre válida, pois é automática [cite: 10]
    default:
      return !!valor;
  }
};

const podeAvancar = computed(() => {
  if (perguntasExibidas.value.length === 0) return false;
  
  // O método every() garante que só retorne true se todas passarem no teste
  return perguntasExibidas.value.every(pergunta => {
    if (pergunta.tipo === 'calculoPeso') return true; else return estaRespondida(pergunta);});
});

const avancarPergunta = (configuracaoDaOpcao) => {
  // Extraímos os dados da lógica (peso e proximo)
  const infoLogica = configuracaoDaOpcao.escolhido || configuracaoDaOpcao;

  // Se lógica peso, some o peso
  if (perguntaAtual.value.logica === 'peso' && infoLogica.peso !== undefined) {
    pesoAcumulado.value += infoLogica.peso;
    console.log(`Peso acumulado no bloco: ${pesoAcumulado.value}`);
  }

  // Chamar o motor de navegação para decidir o próximo passo
  processarNavegacao(infoLogica);
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
             v-model="respostas[pergunta.idInterno]" />

      <input v-else-if="pergunta.tipo === 'numerico'" 
             type="number" 
             v-model.number="respostas[pergunta.idInterno]" />

      <div v-else-if="pergunta.tipo === 'escolha_unica'" class="lista-opcoes">
        <div v-for="opt in pergunta.configuracao" :key="opt.opcao" class="opcao-item">
          <input type="radio" 
                 :id="pergunta.idInterno + opt.opcao" 
                 :value="opt" 
                 v-model="respostas[pergunta.idInterno]" />
          <label :for="pergunta.idInterno + opt.opcao">{{ opt.opcao }}</label>
        </div>
      </div>

      <div v-else-if="pergunta.tipo === 'calculoPeso'" class="resultado-peso">
        <p>O peso acumulado foi:</p>
        <div class="valor-destaque">{{ pesoAcumulado }}</div>
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
</style>