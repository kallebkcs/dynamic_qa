<template>
  <div class="container">
    <header class="topo">
      <h1>Criação de Questionário</h1>
      <div class="usuario">Olá, Usuario</div> <!--TODO: Lógica de Cadastro e Login-->
    </header>

    <section class="formulario">
      <div class="campo">
        <label>Título do Questionário:</label>
        <input v-model="questionario.titulo" type="text"/>
      </div>

      <div class="campo">
        <label>Identificador:</label>
        <input v-model="questionario.idInterno" type="text"/>
        <small style="color: #666;">Apenas letras, números e underscore (_).</small>
      </div>

      <div class="campo">
        <label>Descrição:</label>
        <textarea v-model="questionario.descricao"></textarea>
      </div>
    </section>

    <!-- TODO: "Criado por" deve ser definido após lógica de login -->

    <!-- O resto do template segue a mesma lógica de v-for, usando questionario.blocos -->
    <section class="blocos">
      <div v-for="(bloco, bIdx) in questionario.blocos" :key="bloco.uid" class="bloco">
        <div class="bloco-topo">
           <div class="campo">
            <label>Título</label>
            <input v-model="bloco.titulo" type="text"/>
           </div>
           <!--Talvez não seja necessário um campo de identificação e podemos gerar automaticamente-->
           <div class="campo">
            <label>Identificador</label>
            <input v-model="bloco.idInterno" type="text"/>
            <small style="color: #666;">Apenas letras, números e underscore (_).</small>
           </div>
           <div class="campo">
            <label>Tipo de Bloco</label>
            <select v-model="bloco.tipo" @change="mudancaBloco(bloco)" :disabled="bloco.tipo === 'identificacao'">
             <option value="comum">Comum</option>
             <option v-if="bloco.tipo === 'identificacao'" value="identificacao">Identificação</option>
             <option value="peso">Pesos</option>
           </select>
           </div>
           
           <div class="acoes">
           <button class="danger" @click="removerBloco(bIdx)" v-if="bloco.tipo !== 'identificacao'">Excluir</button>
          </div>
        </div>

        <div v-for="(p, pIdx) in bloco.perguntas" :key="p.uid" class="pergunta">
           <div class="campo">
            <label>Identificador</label>
            <input v-model="p.idInterno"/>
            <small style="color: #666;">Apenas letras, números e underscore (_).</small>
           </div>

           <div class="campo">
            <label>Escopo da Pergunta</label>
            <input v-model="p.escopo" placeholder="Como vai seu dia?"/>
           </div>

           <div class="campo">
            <label>Tipo de dados</label>
            <select v-model="p.tipo" @change="mudaConfigPorTipo(p)">
              <option v-if="bloco.tipo === 'identificacao'" value="texto">Texto</option>
              <option value="numerico">Numérico</option>
              <option v-if="!p.temContexto" value="escolha_unica">Escolha Única</option>
              <option v-if="bloco.tipo !== 'identificacao'" value="equacao">Equação</option>
            </select>           
           </div>

           <!-- Contexto  -->
           <div v-if="bloco.tipo !== 'identificacao'" class="sessao-condicional">
            <label class="checkbox-label">
              <input type="checkbox" v-model="p.temContexto" @change="() => {if (p.tipo === 'escolha_unica') p.tipo = '' }" />
              Possui contexto condicional?
            </label>

            <div v-if="p.temContexto" class="campo">
              <label>Selecione a pergunta de Identificação:</label>
              <select v-model="p.contexto">
                <option value="" disabled>-- Escolha um contexto --</option>
                <option v-for="ctx in perguntasContexto" :key="ctx.uid" :value="ctx.uid">{{ ctx.escopo || ctx.idInterno }} ({{ ctx.idInterno }})</option>
              </select>
            </div>
          </div>

          <!-- Tipo texto -->
          <div v-if="p.tipo === 'texto'">
            <BlocoLogica
              :destino="p"
              :tipoLogica="bloco.tipo"
              :perguntasDoBloco="questionario.blocos[bIdx].perguntas"
              :blocosDisponiveis="questionario.blocos"
              :uidPerguntaAtual="p.uid"
              :uidBlocoAtual="bloco.uid"
              @criar-pergunta="(identificador) => adicionarPergunta(bIdx, identificador)"
              @criar-bloco="(identificador) => adicionarBloco(identificador)"
            />
          </div>  

          <!-- Tipo numérico -->
          <TipoNumerico 
            v-if="p.tipo === 'numerico' && p.configuracao.length > 0 && 'regra' in p.configuracao[0]""
            :key="'num_' + p.uid + '_' + p.tipo"
            :pergunta="p" 
            :tipoLogica="bloco.tipo"
            :perguntasDoBloco="questionario.blocos[bIdx].perguntas"
            :blocosDisponiveis="questionario.blocos"
            :contexto="p.contexto"
            :uidPerguntaAtual="p.uid"
            :uidBlocoAtual="bloco.uid"
            @criar-pergunta="(identificador) => adicionarPergunta(bIdx, identificador)"
            @criar-bloco="(identificador) => adicionarBloco(identificador)"
          /> 
          
          <!-- Escolha Única -->
          <TipoEscolha 
            v-if="p.tipo === 'escolha_unica' && p.configuracao.length > 0 && 'escolhido' in p.configuracao[0]""
            :key="'esc_' + p.uid + '_' + p.tipo"
            :pergunta="p" 
            :tipoLogica="bloco.tipo"
            :perguntasDoBloco="questionario.blocos[bIdx].perguntas"
            :blocosDisponiveis="questionario.blocos"
            :uidPerguntaAtual="p.uid"
            :uidBlocoAtual="bloco.uid"
            @criar-pergunta="(identificador) => adicionarPergunta(bIdx, identificador)"
            @criar-bloco="(identificador) => adicionarBloco(identificador)"
          />

          <!-- Equação -->
          <TipoEquacao
            v-if="p.tipo === 'equacao' && p.configuracao.length > 0 && 'equacao' in p"
            :key="'eq_' + p.uid + '_' + p.tipo"
            :pergunta="p" 
            :tipoLogica="bloco.tipo"
            :perguntasDoBloco="questionario.blocos[bIdx].perguntas"
            :blocosDisponiveis="questionario.blocos"
            :contexto="p.contexto"
            :uidPerguntaAtual="p.uid"
            :uidBlocoAtual="bloco.uid"
            @criar-pergunta="(identificador) => adicionarPergunta(bIdx, identificador)"
            @criar-bloco="(identificador) => adicionarBloco(identificador)"
          />
            
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
        </div>

        <button @click="adicionarPergunta(bIdx)">+ Nova Pergunta</button>
        <!-- Perguntas pré-setadas -->
        <div v-if="bloco.tipo === 'identificacao'">
          <button @click="menuPresetQuestions = !menuPresetQuestions">{{ menuPresetQuestions ? 'Ocultar Perguntas de Identificação' : 'Adicionar Perguntas de Identificação' }}</button>
          <div v-if="menuPresetQuestions">
            <p>Selecione perguntas para adicionar ao bloco</p>
            <label v-for="pre in presetQuestions" :key="pre.templateId">
              <input type="checkbox" :value="pre.templateId" v-model="preSetadasSelecionadas" />
              {{ pre.escopo }}
            </label>
            <button @click="injetPreset(bIdx)" :disabled="preSetadasSelecionadas.length === 0">Inserir {{ preSetadasSelecionadas.length }} pergunta(s)</button>
          </div>
        </div>
        
        <!-- Decisão de peso -->
        <div v-if="bloco.tipo === 'peso'&& bloco.calculoPeso">
          <h3>Decisão de Peso:</h3>
          <p>Defina o caminho que o questionário deve tomar baseado no peso somado deste bloco</p>
          <TipoNumerico
            :pergunta="bloco.calculoPeso"
            tipoLogica="comum"
            :perguntasDoBloco="bloco.perguntas"
            :blocosDisponiveis="questionario.blocos"
            :uidPerguntaAtual="bloco.calculoPeso.uid"
            :uidBlocoAtual="bloco.uid"
            @criar-pergunta="(identificador) => adicionarPergunta(bIdx, identificador)"
            @criar-bloco="(identificador) => adicionarBloco(identificador)"
          />
        </div>
      </div>
      
      <button class="btn-bloco" @click="adicionarBloco()">+ Criar novo bloco</button>
    </section>

    <section class="rodape-acoes">
      <button @click="salvarQuestionario">Gerar JSON Final</button>
    </section>

    <pre v-if="jsonGerado">{{ jsonGerado }}</pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BlocoLogica from '../components/BlocoLogica.vue';
import TipoNumerico from '../components/TipoNumerico.vue';
import TipoEscolha from '../components/TipoEscolha.vue';
import TipoEquacao from '../components/TipoEquacao.vue';
import { presetQuestions } from '../utils/presetQuestions.js';

// --- ESTADO REATIVO ---
const uid_primeiro_bloco = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
const uid_primeira_pergunta = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}2`
// TODO: RETIRAR DEPOIS, É APENAS PARA OS TESTES
const uid_idade = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}3`
const uid_sexo = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}4`

const questionario = ref({
  titulo: "",
  idInterno: "",
  descricao: "",
  primeiro: uid_primeiro_bloco, // ID do primeiro bloco do questionário
  blocos: [
    {
      uid: uid_primeiro_bloco,
      idInterno: "idp",
      titulo: "Dados do Paciente",
      tipo: "identificacao",
      primeiro: uid_primeira_pergunta,
      perguntas: [{
          uid: uid_primeira_pergunta,
          idInterno: "idp_nome",
          escopo: "Nome:",
          tipo: "texto",
          // a partir deste proximo: testes
          proximo: ""
      }]
    }]
});

const jsonGerado = ref("");

// --- MÉTODOS DE MANIPULAÇÃO ---

// Blocos
const adicionarBloco = (identificador="") => {
  // Estamos definindo um id interno imutável para que o usuário possa modificar o identificador sem que a lógica do sistema quebre
  const uid = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  questionario.value.blocos.push({
    uid: uid,
    idInterno: identificador,
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

const mudancaBloco = (bloco) => {
  // CalculoPeso
  if (bloco.tipo === 'peso') {
    if (!bloco.calculoPeso) {
      bloco.calculoPeso = {
        uid: `calc_${bloco.uid}`,
        tipo: 'calculoPeso',
        configuracao: [{
          regra: 'maior_que',
          limiar: 0,
          verdadeiro: { proximo: "" },
          falso: { proximo: "" }
        }]
      };
    }
  } else {
    delete bloco.calculoPeso;
  }

  bloco.perguntas.forEach(p => {
    // LIMPEZA
    if (bloco.tipo === 'comum') {
      // numérico / equacao
      if (p.tipo === 'numerico' || p.tipo === 'equacao') {
        p.configuracao[0].verdadeiro = { proximo: "" }
        p.configuracao[0].falso = { proximo: "" }
      }

      // escolha unica
      if (p.tipo === 'escolha_unica'){
        p.configuracao.forEach(op => {
          //delete op.escolhido.peso
          op.escolhido = { proximo: "" }
        });
      }
    } else if (bloco.tipo === 'peso') {
      if (!p.proximo || typeof p.proximo === 'object') {
        p.proximo = 'calcPeso';
      }
    } else {
      // mudança comum a qualquer tipo
      if (!p.proximo) p.proximo = "";

      // numérico / equacao
      if (p.tipo === 'numerico' || p.tipo === 'equacao') {
        p.configuracao[0].verdadeiro = { peso: 0 }
        p.configuracao[0].falso = { peso: 0 }
      }

      // escolha unica
      if (p.tipo === 'escolha_unica'){
        p.configuracao.forEach(op => {
          //delete op.escolhido.peso
          op.escolhido = { peso: 0 }
        });
      }
    }
  });
};

// Perguntas
const adicionarPergunta = (idBloco, identificador="") => {
  const bloco = questionario.value.blocos[idBloco];
  const uid = `uid_pergunta_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  bloco.perguntas.push({
    uid: uid,
    idInterno: identificador,
    escopo: "",
    tipo: "",
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
  delete pergunta.equacao;
  delete pergunta.variaveis;

  if (pergunta.tipo === 'escolha_unica') {
    pergunta.configuracao = [{
      opcao: "",
      escolhido: {}
    }];
  } else {
    pergunta.configuracao = [{
      regra: 'maior_que',
      limiar: 0,
      verdadeiro:  {},
      falso: {}
    }];
  }

  if (pergunta.tipo === 'equacao') {
      pergunta.equacao = "";
      pergunta.variaveis = [];
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

// --- PERGUNTAS PRÉ-SETADAS ---
const menuPresetQuestions = ref(false);
const preSetadasSelecionadas = ref([]);

const injetPreset = (bIdx) => {
  const bloco = questionario.value.blocos[bIdx];
  
  preSetadasSelecionadas.value.forEach(templateId => {
    const template = presetQuestions.find(p => p.templateId === templateId);
    if (template) {
      bloco.perguntas.push({
        uid: `uid_preset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        idInterno: template.idInterno,
        escopo: template.escopo,
        tipo: template.tipo,
        configuracao: JSON.parse(JSON.stringify(template.configuracao)),
        ...(template.proximo !== undefined && { proximo: template.proximo })
      });
    }
  });
  preSetadasSelecionadas.value = [];
  menuPresetQuestions.value = false;
};

// Contexto
const perguntasContexto = computed(() => {
  const blocoId = questionario.value.blocos.find(b => b.tipo === 'identificacao');
  if (!blocoId) return [];
  return blocoId.perguntas.filter(p => p.tipo === 'escolha_unica');
});

// Finalização
const salvarQuestionario = () => {
  const jsonFinal = JSON.parse(JSON.stringify(questionario.value));

  jsonFinal.blocos.forEach(bloco => {
    // Para o atributo calculoPeso
    if (bloco.calculoPeso && Array.isArray(bloco.calculoPeso.configuracao)) {
       bloco.calculoPeso = bloco.calculoPeso.configuracao[0] || {};
    }

    bloco.perguntas.forEach(p => {
      // Tipos que não são de múltipla escolha sempre viram objeto na raiz da config.
      if (p.tipo === 'numerico' || p.tipo === 'texto' || p.tipo === 'equacao') {
        if (Array.isArray(p.configuracao) && p.configuracao.length > 0) {
          p.configuracao = p.configuracao[0];
        }
      }

      if (p.tipo === 'equacao') {
        // Desempacota a condicional (que nós tínhamos feito nascer como array[1] na seed)
        if (p.configuracao && Array.isArray(p.configuracao.condicional) && p.configuracao.condicional.length > 0) {
          p.configuracao.condicional = p.configuracao.condicional[0];
        }
      }

      // Retirada do atributo contexto se não houver contexto, e da flag temContexto
      if (!p.temContexto) {
        delete p.contexto; 
      }
      delete p.temContexto;
      
      // Limpezas de identificação
      if (bloco.tipo === 'identificacao') {
        if (p.tipo === 'escolha_unica') {
          p.configuracao.forEach(op => {
            delete op.escolhido;
          });
        } else {
          delete p.configuracao;
        }
      }
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