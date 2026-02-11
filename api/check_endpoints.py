import requests

BASE_URL = "http://127.0.0.1:5000"

endpoints = [
    "/chaves",
    "/itens",
    "/reservas/hoje"
]

print(f"Testando endpoints em {BASE_URL}...")

for ep in endpoints:
    try:
        url = f"{BASE_URL}{ep}"
        response = requests.get(url)
        print(f"GET {ep}: Status {response.status_code}")
        if response.status_code != 200:
            print(f"Erro no {ep}: {response.text}")
        else:
            try:
                data = response.json()
                keys = list(data.keys())
                print(f"   Sucesso. Chaves na resposta: {keys}")
            except:
                print("   Resposta não é JSON válido")
    except Exception as e:
        print(f"GET {ep}: Falha na conexão - {str(e)}")
