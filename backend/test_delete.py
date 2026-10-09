
import requests

url = "http://127.0.0.1:5000/api/transactions/3"

response = requests.delete(url)

print("Status code:", response.status_code)
print("Response:", response.json())