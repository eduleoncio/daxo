<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'

const collapsed = ref(false)
const mobileOpen = ref(false)
</script>

<template>
  <div class="app-frame">
    <header class="mobile-bar">
      <router-link to="/dashboard" class="flex items-center gap-2.5 no-underline">
        <img src="/daxo-mark.png" alt="Daxo" class="h-[22px] w-[22px] object-contain" />
        <span class="text-sm font-bold tracking-tight text-[#1c2b25]">Daxo</span>
      </router-link>
      <button class="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7e0] bg-white/80 text-[#315d43]" aria-label="Abrir navegação" @click="mobileOpen = !mobileOpen">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
    <button v-if="mobileOpen" class="fixed inset-0 z-40 bg-[#17251d]/35 backdrop-blur-[2px] md:hidden" aria-label="Fechar navegação" @click="mobileOpen = false"></button>
    <Sidebar :collapsed="collapsed" :mobile-open="mobileOpen" @toggle="collapsed = !collapsed" @close="mobileOpen = false" />
    <main :class="['app-content', collapsed ? 'is-collapsed' : '']">
      <router-view />
    </main>
  </div>
</template>
