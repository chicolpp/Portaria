import os
from sqlalchemy import text, create_engine
from app import app
from database import db

def run_migration():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("⚠️ DATABASE_URL não encontrada. Usando configuração padrão.")
        # Fallback para o que estiver no app.py se estiver rodando localmente sem env
        return

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        print("🔧 Iniciando Migração Final...")
        
        # 1. Garantir que as tabelas básicas existam
        with app.app_context():
            print("  - Executando db.create_all()...")
            db.create_all()
        
        # 2. Adicionar colunas faltantes em 'users'
        print("  - Verificando colunas em 'users'...")
        columns_to_add_users = [
            ("sobrenome", "VARCHAR(100)"),
            ("unidade", "VARCHAR(100)"),
            ("documento", "VARCHAR(20)")
        ]
        
        for col_name, col_type in columns_to_add_users:
            try:
                check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}';")
                result = conn.execute(check_query).fetchone()
                if not result:
                    print(f"    + Adicionando coluna '{col_name}'...")
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                else:
                    print(f"    ok: '{col_name}' já existe.")
            except Exception as e:
                print(f"    ⚠️ Erro ao adicionar {col_name}: {e}")

        # 3. Adicionar colunas faltantes em 'acessos'
        print("  - Verificando colunas em 'acessos'...")
        try:
            check_query = text("SELECT column_name FROM information_schema.columns WHERE table_name='acessos' AND column_name='sobrenome';")
            result = conn.execute(check_query).fetchone()
            if not result:
                print("    + Adicionando coluna 'sobrenome' em 'acessos'...")
                conn.execute(text("ALTER TABLE acessos ADD COLUMN sobrenome VARCHAR(100);"))
                conn.commit()
            else:
                print("    ok: 'sobrenome' já existe em 'acessos'.")
        except Exception as e:
            print(f"    ⚠️ Erro em 'acessos': {e}")

        # 4. Converter colunas para TEXT para suportar Base64 longo
        print("  - Convertendo colunas para TEXT (Base64)...")
        text_targets = [
            ("users", "foto"),
            ("encomendas", "foto"),
            ("encomendas", "assinatura"),
            ("chaves", "assinatura"),
            ("movimentacoes_chaves", "assinatura"),
            ("itens_portaria", "assinatura"),
            ("movimentacoes_itens", "assinatura")
        ]
        
        for table, column in text_targets:
            try:
                # Verifica se a coluna existe antes de converter
                check_col = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{column}';")).fetchone()
                if check_col:
                    print(f"    ~ Convertendo {table}.{column} para TEXT...")
                    # No PostgreSQL, ALTER COLUMN TYPE com USING
                    conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TEXT USING {column}::TEXT;"))
                    conn.commit()
            except Exception as e:
                print(f"    ⚠️ Erro ao converter {table}.{column}: {e}")

        print("✅ Migração concluída!")

if __name__ == "__main__":
    run_migration()
