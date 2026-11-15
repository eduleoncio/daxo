"""Cálculos estatísticos e agrupamentos consumidos pelo dashboard."""

from collections import Counter
from statistics import mean, median, pstdev

import numpy as np
from scipy.stats import pearsonr

from insights import gerar


def calcular(linhas: list[dict], total_recebidas: int, rejeitadas: int = 0, correcoes=None) -> dict:
    faturamentos = [float(linha["faturamento_anual"]) for linha in linhas]
    servicos = Counter(servico for linha in linhas for servico in linha["servicos_contratados"])
    servicos_por_cliente = [len(linha["servicos_contratados"]) for linha in linhas]
    correlacao = {"coeficiente": None, "pValor": None}
    if len(faturamentos) > 1 and len(set(servicos_por_cliente)) > 1 and len(set(faturamentos)) > 1:
        resultado_correlacao = pearsonr(servicos_por_cliente, faturamentos)
        correlacao = {"coeficiente": float(resultado_correlacao.statistic), "pValor": float(resultado_correlacao.pvalue)}

    def agrupar(chave):
        grupos = {}
        for linha in linhas:
            nome = linha.get(chave) or "Não informado"
            grupo = grupos.setdefault(nome, {"categoria": nome, "clientes": 0, "faturamento": 0.0})
            grupo["clientes"] += 1
            grupo["faturamento"] += float(linha["faturamento_anual"])
        return sorted(grupos.values(), key=lambda item: (-item["clientes"], item["categoria"]))

    por_mes = Counter(linha["data_contratacao"].strftime("%Y-%m") for linha in linhas)
    valores = {
        "resumo": {
            "clientes": len(linhas), "recebidas": total_recebidas, "invalidas": rejeitadas,
            "faturamentoTotal": sum(faturamentos),
            "media": mean(faturamentos) if faturamentos else 0,
            "mediana": median(faturamentos) if faturamentos else 0,
            "desvioPadrao": pstdev(faturamentos) if len(faturamentos) > 1 else 0,
            "minimo": min(faturamentos, default=0), "maximo": max(faturamentos, default=0),
            "quartis": {"q1": float(np.percentile(faturamentos, 25)) if faturamentos else 0,
                        "q2": float(np.percentile(faturamentos, 50)) if faturamentos else 0,
                        "q3": float(np.percentile(faturamentos, 75)) if faturamentos else 0},
            "servicosContratados": sum(servicos.values()),
            "modaSegmento": Counter(linha["segmento"] for linha in linhas).most_common(1)[0][0] if linhas else None,
            "modaNivel": Counter(linha["nivel_cliente"] for linha in linhas).most_common(1)[0][0] if linhas else None,
            "modaServico": servicos.most_common(1)[0][0] if servicos else None,
        },
        "porSegmento": agrupar("segmento"),
        "porNivel": agrupar("nivel_cliente"),
        "porConsultor": agrupar("consultor"),
        "porServico": [{"categoria": nome, "clientes": quantidade} for nome, quantidade in servicos.most_common()],
        "porMes": [{"mes": mes, "clientes": quantidade} for mes, quantidade in sorted(por_mes.items())],
        "topClientes": sorted(
            [{"codigo": linha["codigo_cliente"], "nome": linha["nome_cliente"], "faturamento": linha["faturamento_anual"]} for linha in linhas],
            key=lambda item: item["faturamento"], reverse=True,
        )[:5],
        "correlacaoServicosFaturamento": correlacao,
        "correcoes": correcoes or {},
    }
    valores["insights"] = gerar(valores)
    return valores
