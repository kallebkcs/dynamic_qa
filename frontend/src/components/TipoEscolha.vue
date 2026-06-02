<template>
<div>
    <h4>Opções</h4>
    <div v-for="(opcao, opIdx) in pergunta.configuracao" :key="opIdx" class="opcao">
      <label>Opção:</label>
      <input v-model="opcao.opcao" type="text" placeholder="Opção"/>
      <div v-if="tipoLogica === 'comum'">
        <BlocoLogica 
          v-if="opcao.escolhido"
          :destino="opcao.escolhido"
          :tipoLogica="tipoLogica"
          :perguntasDoBloco="perguntasDoBloco"
          :blocosDisponiveis="blocosDisponiveis"
          :uidPerguntaAtual="uidPerguntaAtual"
          :uidBlocoAtual="uidBlocoAtual"
          @criar-pergunta="(id) => $emit('criar-pergunta', id)"
          @criar-bloco="(id) => $emit('criar-bloco', id)"
        />
      </div>
      <div v-else-if="tipoLogica === 'peso'">
        <label>Peso:</label>
        <input type="number" v-model.number="opcao.escolhido.peso"/>
      </div>
      <button class="danger" @click="removerOpcao(opIdx)">Remover</button>
    </div>
    <button @click="adicionarOpcao">+ Adicionar opção</button>
    <div v-if="tipoLogica !== 'comum'">
      <BlocoLogica 
          :destino="pergunta"
          :tipoLogica="tipoLogica"
          :perguntasDoBloco="perguntasDoBloco"
          :blocosDisponiveis="blocosDisponiveis"
          :uidPerguntaAtual="uidPerguntaAtual"
          :uidBlocoAtual="uidBlocoAtual"
          @criar-pergunta="(id) => $emit('criar-pergunta', id)"
          @criar-bloco="(id) => $emit('criar-bloco', id)"
        />
    </div>
</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import BlocoLogica from './BlocoLogica.vue';

const props = defineProps({
  pergunta: {
    type: Object,
    required: true
  },
  tipoLogica: { type: String, required: true },
  perguntasDoBloco: { type: Array, default: () => [] },
  blocosDisponiveis: { type: Array, default: () => [] },
  uidPerguntaAtual: {type: String, required: true},
  uidBlocoAtual: {type: String, required: true}
});

const emit = defineEmits(['criar-pergunta', 'criar-bloco']);

const adicionarOpcao = () => {
  const novaOpcao = { opcao: "" };
  if (props.tipoLogica === 'comum') {
    novaOpcao.escolhido = { proximo: "" };
  } 
  else if (props.tipoLogica === 'peso') {
    novaOpcao.escolhido = { peso: 0}; 
  }
  props.pergunta.configuracao.push(novaOpcao)
};

const removerOpcao = (opcaoIndex) => {
  props.pergunta.configuracao.splice(opcaoIndex, 1);
};
</script>