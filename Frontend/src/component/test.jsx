import React, { useState, useEffect } from "react";

const questionsData = [
  {
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    answer: "JavaScript",
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Central Style Sheets",
      "Cascading Style Sheets",
      "Cascading Simple Sheets",
      "Cars SUVs Sailboats",
    ],
    answer: "Cascading Style Sheets",
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hypertext Markup Language",
      "Hyperloop Machine Language",
      "HyperText Markdown Language",
      "Hyperlink Markup Language",
    ],
    answer: "Hypertext Markup Language",
  },
  {
    question: "What year was JavaScript launched?",
    options: ["1996", "1995", "1994", "None of the above"],
    answer: "1995",
  },
  // 👉 Add more questions here (up to 200+)
];

function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffle and pick 30 random questions
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 30));
  }, []);

  const handleSelect = (option) => setSelected(option);

  const handleNext = () => {
    if (selected === questions[current].answer) setScore(score + 1);
    setSelected("");
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 30));
    setScore(0);
    setSelected("");
    setCurrent(0);
    setIsFinished(false);
  };

  if (questions.length === 0) return <div className="text-center mt-10">Loading quiz...</div>;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">🎉 Quiz Finished!</h1>
        <p className="text-xl mb-4">
          Your Score: <span className="font-bold">{score}</span> / {questions.length}
        </p>
        <button
          onClick={handleRestart}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6  w-full max-w-2xl">
        <h2 className="text-lg font-medium text-gray-500 mb-2">
          Question {current + 1} of {questions.length}
        </h2>
        <h1 className="text-2xl font-bold mb-4">{questions[current].question}</h1>

        <div className="space-y-3">
          {questions[current].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-2 rounded-lg border ${
                selected === option
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              } transition`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">Score: {score}</p>
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`px-6 py-2 rounded-lg text-white transition ${
              selected ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {current + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizApp;