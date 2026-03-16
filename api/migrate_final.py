import os
from sqlalchemy import text, create_engine
from app import app
from database import db

def run_migration():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("⚠️ DATABASE_URL não encontrada.")
        return

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print(f"🔗 Conectando ao banco de dados...")
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        print("🔧 Iniciando Migração Final (V2)...")
        
        # 1. Garantir que as tabelas básicas existam
        try:
            with app.app_context():
                print("  - Executando db.create_all()...")
                db.create_all()
        except Exception as e:
            print(f"  ❌ Erro no db.create_all(): {e}")

        # 2. Adicionar colunas faltantes em 'users'
        print("  - Verificando colunas em 'users'...")
        columns_to_add_users = [
            ("sobrenome", "TEXT"),
            ("unidade", "TEXT"),
            ("documento", "TEXT")
        ]
        
        for col_name, col_type in columns_to_add_users:
            try:
                # Usando IF NOT EXISTS direto no SQL para o Postgres
                print(f"    + Tentando adicionar '{col_name}'...")
                # Postgres doesn't support ADD COLUMN IF NOT EXISTS in all versions, 
                # but we can check manualy or just catch the error
                sql = text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                conn.execute(sql)
                conn.commit()
                print(f"    ✅ '{col_name}' processada.")
            except Exception as e:
                print(f"    ⚠️ Erro ao processar {col_name}: {e}")

        # 3. Adicionar colunas faltantes em 'acessos'
        print("  - Verificando colunas em 'acessos'...")
        try:
            conn.execute(text("ALTER TABLE acessos ADD COLUMN IF NOT EXISTS sobrenome TEXT;"))
            conn.commit()
            print("    ✅ 'sobrenome' processada em 'acessos'.")
        except Exception as e:
            print(f"    ⚠️ Erro em 'acessos': {e}")

        # 4. Converter colunas existentes para TEXT (caso sejam VARCHAR curtos)
        print("  - Garantindo tipo TEXT para campos longos...")
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
                sql = text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TEXT USING {column}::TEXT;")
                conn.execute(sql)
                conn.commit()
                print(f"    ✅ {table}.{column} convertido.")
            except Exception as e:
                # Provavelmente a coluna ou tabela não existe, ignoramos
                pass

        print("✅ Migração finalizada!")

if __name__ == "__main__":
    run_migration()
