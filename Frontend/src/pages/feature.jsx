const Features = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-20">

      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold">
          Platform <span className="text-green-400">Features</span>
        </h1>
        <p className="text-gray-400 mt-4">
          Everything you need for modern, AI-driven hiring
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {[
          {
            title: "CV–JD Matching",
            desc: "Uses NLP to calculate match score before allowing the quiz."
          },
          {
            title: "Secure Quiz System",
            desc: "One attempt per user with tab-switch & dev-tools protection."
          },
          {
            title: "Automated Scoring",
            desc: "Instant evaluation with leaderboard support."
          },
          {
            title: "Candidate Filtering",
            desc: "Only qualified candidates proceed to next round."
          },
          {
            title: "Admin Dashboard",
            desc: "Manage questions, users, and results."
          },
          {
            title: "Modern UI/UX",
            desc: "Dark neon interface for professional experience."
          }
        ].map((f) => (
          <div
            key={f.title}
            className="bg-black border border-gray-700 rounded-xl p-6
                       hover:border-green-500
                       hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]
                       transition"
          >
            <h3 className="text-xl font-semibold text-green-400 mb-3">
              {f.title}
            </h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Features;
