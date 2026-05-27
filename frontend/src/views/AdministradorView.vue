<template>
  <div class="container">
    <header class="topo">
      <h1>Área do Administrador</h1>
      <button @click="sair">Sair</button>
    </header>

    <section class="card">
      <h2>Cadastrar Coordenador</h2>

      <div class="campo">
        <label>Nome:</label>
        <input v-model="coordenador.nome" type="text" />
      </div>

      <div class="campo">
        <label>CPF:</label>
        <input
          v-model="coordenador.cpf"
          type="text"
          placeholder="CPF do coordenador"
          maxlength="14"
          @input="formatarCPF"
        />
      </div>

      <div class="campo">
        <label>Email:</label>
        <input v-model="coordenador.email" type="email" />
      </div>

      <button @click="cadastrarCoordenador">
        Cadastrar Coordenador
      </button>
    </section>

    <section class="card">
      <h2>Coordenadores cadastrados</h2>

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
          <tr v-if="coordenadores.length === 0">
            <td colspan="4">Nenhum coordenador cadastrado.</td>
          </tr>

          <tr v-for="coord in coordenadores" :key="coord.cpf">
            <td>{{ coord.nome }}</td>
            <td>{{ coord.cpf }}</td>
            <td>{{ coord.email }}</td>
            <td>
              <button
                class="danger"
                @click="removerCoordenador(coord.cpf)"
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
  name: "AdministradorView",

  data() {
    return {
      coordenador: {
        nome: "",
        cpf: "",
        email: "",
        perfil: "coordenador"
      },

      coordenadores: []
    }
  },

  created() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"))

    if (!usuario || usuario.perfil !== "administrador") {
      this.$router.push("/login")
      return
    }

    this.carregarCoordenadores()
  },

  methods: {
    carregarCoordenadores() {
      const salvos = localStorage.getItem("coordenadores")
      this.coordenadores = salvos ? JSON.parse(salvos) : []
    },

    salvarCoordenadores() {
      localStorage.setItem(
        "coordenadores",
        JSON.stringify(this.coordenadores)
      )
    },

    formatarCPF() {
      this.coordenador.cpf = this.coordenador.cpf
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    },

    limparCPF(cpf) {
      return cpf.replace(/\D/g, "")
    },

    validarCPF(cpf) {
      cpf = this.limparCPF(cpf)

      if (cpf.length !== 11) {
        return false
      }

      if (/^(\d)\1+$/.test(cpf)) {
        return false
      }

      let soma = 0
      let resto = 0

      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
      }

      resto = (soma * 10) % 11

      if (resto === 10 || resto === 11) {
        resto = 0
      }

      if (resto !== parseInt(cpf.substring(9, 10))) {
        return false
      }

      soma = 0

      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
      }

      resto = (soma * 10) % 11

      if (resto === 10 || resto === 11) {
        resto = 0
      }

      if (resto !== parseInt(cpf.substring(10, 11))) {
        return false
      }

      return true
    },

    validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },

    cadastrarCoordenador() {
      if (
        !this.coordenador.nome ||
        !this.coordenador.cpf ||
        !this.coordenador.email
      ) {
        alert("Preencha todos os campos.")
        return
      }

      if (!this.validarCPF(this.coordenador.cpf)) {
        alert("CPF inválido.")
        return
      }

      if (!this.validarEmail(this.coordenador.email)) {
        alert("Email inválido.")
        return
      }

      const cpfNovo = this.limparCPF(this.coordenador.cpf)

      const cpfJaExiste = this.coordenadores.some(
        coord => this.limparCPF(coord.cpf) === cpfNovo
      )

      if (cpfJaExiste) {
        alert("Já existe um coordenador com esse CPF.")
        return
      }

      const emailNovo = this.coordenador.email.toLowerCase().trim()

      const emailJaExiste = this.coordenadores.some(
        coord => coord.email.toLowerCase().trim() === emailNovo
      )

      if (emailJaExiste) {
        alert("Já existe um coordenador com esse email.")
        return
      }

      this.coordenadores.push({
        nome: this.coordenador.nome.trim(),
        cpf: this.coordenador.cpf,
        email: this.coordenador.email.trim(),
        perfil: "coordenador"
      })

      this.salvarCoordenadores()

      this.coordenador = {
        nome: "",
        cpf: "",
        email: "",
        perfil: "coordenador"
      }

      alert("Coordenador cadastrado com sucesso!")
    },

    removerCoordenador(cpf) {
      const confirmacao = confirm(
        "Tem certeza que deseja excluir este coordenador?"
      )

      if (!confirmacao) {
        return
      }

      const cpfParaRemover = this.limparCPF(cpf)

      this.coordenadores = this.coordenadores.filter(
        coord => this.limparCPF(coord.cpf) !== cpfParaRemover
      )

      this.salvarCoordenadores()

      alert("Coordenador removido com sucesso!")
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
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

input {
  padding: 8px;
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
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
}

.danger {
  background: #c00;
}
</style>