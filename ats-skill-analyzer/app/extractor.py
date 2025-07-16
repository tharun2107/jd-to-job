# extractor.py
import spacy
from spacy.matcher import PhraseMatcher
from app.synonyms import normalize_skill

SECTION_HEADERS = ["experience", "projects", "education", "certifications", "skills", "summary", "objective", "achievements"]

# --- Transformers NER integration ---
try:
    from transformers import pipeline
    ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
except Exception as e:
    ner_pipeline = None
    print("[WARN] Transformers NER pipeline not available:", e)

class SkillExtractor:
    def __init__(self, skills_list):
        self.nlp = spacy.load("en_core_web_sm")
        self.matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        patterns = [self.nlp.make_doc(skill) for skill in skills_list]
        self.matcher.add("SKILLS", patterns)
        self.skills_list = set(skills_list)

    def extract(self, text):
        # Use transformers NER if available, fallback to spaCy matcher
        skills_found = set()
        if ner_pipeline:
            entities = ner_pipeline(text)
            for ent in entities:
                ent_text = ent['word'].lower().strip()
                # Filter out BERT subword tokens and single letters
                if ent_text.startswith('##') or len(ent_text) == 1:
                    continue
                norm_list = normalize_skill(ent_text)
                for norm in norm_list:
                    if norm in self.skills_list or ent.get('entity_group') == 'MISC':
                        skills_found.add(norm)
        # Fallback/additional: spaCy matcher
        doc = self.nlp(text)
        matches = self.matcher(doc)
        for _, start, end in matches:
            raw = doc[start:end].text.lower().strip()
            norm_list = normalize_skill(raw)
            for normalized in norm_list:
                skills_found.add(normalized)
        return list(skills_found)

    def extract_section_wise(self, resume_text):
        # Improved section split: regex and NER for headers
        import re
        sections = {}
        current_section = "default"
        lines = resume_text.splitlines()
        for line in lines:
            line_clean = line.strip().lower().strip(":")
            # Regex for section headers (e.g., Experience, EXPERIENCE:)
            if re.match(r"^(%s)[:\s]*$" % "|".join(SECTION_HEADERS), line_clean):
                current_section = line_clean
                sections[current_section] = []
            else:
                sections.setdefault(current_section, []).append(line)
        result = {}
        for section, lines in sections.items():
            text = " ".join(lines)
            result[section] = self.extract(text)
        return result
