# import pandas as pd
# from app.synonyms import SYNONYM_MAP

# def load_skills(path="skills_dataset.xlsx"):
#     df = pd.read_excel(path)
#     skills = set(df['Skills'].dropna().str.lower().str.strip().unique().tolist())
#     # Expand with all synonyms and canonical forms
#     skills.update(SYNONYM_MAP.keys())
#     skills.update(SYNONYM_MAP.values())
#     return list(skills)
# skills_loader.py
import pandas as pd
import os
from pathlib import Path
from app.synonyms import SYNONYM_MAP

def load_skills(path="grouped_skills_dataset.csv"):
    # Resolve path relative to project root (ats-skill-analyzer directory)
    if not os.path.isabs(path):
        # Get the project root (parent of app directory)
        project_root = Path(__file__).parent.parent
        path = os.path.join(project_root, path)
    
    df = pd.read_csv(path)
    df['Skill'] = df['Skill'].str.lower().str.strip()
    skills = set(df['Skill'].dropna().unique().tolist())

    # Add synonyms too
    skills.update(SYNONYM_MAP.keys())
    for v in SYNONYM_MAP.values():
        if isinstance(v, list):
            skills.update(v)
        else:
            skills.add(v)

    # Skill to category map
    skill_to_group = dict(zip(df['Skill'], df['Category']))

    return list(skills), skill_to_group
