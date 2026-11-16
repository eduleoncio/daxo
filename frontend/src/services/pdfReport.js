const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const numero = (value, casas = 0) => new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: casas,
  maximumFractionDigits: casas
}).format(Number(value) || 0)

const moeda = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2
}).format(Number(value) || 0)

const numeroInline = (value, casas = 0) => `<span class="nowrap">${numero(value, casas)}</span>`
const moedaInline = (value) => `<span class="nowrap">${moeda(value)}</span>`

function tabela(colunas, linhas, vazio = 'Sem dados disponíveis para esta análise.') {
  if (!linhas.length) return `<p class="empty">${escapeHtml(vazio)}</p>`
  return `<table><thead><tr>${colunas.map((coluna) => `<th>${escapeHtml(coluna)}</th>`).join('')}</tr></thead><tbody>${linhas.join('')}</tbody></table>`
}

function barra(participacao) {
  const largura = Math.max(0, Math.min(100, Number(participacao) || 0))
  return `<span class="bar"><i style="width:${largura.toFixed(1)}%"></i></span><small>${numeroInline(largura, 1)}%</small>`
}

export function abrirRelatorioPdf({ estatisticas, lote, arquivo, erros = [] }) {
  if (!estatisticas?.resumo) return false

  const resumo = estatisticas.resumo
  const totalClientes = Number(resumo.clientes) || 0
  const receita = Number(resumo.faturamentoTotal) || 0
  const origem = arquivo || lote?.arquivoNome || lote?.arquivo_nome || 'Lote processado'
  const idLote = lote?.id ?? lote?.loteId
  const geradoEm = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
  const insights = estatisticas.insights || []
  const segmentos = (estatisticas.porSegmento || []).map((item) => {
    const share = totalClientes ? item.clientes / totalClientes * 100 : 0
    return `<tr><td>${escapeHtml(item.categoria)}</td><td>${numeroInline(item.clientes)}</td><td>${barra(share)}</td><td>${moedaInline(item.faturamento)}</td></tr>`
  })
  const niveis = (estatisticas.porNivel || []).map((item) => {
    const share = totalClientes ? item.clientes / totalClientes * 100 : 0
    return `<tr><td>Nível ${escapeHtml(item.categoria)}</td><td>${numeroInline(item.clientes)}</td><td>${barra(share)}</td><td>${moedaInline(item.faturamento)}</td></tr>`
  })
  const consultores = [...(estatisticas.porConsultor || [])]
    .sort((a, b) => (Number(b.faturamento) || 0) - (Number(a.faturamento) || 0))
    .slice(0, 8)
    .map((item) => `<tr><td>${escapeHtml(item.categoria)}</td><td>${numeroInline(item.clientes)}</td><td>${moedaInline(item.faturamento)}</td><td>${barra(receita ? item.faturamento / receita * 100 : 0)}</td></tr>`)
  const servicos = (estatisticas.porServico || []).slice(0, 8).map((item) => {
    const share = resumo.servicosContratados ? item.clientes / resumo.servicosContratados * 100 : 0
    return `<tr><td>${escapeHtml(item.categoria)}</td><td>${numeroInline(item.clientes)}</td><td>${barra(share)}</td></tr>`
  })
  const meses = (estatisticas.porMes || []).map((item) => `<tr><td>${escapeHtml(item.mes)}</td><td>${numeroInline(item.clientes)}</td></tr>`)
  const topClientes = (estatisticas.topClientes || []).slice(0, 5).map((item, index) => `<tr><td>${numeroInline(index + 1)}</td><td>${escapeHtml(item.nome)}</td><td class="nowrap">${escapeHtml(item.codigo)}</td><td>${moedaInline(item.faturamento)}</td><td>${barra(receita ? item.faturamento / receita * 100 : 0)}</td></tr>`)
  const errosPorTipo = erros.reduce((grupos, erro) => {
    const chave = erro.tipo || 'Outros'
    grupos[chave] = (grupos[chave] || 0) + 1
    return grupos
  }, {})
  const errosResumo = Object.entries(errosPorTipo).map(([tipo, total]) => `<tr><td>${escapeHtml(tipo)}</td><td>${numeroInline(total)}</td></tr>`)
  const detalhesErro = erros.slice(0, 20).map((erro) => `<tr><td>${escapeHtml(erro.linha)}</td><td>${escapeHtml(erro.campo)}</td><td>${escapeHtml(erro.tipo)}</td><td>${escapeHtml(erro.descricao)}</td></tr>`)
  const correcoes = Object.entries(estatisticas.correcoes || {}).filter(([, total]) => total)
  const taxaValida = resumo.recebidas ? totalClientes / resumo.recebidas * 100 : 0
  const correlacao = estatisticas.correlacaoServicosFaturamento?.coeficiente
  const correlacaoTexto = correlacao == null
    ? 'Não foi possível estimar a correlação com os dados deste lote.'
    : `Coeficiente de Pearson: ${numero(correlacao, 3)}. Este valor descreve associação entre as variáveis, não comprova que uma cause a outra.`

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Daxo - Relatório analítico - ${escapeHtml(origem)}</title>
<style>
  :root{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#1d2b22;background:#fff;font-synthesis:none}
  *{box-sizing:border-box}body{margin:0;color:#26352b;font-size:10pt;line-height:1.5}
  .page{max-width:900px;margin:0 auto;padding:38px 44px 50px}
  .hero{padding:28px 30px;border-radius:18px;background:#173b2b;color:#f5f8f2}
  .brand{font-size:10pt;font-weight:800;letter-spacing:.18em;color:#b8d4b8;text-transform:uppercase}
  h1{margin:13px 0 4px;font-size:26pt;letter-spacing:-.04em}.subtitle{margin:0;color:#cfdbcf;font-size:11pt}
  .meta{display:flex;flex-wrap:wrap;gap:7px 22px;margin-top:21px;padding-top:15px;border-top:1px solid #ffffff2b;color:#d6e1d5;font-size:9pt}
  h2{margin:28px 0 12px;color:#234632;font-size:15pt;letter-spacing:-.02em}
  .intro{margin:0;color:#66736a}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:16px 0 10px}
  .card{padding:13px 12px;border:1px solid #e2e9e2;border-radius:12px;background:#f6f9f5;min-width:0}
  .card span{display:block;color:#738076;font-size:8pt}.card strong{display:block;margin-top:5px;color:#264b35;font-size:13pt;white-space:nowrap}
  .insights{display:grid;gap:9px;margin:0;padding:0;list-style:none}.insights li{position:relative;padding:11px 13px 11px 34px;border:1px solid #e3ebe3;border-radius:10px;background:#f7faf6;color:#46554a}
  .insights li:before{content:"↗";position:absolute;left:13px;color:#4c805b;font-weight:800}
  table{width:100%;border-collapse:collapse;table-layout:auto;font-size:9pt}th{padding:9px 8px;background:#edf3ed;color:#526457;text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:.05em}
  td{padding:9px 8px;border-bottom:1px solid #e8eee8;vertical-align:middle;word-break:normal;overflow-wrap:normal}td:first-child{overflow-wrap:anywhere}tr{break-inside:avoid;page-break-inside:avoid}.nowrap{white-space:nowrap;word-break:keep-all}
  .bar{display:inline-block;width:min(85px,35vw);height:7px;margin-right:7px;overflow:hidden;border-radius:8px;background:#e5ece5;vertical-align:middle}.bar i{display:block;height:100%;border-radius:inherit;background:#568160}
  td small{color:#64746a;white-space:nowrap}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.panel{min-width:0}
  .callout{padding:13px 15px;border-left:3px solid #719879;border-radius:5px;background:#f3f7f2;color:#58665b}
  .empty{color:#7e8a80;font-style:italic}.note{margin:8px 0;color:#758178;font-size:8.5pt}
  .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e1e8e1;color:#859087;font-size:8pt;display:flex;justify-content:space-between}
  @page{size:A4 portrait;margin:12mm} @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:none;padding:0}.hero{padding:18px 20px}.hero,.card,.insights li,.callout,th{print-color-adjust:exact;-webkit-print-color-adjust:exact}.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0 4px}.card{padding:8px}.card strong{font-size:11pt}h2{margin:13px 0 6px;font-size:13pt;break-after:avoid-page;page-break-after:avoid}.grid{display:block;break-inside:auto}.grid .panel+.panel{margin-top:8px}.grid .panel{break-inside:avoid;page-break-inside:avoid}.callout{break-inside:avoid;page-break-inside:avoid}th,td{padding:6px 7px}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}.footer{display:none}.no-print{display:none}}
  @media(max-width:650px){.page{padding:18px}.cards{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}
</style></head><body><main class="page">
<header class="hero"><div class="brand">Daxo · Inteligência da carteira</div><h1>Relatório analítico</h1><p class="subtitle">Leitura executiva do lote importado</p><div class="meta"><span><b>Arquivo:</b> ${escapeHtml(origem)}</span>${idLote != null ? `<span><b>Lote:</b> #${escapeHtml(idLote)}</span>` : ''}<span><b>Gerado em:</b> ${escapeHtml(geradoEm)}</span></div></header>
<h2>Visão geral</h2><p class="intro">Resumo dos registros válidos e do faturamento anual identificado na base.</p>
<section class="cards"><div class="card"><span>Clientes válidos</span><strong>${numero(totalClientes)}</strong></div><div class="card"><span>Faturamento total</span><strong>${moeda(receita)}</strong></div><div class="card"><span>Média por cliente</span><strong>${moeda(resumo.media)}</strong></div><div class="card"><span>Mediana</span><strong>${moeda(resumo.mediana)}</strong></div><div class="card"><span>Taxa de aproveitamento</span><strong>${numero(taxaValida, 1)}%</strong></div></section>
<h2>O que os dados mostram</h2><ul class="insights">${insights.length ? insights.map((texto) => `<li>${escapeHtml(texto)}</li>`).join('') : '<li>A base não tem registros suficientes para gerar conclusões.</li>'}</ul>
<div class="grid"><section class="panel"><h2>Composição por segmento</h2>${tabela(['Segmento','Clientes','Participação','Faturamento'], segmentos, 'Não há segmentos neste lote.')}</section><section class="panel"><h2>Perfil de atendimento</h2>${tabela(['Nível','Clientes','Participação','Faturamento'], niveis, 'Não há níveis neste lote.')}</section></div>
<div class="grid"><section class="panel"><h2>Faturamento por consultor</h2>${tabela(['Consultor','Clientes','Faturamento','Parte da receita'], consultores, 'Não há consultores para comparar.')}</section><section class="panel"><h2>Serviços mais contratados</h2>${tabela(['Serviço','Contratações','Participação'], servicos, 'Não há serviços neste lote.')}</section></div>
<section><h2>Maiores faturamentos individuais</h2>${tabela(['#','Cliente','Código','Faturamento anual','Parte da receita'], topClientes, 'Não há clientes para destacar.')}</section>
<div class="grid"><section class="panel"><h2>Contratações por mês</h2>${tabela(['Mês','Clientes'], meses, 'Não há datas para comparar.')}</section><section class="panel"><h2>Relação entre serviços e faturamento</h2><p class="callout">${escapeHtml(correlacaoTexto)}</p><p class="note">A correlação mede a intensidade e a direção da associação observada na amostra. Não demonstra causalidade.</p></section></div>
<section><h2>Qualidade da importação</h2><p class="intro">${numero(resumo.recebidas)} registros recebidos · ${numero(resumo.invalidas)} rejeitados · ${numero(totalClientes)} analisados. O aproveitamento foi de ${numero(taxaValida, 1)}%.</p>${errosResumo.length ? tabela(['Tipo de inconsistência','Ocorrências'], errosResumo) : '<p class="callout">Nenhuma inconsistência detalhada foi registrada nesta sessão.</p>'}${detalhesErro.length ? `<h3>Exemplos de ocorrências${erros.length > detalhesErro.length ? ` · ${detalhesErro.length} de ${erros.length}` : ''}</h3>${tabela(['Linha','Campo','Tipo','Descrição'], detalhesErro)}` : ''}${correcoes.length ? `<p class="note"><b>Padronizações aplicadas:</b> ${correcoes.map(([campo, total]) => `${escapeHtml(campo)} (${numero(total)})`).join(' · ')}.</p>` : ''}</section>
</main><script>window.onload=()=>setTimeout(()=>window.print(),350)</script></body></html>`

  const janela = window.open('', '_blank')
  if (!janela) return false
  janela.document.open()
  janela.document.write(html)
  janela.document.close()
  return true
}
