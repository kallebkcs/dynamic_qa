import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuestionarioView from '../views/QuestionarioView.vue'
import CriacaoQuestionarioView from '@/views/CriacaoQuestionarioView.vue'
import CriacaoQuestionario2View from '@/views/CriacaoQuestionario2View.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      // O ":id" é um parâmetro dinâmico. Aceita qualquer ID de questionário.
      path: '/questionario/:id',
      name: 'questionario',
      component: QuestionarioView
    },
    {
      path: '/criacao-questionario',
      name: 'criacao-questionario',
      component: CriacaoQuestionarioView
    },
    {
      path: '/criacao-questionario-2',
      name: 'criacao-questionario-2',
      component: CriacaoQuestionario2View
    }
  ]
})

export default router