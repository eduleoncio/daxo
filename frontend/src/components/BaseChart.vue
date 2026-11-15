<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
// O entrypoint `auto` registra os controladores e oferece o construtor usado abaixo.
import Chart from 'chart.js/auto'

const props = defineProps({
  tipo: { type: String, default: 'bar' },
  rotulos: { type: Array, default: () => [] },
  valores: { type: Array, default: () => [] },
  moeda: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  mostrarLegenda: { type: Boolean, default: false }
})

const canvas = ref(null)
let chart
const paleta = ['#477858', '#87a77d', '#c4d7bd', '#d7b47d', '#7793a0', '#9c8772', '#8aa58d', '#bd8270']

function montarGrafico() {
  if (!canvas.value) return
  chart?.destroy()

  const doughnut = props.tipo === 'doughnut'
  const formatar = (valor) => props.moeda
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor || 0)
    : new Intl.NumberFormat('pt-BR').format(valor || 0)

  chart = new Chart(canvas.value, {
    type: props.tipo,
    data: {
      labels: props.rotulos,
      datasets: [{
        data: props.valores,
        backgroundColor: doughnut ? paleta : '#79ad67',
        borderColor: doughnut ? '#ffffff' : '#477858',
        borderWidth: doughnut ? 3 : 0,
        borderRadius: doughnut ? 0 : 3,
        tension: 0.32,
        fill: props.tipo === 'line',
        pointBackgroundColor: '#477858'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: props.horizontal ? 'y' : 'x',
      layout: { padding: 6 },
      plugins: {
        legend: {
          display: doughnut || props.mostrarLegenda,
          position: 'bottom',
          labels: { color: '#b2beb4', padding: 10, usePointStyle: true, font: { family: 'Inter, Segoe UI, sans-serif', size: 10 } }
        },
        tooltip: { callbacks: { label: (context) => `${context.label}: ${formatar(context.parsed?.[props.horizontal ? 'x' : 'y'] ?? context.parsed)}` } }
      },
      scales: doughnut ? {} : {
        x: {
          grid: { color: 'rgba(225,237,226,.09)' },
          ticks: { color: '#9eaca1', font: { family: 'Inter, Segoe UI, sans-serif', size: 10 }, callback: props.horizontal && props.moeda ? (value) => formatar(value) : undefined }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(225,237,226,.09)' },
          ticks: { color: '#9eaca1', font: { family: 'Inter, Segoe UI, sans-serif', size: 10 }, callback: !props.horizontal && props.moeda ? (value) => formatar(value) : undefined }
        }
      }
    }
  })
}

onMounted(montarGrafico)
watch(() => [props.tipo, props.rotulos, props.valores, props.moeda, props.horizontal], montarGrafico, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="chart-canvas-wrap">
    <canvas ref="canvas" role="img" :aria-label="`Gráfico com ${rotulos.length} categorias`"></canvas>
  </div>
</template>

<style>
.chart-canvas-wrap { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; }
.chart-canvas-wrap canvas { display: block; max-width: 100%; }
</style>
