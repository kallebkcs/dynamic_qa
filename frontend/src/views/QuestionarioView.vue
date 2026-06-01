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
const respostas = ref({})
const pesoAcumulado = ref(0) // Para blocos do tipo "peso"

// Modal de Resultado
const mostrarResultado = ref(false)
const textoResultado = ref('')
const tipoResultado = ref('') // 'positivo' ou 'negativo'

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
const redirecionador = (config) => {
  // Pegamos o objeto 'proximo' da configuração
  const destino = config.proximo;

  // CASO A: Próxima Pergunta (String simples) 
  if (typeof destino === 'string') {
    idPerguntaAtiva.value = destino;
    return;
  }

  // CASO B: Objeto (Fim de Bloco ou Fim de Questionário) 
  if (typeof destino === 'object' && destino !== null) {
    
    // CASO B.1: Fim de Questionário (Objeto dentro de Objeto com 'diagnostico')
    if (typeof destino.proximo === 'object' && destino.proximo.diagnostico) {
      textoResultado.value = destino.proximo.diagnostico
      tipoResultado.value = destino.proximo.diagnostico.toLowerCase().includes('positivo') ? 'positivo' : 'negativo'
      mostrarResultado.value = true
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
  // Primeiramente, trata o tipo equação, que será o único diferente
  if (pergunta.tipo === "equacao") configEfetiva = configEfetiva.condicional;

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
      console.log("TERMO PARA BUSCA: ", termoParaBusca)
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

  // CASO: Perguntas Numéricas
  if (pergunta.tipo === 'numerico' || pergunta.tipo === 'calculoPeso' || pergunta.tipo === 'equacao') {
    // Escolhe o valor: ou o digitado no input, ou o acumulado do bloco de peso
    let valorParaComparar;
    switch (pergunta.tipo) {
      case 'numerico':
        valorParaComparar = respostas.value[pergunta.idInterno];
        break;
      case 'calculoPeso':
        valorParaComparar = pesoAcumulado.value;
        break;
      case 'equacao':
        valorParaComparar = calcularEquacao(pergunta);
        break;
    }
    console.log(valorParaComparar)  

    const atendeRegra = (configEfetiva.regra === 'maior_que')
      ? valorParaComparar > configEfetiva.limiar
      : valorParaComparar < configEfetiva.limiar;
    console.log("VALOR PARA COMPARAR: ", valorParaComparar, " ATENDE REGRA? ", atendeRegra, configEfetiva)
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

  // Com o destino resolvido, chamamos o Redirecionador
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
/////// EQUAÇÕES /////////////////////////////////////
/////////////////////////////////////////////////////
import evaluatex from 'evaluatex';

const calcularEquacao = (pergunta) => {
  const config = pergunta.configuracao;
  const valoresParaCalculo = {};

  // 1. Mapeamos os IDs Internos para os símbolos da fórmula (P, h, S...)
  config.variaveis.forEach(v => {
    let valorFinal;
    const respostaBruta = respostas.value[v.idInterno];
    console.log("RESPOSTA BRUTA: ", respostaBruta)

    // Se a variável tem opções (ex: Masculino = 1), mapeamos o valor
    if (v.opcoes && v.opcoes.length > 0) {
      const opcaoResposta = respostaBruta.opcao;
      const opcaoEncontrada = v.opcoes.find(o => o.opcao === opcaoResposta);
      valorFinal = opcaoEncontrada ? opcaoEncontrada.valor : 0;
    } else {
      // Se for apenas um número (Peso, Idade), usamos direto
      valorFinal = Number(respostaBruta);
    }

    valoresParaCalculo[v.variavel] = valorFinal;
  });

  try {
    const fn = evaluatex(config.equacao);
    const resultado = fn(valoresParaCalculo);
    
    return resultado.toFixed(2);
  } catch (err) {
    console.error("Erro na equação:", err);
    return;
  }
};

// Função para renderizar o LaTeX para HTML
const renderizarFormula = (formula) => {
  try {
    // katex é global por causa do script no index.html
    return window.katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true // Deixa a fórmula centralizada e maior
    });
  } catch (err) {
    return formula;
  }
};

// Função auxiliar para pegar o valor real que será usado
const obterValorVariavel = (v) => {
  let respostaBruta = respostas.value[v.idInterno];
  console.log("VAR ", respostaBruta)
  if (v.opcoes && v.opcoes.length > 0) {
    respostaBruta = respostaBruta.opcao;
    const opt = v.opcoes.find(o => o.opcao === respostaBruta);
    console.log("OPCOES ", v.opcoes)
    console.log("OPT ", opt)
    return opt ? opt.valor : 0;
  }
  return respostaBruta || 0;
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

      <div v-if="pergunta.tipo === 'equacao'" class="container-equacao">
      <div class="quadro-formula" v-html="renderizarFormula(pergunta.configuracao.equacao)"></div>

      <div class="detalhes-calculo">
        <h4>Valores das Variáveis:</h4>
        <table class="tabela-variaveis">
          <thead>
            <tr>
              <th>Símbolo</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in pergunta.configuracao.variaveis" :key="v.variavel">
              <td class="simbolo">{{ v.variavel }}</td>
              <td>{{ v.idInterno.replace('idp_', '').toUpperCase() }}</td>
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

  <!-- MODAL DE RESULTADO -->
  <div v-if="mostrarResultado" class="modal-overlay">
    <div class="modal-resultado" :class="tipoResultado">
      <div class="icone-resultado">
        <span v-if="tipoResultado === 'positivo'">✓</span>
        <span v-else>✕</span>
      </div>
      <h1 class="titulo-resultado">
        {{ tipoResultado === 'positivo' ? 'POSITIVO' : 'NEGATIVO' }}
      </h1>
      <p class="texto-resultado">{{ textoResultado }}</p>
      <button @click="mostrarResultado = false" class="btn-fechar">OK</button>
    </div>
  </div>
</main>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.visualizer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

header {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  text-align: center;
  animation: slideDown 0.6s ease-out;
}

header h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

header p {
  color: #555;
  font-size: 1.1em;
  font-weight: 500;
}

.container-perguntas {
  max-width: 700px;
  margin: 0 auto;
}

.card-pergunta {
  background: white;
  padding: 35px;
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  animation: fadeInUp 0.6s ease-out;
  border-left: 5px solid #667eea;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-pergunta:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.escopo {
  display: block;
  color: #667eea;
  font-weight: 600;
  font-size: 0.95em;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* INPUTS DE TEXTO E NÚMERO */
input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background-color: #f8f9ff;
}

/* OPÇÕES RADIO */
.lista-opcoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opcao-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.opcao-item:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.opcao-item input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: #667eea;
}

.opcao-item label {
  cursor: pointer;
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
}

/* CAMPO IDENTIFICAÇÃO */
.campo-identificacao {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.campo-identificacao label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 0.95em;
}

/* RESULTADO PESO */
.resultado-peso {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #667eea;
}

.resultado-peso p {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 12px;
}

.valor-destaque {
  font-size: 2.5em;
  font-weight: 700;
  color: #667eea;
  padding: 15px 0;
}

/* EQUAÇÕES */
.container-equacao {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 30px;
  border-radius: 12px;
  margin-top: 20px;
}

.quadro-formula {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  border: 2px solid #e0e0e0;
  text-align: center;
  font-size: 1.1em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.detalhes-calculo h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.tabela-variaveis {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.95em;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tabela-variaveis thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tabela-variaveis th {
  padding: 14px;
  text-align: center;
  font-weight: 600;
}

.tabela-variaveis td {
  padding: 12px 14px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.tabela-variaveis tbody tr:hover {
  background-color: #f8f9ff;
  transition: background-color 0.3s ease;
}

.simbolo {
  font-weight: 700;
  color: #667eea;
  font-family: 'Times New Roman', serif;
  font-size: 1.1em;
}

.valor-num {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #764ba2;
}

.resultado-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.resultado-box span:first-child {
  color: #2c3e50;
  font-weight: 600;
}

.resultado-valor {
  font-size: 1.8em;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* BOTÃO NAVEGAÇÃO */
.acoes-navegacao {
  display: flex;
  gap: 12px;
  margin-top: 35px;
  justify-content: center;
}

.btn-principal {
  padding: 15px 50px;
  font-size: 1.05em;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-principal:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

.btn-principal:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-principal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ANIMAÇÕES */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .visualizer {
    padding: 20px 15px;
  }

  header {
    padding: 30px 20px;
    margin-bottom: 25px;
  }

  header h1 {
    font-size: 1.8em;
  }

  header p {
    font-size: 1em;
  }

  .card-pergunta {
    padding: 25px;
    margin-bottom: 20px;
  }

  .btn-principal {
    padding: 12px 30px;
    font-size: 0.95em;
    width: 100%;
  }

  .resultado-box {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* MODAL DE RESULTADO */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(5px);
}

.modal-resultado {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 4px solid;
}

.modal-resultado.positivo {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.modal-resultado.negativo {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.icone-resultado {
  font-size: 80px;
  margin-bottom: 20px;
  font-weight: 900;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-resultado.positivo .icone-resultado {
  color: #10b981;
}

.modal-resultado.negativo .icone-resultado {
  color: #ef4444;
}

.titulo-resultado {
  font-size: 3.5em;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.modal-resultado.positivo .titulo-resultado {
  color: #047857;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-resultado.negativo .titulo-resultado {
  color: #991b1b;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.texto-resultado {
  font-size: 1.3em;
  color: #374151;
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 500;
}

.btn-fechar {
  padding: 18px 60px;
  font-size: 1.2em;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-resultado.positivo .btn-fechar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.modal-resultado.positivo .btn-fechar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.modal-resultado.negativo .btn-fechar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.modal-resultado.negativo .btn-fechar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 600px) {
  .modal-resultado {
    padding: 40px 25px;
  }

  .icone-resultado {
    font-size: 60px;
  }

  .titulo-resultado {
    font-size: 2.5em;
  }

  .texto-resultado {
    font-size: 1.1em;
  }

  .btn-fechar {
    padding: 14px 40px;
    font-size: 1em;
    width: 100%;
  }
}
</style>