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
        print(f"🔧 Iniciando migração forçada de colunas para TEXT...")
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
            # Desativar autocommit para controle manual se necessário, 
            # mas aqui vamos usar transações explícitas
            with conn.begin():
                for table, column in targets:
                    print(f"  - Verificando {table}.{column}...")
                    try:
                        # Verifica se a tabela existe
                        check_table = conn.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')"))
                        if not check_table.scalar():
                            print(f"    ⏩ Tabela {table} não existe. Pulando.")
                            continue
                            
                        # Comando SQL agressivo para converter tipo
                        sql = f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TEXT USING {column}::TEXT"
                        conn.execute(text(sql))
                        print(f"    ✅ {table}.{column} convertido para TEXT.")
                    except Exception as inner_e:
                        print(f"    ⚠️ Erro em {table}.{column}: {inner_e}")
            
        print("✅ Migração concluída com commit realizado.")
    except Exception as e:
        print(f"❌ Erro fatal na migração: {e}")

if __name__ == "__main__":
    fix_columns()
