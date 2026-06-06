<template>
  <div v-if="pergunta.configuracao[0]" class="equacao-box">
    <div class="campo">
        <label>Equação (Em LaTeX):</label>
        <input required rows=3 v-model="pergunta.equacao" type="text" placeholder="\frac{a}{b} + c"/>
        <small style="color: #666;">OBS: para multiplicações, utilize espaço, asterisco ou \cdot.</small>
        <div 
        class="katex-preview-box" 
        v-html="renderizarPreviewKaTeX(pergunta.equacao)"
        ></div>
    </div>

    <div class="campo">
      <h4>Variáveis da Equação</h4>
      <small style="color: #666;">Vincule o símbolo do LaTeX com o identificador da pergunta.</small>
      <div v-for="(variavel, varIdx) in pergunta.variaveis" :key="varIdx" class="variavel-item">
          <div style="margin-bottom: 1rem;">
          <label>Identificador:</label>
          <select required v-model="variavel.uid" style="flex-grow: 1;">
              <option value="" disabled>-- Selecione a origem do dado --</option>
              <option v-for="p in perguntasParaMapear" :key="p.uid" :value="p.uid">
              {{ p.label }} ({{ p.idInterno }})
              </option>
          </select>
          <label>Símbolo:</label>
          <input required v-model="variavel.variavel" type="text" placeholder="x"/>
          <button class="danger" @click="removerVariavel(varIdx)">Excluir variável</button>

          <div v-if="obterOpcoesDaVariavel(variavel.uid)">
              <label>Valores das opções:</label>
              <div v-for="(op, opIdx) in obterOpcoesDaVariavel(variavel.uid)">
                  <label>{{ op.opcao }}:</label>
                  <input required type="number" step="any" v-model.number="variavel.mapeamento[op.opcao]" placeholder="Valor"/>
              </div>
          </div>
        </div>
      </div>
      <button @click="adicionarVariavel()">+ Adicionar variável</button>
    </div>
      
    <h4>Condicional de resultado:</h4>
    <TipoNumerico 
        v-if="pergunta.configuracao[0]"
        :pergunta="pergunta"
        :tipoLogica="tipoLogica"
        :perguntasDoBloco="perguntasDoBloco"
        :blocosDisponiveis="blocosDisponiveis"
        :contexto=contexto
        :uidPerguntaAtual="uidPerguntaAtual"
        :uidBlocoAtual="uidBlocoAtual"
        @criar-pergunta="(id) => $emit('criar-pergunta', id)"
        @criar-bloco="(id) => $emit('criar-bloco', id)"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import TipoNumerico from './TipoNumerico.vue';

const props = defineProps({
  pergunta: {
    type: Object,
    required: true
  },
  tipoLogica: { type: String, required: true },
  perguntasDoBloco: { type: Array, default: () => [] },
  blocosDisponiveis: { type: Array, default: () => [] },
  contexto: {type: String, default: ""},
  uidPerguntaAtual: {type: String, required: true},
  uidBlocoAtual: {type: String, required: true}
});

const perguntasParaMapear = computed(() => {
  const lista = [];
  props.blocosDisponiveis.forEach(bloco => {
    if (bloco.tipo !== 'identificacao') return; 

    bloco.perguntas.forEach(p => {
      if (p.tipo !== 'texto'){
        lista.push({
            uid: p.uid,
            idInterno: p.idInterno,
            label: p.escopo || p.idInterno, // Mostra o escopo se tiver, senão o ID
            opcoes: (p.tipo === 'escolha_unica') ? p.configuracao : []
        });
      }
    });
  });
  return lista;
});

const renderizarPreviewKaTeX = (formula) => {
  if (!formula || !formula.trim()) {
    return '<span style="color: gray; font-size: 0.9em;">A prévia aparecerá aqui...</span>';
  }
  
  try {
    return window.katex.renderToString(formula, {
      throwOnError: true, 
      displayMode: true
    });
  } catch (err) {
    // Se a sintaxe estiver incompleta durante a digitação, mostra o erro em vermelhozinho
    return `<span style="color: #ff4444; font-size: 0.8em;">Escrevendo: ${err.message.replace("KaTeX parse error: ", "")}</span>`;
  }
};

const obterOpcoesDaVariavel = (uidSelecionado) => {
  const pergunta = perguntasParaMapear.value.find(p => p.uid === uidSelecionado);
  return pergunta && pergunta.opcoes.length > 0 ? pergunta.opcoes : null;
};

const adicionarVariavel = () => {
  if (!props.pergunta.variaveis) {
    props.pergunta.variaveis = [];
  }
  props.pergunta.variaveis.push({
    uid: "",
    variavel: "",
    mapeamento: {}
  });
};

const removerVariavel = (varIdx) => {
  props.pergunta.variaveis.splice(varIdx, 1);
};

const emit = defineEmits(['criar-pergunta', 'criar-bloco']);
</script>