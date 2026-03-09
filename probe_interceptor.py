import requests

def test_interceptor_interference():
    url = "http://127.0.0.1:5000/encomendas"
    # Axios default headers
    headers = {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        print(f"Testing {url} with Axios-like headers...")
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        
        preview = response.text[:200]
        if "<!DOCTYPE html>" in preview or "<html" in preview:
            print("ALERT: Received HTML instead of JSON! SPA interceptor is interfering.")
        else:
            print("SUCCESS: Received expected response format.")
            print(f"Raw data: {preview}...")
            
    except Exception as e:
        print(f"Request failed: {str(e)}")

if __name__ == "__main__":
    test_interceptor_interference()
