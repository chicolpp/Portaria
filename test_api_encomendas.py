import requests

def test_encomendas_api():
    url = "http://127.0.0.1:5000/api/encomendas"
    print(f"Testing GET {url}...")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Successfully fetched encomendas!")
            print(f"Count: {len(data.get('encomendas', []))}")
        else:
            print(f"Request failed: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

if __name__ == "__main__":
    test_encomendas_api()
