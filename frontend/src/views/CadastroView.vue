<template>
  <div class="container">
    <header class="topo">
      <h1>Cadastro de Coordenador</h1>

      <button @click="voltar">
        Voltar para Login
      </button>
    </header>

    <section class="card">
      <h2>Preencha seus dados</h2>

      <div class="campo">
        <label>Nome:</label>
        <input v-model="coordenador.nome" type="text" />
      </div>

      <div class="campo">
        <label>CPF:</label>
        <input
          v-model="coordenador.cpf"
          type="text"
          maxlength="14"
          @input="formatarCPF"
        />
      </div>

      <div class="campo">
        <label>Email:</label>
        <input v-model="coordenador.email" type="email" />
      </div>

      <button @click="cadastrarCoordenador">
        Criar Cadastro
      </button>
    </section>
  </div>
</template>

<script>
export default {
  name: "CadastroCoordenador",

  data() {
    return {
      coordenador: {
        nome: "",
        cpf: "",
        email: "",
        perfil: "coordenador"
      }
    }
  },

  methods: {
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

    validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },

    async cadastrarCoordenador() {
      if (
        !this.coordenador.nome ||
        !this.coordenador.cpf ||
        !this.coordenador.email
      ) {
        alert("Preencha todos os campos.")
        return
      }

      if (!this.validarEmail(this.coordenador.email)) {
        alert("Email inválido.")
        return
      }

      const resposta = await fetch(
        "http://localhost:3000/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nome: this.coordenador.nome.trim(),
            cpf: this.limparCPF(this.coordenador.cpf),
            email: this.coordenador.email.trim(),
            perfil: "coordenador"
          })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        alert(dados.erro)
        return
      }

      alert("Cadastro realizado com sucesso!")

      this.$router.push("/")
    },

    voltar() {
      this.$router.push("/")
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  color: white;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.22);
}

.topo h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}

.topo button {
  padding: 14px 26px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
}

.topo button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.16);
}

.card {
  margin-top: 24px;
  padding: 28px 30px;
  border-radius: 24px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.card h2 {
  font-size: 1.5rem;
  margin-bottom: 22px;
  color: #111827;
}

.campo {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 18px 24px;
  align-items: center;
  margin-bottom: 20px;
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
  margin-top: 6px;
  padding: 14px 26px;
  border-radius: 999px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(102, 126, 234, 0.2);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card > button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(102, 126, 234, 0.24);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  margin-top: 12px;
}

thead th {
  padding: 16px 18px;
  text-align: left;
  font-weight: 700;
  color: #4f46e5;
  text-transform: uppercase;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

tbody tr {
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
}

th,
td {
  padding: 16px 18px;
  border: none;
}

tbody td {
  color: #334155;
}

.danger {
  background: #ef4444;
  color: white;
  border: none;
}

@media (max-width: 900px) {
  .container {
    padding: 24px;
  }

  .topo {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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

  .card {
    padding: 22px;
  }

  .campo {
    gap: 14px;
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