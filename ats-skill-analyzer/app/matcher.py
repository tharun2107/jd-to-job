# # matcher.py
# from collections import Counter
# from rapidfuzz import fuzz, process
# from app.synonyms import normalize_skill
# from app.skills_group import SECTION_WEIGHTS

# def match_skills(jd_skills, resume_section_skills, threshold=85):
#     matched = []
#     missing = []
#     score = 0.0
#     total_weight = 0.0
#     matched_skills_set = set()

#     jd_skills_norm = [normalize_skill(s) for s in jd_skills]

#     for jd_skill in jd_skills_norm:
#         max_score = 0
#         best_section = None

#         for section, resume_skills in resume_section_skills.items():
#             section_weight = SECTION_WEIGHTS.get(section, 1.0)
#             resume_norm = [normalize_skill(s) for s in resume_skills]

#             result = process.extractOne(jd_skill, resume_norm, scorer=fuzz.token_sort_ratio)
#             if result:
#                 match, ratio, _ = result
#                 if ratio >= threshold and (ratio / 100.0) * section_weight > max_score:
#                     max_score = (ratio / 100.0) * section_weight
#                     best_section = section

#         if max_score > 0:
#             score += max_score
#             matched.append(jd_skill)
#             matched_skills_set.add(jd_skill)

#         # ✅ Correct total weight based on best matched section
#         total_weight += SECTION_WEIGHTS.get(best_section, 1.0) if best_section else 1.0

#     missing = [s for s in jd_skills_norm if s not in matched_skills_set]

#     final_score = round((score / total_weight) * 100, 2) if total_weight > 0 else 0.0
#     return matched, missing, final_score

import re
from rapidfuzz import fuzz, process
from app.synonyms import normalize_skill
from app.skills_group import SECTION_WEIGHTS
from app.semantic_matcher import semantic_match, SEMANTIC_AVAILABLE

# Example list of outdated/irrelevant skills
OUTDATED_SKILLS = {"cobol", "fortran", "vb6", "flash", "asp classic", "frontpage"}

PENALIZE_SECTIONS = {"summary", "objective"}
KEY_SECTIONS = {"experience", "projects", "default"}
SECTION_WEIGHTS = {
    "experience": 1.5,
    "projects": 1.4,
    "education": 1.0,
    "certifications": 1.3,
    "achievements": 1.2,
    "default": 1.0
}


def extract_years_experience(text):
    """Extracts years of experience from text. Returns int or 0 if not found/fresher."""
    print(f"[DEBUG] Extracting years from text: {text}")
    text = text.lower()
    if 'fresher' in text:
        print("[DEBUG] Detected 'fresher' in text. Returning 0 years.")
        return 0
    # Look for patterns like '3 years', '3-5 years', 'at least 2 years', etc.
    match = re.search(r'(\d+)[-–]?(\d+)?\s*(?:to|–)?\s*years?', text)
    if match:
        if match.group(2):
            print(f"[DEBUG] Found year range: {match.group(1)}-{match.group(2)}. Using minimum: {match.group(1)}")
            return int(match.group(1))  # Use minimum in range
        print(f"[DEBUG] Found years: {match.group(1)}")
        return int(match.group(1))
    print("[DEBUG] No years found. Returning 0.")
    return 0


def hybrid_match_skill(jd_skill, resume_skills, fuzzy_threshold=85, semantic_threshold=0.7):
    """
    Hybrid matching: Try fuzzy matching first (fast), fallback to semantic (BERT).
    
    Args:
        jd_skill: Skill from JD (normalized)
        resume_skills: List of resume skills (normalized)
        fuzzy_threshold: Minimum fuzzy match ratio (0-100)
        semantic_threshold: Minimum semantic similarity (0-1)
    
    Returns:
        Tuple of (best_match, match_score, match_type)
        match_type: 'fuzzy', 'semantic', or None
    """
    if not resume_skills:
        return None, 0.0, None
    
    # Step 1: Try fuzzy matching first (fast, good for exact/variation matches)
    fuzzy_result = process.extractOne(jd_skill, resume_skills, scorer=fuzz.token_sort_ratio)
    
    if fuzzy_result:
        match, ratio, _ = fuzzy_result
        if ratio >= fuzzy_threshold:
            # Convert fuzzy ratio (0-100) to normalized score (0-1)
            normalized_score = ratio / 100.0
            return match, normalized_score, 'fuzzy'
    
    # Step 2: Fallback to semantic matching (BERT embeddings for meaning-based matching)
    if SEMANTIC_AVAILABLE:
        semantic_match_result, semantic_score = semantic_match(
            jd_skill, 
            resume_skills, 
            threshold=semantic_threshold,
            use_cache=True
        )
        
        if semantic_match_result:
            return semantic_match_result, semantic_score, 'semantic'
    
    # No match found
    return None, 0.0, None


def match_skills(jd_skills, resume_section_skills, threshold=85, jd_text=None, resume_text=None, use_semantic=True):
    matched = []
    missing = []
    score = 0.0
    total_weight = 0.0
    matched_skills_set = set()
    penalized_skills = set()
    outdated_penalty = 0.0
    experience_penalty = 0.0
    experience_flag = None

    # --- Category-wise score tracking ---
    section_scores = {k: 0.0 for k in SECTION_WEIGHTS}
    section_bonuses = {k: 0.0 for k in SECTION_WEIGHTS}
    section_penalties = {k: 0.0 for k in SECTION_WEIGHTS}
    missing_sections = []

    # Flatten all normalized JD skills
    def flatten_normalized(skills):
        flat = []
        for s in skills:
            norm = normalize_skill(s)
            if isinstance(norm, list):
                flat.extend(norm)
            else:
                flat.append(norm)
        return flat

    jd_skills_norm = flatten_normalized(jd_skills)

    # Track where each skill is found (flatten resume skills too)
    skill_section_map = {}
    for section, resume_skills in resume_section_skills.items():
        for skill in resume_skills:
            normed = normalize_skill(skill)
            if isinstance(normed, list):
                for norm in normed:
                    skill_section_map.setdefault(norm, set()).add(section)
            else:
                skill_section_map.setdefault(normed, set()).add(section)

    # Flatten all normalized resume skills for debug
    all_resume_skills_flat = []
    for section, resume_skills in resume_section_skills.items():
        for skill in resume_skills:
            normed = normalize_skill(skill)
            if isinstance(normed, list):
                all_resume_skills_flat.extend(normed)
            else:
                all_resume_skills_flat.append(normed)

    print(f"[DEBUG] Normalized JD skills: {jd_skills_norm}")
    print(f"[DEBUG] Normalized Resume skills (all sections): {all_resume_skills_flat}")

    min_jd_years = extract_years_experience(jd_text or "") if jd_text else 0
    resume_years = extract_years_experience(resume_text or "") if resume_text else 0
    print(f"[DEBUG] min_jd_years: {min_jd_years}, resume_years: {resume_years}")

    # Track match types for debugging
    match_types = {'fuzzy': 0, 'semantic': 0, 'none': 0}
    
    for jd_skill in jd_skills_norm:
        max_score = 0
        best_section = None
        found_in_key_section = False
        best_match_type = None
        
        for section, resume_skills in resume_section_skills.items():
            section_weight = SECTION_WEIGHTS.get(section, 1.0)
            resume_norm = []
            for s in resume_skills:
                normed = normalize_skill(s)
                if isinstance(normed, list):
                    resume_norm.extend(normed)
                else:
                    resume_norm.append(normed)
            
            # Use hybrid matching (fuzzy + semantic)
            if use_semantic:
                match, match_score, match_type = hybrid_match_skill(
                    jd_skill, 
                    resume_norm, 
                    fuzzy_threshold=threshold,
                    semantic_threshold=0.7  # 70% semantic similarity threshold
                )
            else:
                # Fallback to fuzzy-only if semantic is disabled
                result = process.extractOne(jd_skill, resume_norm, scorer=fuzz.token_sort_ratio)
                if result:
                    match, ratio, _ = result
                    if ratio >= threshold:
                        match_score = ratio / 100.0
                        match_type = 'fuzzy'
                    else:
                        match, match_score, match_type = None, 0.0, None
                else:
                    match, match_score, match_type = None, 0.0, None
            
            if match and match_score > 0:
                # Apply quality adjustment (diminishing returns for very high matches)
                quality = match_score ** 1.3 if match_score < 1.0 else 1.0
                weighted_score = quality * section_weight
                
                if weighted_score > max_score:
                    max_score = weighted_score
                    best_section = section
                    best_match_type = match_type
                
                if section in KEY_SECTIONS:
                    found_in_key_section = True
        
        # Track match statistics
        if best_match_type:
            match_types[best_match_type] = match_types.get(best_match_type, 0) + 1
        else:
            match_types['none'] = match_types.get('none', 0) + 1
        if max_score > 0:
            score += max_score
            matched.append(jd_skill)
            matched_skills_set.add(jd_skill)
            if best_section:
                section_scores[best_section] += max_score
        total_weight += SECTION_WEIGHTS.get(best_section, 1.0) if best_section else 1.0
        # Penalize if skill is only in summary/objective
        if not found_in_key_section and jd_skill in skill_section_map and any(s in PENALIZE_SECTIONS for s in skill_section_map[jd_skill]):
            penalized_skills.add(jd_skill)
            score -= 0.2  # Subtract 0.2 for each such skill
            section_penalties["default"] -= 0.2
    missing = [s for s in jd_skills_norm if s not in matched_skills_set]
    # Penalize outdated/irrelevant skills
    for skill in skill_section_map:
        if skill in OUTDATED_SKILLS:
            outdated_penalty += 0.5  # Subtract 0.5 for each outdated skill
            section_penalties["default"] -= 0.5
    score -= outdated_penalty
    # Bonus: add score for good certs & achievements (even if not in JD)
    for bonus_section in ["certifications", "achievements"]:
        items = resume_section_skills.get(bonus_section, [])
        bonus_weight = SECTION_WEIGHTS.get(bonus_section, 1.0)
        bonus = 0.05 * len(items) * bonus_weight  # 5% per item * weight
        score += bonus
        section_bonuses[bonus_section] += bonus
    # Bonus: add score for projects (even if not in JD)
    project_items = resume_section_skills.get("projects", [])
    project_weight = SECTION_WEIGHTS.get("projects", 1.0)
    project_bonus = 0.03 * len(project_items) * project_weight  # 3% per project * weight
    score += project_bonus
    section_bonuses["projects"] += project_bonus
    # Penalize for missing certifications, achievements, projects
    for section in ["certifications", "achievements", "projects"]:
        if not resume_section_skills.get(section):
            score -= 2
            section_penalties[section] -= 2
            missing_sections.append(section)
    # Final score calculation (capped to max 95%, min 0)
    raw_score = round((score / total_weight) * 100, 2) if total_weight > 0 else 0.0
    penalized_score = raw_score
    # Proportional experience penalty, capped at 70%
    max_penalty = 0.7  # At most 70% penalty for experience gap
    if min_jd_years > 0 and resume_years < min_jd_years:
        penalty_ratio = min((min_jd_years - resume_years) / min_jd_years, max_penalty)
        penalized_score = round(raw_score * (1 - penalty_ratio), 2)
        experience_penalty = penalty_ratio
        experience_flag = f"JD requires {min_jd_years}+ years, resume shows {resume_years}."
    else:
        penalized_score = raw_score
    penalized_score = min(max(penalized_score, 0.0), 95.0)
    print(f"[DEBUG] Raw skill match score before experience penalty: {raw_score}")
    print(f"[DEBUG] Penalized score after experience penalty: {penalized_score}")
    print(f"[DEBUG] Match type statistics: {match_types}")
    print(f"[DEBUG] Semantic matching enabled: {use_semantic and SEMANTIC_AVAILABLE}")
    
    # Return detailed breakdown
    return matched, missing, penalized_score, {
        'jd_years': min_jd_years,
        'resume_years': resume_years,
        'experience_penalty': experience_penalty,
        'experience_flag': experience_flag,
        'raw_score': raw_score,
        'penalized_score': penalized_score,
        'section_scores': section_scores,
        'section_bonuses': section_bonuses,
        'section_penalties': section_penalties,
        'missing_sections': missing_sections,
        'match_types': match_types,  # New: track fuzzy vs semantic matches
        'semantic_enabled': use_semantic and SEMANTIC_AVAILABLE
    }
