from flask import Blueprint, request, jsonify
from app.utils.text_extractor import extract_text
from app.utils.preprocess import clean_text
from app.ml.matcher import analyze_match

match_bp = Blueprint("match", __name__)

@match_bp.route("/match", methods=["POST"])
def match_cv_jd():
    print("🔥 MATCH API CALLED")

    try:
        resume_text = request.form.get("resume_text", "")
        jd_text = request.form.get("jd_text", "")

        resume_file = request.files.get("resume")
        jd_file = request.files.get("jd")

        print("📄 Resume file:", resume_file)
        print("📄 JD file:", jd_file)

        if resume_file:
            resume_text = extract_text(resume_file)
        if jd_file:
            jd_text = extract_text(jd_file)

        print("📝 Resume text length:", len(resume_text))
        print("📝 JD text length:", len(jd_text))

        if not resume_text.strip() or not jd_text.strip():
            return jsonify({"error": "Empty resume or JD text"}), 400

        resume_clean = clean_text(resume_text)
        jd_clean = clean_text(jd_text)

        result = analyze_match(resume_clean, jd_clean)

        return jsonify({
    "similarity_score": result["similarity_score"],
    "score": result["similarity_score"],
    "skill_match_percent": result["skill_match_percent"],
    "matched_skills": result["matched_skills"],
    "missing_skills": result["missing_skills"],
    "eligible": result["eligible"],
    "feedback": result["feedback"],
})


    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
