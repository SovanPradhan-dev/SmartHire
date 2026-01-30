from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .skill_extractor import extract_skills


def calculate_similarity(resume, jd):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume, jd])
    score = cosine_similarity(vectors)[0][1]
    return round(float(score * 100), 2)


def analyze_match(resume_text, jd_text):
    resume_skills = set(extract_skills(resume_text))
    jd_skills = set(extract_skills(jd_text))

    matched_skills = sorted(resume_skills & jd_skills)
    missing_skills = sorted(jd_skills - resume_skills)

    # Skill score (PRIMARY)
    skill_match_percent = (
        (len(matched_skills) / len(jd_skills)) * 100
        if jd_skills else 0
    )

    # Text similarity (SECONDARY)
    similarity_score = calculate_similarity(resume_text, jd_text)

    # Weighted final score (ATS-like)
    final_score = round(
        (0.7 * skill_match_percent) + (0.3 * similarity_score),
        2
    )

    eligible = final_score >= 70

    feedback = (
        "Strong match for this role."
        if eligible
        else "Improve missing skills to increase match score."
    )

    return {
        "similarity_score": final_score,
        "score": final_score,
        "skill_match_percent": round(skill_match_percent, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "eligible": eligible,
        "feedback": feedback
    }
