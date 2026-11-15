"""Limpeza e padronização dos clientes recebidos do backend Spring."""

from __future__ import annotations

import math
import re
import unicodedata
from datetime import date, datetime

import pandas as pd

SEGMENTOS = {
    "ind": "Indústria", "industria": "Indústria", "industrial": "Indústria",
    "com": "Comércio", "comercio": "Comércio",
    "serv": "Serviços", "servico": "Serviços", "servicos": "Serviços",
    "saude": "Saúde", "edu": "Educação", "educacao": "Educação",
    "tec": "Tecnologia", "ti": "Tecnologia", "tecnologia": "Tecnologia",
}
SERVICOS = {
    "internet dedicada": "Internet Dedicada", "link empresarial": "Link Empresarial",
    "firewall": "Firewall", "backup": "Backup", "mpls": "MPLS", "cloud": "Cloud",
}
COLUNAS = ["codigo_cliente", "nome_cliente", "consultor", "segmento", "nivel_cliente",
           "faturamento_anual", "servicos_contratados", "data_contratacao", "cidade", "uf"]
OBRIGATORIAS = set(COLUNAS[:8])
PARTICULAS = {"de", "da", "do", "das", "dos", "e"}


def _simples(texto: str) -> str:
    sem_acento = "".join(c for c in unicodedata.normalize("NFKD", texto) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", sem_acento.lower()).strip()


def _vazio(valor) -> bool:
    if valor is None:
        return True
    try:
        return bool(pd.isna(valor))
    except (TypeError, ValueError):
        return False


def limpar_texto(valor) -> str | None:
    if _vazio(valor):
        return None
    texto = re.sub(r"\s+", " ", str(valor)).strip()
    return texto or None


def _titulo(texto: str | None) -> str | None:
    if not texto:
        return None
    palavras = texto.lower().split()
    return " ".join(p if i and p in PARTICULAS else p.capitalize() for i, p in enumerate(palavras))


def _numero(valor) -> float | None:
    if _vazio(valor):
        return None
    if isinstance(valor, (int, float)):
        numero = float(valor)
        return numero if math.isfinite(numero) else None
    texto = re.sub(r"\s", "", str(valor).replace("R$", "").replace("\u00a0", ""))
    if not re.fullmatch(r"-?[0-9.,]+", texto or ""):
        return None
    if "." in texto and "," in texto:
        texto = texto.replace(".", "").replace(",", ".") if texto.rfind(",") > texto.rfind(".") else texto.replace(",", "")
    elif "," in texto:
        texto = texto.replace(",", "") if texto.count(",") > 1 else texto.replace(",", ".")
    elif "." in texto and re.fullmatch(r"-?\d{1,3}(\.\d{3})+", texto):
        texto = texto.replace(".", "")
    try:
        numero = float(texto)
        return numero if math.isfinite(numero) else None
    except ValueError:
        return None


def _data(valor) -> date | None:
    if _vazio(valor):
        return None
    if isinstance(valor, (datetime, pd.Timestamp)):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = str(valor).strip()
    try:
        return date.fromisoformat(texto[:10]) if re.match(r"^\d{4}-\d{2}-\d{2}", texto) else datetime.strptime(texto, "%d/%m/%Y").date()
    except ValueError:
        return None


def tratar(linhas: list[dict]) -> tuple[list[dict], list[dict], dict[str, int]]:
    """Converte camelCase/snake_case em registros limpos e separa linhas inválidas."""
    tratados: list[dict] = []
    rejeitadas: list[dict] = []
    correcoes: dict[str, int] = {}

    for indice, original in enumerate(linhas, start=1):
        linha = {re.sub(r"(?<!^)(?=[A-Z])", "_", str(chave)).lower(): valor for chave, valor in original.items()}
        registro = {coluna: limpar_texto(linha.get(coluna)) for coluna in COLUNAS}
        registro["linha"] = linha.get("linha", indice)

        problemas = [campo for campo in OBRIGATORIAS if not registro[campo]]
        faturamento = _numero(linha.get("faturamento_anual"))
        data_contratacao = _data(linha.get("data_contratacao"))
        if not faturamento or faturamento <= 0:
            problemas.append("faturamento_anual")
        if data_contratacao is None:
            problemas.append("data_contratacao")
        if problemas:
            rejeitadas.append({"linha": registro["linha"], "campos": sorted(set(problemas))})
            continue

        segmento_bruto = registro["segmento"]
        segmento = SEGMENTOS.get(_simples(segmento_bruto), _titulo(segmento_bruto))
        consultor = _titulo(registro["consultor"])
        servicos = []
        for servico in (registro["servicos_contratados"] or "").split(";"):
            nome = limpar_texto(servico)
            if nome:
                nome = SERVICOS.get(_simples(nome), _titulo(nome))
                if nome not in servicos:
                    servicos.append(nome)

        padronizado = {
            **registro,
            "codigo_cliente": registro["codigo_cliente"].upper(),
            "nome_cliente": registro["nome_cliente"],
            "consultor": consultor,
            "segmento": segmento,
            "nivel_cliente": registro["nivel_cliente"].upper(),
            "faturamento_anual": faturamento,
            "servicos_contratados": servicos,
            "data_contratacao": data_contratacao,
            "cidade": registro["cidade"],
            "uf": (registro["uf"] or "").upper() or None,
        }
        tratados.append(padronizado)
        if segmento != segmento_bruto:
            correcoes["segmento"] = correcoes.get("segmento", 0) + 1
        if consultor != registro["consultor"]:
            correcoes["consultor"] = correcoes.get("consultor", 0) + 1
        if padronizado["nivel_cliente"] != registro["nivel_cliente"]:
            correcoes["nivel_cliente"] = correcoes.get("nivel_cliente", 0) + 1

    return tratados, rejeitadas, correcoes
