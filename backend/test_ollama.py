import os
from ollama import Client
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('OLLAMA_API_KEY', '')
print("API Key loaded:", api_key)

client = Client(
    host="https://ollama.com",
    headers={'Authorization': 'Bearer ' + api_key}
)

messages = [
  {
    'role': 'user',
    'content': 'Hello',
  },
]

try:
    for part in client.chat('qwen3.5:397b-cloud', messages=messages, stream=True):
      print(part['message']['content'], end='', flush=True)
except Exception as e:
    print("Error:", str(e))
