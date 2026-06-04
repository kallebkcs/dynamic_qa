<template>
  <div v-if="pergunta.configuracao[0]" class="tipo-numerico-container">
    <div v-if="tipoLogica !== 'identificacao'">
      <span>Se o valor for </span>
      <select v-model="pergunta.configuracao[0].regra">
          <option value="maior_que">maior que</option>
          <option value="menor_que">menor que</option>
          <option value="igual_a">igual a</option>
      </select>
      <div v-if="opcoesDoContexto">
        <div v-for="(op, idx) in opcoesDoContexto" :key="idx">
          <input
            required 
            type="number" 
            v-model.number="pergunta.configuracao[0].limiar[op.opcao]" 
            placeholder="valor" 
          />
          <span>(Para {{ op.opcao }})</span>
        </div>
      </div>
      <div v-else>
        <input required type="number" v-model.number="pergunta.configuracao[0].limiar" placeholder="valor"/>
      </div>
      <span>então:</span>
      <div class="verdadeiro">
        <div v-if="tipoLogica === 'comum'">
          <BlocoLogica
              :destino="pergunta.configuracao[0].verdadeiro"
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
          <input type="number" v-model.number="pergunta.configuracao[0].verdadeiro.peso"/>
        </div>
      </div>
      <span>Se não, então:</span>
      <div class="falso">
        <div v-if="tipoLogica === 'comum'">
          <BlocoLogica
              :destino="pergunta.configuracao[0].falso"
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
          <input required type="number" v-model.number="pergunta.configuracao[0].falso.peso"/>
        </div>
      </div>
    </div>
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
import { defineProps, defineEmits, computed, watch } from 'vue';
import BlocoLogica from './BlocoLogica.vue';

const props = defineProps({
  pergunta: {
    type: Object,
    required: true
  },
  tipoLogica: { type: String, required: true },
  contexto: {type: String, default: ""},
  perguntasDoBloco: { type: Array, default: () => [] },
  blocosDisponiveis: { type: Array, default: () => [] },
  uidPerguntaAtual: {type: String, required: true},
  uidBlocoAtual: {type: String, required: true}
} );

const opcoesDoContexto = computed(() => {
  if (!props.contexto) return null;
  
  const blocoIdentificacao = props.blocosDisponiveis.find(b => b.tipo === 'identificacao');
  if (!blocoIdentificacao) return null;

  const pergunta = blocoIdentificacao.perguntas.find(p => p.uid === props.contexto);
  if (pergunta && pergunta.tipo === 'escolha_unica') {
    return pergunta.configuracao; 
  }
  return null;
});

watch(opcoesDoContexto, (novasOpcoes) => {
  if (novasOpcoes && novasOpcoes.length > 0) {
    // Se ganhou contexto, transforma o limiar em dicionário
    if (typeof props.pergunta.configuracao[0].limiar !== 'object' || props.pergunta.configuracao[0].limiar === null) {
      props.pergunta.configuracao[0].limiar = {};
    }
    const opcoesValidas = novasOpcoes.map(op => op.opcao);
    Object.keys(props.pergunta.configuracao[0].limiar).forEach(chaveAntiga => {
      if (!opcoesValidas.includes(chaveAntiga)) {
        delete props.pergunta.configuracao[0].limiar[chaveAntiga];
      }
    });
    
    novasOpcoes.forEach(op => {
      if (!(op.opcao in props.pergunta.configuracao[0].limiar)) {
        props.pergunta.configuracao[0].limiar[op.opcao] = 0;
      }
    });
  } else {
    // Se perdeu contexto, volta para inteiro
    if (typeof props.pergunta.configuracao[0].limiar === 'object') {
      props.pergunta.configuracao[0].limiar = 0;
    }
  }
}, { immediate: true });

const emit = defineEmits(['criar-pergunta', 'criar-bloco']);
</script>