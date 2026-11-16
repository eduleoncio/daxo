"""Persistência do lote transformado e dos indicadores (PostgreSQL ou SQLite local)."""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, Date, DateTime, Float, ForeignKey, Integer, JSON, MetaData, String,
    Table, Text, UniqueConstraint, create_engine, insert, select,
)

from config import database_url

metadata = MetaData()
upload_lote = Table(
    "upload_lote", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("arquivo_nome", String(255), nullable=False),
    Column("status", String(20), nullable=False),
    Column("total_linhas", Integer, nullable=False),
    Column("linhas_validas", Integer, nullable=False),
    Column("linhas_invalidas", Integer, nullable=False),
    Column("mensagem", String(500)),
    Column("criado_em", DateTime(timezone=True), nullable=False),
)
segmento = Table("segmento", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True), Column("nome", String(100), unique=True, nullable=False))
consultor = Table("consultor", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True), Column("nome", String(120), unique=True, nullable=False))
servico = Table("servico", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True), Column("nome", String(120), unique=True, nullable=False))
cliente = Table(
    "cliente", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("lote_id", ForeignKey("upload_lote.id", ondelete="CASCADE"), nullable=False),
    Column("codigo_cti", String(30), nullable=False), Column("nome", String(150), nullable=False),
    Column("consultor", String(120), nullable=False),
    Column("consultor_id", ForeignKey("consultor.id"), nullable=False),
    Column("segmento", String(100), nullable=False),
    Column("segmento_id", ForeignKey("segmento.id"), nullable=False),
    Column("nivel", String(1), nullable=False), Column("faturamento_anual", Float, nullable=False),
    Column("data_contratacao", Date, nullable=False), Column("cidade", String(100)), Column("uf", String(2)),
    UniqueConstraint("lote_id", "codigo_cti", name="uq_cliente_lote_codigo"),
)
contrato = Table(
    "contrato", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("cliente_id", ForeignKey("cliente.id", ondelete="CASCADE"), nullable=False),
    Column("servico", String(120), nullable=False),
    Column("servico_id", ForeignKey("servico.id"), nullable=False),
    Column("data_contratacao", Date, nullable=False),
)
estatistica_lote = Table(
    "estatistica_lote", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("lote_id", ForeignKey("upload_lote.id", ondelete="CASCADE"), unique=True, nullable=False),
    Column("resultado", JSON, nullable=False),
)


def criar_engine():
    engine = create_engine(database_url(), pool_pre_ping=True)
    _migrar_usuarios_anteriores(engine)
    metadata.create_all(engine)
    _migrar_relacionamentos_antigos(engine)
    return engine


def _migrar_usuarios_anteriores(engine) -> None:
    """Libera o nome consultor para a dimensão de clientes sem perder usuários antigos."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    tabelas = set(inspector.get_table_names())
    if "consultor" not in tabelas:
        return
    colunas = {item["name"].lower() for item in inspector.get_columns("consultor")}
    if not {"email", "senha"}.issubset(colunas):
        return
    if "usuarios" in tabelas:
        raise RuntimeError(
            "O banco tem a tabela antiga consultor e também usuarios. "
            "Migre os usuários antes de iniciar o ETL para evitar conflito de tabelas."
        )
    with engine.begin() as conexao:
        conexao.execute(text("ALTER TABLE consultor RENAME TO usuarios"))


def _migrar_relacionamentos_antigos(engine) -> None:
    """Adiciona as chaves de dimensão em bases SQLite/PostgreSQL já existentes."""
    from sqlalchemy import inspect, text

    with engine.begin() as conexao:
        tabelas = set(inspect(conexao).get_table_names())
        if "cliente" not in tabelas or "contrato" not in tabelas:
            return

        colunas_cliente = {item["name"] for item in inspect(conexao).get_columns("cliente")}
        colunas_contrato = {item["name"] for item in inspect(conexao).get_columns("contrato")}
        if "consultor" not in colunas_cliente:
            conexao.execute(text("ALTER TABLE cliente ADD COLUMN consultor VARCHAR(120)"))
        if "servico" not in colunas_contrato:
            conexao.execute(text("ALTER TABLE contrato ADD COLUMN servico VARCHAR(120)"))
        if "consultor_id" not in colunas_cliente:
            conexao.execute(text("ALTER TABLE cliente ADD COLUMN consultor_id INTEGER REFERENCES consultor(id)"))
        if "segmento_id" not in colunas_cliente:
            conexao.execute(text("ALTER TABLE cliente ADD COLUMN segmento_id INTEGER REFERENCES segmento(id)"))
        if "servico_id" not in colunas_contrato:
            conexao.execute(text("ALTER TABLE contrato ADD COLUMN servico_id INTEGER REFERENCES servico(id)"))
        if "data_contratacao" not in colunas_contrato:
            conexao.execute(text("ALTER TABLE contrato ADD COLUMN data_contratacao DATE"))

        # Esquema normalizado da aula antiga já tem os ids; recupera os nomes
        # para compatibilidade e para que as leituras existentes continuem válidas.
        conexao.execute(text("""
            UPDATE cliente SET consultor = (SELECT nome FROM consultor WHERE id = cliente.consultor_id)
            WHERE consultor IS NULL AND consultor_id IS NOT NULL
        """))
        conexao.execute(text("""
            UPDATE contrato SET servico = (SELECT nome FROM servico WHERE id = contrato.servico_id)
            WHERE servico IS NULL AND servico_id IS NOT NULL
        """))

        # Bases locais antigas guardavam os nomes nas linhas. Recria as dimensões
        # e preenche as chaves para manter os dados legíveis após a migração.
        def garantir_dimensao(tabela, nomes):
            for (nome,) in nomes:
                existente = conexao.execute(select(tabela.c.id).where(tabela.c.nome == nome)).first()
                if existente is None:
                    conexao.execute(insert(tabela).values(nome=nome))

        garantir_dimensao(consultor, conexao.execute(text(
            "SELECT DISTINCT consultor FROM cliente WHERE consultor IS NOT NULL"
        )))
        garantir_dimensao(segmento, conexao.execute(text(
            "SELECT DISTINCT segmento FROM cliente WHERE segmento IS NOT NULL"
        )))
        garantir_dimensao(servico, conexao.execute(text(
            "SELECT DISTINCT servico FROM contrato WHERE servico IS NOT NULL"
        )))
        conexao.execute(text("""
            UPDATE cliente SET consultor_id = (SELECT id FROM consultor WHERE consultor.nome = cliente.consultor)
            WHERE consultor_id IS NULL
        """))
        conexao.execute(text("""
            UPDATE cliente SET segmento_id = (SELECT id FROM segmento WHERE segmento.nome = cliente.segmento)
            WHERE segmento_id IS NULL
        """))
        conexao.execute(text("""
            UPDATE contrato SET servico_id = (SELECT id FROM servico WHERE servico.nome = contrato.servico)
            WHERE servico_id IS NULL
        """))
        # A data histórica fica em cliente.data_contratacao, então replica para os
        # contratos antigos que ainda não tinham a coluna de data.
        conexao.execute(text("""
            UPDATE contrato SET data_contratacao = (
                SELECT cliente.data_contratacao FROM cliente WHERE cliente.id = contrato.cliente_id
            ) WHERE data_contratacao IS NULL
        """))


def reservar_lote(engine, nome_arquivo: str, recebidas: int) -> int:
    agora = datetime.now(timezone.utc)
    with engine.begin() as conexao:
        lote_id = conexao.execute(insert(upload_lote).values(
            arquivo_nome=nome_arquivo, status="PROCESSANDO", total_linhas=recebidas,
            linhas_validas=0, linhas_invalidas=0, criado_em=agora,
        ).returning(upload_lote.c.id)).scalar_one()

    return lote_id


def gravar_resultado(engine, lote_id: int, rejeitadas: int, linhas: list[dict], resultado: dict) -> None:
    with engine.begin() as conexao:
        def id_dimensao(tabela, nome: str) -> int:
            existente = conexao.execute(select(tabela.c.id).where(tabela.c.nome == nome)).scalar_one_or_none()
            if existente is not None:
                return existente
            if engine.dialect.name == "postgresql":
                from sqlalchemy.dialects.postgresql import insert as inserir
            elif engine.dialect.name == "sqlite":
                from sqlalchemy.dialects.sqlite import insert as inserir
            else:
                raise RuntimeError(f"Banco não suportado para dimensões: {engine.dialect.name}")
            conexao.execute(inserir(tabela).values(nome=nome).on_conflict_do_nothing(index_elements=[tabela.c.nome]))
            return conexao.execute(select(tabela.c.id).where(tabela.c.nome == nome)).scalar_one()

        for item in linhas:
            cliente_id = conexao.execute(insert(cliente).values(
                lote_id=lote_id, codigo_cti=item["codigo_cliente"], nome=item["nome_cliente"],
                consultor=item["consultor"], consultor_id=id_dimensao(consultor, item["consultor"]),
                segmento=item["segmento"], segmento_id=id_dimensao(segmento, item["segmento"]),
                nivel=item["nivel_cliente"], faturamento_anual=item["faturamento_anual"],
                data_contratacao=item["data_contratacao"],
                cidade=item["cidade"], uf=item["uf"],
            ).returning(cliente.c.id)).scalar_one()
            for nome in item["servicos_contratados"]:
                conexao.execute(insert(contrato).values(
                    cliente_id=cliente_id, servico=nome, servico_id=id_dimensao(servico, nome),
                    data_contratacao=item["data_contratacao"],
                ))
        conexao.execute(insert(estatistica_lote).values(lote_id=lote_id, resultado=resultado))
        conexao.execute(upload_lote.update().where(upload_lote.c.id == lote_id).values(
            status="PROCESSADO", linhas_validas=len(linhas), linhas_invalidas=rejeitadas,
            mensagem=None,
        ))


def marcar_erro(engine, lote_id: int, mensagem: str) -> None:
    with engine.begin() as conexao:
        conexao.execute(upload_lote.update().where(upload_lote.c.id == lote_id).values(
            status="ERRO", mensagem=mensagem[:500],
        ))


def listar_lotes(engine) -> list[dict]:
    with engine.connect() as conexao:
        rows = conexao.execute(select(
            upload_lote.c.id, upload_lote.c.arquivo_nome, upload_lote.c.status,
            upload_lote.c.total_linhas, upload_lote.c.linhas_validas,
            upload_lote.c.linhas_invalidas, upload_lote.c.mensagem, upload_lote.c.criado_em,
        ).order_by(upload_lote.c.id.desc()).limit(100)).mappings().all()
        return [dict(row) for row in rows]


def obter_lote(engine, lote_id: int) -> dict | None:
    consulta = select(
        upload_lote.c.id, upload_lote.c.arquivo_nome, upload_lote.c.status,
        upload_lote.c.total_linhas, upload_lote.c.linhas_validas,
        upload_lote.c.linhas_invalidas, upload_lote.c.mensagem,
        upload_lote.c.criado_em, estatistica_lote.c.resultado.label("estatisticas"),
    ).select_from(upload_lote.outerjoin(estatistica_lote, estatistica_lote.c.lote_id == upload_lote.c.id))
    with engine.connect() as conexao:
        row = conexao.execute(consulta.where(upload_lote.c.id == lote_id)).mappings().first()
        return dict(row) if row else None


def obter_ultimo_lote(engine) -> dict | None:
    consulta = select(
        upload_lote.c.id, upload_lote.c.arquivo_nome, upload_lote.c.status,
        upload_lote.c.total_linhas, upload_lote.c.linhas_validas,
        estatistica_lote.c.resultado.label("estatisticas"),
    ).join(estatistica_lote, estatistica_lote.c.lote_id == upload_lote.c.id)
    with engine.connect() as conexao:
        row = conexao.execute(consulta.order_by(upload_lote.c.id.desc()).limit(1)).mappings().first()
        return dict(row) if row else None
