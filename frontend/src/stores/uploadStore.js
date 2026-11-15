import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import api from '../services/api'

const CAMPOS_OBRIGATORIOS = [
  'codigo_cliente',
  'nome_cliente',
  'consultor',
  'segmento',
  'nivel_cliente',
  'faturamento_anual',
  'servicos_contratados',
  'data_contratacao'
]

const ALIASES_DE_COLUNA = {
  codigo_cliente: ['codigo_cliente', 'codigo cliente', 'codigo', 'id cliente'],
  nome_cliente: ['nome_cliente', 'nome cliente', 'nome', 'cliente'],
  email: ['email', 'e-mail', 'email cliente'],
  consultor: ['consultor', 'nome consultor'],
  segmento: ['segmento'],
  nivel_cliente: ['nivel_cliente', 'nivel cliente', 'nivel'],
  faturamento_anual: ['faturamento_anual', 'faturamento anual', 'faturamento'],
  servicos_contratados: ['servicos_contratados', 'servicos contratados', 'serviços contratados', 'servicos'],
  data_contratacao: ['data_contratacao', 'data contratacao', 'data de contratacao', 'data contratação'],
  cidade: ['cidade'],
  uf: ['uf', 'estado']
}

const rotulos = {
  codigo_cliente: 'Código do cliente',
  nome_cliente: 'Nome do cliente',
  email: 'E-mail',
  consultor: 'Consultor',
  segmento: 'Segmento',
  nivel_cliente: 'Nível do cliente',
  faturamento_anual: 'Faturamento anual',
  servicos_contratados: 'Serviços contratados',
  data_contratacao: 'Data de contratação',
  cidade: 'Cidade',
  uf: 'UF',
  arquivo: 'Arquivo'
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim()
}

function normalizarChave(valor) {
  return normalizarTexto(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function paraNumero(valor) {
  if (typeof valor === 'number') return valor

  const texto = normalizarTexto(valor)
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')

  if (!texto) return Number.NaN

  const numeroBrasileiro = texto.includes(',')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto

  return Number(numeroBrasileiro)
}

function textoPadronizado(valor) {
  return normalizarTexto(valor).replace(/\s+/g, ' ')
}

function paraDataIso(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    const ano = valor.getFullYear()
    const mes = String(valor.getMonth() + 1).padStart(2, '0')
    const dia = String(valor.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }
  const texto = normalizarTexto(valor)
  const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return brasileira ? `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}` : texto
}

function dataIsoValida(valor) {
  const partes = paraDataIso(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!partes) return false
  const [, ano, mes, dia] = partes.map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
}

function paraClienteDTO(cliente) {
  return {
    codigoCliente: normalizarTexto(cliente.codigo_cliente),
    nomeCliente: normalizarTexto(cliente.nome_cliente),
    consultor: normalizarTexto(cliente.consultor),
    segmento: normalizarTexto(cliente.segmento),
    nivelCliente: normalizarTexto(cliente.nivel_cliente),
    faturamentoAnual: paraNumero(cliente.faturamento_anual),
    servicosContratados: normalizarTexto(cliente.servicos_contratados),
    dataContratacao: paraDataIso(cliente.data_contratacao),
    cidade: normalizarTexto(cliente.cidade),
    uf: normalizarTexto(cliente.uf)
  }
}

function doDTOParaCliente(cliente) {
  return {
    codigo_cliente: cliente.codigoCliente,
    nome_cliente: cliente.nomeCliente,
    cliente: cliente.nomeCliente,
    consultor: cliente.consultor,
    segmento: cliente.segmento,
    nivel_cliente: cliente.nivelCliente,
    faturamento_anual: cliente.faturamentoAnual,
    faturamento: cliente.faturamentoAnual,
    servicos_contratados: cliente.servicosContratados,
    data_contratacao: cliente.dataContratacao,
    cidade: cliente.cidade,
    uf: cliente.uf
  }
}

export const useUploadStore = defineStore('upload', {
  state: () => ({
    arquivo: null,
    dadosOriginais: [],
    dadosTratados: [],
    erros: [],
    carregando: false,
    processado: false,
    estatisticas: null,
    loteId: null,
    lote: null,
    lotes: []
  }),

  getters: {
    totalRegistros: (state) => state.estatisticas?.resumo?.recebidas ?? state.dadosOriginais.length,
    totalClientes: (state) => state.estatisticas?.resumo?.clientes ?? state.dadosOriginais.length,
    totalErros: (state) => state.erros.length || state.estatisticas?.resumo?.invalidas || 0,
    linhasComErro: (state) => {
      const linhas = new Set(
      state.erros
        .filter((erro) => typeof erro.linha === 'number')
        .map((erro) => erro.linha)
      ).size
      return linhas || state.estatisticas?.resumo?.invalidas || 0
    },
    registrosValidos() {
      return Math.max(0, this.totalRegistros - this.linhasComErro)
    },
    registrosComErro() {
      return this.linhasComErro
    },
    errosPorTipo: (state) => {
      const contagem = state.erros.reduce((resultado, erro) => {
        resultado[erro.tipo] = (resultado[erro.tipo] || 0) + 1
        return resultado
      }, {})

      return Object.entries(contagem)
        .map(([tipo, total]) => ({ tipo, total }))
        .sort((a, b) => b.total - a.total || a.tipo.localeCompare(b.tipo))
    },
    clientesNivelA: (state) => state.estatisticas?.porNivel?.find((item) => item.categoria === 'A')?.clientes ?? state.dadosTratados.filter((cliente) => cliente.nivel_cliente === 'A').length,
    clientesNivelB: (state) => state.estatisticas?.porNivel?.find((item) => item.categoria === 'B')?.clientes ?? state.dadosTratados.filter((cliente) => cliente.nivel_cliente === 'B').length,
    clientesNivelC: (state) => state.estatisticas?.porNivel?.find((item) => item.categoria === 'C')?.clientes ?? state.dadosTratados.filter((cliente) => cliente.nivel_cliente === 'C').length,
    faturamentoMedio: (state) => {
      if (state.estatisticas?.resumo) return state.estatisticas.resumo.media
      const valores = state.dadosTratados.map((cliente) => Number(cliente.faturamento) || 0)
      return valores.length ? valores.reduce((total, valor) => total + valor, 0) / valores.length : 0
    },
    segmentos: (state) => state.estatisticas?.porSegmento
      ? Object.fromEntries(state.estatisticas.porSegmento.map((item) => [item.categoria, item.clientes]))
      : state.dadosTratados.reduce((resultado, cliente) => {
      const segmento = cliente.segmento || 'Não informado'
      resultado[segmento] = (resultado[segmento] || 0) + 1
      return resultado
    }, {}),
    temDados: (state) => state.processado,
    temResultado: (state) => state.processado
  },

  actions: {
    async carregarUltimoLote() {
      try {
        const resposta = await api.get('/api/dashboard')
        if (!resposta.data?.estatisticas) return false
        this.lote = resposta.data
        this.estatisticas = resposta.data.estatisticas
        this.loteId = resposta.data.id
        this.processado = true
        return true
      } catch (erro) {
        console.warn('Não foi possível carregar o último lote salvo.', erro)
        return false
      }
    },

    async carregarLotes() {
      try {
        const resposta = await api.get('/api/dashboard/lotes')
        this.lotes = resposta.data || []
        return true
      } catch (erro) {
        console.warn('Não foi possível carregar o histórico de lotes.', erro)
        return false
      }
    },

    async carregarLote(id) {
      try {
        const resposta = await api.get('/api/dashboard', { params: { loteId: id } })
        this.lote = resposta.data
        this.loteId = resposta.data.id
        this.estatisticas = resposta.data.estatisticas || null
        this.processado = Boolean(this.estatisticas)
        return true
      } catch (erro) {
        console.warn('Não foi possível carregar o lote selecionado.', erro)
        return false
      }
    },

    adicionarErro({ linha = 'Arquivo', campo = 'arquivo', tipo, descricao, valor = '' }) {
      this.erros.push({
        id: `${linha}-${campo}-${tipo}-${this.erros.length}`,
        linha,
        campo: rotulos[campo] || campo,
        tipo,
        descricao,
        valor
      })
    },

    selecionarArquivo(file) {
      this.arquivo = file
      this.dadosOriginais = []
      this.dadosTratados = []
      this.erros = []
      this.processado = false
      this.estatisticas = null
      this.loteId = null
      this.lote = null
    },

    validarArquivo() {
      if (!this.arquivo) {
        this.adicionarErro({
          tipo: 'Arquivo não selecionado',
          descricao: 'Selecione uma planilha antes de processar.'
        })
        return false
      }

      const extensoesPermitidas = ['.xlsx', '.xls', '.csv']
      const arquivoValido = extensoesPermitidas.some((extensao) =>
        this.arquivo.name.toLowerCase().endsWith(extensao)
      )

      if (!arquivoValido) {
        this.adicionarErro({
          tipo: 'Formato inválido',
          descricao: 'Use um arquivo XLSX, XLS ou CSV.'
        })
        return false
      }

      return true
    },

    montarMapaDeColunas(colunas) {
      const normalizadas = new Map(colunas.map((coluna) => [normalizarChave(coluna), coluna]))

      return Object.fromEntries(Object.entries(ALIASES_DE_COLUNA).map(([campo, aliases]) => {
        const encontrada = aliases
          .map((alias) => normalizadas.get(normalizarChave(alias)))
          .find(Boolean)
        return [campo, encontrada]
      }))
    },

    validarLinha(linha, numeroLinha, mapaColunas) {
      const dados = {}

      Object.entries(mapaColunas).forEach(([campo, coluna]) => {
        dados[campo] = coluna ? linha[coluna] : ''
      })

      CAMPOS_OBRIGATORIOS.forEach((campo) => {
        if (!normalizarTexto(dados[campo])) {
          this.adicionarErro({
            linha: numeroLinha,
            campo,
            tipo: 'Campo obrigatório vazio',
            descricao: 'Este campo é obrigatório e não foi preenchido.'
          })
        }
      })

      Object.entries(dados).forEach(([campo, valor]) => {
        if (valor !== null && valor !== undefined && String(valor) !== String(valor).trim()) {
          this.adicionarErro({
            linha: numeroLinha,
            campo,
            tipo: 'Espaços desnecessários',
            descricao: 'Há espaços no início ou no fim do valor.',
            valor
          })
        }
      })

      const limitesTexto = { codigo_cliente: 30, nome_cliente: 150, consultor: 120, segmento: 100, cidade: 100 }
      Object.entries(limitesTexto).forEach(([campo, limite]) => {
        if (normalizarTexto(dados[campo]).length > limite) {
          this.adicionarErro({
            linha: numeroLinha,
            campo,
            tipo: 'Texto acima do limite',
            descricao: `Este campo aceita no máximo ${limite} caracteres.`,
            valor: dados[campo]
          })
        }
      })

      const email = normalizarTexto(dados.email)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'email',
          tipo: 'E-mail inválido',
          descricao: 'Informe um e-mail no formato nome@dominio.com.',
          valor: email
        })
      }

      const codigo = normalizarTexto(dados.codigo_cliente)
      if (codigo && !/^[A-Za-z0-9_-]+$/.test(codigo)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'codigo_cliente',
          tipo: 'Fora do padrão',
          descricao: 'O código deve usar apenas letras, números, hífen ou sublinhado.',
          valor: codigo
        })
      }

      const nivel = normalizarTexto(dados.nivel_cliente).toUpperCase()
      if (nivel && !['A', 'B', 'C'].includes(nivel)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'nivel_cliente',
          tipo: 'Fora do padrão',
          descricao: 'O nível do cliente deve ser A, B ou C.',
          valor: dados.nivel_cliente
        })
      }

      const faturamento = paraNumero(dados.faturamento_anual)
      if (normalizarTexto(dados.faturamento_anual) && (!Number.isFinite(faturamento) || faturamento <= 0)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'faturamento_anual',
          tipo: 'Fora do padrão',
          descricao: 'O faturamento deve ser um número maior que zero.',
          valor: dados.faturamento_anual
        })
      }

      const data = normalizarTexto(paraDataIso(dados.data_contratacao))
      if (data && !dataIsoValida(data)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'data_contratacao',
          tipo: 'Data inválida',
          descricao: 'Informe uma data válida no formato AAAA-MM-DD ou DD/MM/AAAA.',
          valor: data
        })
      }

      const uf = normalizarTexto(dados.uf)
      if (uf && !/^[A-Za-z]{2}$/.test(uf)) {
        this.adicionarErro({
          linha: numeroLinha,
          campo: 'uf',
          tipo: 'UF inválida',
          descricao: 'A UF deve conter exatamente duas letras.',
          valor: uf
        })
      }

      ;['nome_cliente', 'consultor', 'segmento'].forEach((campo) => {
        const valor = normalizarTexto(dados[campo])
        if (valor && valor !== textoPadronizado(valor)) {
          this.adicionarErro({
            linha: numeroLinha,
            campo,
            tipo: 'Padronização necessária',
            descricao: 'O texto possui espaçamentos internos inconsistentes.',
            valor: dados[campo]
          })
        }
      })

      return dados
    },

    verificarDuplicidades(registros) {
      const camposParaVerificar = ['codigo_cliente', 'email']

      camposParaVerificar.forEach((campo) => {
        const encontrados = new Map()

        registros.forEach(({ dados, numeroLinha }) => {
          const valor = normalizarChave(dados[campo])
          if (!valor) return
          const linhas = encontrados.get(valor) || []
          linhas.push(numeroLinha)
          encontrados.set(valor, linhas)
        })

        encontrados.forEach((linhas, valor) => {
          if (linhas.length < 2) return
          linhas.forEach((linha) => {
            this.adicionarErro({
              linha,
              campo,
              tipo: 'Registro duplicado',
              descricao: `O valor "${valor}" também aparece na(s) linha(s) ${linhas.filter((item) => item !== linha).join(', ')}.`,
              valor
            })
          })
        })
      })
    },

    tratarLinha(dados) {
      const faturamento = paraNumero(dados.faturamento_anual)
      const segmento = textoPadronizado(dados.segmento)
      const mapaSegmentos = {
        industria: 'Indústria',
        comercio: 'Comércio',
        servicos: 'Serviços',
        educacao: 'Educação',
        saude: 'Saúde',
        tecnologia: 'Tecnologia'
      }

      return {
        ...dados,
        codigo_cliente: textoPadronizado(dados.codigo_cliente),
        nome_cliente: textoPadronizado(dados.nome_cliente),
        cliente: textoPadronizado(dados.nome_cliente),
        email: textoPadronizado(dados.email),
        consultor: textoPadronizado(dados.consultor),
        segmento: mapaSegmentos[normalizarChave(segmento)] || segmento,
        nivel_cliente: textoPadronizado(dados.nivel_cliente).toUpperCase(),
        servicos_contratados: textoPadronizado(dados.servicos_contratados),
        data_contratacao: paraDataIso(dados.data_contratacao),
        cidade: textoPadronizado(dados.cidade),
        uf: textoPadronizado(dados.uf).toUpperCase(),
        faturamento_anual: faturamento,
        faturamento
      }
    },

    async processarPlanilha() {
      this.erros = []
      if (!this.validarArquivo()) return

      this.carregando = true
      this.dadosOriginais = []
      this.dadosTratados = []
      this.processado = false
      this.estatisticas = null
      this.loteId = null

      try {
        const buffer = await this.arquivo.arrayBuffer()
        const workbook = XLSX.read(buffer, { cellDates: true })
        const primeiraAba = workbook.SheetNames[0]

        if (!primeiraAba) {
          this.adicionarErro({ tipo: 'Planilha vazia', descricao: 'O arquivo não possui nenhuma aba para leitura.' })
          this.processado = true
          return
        }

        const linhas = XLSX.utils.sheet_to_json(workbook.Sheets[primeiraAba], { defval: '' })
        if (!linhas.length) {
          this.adicionarErro({ tipo: 'Planilha vazia', descricao: 'A primeira aba não possui registros.' })
          this.processado = true
          return
        }

        const mapaColunas = this.montarMapaDeColunas(Object.keys(linhas[0]))
        CAMPOS_OBRIGATORIOS.filter((campo) => !mapaColunas[campo]).forEach((campo) => {
          this.adicionarErro({
            linha: 'Cabeçalho',
            campo,
            tipo: 'Coluna obrigatória ausente',
            descricao: `A coluna "${rotulos[campo]}" não foi encontrada na planilha.`
          })
        })

        const registros = linhas.map((linha, indice) => {
          const dados = this.validarLinha(linha, indice + 2, mapaColunas)
          return { dados, numeroLinha: indice + 2 }
        })

        this.verificarDuplicidades(registros)
        this.dadosOriginais = registros.map(({ dados, numeroLinha }) => ({ ...dados, numero_linha: numeroLinha }))
        this.dadosTratados = registros.map(({ dados }) => this.tratarLinha(dados))

        if (this.erros.some((erro) => erro.linha === 'Cabeçalho')) {
          this.processado = true
          return
        }

        const linhasComErro = new Set(this.erros
          .filter((erro) => typeof erro.linha === 'number')
          .map((erro) => erro.linha))
        const linhasValidas = this.dadosTratados.filter((_, indice) => !linhasComErro.has(indice + 2))
        if (!linhasValidas.length) {
          this.processado = true
          return
        }

        const resposta = await api.post('/api/clientes/analisar', {
          arquivoNome: this.arquivo.name,
          recebidas: this.dadosOriginais.length,
          linhas: linhasValidas.map(paraClienteDTO)
        })
        this.dadosTratados = resposta.data.clientes.map(doDTOParaCliente)
        this.estatisticas = resposta.data.estatisticas
        this.loteId = resposta.data.loteId
        this.lote = { id: resposta.data.loteId, arquivoNome: this.arquivo.name, status: 'PROCESSADO' }
        this.processado = true
        await this.carregarLotes()
      } catch (erro) {
        console.error(erro)
        const resposta = erro.response?.data
        const detalhes = resposta?.erro || resposta?.detail || resposta?.message || Object.values(resposta?.campos || {})[0]
        if (detalhes) {
          this.adicionarErro({ tipo: 'Validação do backend', descricao: detalhes })
          this.processado = true
          return
        }
        this.adicionarErro({
          tipo: 'Falha de leitura',
          descricao: 'Não foi possível ler a planilha. Verifique se o arquivo não está corrompido.'
        })
        this.processado = true
      } finally {
        this.carregando = false
      }
    }
  }
})
