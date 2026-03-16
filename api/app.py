from flask import Flask, request, send_from_directory
from flask_cors import CORS
from database import db
from models import User, Encomenda, Acesso, Ocorrencia, Chave, ItemPortaria, ReservaEspaco, MovimentacaoChave, MovimentacaoItem, Veiculo
import jwt
import datetime
import os
import sys
from sqlalchemy import text, create_engine
from werkzeug.utils import secure_filename
import base64

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# UPLOAD_FOLDER não é mais necessário para persistência em Base64
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)
CORS(app)

@app.before_request
def intercept_html_requests():
    # Ignora a rota raiz, arquivos estáticos e de assets
    if request.path == '/' or request.path.startswith('/assets/') or '.' in request.path:
        return
        
    # Se o cliente (navegador) pedir explicitamente HTML (como num F5) em qualquer rota (ex: /encomendas)
    # Servimos o index.html do React em vez de renderizar o endpoint JSON da API com o mesmo nome
    accept = request.headers.get('Accept', '')
    if request.method == 'GET' and 'text/html' in accept:
        if os.path.exists(os.path.join(STATIC_FOLDER, 'index.html')):
            return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route("/health")
def health_check():
    return {"status": "ok", "message": "Portaria API is running"}, 200

@app.route("/maintenance/db-init")
def maintainence_db_init():
    try:
        from migrate_final import run_migration
        run_migration()
        return {"status": "ok", "message": "Banco de dados sincronizado e migrado"}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def file_to_base64(file):
    if not file:
        return ""
    try:
        file_content = file.read()
        if not file_content:
            return ""
        base64_string = base64.b64encode(file_content).decode('utf-8')
        mime_type = file.content_type or 'image/png'
        return f"data:{mime_type};base64,{base64_string}"
    except Exception as e:
        print(f"Erro ao converter arquivo para Base64: {e}")
        return ""

db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = db_url or "postgresql+psycopg2://postgres:postgres@localhost:5432/app"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev_secret_key_change_in_production")

# Estabilidade da conexão com o banco (evita SSL connection closed unexpectedly)
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}


db.init_app(app)

# A inicialização do banco (db.create_all() e seeds) foi removida do escopo global
# para evitar bloqueios de renderização (timeouts no Gunicorn) causados por Eventos 
# de Lock de Banco de Dados. As migrações devem idealmente ser feitas numa rota separada ou CLI.

@app.route("/register", methods=["POST"])
def register():
    nome = request.form.get("nome", "")
    sobrenome = request.form.get("sobrenome", "")
    email = request.form.get("email")
    password = request.form.get("password")
    cargo = request.form.get("cargo", "porteiro")
    is_admin = request.form.get("is_admin", "false").lower() == "true"
    unidade = request.form.get("unidade", "")
    documento = request.form.get("documento", "")

    # 🔒 BLOQUEIO DO ERRO (ESSENCIAL)
    if not email or not password:
        return {"error": "Email e senha são obrigatórios"}, 400

    if User.query.filter_by(email=email).first():
        return {"error": "Email já cadastrado"}, 400

    foto_base64 = ""
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename and allowed_file(file.filename):
            foto_base64 = file_to_base64(file)

    user = User(
        nome=nome,
        sobrenome=sobrenome,
        email=email,
        cargo=cargo,
        foto=foto_base64,
        is_admin=is_admin,
        unidade=unidade,
        documento=documento,
    )

    user.set_password(password)

    db.session.add(user)
    db.session.flush() # Para pegar o ID do usuário

    # Processamento de veículos se for morador
    if cargo == "morador":
        veiculos_raw = request.form.get("veiculos")
        if veiculos_raw:
            import json
            try:
                veiculos_list = json.loads(veiculos_raw)
                for v_data in veiculos_list:
                    novo_veiculo = Veiculo(
                        user_id=user.id,
                        placa=v_data.get("placa"),
                        marca=v_data.get("marca"),
                        modelo=v_data.get("modelo"),
                        cor=v_data.get("cor")
                    )
                    db.session.add(novo_veiculo)
            except Exception as e:
                print(f"Erro ao processar veículos: {e}")

    db.session.commit()

    return {"message": "Usuário criado", "user": user.to_dict()}, 201



@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    usuarios = User.query.order_by(User.data_criacao.desc()).all()
    return {"usuarios": [u.to_dict() for u in usuarios]}


@app.route("/usuarios/<int:id>", methods=["PUT"])
def editar_usuario(id):
    user = User.query.get_or_404(id)
    
    # Suporta JSON ou FormData
    if request.content_type and 'multipart/form-data' in request.content_type:
        user.nome = request.form.get("nome", user.nome)
        user.sobrenome = request.form.get("sobrenome", user.sobrenome)
        user.email = request.form.get("email", user.email)
        user.cargo = request.form.get("cargo", user.cargo)
        user.is_admin = request.form.get("is_admin", "false").lower() == "true"
        user.ativo = request.form.get("ativo", "true").lower() == "true"
        user.unidade = request.form.get("unidade", user.unidade)
        user.documento = request.form.get("documento", user.documento)
        
        if request.form.get("password"):
            user.set_password(request.form.get("password"))
        
        # Atualiza foto se enviada
        if 'foto' in request.files:
            file = request.files['foto']
            if file and file.filename and allowed_file(file.filename):
                user.foto = file_to_base64(file)
        
        # Atualiza veículos
        veiculos_raw = request.form.get("veiculos")
        if veiculos_raw:
            import json
            try:
                veiculos_list = json.loads(veiculos_raw)
                # Remove veículos antigos e adiciona os novos (sincronização simples)
                Veiculo.query.filter_by(user_id=user.id).delete()
                for v_data in veiculos_list:
                    novo_veiculo = Veiculo(
                        user_id=user.id,
                        placa=v_data.get("placa"),
                        marca=v_data.get("marca"),
                        modelo=v_data.get("modelo"),
                        cor=v_data.get("cor")
                    )
                    db.session.add(novo_veiculo)
            except Exception as e:
                print(f"Erro ao atualizar veículos: {e}")
    else:
        data = request.json or {}
        user.nome = data.get("nome", user.nome)
        user.sobrenome = data.get("sobrenome", user.sobrenome)
        user.email = data.get("email", user.email)
        user.cargo = data.get("cargo", user.cargo)
        user.is_admin = data.get("is_admin", user.is_admin)
        user.ativo = data.get("ativo", user.ativo)
        user.unidade = data.get("unidade", user.unidade)
        user.documento = data.get("documento", user.documento)

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
            "is_admin": user.is_admin,
            "unidade": user.unidade or "",
            "documento": user.documento or ""
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

    # Se não for enviado, usa a data e hora atuais do servidor
    if not data_recebimento:
        obj_data = datetime.datetime.now().date()
    else:
        obj_data = datetime.datetime.strptime(data_recebimento, "%Y-%m-%d").date()

    if not hora_recebimento:
        obj_hora = datetime.datetime.now().time()
    else:
        obj_hora = datetime.datetime.strptime(hora_recebimento, "%H:%M").time()

    foto_base64 = ""
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename and allowed_file(file.filename):
            foto_base64 = file_to_base64(file)

    encomenda = Encomenda(
        nome=nome,
        unidade=unidade,
        documento=documento,
        pagina=pagina,
        data_recebimento=obj_data,
        hora_recebimento=obj_hora,
        foto=foto_base64,
    )

    try:
        db.session.add(encomenda)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500

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
            encomenda.foto = file_to_base64(file)
    
    db.session.commit()
    
    return {"message": "Encomenda atualizada", "encomenda": encomenda.to_dict()}, 200


@app.route("/encomendas/<int:id>", methods=["DELETE"])
def deletar_encomenda(id):
    encomenda = Encomenda.query.get_or_404(id)
    db.session.delete(encomenda)
    db.session.commit()
    return {"message": "Encomenda deletada com sucesso"}, 200

@app.route("/encomendas/<int:id>/retirada", methods=["POST"])
def retirar_encomenda(id):
    encomenda = Encomenda.query.get_or_404(id)
    
    if request.is_json:
        data = request.json
        nome_retirada = data.get("nome_retirada")
        assinatura_base64 = data.get("assinatura")
    else:
        nome_retirada = request.form.get("nome_retirada")
        assinatura_base64 = ""
        if 'assinatura' in request.files:
            file = request.files['assinatura']
            if file and file.filename:
                assinatura_base64 = file_to_base64(file)
    
    encomenda.retirado = True
    encomenda.nome_retirada = nome_retirada
    encomenda.assinatura = assinatura_base64
    encomenda.data_retirada = datetime.datetime.now().date()
    encomenda.hora_retirada = datetime.datetime.now().time()
    
    db.session.commit()
    return {"message": "Encomenda retirada com sucesso", "encomenda": encomenda.to_dict()}, 200


@app.route("/acessos", methods=["POST"])
def criar_acesso():
    data = request.json

    acesso = Acesso(
        nome=data["nome"],
        sobrenome=data.get("sobrenome", ""),
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
    
@app.route("/acessos/<int:id>", methods=["PUT"])
def editar_acesso(id):
    acesso = Acesso.query.get_or_404(id)
    data = request.json
    
    acesso.nome = data.get("nome", acesso.nome)
    acesso.sobrenome = data.get("sobrenome", acesso.sobrenome)
    acesso.documento = data.get("documento", acesso.documento)
    acesso.placa = data.get("placa", acesso.placa)
    acesso.marca = data.get("marca", acesso.marca)
    acesso.modelo = data.get("modelo", acesso.modelo)
    acesso.cor = data.get("cor", acesso.cor)
    
    db.session.commit()
    return {"message": "Acesso atualizado", "acesso": acesso.to_dict()}, 200


# ========== OCORRÊNCIAS ==========

@app.route("/ocorrencias", methods=["POST"])
def criar_ocorrencia():
    try:
        data = request.json
        print(f"📝 Dados recebidos: {data}")

        ocorrencia = Ocorrencia(
            data=datetime.datetime.strptime(data["data"], "%Y-%m-%d").date(),
            hora=datetime.datetime.strptime(data["hora"], "%H:%M").time(),
            unidade_infratante=data["unidade_infratante"],
            nome_morador=data["nome_morador"],
            registrada_por=data["registrada_por"],
            quem_registrou=data["quem_registrou"],
            motivo_ocorrencia=data["motivo_ocorrencia"],
        )

        db.session.add(ocorrencia)
        db.session.commit()

        return {"message": "Ocorrência cadastrada", "ocorrencia": ocorrencia.to_dict()}, 201
    except Exception as e:
        print(f"❌ Erro ao criar ocorrência: {str(e)}")
        return {"error": str(e)}, 500


@app.route("/ocorrencias", methods=["GET"])
def listar_ocorrencias():
    ocorrencias = Ocorrencia.query.order_by(Ocorrencia.id.desc()).all()
    return {"ocorrencias": [o.to_dict() for o in ocorrencias]}


@app.route("/ocorrencias/<int:id>", methods=["PUT"])
def editar_ocorrencia(id):
    ocorrencia = Ocorrencia.query.get_or_404(id)
    data = request.json

    ocorrencia.data = datetime.datetime.strptime(data["data"], "%Y-%m-%d").date()
    ocorrencia.hora = datetime.datetime.strptime(data["hora"], "%H:%M").time()
    ocorrencia.unidade_infratante = data["unidade_infratante"]
    ocorrencia.nome_morador = data["nome_morador"]
    ocorrencia.registrada_por = data["registrada_por"]
    ocorrencia.quem_registrou = data["quem_registrou"]
    ocorrencia.motivo_ocorrencia = data["motivo_ocorrencia"]

    db.session.commit()

    return {"message": "Ocorrência atualizada", "ocorrencia": ocorrencia.to_dict()}, 200


@app.route("/ocorrencias/<int:id>", methods=["DELETE"])
def deletar_ocorrencia(id):
    ocorrencia = Ocorrencia.query.get_or_404(id)
    db.session.delete(ocorrencia)
    db.session.commit()
    return {"message": "Ocorrência deletada"}, 200


# Servir frontend React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    return send_from_directory(STATIC_FOLDER, 'index.html')




# ========== ESPAÇOS E SERVIÇOS ==========

@app.route("/chaves", methods=["POST"])
def criar_chave():
    data = request.json
    import uuid
    
    # Gera um código aleatório se não for enviado (ou sempre, já que removemos do front)
    codigo_gerado = f"KEY-{uuid.uuid4().hex[:6].upper()}"
    
    chave = Chave(
        area_nome=data["area_nome"],
        codigo=codigo_gerado,
        setor="Geral", # Padrão já que removemos do front
        na_portaria=True,
    )
    db.session.add(chave)
    db.session.commit()
    return {"message": "Chave cadastrada", "chave": chave.to_dict()}, 201

@app.route("/chaves", methods=["GET"])
def listar_chaves():
    chaves = Chave.query.order_by(Chave.id.desc()).all()
    return {"chaves": [c.to_dict() for c in chaves]}

@app.route("/chaves/<int:id>", methods=["PUT"])
def editar_chave(id):
    chave = Chave.query.get_or_404(id)
    data = request.json
    
    if "area_nome" in data:
        chave.area_nome = data["area_nome"]
    
    db.session.commit()
    return {"message": "Chave atualizada", "chave": chave.to_dict()}, 200

@app.route("/chaves/<int:id>", methods=["DELETE"])
def deletar_chave(id):
    chave = Chave.query.get_or_404(id)
    db.session.delete(chave)
    db.session.commit()
    return {"message": "Chave deletada"}, 200

@app.route("/chaves/<int:id>/retirar", methods=["POST"])
def retirar_chave(id):
    chave = Chave.query.get_or_404(id)
    
    # Se for FormData, pega os dados de request.form
    # Se for JSON, pega de request.json (mas aqui estamos focando em FormData por causa da imagem)
    
    # Check if request has files (multipart/form-data)
    if request.files:
        nome_retirada = request.form.get("retirado_por")
        unidade = request.form.get("unidade")
        item_ids = request.form.getlist("item_id") # Pega lista de IDs
        
        assinatura_base64 = ""
        if 'assinatura' in request.files:
            file = request.files['assinatura']
            if file and file.filename:
                assinatura_base64 = file_to_base64(file)
    else:
        # Fallback para JSON
        data = request.json
        nome_retirada = data.get("retirado_por", "")
        unidade = data.get("unidade", "")
        item_ids = data.get("item_ids", [])
        assinatura_base64 = ""

    # Buscar nomes de todos os itens vinculados
    item_nomes_list = []
    for i_id in item_ids:
        if i_id:
            it = ItemPortaria.query.get(i_id)
            if it:
                item_nomes_list.append(it.nome)
    
    item_nome_final = ", ".join(item_nomes_list)

    chave.na_portaria = False
    chave.retirado_por = nome_retirada
    chave.unidade = unidade
    chave.assinatura = assinatura_base64
    chave.data_retirada = datetime.datetime.now()
    chave.data_devolucao = None
    
    # Criar registro de histórico
    log = MovimentacaoChave(
        chave_id=chave.id,
        retirado_por=nome_retirada,
        unidade=unidade,
        assinatura=assinatura_base64,
        item_id=int(item_ids[0]) if item_ids and item_ids[0] else None, # Mantém o primeiro como ref se necessário
        item_nome=item_nome_final,
        data_retirada=datetime.datetime.now()
    )
    db.session.add(log)
    
    db.session.commit()
    return {"message": "Chave retirada", "chave": chave.to_dict()}, 200

@app.route("/chaves/<int:id>/devolver", methods=["POST"])
def devolver_chave(id):
    chave = Chave.query.get_or_404(id)
    chave.na_portaria = True
    # Mantemos o histórico de quem retirou E quando devolveu?
    # O modelo atual não tem histórico separado, ele sobrescreve.
    # Se quiser histórico, precisaria de uma tabela separada 'MovimentacaoChave'.
    # O pedido do usuário foi: "quero data de devolução". Se eu sobrescrever, perco quem retirou?
    # O comportamento padrão do código anterior era limpar.
    # Vou manter "retirado_por" LIMPO para indicar que está na portaria,
    # MAS vou salvar `data_devolucao` antes de limpar? Não faz sentido se limparmos os dados.
    # O usuário pediu "data de devolução". Normalmente isso implica ver o histórico.
    # Mas no card "Na Portaria", não faz sentido mostrar data de devolução de uma retirada antiga.
    # Vou manter o comportamento de limpar para indicar disponibilidade,
    # mas o campo `data_devolucao` ficará disponível APENAS se eu não limpar tudo.
    # Decisão: Para "devolver", vamos limpar os dados de retirada para indicar que está livre.
    # Se o usuário quisesse histórico persistente, precisaria de outra tabela.
    # Vou limpar retirado_por, unidade e assinatura, pois a chave está livre agora.
    
    chave.retirado_por = ""
    chave.unidade = ""
    chave.assinatura = ""
    chave.data_retirada = None
    chave.data_devolucao = datetime.datetime.now() # Salva a data da última devolução (opcional, mas solicitado)
    
    # Atualizar registro de histórico (marcar devolução no log aberto)
    log = MovimentacaoChave.query.filter_by(chave_id=id, data_devolucao=None).order_by(MovimentacaoChave.data_retirada.desc()).first()
    if log:
        log.data_devolucao = datetime.datetime.now()
    
    db.session.commit()
    return {"message": "Chave devolvida", "chave": chave.to_dict()}, 200

@app.route("/chaves/<int:id>/historico", methods=["GET"])
def historico_chave(id):
    historico = MovimentacaoChave.query.filter_by(chave_id=id).order_by(MovimentacaoChave.data_retirada.desc()).all()
    return {"historico": [h.to_dict() for h in historico]}

@app.route("/itens", methods=["GET"])
def listar_itens():
    itens = ItemPortaria.query.order_by(ItemPortaria.id.asc()).all()
    return {"itens": [i.to_dict() for i in itens]}

@app.route("/itens", methods=["POST"])
def criar_item():
    data = request.json
    item = ItemPortaria(
        nome=data["nome"], 
        tipo=data.get("tipo", "Geral")
    )
    db.session.add(item)
    db.session.commit()
    return {"message": "Item criado", "item": item.to_dict()}, 201

@app.route("/itens/<int:id>/retirar", methods=["POST"])
def retirar_item(id):
    item = ItemPortaria.query.get_or_404(id)
    if not item.disponivel:
        return {"error": "Item já retirado"}, 400
    
    if request.files:
        nome_morador = request.form.get("nome_morador")
        apartamento = request.form.get("apartamento")
        bloco = request.form.get("bloco")
        assinatura_base64 = ""
        if 'assinatura' in request.files:
            file = request.files['assinatura']
            if file and file.filename:
                assinatura_base64 = file_to_base64(file)
    else:
        data = request.json
        nome_morador = data.get("nome_morador")
        apartamento = data.get("apartamento")
        bloco = data.get("bloco")
        assinatura_path = ""

    item.disponivel = False
    item.retirado_por = nome_morador
    item.apartamento = apartamento
    item.bloco = bloco
    item.assinatura = assinatura_base64
    item.data_retirada = datetime.datetime.now()
    
    # Criar registro de histórico
    log = MovimentacaoItem(
        item_id=item.id,
        retirado_por=nome_morador,
        apartamento=apartamento,
        bloco=bloco,
        assinatura=assinatura_base64,
        data_retirada=datetime.datetime.now()
    )
    db.session.add(log)
    
    db.session.commit()
    return {"message": "Retirada registrada", "item": item.to_dict()}, 200

@app.route("/itens/<int:id>/devolver", methods=["POST"])
def devolver_item(id):
    item = ItemPortaria.query.get_or_404(id)
    item.disponivel = True
    item.retirado_por = ""
    item.apartamento = ""
    item.bloco = ""
    item.data_retirada = None
    
    # Atualizar registro de histórico
    log = MovimentacaoItem.query.filter_by(item_id=id, data_devolucao=None).order_by(MovimentacaoItem.data_retirada.desc()).first()
    if log:
        log.data_devolucao = datetime.datetime.now()
        
    db.session.commit()
    return {"message": "Devolução registrada", "item": item.to_dict()}, 200

@app.route("/itens/<int:id>/historico", methods=["GET"])
def historico_item(id):
    historico = MovimentacaoItem.query.filter_by(item_id=id).order_by(MovimentacaoItem.data_retirada.desc()).all()
    return {"historico": [h.to_dict() for h in historico]}

@app.route("/itens/<int:id>", methods=["PUT"])
def editar_item(id):
    item = ItemPortaria.query.get_or_404(id)
    data = request.json
    if "nome" in data:
        item.nome = data["nome"]
    if "tipo" in data:
        item.tipo = data["tipo"]
    db.session.commit()
    return {"message": "Item atualizado", "item": item.to_dict()}, 200

@app.route("/itens/<int:id>", methods=["DELETE"])
def deletar_item(id):
    item = ItemPortaria.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return {"message": "Item removido"}, 200

@app.route("/reservas/hoje", methods=["GET"])
def reservas_hoje():
    today = datetime.date.today()
    reservas = ReservaEspaco.query.filter(ReservaEspaco.data == today).order_by(ReservaEspaco.hora_inicio.asc()).all()
    return {"reservas": [r.to_dict() for r in reservas]}


# Redundant serve route removed (consolidated above)

if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
