import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const QUIZ_TIME = 300; // 5 minutes
const STORAGE_KEY = "quiz_progress";

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);

  const violationCount = useRef(0);
  const hasSubmitted = useRef(false);

  const MAX_VIOLATIONS = 3;

  /* ---------------- FETCH QUESTIONS + RESTORE STATE ---------------- */
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/questions")
      .then((res) => {
        setQuestions(res.data);

        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setCurrent(data.current);
          setScore(data.score);
          setTimeLeft(data.timeLeft);
          violationCount.current = data.violations || 0;
        }
      })
      .catch((err) => console.error(err));
  }, []);

  /* ---------------- PERSIST STATE ---------------- */
  useEffect(() => {
    if (!quizFinished) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          current,
          score,
          timeLeft,
          violations: violationCount.current,
        })
      );
    }
  }, [current, score, timeLeft, quizFinished]);

  /* ---------------- SUBMIT SCORE (SAFE) ---------------- */
  const submitScore = async (finalScore) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/api/submit",
        { score: finalScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Score submit failed", err);
    }
  };

  /* ---------------- RESET QUIZ (REATTEMPT) ---------------- */
  const resetQuiz = () => {
    sessionStorage.removeItem(STORAGE_KEY);

    violationCount.current = 0;
    hasSubmitted.current = false;

    setCurrent(0);
    setScore(0);
    setSelected("");
    setShowAnswer(false);
    setQuizFinished(false);
    setTimeLeft(QUIZ_TIME);
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (quizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⏰ Time is up! Quiz auto-submitted.");
          submitScore(score);
          sessionStorage.removeItem(STORAGE_KEY);
          setQuizFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizFinished, score]);

  /* ---------------- ANTI-CHEATING ---------------- */
  useEffect(() => {
    if (quizFinished) return;

    const registerViolation = (reason) => {
      violationCount.current += 1;

      alert(
        `⚠️ ${reason}\nViolation ${violationCount.current}/${MAX_VIOLATIONS}`
      );

      if (violationCount.current >= MAX_VIOLATIONS) {
        alert("❌ Quiz terminated due to suspicious activity.");
        submitScore(score);
        sessionStorage.removeItem(STORAGE_KEY);
        setQuizFinished(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) registerViolation("Tab switch detected");
    };

    const handleBlur = () => {
      registerViolation("Window focus lost");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const detectDevTools = setInterval(() => {
      if (
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160
      ) {
        registerViolation("Developer tools detected");
      }
    }, 1000);

    const blockActions = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", blockActions);
    document.addEventListener("copy", blockActions);
    document.addEventListener("cut", blockActions);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", blockActions);
      document.removeEventListener("copy", blockActions);
      document.removeEventListener("cut", blockActions);
      clearInterval(detectDevTools);
    };
  }, [quizFinished, score]);

  /* ---------------- ANSWER HANDLING ---------------- */
  const handleAnswer = (option) => {
    if (showAnswer || quizFinished) return;

    setSelected(option);
    setShowAnswer(true);

    if (option === questions[current].answer) {
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
      sessionStorage.removeItem(STORAGE_KEY);
      setQuizFinished(true);
    }
  };

  /* ---------------- TIME FORMAT ---------------- */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ---------------- UI ---------------- */
  if (questions.length === 0)
    return <img src="/Loading.gif" className="m-auto mt-20 h-20" alt="Loading" />;

  if (quizFinished)
    return (
      <div className="quiz-container">
        <h2>Quiz Finished</h2>
        <h3>
          Your Score: {score}/{questions.length}
        </h3>
        <p className="text-red-400 mt-2">
          Violations: {violationCount.current}/{MAX_VIOLATIONS}
        </p>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={resetQuiz}
        >
          🔁 Reattempt Quiz
        </button>
      </div>
    );

  const currentQuestion = questions[current];

  return (
    <div className="quiz-container">
      <div className="timer">
        ⏱ Time Left: <strong>{formatTime(timeLeft)}</strong>
      </div>

      <h2>
        Q{current + 1}. {currentQuestion.question}
      </h2>

      <ul>
        {currentQuestion.options.map((opt, i) => (
          <li
            key={i}
            className={`option 
              ${selected === opt
                ? opt === currentQuestion.answer
                  ? "correct"
                  : "wrong"
                : ""}
              ${showAnswer && opt === currentQuestion.answer ? "highlight" : ""}
            `}
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </li>
        ))}
      </ul>

      {showAnswer && (
        <button onClick={nextQuestion}>
          {current < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
};

export default QuizApp;
