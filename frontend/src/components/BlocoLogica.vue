<template>
  <div class="bloco-logica">
    <div class="campo-logica">
      <label>Próxima Pergunta:</label>
      <select v-model="tipoDestino">
        <option value="" disabled>-- Selecione o rumo --</option>
        <template v-if="!ehCalculoPeso">
          <option value="pergunta_existente">Ir para Pergunta Existente</option>
          <option value="nova_pergunta">Criar Nova Pergunta</option>
          <option v-if="tipoLogica !== 'peso'" value="fim_bloco">Fim do Bloco...</option>
          <option v-if="tipoLogica === 'peso'" value="ir_calc_peso">Ir para Avaliação de Peso</option>
        </template>
        <template v-else>
          <option value="fim_bloco">Sair do Bloco</option>
        </template>
      </select>
    </div>

    <div v-if="tipoDestino === 'ir_calc_peso'" class="ramo">
      <span style="color: #666; font-style: italic; font-size: 0.9em;">↳ O fluxo passará para a balança de decisão no fim deste bloco.</span>
    </div>

    <div v-if="tipoDestino === 'pergunta_existente'" class="ramo">
      <select v-model="destino.proximo">
        <option v-for="p in perguntasDoBloco.filter(p => p.uid !== uidPerguntaAtual)" :key="p.uid" :value="p.uid">
          {{ p.idInterno }}
        </option>
      </select>
    </div>

    <div v-if="tipoDestino === 'nova_pergunta'" class="ramo">
      <input v-model="idNovaPergunta" placeholder="Identificador da nova pergunta" />
      <small style="color: #666;">Apenas letras, números e underscore (_).</small>
      <button @click="criarPergunta">Criar Pergunta</button>
    </div>

    <div v-if="tipoDestino === 'fim_bloco'" class="ramo">
      <label>O que acontece após este bloco?</label>
      <select v-model="acaoFimBloco">
        <option value="bloco_existente">Ir para Bloco Existente</option>
        <option value="novo_bloco">Criar Novo Bloco</option>
        <option value="fim_questionario">Finalizar (Diagnóstico)</option>
      </select>

      <div v-if="acaoFimBloco === 'bloco_existente'" class="sub-ramo">
        <select v-model="destino.proximo.proximo">
          <option v-for="b in blocosDisponiveis.filter(b => b.uid !== uidBlocoAtual && b.tipo !== 'identificacao')" :key="b.uid" :value="b.uid">
             {{ b.idInterno }}
          </option>
        </select>
      </div>

      <div v-if="acaoFimBloco === 'novo_bloco'" class="sub-ramo">
         <input v-model="idNovoBloco" placeholder="Identificador do novo bloco" />
         <small style="color: #666;">Apenas letras, números e underscore (_).</small>
         <button @click="criarBloco">Criar Bloco</button>
      </div>

      <div v-if="acaoFimBloco === 'fim_questionario'" class="sub-ramo">
        <label>Diagnóstico do Paciente:</label>
        <input v-model="destino.proximo.proximo.diagnostico" type="text"/>
      </div>
    </div>


  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, onMounted, nextTick, ref, watch } from 'vue';

const props = defineProps({
  destino: {
    type: Object,
    required: true
  },
  perguntasDoBloco: {
    type: Array,
    default: () => []
  },
  blocosDisponiveis: {
    type: Array,
    default: () => []
  },
  tipoLogica: {
    type: String,
    required: true
  },
  uidPerguntaAtual: { type: String, required: true },
  uidBlocoAtual: {type: String, required: true}
});

// Pode-se selecionar a opção de criar perguntas/blocos, o emit vai mandar o id destes novos objetos
// para o arquivo principal.
const emits = defineEmits([
    'criar-pergunta',
    'criar-bloco'
])

// Estados internos
const tipoDestino = ref(''); // pergunta_existente, nova_pergunta, fim_bloco
const acaoFimBloco = ref(''); // bloco_existente, novo_bloco, fim_questionario
// Modelos para input de criação
const idNovaPergunta = ref('');
const idNovoBloco = ref('');

const ehCalculoPeso = computed(() => {
  return props.uidPerguntaAtual && props.uidPerguntaAtual.startsWith('calc_');
});


// On Mounted para preencher os blocos iniciais
const preencherInicial = () => {
  const prox = props.destino?.proximo;
  if (!prox) {
    // Se for cálculo de peso, tem que finalizar o bloco
    if (ehCalculoPeso.value) tipoDestino.value = 'fim_bloco';
    return; 
  };

  if (typeof prox === 'string') {
    if (prox === 'calculoPeso') {
      tipoDestino.value = 'ir_calc_peso';
    } else {
      tipoDestino.value = 'pergunta_existente';
    }
  } else if (typeof prox === 'object') {
    // Se é um objeto, é porque sai do bloco
    tipoDestino.value = 'fim_bloco';
    
    // Checa se dentro desse objeto tem outro objeto (diagnóstico) ou string (bloco)
    if (typeof prox.proximo === 'object' && prox.proximo !== null && 'diagnostico' in prox.proximo) {
      acaoFimBloco.value = 'fim_questionario';
    } else {
      acaoFimBloco.value = 'bloco_existente';
    }
  }
};

onMounted(() => {
  preencherInicial();
});

const criarPergunta = async () => {
  if (!idNovaPergunta.value) return;

  const novoId = idNovaPergunta.value;
  emits('criar-pergunta', novoId);
  await nextTick();
  const perguntaCriada = props.perguntasDoBloco.find(p => p.idInterno === novoId);
  
  if (perguntaCriada) {
    props.destino.proximo = perguntaCriada.uid;
  }
  tipoDestino.value = 'pergunta_existente';
  idNovaPergunta.value = '';
};

const criarBloco = async () => {
  if (!idNovoBloco.value) return;

  const novoId = idNovoBloco.value;
  emits('criar-bloco', novoId);
  await nextTick();
  const blocoCriado = props.blocosDisponiveis.find(b => b.idInterno === novoId);
  
  if (blocoCriado) {
    props.destino.proximo.proximo = blocoCriado.uid;
  }
  acaoFimBloco.value = 'bloco_existente';
  idNovoBloco.value = '';};

// Necessários por conta de proximo poder ser string ou objeto
watch(tipoDestino, (novoTipo) => {
  if (novoTipo === 'fim_bloco') {
    if (typeof props.destino.proximo !== 'object') {
      if (acaoFimBloco.value === 'fim_questionario') {
        props.destino.proximo = { proximo: { diagnostico: '' } };
      } else {
        props.destino.proximo = { proximo: '' }; 
      }
    }
  } else if (novoTipo === 'ir_calc_peso') {
    props.destino.proximo = 'calculoPeso';
  } else {
    if (typeof props.destino.proximo === 'object') {
      props.destino.proximo = '';
    }
  }
});

watch(acaoFimBloco, (novaAcao) => {
  if (tipoDestino.value !== 'fim_bloco') return;

  if (novaAcao === 'fim_questionario') {
    if (!(typeof props.destino.proximo === 'object' && typeof props.destino.proximo.proximo === 'object')) {
      props.destino.proximo = { proximo: { diagnostico: '' } };
    }
  } else if (novaAcao === 'bloco_existente' || novaAcao === 'novo_bloco') {
    if (typeof props.destino.proximo.proximo === 'object') {
      props.destino.proximo = { proximo: '' };
    }
  }
});
</script>

<style scoped>
/* O CSS isolado dele virá aqui */
</style>