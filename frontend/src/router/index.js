import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import UploadView from '../views/UploadView.vue'
import RelatoriosView from '../views/RelatoriosView.vue'
import GraficosView from '../views/GraficosView.vue'
import AppLayout from '../components/AppLayout.vue'

const routes = [

  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  {
    path: '/login',
    name: 'login',
    component: LoginView
  },

  {
    path: '/cadastro',
    name: 'cadastro',
    component: RegisterView
  },

  {
    path: '/dashboard',
    component: AppLayout,
    meta: { requiresAuth: true },

    children: [

      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },

      {
        path: '/upload',
        name: 'upload',
        component: UploadView
      },

      {
        path: '/relatorios',
        name: 'relatorios',
        component: RelatoriosView
      },

      {
        path: '/graficos',
        name: 'graficos',
        component: GraficosView
      }

    ]

  },

  // Evita uma tela vazia quando a aplicação abre ou recarrega uma URL inexistente.
  { path: '/:pathMatch(.*)*', redirect: '/' }

]

const router = createRouter({

  history: createWebHistory(),

  routes

})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const rotaProtegida = to.matched.some((route) => route.meta.requiresAuth)
  const rotaDeAcesso = to.name === 'login' || to.name === 'cadastro'

  // A página pública não deve ficar em branco esperando a API validar um token antigo.
  if (auth.token && !auth.sessaoVerificada && (rotaProtegida || rotaDeAcesso)) {
    await auth.validarSessao()
  }
  if (rotaProtegida && !auth.estaLogado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if ((to.name === 'login' || to.name === 'cadastro') && auth.estaLogado) return { name: 'dashboard' }
})

export default router
