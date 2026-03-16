import os
import sys
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

    print(f"🔗 Conectando ao banco para migração...")
    engine = create_engine(db_url)
    
    # Usando engine.begin() para garantir commit automático ao final do bloco
    with engine.begin() as conn:
        print("🔧 Iniciando Migração Crítica...")
        
        # 1. Tabelas Básicas
        print("  - Sincronizando modelos com db.create_all()...")
        with app.app_context():
            db.create_all()
        
        # 2. Colunas em 'users' (O problema principal)
        print("  - Verificando colunas cruciais em 'users'...")
        columns_to_add = [
            ("sobrenome", "VARCHAR(100)"),
            ("unidade", "VARCHAR(100)"),
            ("documento", "VARCHAR(20)")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                # Verificação específica para PostgreSQL
                check_sql = text(f"""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{col_name}';
                """)
                exists = conn.execute(check_sql).fetchone()
                
                if not exists:
                    print(f"    + Adicionando '{col_name}'...")
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                else:
                    print(f"    ok: '{col_name}' presente.")
            except Exception as e:
                print(f"    ⚠️ Erro ao processar coluna {col_name}: {e}")

        # 3. Coluna em 'acessos'
        try:
            exists = conn.execute(text("SELECT 1 FROM information_schema.columns WHERE table_name='acessos' AND column_name='sobrenome';")).fetchone()
            if not exists:
                print("    + Adicionando 'sobrenome' em 'acessos'...")
                conn.execute(text("ALTER TABLE acessos ADD COLUMN sobrenome VARCHAR(100);"))
        except Exception as e:
            print(f"    ⚠️ Erro em 'acessos': {e}")

        # 4. Tipos TEXT para Base64
        print("  - Garantindo suporte a Base64 (TEXT)...")
        tables_cols = [
            ("users", "foto"),
            ("encomendas", "foto"),
            ("encomendas", "assinatura")
        ]
        for t, c in tables_cols:
            try:
                conn.execute(text(f"ALTER TABLE {t} ALTER COLUMN {c} TYPE TEXT USING {c}::TEXT;"))
            except Exception:
                pass # Ignora se falhar (pode ser que já seja TEXT ou a coluna não exista ainda)

    print("✅ Migração finalizada com sucesso!")

if __name__ == "__main__":
    run_migration()
