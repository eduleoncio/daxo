<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUploadStore } from '../stores/uploadStore'

const upload = useUploadStore()
const router = useRouter()
const arrastando = ref(false)
const nomeArquivo = computed(() => upload.arquivo?.name || '')
const tamanhoArquivo = computed(() => upload.arquivo ? `${(upload.arquivo.size / 1024).toFixed(1)} KB` : '')
function selecionar(file) { if (file) upload.selecionarArquivo(file) }
function soltar(event) { arrastando.value = false; selecionar(event.dataTransfer.files[0]) }
async function processar() { await upload.processarPlanilha(); if (upload.temResultado) router.push('/relatorios') }
</script>

<template>
  <main class="page-wrap upload-page">
    <header class="page-head"><div><p class="page-kicker">ENTRADA DE DADOS</p><h1 class="page-title">Importar uma base</h1><p class="page-description">Envie uma planilha para conferir os registros e gerar uma leitura organizada da carteira.</p></div><router-link to="/dashboard" class="btn-secondary">← Voltar ao painel</router-link></header>

    <section class="upload-layout">
      <article class="glass-panel upload-main-card">
        <div class="upload-card-heading"><div><p class="eyebrow">NOVO PROCESSAMENTO</p><h2 class="section-title">Escolha o arquivo de origem</h2></div><span class="formats-pill">XLSX · XLS · CSV</span></div>
        <div :class="['dropzone', arrastando ? 'is-dragging' : '', upload.arquivo ? 'has-file' : '']" @dragover.prevent="arrastando = true" @dragleave.prevent="arrastando = false" @drop.prevent="soltar">
          <template v-if="!upload.arquivo">
            <span class="upload-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4m-4 4 4-4 4 4M5 15v4h14v-4"/><path d="M8 19h.01M12 19h.01M16 19h.01"/></svg></span>
            <h3>Arraste a planilha até aqui</h3><p>Ou selecione um arquivo no seu computador.</p>
            <label class="btn-secondary file-picker">Procurar arquivo<input type="file" accept=".xlsx,.xls,.csv" @change="selecionar($event.target.files[0])" /></label>
            <small>O arquivo permanece no seu ambiente de processamento.</small>
          </template>
          <div v-else class="selected-file">
            <span class="file-icon">{{ nomeArquivo.toLowerCase().endsWith('.csv') ? 'CSV' : 'XLS' }}</span>
            <div class="selected-file-name"><b>{{ nomeArquivo }}</b><span>{{ tamanhoArquivo }} · pronto para análise</span></div>
            <button class="remove-file" aria-label="Remover arquivo" @click="upload.selecionarArquivo(null)">×</button>
          </div>
        </div>

        <div v-if="upload.erros.length && !upload.temResultado" class="upload-errors" role="alert"><b>Confira o arquivo</b><p v-for="erro in upload.erros" :key="erro.id">{{ erro.descricao }}</p></div>
        <div class="upload-actions"><p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg> Os dados serão conferidos antes de gerar os indicadores.</p><button :disabled="!upload.arquivo || upload.carregando" @click="processar" class="btn-primary">{{ upload.carregando ? 'Analisando planilha...' : 'Processar arquivo' }}<span v-if="!upload.carregando">↗</span></button></div>
      </article>

    </section>
  </main>
</template>

<style>
.upload-layout { display: grid; grid-template-columns: minmax(0,1fr); align-items: start; gap: 14px; }.upload-main-card { padding: 23px; }.upload-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 18px; }.upload-card-heading .eyebrow { margin: 0 0 6px; }.formats-pill { padding: 7px 10px; border: 1px solid #e3ebe4; border-radius: 9px; background: rgba(245,249,245,.8); color: #75877b; font-size: 8px; font-weight: 750; letter-spacing: .07em; white-space: nowrap; }.dropzone { display: flex; min-height: 330px; flex-direction: column; align-items: center; justify-content: center; padding: 30px; border: 1px dashed #c8d8ca; border-radius: 17px; background: rgba(245,249,245,.52); text-align: center; transition: background .18s ease, border-color .18s ease, transform .18s ease; }.dropzone.is-dragging { transform: scale(1.005); border-color: #4f815d; background: #e9f2e9; }.upload-icon { display: grid; width: 53px; height: 53px; place-items: center; border: 1px solid #d9e6da; border-radius: 17px; background: white; color: #4f7b5b; box-shadow: 0 7px 18px rgba(46,72,52,.06); }.upload-icon svg { width: 25px; height: 25px; }.dropzone h3 { margin: 17px 0 6px; color: #334539; font-size: 15px; font-weight: 650; letter-spacing: -.02em; }.dropzone > p { margin: 0; color: #89968d; font-size: 11px; }.file-picker { position: relative; margin-top: 17px; min-height: 37px; font-size: 10px; overflow: hidden; }.file-picker input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }.dropzone > small { margin-top: 15px; color: #9aa59e; font-size: 9px; }.selected-file { display: flex; width: min(460px,100%); align-items: center; gap: 13px; padding: 16px; border: 1px solid #dce8dc; border-radius: 14px; background: rgba(255,255,255,.78); text-align: left; }.file-icon { display: grid; width: 40px; height: 44px; place-items: center; border-radius: 10px; background: #e5f0e6; color: #477555; font-size: 8px; font-weight: 800; }.selected-file-name { min-width: 0; flex: 1; }.selected-file-name b { display: block; overflow: hidden; color: #34473a; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.selected-file-name span { display: block; margin-top: 5px; color: #89968d; font-size: 9px; }.remove-file { width: 27px; height: 27px; border: 0; border-radius: 8px; background: #f6ece8; color: #9b6149; font-size: 18px; }.upload-errors { margin-top: 14px; padding: 13px 15px; border: 1px solid #f0d8ce; border-radius: 12px; background: #fff7f3; color: #965a43; font-size: 10px; }.upload-errors p { margin: 6px 0 0; }.upload-actions { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: 17px; }.upload-actions > p { display: flex; align-items: center; gap: 7px; margin: 0; color: #859188; font-size: 9px; }.upload-actions svg { width: 15px; height: 15px; color: #6b9273; }.upload-actions .btn-primary { min-height: 40px; font-size: 11px; }

@media (max-width: 600px) { .upload-main-card { padding: 16px; }.upload-card-heading { align-items: start; flex-direction: column; }.dropzone { min-height: 270px; padding: 18px; }.upload-actions { align-items: stretch; flex-direction: column; }.upload-actions .btn-primary { width: 100%; } }
</style>
