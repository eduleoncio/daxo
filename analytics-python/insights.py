"""Gera leituras objetivas a partir dos indicadores calculados."""


def _percentual(parte: float, total: float) -> float:
    return (parte / total * 100) if total else 0


def _brl(valor: float) -> str:
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def gerar(resultado: dict) -> list[str]:
    resumo = resultado["resumo"]
    clientes = resumo.get("clientes", 0)
    faturamento_total = resumo.get("faturamentoTotal", 0) or 0
    frases: list[str] = []

    if clientes:
        frases.append(
            f"A carteira tem {clientes} clientes válidos e faturamento anual de "
            f"{_brl(faturamento_total)}, com média de {_brl(resumo.get('media', 0) or 0)} por cliente."
        )

    segmentos = resultado.get("porSegmento", [])
    if segmentos:
        lider = segmentos[0]
        participacao = _percentual(lider.get("clientes", 0), clientes)
        frases.append(
            f"O segmento {lider['categoria']} reúne {lider['clientes']} clientes "
            f"({participacao:.1f}% da carteira), sendo o grupo mais representativo."
        )

    niveis = {item.get("categoria"): item.get("clientes", 0) for item in resultado.get("porNivel", [])}
    if clientes and niveis.get("A", 0):
        percentual_a = _percentual(niveis["A"], clientes)
        frases.append(
            f"{niveis['A']} clientes estão no nível A ({percentual_a:.1f}% da base), "
            "o grupo que merece maior prioridade de atendimento."
        )

    top_clientes = resultado.get("topClientes", [])
    if faturamento_total and top_clientes:
        total_top = sum(float(item.get("faturamento", 0) or 0) for item in top_clientes[:5])
        concentracao = _percentual(total_top, faturamento_total)
        frases.append(
            f"Os cinco maiores faturamentos somam {_brl(total_top)}, "
            f"equivalentes a {concentracao:.1f}% do total da carteira."
        )

    consultores = resultado.get("porConsultor", [])
    if faturamento_total and consultores:
        destaque = max(consultores, key=lambda item: float(item.get("faturamento", 0) or 0))
        share = _percentual(float(destaque.get("faturamento", 0) or 0), faturamento_total)
        frases.append(
            f"{destaque['categoria']} concentra o maior faturamento entre os consultores, "
            f"com {_brl(float(destaque.get('faturamento', 0) or 0))} ({share:.1f}% do total)."
        )

    servicos = resultado.get("porServico", [])
    total_servicos = resumo.get("servicosContratados", 0) or 0
    if servicos and total_servicos:
        lider_servico = servicos[0]
        share = _percentual(lider_servico.get("clientes", 0), total_servicos)
        frases.append(
            f"{lider_servico['categoria']} é o serviço mais contratado, com "
            f"{lider_servico['clientes']} ocorrências ({share:.1f}% dos serviços registrados)."
        )

    meses = resultado.get("porMes", [])
    if len(meses) >= 2:
        primeiro, ultimo = meses[0], meses[-1]
        inicial = primeiro.get("clientes", 0)
        final = ultimo.get("clientes", 0)
        if inicial:
            variacao = (final - inicial) / inicial * 100
            direcao = "cresceram" if variacao > 0 else "diminuíram" if variacao < 0 else "se mantiveram"
            frases.append(
                f"As contratações {direcao} {abs(variacao):.1f}% entre "
                f"{primeiro.get('mes')} ({inicial}) e {ultimo.get('mes')} ({final})."
            )

    invalidas = resumo.get("invalidas", 0) or 0
    recebidas = resumo.get("recebidas", 0) or 0
    if invalidas:
        share = _percentual(invalidas, recebidas)
        frases.append(
            f"{invalidas} de {recebidas} registros ({share:.1f}%) foram rejeitados; "
            "vale revisar as inconsistências antes de usar esses dados em decisões."
        )

    correlacao = resultado.get("correlacaoServicosFaturamento", {}).get("coeficiente")
    if correlacao is not None:
        intensidade = "forte" if abs(correlacao) >= 0.7 else "moderada" if abs(correlacao) >= 0.4 else "fraca"
        direcao = "positiva" if correlacao > 0 else "negativa" if correlacao < 0 else "nula"
        frases.append(
            f"A relação entre quantidade de serviços e faturamento é {intensidade} e {direcao} "
            f"(r={correlacao:.2f}); correlação indica associação, não causa."
        )

    correcoes = resultado.get("correcoes", {})
    total_correcoes = sum(correcoes.values()) if isinstance(correcoes, dict) else 0
    if total_correcoes:
        detalhes = ", ".join(f"{quantidade} em {campo}" for campo, quantidade in correcoes.items() if quantidade)
        frases.append(f"A padronização ajustou {total_correcoes} valores: {detalhes}.")

    return frases
