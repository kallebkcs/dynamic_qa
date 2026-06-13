<template>
  <header>
    <h1>Dynamic QA</h1>
    <button v-if="route.path !== '/'" @click="router.push('/')" class="voltar">VOLTAR AO INÍCIO</button>
  </header>

  <router-view />

  <footer>
    <p>© 2026 - UFSC Ara</p>
  </footer>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter();
const route = useRoute();

</script>

<style>
header,
footer {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;  
}

header {
  padding: 24px 0 12px;
  background: rgba(79, 70, 229, 0.08);
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.05em;
  color: #3730a3;
}

footer {
  padding: 14px 0;
  background: rgba(243, 244, 255, 0.92);
  color: #4b5563;
}

footer p {
  margin: 0;
  font-size: 0.95rem;
}

button {
  padding: 10px 15px;
  cursor: pointer;
  border: 1px solid #000;
  background: #fff;
  font-weight: bold;
}

.voltar {
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

.voltar:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

.voltar:active:not(:disabled) {
  transform: translateY(-1px);
}

</style>