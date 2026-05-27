<template>
  <div class="container">
    <header class="topo">
      <h1>Área do Coordenador</h1>

      <div class="acoes">
        <button @click="irParaCriarQuestionario">
          Criar Questionário
        </button>

        <button @click="sair">
          Sair
        </button>
      </div>
    </header>

    <!-- CADASTRO DE MONITOR -->

    <section class="card">
      <h2>Cadastrar Monitor</h2>

      <div class="campo">
        <label>Nome:</label>

        <input
          v-model="monitor.nome"
          type="text"
          placeholder="Nome do monitor"
        />
      </div>

      <div class="campo">
        <label>CPF:</label>

        <input
          v-model="monitor.cpf"
          type="text"
          placeholder="CPF do monitor"
          @input="formatarCPFMonitor"
        />
      </div>

      <div class="campo">
        <label>Email:</label>

        <input
          v-model="monitor.email"
          type="email"
          placeholder="Email do monitor"
        />
      </div>

      <button @click="cadastrarMonitor">
        Cadastrar Monitor
      </button>
    </section>

    <!-- LISTA DE MONITORES -->

    <section class="card">
      <h2>Monitores cadastrados</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="monitores.length === 0">
            <td colspan="4">
              Nenhum monitor cadastrado.
            </td>
          </tr>

          <tr
            v-for="monitor in monitores"
            :key="monitor.cpf"
          >
            <td>{{ monitor.nome }}</td>
            <td>{{ monitor.cpf }}</td>
            <td>{{ monitor.email }}</td>

            <td>
              <button
                class="danger"
                @click="removerMonitor(monitor.cpf)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- CADASTRO DE PACIENTE -->

    <section class="card">
      <h2>Cadastrar Paciente</h2>

      <div class="campo">
        <label>Nome do paciente:</label>

        <input
          v-model="paciente.nome"
          type="text"
          placeholder="Nome do paciente"
        />
      </div>

      <div class="campo">
        <label>CPF do paciente:</label>

        <input
          v-model="paciente.cpf"
          type="text"
          placeholder="CPF do paciente"
          @input="formatarCPFPaciente"
        />
      </div>

      <div class="campo">
        <label>CEP:</label>

        <input
          v-model="paciente.cep"
          type="text"
          placeholder="CEP do paciente"
          @input="formatarCEP"
        />
      </div>

      <div class="campo">
        <label>Estado:</label>

        <input
          v-model="paciente.estado"
          type="text"
          placeholder="Estado do paciente"
        />
      </div>

      <div class="campo">
        <label>Selecionar Monitor:</label>

        <select v-model="paciente.monitorCpf">
          <option value="">
            Selecione um monitor
          </option>

          <option
            v-for="monitor in monitores"
            :key="monitor.cpf"
            :value="monitor.cpf"
          >
            {{ monitor.nome }}
          </option>
        </select>
      </div>

      <button @click="cadastrarPaciente">
        Cadastrar Paciente
      </button>
    </section>

    <!-- LISTA DE PACIENTES -->

    <section class="card">
      <h2>Pacientes cadastrados</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>CEP</th>
            <th>Estado</th>
            <th>Monitor</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="pacientes.length === 0">
            <td colspan="6">
              Nenhum paciente cadastrado.
            </td>
          </tr>

          <tr
            v-for="paciente in pacientes"
            :key="paciente.cpf"
          >
            <td>{{ paciente.nome }}</td>
            <td>{{ paciente.cpf }}</td>
            <td>{{ paciente.cep }}</td>
            <td>{{ paciente.estado }}</td>

            <td>
              {{ buscarNomeMonitor(paciente.monitorCpf) }}
            </td>

            <td>
              <button
                class="danger"
                @click="removerPaciente(paciente.cpf)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  name: "CoordenadorView",

  data() {
    return {
      usuarioLogado: null,

      monitor: {
        nome: "",
        cpf: "",
        email: "",
        perfil: "monitor"
      },

      paciente: {
        nome: "",
        cpf: "",
        cep: "",
        estado: "",
        monitorCpf: ""
      },

      monitores: [],
      pacientes: []
    }
  },

  created() {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    )

    if (!usuario || usuario.perfil !== "coordenador") {
      this.$router.push("/login")
      return
    }

    this.usuarioLogado = usuario

    const monitoresSalvos =
      localStorage.getItem("monitores")

    this.monitores = monitoresSalvos
      ? JSON.parse(monitoresSalvos)
      : []

    const pacientesSalvos =
      localStorage.getItem("pacientes")

    this.pacientes = pacientesSalvos
      ? JSON.parse(pacientesSalvos)
      : []
  },

  methods: {
    limparCPF(cpf) {
      return cpf.replace(/\D/g, "")
    },

    formatarCPFMonitor() {
      this.monitor.cpf = this.monitor.cpf
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    },

    formatarCPFPaciente() {
      this.paciente.cpf = this.paciente.cpf
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    },

    formatarCEP() {
      this.paciente.cep = this.paciente.cep
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, "$1-$2")
    },

    validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },

    cadastrarMonitor() {
      if (
        !this.monitor.nome ||
        !this.monitor.cpf ||
        !this.monitor.email
      ) {
        alert("Preencha todos os campos.")
        return
      }

      const cpfJaExiste = this.monitores.some(
        monitor =>
          this.limparCPF(monitor.cpf) ===
          this.limparCPF(this.monitor.cpf)
      )

      if (cpfJaExiste) {
        alert("CPF já cadastrado.")
        return
      }

      const emailJaExiste = this.monitores.some(
        monitor =>
          monitor.email.toLowerCase() ===
          this.monitor.email.toLowerCase()
      )

      if (emailJaExiste) {
        alert("Email já cadastrado.")
        return
      }

      if (!this.validarEmail(this.monitor.email)) {
        alert("Email inválido.")
        return
      }

      const novoMonitor = {
        nome: this.monitor.nome,
        cpf: this.monitor.cpf,
        email: this.monitor.email,
        perfil: "monitor",
        cadastradoPor: this.usuarioLogado.cpf
      }

      this.monitores.push(novoMonitor)

      localStorage.setItem(
        "monitores",
        JSON.stringify(this.monitores)
      )

      this.monitor = {
        nome: "",
        cpf: "",
        email: "",
        perfil: "monitor"
      }

      alert("Monitor cadastrado com sucesso!")
    },

    removerMonitor(cpf) {
      const confirmar = confirm(
        "Deseja remover este monitor?"
      )

      if (!confirmar) {
        return
      }

      this.monitores = this.monitores.filter(
        monitor =>
          this.limparCPF(monitor.cpf) !==
          this.limparCPF(cpf)
      )

      localStorage.setItem(
        "monitores",
        JSON.stringify(this.monitores)
      )

      alert("Monitor removido com sucesso!")
    },

    cadastrarPaciente() {
      if (
        !this.paciente.nome ||
        !this.paciente.cpf ||
        !this.paciente.cep ||
        !this.paciente.estado ||
        !this.paciente.monitorCpf
      ) {
        alert("Preencha todos os campos.")
        return
      }

      const cpfJaExiste = this.pacientes.some(
        paciente =>
          this.limparCPF(paciente.cpf) ===
          this.limparCPF(this.paciente.cpf)
      )

      if (cpfJaExiste) {
        alert("Paciente já cadastrado.")
        return
      }

      const novoPaciente = {
        nome: this.paciente.nome,
        cpf: this.paciente.cpf,
        cep: this.paciente.cep,
        estado: this.paciente.estado,
        monitorCpf: this.paciente.monitorCpf,
        cadastradoPor: this.usuarioLogado.cpf
      }

      this.pacientes.push(novoPaciente)

      localStorage.setItem(
        "pacientes",
        JSON.stringify(this.pacientes)
      )

      this.paciente = {
        nome: "",
        cpf: "",
        cep: "",
        estado: "",
        monitorCpf: ""
      }

      alert("Paciente cadastrado com sucesso!")
    },

    removerPaciente(cpf) {
      const confirmar = confirm(
        "Deseja remover este paciente?"
      )

      if (!confirmar) {
        return
      }

      this.pacientes = this.pacientes.filter(
        paciente =>
          this.limparCPF(paciente.cpf) !==
          this.limparCPF(cpf)
      )

      localStorage.setItem(
        "pacientes",
        JSON.stringify(this.pacientes)
      )

      alert("Paciente removido com sucesso!")
    },

    buscarNomeMonitor(cpf) {
      const monitor = this.monitores.find(
        monitor => monitor.cpf === cpf
      )

      return monitor
        ? monitor.nome
        : "Monitor não encontrado"
    },

    irParaCriarQuestionario() {
      this.$router.push(
        "/criacao-questionario-2"
      )
    },

    sair() {
      localStorage.removeItem(
        "usuarioLogado"
      )

      this.$router.push("/login")
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.acoes {
  display: flex;
  gap: 10px;
}

.card {
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

input,
select {
  padding: 10px;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 6px;
  background: #222;
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

.danger {
  background: #c62828;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
</style>