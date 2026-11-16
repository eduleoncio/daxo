<script setup>
import { abrirRelatorioPdf } from '../services/pdfReport'

const props = defineProps({
  estatisticas: { type: Object, default: null },
  lote: { type: Object, default: null },
  arquivo: { type: String, default: '' },
  erros: { type: Array, default: () => [] }
})

function gerar() {
  const abriu = abrirRelatorioPdf(props)
  if (!abriu) window.alert('Permita a abertura da janela para preparar o relatório em PDF.')
}
</script>

<template>
  <div v-if="estatisticas?.resumo" class="pdf-report-action">
    <button type="button" class="btn-secondary" @click="gerar">
      <span aria-hidden="true">↓</span>
      Salvar análise em PDF
    </button>
  </div>
</template>

<style scoped>
.pdf-report-action { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.pdf-report-action button { white-space: nowrap; }
.pdf-report-action button span { margin-right: 5px; font-size: 14px; }
</style>
