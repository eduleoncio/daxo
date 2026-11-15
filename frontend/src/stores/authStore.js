import { defineStore } from 'pinia'
import api from '../services/api'

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem('cti_usuario')
    return salvo ? JSON.parse(salvo) : null
  } catch {
    // Um valor antigo ou incompleto no armazenamento não pode impedir o Vue de iniciar.
    localStorage.removeItem('cti_usuario')
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('cti_token') || ''
    return {
      token,
      usuario: lerUsuarioSalvo(),
      carregando: false,
      sessaoVerificada: !token
    }
  },

  getters: {
    nomeExibicao: (state) => state.usuario?.nome || 'Usuário',
    estaLogado: (state) => Boolean(state.token)
  },

  actions: {
    async login(email, senha) {
      this.carregando = true
      try {
        const { data } = await api.post('/auth/login', { email, senha })
        this.token = data.token
        this.usuario = { nome: data.nome, email: data.email, perfil: data.perfil || 'USER' }
        localStorage.setItem('cti_token', data.token)
        localStorage.setItem('cti_usuario', JSON.stringify(this.usuario))
        this.sessaoVerificada = true
        return data
      } finally {
        this.carregando = false
      }
    },

    async cadastro(nome, email, senha) {
      return api.post('/auth/register', { nome, email, senha })
    },

    async validarSessao() {
      if (!this.token) {
        this.sessaoVerificada = true
        return false
      }
      try {
        const { data } = await api.get('/auth/me')
        this.usuario = { nome: data.nome, email: data.email, perfil: data.perfil || 'USER' }
        localStorage.setItem('cti_usuario', JSON.stringify(this.usuario))
        return true
      } catch {
        this.logout()
        return false
      } finally {
        this.sessaoVerificada = true
      }
    },

    logout() {
      this.token = ''
      this.usuario = null
      this.sessaoVerificada = true
      localStorage.removeItem('cti_token')
      localStorage.removeItem('cti_usuario')
    }
  }
})
