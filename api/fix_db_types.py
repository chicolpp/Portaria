from database import db
from app import app
from sqlalchemy import text
import sys
import os

# Adiciona o diretório atual ao path para encontrar os módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def fix_columns():
    with app.app_context():
        try:
            print("🔧 Iniciando alteração de colunas para TEXT (Suporte a Base64)...")
            
            # Lista de (tabela, coluna)
            targets = [
                ("users", "foto"),
                ("encomendas", "foto"),
                ("encomendas", "assinatura"),
                ("chaves", "assinatura"),
                ("movimentacoes_chaves", "assinatura"),
                ("itens_portaria", "assinatura"),
                ("movimentacoes_itens", "assinatura")
            ]
            
            for table, column in targets:
                print(f"  - Alterando {table}.{column}...")
                try:
                    db.session.execute(text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TEXT"))
                except Exception as inner_e:
                    print(f"    ⚠️ Erro ao alterar {table}.{column} (pode já ser TEXT): {inner_e}")
                    db.session.rollback()
                    continue
            
            db.session.commit()
            print("✅ Todas as colunas foram migradas para TEXT com sucesso!")
        except Exception as e:
            print(f"❌ Erro fatal durante a migração: {e}")
            db.session.rollback()

if __name__ == "__main__":
    fix_columns()
