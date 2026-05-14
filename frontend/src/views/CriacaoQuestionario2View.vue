<template>
  <div class="container">
    <header class="topo">
      <h1>Criação de Questionário</h1>
      <div class="usuario">Olá, Usuario</div> <!--TODO: Lógica de Cadastro e Login-->
    </header>

    <section class="formulario">
      <div class="campo">
        <label>Título do Questionário:</label>
        <input v-model="questionario.titulo" type="text" placeholder="Ex: Sarcopenia" />
      </div>

      <div class="campo">
        <label>Identificador:</label>
        <input v-model="questionario.idInterno" type="text" placeholder="ex: sarcopenia_v1" />
      </div>

      <div class="campo">
        <label>Descrição:</label>
        <textarea v-model="questionario.descricao"></textarea>
      </div>
    </section>

    <!-- TODO: Criado por deve ser definido após lógica de login -->

    <!-- O resto do template segue a mesma lógica de v-for, usando questionario.blocos -->
    <section class="blocos">
      <div v-for="(bloco, bIdx) in questionario.blocos" :key="bloco.uid" class="bloco">
        <div class="bloco-topo">
           <div class="campo">
            <label>Título</label>
            <input v-model="bloco.titulo" type="text" placeholder="Ex: Avaliação de Força"/>
           </div>
           <!--Talvez não seja necessário um campo de identificação e podemos gerar automaticamente-->
           <div class="campo">
            <label>Identificador</label>
            <input v-model="bloco.idInterno" type="text" placeholder="Ex: avaliacao_forca"/>
           </div>
           <div class="campo">
            <label>Tipo de Bloco</label>
            <select v-model="bloco.tipo" @change="ajustarPerguntasPorTipoDeBloco">
             <option value="comum">Comum</option>
             <option value="identificacao">Identificação</option>
             <option value="peso">Pesos</option>
           </select>
           </div>
           
           <div class="acoes">
            <button 
              type="button"
              :class="['btn-estrela', { 'ativo': questionario.primeiro === bloco.uid }]"
              @click="questionario.primeiro = bloco.uid"
              title="Definir como bloco inicial"
            >
              {{ questionario.primeiro === bloco.uid ? '★ Primeiro' : '☆ Definir como primeiro' }}
            </button>
            <button class="danger" @click="removerBloco(bIdx)">Excluir</button>
          </div>
        </div>

        <div v-for="(p, pIdx) in bloco.perguntas" :key="p.uid" class="pergunta">
           <div class="campo">
            <label>Identificador</label>
            <input v-model="p.idInterno" placeholder="Ex: numero_quedas" />
           </div>
           <div class="campo">
            <label>Escopo da Pergunta</label>
            <input v-model="p.escopo" placeholder="Ex: Quantas vezes o paciente caiu no último ano?" />
           </div>
           <div class="campo">
            <label>Tipo de dados</label>
            <select v-model="p.tipo" @change="mudaConfigPorTipo(p)">
              <option v-if="bloco.tipo === 'identificacao'" value="texto">Texto</option>
              <option value="numerico">Numérico</option>
              <option v-if="!p.temContexto" value="escolha_unica">Escolha Única</option>
              <option value="equacao">Equação</option>
            </select>           
           </div>
           <div class="campo">
            <label>Lógica da pergunta</label>
            <select v-model="p.logica">
            <!-- Se for identificação ou peso, mostra apenas a opção fixa -->
            <option v-if="bloco.tipo === 'identificacao'" value="identificacao">Identificação</option>
            <option v-if="bloco.tipo === 'peso'" value="peso">Acúmulo de Peso</option>

            <!-- Lógicas normais para blocos comuns -->
            <template v-if="bloco.tipo === 'comum'">
              <option value="redirecionamento">Redirecionamento Simples</option>
              <option value="diagnostico">Fim de Questionário (Diagnóstico)</option>
            </template>
          </select>          
           </div>
           <div v-if="bloco.tipo !== 'identificacao'" class="sessao-condicional">
            <label class="checkbox-label">
              <input type="checkbox" v-model="p.temContexto" @change="() => {if (p.tipo === 'escolha_unica') p.tipo = '' }" />
              Possui contexto condicional?
            </label>

            <!-- Contexto -->
            <div v-if="p.temContexto" class="campo">
              <label>Selecione a pergunta de Identificação:</label>
              <select v-model="p.contexto">
                <option value="">-- Escolha um contexto --</option>
                <!-- No futuro, faremos um loop aqui das perguntas de identificação -->
                <option value="idp_sexo">Sexo (Exemplo)</option>
              </select>
            </div>

            <!-- Tipo numérico -->
            <div v-if="p.tipo === 'numerico' && bloco.tipo !== 'identificacao' && !p.temContexto" class="campo">
              <div class="condicional">
                <span>Se o valor for </span>
                <select v-model="p.configuracao[0].regra">
                  <option value="maior_que">maior que</option>
                  <option value="menor_que">menor que</option>
                  <option value="igual_a">igual a</option>
                </select>
                <input type="number" v-model.number="p.configuracao[0].limiar" placeholder="valor"/>
                <span>, então:</span>
              </div>
              <div>
                <div>
                  <span>Ação:</span>
                  
                  <!-- <select v-model="p.configuracao.verdadeiro.acao" class="input-inline">
                    <option value="proxima">ir para a próxima pergunta</option>
                    <option value="bloco">saltar para o bloco</option>
                    <option value="diagnostico">finalizar com diagnóstico</option>
                  </select>
                  
                  <select 
                    v-if="p.configuracao.verdadeiro.acao === 'bloco'" 
                    v-model="p.configuracao.verdadeiro.destinoId"
                    class="input-inline"
                  >
                    <option v-for="b in questionario.blocos" :key="b.tempUid" :value="b.tempUid">
                      {{ b.identificador }}
                    </option>
                  </select> -->
                </div>
              </div>
              <div>
                <span>se não, então:</span>
              </div>
              <div>
                <div>
                  <span>Ação:</span>
                  <!--
                  <select v-model="p.configuracao.falso.acao" class="input-inline">
                    <option value="proxima">ir para a próxima pergunta</option>
                    <option value="bloco">saltar para o bloco</option>
                    <option value="diagnostico">finalizar com diagnóstico</option>
                  </select>
                  <select 
                    v-if="p.configuracao.falso.acao === 'bloco'" 
                    v-model="p.configuracao.falso.destinoId"
                    class="input-inline"
                  >
                    <option v-for="b in questionario.blocos" :key="b.tempUid" :value="b.tempUid">
                      {{ b.identificador }}
                    </option>
                  </select>
                  -->
                </div>
              </div>
            </div>

            <!-- Escolha Única -->
            <div v-if="p.tipo === 'escolha_unica'" class="opcoes">
              <h4>Opções</h4>

              <div v-for="(opcao, opIdx) in p.configuracao" :key="opIdx" class="opcao">
                <label>Opção:</label>
                <input v-model="opcao.opcao" type="text" placeholder="Opção"/>
                <div v-if="bloco.tipo === 'peso'">
                  <label>Peso:</label>
                  <input v-model.number="opcao.escolhido.peso" type="number" placeholder="Peso"/>
                </div>
                
                <button class="danger" @click="removerOpcao(bIdx, pIdx, opIdx)">Excluir opção</button>
              </div>

              <button @click="adicionarOpcao(bIdx, pIdx)">+ Adicionar opção</button>
            </div>

            <!-- Equação -->
            <div v-if="p.tipo === 'equacao'" class="equacao-box">
              <div class="campo">
                <label>Equação (Em LaTeX):</label>
                <input v-model="p.configuracao[0].equacao" type="text"/>
              </div>

              <div class="campo">
                <label>Variáveis da equação</label>
              </div>

              <div v-for="(variavel, varIdx) in p.configuracao[0].variaveis" :key="varIdx" class="variavel-item">
                <label>Identificador:</label>
                <input v-model="variavel.idInterno" type="text"/>
                <label>Variável:</label>
                <input v-model="variavel.variavel" type="text"/>
                <button class="danger" @click="removerVariavel(bIdx, pIdx, varIdx)">Excluir variável</button>
              </div>
              <button @click="adicionarVariavel(bIdx, pIdx)">+ Adicionar variável</button>

              <div class="condicional">
                <div v-if="!p.temContexto">
                  <div>
                    <span>Se o valor for </span>
                    <select v-model="p.configuracao[0].condicional[0].regra">
                      <option value="maior_que">maior que</option>
                      <option value="menor_que">menor que</option>
                      <option value="igual_a">igual a</option>
                    </select>
                    <input type="number" v-model.number="p.configuracao[0].condicional[0].limiar" placeholder="valor"/>
                    <span>, então:</span>
                  </div>
                  <div>
                    <div>
                      <span>Ação:</span>
                      
                      <!-- <select v-model="p.configuracao.verdadeiro.acao" class="input-inline">
                        <option value="proxima">ir para a próxima pergunta</option>
                        <option value="bloco">saltar para o bloco</option>
                        <option value="diagnostico">finalizar com diagnóstico</option>
                      </select>
                      
                      <select 
                        v-if="p.configuracao.verdadeiro.acao === 'bloco'" 
                        v-model="p.configuracao.verdadeiro.destinoId"
                        class="input-inline"
                      >
                        <option v-for="b in questionario.blocos" :key="b.tempUid" :value="b.tempUid">
                          {{ b.identificador }}
                        </option>
                      </select> -->
                    </div>
                  </div>
                  <div>
                    <span>se não, então:</span>
                  </div>
                  <div>
                    <div>
                      <span>Ação:</span>
                      <!--
                      <select v-model="p.configuracao.falso.acao" class="input-inline">
                        <option value="proxima">ir para a próxima pergunta</option>
                        <option value="bloco">saltar para o bloco</option>
                        <option value="diagnostico">finalizar com diagnóstico</option>
                      </select>
                      <select 
                        v-if="p.configuracao.falso.acao === 'bloco'" 
                        v-model="p.configuracao.falso.destinoId"
                        class="input-inline"
                      >
                        <option v-for="b in questionario.blocos" :key="b.tempUid" :value="b.tempUid">
                          {{ b.identificador }}
                        </option>
                      </select>
                      -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
           <div class="acoes">
            <button 
              type="button"
              :class="['btn-estrela', { 'ativo': bloco.primeiro === p.uid }]"
              @click="questionario.blocos[bIdx].primeiro = p.uid"
              title="Definir como pergunta inicial"
            >
              {{ bloco.primeiro === p.uid ? '★ Primeiro' : '☆ Definir como primeiro' }}
            </button>
            <button class="danger" @click="removerPergunta(bIdx, pIdx)">Remover</button>
          </div>

           <!-- Aqui entrarão os campos específicos de cada tipo que desenhamos -->
        </div>

        <button @click="adicionarPergunta(bIdx)">+ Nova Pergunta</button>
      </div>
      
      <button class="btn-bloco" @click="adicionarBloco">+ Criar novo bloco</button>
    </section>

    <section class="rodape-acoes">
      <button @click="salvarQuestionario">Gerar JSON Final</button>
    </section>

    <pre v-if="jsonGerado">{{ jsonGerado }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- ESTADO REATIVO ---
const questionario = ref({
  titulo: "",
  idInterno: "",
  descricao: "",
  primeiro: "", // ID do primeiro bloco do questionário
  blocos: []
});

const jsonGerado = ref("");

// --- MÉTODOS DE MANIPULAÇÃO ---

// Blocos
const adicionarBloco = () => {
  // Estamos definindo um id interno imutável para que o usuário possa modificar o identificador sem que a lógica do sistema quebre
  const uid = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  questionario.value.blocos.push({
    uid: uid,
    idInterno: "",
    titulo: "",
    tipo: "comum", // comum, identificacao, peso
    primeiro: "",  // ID da primeira pergunta deste bloco
    perguntas: []
  });

  if (questionario.value.blocos.length === 1) {
    questionario.value.primeiro = uid;
  }
};

const removerBloco = (idBloco) => {
  const uidDeletado = questionario.value.blocos[idBloco].uid;
  questionario.value.blocos.splice(idBloco, 1);

  if (questionario.value.primeiro === uidDeletado) {
    if (questionario.value.blocos.length > 0) {
      questionario.value.primeiro = questionario.value.blocos[0].uid;
    } else {
      questionario.value.primeiro = "";
    }
  }
};

const ajustarPerguntasPorTipoDeBloco = (bloco) => {
  if (bloco.tipo === 'identificacao') {
    bloco.perguntas.forEach(p => {
      p.logica = 'identificacao'
      p.temContexto = false;
    });
  } else if (bloco.tipo === 'peso') {
    bloco.perguntas.forEach(p => {
      p.logica = 'peso';
    });
  }
};

// Perguntas
const adicionarPergunta = (idBloco) => {
  const bloco = questionario.value.blocos[idBloco];
  const uid = `uid_pergunta_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
// Define padrões baseados no bloco
  let logicaPadrao =  bloco.tipo === 'identificacao' ? 'identificacao' : 
                      bloco.tipo === 'peso' ? 'peso' : 'redirecionamento';

  bloco.perguntas.push({
    uid: uid,
    idInterno: "",
    escopo: "",
    tipo: "",
    logica: logicaPadrao,
    // TODO: Retirar ao final
    temContexto: false,
    contexto: "",
    configuracao: [], // Onde salvaremos os 'proximos' e pesos
  });

  if (bloco.perguntas.length === 1) {
    bloco.primeiro = uid;
  }
};

const mudaConfigPorTipo = (pergunta) => {
  const padraoLogicaNumerica = {
    regra: 'maior_que',
    limiar: 0,
    verdadeiro: { peso: 0, proximo: "" },
    falso: { peso: 0, proximo: "" }
  };

  if (pergunta.tipo === 'numerico' || pergunta.tipo === 'calculoPeso') {
    pergunta.configuracao = [padraoLogicaNumerica];
  } else if (pergunta.tipo === 'equacao') {
    pergunta.configuracao = [{
      variaveis: [],
      equacao: "",
      condicional: [padraoLogicaNumerica]
    }]
  } else {
    pergunta.configuracao = []
  }
};

const removerPergunta = (idBloco, idPergunta) => {
  const bloco = questionario.value.blocos[idBloco]
  const uidDeletado = bloco.perguntas[idPergunta].uid;
  bloco.perguntas.splice(idPergunta, 1);

  if (bloco.primeiro === uidDeletado) {
    if (bloco.perguntas.length > 0) {
      bloco.primeiro = bloco.perguntas[0].uid;
    } else {
      bloco.primeiro = "";
    }
  }
};

// Opções e Variáveis
const adicionarOpcao = (blocoIndex, perguntaIndex) => {
  questionario.value.blocos[blocoIndex].perguntas[perguntaIndex].configuracao.push({
    opcao: "",
    escolhido: {
      peso: 0,
      proximo: ""
    }
  });
};

const removerOpcao = (blocoIndex, perguntaIndex, opcaoIndex) => {
  questionario.value.blocos[blocoIndex].perguntas[perguntaIndex].configuracao.splice(opcaoIndex, 1);
};

const adicionarVariavel = (blocoIndex, perguntaIndex) => {
  questionario.value.blocos[blocoIndex].perguntas[perguntaIndex].configuracao[0].variaveis.push({
    idInterno: "",
    variavel: "",
    opcoes: []
  });
};

const removerVariavel = (blocoIndex, perguntaIndex, varIndex) => {
  questionario.value.blocos[blocoIndex].perguntas[perguntaIndex].variaveis.splice(varIndex, 1);
};

// Finalização
const salvarQuestionario = () => {
  const jsonFinal = JSON.parse(JSON.stringify(questionario.value));

  jsonFinal.blocos.forEach(bloco => {
    bloco.perguntas.forEach(p => {
      // --- LIMPEZA CONDICIONAL ---
      if (p.tipo === 'equacao') {
        p.configuracao = p.configuracao[0] || {};
        if (!p.temContexto) p.configuracao.condicional = p.configuracao.condicional[0] || {};
      }
      // Se não marcou contexto, removemos os campos do JSON
      if (!p.temContexto) {
        if (p.tipo === 'numerico') p.configuracao = p.configuracao[0] || {};
        delete p.contexto;
      }
      delete p.temContexto; // Removemos a variável de controle da UI

      // Limpeza de tipos (Ex: se for texto, não precisa de 'equacao')
      /*
      if (p.tipo !== 'equacao') {
        delete p.equacao;
        delete p.variaveis;
      }
      
      if (p.tipo !== 'escolha_unica' && p.tipo !== 'multipla_escolha') {
        delete p.opcoes;
      }
      */
    });
  });

  jsonGerado.value = JSON.stringify(jsonFinal, null, 2);
  console.log("JSON pronto para o motor:", jsonGerado.value);
};
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.formulario,
.blocos,
.json-preview {
  margin-bottom: 24px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

input,
textarea,
select {
  padding: 8px;
  font-size: 14px;
}

textarea {
  min-height: 80px;
}

.bloco {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.bloco-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pergunta {
  border: 1px dashed #999;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.opcoes {
  margin-top: 12px;
}

.opcao {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.acoes,
.acoes-pergunta,
.rodape-acoes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background: #222;
  color: white;
  border-radius: 6px;
}

button:hover {
  opacity: 0.9;
}

.danger {
  background: #c62828;
}

.btn-bloco {
  margin-top: 10px;
}

pre {
  background: #f4f4f4;
  padding: 16px;
  overflow-x: auto;
  border-radius: 8px;
}

.variavel-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.equacao-box {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafafa;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>