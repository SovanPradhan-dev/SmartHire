import Editor from "@monaco-editor/react";
import axios from "axios";
import { useState, useEffect } from "react";

const Compiler = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState("");

  // Array Questions
  const questions = [
    "Find the largest element in an array",
    "Find the smallest element in an array",
    "Find the second largest element in an array",
    "Find the second smallest element in an array",
    "Find sum of all elements in an array",
    "Find average of array elements",
    "Count even and odd numbers in an array",
    "Find maximum and minimum element",
    "Reverse an array",
    "Print array elements in reverse order",
    "Check if array is sorted or not",
    "Copy one array into another",
    "Merge two arrays",
    "Find frequency of each element in an array",
    "Count occurrences of a given number",
    "Find duplicate elements in an array",
    "Remove duplicates from array",
    "Find missing number in array",
    "Find common elements in two arrays",
    "Find intersection of two arrays"
  ];

  // Get Random Question
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setRandomQuestion(questions[randomIndex]);
  };

  // Load one random question on page load
  useEffect(() => {
    getRandomQuestion();
  }, []);

  const runCode = () => {
    setLoading(true);

    axios
      .post("http://localhost:3000/code/run", {
        code,
        language,
        input: "5\n10",
      })
      .then((res) => {
        setOutput(res.data.output);
      })
      .catch(() => {
        setOutput("❌ Execution failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div
        className="w-full max-w-5xl bg-[#0d0d0d]/70 backdrop-blur-xl 
        border border-cyan-500/20 rounded-2xl p-6
        shadow-[0_0_40px_rgba(0,255,255,0.08)]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1
            className="text-xl font-bold 
            bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 
            bg-clip-text text-transparent"
          >
            ⚡ Online Compiler
          </h1>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black border border-gray-700 px-3 py-1 rounded text-sm
            focus:outline-none focus:border-cyan-400"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {/* Random Question Box */}
        <div className="mb-5 p-4 rounded-xl border border-purple-500/30 bg-black/40">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-gray-400 text-sm">
                Random DSA Question
              </p>

              <h2 className="text-lg text-cyan-300 font-medium mt-1">
                {randomQuestion}
              </h2>
            </div>

            <button
              onClick={getRandomQuestion}
              className="px-4 py-2 rounded-lg font-semibold
              bg-gradient-to-r from-pink-500 to-purple-500
              hover:opacity-90 transition"
            >
              🎲 Random
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-lg overflow-hidden border border-gray-800">
          <Editor
            height="350px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={runCode}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold
            bg-gradient-to-r from-cyan-500 to-purple-500
            hover:opacity-90 transition
            shadow-[0_0_20px_rgba(0,255,255,0.3)]
            disabled:opacity-50"
          >
            {loading ? "Running..." : "▶ Run Code"}
          </button>
        </div>

        {/* Output */}
        <div className="mt-6">
          <h2 className="text-sm text-gray-400 mb-2">
            Output
          </h2>

          <pre
            className="bg-black/80 border border-gray-800 
            rounded-lg p-4 h-56 overflow-auto text-green-400
            shadow-inner"
          >
            {loading ? (
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Running code...
              </div>
            ) : (
              output || "Run your code to see output..."
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Compiler;