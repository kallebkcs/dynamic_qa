<template>
  <AvisoToast ref="toastRef" />

  <div class="container">
    <div class="login-topo">Dynamic QA</div>

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

      <div class="botoes">
        <button @click="fazerLogin">
          Entrar
        </button>

        <button v-if="!temCoordenador"
          class="btn-cadastrar"
          @click="fazerCadastro"
        >
          Cadastrar
        </button>
      </div>
    </div>

    <div class="login-rodape">
      © 2026 - UFSC Ara
    </div>
  </div>
</template>

<script>
import AvisoToast from '@/components/AvisoToast.vue';

export default {
  name: "LoginView",

  components: {
    AvisoToast
  },

  data() {
    return {
      cpf: "",
      temCoordenador: true
    }
  },
  async mounted() {
    try {
      const resposta = await fetch('http://localhost:3000/api/coordenadores');
      const dados = await resposta.json();
      this.temCoordenador = dados.existe;
    } catch (error) {
      console.error('Falha ao espionar o banco de dados:', error);
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
      if (!this.cpf) {
        this.$refs.toastRef.mostrar(
          "Preencha todos os campos.",
          "erro"
        )
        return
      }

      if (!this.validarCPF(this.cpf)) {
        this.$refs.toastRef.mostrar(
          "CPF inválido.",
          "erro"
        )
        return;
      }

      try {
        const resposta = await fetch(
          "http://localhost:3000/api/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              cpf: this.cpf.replace(/\D/g, ""),
            })
          }
        );

      const dados = await resposta.json()

      if (!resposta.ok) {
        this.$refs.toastRef.mostrar(
          dados.erro,
          "erro"
        )
        return;
      }

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(dados)
      );

      this.$router.push("/home");

      } catch (error) {
        console.error("Erro ao fazer login:", error);
        this.$refs.toastRef.mostrar(
          "Erro ao fazer login. Tente novamente.",
          "erro"
        )
      }
    },

    fazerCadastro() {
    this.$router.push("/cadastro")
  }

  }
}
</script>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.botoes {
  display: flex;
  gap: 15px; 
  margin-top: 20px;
}

.botoes button {
  flex: 1; 
}

.login-topo {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.95);
  color: #1e3a8a;
  font-weight: 700;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(8px);
}

  .card-login {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 36px 32px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.card-login h1 {
  margin-bottom: 24px;
  font-size: 2rem;
  color: #1f2937;
  text-align: center;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}

.campo label {
  font-weight: 700;
  color: #334155;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #1f2937;
  font-size: 1rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.14);
}

button {
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 14px 30px rgba(102, 126, 234, 0.28);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(102, 126, 234, 0.32);
}

.login-rodape {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.9);
  color: #1e3a8a;
  font-weight: 700;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
}



@media (max-width: 520px) {
  .card-login {
    padding: 28px 22px;
  }

  .card-login h1 {
    font-size: 1.7rem;
  }

  input,
  select,
  button {
    font-size: 0.98rem;
  }
}
</style>