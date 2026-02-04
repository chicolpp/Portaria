import sys
import os

# Adiciona a pasta api ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from app import app

if __name__ == "__main__":
    app.run()
