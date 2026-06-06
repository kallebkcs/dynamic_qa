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
        "/criacao-questionario"
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
  max-width: 1120px;
  margin: 40px auto;
  padding: 28px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.15);
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 28px 32px;
  margin-bottom: 26px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 28px;
  color: white;
  box-shadow: 0 18px 40px rgba(102, 126, 234, 0.22);
}

.topo h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}

.acoes {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

button {
  padding: 14px 26px;
  border: none;
  border-radius: 999px;
  background: #1f2937;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.18);
}

button.danger {
  background: #ef4444;
}

.card {
  margin-top: 24px;
  padding: 28px 30px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.card h2 {
  font-size: 1.5rem;
  margin-bottom: 22px;
  color: #111827;
}

.campo {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 18px 20px;
  align-items: center;
  margin-bottom: 18px;
}

.campo label {
  font-weight: 600;
  color: #334155;
}

input,
select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  font-size: 1rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
}

.card > button {
  margin-top: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 14px 30px rgba(102, 126, 234, 0.24);
}

.card > button:hover {
  background: linear-gradient(135deg, #5562d3 0%, #653d98 100%);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  margin-top: 8px;
}

thead th {
  padding: 16px 18px;
  text-align: left;
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

tbody tr {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.1);
}

th,
td {
  padding: 16px 18px;
  border: none;
}

tbody td {
  color: #334155;
}

tbody tr td:last-child {
  display: flex;
  gap: 10px;
}

@media (max-width: 900px) {
  .container {
    padding: 22px;
  }

  .topo {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
  }

  .acoes {
    justify-content: flex-start;
    width: 100%;
  }

  .card {
    padding: 24px;
  }

  .campo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    margin: 20px auto;
    padding: 18px;
  }

  .topo h1 {
    font-size: 1.6rem;
  }

  .acoes {
    flex-direction: column;
  }

  .card {
    padding: 20px;
  }

  .campo {
    gap: 12px;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  thead th {
    min-width: 160px;
  }
}
</style>