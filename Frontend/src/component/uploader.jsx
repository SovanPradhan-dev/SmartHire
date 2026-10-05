import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchCVJD } from "../services/api";

function UploadPage() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async () => {
    if (!resumeText && !resumeFile) {
      alert("Upload or paste Resume first");
      return;
    }
    if (!jdText && !jdFile) {
      alert("Upload or paste Job Description first");
      return;
    }

    const formData = new FormData();
    formData.append("resume_text", resumeText);
    formData.append("jd_text", jdText);
    if (resumeFile) formData.append("resume", resumeFile);
    if (jdFile) formData.append("jd", jdFile);

    try {
      setLoading(true);
      const res = await matchCVJD(formData);
      navigate("/result", { state: res.data });
    } catch (err) {
      alert("Error matching CV and JD");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">

      {/* Glass Card */}
      <div className="w-full max-w-5xl bg-[#0d0d0d]/70 backdrop-blur-xl 
        border border-cyan-500/20 rounded-2xl p-8 
        shadow-[0_0_50px_rgba(0,255,255,0.08)]">

        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2 
          bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 
          bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          ⚡ Smart CV Matcher
        </h2>

        <p className="text-gray-400 text-center mb-8">
          AI-powered resume screening before interviews
        </p>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Resume Section */}
          <div className="space-y-4">
            <h3 className="text-cyan-400 font-semibold tracking-wide">
              📄 Resume
            </h3>

            <textarea
              rows="6"
              placeholder="Paste resume text..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-black/60 text-white border border-cyan-500/20 
              rounded-lg p-3 focus:outline-none 
              focus:ring-2 focus:ring-cyan-500 
              focus:shadow-[0_0_10px_rgba(0,255,255,0.4)] transition"
            />

            <label className="block cursor-pointer text-center 
              bg-black/50 border border-dashed border-cyan-500/30 
              rounded-lg p-4 text-gray-400 
              hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] 
              transition">
              
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                onChange={(e) => setResumeFile(e.target.files[0])}
              />

              {resumeFile ? (
                <span className="text-cyan-300">✔ {resumeFile.name}</span>
              ) : (
                "Click to upload resume"
              )}
            </label>
          </div>

          {/* JD Section */}
          <div className="space-y-4">
            <h3 className="text-purple-400 font-semibold tracking-wide">
              📋 Job Description
            </h3>

            <textarea
              rows="6"
              placeholder="Paste job description..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full bg-black/60 text-white border border-purple-500/20 
              rounded-lg p-3 focus:outline-none 
              focus:ring-2 focus:ring-purple-500 
              focus:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition"
            />

            <label className="block cursor-pointer text-center 
              bg-black/50 border border-dashed border-purple-500/30 
              rounded-lg p-4 text-gray-400 
              hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] 
              transition">
              
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                onChange={(e) => setJdFile(e.target.files[0])}
              />

              {jdFile ? (
                <span className="text-purple-300">✔ {jdFile.name}</span>
              ) : (
                "Click to upload JD"
              )}
            </label>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={submitHandler}
          disabled={loading}
          className="mt-10 w-full py-3 rounded-lg font-semibold 
          bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 
          hover:opacity-90 transition 
          shadow-[0_0_20px_rgba(0,255,255,0.4)] 
          disabled:opacity-50"
        >
          {loading ? "⚡ Analyzing..." : "Match CV & JD"}
        </button>
      </div>
    </div>
  );
}

export default UploadPage;