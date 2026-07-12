import os
import requests

rapidapi_key = "4f5c1a99eemshf3106ab0dbf6fa6p15bb9ajsnc370edf46bdd"
jsearch_host = "jsearch.p.rapidapi.com"

headers = {
    "X-RapidAPI-Key": rapidapi_key,
    "X-RapidAPI-Host": jsearch_host,
}

params = {
    "query": "Python Backend Engineer LinkedIn Germany",
    "page": "1",
    "num_pages": "1",
    "date_posted": "week",
    "country": "de",
}

print("Testing /search-v2 endpoint...")
response = requests.get(
    "https://jsearch.p.rapidapi.com/search-v2",
    headers=headers,
    params=params,
    timeout=15,
)

print(response.status_code)
import json
print(json.dumps(response.json(), indent=2))
