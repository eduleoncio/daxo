# CTI Insights

Projeto do curso dividido em três partes:

- `frontend/`: aplicação Vue 3 para login, upload, validação e visualização dos resultados.
- `backend/`: API Spring Boot que valida os dados recebidos e encaminha o lote ao Python.
- `analytics-python/`: API FastAPI que limpa os dados, calcula estatísticas, gera insights e grava cada lote.

## Executar localmente no Windows (CMD)

Abra três janelas do Prompt de Comando na pasta do projeto. O DBeaver não precisa estar aberto. Sem perfil adicional, o Spring usa H2 local e o Python usa SQLite.

### 1. Serviço Python

```cmd
cd analytics-python
.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn api:app --port 8000 --reload
```

Se a pasta `.venv` ainda não existir, crie-a antes com `python -m venv .venv`. Sem `DB_HOST`, o Python usa `analytics-python/data/cti_insights.db`.

### 2. Backend Java

```cmd
cd backend
mvn -DskipTests package
java -jar target\cti-insights-0.0.1-SNAPSHOT.jar
```

Use o JAR porque `mvn spring-boot:run` pode falhar quando o caminho do projeto contém caracteres acentuados no Windows. A compilação do JAR funciona nesse caminho. O banco H2 local fica em `backend/data/cti-insights`.

O Azure é opcional. Para usá-lo, configure `DB_HOST`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD` e `JWT_SECRET` no CMD do backend, e os mesmos dados em
`analytics-python/.env`; então inicie com:

```cmd
java -jar target\cti-insights-0.0.1-SNAPSHOT.jar --spring.profiles.active=azure
```

O perfil Azure não contém credenciais. O Python e o Java usam configurações de
banco separadas e ambos precisam apontar para o mesmo banco quando a atividade
for executada no Azure.

No Azure, inicie o Python antes do Spring. O serviço Python migra a antiga tabela
de autenticação `consultor` para `usuarios` se encontrar esse esquema legado,
liberando `consultor` para a dimensão analítica. Contas novas recebem perfil
`USER`; os endpoints administrativos `/consultores/**` exigem perfil `ADMIN`.
Para promover uma conta de demonstração pelo DBeaver, depois de criá-la:

```sql
UPDATE usuarios SET perfil = 'ADMIN' WHERE email = 'seu-email@example.com';
```

### 3. Frontend Vue

```cmd
cd frontend
npm install
npm run dev
```

Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`), faça cadastro/login e envie `dados_teste\clientes_teste_pronto.xlsx` ou `dados_teste\clientes_teste_pronto.csv` na tela de importação.

## Rotas da atividade

- `POST /api/clientes/validar`: validação do DTO e padronização da aula 10, sem persistir.
- `POST /api/clientes/analisar`: valida no Spring, chama o FastAPI, grava o lote e devolve os indicadores.
- `GET /api/dashboard`: lê do Python os indicadores do último lote persistido.
- `GET /api/dashboard?loteId=1`: carrega um lote específico.
- `GET /api/dashboard/lotes`: lista o histórico de envios para seleção no dashboard.
- `GET http://localhost:8000/saude`: verifica se o serviço Python está ativo.
- `POST http://localhost:8000/testar`: transforma e calcula sem gravar no banco. Use o JSON de `analytics-python/amostras/clientes.json` em `/docs`.
- `POST http://localhost:8000/etl`: recebe o lote do Spring e grava os clientes, contratos e estatísticas.
- `GET http://localhost:8000/lotes`: lista os últimos lotes persistidos.
- `GET http://localhost:8000/lotes/{id}`: lê o status e as estatísticas de um lote.

O FastAPI publica a documentação interativa em `http://localhost:8000/docs`. O dashboard e a página de gráficos carregam os indicadores persistidos do lote mais recente. Os arquivos de exemplo e a incompatibilidade do CSV original de seguros estão documentados em `dados_teste/LEIA-ME.txt`.
