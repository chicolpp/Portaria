from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    sobrenome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    cargo = db.Column(db.String(50), nullable=False, default="porteiro")
    foto = db.Column(db.String(500), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=db.func.now())
    ultimo_acesso = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "sobrenome": self.sobrenome,
            "email": self.email,
            "cargo": self.cargo,
            "foto": self.foto or "",
            "is_admin": self.is_admin,
            "ativo": self.ativo,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else "",
            "ultimo_acesso": self.ultimo_acesso.isoformat() if self.ultimo_acesso else "",
        }


class Encomenda(db.Model):
    __tablename__ = "encomendas"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    unidade = db.Column(db.String(100), nullable=False)
    documento = db.Column(db.String(20), nullable=False)
    pagina = db.Column(db.String(50))
    data_recebimento = db.Column(db.Date, nullable=False)
    hora_recebimento = db.Column(db.Time, nullable=False)
    foto = db.Column(db.String(500), nullable=True)
    retirado = db.Column(db.Boolean, default=False)
    nome_retirada = db.Column(db.String(200), nullable=True)
    assinatura = db.Column(db.String(500), nullable=True)
    data_retirada = db.Column(db.Date, nullable=True)
    hora_retirada = db.Column(db.Time, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "unidade": self.unidade,
            "documento": self.documento,
            "pagina": self.pagina,
            "data_recebimento": self.data_recebimento.isoformat(),
            "hora_recebimento": self.hora_recebimento.strftime("%H:%M"),
            "foto": self.foto or "",
            "retirado": self.retirado,
            "nome_retirada": self.nome_retirada or "",
            "assinatura": self.assinatura or "",
            "data_retirada": self.data_retirada.isoformat() if self.data_retirada else "",
            "hora_retirada": self.hora_retirada.strftime("%H:%M") if self.hora_retirada else "",
        }


class Acesso(db.Model):
    __tablename__ = "acessos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    sobrenome = db.Column(db.String(100), nullable=False)
    documento = db.Column(db.String(20), nullable=False)
    placa = db.Column(db.String(20))
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    cor = db.Column(db.String(30))
    data_entrada = db.Column(db.DateTime, default=db.func.now())
    data_saida = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "sobrenome": self.sobrenome,
            "documento": self.documento,
            "placa": self.placa or "",
            "marca": self.marca or "",
            "modelo": self.modelo or "",
            "cor": self.cor or "",
            "data_entrada": self.data_entrada.isoformat() if self.data_entrada else "",
            "data_saida": self.data_saida.isoformat() if self.data_saida else "",
        }
