<template>
  <AvisoToast ref="toastRef"/>
  <div class="container">
    <div class="topo">
      <h1>Respostas do Questionário</h1>
      <div class="acoes">
        <button @click="router.push('/home')">Voltar</button>
        <div class="dropdown-container" v-if="respostas.length > 0">
            <button @click="dropdownAberto = !dropdownAberto" class="btn-exportar">Exportar ▾</button>
            <div class="dropdown-menu" v-show="dropdownAberto">
                <button @click="baixar('csv')">CSV</button>
                <button @click="baixar('excel')">Excel</button>
            </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 v-if="respostas.length === 0">Nenhuma resposta coletada ainda.</h2>
      <div v-else style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Diagnóstico</th>
              <th v-for="coluna in colunasDinamicas" :key="coluna">{{ coluna }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in respostas" :key="linha.id">
              <td>{{ linha.dataSubmissao }}</td>
              <td>{{ linha.conteudo.diagnostico || 'N/A' }}</td>
              <td v-for="coluna in colunasDinamicas" :key="coluna">
                {{ linha.conteudo.respostas[coluna] ?? '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ExcelJS from 'exceljs';
import AvisoToast from '@/components/AvisoToast.vue';

const route = useRoute();
const router = useRouter();
const respostas = ref([]);
const questionario = ref(null);

const dropdownAberto = ref(false);
const toastRef = ref(null);

const idQuestionario = route.params.id;

const baixar = (tipo) => {
  if (tipo === 'csv') exportarCSV();
  if (tipo === 'excel') exportarExcel();
  dropdownAberto.value = false;
};

const colunasDinamicas = computed(() => {
  if (!questionario.value || !questionario.value.blocos) return [];
  const cabecalhos = [];
  questionario.value.blocos.forEach(bloco => {
    if (bloco.perguntas) {
      bloco.perguntas.forEach(p => {
        if (p.idInterno) cabecalhos.push(p.idInterno);
      });
    }
    if (bloco.tipo === 'peso') {
      cabecalhos.push('peso_acumulado_' + bloco.idInterno);
    }
  });
  return cabecalhos;
});

const carregarQuestionario = async () => {
  try {
      const res = await fetch(`http://localhost:3000/api/questionarios/${idQuestionario}`);
      if (res.ok) {
        questionario.value = await res.json();
      } else {
        console.error("Não foi possível recuperar a estrutura do questionário.");
      }
  } catch (err) {
    console.error("Erro de conexão ao buscar questionário:", err);
  }
};

const carregarRespostas = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/questionarios/${idQuestionario}/respostas`);
    if (res.ok) {
      respostas.value = await res.json();
    } else {
      console.error("Erro ao puxar respostas.");
    }
  } catch (err) {
    console.error("Servidor offline", err);
  }
};

const exportarCSV = async () => {
  if (respostas.value.length === 0) return;

  // Monta o cabeçalho
  let csvContent = "Data," + colunasDinamicas.value.join(",") + ",Diagnóstico\n";

  // Monta as linhas
  respostas.value.forEach(linha => {
    let row = [`"${linha.dataSubmissao}"`]
    colunasDinamicas.value.forEach(coluna => {
      const valor = String(linha.conteudo.respostas[coluna] ?? '').replace(/"/g, '""');
      row.push(`"${valor}"`);
    });
    row.push(`"${linha.conteudo.diagnostico || 'N/A'}"`)

    csvContent += row.join(",") + "\n";
  });

  // Força o download no navegador
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `respostas_${idQuestionario}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Aviso
  toastRef.value.mostrar('AVISO: Após exportar o questionário, o envie para um lugar seguro fora do seu sistema e apague permanentemente o arquivo, para que os monitores ou outros usuários não tenham acesso à planilha.', "aviso");
};

const exportarExcel = async () => {
  if (respostas.value.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Respostas');

  const cabecalhos = ['Data de Submissão', 'Diagnóstico', ...colunasDinamicas.value];
  worksheet.addRow(cabecalhos);
  worksheet.getRow(1).font = { bold: true };

  respostas.value.forEach(linha => {
    const dadosDaLinha = [
      linha.dataSubmissao,
      linha.conteudo.diagnostico || 'N/A'
    ];
    
    colunasDinamicas.value.forEach(coluna => {
      dadosDaLinha.push(linha.conteudo.respostas[coluna] ?? '-');
    });

    worksheet.addRow(dadosDaLinha);
  });

  const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `respostas_${idQuestionario}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url); // Limpa a memória

  toastRef.value.mostrar(
    'AVISO: Após exportar o questionário, o envie para um lugar seguro fora do seu sistema e apague permanentemente o arquivo, para que os monitores ou outros usuários não tenham acesso à planilha.', 
    "aviso", 
    'ETERNO'
  );
};

onMounted(() => {
  carregarQuestionario();
  carregarRespostas();
  console.log(respostas.value);
});
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
  min-height: 100vh;
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

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 115%;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
  z-index: 50;
  border: 1px solid rgba(148, 163, 184, 0.2);
  animation: fadeIn 0.2s ease;
}

.dropdown-menu button {
  width: 100%;
  border-radius: 10px;
  box-shadow: none;
  border: none;
  text-align: left;
  padding: 10px 16px;
}

.dropdown-menu button:hover {
  background: #eef2ff;
  transform: translateY(0);
  box-shadow: none;
}

.acoes {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>