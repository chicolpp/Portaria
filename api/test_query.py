from app import app
from models import User
from database import db
from sqlalchemy import text

def test_query():
    with app.app_context():
        try:
            print("Tentando buscar usuário pelo email (lippe@gmail.com)...")
            user = User.query.filter_by(email='lippe@gmail.com').first()
            if user:
                print(f"✅ Usuário encontrado: {user.nome}, Unidade: {user.unidade}")
            else:
                print("✅ Usuário não encontrado, mas a query funcionou!")
        except Exception as e:
            print(f"❌ Erro na query: {e}")
            
        try:
            print("\nTentando query SQL crua...")
            result = db.session.execute(text("SELECT unidade FROM users LIMIT 1")).fetchone()
            print(f"✅ SQL cru: {result}")
        except Exception as e:
            print(f"❌ Erro no SQL cru: {e}")

if __name__ == "__main__":
    test_query()
