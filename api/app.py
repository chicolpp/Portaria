from flask import Flask, request
from flask_cors import CORS
from database import db
from models import User
import jwt
import datetime

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@127.0.0.1:5432/app"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "CHAVE_SUPER_SECRETA_TROQUE_DEPOIS"

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return {"error": "Email já cadastrado"}, 400

    user = User(email=data["email"])
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return {"message": "Usuário criado"}, 201


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return {"error": "Credenciais inválidas"}, 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return {"token": token}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
