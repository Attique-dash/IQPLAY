"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaGamepad, FaBrain, FaChartBar } from "react-icons/fa";
import { GiSwordClash, GiCheckMark, GiCrossMark } from "react-icons/gi";
import { MdQuiz, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function Review() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameName, setGameName] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("gameId");
      setGameId(id);
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "games", gameId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setResponses(data.responses || []);
          setGameName(data.gameName || "Game");
        } else {
          console.error("No document found for gameId:", gameId);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [gameId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNext = () => {
    if (currentIndex < responses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push(`/result?gameId=${gameId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Calculate statistics
  const totalQuestions = responses.length;
  const correctAnswers = responses.filter(r => r.selectedOption === r.correctAnswer).length;
  const incorrectAnswers = responses.filter(r => r.selectedOption !== r.correctAnswer && r.selectedOption !== null).length;
  const unanswered = responses.filter(r => r.selectedOption === null).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#12152a] to-[#0a0c15] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-3 border-[#1e2a4a] border-t-[#7c3aed] rounded-full mx-auto mb-6"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#94a3b8] font-medium text-lg"
          >
            Loading review...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!responses.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] to-[#12152a] flex items-center justify-center">
        <div className="text-center bg-[#1e1e2f]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1e2a4a]">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#94a3b8] text-lg">No responses found for this game.</p>
          <button
            onClick={() => router.push(`/result?gameId=${gameId}`)}
            className="mt-6 px-6 py-2 bg-[#7c3aed] rounded-xl text-white font-medium hover:bg-[#6d28d9] transition"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const currentResponse = responses[currentIndex];
  const { question, options, correctAnswer, selectedOption, player } = currentResponse;
  const isCorrect = selectedOption === correctAnswer;
  const isUnanswered = selectedOption === null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .correct-glow {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        
        .incorrect-glow {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }
      `}</style>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#0f1222] border-r border-[#1e2a4a] shadow-2xl z-50"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                      <FaGamepad className="text-white" />
                    </div>
                    <span className="font-display font-bold text-lg text-white">IQPLAY</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Game</p>
                    <p className="text-white font-semibold truncate">{gameName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Stats</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Correct:</span>
                        <span className="text-[#10b981] font-semibold">{correctAnswers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Incorrect:</span>
                        <span className="text-[#ef4444] font-semibold">{incorrectAnswers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Unanswered:</span>
                        <span className="text-[#fbbf24] font-semibold">{unanswered}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/result?gameId=${gameId}`)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <FaChartBar size={14} />
                    View Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0c15]/80 border-b border-[#1e2a4a]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                <FaGamepad className="text-white text-lg" />
              </div>
            </div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent hidden sm:block">BRAIN<span className="text-[#7c3aed]">ARENA</span></span>
          </div>

          <h1 className="font-display font-bold text-base sm:text-lg text-white/80 max-w-[200px] sm:max-w-md truncate">
            Review Answers
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="md:hidden w-9 h-9 rounded-xl bg-[#1e1e2f]/80 border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
            >
              <FaBars size={18} />
            </button>
            <button
              onClick={() => router.push(`/result?gameId=${gameId}`)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#1e1e2f] border border-[#7c3aed]/30 text-[#c084fc] text-sm font-medium hover:bg-[#7c3aed]/10 transition"
            >
              <FaArrowLeft size={14} />
              Results
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#94a3b8]">Question {currentIndex + 1} of {totalQuestions}</span>
            <span className="text-[#c084fc] font-medium">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1e1e2f] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full"
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`relative bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border overflow-hidden ${
            isCorrect ? 'border-[#10b981]/50 correct-glow' : isUnanswered ? 'border-[#fbbf24]/50' : 'border-[#ef4444]/50 incorrect-glow'
          }`}
        >
          {/* Status Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isCorrect ? 'bg-[#10b981]' : isUnanswered ? 'bg-[#fbbf24]' : 'bg-[#ef4444]'
          }`} />

          {/* Player Info */}
          <div className="p-5 border-b border-[#1e2a4a] bg-[#0a0c15]/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-[#10b981]/20' : isUnanswered ? 'bg-[#fbbf24]/20' : 'bg-[#ef4444]/20'
                }`}>
                  {isCorrect ? (
                    <FaCheckCircle className="text-[#10b981] text-xl" />
                  ) : isUnanswered ? (
                    <GiSwordClash className="text-[#fbbf24] text-xl" />
                  ) : (
                    <FaTimesCircle className="text-[#ef4444] text-xl" />
                  )}
                </div>
                <div>
                  <p className="text-[#94a3b8] text-xs uppercase tracking-wider">Answered by</p>
                  <p className="font-display font-bold text-white text-lg">{player}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isCorrect ? 'bg-[#10b981]/20 text-[#10b981]' : isUnanswered ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 'bg-[#ef4444]/20 text-[#ef4444]'
              }`}>
                {isCorrect ? '✓ Correct' : isUnanswered ? '⏱ Unanswered' : '✗ Incorrect'}
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6 border-b border-[#1e2a4a]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
                <MdQuiz className="text-[#7c3aed] text-sm" />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-white leading-relaxed">
                {question}
              </h2>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {options.map((option: string, idx: number) => {
              const optionLetter = String.fromCharCode(65 + idx);
              const isCorrectAnswer = option === correctAnswer;
              const isSelectedAnswer = option === selectedOption;
              
              let optionClass = "bg-[#1e1e2f] border border-[#1e2a4a] text-[#94a3b8]";
              let icon = null;
              
              if (isCorrectAnswer) {
                optionClass = "bg-[#10b981]/20 border-[#10b981] text-white";
                icon = <FaCheckCircle className="text-[#10b981] text-sm" />;
              } else if (isSelectedAnswer && !isCorrectAnswer) {
                optionClass = "bg-[#ef4444]/20 border-[#ef4444] text-white";
                icon = <FaTimesCircle className="text-[#ef4444] text-sm" />;
              }
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${optionClass}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrectAnswer ? 'bg-[#10b981] text-white' : 
                    isSelectedAnswer && !isCorrectAnswer ? 'bg-[#ef4444] text-white' : 
                    'bg-[#0a0c15] text-[#94a3b8]'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className="flex-1 font-medium">{option}</span>
                  {icon}
                  {isCorrectAnswer && isSelectedAnswer && (
                    <span className="text-xs text-[#10b981] font-medium">Your Answer ✓</span>
                  )}
                  {isCorrectAnswer && !isSelectedAnswer && (
                    <span className="text-xs text-[#10b981] font-medium">Correct Answer</span>
                  )}
                  {isSelectedAnswer && !isCorrectAnswer && (
                    <span className="text-xs text-[#ef4444] font-medium">Your Answer</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation / Feedback */}
          {!isCorrect && !isUnanswered && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
              <p className="text-[#ef4444] text-sm font-medium">
                ✗ The correct answer was: <span className="font-bold">{correctAnswer}</span>
              </p>
            </div>
          )}
          
          {isUnanswered && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20">
              <p className="text-[#fbbf24] text-sm font-medium">
                ⏱ You did not answer this question in time. The correct answer was: <span className="font-bold">{correctAnswer}</span>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="p-6 border-t border-[#1e2a4a] flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                currentIndex === 0
                  ? 'bg-[#1e1e2f] text-[#4a5568] cursor-not-allowed'
                  : 'bg-[#1e1e2f] text-white hover:bg-[#2a2a3e] border border-[#1e2a4a]'
              }`}
            >
              <MdNavigateBefore size={20} />
              Previous
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              {currentIndex === responses.length - 1 ? (
                <>Complete <FaCheckCircle size={16} /></>
              ) : (
                <>Next <MdNavigateNext size={20} /></>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom Stats Bar */}
        <div className="mt-6 flex items-center justify-between p-4 bg-[#0f1222]/60 backdrop-blur-sm rounded-xl border border-[#1e2a4a]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-xs text-[#94a3b8]">Correct: <span className="text-[#10b981] font-bold">{correctAnswers}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span className="text-xs text-[#94a3b8]">Incorrect: <span className="text-[#ef4444] font-bold">{incorrectAnswers}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
              <span className="text-xs text-[#94a3b8]">Unanswered: <span className="text-[#fbbf24] font-bold">{unanswered}</span></span>
            </div>
          </div>
          <div className="text-xs text-[#94a3b8]">
            Score: <span className="text-[#c084fc] font-bold">{correctAnswers * 5}</span> / {totalQuestions * 5} pts
          </div>
        </div>
      </main>
    </div>
  );
}