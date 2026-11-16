"""Coordena a transformação, análise e persistência de um lote."""

import banco
from analise import calcular
from limpeza import tratar


def analisar_lote(linhas: list[dict], recebidas: int, invalidas: int = 0) -> dict:
    tratados, rejeitados, correcoes = tratar(linhas)
    estatisticas = calcular(tratados, recebidas, invalidas + len(rejeitados), correcoes)
    return {"linhas": tratados, "rejeitadas": rejeitados, "estatisticas": estatisticas}


def processar_lote(engine, nome_arquivo: str, linhas: list[dict], recebidas: int, invalidas: int = 0) -> dict:
    lote_id = banco.reservar_lote(engine, nome_arquivo, recebidas)
    try:
        resultado = analisar_lote(linhas, recebidas, invalidas)
        banco.gravar_resultado(
            engine, lote_id, invalidas + len(resultado["rejeitadas"]),
            resultado["linhas"], resultado["estatisticas"],
        )
        return {"ok": True, "loteId": lote_id, **resultado}
    except Exception as erro:
        try:
            banco.marcar_erro(engine, lote_id, str(erro))
        except Exception:
            pass
        raise
