<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const scrolled = ref(false)
function updateScroll() { scrolled.value = window.scrollY > 12 }
onMounted(() => { updateScroll(); window.addEventListener('scroll', updateScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', updateScroll))

const capabilities = [
  ['01', 'Importação de planilhas', 'Envie arquivos CSV ou Excel e confira os dados antes do processamento.', 'M12 16V4m-4 4 4-4 4 4M5 15v4h14v-4'],
  ['02', 'Validação da base', 'Encontre campos incompletos, valores fora do padrão e possíveis duplicidades.', 'M12 9v4m0 4h.01M10 3h4l7 17H3L10 3Z'],
  ['03', 'Indicadores da carteira', 'Acompanhe faturamento, segmentos e evolução dos resultados.', 'M4 19V9m5 10V5m5 14v-7m5 7V3']
]
</script>

<template>
  <main class="landing">
    <header :class="['landing-nav', scrolled ? 'is-scrolled' : '']">
      <div class="landing-nav-inner">
        <router-link to="/" class="landing-brand"><img src="/daxo-wordmark.png" alt="Daxo" /></router-link>
        <nav class="landing-links"><a href="#plataforma">Plataforma</a><a href="#metodo">Como funciona</a></nav>
        <router-link to="/login" class="landing-login">Acessar conta <span>↗</span></router-link>
      </div>
    </header>

    <section class="landing-hero">
      <div class="landing-grid-bg" aria-hidden="true"></div>
      <div class="landing-hero-inner">
        <div class="hero-copy">
          <p class="hero-overline">ANÁLISE DA CARTEIRA COMERCIAL</p>
          <h1>Sua carteira,<br /><em>com mais clareza.</em></h1>
          <p class="hero-lead">Importe sua planilha, encontre inconsistências e acompanhe os indicadores da sua base em um só lugar.</p>
          <div class="hero-actions"><router-link to="/login" class="btn-primary">Acessar o painel <span>↗</span></router-link><a href="#metodo" class="hero-text-link">Ver como funciona <span>↓</span></a></div>
        </div>

        <div class="hero-visual" aria-label="Prévia do painel de análise">
          <div class="dashboard-preview">
            <div class="preview-head"><div><span class="preview-label">VISÃO DA CARTEIRA</span><h2>Resumo do período</h2></div><button aria-label="Mais opções">···</button></div>
            <div class="preview-metrics"><div><span>CLIENTES ATIVOS</span><b>1.284</b><small>base consolidada</small></div><div><span>FATURAMENTO MÉDIO</span><b>R$ 38,7 mil</b><small>por contrato</small></div></div>
            <div class="preview-chart-head"><b>Distribuição da carteira</b><span>últimos 12 meses</span></div>
            <div class="preview-chart"><div class="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span></div><div class="chart-area"><div class="chart-grid"></div><svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#78a889" stop-opacity=".28"/><stop offset="1" stop-color="#78a889" stop-opacity="0"/></linearGradient></defs><path d="M0 118 C35 112 48 75 82 89 S130 115 165 75 S220 82 250 62 S295 79 333 48 S390 75 420 34 S465 49 500 15 V150 H0Z" fill="url(#areaFill)"/><path d="M0 118 C35 112 48 75 82 89 S130 115 165 75 S220 82 250 62 S295 79 333 48 S390 75 420 34 S465 49 500 15" fill="none" stroke="#4d8363" stroke-width="3" vector-effect="non-scaling-stroke"/></svg><div class="chart-x"><span>JAN</span><span>MAR</span><span>MAI</span><span>JUL</span><span>SET</span><span>NOV</span></div></div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="plataforma" class="landing-section">
      <div class="section-intro"><div><p class="page-kicker">O QUE VOCÊ ENCONTRA</p><h2>Uma base mais simples<br /><em>de entender.</em></h2></div><p>Reúna importação, conferência e indicadores em um só lugar para acompanhar sua carteira comercial.</p></div>
      <div class="capability-grid"><article v-for="[numero, titulo, descricao, icon] in capabilities" :key="numero" class="capability-card"><div class="capability-top"><span>{{ numero }}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path :d="icon"/></svg></div><h3>{{ titulo }}</h3><p>{{ descricao }}</p><span class="capability-arrow">↗</span></article></div>
    </section>

    <section id="metodo" class="method-section">
      <div class="method-heading"><p class="page-kicker">UM FLUXO DIRETO</p><h2>Da planilha aos indicadores.</h2><p>Confira cada etapa da análise da sua base.</p></div>
      <div class="method-steps"><article><span>01</span><div><b>Importe</b><p>Envie a base em CSV ou Excel.</p></div></article><article><span>02</span><div><b>Confira</b><p>Revise os dados e possíveis inconsistências.</p></div></article><article><span>03</span><div><b>Analise</b><p>Acompanhe indicadores e histórico.</p></div></article></div>
      <div class="method-cta"><div><p class="page-kicker">COMECE POR AQUI</p><h3>Veja o que sua base mostra.</h3><p>Acesse a plataforma e faça uma primeira importação.</p></div><router-link to="/login" class="btn-primary">Acessar Daxo <span>↗</span></router-link></div>
    </section>
    <footer class="landing-footer"><router-link to="/" class="landing-brand"><img src="/daxo-wordmark.png" alt="Daxo" /></router-link><span>Dados organizados para decis&#245;es comerciais.</span><span>&copy; Daxo</span></footer>
  </main>
</template>

<style>
.landing { overflow: hidden; background: #101914; color: #e4ebe5; }
.landing-nav { position: fixed; z-index: 30; inset: 0 0 auto; border-bottom: 1px solid transparent; transition: background .2s ease, border-color .2s ease, box-shadow .2s ease; }
.landing-nav.is-scrolled { border-color: rgba(218,227,218,.1); background: rgba(16,25,20,.86); box-shadow: 0 6px 22px rgba(0,0,0,.16); backdrop-filter: blur(18px); }
.landing-nav-inner { display: flex; width: min(1280px,100%); height: 76px; align-items: center; justify-content: space-between; margin: auto; padding: 0 36px; }
.landing-brand { display: flex; align-items: center; gap: 10px; color: #e4ebe5; text-decoration: none; }.landing-brand img { display: block; width: 100px; height: 35px; object-fit: contain; }.landing-brand b { display: block; font-size: 14px; letter-spacing: -.02em; }.landing-brand small { display: block; margin-top: 3px; color: #9dac9f; font-size: 7px; font-weight: 750; letter-spacing: .13em; }
.landing-links { display: flex; gap: 34px; margin-left: auto; margin-right: 48px; }.landing-links a { color: #aab7ad; font-size: 12px; font-weight: 550; text-decoration: none; }.landing-links a:hover { color: #c5ddc8; }
.landing-login { display: flex; align-items: center; gap: 16px; padding: 10px 14px; border: 1px solid rgba(145,177,150,.24); border-radius: 11px; color: #d3dfd5; font-size: 11px; font-weight: 700; text-decoration: none; }.landing-login span { font-size: 16px; }
.landing-hero { position: relative; min-height: 770px; padding: 120px 36px 50px; background: #101914; isolation: isolate; }.landing-grid-bg { position: absolute; z-index: -1; inset: 74px 0 0; overflow: hidden; perspective: 620px; pointer-events: none; }.landing-grid-bg::before { position: absolute; content: ''; top: 24%; right: -24%; bottom: -76%; left: -24%; transform: rotateX(62deg); transform-origin: center top; background-image: linear-gradient(to bottom, rgba(160,190,164,.14) 1px, transparent 1px), linear-gradient(to right, rgba(160,190,164,.08) 1px, transparent 1px); background-size: 100% 48px, 62px 100%; mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 72%, transparent 100%); }.landing-grid-bg::after { position: absolute; content: ''; top: 36%; right: 0; left: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(165,199,170,.18), transparent); box-shadow: 0 18px 36px rgba(95,144,105,.08); }
.landing-hero-inner { position: relative; display: grid; width: min(1190px,100%); min-height: 600px; grid-template-columns: .94fr 1.06fr; align-items: center; gap: 36px; margin: auto; }.hero-copy { position: relative; z-index: 2; padding: 0 0 15px; }.hero-overline { display: flex; align-items: center; gap: 9px; color: #a8c5ad; font-size: 9px; font-weight: 750; letter-spacing: .16em; }.hero-overline span { width: 22px; height: 1px; background: #7fa886; }.hero-copy h1 { margin: 21px 0 18px; color: #e7eee8; font-size: clamp(48px,5.3vw,68px); font-weight: 570; letter-spacing: -.07em; line-height: 1.02; }.hero-copy h1 em,.section-intro h2 em { color: #a8c5ad; font-style: normal; }.hero-lead { max-width: 435px; color: #a1aea4; font-size: 15px; line-height: 1.8; }.hero-actions { display: flex; align-items: center; gap: 22px; margin-top: 29px; }.hero-text-link { color: #a8c5ad; font-size: 11px; font-weight: 650; text-decoration: none; }.hero-text-link span { margin-left: 7px; color: #9bc4a2; }
.hero-visual { position: relative; min-height: 600px; }.dashboard-preview { position: absolute; z-index: 1; top: 50%; left: 50%; width: min(610px,98%); padding: 23px; transform: translate(-50%,-50%) rotateY(-3deg) rotateX(1deg); border: 1px solid rgba(213,229,214,.13); border-radius: 20px; background: rgba(29,39,32,.93); box-shadow: 0 35px 80px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.04); backdrop-filter: blur(22px); }
.preview-head { display: flex; align-items: start; justify-content: space-between; }.preview-label { color: #9ba99e; font-size: 8px; font-weight: 750; letter-spacing: .12em; }.preview-head h2 { margin: 5px 0 0; color: #dfe8e0; font-size: 16px; letter-spacing: -.025em; }.preview-head button { width: 28px; height: 25px; border: 1px solid #344238; border-radius: 8px; background: #1a241d; color: #aab7ad; font-size: 17px; line-height: 10px; }
.preview-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }.preview-metrics div { padding: 12px 13px; border: 1px solid #344238; border-radius: 12px; background: rgba(19,29,22,.76); }.preview-metrics span { display: block; color: #9ba99e; font-size: 7px; font-weight: 750; letter-spacing: .1em; }.preview-metrics b { display: block; margin-top: 8px; color: #e2eae3; font-size: 21px; letter-spacing: -.045em; }.preview-metrics small { color: #9ba99e; font-size: 8px; }.preview-chart-head { display: flex; justify-content: space-between; margin-top: 21px; color: #d4ded5; font-size: 10px; }.preview-chart-head span { color: #9ba99e; font-size: 8px; }.preview-chart { display: flex; height: 167px; gap: 12px; margin-top: 10px; }.chart-y { display: flex; flex-direction: column; justify-content: space-between; padding: 1px 0 26px; color: #9ba99e; font-size: 7px; }.chart-area { position: relative; flex: 1; }.chart-grid { position: absolute; inset: 0 0 23px; display: flex; flex-direction: column; justify-content: space-between; }.chart-grid i { border-top: 1px dashed #344238; }.chart-area svg { position: absolute; inset: 0 0 23px; width: 100%; height: calc(100% - 23px); overflow: visible; }.chart-x { position: absolute; inset: auto 0 0; display: flex; justify-content: space-between; color: #9ba99e; font-size: 7px; }.preview-bottom { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #344238; color: #a1aea4; font-size: 8px; }.preview-bottom b { font-weight: 500; }

.landing-section { padding: 105px 36px 112px; background: #121c16; }.section-intro { display: flex; width: min(1160px,100%); align-items: end; justify-content: space-between; gap: 36px; margin: auto auto 41px; }.section-intro h2,.method-heading h2 { margin: 0; color: #e2eae3; font-size: clamp(34px,4vw,48px); font-weight: 580; letter-spacing: -.06em; line-height: 1.08; }.section-intro > p { max-width: 390px; margin: 0 0 4px; color: #a1aea4; font-size: 13px; line-height: 1.75; }.page-kicker { color: #a8c5ad; font-size: 9px; font-weight: 750; letter-spacing: .14em; }.capability-grid { display: grid; width: min(1160px,100%); grid-template-columns: repeat(3,1fr); gap: 15px; margin: auto; }.capability-card { position: relative; min-height: 228px; padding: 25px; border: 1px solid #344238; border-radius: 16px; background: rgba(26,37,29,.82); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }.capability-card:hover { transform: translateY(-4px); border-color: #587461; box-shadow: 0 18px 34px rgba(0,0,0,.2); }.capability-top { display: flex; align-items: center; justify-content: space-between; }.capability-top span { color: #a8c5ad; font-size: 10px; font-weight: 750; }.capability-top svg { width: 22px; height: 22px; color: #92b69a; }.capability-card h3 { margin: 29px 0 8px; color: #e0e8e1; font-size: 16px; font-weight: 650; letter-spacing: -.025em; }.capability-card p { max-width: 290px; margin: 0; color: #a1aea4; font-size: 12px; line-height: 1.7; }.capability-arrow { position: absolute; right: 23px; bottom: 20px; color: #a8c5ad; font-size: 15px; }
.method-section { padding: 80px 36px 70px; background: #0e1712; }.method-heading { width: min(1160px,100%); margin: auto; }.method-heading > p:last-child { margin: 12px 0 0; color: #a1aea4; font-size: 13px; }.method-steps { display: flex; width: min(980px,100%); align-items: center; gap: 15px; margin: 43px auto 62px; }.method-steps article { display: flex; flex: 1; align-items: center; gap: 14px; }.method-steps article > span { display: grid; width: 39px; height: 39px; flex: 0 0 auto; place-items: center; border: 1px solid #405448; border-radius: 12px; background: #19251d; color: #b6d3ba; font-size: 10px; font-weight: 750; }.method-steps b { color: #dbe5dc; font-size: 12px; }.method-steps p { margin: 4px 0 0; color: #9ba99e; font-size: 10px; }.method-cta { display: flex; width: min(1160px,100%); align-items: center; justify-content: space-between; gap: 24px; margin: auto; padding: 24px 27px; border: 1px solid #344238; border-radius: 16px; background: #19251d; }.method-cta .page-kicker { margin-bottom: 8px; }.method-cta h3 { margin: 0; color: #e0e8e1; font-size: 20px; letter-spacing: -.035em; }.method-cta p:last-child { margin: 6px 0 0; color: #a1aea4; font-size: 11px; }.landing-footer { display: flex; min-height: 92px; align-items: center; justify-content: space-between; gap: 20px; padding: 16px max(36px,calc((100% - 1160px)/2)); background: #101914; }.landing-footer > span { color: #9ba99e; font-size: 9px; }
@media (max-width: 900px) { .landing-hero { min-height: auto; padding-top: 115px; }.landing-hero-inner { grid-template-columns: 1fr; }.hero-copy { max-width: 630px; }.hero-visual { width: min(650px,100%); min-height: 500px; margin: 0 auto 25px; }.capability-grid { grid-template-columns: 1fr 1fr; }.landing-section { padding-top: 75px; padding-bottom: 80px; } }
@media (max-width: 620px) { .landing-nav-inner { height: 66px; padding: 0 17px; }.landing-links { display: none; }.landing-login { margin-left: auto; }.landing-hero { padding: 105px 20px 20px; }.hero-copy h1 { font-size: 46px; }.hero-lead { font-size: 13px; }.hero-actions { align-items: start; flex-direction: column; gap: 16px; }.hero-visual { min-height: 390px; margin: 12px -4px 0; }.dashboard-preview { top: 50%; width: 100%; padding: 15px; }.preview-metrics b { font-size: 17px; }.preview-chart { height: 133px; }.landing-section { padding: 67px 20px; }.section-intro { align-items: start; flex-direction: column; gap: 15px; margin-bottom: 26px; }.capability-grid { grid-template-columns: 1fr; }.capability-card { min-height: 190px; }.method-section { padding: 66px 20px 52px; }.method-steps { align-items: stretch; flex-direction: column; gap: 12px; margin: 30px auto 38px; }.method-cta { align-items: start; flex-direction: column; padding: 21px; }.landing-footer { align-items: start; flex-direction: column; padding: 22px 20px; } }
</style>
