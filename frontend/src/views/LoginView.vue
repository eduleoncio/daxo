<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mostrarSenha = ref(false)
const email = ref('')
const senha = ref('')
const erro = ref('')

async function entrar() {
  erro.value = ''
  try {
    await auth.login(email.value.trim(), senha.value)
    router.push(route.query.redirect || '/dashboard')
  } catch (error) {
    erro.value = error.response?.data?.mensagem || 'Não foi possível entrar. Verifique a API e suas credenciais.'
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-shell">
      <section class="auth-story">
        <router-link to="/" class="auth-brand">
          <img src="/daxo-wordmark.png" alt="Daxo" />

        </router-link>
        <div class="auth-story-copy">
          <p class="auth-kicker">SEU ESPAÇO DE ANÁLISE</p>
          <h1>Dados claros.<br /><em>Decisões melhores.</em></h1>
          <p class="auth-story-text">Organize sua carteira comercial e encontre o que merece atenção, sem perder tempo procurando em planilhas.</p>
        </div>
        <div class="auth-preview">
          <div class="auth-preview-top"><span>CARTEIRA COMERCIAL</span><span class="preview-live">ATUALIZADA</span></div>
          <div class="preview-bars"><span style="height:42%"></span><span style="height:68%"></span><span style="height:50%"></span><span style="height:82%"></span><span style="height:60%"></span><span style="height:94%"></span><span style="height:74%"></span><span style="height:100%"></span><span style="height:79%"></span><span style="height:88%"></span><span style="height:68%"></span><span style="height:92%"></span></div>
        </div>
      </section>

      <section class="auth-form-side">
        <div class="auth-form-card">
          <div class="auth-form-heading">
            <p class="page-kicker">BEM-VINDO DE VOLTA</p>
            <h2>Acesse sua conta</h2>
            <p>Entre para acompanhar sua carteira e seus indicadores.</p>
          </div>
          <form class="auth-form" @submit.prevent="entrar">
            <label class="form-field">E-mail
              <input v-model="email" type="email" autocomplete="username" required placeholder="voce@empresa.com" class="form-control" />
            </label>
            <label class="form-field">Senha
              <span class="password-field"><input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="current-password" required placeholder="Digite sua senha" class="form-control" /><button type="button" @click="mostrarSenha = !mostrarSenha">{{ mostrarSenha ? 'Ocultar' : 'Mostrar' }}</button></span>
            </label>
            <p v-if="erro" class="auth-error" role="alert">{{ erro }}</p>
            <button type="submit" :disabled="auth.carregando" class="btn-primary auth-submit">{{ auth.carregando ? 'Entrando...' : 'Entrar na plataforma' }}<span aria-hidden="true">↗</span></button>
          </form>
          <p class="auth-switch">Ainda não tem acesso? <router-link to="/cadastro">Criar uma conta</router-link></p>
        </div>
        <router-link to="/" class="auth-back">← Voltar para o início</router-link>
      </section>
    </div>
  </main>
</template>

<style>
.auth-page { display: grid; min-height: 100vh; place-items: center; padding: 34px; background: #edf2ed; }
.auth-shell { display: grid; width: min(1120px, 100%); min-height: 680px; grid-template-columns: 1.03fr .97fr; overflow: hidden; border: 1px solid rgba(255,255,255,.82); border-radius: 28px; background: rgba(255,255,255,.76); box-shadow: 0 30px 80px rgba(34,61,43,.13); backdrop-filter: blur(20px); }
.auth-story { position: relative; display: flex; flex-direction: column; overflow: hidden; padding: 34px 42px 26px; background: #234d39; color: white; }
.auth-brand { z-index: 1; display: flex; align-items: center; gap: 11px; color: white; text-decoration: none; }
.auth-brand img { width: 110px; height: 38px; object-fit: contain; }
.auth-brand b { display: block; font-size: 15px; letter-spacing: -.02em; }
.auth-brand small { display: block; margin-top: 4px; color: #b8cdbb; font-size: 8px; font-weight: 700; letter-spacing: .14em; }
.auth-story-copy { z-index: 1; margin: auto 0 34px; }
.auth-kicker { display: flex; align-items: center; gap: 8px; color: #c1d9c4; font-size: 9px; font-weight: 750; letter-spacing: .16em; }
.auth-kicker span { width: 20px; height: 1px; background: #a7c9a6; }
.auth-story h1 { margin: 18px 0 15px; color: #f7f7f1; font-size: clamp(36px, 4vw, 50px); font-weight: 580; letter-spacing: -.055em; line-height: 1.06; }
.auth-story h1 em { color: #bfd8b9; font-style: normal; }
.auth-story-text { max-width: 380px; color: #c0d0c2; font-size: 14px; line-height: 1.75; }
.auth-preview { z-index: 1; padding: 17px 18px 14px; border: 1px solid rgba(255,255,255,.17); border-radius: 17px; background: rgba(255,255,255,.075); backdrop-filter: blur(16px); }
.auth-preview-top,.preview-footer { display: flex; justify-content: space-between; color: #d1e0d1; font-size: 8px; font-weight: 700; letter-spacing: .12em; }
.preview-live { display: flex; align-items: center; gap: 6px; color: #d1e0d1; font-size: 9px; font-weight: 500; letter-spacing: 0; }
.preview-bars { display: flex; height: 100px; align-items: end; gap: 8px; margin: 18px 0 14px; border-bottom: 1px solid rgba(255,255,255,.16); background: repeating-linear-gradient(to bottom, transparent 0 24px, rgba(255,255,255,.08) 25px); }
.preview-bars span { flex: 1; border-radius: 5px 5px 1px 1px; background: linear-gradient(180deg, #d4e3c4, rgba(169,204,166,.22)); }
.preview-footer { color: #a9c3ad; font-size: 9px; font-weight: 500; letter-spacing: 0; }
.auth-form-side { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 52px clamp(26px, 5vw, 70px) 30px; }
.auth-form-card { width: min(390px,100%); }
.auth-form-heading h2 { margin: 0; color: #1c2b25; font-size: 30px; font-weight: 650; letter-spacing: -.05em; }
.auth-form-heading > p:last-child { margin: 9px 0 0; color: #78847c; font-size: 13px; line-height: 1.6; }
.auth-form { display: grid; gap: 19px; margin-top: 31px; }
.password-field { position: relative; display: block; }
.password-field input { padding-right: 76px; }
.password-field button { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); border: 0; background: transparent; color: #557a61; font-size: 11px; font-weight: 700; }
.auth-submit { width: 100%; margin-top: 2px; }
.auth-submit span { margin-left: auto; font-size: 17px; }
.auth-error { margin: -7px 0 0; color: #a7453d; font-size: 12px; }
.auth-switch { margin: 24px 0; color: #75827b; text-align: center; font-size: 12px; }
.auth-switch a { color: #356d53; font-weight: 700; text-decoration: none; }
.auth-back { margin-top: 27px; color: #738079; font-size: 11px; text-decoration: none; }
.auth-back:hover { color: #356d53; }
</style>
