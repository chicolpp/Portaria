import sys
import os

# Adiciona o diretório atual ao sys.path para garantir que o python encontre
sys.path.append(os.getcwd())

from app import app, db, Chave
from sqlalchemy import inspect

with app.app_context():
    print("Iniciando verificação do banco...")
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('chaves')]
    print(f"Colunas na tabela 'chaves': {columns}")
    
    chaves = Chave.query.all()
    print(f"Total de chaves no banco: {len(chaves)}")
    for chave in chaves:
        status_str = "Na Portaria" if chave.na_portaria else "Retirada"
        print(f" - ID {chave.id}: {chave.area_nome} | Status: {status_str} | Retirado por: {chave.retirado_por} | Unidade: {chave.unidade}")
