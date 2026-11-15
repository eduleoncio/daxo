<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const sucesso = ref('')
const enviando = ref(false)

async function cadastrar() {
  erro.value = ''
  sucesso.value = ''
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(senha.value)) {
    erro.value = 'A senha precisa ter de 8 a 72 caracteres, incluindo letra e número.'
    return
  }
  if (senha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não coincidem.'
    return
  }
  enviando.value = true
  try {
    await auth.cadastro(nome.value.trim(), email.value.trim(), senha.value)
    sucesso.value = 'Conta criada. Você já pode entrar.'
    setTimeout(() => router.push('/login'), 900)
  } catch (error) {
    erro.value = error.response?.data?.mensagem || 'Não foi possível criar sua conta.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-shell register-shell">
      <section class="auth-story register-story">
        <router-link to="/" class="auth-brand"><img src="/daxo-wordmark.png" alt="Daxo" /></router-link>
        <div class="auth-story-copy">
          <p class="auth-kicker"><span></span> UM NOVO JEITO DE LER SUA BASE</p>
          <h1>Comece com uma<br /><em>visão mais clara.</em></h1>
          <p class="auth-story-text">Crie seu acesso para importar planilhas, encontrar inconsistências e acompanhar os resultados em um só lugar.</p>
        </div>
        <div class="register-points"><p><i>01</i><span>Validação estruturada</span></p><p><i>02</i><span>Indicadores em um só lugar</span></p><p><i>03</i><span>Histórico dos seus envios</span></p></div>
      </section>
      <section class="auth-form-side">
        <div class="auth-form-card">
          <div class="auth-form-heading"><p class="page-kicker">NOVO ACESSO</p><h2>Criar sua conta</h2><p>Preencha os dados para começar a usar a plataforma.</p></div>
          <form class="auth-form register-form" @submit.prevent="cadastrar">
            <label class="form-field">Nome<input v-model="nome" required autocomplete="name" placeholder="Seu nome" class="form-control" /></label>
            <label class="form-field">E-mail<input v-model="email" type="email" required autocomplete="email" placeholder="voce@empresa.com" class="form-control" /></label>
            <label class="form-field">Senha<input v-model="senha" type="password" required autocomplete="new-password" placeholder="Mínimo de 8 caracteres" class="form-control" /></label>
            <label class="form-field">Confirmar senha<input v-model="confirmarSenha" type="password" required autocomplete="new-password" placeholder="Digite a senha novamente" class="form-control" /></label>
            <p v-if="erro" class="auth-error" role="alert">{{ erro }}</p>
            <p v-if="sucesso" class="auth-success" role="status">{{ sucesso }}</p>
            <button :disabled="enviando" class="btn-primary auth-submit">{{ enviando ? 'Criando...' : 'Criar conta' }}<span aria-hidden="true">↗</span></button>
          </form>
          <p class="auth-switch">Já tem uma conta? <router-link to="/login">Entrar</router-link></p>
        </div>
        <router-link to="/" class="auth-back">← Voltar para o início</router-link>
      </section>
    </div>
  </main>
</template>

<style>
.register-story { background: #294b3a; }
.register-points { z-index: 1; display: grid; gap: 9px; margin-bottom: 15px; }
.register-points p { display: flex; align-items: center; gap: 11px; margin: 0; color: #d4e0d3; font-size: 11px; }
.register-points i { display: grid; width: 25px; height: 25px; place-items: center; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; color: #c1d9b9; font-size: 8px; font-style: normal; }
.register-form { gap: 13px; margin-top: 22px; }
.register-form .form-control { height: 43px; margin-top: 6px; }
.auth-success { margin: -5px 0 0; color: #356d53; font-size: 12px; }
@media (max-width: 760px) { .register-story { min-height: 240px; } .register-points { display: none; } .register-form { gap: 12px; } }
</style>
