
import sys
import os

# Adiciona o diretório api ao path
sys.path.append(os.path.join(os.getcwd(), 'api'))

from app import app, db
from models import Acesso

def diag():
    with app.app_context():
        print("Checking database connection...")
        try:
            count = Acesso.query.count()
            print(f"Connection successful. Number of 'acessos': {count}")
            
            # Check if there are any specific errors during creation
            print("Attempting to simulate a creation (without commit)...")
            test_acesso = Acesso(
                nome="Test",
                sobrenome="Diag",
                documento="000.000.000-00",
                placa="XYZ-1234",
                marca="Test",
                modelo="Diag",
                cor="None"
            )
            db.session.add(test_acesso)
            # We don't commit to avoid cluttering DB
            print("Successfully added to session.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    diag()
