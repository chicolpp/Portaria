from flask import Flask, request, send_from_directory
from flask_cors import CORS
from database import db
from models import User, Encomenda, Acesso
import jwt
import datetime
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/app"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "CHAVE_SUPER_SECRETA_TROQUE_DEPOIS")


db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Criar admin padrão se não existir
    admin_email = "admin@portaria.com"
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(
            nome="Administrador",
            sobrenome="Sistema",
            email=admin_email,
            cargo="administrador",
            is_admin=True,
            ativo=True
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin padrão criado: admin@portaria.com / admin123")
    else:
        # Se admin existe mas senha não funciona, resetar
        if not admin.check_password("admin123"):
            admin.set_password("admin123")
            admin.ativo = True
            db.session.commit()
            print("🔄 Senha do admin resetada para: admin123")


@app.route("/register", methods=["POST"])
def register():
    nome = request.form.get("nome", "")
    sobrenome = request.form.get("sobrenome", "")
    email = request.form.get("email")
    password = request.form.get("password")
    cargo = request.form.get("cargo", "porteiro")
    is_admin = request.form.get("is_admin", "false").lower() == "true"

    # 🔒 BLOQUEIO DO ERRO (ESSENCIAL)
    if not email or not password:
        return {"error": "Email e senha são obrigatórios"}, 400

    if User.query.filter_by(email=email).first():
        return {"error": "Email já cadastrado"}, 400

    foto_path = ""
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(
                f"user_{datetime.datetime.now().timestamp()}_{file.filename}"
            )
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            foto_path = filename

    user = User(
        nome=nome,
        sobrenome=sobrenome,
        email=email,
        cargo=cargo,
        foto=foto_path,
        is_admin=is_admin,
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {"message": "Usuário criado", "user": user.to_dict()}, 201



@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    usuarios = User.query.order_by(User.data_criacao.desc()).all()
    return {"usuarios": [u.to_dict() for u in usuarios]}


@app.route("/usuarios/<int:id>", methods=["PUT"])
def editar_usuario(id):
    user = User.query.get_or_404(id)
    data = request.json

    user.nome = data.get("nome", user.nome)
    user.sobrenome = data.get("sobrenome", user.sobrenome)
    user.email = data.get("email", user.email)
    user.cargo = data.get("cargo", user.cargo)
    user.is_admin = data.get("is_admin", user.is_admin)
    user.ativo = data.get("ativo", user.ativo)

    if data.get("password"):
        user.set_password(data["password"])

    db.session.commit()

    return {"message": "Usuário atualizado", "user": user.to_dict()}, 200


@app.route("/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return {"message": "Usuário deletado"}, 200


@app.route("/usuarios/<int:id>/toggle-status", methods=["POST"])
def toggle_status_usuario(id):
    user = User.query.get_or_404(id)
    user.ativo = not user.ativo
    db.session.commit()
    return {"message": "Status alterado", "user": user.to_dict()}, 200


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    print(f"🔐 Tentativa de login: {data.get('email')}")

    user = User.query.filter_by(email=data["email"]).first()
    print(f"👤 Usuário encontrado: {user is not None}")

    if not user or not user.check_password(data["password"]):
        if user:
            print(f"❌ Senha incorreta para {user.email}")
        else:
            print(f"❌ Usuário não encontrado: {data.get('email')}")
        return {"error": "Credenciais inválidas"}, 401

    if not user.ativo:
        return {"error": "Usuário desativado. Contate o administrador."}, 403

    user.ultimo_acesso = datetime.datetime.now()
    db.session.commit()

    token = jwt.encode(
        {
            "user_id": user.id,
            "is_admin": user.is_admin,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": {
            "id": user.id,
            "nome": user.nome,
            "sobrenome": user.sobrenome,
            "email": user.email,
            "cargo": user.cargo,
            "foto": user.foto or "",
            "is_admin": user.is_admin
        }
    }


@app.route("/encomendas", methods=["POST"])
def criar_encomenda():
    nome = request.form.get("nome")
    unidade = request.form.get("unidade")
    documento = request.form.get("documento")
    pagina = request.form.get("pagina", "")
    data_recebimento = request.form.get("dataRecebimento")
    hora_recebimento = request.form.get("horaRecebimento")

    foto_path = ""
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.datetime.now().timestamp()}_{file.filename}")
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            foto_path = filename

    encomenda = Encomenda(
        nome=nome,
        unidade=unidade,
        documento=documento,
        pagina=pagina,
        data_recebimento=datetime.datetime.strptime(data_recebimento, "%Y-%m-%d").date(),
        hora_recebimento=datetime.datetime.strptime(hora_recebimento, "%H:%M").time(),
        foto=foto_path,
    )

    db.session.add(encomenda)
    db.session.commit()

    return {"message": "Encomenda cadastrada", "encomenda": encomenda.to_dict()}, 201


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/encomendas", methods=["GET"])
def listar_encomendas():
    encomendas = Encomenda.query.order_by(Encomenda.id.desc()).all()
    return {"encomendas": [e.to_dict() for e in encomendas]}


@app.route("/encomendas/<int:id>", methods=["PUT"])
def editar_encomenda(id):
    encomenda = Encomenda.query.get_or_404(id)
    
    encomenda.nome = request.form.get("nome", encomenda.nome)
    encomenda.unidade = request.form.get("unidade", encomenda.unidade)
    encomenda.documento = request.form.get("documento", encomenda.documento)
    encomenda.pagina = request.form.get("pagina", encomenda.pagina)
    
    data_recebimento = request.form.get("dataRecebimento")
    if data_recebimento:
        encomenda.data_recebimento = datetime.datetime.strptime(data_recebimento, "%Y-%m-%d").date()
    
    hora_recebimento = request.form.get("horaRecebimento")
    if hora_recebimento:
        encomenda.hora_recebimento = datetime.datetime.strptime(hora_recebimento, "%H:%M").time()
    
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.datetime.now().timestamp()}_{file.filename}")
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            encomenda.foto = filename
    
    db.session.commit()
    
    return {"message": "Encomenda atualizada", "encomenda": encomenda.to_dict()}, 200


@app.route("/encomendas/<int:id>/retirar", methods=["POST"])
def retirar_encomenda(id):
    encomenda = Encomenda.query.get_or_404(id)
    
    nome_retirada = request.form.get("nome_retirada")
    
    assinatura_path = ""
    if 'assinatura' in request.files:
        file = request.files['assinatura']
        if file and file.filename:
            filename = secure_filename(f"assinatura_{id}_{datetime.datetime.now().timestamp()}.png")
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            assinatura_path = filename
    
    encomenda.retirado = True
    encomenda.nome_retirada = nome_retirada
    encomenda.assinatura = assinatura_path
    encomenda.data_retirada = datetime.datetime.now().date()
    encomenda.hora_retirada = datetime.datetime.now().time()
    
    db.session.commit()
    
    return {"message": "Encomenda retirada com sucesso", "encomenda": encomenda.to_dict()}, 200


@app.route("/acessos", methods=["POST"])
def criar_acesso():
    data = request.json

    acesso = Acesso(
        nome=data["nome"],
        sobrenome=data["sobrenome"],
        documento=data["documento"],
        placa=data.get("placa", ""),
        marca=data.get("marca", ""),
        modelo=data.get("modelo", ""),
        cor=data.get("cor", ""),
    )

    db.session.add(acesso)
    db.session.commit()

    return {"message": "Acesso cadastrado", "acesso": acesso.to_dict()}, 201


@app.route("/acessos", methods=["GET"])
def listar_acessos():
    acessos = Acesso.query.order_by(Acesso.data_entrada.desc()).all()
    return {"acessos": [a.to_dict() for a in acessos]}


@app.route("/acessos/<int:id>/saida", methods=["POST"])
def registrar_saida(id):
    acesso = Acesso.query.get_or_404(id)
    
    if acesso.data_saida:
        return {"error": "Saída já registrada"}, 400
    
    acesso.data_saida = datetime.datetime.now()
    db.session.commit()
    
    return {"message": "Saída registrada com sucesso", "acesso": acesso.to_dict()}, 200


# Servir frontend React
@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=''):
    if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    return send_from_directory(STATIC_FOLDER, 'index.html')


if __name__ == "__main__":
    app.run(debug=True, port=5000)
