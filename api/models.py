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


class Ocorrencia(db.Model):
    __tablename__ = "ocorrencias"

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    unidade_infratante = db.Column(db.String(50), nullable=False)
    nome_morador = db.Column(db.String(200), nullable=False)
    registrada_por = db.Column(db.String(50), nullable=False)  # 'unidade' ou 'condominio'
    quem_registrou = db.Column(db.String(200), nullable=False)
    motivo_ocorrencia = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "data": self.data.isoformat() if self.data else "",
            "hora": self.hora.strftime("%H:%M") if self.hora else "",
            "unidade_infratante": self.unidade_infratante,
            "nome_morador": self.nome_morador,
            "registrada_por": self.registrada_por,
            "quem_registrou": self.quem_registrou,
            "motivo_ocorrencia": self.motivo_ocorrencia,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else "",
        }


class Chave(db.Model):
    __tablename__ = "chaves"

    id = db.Column(db.Integer, primary_key=True)
    area_nome = db.Column(db.String(200), nullable=False)
    codigo = db.Column(db.String(100), nullable=False)
    setor = db.Column(db.String(100), nullable=False)
    na_portaria = db.Column(db.Boolean, default=True)
    retirado_por = db.Column(db.String(200), nullable=True)
    unidade = db.Column(db.String(20), nullable=True) # Quem retirou (apartamento)
    assinatura = db.Column(db.String(500), nullable=True) # Caminho da imagem
    data_retirada = db.Column(db.DateTime, nullable=True)
    data_devolucao = db.Column(db.DateTime, nullable=True) # Histórico

    def to_dict(self):
        return {
            "id": self.id,
            "area_nome": self.area_nome,
            "codigo": self.codigo,
            "setor": self.setor,
            "na_portaria": self.na_portaria,
            "retirado_por": self.retirado_por or "",
            "unidade": self.unidade or "",
            "assinatura": self.assinatura or "",
            # Se tiver upload de assinatura, precisamos garantir que o frontend consiga acessar a URL
            # O ideal seria retornar a URL completa se existir
            "assinatura_url": f"/uploads/{self.assinatura}" if self.assinatura else None,
            "data_retirada": self.data_retirada.isoformat() if self.data_retirada else "",
            "data_devolucao": self.data_devolucao.isoformat() if self.data_devolucao else "",
        }


class MovimentacaoChave(db.Model):
    __tablename__ = "movimentacoes_chaves"

    id = db.Column(db.Integer, primary_key=True)
    chave_id = db.Column(db.Integer, db.ForeignKey("chaves.id"), nullable=False)
    retirado_por = db.Column(db.String(200), nullable=False)
    unidade = db.Column(db.String(20), nullable=False)
    assinatura = db.Column(db.String(500), nullable=True)
    item_id = db.Column(db.Integer, db.ForeignKey("itens_portaria.id"), nullable=True)
    item_nome = db.Column(db.String(200), nullable=True)
    data_retirada = db.Column(db.DateTime, default=db.func.now())
    data_devolucao = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "chave_id": self.chave_id,
            "retirado_por": self.retirado_por,
            "unidade": self.unidade,
            "assinatura": self.assinatura or "",
            "assinatura_url": f"/uploads/{self.assinatura}" if self.assinatura else None,
            "item_nome": self.item_nome or "",
            "data_retirada": self.data_retirada.isoformat() if self.data_retirada else "",
            "data_devolucao": self.data_devolucao.isoformat() if self.data_devolucao else "",
        }


class ItemPortaria(db.Model):
    __tablename__ = "itens_portaria"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # 'carrinho', 'escada', 'ferramenta'
    disponivel = db.Column(db.Boolean, default=True)
    retirado_por = db.Column(db.String(200), nullable=True)
    apartamento = db.Column(db.String(20), nullable=True)
    bloco = db.Column(db.String(20), nullable=True)
    assinatura = db.Column(db.String(500), nullable=True)
    data_retirada = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "tipo": self.tipo,
            "disponivel": self.disponivel,
            "retirado_por": self.retirado_por or "",
            "apartamento": self.apartamento or "",
            "bloco": self.bloco or "",
            "assinatura_url": f"/uploads/{self.assinatura}" if self.assinatura else None,
            "data_retirada": self.data_retirada.isoformat() if self.data_retirada else "",
        }

class MovimentacaoItem(db.Model):
    __tablename__ = "movimentacoes_itens"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("itens_portaria.id"), nullable=False)
    retirado_por = db.Column(db.String(200), nullable=False)
    apartamento = db.Column(db.String(20), nullable=False)
    bloco = db.Column(db.String(20), nullable=False)
    assinatura = db.Column(db.String(500), nullable=True)
    data_retirada = db.Column(db.DateTime, default=db.func.now())
    data_devolucao = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "retirado_por": self.retirado_por,
            "apartamento": self.apartamento,
            "bloco": self.bloco,
            "assinatura_url": f"/uploads/{self.assinatura}" if self.assinatura else None,
            "data_retirada": self.data_retirada.isoformat() if self.data_retirada else "",
            "data_devolucao": self.data_devolucao.isoformat() if self.data_devolucao else "",
        }


class ReservaEspaco(db.Model):
    __tablename__ = "reservas_espacos"

    id = db.Column(db.Integer, primary_key=True)
    espaco = db.Column(db.String(100), nullable=False)  # 'salão', 'churrasqueira'
    nome_morador = db.Column(db.String(200), nullable=False)
    data = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fim = db.Column(db.Time, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "espaco": self.espaco,
            "nome_morador": self.nome_morador,
            "data": self.data.isoformat(),
            "hora_inicio": self.hora_inicio.strftime("%H:%M"),
            "hora_fim": self.hora_fim.strftime("%H:%M"),
        }
