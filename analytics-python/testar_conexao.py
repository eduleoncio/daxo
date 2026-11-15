"""Verifica as credenciais e o acesso ao banco configurado."""

from sqlalchemy import text

import banco


if __name__ == "__main__":
    engine = banco.criar_engine()
    with engine.connect() as conexao:
        conexao.execute(text("SELECT 1"))
    print("Conectou! Banco e estrutura prontos.")
