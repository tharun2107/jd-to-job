import json
import os

def load_skill_resources():
    path = os.path.join(os.path.dirname(__file__), 'data', 'skill_resources.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)