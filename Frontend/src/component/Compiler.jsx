import Editor from "@monaco-editor/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Braces,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Dices,
  Download,
  Eraser,
  FileCode2,
  Keyboard,
  Play,
  RotateCcw,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react";

/* ---------------------------------- config --------------------------------- */

const API_URL =
  import.meta.env.VITE_COMPILER_API || "http://localhost:3000/code/run";

const LANGUAGES = [
  {
    id: "python",
    label: "Python",
    version: "3.10",
    monaco: "python",
    ext: "py",
    dot: "bg-yellow-400",
    template: `# Write your solution here\ndef solve():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(sum(arr))\n\nif __name__ == "__main__":\n    solve()\n`,
  },
  {
    id: "cpp",
    label: "C++",
    version: "GCC 11",
    monaco: "cpp",
    ext: "cpp",
    dot: "bg-blue-400",
    template: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // Write your solution here\n    cout << "Hello, SmartHire!";\n    return 0;\n}\n`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    version: "Node 20",
    monaco: "javascript",
    ext: "js",
    dot: "bg-green-400",
    template: `// Write your solution here\nfunction solve() {\n  console.log("Hello, SmartHire!");\n}\n\nsolve();\n`,
  },
];

const QUESTION_BANK = [
  { title: "Find the largest element in an array", difficulty: "Easy", hint: "Track a max variable in one pass — O(n) time, O(1) space." },
  { title: "Find the smallest element in an array", difficulty: "Easy", hint: "Same idea as max, but track the minimum instead." },
  { title: "Find the second largest element in an array", difficulty: "Easy", hint: "Track first and second max carefully with duplicates." },
  { title: "Find the second smallest element in an array", difficulty: "Easy", hint: "Mirror the second-largest logic for minima." },
  { title: "Find sum of all elements in an array", difficulty: "Easy", hint: "Accumulate in a loop or use a built-in reducer." },
  { title: "Find average of array elements", difficulty: "Easy", hint: "Sum / count — watch out for integer division." },
  { title: "Count even and odd numbers in an array", difficulty: "Easy", hint: "Use % 2 and two counters." },
  { title: "Find maximum and minimum element", difficulty: "Easy", hint: "One traversal, two variables." },
  { title: "Reverse an array", difficulty: "Easy", hint: "Two pointers from both ends, swap in place." },
  { title: "Print array elements in reverse order", difficulty: "Easy", hint: "Iterate from n-1 down to 0." },
  { title: "Check if array is sorted or not", difficulty: "Easy", hint: "Compare each pair arr[i] <= arr[i+1]." },
  { title: "Copy one array into another", difficulty: "Easy", hint: "Allocate a new array and copy element-wise." },
  { title: "Merge two arrays", difficulty: "Easy", hint: "Two-pointer merge if sorted, else concatenate." },
  { title: "Find frequency of each element in an array", difficulty: "Medium", hint: "Hash map / dictionary counting pass." },
  { title: "Count occurrences of a given number", difficulty: "Easy", hint: "Linear scan with a counter." },
  { title: "Find duplicate elements in an array", difficulty: "Medium", hint: "Set for seen values, or sort + scan." },
  { title: "Remove duplicates from array", difficulty: "Medium", hint: "Sorted? Use two pointers. Unsorted? Use a set." },
  { title: "Find missing number in array", difficulty: "Medium", hint: "XOR trick or n*(n+1)/2 minus actual sum." },
  { title: "Find common elements in two arrays", difficulty: "Medium", hint: "Set intersection — O(n+m)." },
  { title: "Find intersection of two arrays", difficulty: "Medium", hint: "Sort + two pointers, or hash the smaller array." },
];

const difficultyStyles = {
  Easy: "bg-green-500/15 text-green-400 border-green-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

const loadPersisted = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
};

/* --------------------------------- component -------------------------------- */

const Compiler = () => {
  const [language, setLanguage] = useState(() =>
    loadPersisted("smarthire-compiler-lang", "python")
  );
  const [codeByLang, setCodeByLang] = useState(() => {
    const initial = {};
    for (const l of LANGUAGES) {
      initial[l.id] = loadPersisted(`smarthire-compiler-${l.id}`, l.template);
    }
    return initial;
  });
  const [stdin, setStdin] = useState(() =>
    loadPersisted("smarthire-compiler-stdin", "5\n1 2 3 4 5")
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | running | success | error
  const [execTime, setExecTime] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * QUESTION_BANK.length)
  );
  const [solvedCount, setSolvedCount] = useState(() =>
    Number(loadPersisted("smarthire-compiler-solved", 0))
  );

  const editorRef = useRef(null);
  const activeLang = useMemo(
    () => LANGUAGES.find((l) => l.id === language) || LANGUAGES[0],
    [language]
  );
  const code = codeByLang[language] || "";
  const question = QUESTION_BANK[questionIndex];
  const lineCount = code ? code.split("\n").length : 0;

  /* persist */
  useEffect(() => {
    try {
      localStorage.setItem("smarthire-compiler-lang", language);
    } catch { /* noop */ }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(`smarthire-compiler-${language}`, code);
    } catch { /* noop */ }
  }, [code, language]);

  useEffect(() => {
    try {
      localStorage.setItem("smarthire-compiler-stdin", stdin);
      localStorage.setItem("smarthire-compiler-solved", String(solvedCount));
    } catch { /* noop */ }
  }, [stdin, solvedCount]);

  /* ------------------------------- actions ---------------------------------- */

  const newQuestion = useCallback(() => {
    setQuestionIndex((prev) => {
      let next = Math.floor(Math.random() * QUESTION_BANK.length);
      if (QUESTION_BANK.length > 1) {
        while (next === prev) next = Math.floor(Math.random() * QUESTION_BANK.length);
      }
      return next;
    });
  }, []);

  const runCode = useCallback(async () => {
    if (status === "running" || !code.trim()) return;
    setStatus("running");
    setOutput("");
    setExecTime(null);
    const started = performance.now();
    try {
      const res = await axios.post(
        API_URL,
        { code, language, input: stdin },
        { timeout: 30000 }
      );
      const text =
        res.data?.output ?? res.data?.stdout ?? res.data?.stderr ?? "No output";
      setOutput(String(text));
      setStatus("success");
    } catch {
      setOutput(
        "Execution failed. Check that the backend is running and your API key is configured.\n\nPOST " +
          API_URL
      );
      setStatus("error");
    } finally {
      setExecTime(((performance.now() - started) / 1000).toFixed(2));
    }
  }, [code, language, stdin, status]);

  /* Ctrl/Cmd + Enter to run */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runCode]);

  const resetCode = () => {
    setCodeByLang((prev) => ({ ...prev, [language]: activeLang.template }));
  };

  const copyText = async (text, done) => {
    try {
      await navigator.clipboard.writeText(text);
      done(true);
      setTimeout(() => done(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution.${activeLang.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusMeta =
    status === "running"
      ? { dot: "bg-amber-400 animate-pulse", text: "Running…", pill: "border-amber-500/30 bg-amber-500/10 text-amber-300" }
      : status === "success"
        ? { dot: "bg-green-400", text: "Success", pill: "border-green-500/30 bg-green-500/10 text-green-300" }
        : status === "error"
          ? { dot: "bg-red-400", text: "Error", pill: "border-red-500/30 bg-red-500/10 text-red-300" }
          : { dot: "bg-gray-500", text: "Idle", pill: "border-white/10 bg-white/5 text-gray-400" };

  /* --------------------------------- render --------------------------------- */

  return (
    <div className="min-h-screen bg-[#06090b] text-gray-100">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-[0_0_24px_rgba(34,197,94,0.35)]">
              <SquareTerminal size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Online Compiler
              </h1>
              <p className="text-sm text-gray-400">
                Write, run &amp; practice DSA — Python, C++ and JavaScript
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusMeta.pill}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
              {statusMeta.text}
              {execTime && status !== "running" && (
                <span className="inline-flex items-center gap-1 text-gray-400">
                  · <Clock size={12} /> {execTime}s
                </span>
              )}
            </span>
            <button
              onClick={runCode}
              disabled={status === "running" || !code.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transition hover:bg-green-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {status === "running" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Running…
                </>
              ) : (
                <>
                  <Play size={16} strokeWidth={2.5} /> Run Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Language picker */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1114]/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => {
              const active = l.id === language;
              return (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "border-green-500/50 bg-green-500/10 text-white shadow-[0_0_16px_rgba(34,197,94,0.15)]"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                  {l.label}
                  <span className="text-[11px] font-normal text-gray-500">
                    {l.version}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5">
              <Braces size={13} />
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="cursor-pointer bg-transparent text-gray-300 outline-none [&>option]:bg-gray-900"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <ChevronDown size={13} className="text-gray-500" />
            </label>
            <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
              <button
                onClick={() => setFontSize((f) => Math.max(11, f - 1))}
                className="rounded px-1.5 font-bold hover:bg-white/10 hover:text-white"
                aria-label="Decrease font size"
              >
                −
              </button>
              <span className="min-w-[52px] text-center tabular-nums">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((f) => Math.min(22, f + 1))}
                className="rounded px-1.5 font-bold hover:bg-white/10 hover:text-white"
                aria-label="Increase font size"
              >
                +
              </button>
            </div>
            <span className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 md:inline-flex">
              <Keyboard size={13} /> Ctrl + Enter to run
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            {/* Challenge card */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1114]/80">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles size={15} className="text-green-400" />
                  Practice Challenge
                </div>
                <button
                  onClick={newQuestion}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-gray-300 transition hover:border-green-500/40 hover:text-green-300"
                >
                  <Dices size={13} /> Shuffle
                </button>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${difficultyStyles[question.difficulty]}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                    Arrays
                  </span>
                  <span className="ml-auto text-[11px] text-gray-500">
                    Solved this session: {solvedCount}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug text-white">
                  {question.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Write a program to {question.title.toLowerCase()} for input
                  read from stdin. Handle edge cases and print the result to
                  stdout.
                </p>
                <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/[0.06] p-3 text-[13px] leading-relaxed text-green-200/90">
                  <span className="font-semibold text-green-300">Hint: </span>
                  {question.hint}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      copyText(question.title, () => {})
                    }
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-white/25 hover:text-white"
                  >
                    <Copy size={13} /> Copy prompt
                  </button>
                  <button
                    onClick={() => {
                      setSolvedCount((c) => c + 1);
                      newQuestion();
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-500"
                  >
                    <Check size={13} /> Mark solved
                  </button>
                </div>
              </div>
            </section>

            {/* Stdin card */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1114]/80">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
                <div className="text-sm font-semibold text-white">
                  Standard Input{" "}
                  <span className="ml-1 font-mono text-[11px] font-normal text-gray-500">
                    stdin
                  </span>
                </div>
                <button
                  onClick={() => setStdin("")}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 transition hover:text-red-300"
                >
                  <Eraser size={13} /> Clear
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  spellCheck={false}
                  rows={5}
                  placeholder={"5\n1 2 3 4 5"}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[13px] leading-relaxed text-gray-200 placeholder:text-gray-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  Fed to your program as input. Use one value per line or
                  space-separated values.
                </p>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 lg:col-span-8">
            {/* Editor card */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1114]/80">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <FileCode2 size={15} className="text-green-400" />
                  solution.{activeLang.ext}
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => copyText(code, setCopiedCode)}
                    title="Copy code"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  >
                    {copiedCode ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={downloadCode}
                    title="Download file"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={resetCode}
                    title="Reset to template"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-amber-300"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              <Editor
                height="420px"
                language={activeLang.monaco}
                value={code}
                onChange={(v) =>
                  setCodeByLang((prev) => ({ ...prev, [language]: v || "" }))
                }
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.addCommand(2081, () => runCode()); // Ctrl+Enter in editor
                }}
                theme={editorTheme}
                options={{
                  fontSize,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  smoothScrolling: true,
                  padding: { top: 14 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                }}
              />

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.07] bg-black/40 px-4 py-2 font-mono text-[11px] text-gray-500">
                <span>{lineCount} lines</span>
                <span>{code.length} chars</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${activeLang.dot}`} />
                  {activeLang.label} · {activeLang.version}
                </span>
                <span className="ml-auto">UTF-8 · LF</span>
              </div>
            </section>

            {/* Output card */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1114]/80">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                  Output
                </div>
                {execTime && status !== "running" && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                    <Clock size={12} /> {execTime}s
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => copyText(output, setCopiedOutput)}
                    disabled={!output}
                    title="Copy output"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    {copiedOutput ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={() => {
                      setOutput("");
                      setStatus("idle");
                      setExecTime(null);
                    }}
                    disabled={!output}
                    title="Clear output"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-red-300 disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="min-h-[180px] bg-black/60 p-4">
                {status === "running" ? (
                  <div className="flex items-center gap-3 text-sm text-amber-300">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                    Executing on {activeLang.label} {activeLang.version}…
                  </div>
                ) : output ? (
                  <pre
                    className={`whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed ${
                      status === "error" ? "text-red-300" : "text-green-300"
                    }`}
                  >
                    {output}
                  </pre>
                ) : (
                  <div className="flex h-full min-h-[148px] flex-col items-center justify-center gap-2 text-center">
                    <SquareTerminal size={26} className="text-gray-700" />
                    <p className="text-sm text-gray-500">
                      Press <span className="font-semibold text-gray-300">Run Code</span> or{" "}
                      <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-gray-300">
                        Ctrl + Enter
                      </kbd>{" "}
                      to see output here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-600">
          Code is auto-saved per language in your browser · Execution via Paiza IO
        </p>
      </div>
    </div>
  );
};

export default Compiler;
