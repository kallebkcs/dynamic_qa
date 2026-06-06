<template>
  <div class="container">
    <header class="topo">
      <div>
        <h1>Criação de Questionário</h1>
        <!-- <div class="usuario">Olá, Usuario</div> TODO: Lógica de Cadastro e Login-->
      </div>
      <router-link to="/coordenador" class="sair-btn">Voltar</router-link>
      <h1>{{ modoEdicao ? 'Edição de Questionário' : 'Criação de Questionário' }}</h1>
      <button @click="router.push('/')">VOLTAR</button>
      <!-- <div class="usuario">Olá, Usuario</div> -->
    </header>
    
    <form @submit.prevent="salvarQuestionario">

    <section class="formulario">
      <div class="campo">
        <label>Título do Questionário:</label>
        <input required v-model="questionario.titulo" type="text"/>
      </div>

      <div class="campo">
        <label>Identificador:</label>
        <input required pattern="^[a-z0-9_]+$" :disabled="questionario.temRespostas" v-model="questionario.idInterno" type="text"/>
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
            <input required v-model="bloco.titulo" type="text"/>
           </div>
           <!--Talvez não seja necessário um campo de identificação e podemos gerar automaticamente-->
           <div class="campo">
            <label>Identificador</label>
            <input required pattern="^[a-z0-9_]+$" :disabled="questionario.temRespostas" v-model="bloco.idInterno" type="text"/>
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
           <button class="danger" :disabled="questionario.temRespostas" @click="removerBloco(bIdx)" v-if="bloco.tipo !== 'identificacao'">Excluir</button>
          </div>
        </div>

        <div v-for="(p, pIdx) in bloco.perguntas" :key="p.uid" class="pergunta">
           <div class="campo">
            <label>Identificador</label>
            <input required pattern="^[a-z0-9_]+$" :disabled="questionario.temRespostas" v-model="p.idInterno"/>
            <small style="color: #666;">Apenas letras, números e underscore (_).</small>
           </div>

           <div class="campo">
            <label>Escopo da Pergunta</label>
            <input required v-model="p.escopo" placeholder="Como vai seu dia?"/>
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
              <select required v-model="p.contexto">
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
            <button class="danger" :disabled="questionario.temRespostas" @click="removerPergunta(bIdx, pIdx)">Remover</button>
          </div>
        </div>

        <button :disabled="questionario.temRespostas" @click="adicionarPergunta(bIdx)">+ Nova Pergunta</button>
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

           <!-- Aqui entrarão os campos específicos de cada tipo que desenhamos -->
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
      
      <button class="btn-bloco" :disabled="questionario.temRespostas" @click="adicionarBloco()">+ Criar novo bloco</button>
    </section>

    <section class="rodape-acoes">
      <button type="submit" :disabled="salvando">{{ salvando ? 'Aguarde...' : (modoEdicao ? 'Salvar Alterações' : 'Salvar Questionário') }}</button>
    </section>
  </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import BlocoLogica from '../components/BlocoLogica.vue';
import TipoNumerico from '../components/TipoNumerico.vue';
import TipoEscolha from '../components/TipoEscolha.vue';
import TipoEquacao from '../components/TipoEquacao.vue';
import { presetQuestions } from '../utils/presetQuestions.js';
import evaluatex from 'evaluatex';

const router = useRouter();
const route = useRoute();

// Controle de modo
const modoEdicao = ref(false);
const idQuestionarioEdicao = ref(null);

// Modo Edição
onMounted(async () => {
  // tirar uma feature chata da rodinha do mouse alterar o input type number
  document.addEventListener('wheel', () => {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  }, { passive: true });

  if (route.params.id) {
    modoEdicao.value = true;
    idQuestionarioEdicao.value = route.params.id;
    await carregarDadosEdicao(route.params.id);
  } else if (route.query.clone) {
    modoEdicao.value = false;
    await carregarDadosEdicao(route.query.clone, true)
  }
});

const carregarDadosEdicao = async (id, duplicar=false) => {
  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${id}`);
    if (res.ok) {
      const dadosBrutos = await res.json();
      if (duplicar) {
        const clone = preProcessamento(dadosBrutos);
        delete clone._id;
        delete clone.__v;

        clone.titulo = clone.titulo + " (Cópia)";
        clone.idInterno = clone.idInterno + "_copia";
        //clone.idPlanilha = ""; TODO: Lógica de idPlanilha
        clone.temRespostas = false;
        questionario.value = clone;
      } else {
        questionario.value = preProcessamento(dadosBrutos);
      }
    } else {
      alert("Questionário não encontrado. Redirecionando para a página inicial");
      router.push('/');
    }
  } catch (err) {
    console.error("ERRO ao buscar questionário: ", err);
    alert("Erro de conexão ao carregar dados");
  }
};

const preProcessamento = (dadosBrutos) => {
  // Faz um clone profundo para não alterar a referência original do fetch
  const questionarioCarregado = JSON.parse(JSON.stringify(dadosBrutos));

  questionarioCarregado.blocos.forEach(bloco => {
    if (bloco.calculoPeso && typeof bloco.calculoPeso === 'object' && !Array.isArray(bloco.calculoPeso)) {
      bloco.calculoPeso = {
        uid: `calc_${bloco.uid}`,
        tipo: 'calculoPeso',
        configuracao: [bloco.calculoPeso]
      };
    }

    bloco.perguntas.forEach(p => {
      // Reconstrói a flag visual do checkbox de contexto
      p.temContexto = !!p.contexto;

      // Reempacota a configuração de objetos de volta para Arrays
      if (['numerico', 'texto', 'equacao'].includes(p.tipo)) {
        if (p.configuracao && !Array.isArray(p.configuracao)) {
          p.configuracao = [p.configuracao];
        } else if (!p.configuracao) {
          p.configuracao = [];
        }
      }

      // Reempacota a condicional da equação
      if (p.tipo === 'equacao' && p.configuracao && p.configuracao[0]) {
        if (p.configuracao[0].condicional && !Array.isArray(p.configuracao[0].condicional)) {
          p.configuracao[0].condicional = [p.configuracao[0].condicional];
        }
      }

      // Restaura as propriedades vazias varridas no bloco de identificação
      if (bloco.tipo === 'identificacao') {
        if (p.tipo === 'escolha_unica') {
          p.configuracao?.forEach(op => {
            if (!op.escolhido) op.escolhido = {};
          });
        } else if (p.tipo === 'numerico') {
          p.configuracao = [{
            regra: 'maior_que',
            limiar: 0,
            verdadeiro: {},
            falso: {}
          }];
        }
      }
    });
  });

  return questionarioCarregado;
};

// --- ESTADO REATIVO ---
const uid_primeiro_bloco = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
const uid_primeira_pergunta = `uid_bloco_${Date.now()}_${Math.random().toString(36).substr(2, 5)}2`

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
const posProcessamento = () => {
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

  return jsonFinal;
};

const validarDados = (questionario) => {
  const regexId = /^[a-z0-9_]+$/;

  if (!questionario.titulo?.trim()) return "O questionário precisa de um título.";
  if (!questionario.idInterno || !regexId.test(questionario.idInterno)) {
    return "O ID do questionário é inválido. Use apenas letras minúsculas, números e '_'.";
  }

  if (questionario.blocos.length === 0) return "O questionário precisa ter pelo menos um bloco.";

  for (const bloco of questionario.blocos) {
    if (!bloco.titulo?.trim()) return "Existe um bloco sem título.";
    if (bloco.perguntas.length === 0) return `O bloco '${bloco.titulo}' não tem perguntas.`;
    
    for (const p of bloco.perguntas) {
      if (!p.escopo?.trim()) return "Existe uma pergunta sem escopo.";
      if (!p.idInterno || !regexId.test(p.idInterno)) {
        return `O ID '${p.idInterno || 'vazio'}' é inválido. Siga a regra de sintaxe.`;
      }

      switch (p.tipo) {
        
        case 'escolha_unica':
          if (!Array.isArray(p.configuracao) || p.configuracao.length === 0) {
            return `A pergunta '${p.idInterno}' precisa de pelo menos uma opção de resposta.`;
          }
          for (const op of p.configuracao) {
            if (!op.opcao?.trim()) return `Existe uma opção de resposta em branco na pergunta '${p.idInterno}'.`;
            
            if (bloco.tipo === 'peso' && (op.peso === undefined && op.escolhido?.peso === undefined)) {
              return `Falta definir o peso numérico em uma das opções de '${p.idInterno}'.`;
            }
          }
          break;

        case 'numerico':
          if (bloco.tipo !== 'identificacao') {
            if (!p.configuracao || !p.configuracao.regra) {
              return `Defina a regra lógica (ex: maior/menor que) para a pergunta '${p.idInterno}'.`;
            }
            if (p.configuracao.limiar === undefined || p.configuracao.limiar === null) {
              return `O valor de limiar de '${p.idInterno}' não pode ficar vazio.`;
            }
          }
          break;
        case 'equacao':
          if (!p.equacao?.trim()) {
            return `A fórmula da equação em '${p.idInterno}' está vazia.`;
          }
          if (!Array.isArray(p.variaveis) || p.variaveis.length === 0) {
            return `A equação em '${p.idInterno}' exige pelo menos uma variável mapeada.`;
          }
          if (!p.configuracao || p.configuracao.limiar === undefined) {
             return `Defina a regra lógica e o limiar para o resultado da equação em '${p.idInterno}'.`;
          }
          // Teste com KaTeX
          try {
            if (window.katex) {
              window.katex.renderToString(p.equacao, { throwOnError: true });
            }
          } catch (err) {
            return `Sintaxe LaTeX inválida na equação '${p.idInterno}': ${err.message.replace("KaTeX parse error: ", "")}`;
          }

          // 2. Teste com Evaluatex
          try {
            // Monta um objeto falso com valor '1' para cada variável que o usuário cadastrou
            const variaveisTeste = {};
            p.variaveis.forEach(v => {
              if (!v.variavel?.trim()) throw new Error("Há uma variável sem símbolo definido.");
              variaveisTeste[v.variavel] = 1;
            });

            // Compila a equação. Se tiver letra sobrando que não tá no variaveisTeste, o evaluatex detecta.
            const fn = evaluatex(p.equacao);
            fn(variaveisTeste); 
          } catch (err) {
             return `A matemática da equação '${p.idInterno}' falhou. Verifique se todas as letras usadas na fórmula foram adicionadas na lista de variáveis. Erro: ${err.message}`;
          }
          break;

        case 'texto':
          // O tipo texto é livre por natureza. Se o escopo e o ID existem, ele passa.
          break;

        default:
          return `O tipo de dado '${p.tipo}' na pergunta '${p.idInterno}' não existe.`;
      }
    }
  }
  
  return null;
};

const salvando = ref(false);

const salvarQuestionario = async () => {
  // Gera o JSON do questionário
  const jsonQuestionario = posProcessamento();

  const erroValidacao = validarDados(jsonQuestionario);
  if (erroValidacao) {
    alert("ERRO: " + erroValidacao);
    return; // Aborta o salvamento sumariamente
  }
  salvando.value = true;
  try {
    const url = modoEdicao.value 
      ? `http://localhost:3000/api/questionarios/${idQuestionarioEdicao.value}`
      : 'http://localhost:3000/api/questionarios';
      
    const metodo = modoEdicao.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonQuestionario)
    });

    if (res.ok) { 
      alert('Questionário salvo com sucesso') 
      router.push('/');
    } else {
      const erro = await res.json();
      alert("ERRO: " + erro);
    }
  } catch (err) {
    console.log('ERRO: ', err)
    alert('ERRO: ' + err)
  } finally {
    salvando.value = false;
  }
}
</script>

<style scoped>
:root {
  --bg: #f3f4ff;
  --card: rgba(255, 255, 255, 0.96);
  --border: rgba(99, 102, 241, 0.18);
  --text: #1f2937;
  --muted: #4b5563;
  --primary: #4f46e5;
  --primary-strong: #4338ca;
  --danger: #dc2626;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
  background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.topo h1 {
  font-size: 2.25rem;
  margin: 0;
}

.usuario {
  color: var(--muted);
  font-weight: 600;
}

.sair-btn {
  padding: 12px 18px;
  border-radius: 16px;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.18);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.sair-btn:hover {
  transform: translateY(-1px);
  background: #4338ca;
}

.formulario,
.blocos,
.json-preview {
  margin-bottom: 28px;
}

.formulario,
.bloco,
.equacao-box,
pre {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 26px;
}

.formulario {
  padding: 28px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

label {
  color: var(--primary-strong);
  font-weight: 700;
  font-size: 0.98rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 16px;
  background: #ffffff;
  font-size: 1rem;
  color: var(--text);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: rgba(79, 70, 229, 0.7);
  box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.1);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.blocos {
  display: grid;
  gap: 24px;
}

.bloco {
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.bloco-topo {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 18px;
  align-items: start;
  margin-bottom: 24px;
}

.pergunta {
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 18px;
  background: #ffffff;
}

.pergunta:not(:last-child) {
  margin-bottom: 20px;
}

.sessao-condicional,
.opcoes,
.equacao-box {
  margin-top: 18px;
  padding: 20px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.opcoes h4 {
  margin: 0 0 14px;
  color: var(--primary);
}

.opcao,
.variavel-item {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: center;
  margin-bottom: 14px;
}

.opcao button,
.variavel-item button {
  grid-column: span 1;
  justify-self: start;
}

.condicional {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.condicional span {
  color: var(--muted);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  font-weight: 700;
  color: var(--primary-strong);
}

.acoes,
.acoes-pergunta,
.rodape-acoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

button {
  padding: 12px 18px;
  cursor: pointer;
  border: none;
  color: white;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(79, 70, 229, 0.28);
}

.danger {
  background: #dc2626;
}

.btn-estrela {
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
  box-shadow: none;
}

.btn-estrela.ativo {
  background: #4338ca;
  color: white;
}

.btn-bloco,
.rodape-acoes button {
  margin-top: 10px;
}

pre {
  background: #eef2ff;
  padding: 22px;
  overflow-x: auto;
  border-radius: 22px;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

@media (max-width: 1024px) {
  .bloco-topo {
    grid-template-columns: 1fr;
  }

  .opcao,
  .variavel-item {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .container {
    padding: 18px;
  }

  .topo {
    flex-direction: column;
    align-items: flex-start;
  }

  .formulario,
  .bloco,
  .equacao-box,
  pre {
    padding: 22px;
  }

  .acoes,
  .acoes-pergunta,
  .rodape-acoes {
    justify-content: flex-start;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>