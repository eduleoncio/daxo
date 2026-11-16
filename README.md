<div align="center">
  <img src="frontend/public/daxo-mark.png" alt="Símbolo Daxo" width="92" />
  <h1>Daxo</h1>
  <p><strong>Dados claros. Decisões melhores.</strong></p>
  <p>Plataforma de análise de carteira comercial</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Java-21-f89820?logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3-6db33f?logo=springboot&logoColor=white" alt="Spring Boot 3" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white" alt="Python e FastAPI" />
</p>

## Sobre o projeto

Daxo transforma planilhas comerciais em uma visão organizada da carteira. A aplicação valida os registros, processa os dados e apresenta indicadores que ajudam a identificar segmentos, prioridades e oportunidades de atendimento.

## O que você encontra

- Cadastro e login com autenticação por token.
- Importação de arquivos CSV e Excel, com validação dos campos e dos registros.
- Painel com faturamento, clientes, segmentos e níveis de prioridade.
- Indicadores gráficos por segmento, nível, consultor, serviço e período.
- Maiores faturamentos, estatísticas e histórico dos lotes processados.
- Relatório das inconsistências encontradas durante a importação.
- Relatório analítico pronto para impressão ou para salvar em PDF.

## Como funciona

```text
Vue 3  →  Spring Boot  →  FastAPI  →  Banco de dados
           valida e        limpa, calcula
           coordena        e persiste
```

O frontend conversa com a API Java. O backend valida os dados e encaminha os registros para o serviço Python, que calcula e armazena os indicadores. O backend consulta o serviço Python para entregar os resultados ao painel.

## Tecnologias

| Parte | Tecnologias |
| --- | --- |
| Frontend | Vue 3, Vite, Pinia, Axios e Chart.js |
| Backend | Java 21, Spring Boot, Spring Security e JWT |
| Análise | Python, FastAPI, Pandas, NumPy, SciPy e SQLAlchemy |
| Banco local | H2 para o backend e SQLite para o serviço Python |
| Banco remoto | PostgreSQL, incluindo Azure Database for PostgreSQL |

## Executar no Windows

Você vai precisar de **Node.js e npm**, **Java 21 e Maven** e **Python 3.11 ou superior**. Inicie cada serviço em uma janela separada do Prompt de Comando, a partir da pasta do projeto.

### 1. Serviço de análise Python

```cmd
cd analytics-python
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

O banco SQLite local é criado automaticamente em `analytics-python/data/`. Para conferir a conexão configurada, rode `python testar_conexao.py` com o ambiente virtual ativo. Se ele já existir, basta ativá-lo e iniciar o Uvicorn.

### 2. Backend Java

```cmd
cd backend
mvn -DskipTests package
java -jar target\cti-insights-0.0.1-SNAPSHOT.jar
```

O backend inicia na porta `8080` e usa H2 local por padrão. Para executar esse comando, mantenha o terminal na pasta `backend`.

### 3. Frontend

```cmd
cd frontend
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

## Primeiro acesso

1. Abra o Daxo e crie uma conta.
2. Entre com a conta cadastrada.
3. Importe `dados_teste\clientes_teste_pronto.xlsx` para ver o fluxo completo.
4. Use `dados_teste\clientes_teste_com_inconsistencias.xlsx` para conferir os avisos de validação.

Os arquivos em `dados_teste/` são exemplos para demonstração e desenvolvimento.
Nas telas Painel, Indicadores e Relatórios, use **Salvar análise em PDF** e escolha **Salvar como PDF** na janela de impressão do navegador.

## Endereços locais

| Serviço | Endereço |
| --- | --- |
| Aplicação | `http://localhost:5173` |
| API Java | `http://localhost:8080` |
| Documentação interativa Python | `http://localhost:8000/docs` |
| Verificação de saúde Python | `http://localhost:8000/saude` |

## Configuração de banco remoto

O Azure é opcional. Para usar PostgreSQL remoto, copie `analytics-python/.env.example` para `analytics-python/.env` e preencha as credenciais. O arquivo `database/schema.sql` documenta a estrutura PostgreSQL; o Python cria as tabelas automaticamente ao iniciar. Configure também o backend para o mesmo banco e use o perfil Spring `azure`:

```cmd
java -jar target\cti-insights-0.0.1-SNAPSHOT.jar --spring.profiles.active=azure
```

Não coloque senhas, tokens ou arquivos `.env` no GitHub. Use valores próprios no seu ambiente local.

## Estrutura do repositório

```text
├── analytics-python/   # API FastAPI, análise e persistência dos lotes
├── backend/            # API Spring Boot, autenticação e integração
├── database/           # Esquema PostgreSQL de referência
├── dados_teste/        # Planilhas de demonstração
└── frontend/           # Aplicação Vue e interface do Daxo
```

---

<p align="center">Feito para transformar dados em decisões mais claras.</p>
