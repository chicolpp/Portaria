import sqlite3
import os

# Caminho para o banco de dados SQLite (assumindo que está na pasta instance ou root do api)
# O app.py define: "sqlite:///project.db" ou similar se não tiver DATABASE_URL.
# Vamos verificar onde o app.py cria o banco. Geralmente é em instance/app.db ou project.db.
# Pelo código do app.py: app.config["SQLALCHEMY_DATABASE_URI"] = ... "postgresql..."
# Mas o usuário está rodando localmente.
# Se for Postgres, esse script não vai funcionar.
# Vamos assumir que é SQLite para desenvolvimento local se não houver variável de ambiente.
# Se o usuário estiver usando Postgres local, precisarei de outra abordagem.

# Verificando app.py novamente (via memória): 
# app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/app")
# O padrão é Postgres! 
# O usuário disse "c:\react\vite-teste", ambiente Windows. Pode ser que ele tenha Postgres instalado ou não.
# Se ele não tiver, o app.py daria erro ao iniciar se não tivesse conexão.
# O terminal mostra "python app.py ... running for 39m57s". Então está rodando.
# Se está rodando, tem banco.

# Como não tenho certeza absoluta se é SQLite ou Postgres, o ideal é usar o próprio SQLAlchemy para tentar rodar o ALTER TABLE.
# Ou criar um endpoint temporário no app.py que roda a migração e depois eu deleto.

from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Iniciando migração...")
        try:
            # Tentar adicionar colunas. Se falhar, provavelmente já existem.
            # Postgres e SQLite tem sintaxe ligeiramente diferente para ALTER TABLE, mas ADD COLUMN é padrão ANSI (exceto SQLite antigo).
            # SQLite moderno suporta ADD COLUMN.
            
            # Unidade
            try:
                db.session.execute(text("ALTER TABLE chaves ADD COLUMN unidade VARCHAR(20)"))
                print("Coluna 'unidade' adicionada.")
            except Exception as e:
                print(f"Erro/Aviso ao adicionar 'unidade': {e}")
                db.session.rollback()

            # Assinatura
            try:
                db.session.execute(text("ALTER TABLE chaves ADD COLUMN assinatura VARCHAR(500)"))
                print("Coluna 'assinatura' adicionada.")
            except Exception as e:
                print(f"Erro/Aviso ao adicionar 'assinatura': {e}")
                db.session.rollback()

            # Data Devolução
            try:
                db.session.execute(text("ALTER TABLE chaves ADD COLUMN data_devolucao TIMESTAMP"))
                print("Coluna 'data_devolucao' adicionada.")
            except Exception as e:
                print(f"Erro/Aviso ao adicionar 'data_devolucao': {e}")
                db.session.rollback()
            
            db.session.commit()
            print("Migração concluída.")
        except Exception as e:
            print(f"Erro geral: {e}")

if __name__ == "__main__":
    migrate()
