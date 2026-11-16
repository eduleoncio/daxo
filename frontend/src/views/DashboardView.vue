<script setup>
import { computed, onMounted } from 'vue'
import BaseChart from '../components/BaseChart.vue'
import PdfReportButton from '../components/PdfReportButton.vue'
import { useUploadStore } from '../stores/uploadStore'

const upload = useUploadStore()
onMounted(() => upload.carregarUltimoLote())

const moeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor || 0)
const segmentos = computed(() => Object.entries(upload.segmentos || {}).sort((a, b) => b[1] - a[1]).slice(0, 5))
const total = computed(() => upload.totalClientes || 1)
const faturamentoTotal = computed(() => upload.estatisticas?.resumo?.faturamentoTotal || 0)
</script>

<template>
  <main class="dashboard-page page-wrap">
    <header class="page-head">
      <div><p class="page-kicker">CENTRAL DE ANÁLISE</p><h1 class="page-title">Visão da carteira</h1><p class="page-description">Acompanhe os principais números da sua base e entenda como ela está distribuída.</p></div>
      <div class="dashboard-head-actions"><PdfReportButton :estatisticas="upload.estatisticas" :lote="upload.lote" :arquivo="upload.arquivo?.name" :erros="upload.erros"/><router-link to="/upload" class="btn-primary"><span>＋</span> Importar planilha</router-link></div>
    </header>

    <section v-if="upload.lote" class="batch-bar glass-panel">
      <div class="batch-status"><span class="batch-check">✓</span><div><p class="eyebrow">ÚLTIMO PROCESSAMENTO <span class="status-chip">{{ upload.lote.status }}</span></p><b>{{ upload.lote.arquivoNome || upload.lote.arquivo_nome || 'Planilha processada' }}</b><small v-if="upload.lote.mensagem">{{ upload.lote.mensagem }}</small></div></div>
    </section>

    <section class="metrics-grid">
      <article class="metric-card glass-panel"><div class="metric-heading"><span class="metric-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 2 18.5V20m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a4 4 0 0 0 0-7.7m1 10.2a4.5 4.5 0 0 1 4 4.5V20"/></svg></span><span class="metric-delta">BASE</span></div><p class="eyebrow">CLIENTES VÁLIDOS</p><p class="metric-value">{{ upload.totalClientes.toLocaleString('pt-BR') }}</p><p class="metric-caption">Registros no lote selecionado</p></article>
      <article class="metric-card glass-panel"><div class="metric-heading"><span class="metric-icon sand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2v20m5-15.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.3c0 4.2 10 2.4 10 7s-2.2 5.2-5 5.2-5-1.2-5-3"/></svg></span><span class="metric-delta">R$</span></div><p class="eyebrow">FATURAMENTO TOTAL</p><p class="metric-value metric-money">{{ moeda(faturamentoTotal) }}</p><p class="metric-caption">Soma dos faturamentos anuais</p></article>
      <article class="metric-card glass-panel"><div class="metric-heading"><span class="metric-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 20h18M5 17V9m5 8V4m5 13v-6m5 6V7"/></svg></span><span class="metric-delta">MÉDIA</span></div><p class="eyebrow">POR CLIENTE</p><p class="metric-value metric-money">{{ moeda(upload.faturamentoMedio) }}</p><p class="metric-caption">Faturamento anual médio</p></article>
      <router-link to="/relatorios" class="metric-card glass-panel metric-link"><div class="metric-heading"><span class="metric-icon coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 9v4m0 4h.01M10 3h4l7 17H3L10 3Z"/></svg></span><span class="metric-arrow">↗</span></div><p class="eyebrow">PONTOS DE ATENÇÃO</p><p class="metric-value">{{ upload.totalErros.toLocaleString('pt-BR') }}</p><p class="metric-caption">Ver detalhes da validação</p></router-link>
    </section>

    <section class="dashboard-grid">
      <article class="glass-panel dashboard-panel composition-panel">
        <div class="panel-head"><div><p class="eyebrow">COMPOSIÇÃO DA BASE</p><h2 class="section-title">Clientes por segmento</h2></div><router-link to="/graficos" class="panel-link">Ver indicadores <span>↗</span></router-link></div>
        <div v-if="segmentos.length" class="dashboard-chart"><BaseChart tipo="doughnut" :rotulos="segmentos.map(([nome]) => nome)" :valores="segmentos.map(([, quantidade]) => quantidade)" :mostrar-legenda="true" /></div>
        <div v-else class="empty-chart"><span>▤</span><b>Ainda não há dados para exibir</b><p>Importe uma planilha para ver a distribuição da carteira.</p><router-link to="/upload" class="btn-secondary">Importar base</router-link></div>
      </article>
      <article class="glass-panel dashboard-panel priority-panel">
        <div class="panel-head"><div><p class="eyebrow">PERFIL DA CARTEIRA</p><h2 class="section-title">Prioridade de atendimento</h2></div><span class="panel-mark">A · B · C</span></div>
        <div class="priority-list"><div v-for="[nivel, quantidade, cor, fundo] in [['A', upload.clientesNivelA, '#386d4f', '#dceade'], ['B', upload.clientesNivelB, '#9a784c', '#f0e9db'], ['C', upload.clientesNivelC, '#71808b', '#e3e9ec']]" :key="nivel" class="priority-row"><div class="priority-label"><span :style="{ color, background: fundo }">{{ nivel }}</span><div><b>Nível {{ nivel }}</b><small>{{ nivel === 'A' ? 'Alta prioridade' : nivel === 'B' ? 'Acompanhar' : 'Rotina' }}</small></div></div><div class="priority-value"><b>{{ quantidade }}</b><span>{{ Math.round((quantidade / total) * 100) }}%</span></div><div class="priority-track"><i :style="{ width: `${(quantidade / total) * 100}%`, background: cor }"></i></div></div></div>
        <router-link to="/relatorios" class="priority-foot">Abrir relatório de validação <span>→</span></router-link>
      </article>
    </section>

    <section v-if="upload.estatisticas" class="glass-panel insight-panel">
      <div class="panel-head"><div><p class="eyebrow">LEITURA ESTATÍSTICA · LOTE {{ upload.loteId }}</p><h2 class="section-title">Um pouco além dos totais</h2></div><span class="saved-note">SALVO NO HISTÓRICO</span></div>
      <div class="insight-metrics"><div><span>Mediana de faturamento</span><b>{{ moeda(upload.estatisticas.resumo.mediana) }}</b></div><div><span>Desvio padrão</span><b>{{ moeda(upload.estatisticas.resumo.desvioPadrao) }}</b></div><div><span>Serviços contratados</span><b>{{ upload.estatisticas.resumo.servicosContratados }}</b></div></div>
      <ul v-if="upload.estatisticas.insights?.length" class="insight-list"><li v-for="insight in upload.estatisticas.insights" :key="insight">{{ insight }}</li></ul>
    </section>
  </main>
</template>

<style>
.dashboard-page { color: var(--ink); }
.dashboard-head-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.batch-bar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: -4px 0 17px; padding: 13px 18px; border-radius: 15px; }
.batch-status { display: flex; align-items: center; gap: 11px; }.batch-check { display: grid; width: 33px; height: 33px; place-items: center; border-radius: 11px; background: #e4f0e5; color: #3e7952; font-size: 14px; }.batch-status .eyebrow { margin: 0 0 4px; font-size: 8px; }.batch-status b { display: block; color: #3e4c42; font-size: 11px; }.batch-status small { display: block; margin-top: 4px; color: #a46143; font-size: 10px; }.status-chip { margin-left: 6px; padding: 3px 6px; border-radius: 5px; background: #e5f0e5; color: #39734d; letter-spacing: .02em; }
.metrics-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 13px; }.metric-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 17px; }.metric-icon { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 12px; }.metric-icon svg { width: 18px; height: 18px; }.metric-icon.green { background: #e3efe5; color: #427351; }.metric-icon.sand { background: #f3eddf; color: #947349; }.metric-icon.blue { background: #e7edf0; color: #5c7584; }.metric-icon.coral { background: #f5e9e3; color: #a7684b; }.metric-delta { color: #89a38e; font-size: 8px; font-weight: 750; letter-spacing: .08em; }.metric-money { font-size: clamp(18px,2vw,25px); }.metric-link { display: block; color: inherit; text-decoration: none; transition: transform .18s ease, border-color .18s ease; }.metric-link:hover { transform: translateY(-2px); border-color: #d6e5d9; }.metric-arrow { color: #93a099; font-size: 15px; }
.dashboard-grid { display: grid; grid-template-columns: 1.06fr .94fr; gap: 14px; margin-top: 14px; }.dashboard-panel { min-height: 335px; padding: 22px; }.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid #edf0ed; }.panel-head .eyebrow { margin: 0 0 6px; font-size: 8px; }.panel-link { color: #4e795a; font-size: 10px; font-weight: 700; text-decoration: none; white-space: nowrap; }.panel-link span { margin-left: 5px; }.panel-mark { color: #a6b0a9; font-size: 9px; letter-spacing: .09em; }.dashboard-chart { width: min(100%,440px); height: 260px; min-height: 0; margin: 9px auto 0; overflow: hidden; }.empty-chart { display: flex; min-height: 245px; flex-direction: column; align-items: center; justify-content: center; text-align: center; }.empty-chart > span { color: #83a08a; font-size: 27px; }.empty-chart b { margin-top: 12px; color: #445449; font-size: 12px; }.empty-chart p { margin: 5px 0 14px; color: #87938b; font-size: 10px; }.empty-chart .btn-secondary { min-height: 35px; font-size: 10px; }
.priority-list { display: grid; gap: 21px; padding: 22px 0 16px; }.priority-row { display: grid; grid-template-columns: 1fr auto; gap: 10px 14px; align-items: center; }.priority-label { display: flex; align-items: center; gap: 10px; }.priority-label > span { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 10px; font-size: 11px; font-weight: 750; }.priority-label b { display: block; color: #3e4d42; font-size: 11px; }.priority-label small { display: block; margin-top: 3px; color: #95a098; font-size: 9px; }.priority-value { display: flex; align-items: baseline; gap: 8px; }.priority-value b { color: #3b4b40; font-size: 12px; }.priority-value span { color: #96a198; font-size: 9px; }.priority-track { grid-column: 1/-1; height: 5px; overflow: hidden; border-radius: 10px; background: #edf1ed; }.priority-track i { display: block; height: 100%; border-radius: inherit; }.priority-foot { display: flex; justify-content: space-between; padding-top: 14px; border-top: 1px solid #edf0ed; color: #53785d; font-size: 10px; font-weight: 650; text-decoration: none; }
.insight-panel { margin-top: 14px; padding: 21px 22px; }.saved-note { display: flex; align-items: center; gap: 7px; color: #829087; font-size: 9px; }.insight-metrics { display: grid; grid-template-columns: repeat(3,1fr); padding: 19px 0; }.insight-metrics > div { display: grid; gap: 7px; padding: 0 17px; border-left: 1px solid #e9eeea; }.insight-metrics > div:first-child { padding-left: 0; border-left: 0; }.insight-metrics span { color: #89958d; font-size: 10px; }.insight-metrics b { color: #314638; font-size: 17px; letter-spacing: -.03em; }.insight-list { display: grid; gap: 8px; margin: 0; padding: 14px 0 0 17px; border-top: 1px solid #edf0ed; color: #65736a; font-size: 11px; line-height: 1.6; }.insight-list li::marker { color: #5d8a65; }
@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 760px) { .dashboard-head-actions { justify-content: flex-start; }.dashboard-grid { grid-template-columns: 1fr; }.dashboard-panel { min-height: unset; }.metrics-grid { gap: 9px; }.metric-card { min-height: 130px; padding: 15px; }.metric-heading { margin-bottom: 13px; }.metric-money { font-size: 18px; }.batch-bar { align-items: start; flex-direction: column; }.insight-metrics { grid-template-columns: 1fr; gap: 13px; }.insight-metrics > div { padding: 0; border: 0; }.saved-note { display: none; } }
</style>
