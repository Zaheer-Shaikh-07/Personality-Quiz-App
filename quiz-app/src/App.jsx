import { useReducer, useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


const QUESTIONS = [
  {
    id: 1,
    text: "It's a free evening. What sounds most fun?",
    options: [
      { label: "Go out with a big group", scores: { E: 2 } },
      { label: "Hang with one close friend", scores: { I: 1, F: 1 } },
      { label: "Solo project or hobby time", scores: { I: 2 } },
      { label: "Join a meetup to network", scores: { E: 1, T: 1 } },
    ],
  },
  {
    id: 2,
    text: "When making decisions, you mostly rely on…",
    options: [
      { label: "Objective facts & logic", scores: { T: 2 } },
      { label: "Gut feelings & values", scores: { F: 2 } },
      { label: "A mix, but logic leads", scores: { T: 1 } },
      { label: "A mix, but feelings lead", scores: { F: 1 } },
    ],
  },
  {
    id: 3,
    text: "At a party, you are most likely to…",
    options: [
      { label: "Work the room and meet everyone", scores: { E: 2 } },
      { label: "Stick with a small, deep convo", scores: { I: 2, F: 1 } },
      { label: "Find the snack table & observe", scores: { I: 1 } },
      { label: "Host games or activities", scores: { E: 1, T: 1 } },
    ],
  },
  {
    id: 4,
    text: "A teammate disagrees with you. You…",
    options: [
      { label: "Debate the reasoning step-by-step", scores: { T: 2 } },
      { label: "Ask how they feel and find harmony", scores: { F: 2 } },
      { label: "Hear them out, then present data", scores: { T: 1 } },
      { label: "Seek compromise quickly", scores: { F: 1 } },
    ],
  },
  {
    id: 5,
    text: "Weekend plan style?",
    options: [
      { label: "Packed schedule with friends", scores: { E: 2 } },
      { label: "Quiet recharge and reading", scores: { I: 2 } },
      { label: "Workshop / hackathon / chess club", scores: { T: 2 } },
      { label: "Volunteering / family time", scores: { F: 2 } },
    ],
  },
];

const initialState = {
  step: "start", // 'start' | 'question' | 'loading' | 'result'
  currentIndex: 0,
  answers: [], // index chosen per question
  scores: { E: 0, I: 0, T: 0, F: 0 },
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...initialState, step: "question" };
    case "ANSWER": {
      const { qIndex, optionIndex } = action;
      const question = QUESTIONS[qIndex];
      const chosen = question.options[optionIndex];
      const nextScores = { ...state.scores };
      Object.entries(chosen.scores).forEach(([k, v]) => {
        nextScores[k] = (nextScores[k] || 0) + v;
      });
      const nextAnswers = [...state.answers];
      nextAnswers[qIndex] = optionIndex;
      const nextIndex = qIndex + 1;
      const nextStep = nextIndex >= QUESTIONS.length ? "loading" : "question";
      return {
        ...state,
        step: nextStep,
        currentIndex: nextIndex >= QUESTIONS.length ? qIndex : nextIndex,
        answers: nextAnswers,
        scores: nextScores,
      };
    }
    case "RESET":
      return { ...initialState, step: "start" };
    case "SHOW_RESULT":
      return { ...state, step: "result" };
    default:
      return state;
  }
}

function usePersonality(scores) {
  const type = useMemo(() => {
    const EorI = (scores.E || 0) >= (scores.I || 0) ? "E" : "I";
    const TorF = (scores.T || 0) >= (scores.F || 0) ? "T" : "F";
    return `${EorI}${TorF}`;
  }, [scores]);

  const info = useMemo(() => {
    const map = {
      ET: {
        title: "The Analyst (ET)",
        desc:
          "Driven, energetic, and logical. You enjoy leading with ideas, testing hypotheses, and rallying people around clear goals.",
      },
      EF: {
        title: "The Connector (EF)",
        desc:
          "Warm, outgoing, and values-driven. You thrive in communities, elevating others and creating shared moments.",
      },
      IT: {
        title: "The Architect (IT)",
        desc:
          "Independent, systematic, and curious. You love deep work, building solid frameworks, and perfecting details.",
      },
      IF: {
        title: "The Sage (IF)",
        desc:
          "Reflective, empathetic, and principled. You seek meaning, nurture close bonds, and choose depth over noise.",
      },
    };
    return map[type] || map.ET;
  }, [type]);

  return { type, ...info };
}

export default function PersonalityQuizApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, currentIndex, scores } = state;
  const [selected, setSelected] = useState(null); // highlight clicked option
  const [copied, setCopied] = useState(false);

  const total = QUESTIONS.length;
  const progress = state.step === "start" ? 0 : Math.round(((state.answers.filter(a => a !== undefined).length) / total) * 100);

  // Handle loading -> result transition
  useEffect(() => {
    if (step === "loading") {
      const t = setTimeout(() => dispatch({ type: "SHOW_RESULT" }), 1200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const persona = usePersonality(scores);

  const handleChoose = (idx) => {
    setSelected(idx);
    // short delay to show highlight before transition
    setTimeout(() => {
      dispatch({ type: "ANSWER", qIndex: currentIndex, optionIndex: idx });
      setSelected(null);
    }, 200);
  };

  const shareResults = async () => {
    const msg = `My personality type is ${persona.title}. ${persona.desc}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Personality Quiz Result", text: msg });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(msg);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (_) {}
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
         {/* Header Section */}
  <header className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-white">AskYou Quiz App</h1>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
    >
      Exit
    </button>
  </header>

        {/* Card */}
        <motion.div
          layout
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header / Progress */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Personality Quiz</h1>
              <span className="text-sm text-white/80">{progress}%</span>
            </div>
            <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "start" && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <p className="text-white/90 max-w-lg mx-auto">
                    Take a quick, interactive quiz to discover your core personality style. No sign‑up. Just vibes.
                  </p>
                  <button
                    className="mt-6 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold shadow hover:shadow-lg active:scale-[0.98] transition"
                    onClick={() => dispatch({ type: "START" })}
                  >
                    Start Quiz
                  </button>
                </motion.div>
              )}

              {step === "question" && (
                <motion.div
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 text-sm text-white/80">
                    Question {currentIndex + 1} of {total}
                  </div>
                  <h2 className="text-xl font-bold mb-5 leading-snug">
                    {QUESTIONS[currentIndex].text}
                  </h2>
                  <div className="grid gap-3">
                    {QUESTIONS[currentIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleChoose(i)}
                        className={
                          "text-left w-full px-4 py-3 rounded-xl border transition focus:outline-none " +
                          (selected === i
                            ? "bg-white text-indigo-700 border-white"
                            : "bg-white/5 hover:bg-white/10 border-white/20")
                        }
                      >
                        <span className="text-base font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-14"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <p className="mt-6 text-white/90">Analyzing your answers…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Result Modal */}
        <AnimatePresence>
          {step === "result" && (
            <motion.div
              key="modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60" aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
                className="relative z-10 w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Your Personality Type is:
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-indigo-700">
                    {persona.title}
                  </p>
                  <p className="mt-3 text-slate-700 leading-relaxed">{persona.desc}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={shareResults}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-[0.98] transition"
                    >
                      Share Results
                    </button>
                    <button
                      onClick={() => dispatch({ type: "RESET" })}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 active:scale-[0.98] transition"
                    >
                      Retake Quiz
                    </button>
                    {copied && (
                      <span className="text-sm text-emerald-600 self-center">Copied to clipboard!</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <div className="mt-4 text-center text-sm text-white/70 mb-0">
          Identify Yourself With our simple quiz application  
          {/* Footer Section */}

  <p>© {new Date().getFullYear()} AskYou Quiz. All rights reserved.</p>

        </div>
      </div>
    </div>
  );
}
