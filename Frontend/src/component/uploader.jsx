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
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-[900px] bg-black border border-gray-700 rounded-2xl p-8 shadow-lg">

        {/* Header */}
        <h2 className="text-white text-2xl font-semibold text-center mb-2">
          Smart CV – JD Matcher
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Resume screening before technical interview
        </p>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Resume */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-gray-200 font-medium">📄 Resume</h3>

            <textarea
              rows="6"
              placeholder="Paste resume text..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="bg-gray-900 text-white border border-gray-600 rounded p-3 focus:ring-2 focus:ring-blue-500"
            />

            <label className="cursor-pointer text-center bg-gray-900 border border-dashed border-gray-600 rounded p-3 text-gray-400 hover:border-blue-500">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              {resumeFile ? `✔ ${resumeFile.name}` : "Click to upload resume"}
            </label>
          </div>

          {/* JD */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-gray-200 font-medium">📋 Job Description</h3>

            <textarea
              rows="6"
              placeholder="Paste job description text..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="bg-gray-900 text-white border border-gray-600 rounded p-3 focus:ring-2 focus:ring-blue-500"
            />

            <label className="cursor-pointer text-center bg-gray-900 border border-dashed border-gray-600 rounded p-3 text-gray-400 hover:border-blue-500">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                onChange={(e) => setJdFile(e.target.files[0])}
              />
              {jdFile ? `✔ ${jdFile.name}` : "Click to upload JD"}
            </label>
          </div>

        </div>

        {/* Button */}
        <button
          onClick={submitHandler}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded font-medium"
        >
          {loading ? "Analyzing Resume..." : "Match CV & JD"}
        </button>

      </div>
    </div>
  );
}

export default UploadPage;
