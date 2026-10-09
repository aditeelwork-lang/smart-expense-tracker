
import requests

url = "http://127.0.0.1:5000/api/transactions"

data = {
    "title": "Coffee",
    "amount": 120,
    "type": "expense",
    "category": "Food",
    "description": "Coffee after class"
}

response = requests.post(url, json=data)

print("Status code:", response.status_code)
print("Response:", response.json())