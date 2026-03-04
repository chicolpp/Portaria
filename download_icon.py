import requests
import os

url = "https://img.icons8.com/ios/100/000000/department.png"
output_path = r"c:\react\vite-teste\public\icons\amenities.png"

try:
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            for chunk in response:
                f.write(chunk)
        print(f"Sucesso: Ícone baixado em {output_path}")
    else:
        print(f"Erro: Status code {response.status_code}")
except Exception as e:
    print(f"Erro ao baixar: {e}")
