"""Gera frases curtas em português a partir dos indicadores calculados."""


def gerar(resultado: dict) -> list[str]:
    resumo = resultado["resumo"]
    frases = []
    if resumo["clientes"]:
        media = f"{resumo['media']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        frases.append(f"A base reúne {resumo['clientes']} clientes válidos, com faturamento médio de R$ {media}.")
    if resultado["porSegmento"]:
        lider = resultado["porSegmento"][0]
        frases.append(f"{lider['categoria']} é o segmento com mais clientes ({lider['clientes']}).")
    if resultado["porServico"]:
        lider = resultado["porServico"][0]
        frases.append(f"{lider['categoria']} é o serviço mais contratado ({lider['clientes']} ocorrências).")
    if resumo["invalidas"]:
        frases.append(f"{resumo['invalidas']} registro(s) foram rejeitados durante a transformação.")
    return frases
