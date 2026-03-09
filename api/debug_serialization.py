import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'api'))

from app import app
from models import Encomenda, db

def debug_encomendas():
    with app.app_context():
        try:
            print("--- Fetching Encomendas ---")
            encomendas = Encomenda.query.all()
            print(f"Total records found: {len(encomendas)}")
            
            for e in encomendas:
                try:
                    d = e.to_dict()
                    print(f"ID {e.id}: SUCCESS")
                except Exception as ex:
                    print(f"ID {e.id}: FAILED to serialize - {str(ex)}")
                    # Print raw attributes to find the culprit
                    print(f"  data_recebimento: {e.data_recebimento} (type: {type(e.data_recebimento)})")
                    print(f"  hora_recebimento: {e.hora_recebimento} (type: {type(e.hora_recebimento)})")
            
            print("--- End of Debug ---")
        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    debug_encomendas()
