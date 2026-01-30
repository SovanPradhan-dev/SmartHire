const About = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-20">

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          About <span className="text-green-400">SmartHire</span>
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed">
          SmartHire is an AI-powered hiring and assessment platform designed to
          make recruitment fair, efficient, and skill-focused.
          <br /><br />
          We eliminate resume bias by matching CVs with job descriptions
          algorithmically and validating skills through secure online tests.
        </p>
      </div>

      <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "🎯 Our Mission", text: "Hire based on skills, not shortcuts." },
          { title: "🧠 Our Vision", text: "Fair and transparent hiring for everyone." },
          { title: "⚙️ Our Tech", text: "AI + NLP + Secure Assessment Systems." },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-gray-700 rounded-xl p-6
                       hover:border-green-500
                       hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]
                       transition"
          >
            <h3 className="text-xl font-semibold text-green-400 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-400">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
