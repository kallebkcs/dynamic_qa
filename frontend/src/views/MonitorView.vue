<template>
  <div class="container">
    <header class="topo">
      <h1>Área do Monitor</h1>

      <button @click="sair">
        Sair
      </button>
    </header>

    <!-- PACIENTES -->

    <section class="card">
      <h2>Meus Pacientes</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="pacientes.length === 0">
            <td colspan="2">
              Nenhum paciente vinculado.
            </td>
          </tr>

          <tr
            v-for="paciente in pacientes"
            :key="paciente.cpf"
          >
            <td>{{ paciente.nome }}</td>
            <td>{{ paciente.cpf }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- QUESTIONÁRIOS -->

    <section class="card">
      <h2>Questionários Disponíveis</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Identificador</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="questionarios.length === 0">
            <td colspan="3">
              Nenhum questionário disponível.
            </td>
          </tr>

          <tr
            v-for="questionario in questionarios"
            :key="questionario.identificador"
          >
            <td>{{ questionario.nome }}</td>

            <td>
              {{ questionario.descricao }}
            </td>

            <td>
              {{ questionario.identificador }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  name: "MonitorView",

  data() {
    return {
      usuarioLogado: null,

      pacientes: [],

      questionarios: []
    }
  },

  created() {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    )

    if (!usuario || usuario.perfil !== "monitor") {
      this.$router.push("/login")
      return
    }

    this.usuarioLogado = usuario

    // =========================
    // PACIENTES
    // =========================

    const pacientesSalvos = JSON.parse(
      localStorage.getItem("pacientes")
    ) || []

    this.pacientes = pacientesSalvos.filter(
      paciente =>
        this.limparCPF(paciente.monitorCpf) ===
        this.limparCPF(usuario.cpf)
    )

    // =========================
    // QUESTIONÁRIOS
    // =========================

    const questionariosSalvos = JSON.parse(
      localStorage.getItem("questionarios")
    ) || []

    this.questionarios = questionariosSalvos.filter(
      questionario =>
        this.limparCPF(questionario.criadoPor) ===
        this.limparCPF(usuario.cadastradoPor)
    )
  },

  methods: {
    limparCPF(cpf) {
      return cpf.replace(/\D/g, "")
    },

    sair() {
      localStorage.removeItem("usuarioLogado")

      this.$router.push("/login")
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

button {
  padding: 10px 14px;
  background: #222;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

th {
  background: #f4f4f4;
}
</style>