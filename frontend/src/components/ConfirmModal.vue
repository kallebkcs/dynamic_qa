<template>
  <Teleport to="body">
    <div v-if="visivel" class="modal-overlay">
      <div class="modal-content">
        <h3>Atenção</h3>
        <p>{{ mensagem }}</p>
        <div class="modal-acoes">
          <button @click="responder(false)">CANCELAR</button>
          <button @click="responder(true)" class="btn-perigo">EXCLUIR</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const visivel = ref(false);
const mensagem = ref('');
let promessaResolve = null;

const mostrar = (msg) => {
  mensagem.value = msg;
  visivel.value = true;
  return new Promise((resolve) => {
    promessaResolve = resolve;
  });
};

const responder = (resposta) => {
  visivel.value = false;
  if (promessaResolve) promessaResolve(resposta);
};

defineExpose({ mostrar });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px 10px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 4px solid;
}

.modal-acoes {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 15px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4rem;
  font-weight: 700;
  border-bottom: 2px solid #f8d7da; /* Um toque sutil de vermelho para indicar perigo */
  padding-bottom: 10px;
}

.modal-content p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 25px;
}

button {
  padding: 10px 15px;
  cursor: pointer;
  border: 1px solid #000;
  border-radius: 5px;
  background: #fff;
  font-weight: bold;
}

button:hover {
  background: #eee;    
}

.btn-perigo {
  background-color: #dc3545;
  color: white;
}

.btn-perigo:hover {
  background-color: #c82333;
}
</style>