from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import os
import sys
from pathlib import Path

# Add parent directory to Python path to allow 'app' module imports
parent_dir = Path(__file__).parent.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from app.skills_loader import load_skills
from app.extractor import SkillExtractor
from app.matcher import match_skills
from app.role_expectations import infer_expected_skills, group_skills
from app import create_app

app = create_app()

# Load skills list and skill-to-group mapping
skills_list, skill_to_group = load_skills()
extractor = SkillExtractor(skills_list)

def extract_text_from_pdf(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def flatten_skills(skills):
    flat = []
    for s in skills:
        if isinstance(s, list):
            flat.extend(s)
        else:
            flat.append(s)
    return flat

@app.route('/analyze', methods=['POST'])
def analyze():
    print("🔥 ML Service Called")

    resume_text = ""
    jd_text = ""
    job_role = ""

    if request.is_json:
        # JSON request (from curl or frontend JS fetch)
        data = request.get_json()
        resume_text = data.get("resume", "")
        jd_text = data.get("job_description", "")
        job_role = data.get("job_role", "").strip().lower()
    else:
        # Form-data request (file upload from frontend)
        if 'resume' in request.files:
            pdf_file = request.files['resume']
            resume_text = extract_text_from_pdf(pdf_file.read())  # ✅ ACTUAL PDF parsing
        else:
            resume_text = request.form.get("resume", "")  # fallback for raw text

        jd_text = request.form.get("job_description", "")
        job_role = request.form.get("job_role", "").strip().lower()

    print("JD TEXT (preview):", jd_text[:100])
    print("Resume TEXT (preview):", resume_text[:100])

    # 🔥 Extract section-wise skills
    resume_section_skills = extractor.extract_section_wise(resume_text)
    print("Resume section skills:", resume_section_skills)

    # Extract skills from JD
    jd_skills_extracted = extractor.extract(jd_text)
    inferred_skills = infer_expected_skills(job_role)
    # --- Fix: If JD text is a job title, use it to infer skills if nothing else found ---
    fallback_inferred_skills = infer_expected_skills(jd_text.strip().lower()) if not jd_skills_extracted and not inferred_skills else []
    if jd_skills_extracted:
        jd_skills = jd_skills_extracted
        print(f"[DEBUG] Using extracted JD skills: {jd_skills}")
    elif inferred_skills:
        jd_skills = inferred_skills
        print(f"[DEBUG] Using inferred skills from job_role: {jd_skills}")
    elif fallback_inferred_skills:
        jd_skills = fallback_inferred_skills
        print(f"[DEBUG] Using inferred skills from JD text as job title: {jd_skills}")
    else:
        jd_skills = []
        print(f"[DEBUG] No JD skills found.")

    matched, missing, score, exp_info = match_skills(jd_skills, resume_section_skills, jd_text=jd_text, resume_text=resume_text)

    def group(skills):
        return group_skills(flatten_skills(skills), skill_to_group)

    return jsonify({
        "jd_skills": jd_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "score": score,
        "resume_skills_by_section": resume_section_skills,
        "grouped_jd_skills": group(jd_skills),
        "grouped_resume_skills": {
            section: group(skills) for section, skills in resume_section_skills.items()
        },
        "grouped_missing_skills": group(missing),
        "experience_info": exp_info,
        # --- New fields for category-wise breakdown ---
        "section_scores": exp_info.get("section_scores", {}),
        "section_bonuses": exp_info.get("section_bonuses", {}),
        "section_penalties": exp_info.get("section_penalties", {}),
        "missing_sections": exp_info.get("missing_sections", []),
        # --- Hybrid matching info ---
        "match_types": exp_info.get("match_types", {}),  # fuzzy vs semantic match counts
        "semantic_enabled": exp_info.get("semantic_enabled", False),  # whether BERT matching is active
    })

if __name__ == '__main__':
    app.run(debug=True)
