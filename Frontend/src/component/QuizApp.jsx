import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Flag,
  RotateCcw,
  Play,
  Award,
  Target,
  AlertTriangle,
  ListChecks,
  Timer,
  CircleHelp,
  LayoutGrid,
  Maximize,
} from "lucide-react";

const QUIZ_TIME = 150;
const MAX_VIOLATIONS = 3;
const OPTION_LETTERS = ["A", "B", "C", "D"];

const formatTime = (s) => {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const getGrade = (pct) => {
  if (pct >= 90) return { label: "Outstanding", color: "text-green-400", ring: "#22c55e" };
  if (pct >= 70) return { label: "Strong Hire Signal", color: "text-green-400", ring: "#22c55e" };
  if (pct >= 50) return { label: "Needs Practice", color: "text-amber-400", ring: "#f59e0b" };
  return { label: "Keep Learning", color: "text-red-400", ring: "#ef4444" };
};

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finishReason, setFinishReason] = useState("completed"); // completed | time | violations | manual
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]); // selected option per index
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [violations, setViolations] = useState(0);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasSubmitted = useRef(false);
  const lastViolationAt = useRef(0);
  const startGraceUntil = useRef(0);
  const stateRef = useRef({ answers: [], questions: [] });
  stateRef.current = { answers, questions };

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setFetchError("Sign in required to load the quiz.");
      return;
    }
    setLoading(true);
    axios
      .get("http://localhost:3000/api/questions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null));
        if (data.length === 0) setFetchError("No questions available right now.");
      })
      .catch((err) => {
        console.error("API Error:", err.response?.data || err.message);
        setFetchError(
          err.response?.data?.message || "Could not load questions. Please retry."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const retryFetch = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFetchError("Sign in required to load the quiz.");
      return;
    }
    setLoading(true);
    setFetchError("");
    axios
      .get("http://localhost:3000/api/questions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null));
        if (data.length === 0) setFetchError("No questions available right now.");
      })
      .catch((err) =>
        setFetchError(
          err.response?.data?.message || "Could not load questions. Please retry."
        )
      )
      .finally(() => setLoading(false));
  };

  /* ---------------- DERIVED ---------------- */
  const correctCount = useMemo(() => {
    if (!questions.length) return 0;
    return questions.reduce(
      (acc, q, i) => acc + (answers[i] && answers[i] === q.answer ? 1 : 0),
      0
    );
  }, [questions, answers]);

  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null && a !== undefined).length,
    [answers]
  );

  const pct = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;
  const grade = getGrade(pct);
  const elapsed = QUIZ_TIME - timeLeft;
  const q = questions[current];

  const showToast = useCallback((title, desc, tone = "warn") => {
    setToast({ title, desc, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- SUBMIT ---------------- */
  const submitScore = useCallback(async (finalScore) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:3000/api/submit",
        { score: finalScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const finishQuiz = useCallback(
    (reason = "completed") => {
      if (hasSubmitted.current) {
        setQuizFinished(true);
        return;
      }
      const { answers: a, questions: qs } = stateRef.current;
      const finalScore = qs.reduce(
        (acc, item, i) => acc + (a[i] && a[i] === item.answer ? 1 : 0),
        0
      );
      setFinishReason(reason);
      setQuizFinished(true);
      submitScore(finalScore);
    },
    [submitScore]
  );

  const finishQuizRef = useRef(finishQuiz);
  finishQuizRef.current = finishQuiz;

  /* ---------------- START ---------------- */
  const startQuiz = () => {
    if (!questions.length) return;
    hasSubmitted.current = false;
    startGraceUntil.current = Date.now() + 1500;
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrent(0);
    setTimeLeft(QUIZ_TIME);
    setViolations(0);
    // request fullscreen is optional — don't force, just offer via button
  };

  const resetQuiz = () => {
    hasSubmitted.current = false;
    setAnswers(new Array(questions.length).fill(null));
    setCurrent(0);
    setTimeLeft(QUIZ_TIME);
    setViolations(0);
    setQuizFinished(false);
    setQuizStarted(false);
    setFinishReason("completed");
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!quizStarted || quizFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // defer so state settles
          setTimeout(() => finishQuizRef.current("time"), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished]);

  /* ---------------- ANTI CHEAT ---------------- */
  useEffect(() => {
    if (!quizStarted || quizFinished) return;

    const registerViolation = (reason, detail) => {
      const now = Date.now();
      if (now < startGraceUntil.current) return;
      if (now - lastViolationAt.current < 2500) return; // throttle bursts
      lastViolationAt.current = now;

      setViolations((prev) => {
        const next = prev + 1;
        showToast(
          `Violation ${next}/${MAX_VIOLATIONS}`,
          `${reason}${detail ? ` — ${detail}` : ""}`,
          next >= MAX_VIOLATIONS ? "danger" : "warn"
        );
        if (next >= MAX_VIOLATIONS) {
          setTimeout(() => finishQuizRef.current("violations"), 600);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) registerViolation("Tab switch detected", "Stay on this tab");
    };
    const handleBlur = () => registerViolation("Window focus lost", "Don't switch apps");
    const handleCopy = (e) => {
      e.preventDefault();
      registerViolation("Copy attempt blocked", "Copy is disabled during the quiz");
    };
    const handleContext = (e) => e.preventDefault();

    let devtoolsOpen = false;
    const detectDevTools = setInterval(() => {
      const wide =
        window.outerWidth - window.innerWidth > 200 ||
        window.outerHeight - window.innerHeight > 200;
      if (wide && !devtoolsOpen) {
        devtoolsOpen = true;
        registerViolation("DevTools detected", "Close developer tools");
        setTimeout(() => (devtoolsOpen = false), 8000);
      } else if (!wide) {
        devtoolsOpen = false;
      }
    }, 3000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContext);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContext);
      clearInterval(detectDevTools);
    };
  }, [quizStarted, quizFinished, showToast]);

  /* ---------------- ANSWER NAV ---------------- */
  const handleAnswer = (opt) => {
    if (quizFinished || answers[current] !== null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = opt;
      return next;
    });
  };

  const goTo = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrent(idx);
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((p) => p + 1);
    } else {
      finishQuiz("completed");
    }
  };

  /* ---------------- KEYBOARD ---------------- */
  useEffect(() => {
    if (!quizStarted || quizFinished) return;
    const onKey = (e) => {
      if (e.key >= "1" && e.key <= "4") {
        const idx = Number(e.key) - 1;
        const list = questions[current]?.options;
        if (list && list[idx]) handleAnswer(list[idx]);
      } else if (e.key === "Enter") {
        if (answers[current] !== null) nextQuestion();
      } else if (e.key === "ArrowRight") {
        goTo(current + 1);
      } else if (e.key === "ArrowLeft") {
        goTo(current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, quizFinished, current, answers, questions]);

  const timerTone =
    timeLeft <= 30
      ? "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.35)]"
      : timeLeft <= 60
      ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
      : "border-green-500/50 bg-green-500/10 text-green-300";

  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  /* ================= START SCREEN ================= */
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-[640px] h-[640px] bg-green-500/10 blur-[130px] rounded-full -mt-40" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Secure assessment · SmartHire</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Technical <span className="text-green-400">Quiz Challenge</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl leading-relaxed">
            Prove your skills in a timed, proctored quiz. Answer carefully —
            each question locks in once selected.
          </p>

          {/* stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Timer, label: "Total time", value: `${QUIZ_TIME}s · ${formatTime(QUIZ_TIME)}`, sub: "Auto-submits at 0:00" },
              { icon: ListChecks, label: "Questions", value: loading ? "…" : `${questions.length || 10} MCQs`, sub: "Single attempt each" },
              { icon: ShieldAlert, label: "Violations", value: `Max ${MAX_VIOLATIONS}`, sub: "Tab switch · blur · DevTools" },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="bg-black/60 border border-gray-800 rounded-xl p-5 hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] transition"
              >
                <Icon className="w-5 h-5 text-green-400 mb-3" />
                <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
                <p className="text-lg font-semibold mt-1">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* rules */}
          <div className="mt-6 bg-black/60 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <CircleHelp className="w-4 h-4 text-green-400" /> Before you begin
            </h2>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                "Stay on this tab — switching tabs or apps counts as a violation.",
                "Copy, right-click and DevTools are disabled during the quiz.",
                `3 violations auto-submit the quiz. Timer of ${formatTime(QUIZ_TIME)} cannot be paused.`,
                "Use keys 1–4 to answer, ← → to navigate, Enter for next.",
              ].map((r) => (
                <li key={r} className="flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* loading / error / CTA */}
          <div className="mt-6">
            {loading ? (
              <div className="bg-black/60 border border-gray-800 rounded-xl p-6 space-y-3 animate-pulse">
                <div className="h-3 bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-800 rounded w-5/6" />
                <p className="text-sm text-gray-500 !mt-4">Loading questions…</p>
              </div>
            ) : fetchError ? (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-300">Couldn't load the quiz</p>
                  <p className="text-sm text-red-300/70 mt-1">{fetchError}</p>
                  <button
                    onClick={retryFetch}
                    className="mt-3 px-4 py-2 text-sm rounded bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition"
                  >
                    Retry loading
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={startQuiz}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-green-600 hover:bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.5)] transition active:scale-[0.99]"
                >
                  <Play className="w-5 h-5" /> Start Quiz Now
                </button>
                <button
                  onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-300 transition text-sm"
                  title="Enter fullscreen for best experience"
                >
                  <Maximize className="w-4 h-4" /> Fullscreen
                </button>
              </div>
            )}
            {!loading && !fetchError && (
              <p className="text-xs text-gray-600 mt-3 text-center">
                {questions.length} questions loaded · Good luck!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================= RESULT SCREEN ================= */
  if (quizFinished) {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const dash = (pct / 100) * circumference;
    const reasonLabel =
      finishReason === "time"
        ? "Time expired — auto-submitted"
        : finishReason === "violations"
        ? "Auto-submitted — violation limit reached"
        : finishReason === "manual"
        ? "Submitted manually"
        : "All questions completed";

    return (
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-[640px] h-[640px] bg-green-500/10 blur-[130px] rounded-full -mt-40" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-12">
          <div className="bg-black/60 border border-gray-800 rounded-2xl p-8 md:p-10 text-center shadow-[0_0_40px_rgba(34,197,94,0.12)]">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 border border-gray-800 rounded-full px-4 py-1.5 mb-6">
              <Trophy className="w-3.5 h-3.5 text-green-400" /> {reasonLabel}
            </div>

            {/* score ring */}
            <div className="relative w-44 h-44 mx-auto">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r={radius} fill="none"
                  stroke={grade.ring} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{pct}%</span>
                <span className="text-sm text-gray-400">
                  {correctCount}/{questions.length} correct
                </span>
              </div>
            </div>

            <h2 className={`text-2xl font-bold mt-5 ${grade.color}`}>{grade.label}</h2>
            <p className="text-gray-400 text-sm mt-2">
              {submitting ? "Saving your score…" : "Score saved to your profile."}
            </p>

            {/* stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-left">
              {[
                { icon: Target, label: "Accuracy", value: `${pct}%` },
                { icon: CheckCircle2, label: "Correct", value: `${correctCount}/${questions.length}` },
                { icon: Clock, label: "Time used", value: formatTime(elapsed) },
                { icon: ShieldAlert, label: "Violations", value: `${violations}/${MAX_VIOLATIONS}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                  <Icon className="w-4 h-4 text-green-400 mb-2" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={resetQuiz}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-semibold shadow-[0_0_20px_rgba(34,197,94,0.4)] transition"
              >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
              <button
                onClick={() => (window.location.href = "/interviewer")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-700 hover:border-green-500 hover:text-green-300 transition"
              >
                <Award className="w-4 h-4" /> View Leaderboard
              </button>
            </div>
          </div>

          {/* review */}
          <div className="mt-8">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ListChecks className="w-4 h-4 text-green-400" /> Answer review
            </h3>
            <div className="space-y-3">
              {questions.map((item, i) => {
                const userAns = answers[i];
                const isCorrect = userAns === item.answer;
                return (
                  <div
                    key={i}
                    className={`bg-black/60 border rounded-xl p-5 ${
                      isCorrect ? "border-green-500/30" : "border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrect ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-relaxed">{item.question}</p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                              isCorrect
                                ? "border-green-500/40 bg-green-500/10 text-green-300"
                                : "border-red-500/40 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Your answer: {userAns ?? "— skipped"}
                          </span>
                          {!isCorrect && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-300">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct: {item.answer}
                            </span>
                          )}
                        </div>
                        {item.explanation && (
                          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= QUIZ UI ================= */
  const selected = answers[current];
  const isAnswered = selected !== null && selected !== undefined;
  const answered = isAnswered;

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-green-500/10 blur-[120px] rounded-full -top-32" />
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 backdrop-blur shadow-2xl ${
              toast.tone === "danger"
                ? "bg-red-950/90 border-red-500/60"
                : "bg-amber-950/90 border-amber-500/50"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                toast.tone === "danger" ? "text-red-400" : "text-amber-400"
              }`}
            />
            <div>
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-xs text-gray-300 mt-0.5">{toast.desc}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* top bar */}
        <div className="flex flex-wrap items-center gap-3 justify-between bg-black/60 border border-gray-800 rounded-2xl px-4 md:px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-sm leading-none">SmartHire Quiz</p>
              <p className="text-xs text-gray-500 mt-1">
                Q {current + 1} of {questions.length} · {answeredCount} answered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* live score */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs border border-gray-700 rounded-full px-3 py-1.5 text-gray-300">
              <Target className="w-3.5 h-3.5 text-green-400" /> {correctCount} correct
            </span>
            {/* violations */}
            <span
              className="inline-flex items-center gap-1.5 text-xs border border-gray-700 rounded-full px-3 py-1.5"
              title={`${violations}/${MAX_VIOLATIONS} violations`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${violations > 0 ? "text-amber-400" : "text-gray-500"}`} />
              <span className="flex gap-1">
                {Array.from({ length: MAX_VIOLATIONS }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < violations ? "bg-red-500" : "bg-gray-700"}`}
                  />
                ))}
              </span>
            </span>
            {/* timer */}
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-mono font-semibold border rounded-full px-4 py-1.5 ${timerTone} ${timeLeft <= 30 ? "animate-pulse" : ""}`}
            >
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </span>
            <button
              onClick={() => finishQuiz("manual")}
              className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border border-red-500/50 text-red-300 hover:bg-red-500/15 transition"
            >
              <Flag className="w-3.5 h-3.5" /> End
            </button>
          </div>
        </div>

        {/* progress */}
        <div className="mt-4 h-1.5 bg-gray-800/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,197,94,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-5 mt-5 items-start">
          {/* question card */}
          <div className="bg-black/60 border border-gray-800 rounded-2xl p-6 md:p-8 backdrop-blur">
            {q ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {q.category && (
                    <span className="text-[11px] uppercase tracking-widest bg-green-500/10 border border-green-500/40 text-green-300 rounded-full px-3 py-1">
                      {q.category}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-widest bg-gray-800 border border-gray-700 text-gray-400 rounded-full px-3 py-1">
                    Question {current + 1}
                  </span>
                  {answered && (
                    <span
                      className={`text-[11px] uppercase tracking-widest rounded-full px-3 py-1 border ${
                        selected === q.answer
                          ? "bg-green-500/10 border-green-500/40 text-green-300"
                          : "bg-red-500/10 border-red-500/40 text-red-300"
                      }`}
                    >
                      {selected === q.answer ? "Correct +1" : "Incorrect"}
                    </span>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-semibold leading-relaxed">{q.question}</h2>
                <p className="text-xs text-gray-600 mt-2">Press 1–4 or tap an option · locks on select</p>

                <div className="space-y-3 mt-6" role="radiogroup" aria-label={`Question ${current + 1}`}>
                  {q.options.map((opt, i) => {
                    const isSelected = selected === opt;
                    const isCorrectOpt = opt === q.answer;
                    let cls =
                      "border-gray-700 bg-gray-900/40 hover:border-green-500/70 hover:bg-green-500/5 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                    let icon = (
                      <span className="w-8 h-8 rounded-lg border border-gray-700 bg-black/40 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                        {OPTION_LETTERS[i] ?? i + 1}
                      </span>
                    );

                    if (answered) {
                      if (isCorrectOpt) {
                        cls = "border-green-500 bg-green-500/10 shadow-[0_0_18px_rgba(34,197,94,0.25)]";
                        icon = (
                          <span className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </span>
                        );
                      } else if (isSelected) {
                        cls = "border-red-500 bg-red-500/10 shadow-[0_0_18px_rgba(239,68,68,0.2)]";
                        icon = (
                          <span className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
                            <XCircle className="w-4 h-4 text-white" />
                          </span>
                        );
                      } else {
                        cls = "border-gray-800 bg-gray-900/20 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={answered}
                        role="radio"
                        aria-checked={isSelected}
                        className={`w-full flex items-center gap-3.5 p-4 border rounded-xl text-left transition active:scale-[0.995] disabled:cursor-default ${cls}`}
                      >
                        {icon}
                        <span className="flex-1 text-sm md:text-[15px] leading-relaxed">{opt}</span>
                        <span className="text-[11px] text-gray-600 font-mono hidden sm:block">
                          [{i + 1}]
                        </span>
                      </button>
                    );
                  })}
                </div>

                {answered && q.explanation && (
                  <div className="mt-5 rounded-xl border border-green-500/25 bg-green-500/5 p-4 text-sm text-gray-300 leading-relaxed">
                    <span className="text-green-400 font-semibold">Why: </span>
                    {q.explanation}
                  </div>
                )}

                {/* nav */}
                <div className="flex items-center gap-3 mt-7">
                  <button
                    onClick={() => goTo(current - 1)}
                    disabled={current === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-300 hover:border-green-500 hover:text-green-300 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <div className="flex-1" />
                  {answered ? (
                    <button
                      onClick={nextQuestion}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 font-semibold text-sm shadow-[0_0_18px_rgba(34,197,94,0.4)] transition"
                    >
                      {current === questions.length - 1 ? (
                        <>
                          Submit Quiz <Flag className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next Question <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">Select an answer to continue</span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-16">No question to display.</p>
            )}
          </div>

          {/* palette sidebar */}
          <aside className="bg-black/60 border border-gray-800 rounded-2xl p-5 backdrop-blur lg:sticky lg:top-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-1">
              <LayoutGrid className="w-4 h-4 text-green-400" /> Navigator
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {answeredCount}/{questions.length} answered · click to jump
            </p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((item, i) => {
                const a = answers[i];
                const isCur = i === current;
                let cls = "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500";
                if (a !== null && a !== undefined) {
                  cls =
                    a === item.answer
                      ? "border-green-500/70 bg-green-500/15 text-green-300"
                      : "border-red-500/60 bg-red-500/10 text-red-300";
                }
                if (isCur) cls += " ring-2 ring-green-400 ring-offset-2 ring-offset-black";
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to question ${i + 1}`}
                    className={`aspect-square rounded-lg border text-sm font-semibold transition ${cls}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-green-500/70" /> Correct
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500/70" /> Wrong
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-gray-700" /> Unanswered
              </span>
            </div>

            <div className="border-t border-gray-800 mt-4 pt-4 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)} remaining
              </p>
              <p className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> {violations}/{MAX_VIOLATIONS} violations
              </p>
            </div>

            <button
              onClick={() => finishQuiz("manual")}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/50 text-green-300 text-sm font-medium hover:bg-green-500/10 transition"
            >
              <Flag className="w-4 h-4" /> Submit Early
            </button>
          </aside>
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-6">
          Proctored session · Do not switch tabs · Shortcuts: 1–4 answer · ← → navigate · Enter next
        </p>
      </div>
    </div>
  );
};

export default QuizApp;
