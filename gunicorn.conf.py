# Configuração do Gunicorn para maior estabilidade e suporte a URLs longas
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
workers = 1 # Recomenda-se 1 para o plano Free do Render para evitar OOM
limit_request_line = 8190  # Aumenta o limite para evitar erro 400 em URLs longas
timeout = 120 # Aumenta o timeout para evitar worker kills em cold starts
