import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa sua config

const app = createApp(App)
app.use(router) // Avisa ao Vue que você quer usar rotas
app.mount('#app')