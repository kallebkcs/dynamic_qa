import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuestionarioView from '../views/QuestionarioView.vue'
import CriacaoQuestionarioView from '@/views/CriacaoQuestionarioView.vue'
import Login from '@/views/LoginView.vue'
import Cadastro from '@/views/CadastroView.vue'
import CoordenadorView from "@/views/CoordenadorView.vue"
import MonitorView from "@/views/MonitorView.vue"
<<<<<<< HEAD
=======
import AdministradorView from "@/views/AdministradorView.vue"
import VisualizarRespostasView from '@/views/VisualizarRespostasView.vue'
>>>>>>> 20907e8 (Lógica de planilha dos questionários alterada para corresponder às novas especificações)

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },

    {
      path: '/cadastro',
      name: 'cadastro',
      component: Cadastro,
    },

    {
      path: '/home',
      name: 'home',
      component: HomeView
    },

    {
      path: '/coordenador',
      name: 'coordenador',
      component: CoordenadorView,

      meta: {
        requiresAuth: true,
        perfil: 'coordenador'
      }
    },

    {
      path: '/monitor',
      name: 'monitor',
      component: MonitorView,

      meta: {
        requiresAuth: true,
        perfil: 'monitor'
      }
    },

    {
      path: '/questionario/:id',
      name: 'questionario',
      component: QuestionarioView,
      
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/criacao-questionario',
      name: 'criacao-questionario',
      component: CriacaoQuestionarioView,

      meta: {
        requiresAuth: true,
        perfil: 'coordenador'
      }
    },
    
    {
      path: '/edicao-questionario/:id',
      name: 'edicao-questionario',
      component: CriacaoQuestionarioView
    },

    {
      path: '/respostas/:id',
      name: 'visualizar-respostas',
      component: VisualizarRespostasView
    }
  ]
})

router.beforeEach((to, from, next) => {

  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado")
  )

  // rota protegida
  if (to.meta.requiresAuth) {

    // não logado
    if (!usuario) {
      return next('/login')
    }

    // perfil incorreto
    if (
      to.meta.perfil &&
      usuario.perfil !== to.meta.perfil
    ) {
      return next('/login')
    }
  }

  next()
})

export default router
