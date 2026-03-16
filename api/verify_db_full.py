from app import app
from database import db
from sqlalchemy import text
import os

def diagnose():
    with app.app_context():
        print(f"DATABASE_URL Env: {os.environ.get('DATABASE_URL')}")
        print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        try:
            # 1. List all tables
            result = db.session.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';"))
            tables = [row[0] for row in result]
            print(f"Tabelas encontradas: {tables}")
            
            if 'users' in tables:
                # 2. Describe users table
                result = db.session.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"))
                cols = {row[0]: row[1] for row in result}
                print(f"Colunas na tabela 'users': {cols}")
                
                required = ['unidade', 'documento', 'sobrenome']
                for r in required:
                    if r in cols:
                        print(f"✅ {r} está presente.")
                    else:
                        print(f"❌ {r} ESTÁ FALTANDO!")
            else:
                print("❌ Tabela 'users' não existe!")
                
        except Exception as e:
            print(f"❌ Erro na diagnóstico: {e}")

if __name__ == "__main__":
    diagnose()
