<template>
  <div class="container">
    <header class="topo">
      <h1>Área do Monitor</h1>

      <button @click="voltar">
        Voltar
      </button>
    </header>

    <!-- PACIENTES -->

    <section class="card">
      <h2>Meus Pacientes</h2>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cadastrado Por</th>
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
            <td>{{ paciente.nomeCadastrador }}</td>
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
      pacientes: []
    }
  },

  async created() {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuario || usuario.perfil !== "monitor") {
      this.$router.push("/");
      return;
    }

    this.usuarioLogado = usuario;

    await this.carregarPacientes();
    
  },

  methods: {
  limparCPF(cpf) {
    return String(cpf || "").replace(/\D/g, "");
  },

  async carregarPacientes() {
    const resposta = await fetch(
      'http://localhost:3000/api/pacientes'
    );

    const pacientes = await resposta.json();

    console.log("Pacientes recebidos:", pacientes);

    this.pacientes = pacientes.filter(
      paciente =>
        this.limparCPF(paciente.monitorCpf || "") ===
        this.limparCPF(this.usuarioLogado.cpf)
    );
  },

    voltar() {
      this.$router.push("/home")
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 80px auto;
  padding: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 28px 30px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(37, 99, 235, 0.18);
}

.topo h1 {
  color: white;
  font-size: 2rem;
  font-weight: 800;
}

.topo button {
  padding: 12px 24px;
  border-radius: 999px;
  background: white;
  color: #2563eb;
  font-weight: 700;
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.topo button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.14);
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 24px;
  padding: 28px 30px;
  margin-bottom: 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.card h2 {
  font-size: 1.45rem;
  margin-bottom: 18px;
  color: #111827;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 12px;
}

thead th {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 18px;
  border: none;
}

tbody tr {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

th,
td {
  padding: 16px 18px;
  text-align: left;
  border: none;
}

tbody td {
  color: #334155;
}

tbody tr:first-child td {
  border-top: none;
}

td[colspan] {
  text-align: center;
  color: #64748b;
  padding: 20px;
}

button {
  font-family: inherit;
}

@media (max-width: 880px) {
  .container {
    padding: 18px;
  }

  .topo {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .topo h1 {
    font-size: 1.75rem;
  }

  .topo button {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .container {
    margin: 24px auto;
  }

  .card {
    padding: 22px;
  }

  table {
    display: block;
    overflow-x: auto;
    width: 100%;
  }

  tbody tr {
    min-width: 520px;
  }

  th,
  td {
    padding: 14px 16px;
  }
}
</style>