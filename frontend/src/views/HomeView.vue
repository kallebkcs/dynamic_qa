<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const questionarios = ref([])

// Busca os dados do backend
const carregarQuestionarios = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/questionarios')
    questionarios.value = await response.json()
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
        </div>
      </div>
    </div>
  </main>
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