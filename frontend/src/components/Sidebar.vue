<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle', 'close'])
const auth = useAuthStore()
const router = useRouter()

function sair() {
  auth.logout()
  router.replace('/login')
}

const links = [
  ['dashboard', '/dashboard', 'Visão geral', 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  ['upload', '/upload', 'Importar base', 'M12 16V4m-4 4 4-4 4 4M5 15v4h14v-4'],
  ['relatorios', '/relatorios', 'Relatórios', 'M7 3h10l4 4v14H7zM17 3v5h5M10 13h7M10 17h5'],
  ['graficos', '/graficos', 'Indicadores', 'M4 20V10m6 10V4m6 16v-7m6 7V7M2 20h20']
]
</script>

<template>
  <aside :class="['app-sidebar', collapsed ? 'is-collapsed' : '', mobileOpen ? 'is-open' : '']">
    <div class="sidebar-brand">
      <router-link to="/dashboard" class="brand-link" @click="emit('close')">
        <img :src="collapsed ? '/daxo-mark.png' : '/daxo-wordmark.png'" alt="Daxo" :class="['brand-mark', collapsed ? 'brand-mark-icon' : 'brand-mark-wordmark']" />
      </router-link>
      <button class="sidebar-collapse" aria-label="Recolher navegação" @click="emit('toggle')">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 18-6-6 6-6" /></svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <p v-if="!collapsed" class="nav-caption">ESPAÇO DE TRABALHO</p>
      <router-link v-for="([nome, destino, rotulo, caminho]) in links" :key="nome" :to="destino" :class="['nav-item', nome === 'upload' ? 'upload-nav' : '']" active-class="nav-parent" exact-active-class="is-active" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path :d="caminho" /></svg>
        <span v-if="!collapsed">{{ rotulo }}</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <div v-if="!collapsed" class="workspace-card">
        <div class="min-w-0">
          <p class="workspace-label">SESSÃO ATIVA</p>
          <p class="workspace-user">{{ auth.usuario?.nome || 'Usuário' }}</p>
          <p class="workspace-email">{{ auth.usuario?.email || '' }}</p>
        </div>
      </div>
      <button class="nav-item logout-item" @click="sair">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
        <span v-if="!collapsed">Sair da conta</span>
      </button>
    </div>
  </aside>
</template>

<style>
.app-sidebar { position: fixed; z-index: 50; inset: 14px auto 14px 14px; display: flex; width: 250px; flex-direction: column; overflow: hidden; border: 1px solid rgba(220,235,222,.12); border-radius: 16px; background: rgba(27,36,30,.76); color: #e4ebe5; box-shadow: 0 22px 56px rgba(0,0,0,.24); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); transition: width .24s ease, transform .24s ease, background .24s ease; }
.app-sidebar.is-collapsed { width: 76px; }
.sidebar-brand { position: relative; display: flex; min-height: 83px; align-items: center; justify-content: space-between; gap: 10px; padding: 0 16px; border-bottom: 1px solid rgba(220,235,222,.09); background: rgba(120,165,130,.045); }
.brand-link { display: flex; min-width: 0; align-items: center; gap: 11px; text-decoration: none; }
.brand-mark { display: block; flex: 0 0 auto; object-fit: contain; }.brand-mark-icon { width: 28px; height: 34px; }.brand-mark-wordmark { width: 122px; height: 42px; }
.brand-name { margin: 0; color: #fff; font-size: 15px; font-weight: 700; letter-spacing: -.02em; }
.brand-caption { margin: 4px 0 0; color: #b9cdbd; font-size: 8px; font-weight: 700; letter-spacing: .13em; white-space: nowrap; }
.sidebar-collapse { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(255,255,255,.12); border-radius: 9px; background: rgba(255,255,255,.06); color: #dbe8dc; }
.is-collapsed .sidebar-brand { min-height: 94px; align-items: flex-start; justify-content: center; padding: 10px 8px; }
.is-collapsed .brand-link { align-self: flex-start; margin: 0 auto; }
.app-sidebar:not(.is-collapsed) .sidebar-brand { padding: 0 12px; }
.is-collapsed .sidebar-collapse { position: absolute; top: 57px; left: 50%; width: 24px; height: 24px; transform: translateX(-50%); background: #305d45; }
.is-collapsed .sidebar-collapse svg { transform: rotate(180deg); }
.sidebar-nav { flex: 1; padding: 25px 12px; }
.nav-caption { margin: 0 10px 12px; color: #a6bfad; font-size: 9px; font-weight: 750; letter-spacing: .15em; }
.nav-item { display: flex; min-height: 46px; align-items: center; gap: 13px; margin: 4px 0; padding: 0 12px; border: 1px solid transparent; border-radius: 10px; color: #c6d5c9; font-size: 13px; font-weight: 550; text-decoration: none; transition: color .18s ease, background .18s ease, border-color .18s ease; }
.nav-item svg { width: 19px; height: 19px; flex: 0 0 auto; }
.nav-item:hover { background: rgba(255,255,255,.075); color: white; }
.nav-item.is-active { border-color: rgba(231,242,229,.13); background: rgba(238,247,235,.12); color: #fff; box-shadow: inset 3px 0 #c3d9bd; }
.is-collapsed .nav-item { width: 100%; justify-content: center; padding: 0; }
.nav-item.upload-nav { justify-content: flex-start; margin-top: 5px; border-color: transparent; background: transparent; color: #c6d5c9; }
.nav-item.upload-nav:hover { border-color: rgba(229,241,225,.32); background: rgba(255,255,255,.13); }
.is-collapsed .nav-item.upload-nav { justify-content: center; margin: 4px 0; }

.sidebar-bottom { padding: 12px; border-top: 1px solid rgba(220,235,222,.09); }
.workspace-card { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 7px; padding: 12px 10px; border: 1px solid rgba(255,255,255,.1); border-radius: 11px; background: rgba(220,235,222,.045); }
.workspace-label { margin: 0; color: #a9c2ae; font-size: 8px; font-weight: 750; letter-spacing: .11em; }
.workspace-user { margin: 5px 0 0; overflow: hidden; color: #f7f8f4; font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.workspace-email { max-width: 170px; margin: 3px 0 0; overflow: hidden; color: #b5c8b9; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.logout-item { width: 100%; background: transparent; text-align: left; }
.logout-item:hover { color: #fff0e8; }
@media (max-width: 760px) {
  .app-sidebar, .app-sidebar.is-collapsed { inset: 72px auto 12px 12px; width: 260px; transform: translateX(calc(-100% - 20px)); border-radius: 13px; }
  .app-sidebar.is-open { transform: translateX(0); }
  .sidebar-collapse { display: none; }
}
</style>
