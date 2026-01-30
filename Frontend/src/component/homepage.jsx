import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 relative overflow-hidden">

        {/* Neon Glow Background */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full"></div>
        </div>

        {/* Content */}
        <h1 className="relative text-4xl md:text-6xl font-bold mb-6">
          Smart<span className="text-green-400">Hire</span>
        </h1>

        <p className="relative text-gray-300 max-w-2xl text-lg mb-10">
          AI-powered interview platform that screens resumes, evaluates skills,
          and ensures fair technical assessments.
        </p>

        {/* CTA Buttons */}
        <div className="relative flex gap-6">
          <button
            onClick={() => {
              if (localStorage.getItem("token")) {
                navigate("/interview");
              } else {
                navigate("/signin");
              }
            }}
            className="
              px-8 py-3 rounded font-semibold
              bg-green-600 hover:bg-green-700
              shadow-[0_0_25px_rgba(34,197,94,0.8)]
              transition
            "
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/about")}
            className="
              px-8 py-3 rounded font-semibold
              border border-green-500 text-green-400
              hover:bg-green-500/10
              shadow-[0_0_15px_rgba(34,197,94,0.5)]
              transition
            "
          >
            Learn More
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">

        {[
          {
            title: "AI Resume Screening",
            desc: "Matches CV with job description using NLP before assessment."
          },
          {
            title: "Secure Online Quiz",
            desc: "Timed, single-attempt quiz with anti-cheating protection."
          },
          {
            title: "Smart Evaluation",
            desc: "Automatic scoring, feedback, and candidate shortlisting."
          }
        ].map((item) => (
          <div
            key={item.title}
            className="
              bg-black border border-gray-700 rounded-xl p-6
              hover:border-green-500
              hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]
              transition
            "
          >
            <h3 className="text-xl font-semibold text-green-400 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-400">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-500">
        © 2025 SmartHire · AI Interview Platform
      </footer>
    </div>
  );
};

export default LandingPage;
