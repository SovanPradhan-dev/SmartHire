import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/");
    return null;
  }

  const score = Math.round(state.score || 0);
  const PASS_SCORE = 50;
  const canProceed = score >= PASS_SCORE;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-[900px] bg-black border border-gray-700 rounded-2xl p-8 shadow-lg">

        {/* Header */}
        <h2 className="text-white text-2xl font-semibold text-center mb-2">
          Resume Screening Result
        </h2>
        <p className="text-gray-400 text-center mb-8">
          AI-based CV–JD matching analysis
        </p>

        {/* Score */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <svg width="160" height="160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#1f2937"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={canProceed ? "#22c55e" : "#ef4444"}
                strokeWidth="12"
                fill="none"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
              {score}%
            </div>
          </div>
          <p className="text-gray-400 mt-2">Overall Match Score</p>
        </div>

        {/* Feedback */}
        <div
          className={`text-center p-4 rounded border mb-8 ${
            canProceed
              ? "bg-green-900/20 border-green-600 text-green-400"
              : "bg-red-900/20 border-red-600 text-red-400"
          }`}
        >
          {state.feedback}
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Matched */}
          <div className="border border-gray-700 rounded p-4">
            <h3 className="text-green-400 font-medium mb-3">
              ✅ Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {state.matched_skills?.length ? (
                state.matched_skills.map((s) => (
                  <span
                    key={s}
                    className="bg-green-800/30 text-green-300 px-3 py-1 rounded text-sm"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No matched skills</p>
              )}
            </div>
          </div>

          {/* Missing */}
          <div className="border border-gray-700 rounded p-4">
            <h3 className="text-red-400 font-medium mb-3">
              ❌ Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {state.missing_skills?.length ? (
                state.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="bg-red-800/30 text-red-300 px-3 py-1 rounded text-sm"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No missing skills 🎉</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-full md:w-auto border border-gray-600 text-gray-300 px-6 py-2 rounded hover:bg-gray-800"
          >
            ← Back
          </button>

          {canProceed ? (
            <button
              onClick={() => navigate("/quiz")}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
            >
              Proceed to Interview →
            </button>
          ) : (
            <p className="text-red-400 text-sm">
              Score below {PASS_SCORE}%. You cannot proceed to the next round.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ResultPage;
