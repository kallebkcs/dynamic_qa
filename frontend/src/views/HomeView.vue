<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AvisoToast from '@/components/AvisoToast.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const questionarios = ref([])

const perfilUsuario = ref('');

// Fixed Components
const toastRef = ref(null);
const confirmRef = ref(null);

// Considerando que tenho o idCoordenador
const idCoordenador = ref('id_do_coordenador_atual');

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
  // Recupera usuário logado
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (usuario) {
    perfilUsuario.value = usuario.perfil;
  } else {
    router.push('/');
    return;
  }

  // Fecha menu ao clicar fora
  document.addEventListener('click', fecharMenuAoClicarFora);

  // Toast de retorno
  if (history.state && history.state.toastMsg) {
    toastRef.value.mostrar(
      history.state.toastMsg,
      history.state.toastTipo || 'sucesso'
    );

    history.replaceState(
      {
        ...history.state,
        toastMsg: undefined,
        toastTipo: undefined
      },
      document.title
    );
  }

  carregarQuestionarios();
});

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuAoClicarFora);
});

// Busca os dados do backend
const carregarQuestionarios = async () => {
  try {

    const usuario = JSON.parse(
      localStorage.getItem('usuarioLogado')
    );

    let url = 'http://localhost:3000/api/questionarios';

    if (usuario.perfil === 'monitor') {
      url = `http://localhost:3000/api/questionarios/monitor/${usuario.cpf}`;
    }

    const response = await fetch(url);

    if (response.ok) {

      const dados = await response.json();

      questionarios.value = dados.map(q => ({
        ...q,
        idPlanilhaCoordenador: null
      }));

    }

  } catch (error) {

    console.error(
      "Erro ao carregar questionários:",
      error
    );

  }
}

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
    a.download = `${id || titulo || 'questionario_exportado'}.json`;
    a.click();
    
    // Faxina
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    toastRef.value.mostrar(`Erro na exportação.`, "erro");
  }
};

// Importar questionário
const inputArquivo = ref(null);
const modalConflitoAberto = ref(false);
const novoIdInput = ref('');
const questionarioPendente = ref(null);
const espertinhoRef = ref(false);

const abrirSeletorArquivo = () => {
  inputArquivo.value.click(); // Finge que o usuário clicou no input invisível
};

// Validação do questionário
const validarEstruturaQuestionario = (q) => {
  if (!q || typeof q !== 'object' || Array.isArray(q)) return false;
  
  if (!q.titulo || typeof q.titulo !== 'string' || q.titulo.trim() === '') return false;
  if (!q.idInterno || typeof q.idInterno !== 'string' || q.idInterno.trim() === '') return false;

  if (!Array.isArray(q.blocos) || q.blocos.length === 0) return false;

  const temPerguntas = q.blocos.some(bloco => 
    Array.isArray(bloco.perguntas) && bloco.perguntas.length > 0
  );
  
  if (!temPerguntas) return false;

  return true;
};

const processarImportacao = (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const questionarioImportado = JSON.parse(e.target.result);

      if (!validarEstruturaQuestionario(questionarioImportado)) {
        toastRef.value.mostrar("O arquivo não corresponde a um questionário válido. Tente novamente.", "erro");
        return;
      }

      delete questionarioImportado._id;
      questionarioImportado.vinculos = []; // Nasce sem planilhas vinculadas
      
      tentarSalvarImportacao(questionarioImportado);
    } catch (err) {
      toastRef.value.mostrar("O arquivo está corrompido ou mal formatado.", "erro");
    } finally {
      event.target.value = ''; 
    }
  };

  reader.readAsText(arquivo);
};

const tentarSalvarImportacao = async (questionario, espertinho=false) => {
  try {
    const res = await fetch('http://localhost:3000/api/questionarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionario)
    });

    if (res.ok) {
      toastRef.value.mostrar("Questionário importado com sucesso!", "sucesso");
      espertinhoRef.value = false;
      fecharModalConflito();
      carregarQuestionarios();
    } else {
      const erro = await res.json();
      
      // Verifica se é o erro de ID duplicado do nosso Controller
      if (res.status === 400 && erro.erro.includes('Um questionário com esse ID já existe')) {
        if (espertinho) espertinhoRef.value = true;
        // Trava o questionário na memória e abre o modal pedindo um novo ID
        questionarioPendente.value = questionario;
        novoIdInput.value = questionario.idInterno + '_copia'; // Já dá uma sugestão amigável
        modalConflitoAberto.value = true;
      } else {
        toastRef.value.mostrar(`Erro ao importar: ${erro.erro}`, "erro");
      }
    }
  } catch (err) {
    console.error(err);
    toastRef.value.mostrar('Falha na comunicação com o banco de dados.', "erro");
  }
};

// Ações do Modal de Conflito
const confirmarNovoId = () => {
  if (!novoIdInput.value.trim()) {
    toastRef.value.mostrar('Digite um identificador válido.', "erro");
    return;
  }
  // Atualiza o ID do objeto pendente e tenta salvar de novo
  questionarioPendente.value.idInterno = novoIdInput.value.trim();
  tentarSalvarImportacao(questionarioPendente.value, true);
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
  // Confirmação
  const temCerteza = await confirmRef.value.mostrar(`Tem certeza que deseja excluir este questionário? Essa ação não pode ser desfeita.`);
  if (!temCerteza) return;

  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${id}`, {method: 'DELETE'});
    if (res.ok) {
      toastRef.value.mostrar('Questionário deletado com sucesso', "sucesso");
      questionarios.value = questionarios.value.filter(q => q.idInterno !== id);
    } else {
      toastRef.value.mostrar('Erro ao deletar questionário.', "erro");
    }
  } catch (err) {
    toastRef.value.mostrar('Erro de conexão: ' + err, "erro");
    console.error("Erro ao deletar questionário: ", err);
  }
}

</script>

<template>
  <!-- Fixed Component -->
  <AvisoToast ref="toastRef" />
  <ConfirmModal ref="confirmRef" />

  <main class="home-view">
    <header class="topo">
      <h1>Questionários</h1>
      <div class="acoes">
        <template v-if="perfilUsuario !== 'monitor'">
           <button class="btn-cadastrar" @click="router.push('/coordenador')">Cadastrar Monitor/Paciente</button>
        </template>
        <template v-if="perfilUsuario !== 'coordenador'">
           <button class="btn-cadastrar" @click="router.push('/monitor')">Meus Pacientes</button>
        </template>
      </div> 
    </header>

    <div v-if="questionarios.length === 0">Nenhum questionário disponível.</div>

    <div v-else class="lista">
      <div v-for="q in questionarios" :key="q.idInterno" class="item-questionario">
        <div class="info">
          <strong>{{ q.titulo }}</strong>
          <p>{{ q.descricao || 'Sem descrição.' }}</p>
        </div>
        
        <div class="acoes">
          <button @click="navegarParaQuestionario(q.idInterno)">INICIAR</button>
          <div v-if="perfilUsuario !== 'monitor'" class="dropdown-container">
            <button @click="toggleMenu(q.idInterno)" class="btn-pontinhos">&#8942;</button>
            <div v-show="menuAbertoId === q.idInterno" class="dropdown-menu">
              <button @click="router.push(`/edicao-questionario/${q.idInterno}`); menuAbertoId = null">EDITAR</button>
              <button @click="router.push({path: '/criacao-questionario', query: {clone: q.idInterno}}); menuAbertoId = null">EDITAR CÓPIA</button>
              <!--<button v-if="!q.idPlanilhaCoordenador" @click="abrirModal(q); menuAbertoId = null">VINCULAR PLANILHA</button>
              <div v-else>
                <a :href="`https://docs.google.com/spreadsheets/d/${q.idPlanilhaCoordenador}/edit`" target="_blank" class="button-link">ABRIR PLANILHA</a>
                <button @click="abrirModal(q); menuAbertoId = null">ALTERAR PLANILHA</button>
              </div>-->
              <button @click="router.push(`/respostas/${q.idInterno}`)">RESPOSTAS</button>
              <button @click="exportarQuestionario(q.idInterno, q.titulo); menuAbertoId = null">EXPORTAR</button>
              <button class="danger" @click="excluirQuestionario(q.idInterno); menuAbertoId = null">EXCLUIR</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="perfilUsuario !== 'monitor'">
    <button @click="router.push('/criacao-questionario')">CRIAR QUESTIONÁRIO</button>
    <input 
      type="file" 
      ref="inputArquivo" 
      accept=".json" 
      style="display: none" 
      @change="processarImportacao" 
    />
    <button @click="abrirSeletorArquivo">IMPORTAR QUESTIONÁRIO</button>
    </template>
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
      <p v-if="espertinhoRef" style="color: #F00;">Coloque um ID válido, por favor. Ou você está sendo um espertinho?</p>
      <div class="modal-acoes">
        <button @click="cancelarImportacao">Cancelar</button>
        <button @click="confirmarNovoId">Tentar Novamente</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1120px;
  margin: 40px auto;
  padding: 28px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
  background: rgba(148, 163, 184, 0.35);
  border-radius: 32px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-bottom: 18px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.topo h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}

.acoes {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.item-questionario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(148, 163, 184, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 24px;
  padding: 22px 24px;
  margin-bottom: 16px;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
}

.info p {
  margin: 5px 0 0 0;
  font-size: 0.9em;
  color: #666;
}

button {
  padding: 12px 18px;
  cursor: pointer;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.18);
}

button.secondary {
  background: #4b5563;
}

button.danger {
  background: #ef4444;
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
  background: rgba(148, 163, 184, 0.28);
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
  background: #eeeeee00;
}

.lista {
  display: grid;
  gap: 16px;
}

.vazio {
  padding: 18px 20px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #475569;
  margin-bottom: 18px;
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
  background-color: rgba(148, 163, 184, 0.082);
  min-width: 180px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

</style>