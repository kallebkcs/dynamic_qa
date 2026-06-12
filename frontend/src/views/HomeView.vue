<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// Abrir opções de questionário //
const menuAbertoId = ref(null);
const toggleMenu = (id) => {
  menuAbertoId.value = menuAbertoId.value === id ? null : id;
};

const fecharMenuAoClicarFora = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    menuAbertoId.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', fecharMenuAoClicarFora);
});

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuAoClicarFora);
});

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

// Exportar
const exportarQuestionario = async (id, titulo) => {
  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${id}`);
    const dados = await res.json();
    dados.vinculos = []; 
    
    // Cria um arquivo invisível na memória do navegador e força o clique
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titulo || 'questionario_exportado'}.json`;
    a.click();
    
    // Faxina
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Erro na exportação.');
  }
};

// Importar questionário
const inputArquivo = ref(null);
const modalConflitoAberto = ref(false);
const novoIdInput = ref('');
const questionarioPendente = ref(null);

const abrirSeletorArquivo = () => {
  inputArquivo.value.click(); // Finge que o usuário clicou no input invisível
};

const processarImportacao = (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const questionarioImportado = JSON.parse(e.target.result);
      delete questionarioImportado._id;
      questionarioImportado.vinculos = []; // Nasce sem planilhas vinculadas
      
      tentarSalvarImportacao(questionarioImportado);
    } catch (err) {
      alert('Isso aí não é um JSON válido. Tenta de novo.');
    } finally {
      // Reseta o input para permitir importar o mesmo arquivo duas vezes seguidas se o usuário for teimoso
      event.target.value = ''; 
    }
  };

  reader.readAsText(arquivo);
};

const tentarSalvarImportacao = async (questionario) => {
  try {
    const res = await fetch('http://localhost:3000/api/questionarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionario)
    });

    if (res.ok) {
      alert('Questionário importado com sucesso!');
      fecharModalConflito();
      carregarQuestionarios();
    } else {
      const erro = await res.json();
      
      // Verifica se é o erro de ID duplicado do nosso Controller
      if (res.status === 400 && erro.erro.includes('Um questionário com esse ID já existe')) {
        // Trava o questionário na memória e abre o modal pedindo um novo ID
        questionarioPendente.value = questionario;
        novoIdInput.value = questionario.idInterno + '_copia'; // Já dá uma sugestão amigável
        modalConflitoAberto.value = true;
      } else {
        alert(`Erro ao importar: ${erro.erro}`);
      }
    }
  } catch (err) {
    console.error(err);
    alert('Falha na comunicação com o banco de dados.');
  }
};

// Ações do Modal de Conflito
const confirmarNovoId = () => {
  if (!novoIdInput.value.trim()) {
    alert("Digite um identificador válido.");
    return;
  }
  // Atualiza o ID do objeto pendente e tenta salvar de novo
  questionarioPendente.value.idInterno = novoIdInput.value.trim();
  tentarSalvarImportacao(questionarioPendente.value);
};

const cancelarImportacao = () => {
  fecharModalConflito();
};

const fecharModalConflito = () => {
  modalConflitoAberto.value = false;
  questionarioPendente.value = null;
  novoIdInput.value = '';
};

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
          <button @click="navegarParaQuestionario(q.idInterno)">INICIAR</button>
          <div class="dropdown-container">
            <button @click="toggleMenu(q.idInterno)" class="btn-pontinhos">&#8942;</button>
            <div v-show="menuAbertoId === q.idInterno" class="dropdown-menu">
              <button @click="router.push(`/edicao-questionario/${q.idInterno}`); menuAbertoId = null">EDITAR</button>
              <button @click="router.push({path: '/criacao-questionario', query: {clone: q.idInterno}}); menuAbertoId = null">EDITAR CÓPIA</button>
              <button v-if="!q.idPlanilhaCoordenador" @click="abrirModal(q); menuAbertoId = null">VINCULAR PLANILHA</button>
              <div v-else>
                <a :href="`https://docs.google.com/spreadsheets/d/${q.idPlanilhaCoordenador}/edit`" target="_blank" class="button-link">ABRIR PLANILHA</a>
                <button @click="abrirModal(q); menuAbertoId = null">ALTERAR PLANILHA</button>
              </div>
              <button @click="exportarQuestionario(q.idInterno, q.titulo); menuAbertoId = null">EXPORTAR</button>
              <button class="danger" @click="excluirQuestionario(q.idInterno); menuAbertoId = null">EXCLUIR</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button @click="router.push('/criacao-questionario')">CRIAR QUESTIONÁRIO</button>
    <input 
      type="file" 
      ref="inputArquivo" 
      accept=".json" 
      style="display: none" 
      @change="processarImportacao" 
    />
    <button @click="abrirSeletorArquivo">IMPORTAR QUESTIONÁRIO</button>
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

  <div v-if="modalConflitoAberto" class="modal-overlay">
    <div class="modal-content">
      <h3>Conflito de Identificador</h3>
      <p>
        O identificador <strong>{{ questionarioPendente?.idInterno }}</strong> já está sendo utilizado por outro questionário no banco de dados.
      </p>
      <p>Atribua um novo identificador para concluir a importação:</p>
      
      <input type="text" v-model="novoIdInput" pattern="^[a-z0-9_]+$" placeholder="Ex: meu-questionario-v2" />
      <small style="color: #666;">Apenas letras, números e underscore (_).</small>
      
      <div class="modal-acoes">
        <button @click="cancelarImportacao">Cancelar</button>
        <button @click="confirmarNovoId">Tentar Novamente</button>
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

.dropdown-menu button, 
.dropdown-menu .button-link {
  display: block;
  width: 100%;
  box-sizing: border-box; 
  margin: 0;
  
  font-family: inherit; 
  font-weight: 700;
  font-size: 1rem; 
  
  text-decoration: none;
  color: black;
  background: white;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  
  border: 1px solid black;
  border-top: none;
}
.dropdown-menu button:first-child {
  border-top: 1px solid black;
}

button:hover, .button-link:hover {
  background: #eee;
}

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

.modal-content {
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

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  min-width: 180px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}
</style>