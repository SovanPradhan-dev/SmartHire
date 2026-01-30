const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-20">

      <div className="max-w-xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold">
          Contact <span className="text-green-400">Us</span>
        </h1>
        <p className="text-gray-400 mt-4">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-black border border-gray-700 rounded-xl p-8
                      shadow-[0_0_30px_rgba(34,197,94,0.3)]">

        <form className="space-y-5">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2
                       focus:border-green-500 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2
                       focus:border-green-500 focus:outline-none"
          />

          <textarea
            rows="4"
            placeholder="Your Message"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2
                       focus:border-green-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded
                       shadow-[0_0_20px_rgba(34,197,94,0.7)] transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
