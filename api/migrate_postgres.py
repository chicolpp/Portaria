from app import app
from database import db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Adicionar coluna 'assinatura' em 'itens_portaria' se não existir
            print("Verificando coluna 'assinatura' em 'itens_portaria'...")
            # No PostgreSQL, usamos query para checar existência
            check_col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='itens_portaria' AND column_name='assinatura';
            """)
            result = db.session.execute(check_col_query).fetchone()
            
            if not result:
                print("Adicionando coluna 'assinatura' em 'itens_portaria'...")
                db.session.execute(text("ALTER TABLE itens_portaria ADD COLUMN assinatura VARCHAR(500);"))
            else:
                print("Coluna 'assinatura' já existe.")

            # Criar tabela 'movimentacoes_itens' 
            # db.create_all() já criaria se definimos o modelo novo, 
            # mas vamos garantir chamando db.create_all() aqui também
            print("Executando db.create_all() para novas tabelas...")
            db.create_all()
            
            db.session.commit()
            print("Migração concluída com sucesso!")
        except Exception as e:
            print(f"Erro na migração: {e}")
            db.session.rollback()

if __name__ == "__main__":
    migrate()
