<template>
  <div class="container">
    <header class="topo">
      <h1>Criação de Questionário</h1>
      <div class="usuario">Olá, Usuário</div>
    </header>

    <section class="formulario">
      <div class="campo">
        <label>Nome:</label>
        <input v-model="questionario.nome" type="text" />
      </div>

      <div class="campo">
        <label>Identificador:</label>
        <input v-model="questionario.identificador" type="text" />
      </div>

      <div class="campo">
        <label>Descrição:</label>
        <textarea v-model="questionario.descricao"></textarea>
      </div>
    </section>

    <section class="blocos">
      <h2>Blocos</h2>

      <div
        v-for="(bloco, blocoIndex) in questionario.blocos"
        :key="bloco.id"
        class="bloco"
      >
        <div class="bloco-topo">
          <input
            v-model="bloco.titulo"
            type="text"
            placeholder="Título do bloco"
          />

          <div class="acoes">
            <button @click="adicionarPergunta(blocoIndex)">
              + Criar nova pergunta
            </button>
            <button class="danger" @click="removerBloco(blocoIndex)">
              Excluir bloco
            </button>
          </div>
        </div>

        <div
          v-for="(pergunta, perguntaIndex) in bloco.perguntas"
          :key="pergunta.id"
          class="pergunta"
        >
          <div class="campo">
            <label>Pergunta:</label>
            <input
              v-model="pergunta.texto"
              type="text"
              placeholder="Digite a pergunta"
            />
          </div>

          <div class="campo">
            <label>Tipo:</label>
            <select v-model="pergunta.tipo">
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="escolha_unica">Escolha única</option>
              <option value="multipla_escolha">Múltipla escolha</option>
              <option value="equacao">Equação</option>
            </select>
          </div>

          <div
            v-if="
              pergunta.tipo === 'multipla_escolha' ||
              pergunta.tipo === 'escolha_unica'
            "
            class="opcoes"
          >
            <h4>Opções</h4>

            <div
              v-for="(opcao, opcaoIndex) in pergunta.opcoes"
              :key="opcaoIndex"
              class="opcao"
            >
              <input
                v-model="opcao.texto"
                type="text"
                placeholder="Texto da opção"
              />
              <input
                v-model.number="opcao.peso"
                type="number"
                placeholder="Peso"
              />
              <button
                class="danger"
                @click="removerOpcao(blocoIndex, perguntaIndex, opcaoIndex)"
              >
                Excluir opção
              </button>
            </div>

            <button @click="adicionarOpcao(blocoIndex, perguntaIndex)">
              + Adicionar opção
            </button>
          </div>

          <div v-if="pergunta.tipo === 'equacao'" class="equacao-box">
            <div class="campo">
              <label>Equação:</label>
              <input
                v-model="pergunta.equacao"
                type="text"
                placeholder="Ex: peso / (altura * altura)"
              />
            </div>

            <div class="campo">
              <label>Variáveis da equação</label>
            </div>

            <div
              v-for="(variavel, variavelIndex) in pergunta.variaveis"
              :key="variavelIndex"
              class="variavel-item"
            >
              <input
                v-model="variavel.nome"
                type="text"
                placeholder="Nome interno da variável (ex: peso)"
              />

              <input
                v-model="variavel.label"
                type="text"
                placeholder="Label da variável (ex: Peso em kg)"
              />

              <select v-model="variavel.tipo">
                <option value="numero">Número</option>
                <option value="texto">Texto</option>
              </select>

              <button
                class="danger"
                @click="removerVariavel(blocoIndex, perguntaIndex, variavelIndex)"
              >
                Excluir variável
              </button>
            </div>

            <button @click="adicionarVariavel(blocoIndex, perguntaIndex)">
              + Adicionar variável
            </button>
          </div>

          <div class="acoes-pergunta">
            <button
              class="danger"
              @click="removerPergunta(blocoIndex, perguntaIndex)"
            >
              Excluir pergunta
            </button>
          </div>
        </div>
      </div>

      <button class="btn-bloco" @click="adicionarBloco">
        + Criar novo bloco
      </button>
    </section>

    <section class="rodape-acoes">
      <button @click="salvarQuestionario">Salvar</button>
    </section>

    <section v-if="jsonGerado" class="json-preview">
      <h2>JSON gerado</h2>
      <pre>{{ jsonGerado }}</pre>
    </section>
  </div>
</template>

<script>
export default {
  name: "CriacaoQuestionario",
  data() {
    return {
      proximoBlocoId: 1,
      proximaPerguntaId: 1,
      questionario: {
        nome: "",
        identificador: "",
        descricao: "",
        blocos: []
      },
      jsonGerado: ""
    }
  },
  methods: {
    adicionarBloco() {
      this.questionario.blocos.push({
        id: this.proximoBlocoId++,
        titulo: `Bloco ${this.questionario.blocos.length + 1}`,
        perguntas: []
      })
    },

    removerBloco(blocoIndex) {
      this.questionario.blocos.splice(blocoIndex, 1)
    },

    adicionarPergunta(blocoIndex) {
      this.questionario.blocos[blocoIndex].perguntas.push({
        id: this.proximaPerguntaId++,
        texto: "",
        tipo: "texto",
        opcoes: [],
        equacao: "",
        variaveis: []
      })
    },

    removerPergunta(blocoIndex, perguntaIndex) {
      this.questionario.blocos[blocoIndex].perguntas.splice(perguntaIndex, 1)
    },

    adicionarOpcao(blocoIndex, perguntaIndex) {
      this.questionario.blocos[blocoIndex].perguntas[perguntaIndex].opcoes.push({
        texto: "",
        peso: 0
      })
    },

    removerOpcao(blocoIndex, perguntaIndex, opcaoIndex) {
      this.questionario.blocos[blocoIndex].perguntas[perguntaIndex].opcoes.splice(
        opcaoIndex,
        1
      )
    },

    adicionarVariavel(blocoIndex, perguntaIndex) {
      this.questionario.blocos[blocoIndex].perguntas[
        perguntaIndex
      ].variaveis.push({
        nome: "",
        label: "",
        tipo: "numero"
      })
    },

    removerVariavel(blocoIndex, perguntaIndex, variavelIndex) {
      this.questionario.blocos[blocoIndex].perguntas[
        perguntaIndex
      ].variaveis.splice(variavelIndex, 1)
    },

    salvarQuestionario() {
      const payload = JSON.stringify(this.questionario, null, 2)
      this.jsonGerado = payload

      console.log("JSON enviado:", payload)

      /*
      Exemplo para enviar ao backend:
      fetch("http://localhost:3000/questionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: payload
      })
      */
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.formulario,
.blocos,
.json-preview {
  margin-bottom: 24px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

input,
textarea,
select {
  padding: 8px;
  font-size: 14px;
}

textarea {
  min-height: 80px;
}

.bloco {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.bloco-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pergunta {
  border: 1px dashed #999;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.opcoes {
  margin-top: 12px;
}

.opcao {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.acoes,
.acoes-pergunta,
.rodape-acoes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background: #222;
  color: white;
  border-radius: 6px;
}

button:hover {
  opacity: 0.9;
}

.danger {
  background: #c62828;
}

.btn-bloco {
  margin-top: 10px;
}

pre {
  background: #f4f4f4;
  padding: 16px;
  overflow-x: auto;
  border-radius: 8px;
}

.variavel-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.equacao-box {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafafa;
}
</style>