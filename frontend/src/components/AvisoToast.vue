<template>
  <Teleport to="body">
    <div v-if="visivel" class="toast" :class="tipo">
      <span>{{ mensagem }}</span>
      <button @click="fechar">&times;</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const visivel = ref(false);
const mensagem = ref('');
const tipo = ref('aviso'); // opções: 'aviso', 'erro', 'sucesso'

const mostrar = (msg, tipoAviso = 'aviso', tempo = 5000) => {
  mensagem.value = msg;
  tipo.value = tipoAviso;
  visivel.value = true;  
  if (tempo !== 'ETERNO') setTimeout(fechar, tempo);
};

const fechar = () => {
  visivel.value = false;
};

defineExpose({ mostrar });
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 6px;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 9999;
  font-family: inherit;
  font-weight: bold;
  animation: desliza 0.3s ease-out;
}

.toast.aviso { background: #fff3cd; color: #856404; border-left: 5px solid #ffeeba; }
.toast.erro { background: #f8d7da; color: #721c24; border-left: 5px solid #f5c6cb; }
.toast.sucesso { background: #d4edda; color: #145423; border-left: 5px solid #c3e6cb; }

button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
}

@keyframes desliza {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>