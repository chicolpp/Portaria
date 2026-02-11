import psycopg2
import os

def migrate():
    # Pega a URL do env ou usa o padrão do app.py
    database_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/app"
    )
    
    # SQLAlchemy usa +psycopg2, mas psycopg2.connect não quer isso
    if "+psycopg2" in database_url:
        database_url = database_url.replace("+psycopg2", "")

    try:
        print(f"Conectando ao banco...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # 1. Adicionar coluna 'assinatura' em 'itens_portaria'
        print("Verificando coluna 'assinatura' em 'itens_portaria'...")
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='itens_portaria' AND column_name='assinatura';")
        if not cursor.fetchone():
            print("Adicionando coluna 'assinatura'...")
            cursor.execute("ALTER TABLE itens_portaria ADD COLUMN assinatura VARCHAR(500);")
        else:
            print("Coluna 'assinatura' já existe.")

        # 2. Criar tabela 'movimentacoes_itens'
        print("Criando tabela 'movimentacoes_itens'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS movimentacoes_itens (
            id SERIAL PRIMARY KEY,
            item_id INTEGER NOT NULL REFERENCES itens_portaria(id),
            retirado_por VARCHAR(200) NOT NULL,
            apartamento VARCHAR(20) NOT NULL,
            bloco VARCHAR(20) NOT NULL,
            data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_devolucao TIMESTAMP
        );
        """)

        # 3. Adicionar coluna 'assinatura' em 'movimentacoes_itens' se não existir
        print("Verificando coluna 'assinatura' em 'movimentacoes_itens'...")
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='movimentacoes_itens' AND column_name='assinatura';")
        if not cursor.fetchone():
            print("Adicionando coluna 'assinatura' em 'movimentacoes_itens'...")
            cursor.execute("ALTER TABLE movimentacoes_itens ADD COLUMN assinatura VARCHAR(500);")
        else:
            print("Coluna 'assinatura' já existe em 'movimentacoes_itens'.")
        
        # 4. Adicionar colunas 'item_id' e 'item_nome' em 'movimentacoes_chaves'
        print("Verificando colunas em 'movimentacoes_chaves'...")
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='movimentacoes_chaves' AND column_name='item_id';")
        if not cursor.fetchone():
            print("Adicionando coluna 'item_id' em 'movimentacoes_chaves'...")
            cursor.execute("ALTER TABLE movimentacoes_chaves ADD COLUMN item_id INTEGER REFERENCES itens_portaria(id);")
        
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='movimentacoes_chaves' AND column_name='item_nome';")
        if not cursor.fetchone():
            print("Adicionando coluna 'item_nome' em 'movimentacoes_chaves'...")
            cursor.execute("ALTER TABLE movimentacoes_chaves ADD COLUMN item_nome VARCHAR(200);")

        conn.commit()
        print("Migração concluída com sucesso!")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Erro na migração: {e}")

if __name__ == "__main__":
    migrate()
