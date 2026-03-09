
import sys
import os

# Adiciona o diretório api ao path
sys.path.append(os.path.join(os.getcwd(), 'api'))

from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Starting migration...")
        try:
            # Check if column exists first
            result = db.session.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'acessos' AND column_name = 'sobrenome'"))
            if result.fetchone():
                print("Column 'sobrenome' already exists.")
                return

            print("Adding column 'sobrenome' to table 'acessos'...")
            db.session.execute(text("ALTER TABLE acessos ADD COLUMN sobrenome VARCHAR(100)"))
            db.session.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Error during migration: {e}")
            db.session.rollback()

if __name__ == "__main__":
    migrate()
