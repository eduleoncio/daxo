<script setup>
import { computed, onMounted } from 'vue'
import BaseChart from '../components/BaseChart.vue'
import { useUploadStore } from '../stores/uploadStore'

const upload = useUploadStore()
onMounted(() => { if (!upload.estatisticas) upload.carregarUltimoLote() })
const stats = computed(() => upload.estatisticas)
const segmentos = computed(() => stats.value?.porSegmento || [])
const consultores = computed(() => stats.value?.porConsultor || [])
const servicos = computed(() => stats.value?.porServico || [])
const meses = computed(() => stats.value?.porMes || [])
const clientes = computed(() => stats.value?.topClientes || [])
const niveis = computed(() => stats.value?.porNivel || [])
const correlacao = computed(() => stats.value?.correlacaoServicosFaturamento)
const coeficiente = computed(() => correlacao.value?.coeficiente == null ? 'Sem dados' : Number(correlacao.value.coeficiente).toLocaleString('pt-BR', { maximumFractionDigits: 3 }))
const cartoes = computed(() => [
  ['Clientes válidos', (stats.value?.resumo?.clientes ?? 0).toLocaleString('pt-BR'), 'BASE'],
  ['Faturamento total', moeda(stats.value?.resumo?.faturamentoTotal), 'R$'],
  ['Faturamento médio', moeda(stats.value?.resumo?.media), 'MÉDIA'],
  ['Serviços contratados', (stats.value?.resumo?.servicosContratados ?? 0).toLocaleString('pt-BR'), 'ITENS'],
  ['Registros com erro', (stats.value?.resumo?.invalidas ?? 0).toLocaleString('pt-BR'), 'REVISÃO']
])
function moeda(valor) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor || 0) }
</script>

<template>
  <main class="page-wrap charts-page">
    <header class="page-head"><div><p class="page-kicker">CIÊNCIA DE DADOS</p><h1 class="page-title">Indicadores da carteira</h1><p class="page-description">Uma leitura visual dos dados tratados e salvos pelo serviço de análise.</p></div><router-link to="/upload" class="btn-secondary">＋ Novo lote</router-link></header>
    <section v-if="stats" class="charts-summary">
      <article v-for="([titulo, valor, tag], index) in cartoes" :key="titulo" class="glass-panel summary-card"><div class="summary-card-top"><span class="summary-number">0{{ index + 1 }}</span><span>{{ tag }}</span></div><p>{{ titulo }}</p><b>{{ valor }}</b></article>
    </section>
    <section v-if="stats" class="charts-grid">
      <article class="glass-panel chart-panel chart-panel-featured"><div class="chart-panel-head"><div><p class="eyebrow">COMPOSIÇÃO</p><h2 class="section-title">Clientes por segmento</h2></div><span class="chart-context">{{ segmentos.length }} categorias</span></div><BaseChart v-if="segmentos.length" class="chart-content" tipo="doughnut" :rotulos="segmentos.map(x => x.categoria)" :valores="segmentos.map(x => x.clientes)" :mostrar-legenda="true"/><p v-else class="chart-empty">Não há segmentos para este lote.</p></article>
      <article class="glass-panel chart-panel"><div class="chart-panel-head"><div><p class="eyebrow">CLASSIFICAÇÃO</p><h2 class="section-title">Distribuição por nível</h2></div><span class="chart-context">A · B · C</span></div><BaseChart v-if="niveis.length" class="chart-content" tipo="doughnut" :rotulos="niveis.map(x => x.categoria)" :valores="niveis.map(x => x.clientes)" :mostrar-legenda="true"/><p v-else class="chart-empty">Sem níveis para comparar.</p></article>
      <article class="glass-panel chart-panel chart-wide"><div class="chart-panel-head"><div><p class="eyebrow">DESEMPENHO</p><h2 class="section-title">Faturamento por consultor</h2></div><span class="chart-context">Valor anual</span></div><BaseChart v-if="consultores.length" class="chart-content" tipo="bar" horizontal moeda :rotulos="consultores.map(x => x.categoria)" :valores="consultores.map(x => x.faturamento)"/><p v-else class="chart-empty">Sem dados de consultores.</p></article>
      <article class="glass-panel chart-panel"><div class="chart-panel-head"><div><p class="eyebrow">PRODUTOS</p><h2 class="section-title">Serviços contratados</h2></div></div><BaseChart v-if="servicos.length" class="chart-content" tipo="bar" horizontal :rotulos="servicos.map(x => x.categoria)" :valores="servicos.map(x => x.clientes)"/><p v-else class="chart-empty">Sem serviços para comparar.</p></article>
      <article class="glass-panel chart-panel"><div class="chart-panel-head"><div><p class="eyebrow">EVOLUÇÃO</p><h2 class="section-title">Contratações por mês</h2></div></div><BaseChart v-if="meses.length" class="chart-content" tipo="line" :rotulos="meses.map(x => x.mes)" :valores="meses.map(x => x.clientes)"/><p v-else class="chart-empty">Sem datas para agrupar.</p></article>
      <article class="glass-panel chart-panel chart-wide"><div class="chart-panel-head"><div><p class="eyebrow">DESTAQUES</p><h2 class="section-title">Maiores faturamentos</h2></div><span class="chart-context">Top clientes</span></div><BaseChart v-if="clientes.length" class="chart-content" tipo="bar" horizontal moeda :rotulos="clientes.map(x => x.nome)" :valores="clientes.map(x => x.faturamento)"/><p v-else class="chart-empty">Sem clientes para exibir.</p></article>
      <article class="glass-panel correlation-card"><div><p class="eyebrow">RELAÇÃO ENTRE VARIÁVEIS</p><h2 class="section-title">Serviços e faturamento</h2><p class="correlation-copy">Correlação de Pearson entre a quantidade de serviços e o faturamento dos clientes.</p></div><div class="correlation-value"><b>{{ coeficiente }}</b><span>coeficiente</span></div></article>
    </section>
    <section v-else class="glass-panel charts-empty-state"><span class="empty-orbit">▤</span><p class="page-kicker">SEM LOTE PROCESSADO</p><h2>Os indicadores aparecem depois da primeira análise.</h2><p>Importe uma planilha para montar a leitura da sua carteira.</p><router-link to="/upload" class="btn-primary">Importar uma base <span>↗</span></router-link></section>
  </main>
</template>

<style>
.charts-summary { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 11px; }.summary-card { padding: 15px 16px; border-radius: 15px; }.summary-card-top { display: flex; justify-content: space-between; color: #97a59a; font-size: 8px; font-weight: 750; letter-spacing: .09em; }.summary-number { color: #78977e; }.summary-card p { margin: 15px 0 5px; color: #78857c; font-size: 10px; }.summary-card > b { color: #2d4033; font-size: 18px; font-weight: 650; letter-spacing: -.035em; }
.charts-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 13px; margin-top: 14px; }.chart-panel { min-width: 0; min-height: 330px; padding: 20px; }.chart-wide { grid-column: span 2; }.chart-panel-featured { min-height: 365px; }.chart-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid #edf0ed; }.chart-panel-head .eyebrow { margin: 0 0 5px; font-size: 8px; }.chart-context { padding: 6px 9px; border: 1px solid #e6ece6; border-radius: 8px; color: #829087; font-size: 8px; white-space: nowrap; }.chart-content { height: 255px; margin-top: 13px; }.chart-panel-featured .chart-content { height: 285px; }.chart-empty { display: grid; min-height: 225px; place-items: center; color: #9aa59d; font-size: 11px; }.correlation-card { display: flex; min-height: 180px; grid-column: span 2; align-items: center; justify-content: space-between; gap: 25px; padding: 24px; }.correlation-card .eyebrow { margin: 0 0 7px; }.correlation-copy { max-width: 480px; margin: 9px 0 0; color: #829087; font-size: 11px; line-height: 1.6; }.correlation-value { display: flex; min-width: 130px; flex-direction: column; align-items: center; justify-content: center; padding: 18px; border: 1px solid #e5ece5; border-radius: 15px; background: rgba(239,245,239,.68); }.correlation-value b { color: #3f7251; font-size: 30px; font-weight: 650; letter-spacing: -.06em; }.correlation-value span,.correlation-foot { color: #909c93; font-size: 9px; }.correlation-foot { max-width: 150px; margin: 0; line-height: 1.5; }.charts-empty-state { display: flex; min-height: 390px; flex-direction: column; align-items: center; justify-content: center; padding: 35px; text-align: center; }.empty-orbit { display: grid; width: 60px; height: 60px; margin-bottom: 18px; place-items: center; border: 1px solid #dbe7dc; border-radius: 20px; background: #eaf2eb; color: #598063; font-size: 23px; }.charts-empty-state .page-kicker { margin: 0 0 8px; }.charts-empty-state h2 { max-width: 420px; margin: 0; color: #293a2e; font-size: 23px; letter-spacing: -.04em; }.charts-empty-state > p:not(.page-kicker) { margin: 9px 0 19px; color: #859188; font-size: 12px; }.charts-empty-state .btn-primary { min-height: 39px; }
@media (max-width: 1040px) { .charts-summary { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 760px) { .charts-summary { grid-template-columns: repeat(2,1fr); }.charts-grid { grid-template-columns: 1fr; }.chart-wide,.correlation-card { grid-column: auto; }.correlation-card { align-items: start; flex-direction: column; }.correlation-value { min-width: 100%; }.correlation-foot { max-width: unset; } }
</style>
