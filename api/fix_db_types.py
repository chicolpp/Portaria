import os
import sys
from sqlalchemy import text, create_engine

def fix_columns():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("⚠️ DATABASE_URL não encontrada. Pulando migração.")
        return

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        print(f"🔧 Conectando ao banco para migração...")
        engine = create_engine(db_url)
        
        targets = [
            ("users", "foto"),
            ("encomendas", "foto"),
            ("encomendas", "assinatura"),
            ("chaves", "assinatura"),
            ("movimentacoes_chaves", "assinatura"),
            ("itens_portaria", "assinatura"),
            ("movimentacoes_itens", "assinatura")
        ]
        
        with engine.connect() as conn:
            for table, column in targets:
                print(f"  - Alterando {table}.{column} para TEXT...")
                try:
                    # Verifica se a tabela existe antes
                    check_table = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')"))
                    if not check_table.scalar():
                        print(f"    ⏩ Tabela {table} não existe ainda. Pulando.")
                        continue
                        
                    conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TEXT"))
                    conn.commit()
                    print(f"    ✅ Sucesso.")
                except Exception as inner_e:
                    print(f"    ⚠️ Erro em {table}.{column}: {inner_e}")
            
        print("✅ Processo de migração concluído.")
    except Exception as e:
        print(f"❌ Erro fatal na migração: {e}")

if __name__ == "__main__":
    fix_columns()
