import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'db.sqlite')
    if not os.path.exists(db_path):
        print(f"Banco não encontrado em {db_path}. Verifique o caminho.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Adicionar coluna 'assinatura' em 'itens_portaria' se não existir
        print("Verificando coluna 'assinatura' em 'itens_portaria'...")
        cursor.execute("PRAGMA table_info(itens_portaria)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'assinatura' not in columns:
            print("Adicionando coluna 'assinatura' em 'itens_portaria'...")
            cursor.execute("ALTER TABLE itens_portaria ADD COLUMN assinatura VARCHAR(500)")
        else:
            print("Coluna 'assinatura' já existe.")

        # Criar tabela 'movimentacoes_itens' se não existir
        print("Criando tabela 'movimentacoes_itens'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS movimentacoes_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            retirado_por VARCHAR(200) NOT NULL,
            apartamento VARCHAR(20) NOT NULL,
            bloco VARCHAR(20) NOT NULL,
            assinatura VARCHAR(500),
            data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_devolucao DATETIME,
            FOREIGN KEY (item_id) REFERENCES itens_portaria (id)
        )
        """)
        
        conn.commit()
        print("Migração concluída com sucesso!")
    except Exception as e:
        print(f"Erro na migração: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
