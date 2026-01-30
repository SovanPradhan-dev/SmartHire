import re
from .skills_db import SKILLS_DB

ALIASES = {
    "oop": "object oriented programming",
    "dsa": "data structures",
    "backend": "backend development",
    "api": "rest api",
    "spring": "spring boot"
}

def extract_skills(text):
    text = text.lower()

    # normalize aliases
    for alias, actual in ALIASES.items():
        text = text.replace(alias, actual)

    found = set()
    for skill in SKILLS_DB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found.add(skill)

    return list(found)
