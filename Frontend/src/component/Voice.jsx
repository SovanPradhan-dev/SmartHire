import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const MAX_TIME = 30;
const SILENCE_TIMEOUT = 2500;

export default function InterviewAutoVoice() {
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [answers, setAnswers] = useState([]);
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [finished, setFinished] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  /* ---------------- FETCH QUESTIONS ---------------- */
  useEffect(() => {
    axios
      .get("http://localhost:3000/inter/getques")
      .then((res) => setQuestions(res.data))
      .catch((err) => console.log(err));
  }, []);

  /* ---------------- SPEECH RECOGNITION SETUP ---------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }

      setTranscript(text);

      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(stopRecording, SILENCE_TIMEOUT);
    };

    recognitionRef.current = recognition;
  }, []);

  /* ---------------- WEBCAM ---------------- */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {});
  }, []);

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speakQuestion = (text) => {
    if (!text) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  /* ---------------- START TEST ---------------- */
  const startTest = () => {
    setStarted(true);
    setCurrent(0);
    setAnswers([]);
    setFinished(false);
  };

  /* ---------------- AUTO QUESTION FLOW (ONLY AFTER START) ---------------- */
  useEffect(() => {
    if (!started || finished || questions.length === 0) return;

    speakQuestion(questions[current]?.question);
    startRecording();

    return stopRecording;
  }, [current, started, questions]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!listening) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopRecording();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [listening]);

  /* ---------------- RECORDING ---------------- */
  const startRecording = () => {
    if (!recognitionRef.current) return;

    setTranscript("");
    setTimeLeft(MAX_TIME);
    setListening(true);

    try {
      recognitionRef.current.start();
    } catch {}
  };

  const stopRecording = () => {
    setListening(false);

    try {
      recognitionRef.current.stop();
    } catch {}

    clearTimeout(silenceTimer.current);
    clearInterval(intervalRef.current);
  };

  /* ---------------- SUBMIT ANSWER ---------------- */
  const submitAnswer = async () => {
    const currentQ = questions[current];
    if (!currentQ) return;

    try {
      const res = await axios.post("http://localhost:3000/inter/evaluate", {
        questionId: currentQ._id,
        answer: transcript.trim() || "No answer",
      });

      const result = res.data.data;

      const newAnswers = [
        ...answers,
        {
          question: currentQ.question,
          answer: transcript,
          score: result.score,
          feedback: result.feedback,
        },
      ];

      setAnswers(newAnswers);

      if (current === questions.length - 1) {
        setFinished(true);
      } else {
        setCurrent((prev) => prev + 1);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- SKIP ---------------- */
  const skipQuestion = () => {
    const currentQ = questions[current];
    if (!currentQ) return;

    const newAnswers = [
      ...answers,
      {
        question: currentQ.question,
        answer: "Skipped",
        score: 0,
        feedback: "Skipped",
      },
    ];

    setAnswers(newAnswers);

    if (current === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (!questions || questions.length === 0) {
    return <div className="text-white p-10">Loading questions...</div>;
  }

  /* ---------------- START SCREEN ---------------- */
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-xl w-full p-8 border border-cyan-500 text-center">

          <h1 className="text-3xl mb-4 text-cyan-400">
            🎤 AI Interview Test
          </h1>

          <p className="text-gray-400 mb-6">
            You will be asked questions and must answer using your voice.
          </p>

          <div className="text-sm text-gray-400 mb-6 space-y-2">
            <p>⏱ Time per question: {MAX_TIME}s</p>
            <p>🎥 Webcam monitoring enabled</p>
            <p>🎙 Voice recognition enabled</p>
          </div>

          <button
            onClick={startTest}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded"
          >
            🚀 Start Test
          </button>

        </div>
      </div>
    );
  }

  /* ---------------- FINISHED ---------------- */
  if (finished) {
    const totalScore = answers.reduce((acc, a) => acc + (a.score || 0), 0);

    const token = localStorage.getItem("token");

    try {
      axios.patch(
        "http://localhost:3000/inter/submit",
        { score: totalScore },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error submitting score:", error);
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-cyan-300 p-6">
        <div className="max-w-2xl w-full p-8 border border-cyan-500">
          <h1 className="text-3xl mb-4">Interview Completed 🚀</h1>

          <h2 className="text-xl mb-4">Total Score: {totalScore}</h2>

          <pre className="bg-black p-4 border overflow-auto">
            {JSON.stringify(answers, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-xl w-full p-6 border border-cyan-400">

        {/* Webcam */}
        <video ref={videoRef} autoPlay muted className="w-40 mb-4" />

        {/* Progress */}
        <div className="w-full bg-gray-800 h-2 mb-4">
          <div
            className="h-2 bg-cyan-400"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <h2 className="text-xl mb-4">
          {questions[current]?.question}
        </h2>

        {/* Status */}
        <div className="flex justify-between mb-2">
          <span>{listening ? "Recording..." : "Stopped"}</span>
          <span>{timeLeft}s</span>
        </div>

        {/* Transcript */}
        <div className="border p-3 mb-4 min-h-[80px]">
          {transcript || "Listening..."}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={submitAnswer} className="bg-green-500 px-4 py-2">
            Submit
          </button>

          <button onClick={skipQuestion} className="border px-4 py-2">
            Skip
          </button>

          <button
            onClick={() => (listening ? stopRecording() : startRecording())}
            className="bg-purple-500 px-4 py-2"
          >
            {listening ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}