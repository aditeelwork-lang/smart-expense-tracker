
import requests

url = "http://127.0.0.1:5000/api/transactions/3"

data = {
    "title": "Coffee",
    "amount": 100,
    "type": "expense",
    "category": "Food",
    "description": "Coffee after class"
}

response = requests.put(url, json=data)

print("Status code:", response.status_code)
print("Response:", response.json())