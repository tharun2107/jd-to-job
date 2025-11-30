# semantic_matcher.py
# BERT-based semantic similarity matching for skills
# Uses sentence-transformers for cosine similarity

import numpy as np
from typing import List, Tuple, Optional
import logging

# Try to import sentence-transformers, fallback gracefully if not available
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    SEMANTIC_AVAILABLE = True
except ImportError as e:
    SEMANTIC_AVAILABLE = False
    logging.warning(f"[WARN] Semantic matching not available: {e}. Install with: pip install sentence-transformers scikit-learn torch")

# Global model instance (lazy loading)
_semantic_model = None
_embedding_cache = {}  # Cache embeddings for performance

def get_semantic_model():
    """Lazy load the semantic model (only when needed)."""
    global _semantic_model
    if not SEMANTIC_AVAILABLE:
        return None
    
    if _semantic_model is None:
        try:
            # Using lightweight model for speed (all-MiniLM-L6-v2 is fast and accurate)
            # Alternative: 'all-mpnet-base-v2' (more accurate but slower)
            print("[INFO] Loading semantic model: all-MiniLM-L6-v2")
            _semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("[INFO] Semantic model loaded successfully")
        except Exception as e:
            print(f"[ERROR] Failed to load semantic model: {e}")
            return None
    
    return _semantic_model

def get_embedding(text: str, use_cache: bool = True) -> Optional[np.ndarray]:
    """
    Get embedding for a text string.
    Uses caching to avoid recomputing embeddings.
    """
    if not SEMANTIC_AVAILABLE:
        return None
    
    # Check cache first
    if use_cache and text.lower() in _embedding_cache:
        return _embedding_cache[text.lower()]
    
    model = get_semantic_model()
    if model is None:
        return None
    
    try:
        embedding = model.encode([text], convert_to_numpy=True)[0]
        
        # Cache the embedding
        if use_cache:
            _embedding_cache[text.lower()] = embedding
        
        return embedding
    except Exception as e:
        print(f"[ERROR] Failed to get embedding for '{text}': {e}")
        return None

def semantic_match(
    jd_skill: str, 
    resume_skills: List[str], 
    threshold: float = 0.7,
    use_cache: bool = True
) -> Tuple[Optional[str], float]:
    """
    Use BERT embeddings for semantic similarity matching.
    
    Args:
        jd_skill: Skill from job description
        resume_skills: List of skills from resume
        threshold: Minimum cosine similarity (0-1) to consider a match
        use_cache: Whether to use embedding cache
    
    Returns:
        Tuple of (best_match, similarity_score) or (None, 0.0) if no match
    """
    if not SEMANTIC_AVAILABLE or not resume_skills:
        return None, 0.0
    
    # Get embedding for JD skill
    jd_embedding = get_embedding(jd_skill, use_cache)
    if jd_embedding is None:
        return None, 0.0
    
    # Get embeddings for all resume skills
    resume_embeddings = []
    valid_resume_skills = []
    
    for skill in resume_skills:
        embedding = get_embedding(skill, use_cache)
        if embedding is not None:
            resume_embeddings.append(embedding)
            valid_resume_skills.append(skill)
    
    if not resume_embeddings:
        return None, 0.0
    
    # Calculate cosine similarity
    # Reshape for sklearn
    jd_embedding_2d = jd_embedding.reshape(1, -1)
    resume_embeddings_2d = np.array(resume_embeddings)
    
    similarities = cosine_similarity(jd_embedding_2d, resume_embeddings_2d)[0]
    
    # Find best match
    best_idx = np.argmax(similarities)
    best_score = float(similarities[best_idx])
    
    if best_score >= threshold:
        return valid_resume_skills[best_idx], best_score
    
    return None, 0.0

def batch_semantic_match(
    jd_skills: List[str],
    resume_skills: List[str],
    threshold: float = 0.7,
    use_cache: bool = True
) -> List[Tuple[Optional[str], float]]:
    """
    Batch process multiple JD skills for efficiency.
    
    Returns:
        List of (best_match, similarity_score) tuples for each JD skill
    """
    if not SEMANTIC_AVAILABLE:
        return [(None, 0.0) for _ in jd_skills]
    
    results = []
    for jd_skill in jd_skills:
        match, score = semantic_match(jd_skill, resume_skills, threshold, use_cache)
        results.append((match, score))
    
    return results

def clear_embedding_cache():
    """Clear the embedding cache (useful for memory management)."""
    global _embedding_cache
    _embedding_cache.clear()
    print("[INFO] Embedding cache cleared")

def get_cache_stats():
    """Get statistics about the embedding cache."""
    return {
        'cached_embeddings': len(_embedding_cache),
        'semantic_available': SEMANTIC_AVAILABLE
    }

