<template>
  <div class="app">
    <header>
      <h1>Dynamic QA</h1>
      <button v-if="route.path !== '/'" @click="sair" class="voltar">
        Sair
      </button>
    </header>

    <main class="conteudo">
      <router-view />
    </main>

    <footer>
      <p>© 2026 - UFSC Ar</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sair = () => {
  localStorage.removeItem('usuarioLogado')
  router.push('/')
}
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.conteudo {
  flex: 1;
}

header{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0 12px;
  background: rgba(79, 70, 229, 0.08);
}

.voltar {
  position: absolute;
  right: 20px;

  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.05em;
  color: #3730a3;
}

footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 0;
  background: rgba(243, 244, 255, 0.92);
  color: #4b5563;
  width: 100%;
}

footer p {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
}

button {
  padding: 10px 15px;
  cursor: pointer;
  border: 1px solid #000;
  background: #fff;
  font-weight: bold;
}

.voltar:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

.voltar:active:not(:disabled) {
  transform: translateY(-1px);
}

</style>