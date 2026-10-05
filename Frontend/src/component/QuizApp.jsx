import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const QUIZ_TIME = 150;
const MAX_VIOLATIONS = 3;

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);

  const violationCount = useRef(0);
  const hasSubmitted = useRef(false);

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    axios
      .get("http://localhost:3000/api/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setQuestions(res.data))
      .catch((err) =>
        console.error("API Error:", err.response?.data || err.message)
      );
  }, []);

  /* ---------------- START QUIZ ---------------- */
  const startQuiz = () => {
    setQuizStarted(true);
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!quizStarted || quizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitScore(score);
          setQuizFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, score]);

  /* ---------------- SUBMIT SCORE ---------------- */
  const submitScore = async (finalScore) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/api/submit",
        { score: finalScore },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  /* ---------------- ANTI CHEAT ---------------- */
  useEffect(() => {
    if (!quizStarted || quizFinished) return;

    const registerViolation = (reason) => {
      violationCount.current += 1;

      alert(
        `⚠️ ${reason}\nViolation ${violationCount.current}/${MAX_VIOLATIONS}`
      );

      if (violationCount.current >= MAX_VIOLATIONS) {
        submitScore(score);
        setQuizFinished(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) registerViolation("Tab switch detected");
    };

    const handleBlur = () => {
      registerViolation("Window focus lost");
    };

    const detectDevTools = setInterval(() => {
      if (
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160
      ) {
        registerViolation("DevTools detected");
      }
    }, 1000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      clearInterval(detectDevTools);
    };
  }, [quizStarted, quizFinished, score]);

  /* ---------------- ANSWER ---------------- */
  const handleAnswer = (opt) => {
    if (showAnswer || quizFinished) return;

    setSelected(opt);
    setShowAnswer(true);

    if (opt === questions[current].answer) {
      setScore((prev) => prev + 1);
    }
  };

  /* ---------------- NEXT QUESTION ---------------- */
  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected("");
      setShowAnswer(false);
    } else {
      submitScore(score);
      setQuizFinished(true);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (questions.length === 0) {
    return (
      <p className="text-black text-center mt-20">Loading questions...</p>
    );
  }

  /* ---------------- START SCREEN ---------------- */
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="p-8 border border-cyan-500 text-center rounded-xl">
          <h1 className="text-3xl mb-4 text-cyan-400">Quiz Challenge</h1>
          <p className="mb-6 text-gray-400">
            ⏱ {QUIZ_TIME}s | ⚠ Max Violations: {MAX_VIOLATIONS}
          </p>

          <button
            onClick={startQuiz}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- FINISHED ---------------- */
  if (quizFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-center">
        <div>
          <h2 className="text-2xl mb-4">Quiz Finished</h2>
          <p>
            Score: {score}/{questions.length}
          </p>
          <p className="text-red-400 mt-2">
            Violations: {violationCount.current}/{MAX_VIOLATIONS}
          </p>
        </div>
      </div>
    );
  }

  const q = questions[current];

  /* ---------------- QUIZ UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-2xl border border-purple-500 p-6 rounded-xl">

        <div className="flex justify-between mb-4">
          <span>
            Q {current + 1}/{questions.length}
          </span>
          <span className="text-cyan-400">⏱ {timeLeft}s</span>
        </div>

        <h2 className="mb-6">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`p-3 border rounded cursor-pointer ${
                selected === opt ? "border-green-400" : "border-gray-700"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>

        {showAnswer && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full py-2 bg-purple-600 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizApp;