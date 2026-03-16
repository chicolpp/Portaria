from sqlalchemy import create_engine, text
import os
import sys

# Get DB URL from app config if possible
sys.path.append(os.getcwd())
try:
    from app import app
    db_url = app.config["SQLALCHEMY_DATABASE_URI"]
except:
    db_url = "postgresql+psycopg2://postgres:postgres@localhost:5432/app"

print(f"🔧 Usando DB_URL: {db_url}")
engine = create_engine(db_url)

commands = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS sobrenome VARCHAR(100);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS unidade VARCHAR(100);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS documento VARCHAR(20);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS foto TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP;",
    # Em caso de erro em 'acessos'
    "ALTER TABLE acessos ADD COLUMN IF NOT EXISTS sobrenome VARCHAR(100);"
]

with engine.connect() as conn:
    # Set autocommit mode for some versions if needed
    conn.execute(text("COMMIT")) # End any current transaction
    for cmd in commands:
        try:
            print(f"🚀 Executando: {cmd}")
            conn.execute(text(cmd))
            conn.execute(text("COMMIT"))
            print("✅ Sucesso!")
        except Exception as e:
            print(f"⚠️ Erro (provavelmente já existe): {e}")
            try:
                conn.execute(text("ROLLBACK"))
            except:
                pass

print("🏁 Finalizado!")
