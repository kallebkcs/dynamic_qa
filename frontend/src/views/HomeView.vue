<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const questionarios = ref([])

// Considerando que tenho o idCoordenador
const idCoordenador = ref('id_do_coordenador_atual');

// Modal de vínculo de questionário
const modalAberto = ref(false);
const idPlanilhaInput = ref('');
const questionarioAlvo = ref(null);

const abrirModal = (questionario) => {
  questionarioAlvo.value = questionario;
  idPlanilhaInput.value = questionario.idPlanilhaCoordenador || ''; // Já preenche se for alteração
  modalAberto.value = true;
};

const fecharModal = () => {
  modalAberto.value = false;
  idPlanilhaInput.value = '';
  questionarioAlvo.value = null;
};

const salvarVinculo = async () => {
  if (!idPlanilhaInput.value.trim()) {
    alert("Coloque um ID válido antes de salvar.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${questionarioAlvo.value.idInterno}/planilha`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idPlanilha: idPlanilhaInput.value.trim(), idCoordenador: idCoordenador.value })
    });

    if (res.ok) {
      const data = await res.json();
      // Atualiza visualmente o questionário na lista sem precisar recarregar a página
      questionarioAlvo.value.idPlanilhaCoordenador = idPlanilhaInput.value.trim();
      alert("Planilha vinculada e cabeçalhos gerados!");
      fecharModal();
    } else {
      const err = await res.json();
      alert(`Erro: ${err.erro}`);
    }
  } catch (err) {
    console.error(err);
    alert("Falha ao comunicar com o servidor.");
  }
};

// Busca os dados do backend
const carregarQuestionarios = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/questionarios')
    if (response.ok) {
      const dados = await response.json();
      questionarios.value = dados.map(q => {
        const vinculo = q.vinculos?.find(v => v.idCoordenador === idCoordenador.value);
        return {
          ...q,
          idPlanilhaCoordenador: vinculo ? vinculo.idPlanilha : null
        };
      });
    }
  } catch (error) {
    console.error("Erro ao carregar questionários:", error)
  }
}

// Executa ao abrir a página
onMounted(carregarQuestionarios)

// Função para navegar até a página do questionário específico
const navegarParaQuestionario = (id) => {
  router.push(`/questionario/${id}`)
}

// Excluir questionário
const excluirQuestionario = async (id) => {
  if (!window.confirm("Você tem certeza que deseja apagar este questionário? Essa ação não tem volta.")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${id}`, {method: 'DELETE'});
    if (res.ok) {
      alert('Questionário deletado com sucesso');
      questionarios.value = questionarios.value.filter(q => q.idInterno !== id);
    } else {
      alert('Erro ao deletar questionário.')
    }
  } catch (err) {
    alert('Erro de conexão: ' + err);
    console.error("Erro ao deletar questionário: ", err);
  }
}

</script>

<template>
  <main class="home-view">
    <h2>Questionários</h2>

    <div v-if="questionarios.length === 0">Nenhum questionário disponível.</div>

    <div v-else class="lista">
      <div v-for="q in questionarios" :key="q.idInterno" class="item-questionario">
        <div class="info">
          <strong>{{ q.titulo }}</strong>
          <p>{{ q.descricao || 'Sem descrição.' }}</p>
        </div>
        
        <div class="acoes">
          <button @click="navegarParaQuestionario(q.idInterno)">
            INICIAR
          </button>
          <button @click="router.push(`/edicao-questionario/${q.idInterno}`)">EDITAR</button>
          <button @click="router.push({path: '/criacao-questionario', query: {clone: q.idInterno}})">EDITAR CÓPIA</button>
          <button v-if="!q.idPlanilhaCoordenador" @click="abrirModal(q)">VINCULAR PLANILHA</button>
          <div v-else>
            <a :href="`https://docs.google.com/spreadsheets/d/${q.idPlanilhaCoordenador}/edit`" target="_blank">ABRIR PLANILHA</a>
            <button @click="abrirModal(q)">ALTERAR PLANILHA</button>
          </div>
          <button class="danger" @click="excluirQuestionario(q.idInterno)">EXCLUIR</button>
        </div>
      </div>
    </div>

    <button @click="router.push('/criacao-questionario')">Criar questionário</button>
  </main>

  <div v-if="modalAberto" class="modal-overlay">
    <div class="modal-content">
      <h3>Vincular Planilha do Google</h3>
      <p>
        1. Crie uma planilha em branco no Google Sheets.<br>
        2. Compartilhe-a como <strong>"Editor"</strong> com o e-mail da nossa API: <br>
        <code>planilhas@dynamic-qa.iam.gserviceaccount.com</code><br>
        3. Cole o ID da planilha abaixo (as letras aleatórias após o <code>/spreadsheets/d/</code>).
      </p>
      
      <input type="text" v-model="idPlanilhaInput" placeholder="Ex: 1BxiMVs0XRY..." />
      
      <div class="modal-acoes">
        <button @click="fecharModal">CANCELAR</button>
        <button @click="salvarVinculo">SALVAR VÍNCULO</button>
    </div>
  </div>
</div>
</template>

<style scoped>
.home-view {
  padding: 20px;
}

.item-questionario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #000;
  padding: 15px;
  margin-bottom: 10px;
}

.info p {
  margin: 5px 0 0 0;
  font-size: 0.9em;
  color: #666;
}

button {
  padding: 10px 15px;
  cursor: pointer;
  border: 1px solid #000;
  background: #fff;
  font-weight: bold;
}

button:hover {
  background: #eee;
}
</style>