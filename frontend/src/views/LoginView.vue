<template>
  <div class="container">
    <div class="card-login">
      <h1>Login</h1>

      <div class="campo">
        <label>CPF:</label>

        <input
          v-model="cpf"
          type="text"
          placeholder="Digite seu CPF"
          @input="formatarCPF"
        />
      </div>

      <div class="campo">
        <label>Entrar como:</label>

        <select v-model="perfil">
          <option value="">Selecione</option>
          <option value="administrador">Administrador</option>
          <option value="coordenador">Coordenador</option>
          <option value="monitor">Monitor</option>
        </select>
      </div>

      <button @click="fazerLogin">
        Entrar
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginView",

  data() {
    return {
      cpf: "",
      perfil: ""
    }
  },

  methods: {
    formatarCPF() {
      this.cpf = this.cpf
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    },

    validarCPF(cpf) {
      cpf = cpf.replace(/\D/g, "")

      if (cpf.length !== 11) {
        return false
      }

      if (/^(\d)\1+$/.test(cpf)) {
        return false
      }

      let soma = 0
      let resto

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

    async fazerLogin() {
      if (!this.cpf || !this.perfil) {
        alert("Preencha todos os campos.")
        return
      }

      const cpfValido = this.validarCPF(this.cpf)

      if (!cpfValido) {
        alert("CPF inválido.")
        return
      }

      try {
        const resposta = await fetch(
          "http://localhost:3000/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              cpf: this.cpf,
              perfil: this.perfil
            })
          }
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
          alert(
            dados.erro ||
              "Erro ao fazer login."
          )

          return
        }

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(dados)
        )

        if (
          dados.perfil ===
          "administrador"
        ) {
          this.$router.push(
            "/administrador"
          )
        }

        else if (
          dados.perfil ===
          "coordenador"
        ) {
          this.$router.push(
            "/coordenador"
          )
        }

        else if (
          dados.perfil ===
          "monitor"
        ) {
          this.$router.push(
            "/monitor"
          )
        }

      } catch (erro) {
        console.log(erro)

        alert(
          "Erro ao conectar com o servidor."
        )
      }
    }
  }    
}
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 80px auto;
  font-family: Arial, sans-serif;
}

.card-login {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 24px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

input,
select {
  padding: 8px;
  font-size: 14px;
}

button {
  padding: 10px;
  background: #222;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>