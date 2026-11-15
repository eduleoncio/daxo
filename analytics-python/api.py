"""API FastAPI chamada pelo Spring Boot para análise e carga dos lotes."""

import os
import logging
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

import banco
from main import analisar_lote, processar_lote

app = FastAPI(title="CTI Insights - Ciência de Dados")
logger = logging.getLogger(__name__)
_engine = None


class PedidoETL(BaseModel):
    arquivoNome: str = "planilha"
    recebidas: int = Field(ge=0)
    invalidas: int = Field(default=0, ge=0)
    linhas: list[dict[str, Any]]


def engine():
    global _engine
    if _engine is None:
        _engine = banco.criar_engine()
    return _engine


@app.get("/saude")
def saude():
    return {"status": "ok"}


@app.post("/testar")
def testar(linhas: list[dict[str, Any]]):
    return analisar_lote(linhas, len(linhas))


@app.post("/etl")
def etl(pedido: PedidoETL, x_etl_key: str | None = Header(default=None)):
    chave = os.getenv("ETL_API_KEY", "").strip()
    if chave and x_etl_key != chave:
        raise HTTPException(status_code=401, detail="Chave do ETL inválida.")
    if not pedido.linhas:
        raise HTTPException(status_code=422, detail="Nenhuma linha válida foi enviada.")
    try:
        return processar_lote(engine(), pedido.arquivoNome, pedido.linhas,
                              pedido.recebidas, pedido.invalidas)
    except Exception as erro:
        logger.exception("Falha ao processar o lote %s", pedido.arquivoNome)
        raise HTTPException(status_code=500, detail="Falha ao processar o lote. Consulte o terminal do serviço Python.") from erro


@app.get("/lotes")
def lotes():
    try:
        return banco.listar_lotes(engine())
    except Exception as erro:
        logger.exception("Falha ao consultar o histórico de lotes")
        raise HTTPException(status_code=503, detail="Não foi possível consultar os lotes.") from erro


@app.get("/lotes/ultimo")
def ultimo_lote():
    try:
        lote = banco.obter_ultimo_lote(engine())
        if lote is None:
            raise HTTPException(status_code=404, detail="Ainda não há lotes processados.")
        return lote
    except HTTPException:
        raise
    except Exception as erro:
        logger.exception("Falha ao consultar o último lote")
        raise HTTPException(status_code=503, detail="Não foi possível consultar o último lote.") from erro


@app.get("/lotes/{lote_id}")
def obter_lote(lote_id: int):
    try:
        lote = banco.obter_lote(engine(), lote_id)
        if lote is None:
            raise HTTPException(status_code=404, detail="Lote não encontrado.")
        return lote
    except HTTPException:
        raise
    except Exception as erro:
        logger.exception("Falha ao consultar o lote %s", lote_id)
        raise HTTPException(status_code=503, detail="Não foi possível consultar o lote.") from erro
