"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes, FaArrowLeft, FaClock, FaCheckCircle, FaBrain, FaGamepad, FaTrophy, FaExclamationTriangle, FaBolt } from "react-icons/fa";
import { GiSwordClash, GiBattleAxe, GiCrown } from "react-icons/gi";
import { MdScoreboard, MdQuiz } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Question {
  question: string;
  options: string[];
  correct: string;
}

interface PlayerResponse {
  player: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedOption: string | null;
}

export default function Quiz() {
  const router = useRouter();

  const [urlParams, setUrlParams] = useState({
    title: "Game",
    difficulty: "",
    gameId: "",
    playerOne: "Player 1",
    playerTwo: "Player 2",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState("Player 1");
  const [playerResponses, setPlayerResponses] = useState<PlayerResponse[]>([]);
  const [playerScores, setPlayerScores] = useState({
    playerOne: 0,
    playerTwo: 0,
  });
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const newParams = {
        title: params.get("title") || "Game",
        difficulty: params.get("difficulty") || "",
        gameId: params.get("gameId") || "",
        playerOne: params.get("playerOne") || "Player 1",
        playerTwo: params.get("playerTwo") || "Player 2",
      };
      setUrlParams(newParams);
      setCurrentPlayer(newParams.playerOne);
    }
  }, []);

  const { title, difficulty, gameId, playerOne, playerTwo } = urlParams;

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => {
        if (title && difficulty && data[title]?.[difficulty]) {
          const shuffledQuestions = data[title][difficulty].sort(
            () => Math.random() - 0.5
          );
          setAllQuestions(shuffledQuestions);
          setQuestions(shuffledQuestions.slice(0, 5));
        }
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [title, difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!showPopup && currentIndex < questions.length) {
      setTimer(15);
      setIsTimeUp(false);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPopup, currentIndex, questions.length]);

  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => setShowPopup(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

  const storeResponse = () => {
    if (selectedOption !== null || isTimeUp) {
      const response = {
        player: currentPlayer,
        question: questions[currentIndex]?.question,
        options: questions[currentIndex]?.options,
        correctAnswer: questions[currentIndex]?.correct,
        selectedOption: selectedOption,
      };
      setPlayerResponses((prev) => [...prev, response]);

      if (selectedOption === questions[currentIndex]?.correct) {
        setPlayerScores((prev) => ({
          ...prev,
          [currentPlayer === playerOne ? "playerOne" : "playerTwo"]:
            prev[currentPlayer === playerOne ? "playerOne" : "playerTwo"] + 5,
        }));
      }
    }
  };

  const switchPlayer = () => {
    const newUsedQuestions = new Set(usedQuestions);
    questions.forEach((q) => newUsedQuestions.add(q.question));
    setUsedQuestions(newUsedQuestions);

    const remainingQuestions = allQuestions.filter(
      (q) => !newUsedQuestions.has(q.question)
    );

    const shuffledQuestions = [...remainingQuestions].sort(
      () => Math.random() - 0.5
    );
    const newQuestions = shuffledQuestions.slice(0, 5);

    if (newQuestions.length === 0) {
      toast.error("No more questions available for this category!");
      return;
    }

    setQuestions(newQuestions);
    setShowPopup(true);
    setCurrentPlayer(playerTwo);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTimer(15);
    setIsTimeUp(false);
  };

  const handleNext = () => {
    if (timer > 0 && selectedOption === null && !isTimeUp) {
      toast.error("Please select an option before time runs out!");
      return;
    }

    storeResponse();

    if (currentIndex === questions.length - 1) {
      if (currentPlayer === playerOne) {
        switchPlayer();
      } else {
        toast.success("Quiz completed! Calculating results...");
        setTimeout(handleComplete, 2000);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimer(15);
      setIsTimeUp(false);
    }
  };

  const handleComplete = async () => {
    // Store the last response if not already stored
    if ((selectedOption !== null || isTimeUp) && currentIndex === questions.length - 1 && currentPlayer === playerTwo) {
      const lastResponse = {
        player: currentPlayer,
        question: questions[currentIndex]?.question,
        options: questions[currentIndex]?.options,
        correctAnswer: questions[currentIndex]?.correct,
        selectedOption: selectedOption,
      };
      setPlayerResponses((prev) => [...prev, lastResponse]);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const finalResponses = [...playerResponses];
    if ((selectedOption !== null || isTimeUp) && currentIndex === questions.length - 1 && currentPlayer === playerTwo) {
      finalResponses.push({
        player: currentPlayer,
        question: questions[currentIndex]?.question,
        options: questions[currentIndex]?.options,
        correctAnswer: questions[currentIndex]?.correct,
        selectedOption: selectedOption,
      });
    }

    const playerOneScore = playerScores.playerOne;
    const playerTwoScore = playerScores.playerTwo;

    const difficultyMap: { [key: string]: number } = {
      "Very Easy": 100,
      Medium: 250,
      Hard: 450,
      "Very Difficult": 600,
      "100": 100,
      "250": 250,
      "450": 450,
      "600": 600,
    };

    const winnerPoints = difficultyMap[String(difficulty).trim()] || 100;

    let playerOnePoints = 0;
    let playerTwoPoints = 0;

    if (playerOneScore > playerTwoScore) {
      playerOnePoints = winnerPoints;
    } else if (playerTwoScore > playerOneScore) {
      playerTwoPoints = winnerPoints;
    } else {
      playerOnePoints = winnerPoints / 2;
      playerTwoPoints = winnerPoints / 2;
    }

    try {
      await setDoc(doc(db, "games", gameId || ""), {
        gameName: title,
        player1: playerOne,
        player2: playerTwo,
        playerOneScore,
        playerTwoScore,
        responses: finalResponses,
        completedAt: new Date().toISOString(),
      });

      const playerPointsRef = doc(db, "playerPoints", gameId || "");
      const playerPointsDoc = await getDoc(playerPointsRef);

      if (playerPointsDoc.exists()) {
        await updateDoc(playerPointsRef, {
          [playerOne]: increment(playerOnePoints),
          [playerTwo]: increment(playerTwoPoints),
        });
      } else {
        await setDoc(playerPointsRef, {
          gameId,
          playerOne,
          playerTwo,
          [playerOne]: playerOnePoints,
          [playerTwo]: playerTwoPoints,
        });
      }

      router.push(`/result?gameId=${gameId}`);
    } catch (error) {
      console.error("Error saving game results:", error);
      toast.error("Failed to save results. Please try again.");
    }
  };

  const handleOptionClick = (option: string) => {
    if (isTimeUp) {
      toast.error("Time's up! You cannot select an option now.");
      return;
    }
    setSelectedOption(option);
    setError("");
  };

  const ExitGame = () => {
    setShowExitModal(false);
    router.push(`/usergame?gameId=${gameId}`);
  };

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
            Loading challenge...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "#1e1e2f",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #1e2a4a",
        }}
      />
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .glow-text {
          text-shadow: 0 0 20px rgba(124,58,237,0.5);
        }
        
        .timer-ring {
          transition: stroke-dashoffset 1s linear;
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
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Current Battle</p>
                    <p className="text-white font-semibold truncate">{title}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Point Value</p>
                    <p className="text-[#c084fc] font-display text-xl font-bold">{difficulty} pts</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Active Player</p>
                    <div className="flex items-center gap-2">
                      <GiBattleAxe className="text-[#7c3aed]" />
                      <p className="text-white font-semibold">{currentPlayer}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExitModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all mt-4"
                  >
                    <FaArrowLeft size={14} />
                    Exit Game
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      {!showPopup && (
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
              {title}
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden w-9 h-9 rounded-xl bg-[#1e1e2f]/80 border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
              >
                <FaBars size={18} />
              </button>
              <button
                onClick={() => setShowExitModal(true)}
                className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#1e1e2f] border border-[#ff3b5c]/30 text-[#ff6b8a] text-sm font-medium hover:bg-[#ff3b5c]/10 transition"
              >
                <FaArrowLeft size={14} />
                Exit Game
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {showPopup ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
          >
            <div className="relative bg-gradient-to-br from-[#0f1222] to-[#12152a] rounded-2xl border border-[#7c3aed]/30 p-8 text-center max-w-md w-full mx-4 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-t-2xl" />
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7c3aed]/20 to-[#c084fc]/20 flex items-center justify-center">
                <GiCrown className="text-[#c084fc] text-4xl" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">{currentPlayer}</h2>
              <p className="text-[#94a3b8] text-sm mb-3">Get ready for battle!</p>
              <div className="flex items-center justify-center gap-2 text-[#7c3aed]">
                <FaBolt />
                <span className="text-sm font-medium">Challenge awaits</span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-4 text-xs text-[#94a3b8]"
              >
                Starting in...
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f1222]/60 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="p-4 border-b border-[#1e2a4a]">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-[#94a3b8]">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-[#c084fc] font-medium">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1e1e2f] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full"
                />
              </div>
            </div>

            {/* Timer Section */}
            <div className="flex flex-col items-center py-6 border-b border-[#1e2a4a] bg-[#0a0c15]/50">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#1e2a4a"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={timer <= 5 ? "#ff3b5c" : "#7c3aed"}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - timer / 15)}`}
                    className="timer-ring transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-display text-2xl font-bold ${timer <= 5 ? "text-[#ff6b8a]" : "text-white"}`}>
                    {timer}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <FaClock className={`text-xs ${timer <= 5 ? "text-[#ff6b8a]" : "text-[#94a3b8]"}`} />
                <span className={`text-xs font-medium ${timer <= 5 ? "text-[#ff6b8a]" : "text-[#94a3b8]"}`}>
                  {timer <= 5 ? "Hurry up!" : "Seconds left"}
                </span>
              </div>
            </div>

            {/* Question Section */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                  <MdQuiz className="text-[#7c3aed] text-sm" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-white leading-tight">
                  {questions[currentIndex]?.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {questions[currentIndex]?.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? "bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white shadow-lg shadow-[#7c3aed]/30"
                          : "bg-[#1e1e2f] text-[#94a3b8] hover:bg-[#2a2a3e] hover:text-white border border-[#1e2a4a]"
                      } ${isTimeUp ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => handleOptionClick(option)}
                      disabled={isTimeUp}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#0a0c15] text-[#94a3b8]"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium">{option}</span>
                      {isSelected && <FaCheckCircle className="ml-auto text-white/80 text-sm" />}
                    </motion.button>
                  );
                })}
              </div>

              {isTimeUp && !selectedOption && (
                <div className="mt-4 p-3 rounded-xl bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 flex items-center gap-2">
                  <FaExclamationTriangle className="text-[#ff6b8a] text-sm" />
                  <span className="text-[#ff6b8a] text-sm">Time's up! No points for this question.</span>
                </div>
              )}

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all"
              >
                {currentIndex === questions.length - 1 ? (
                  currentPlayer === playerOne ? (
                    <>Switch Player <GiSwordClash /></>
                  ) : (
                    <>Finish Battle <FaTrophy /></>
                  )
                ) : (
                  <>Next Question <FaArrowLeft className="rotate-180" size={14} /></>
                )}
              </motion.button>
            </div>

            {/* Score Footer */}
            <div className="p-4 border-t border-[#1e2a4a] bg-[#0a0c15]/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                  <span className="text-xs text-[#94a3b8]">{playerOne}</span>
                  <span className="text-white font-bold text-sm">{playerScores.playerOne}</span>
                </div>
                <div className="text-[#1e2a4a] text-xs">VS</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#c084fc]" />
                  <span className="text-xs text-[#94a3b8]">{playerTwo}</span>
                  <span className="text-white font-bold text-sm">{playerScores.playerTwo}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#94a3b8] text-xs">
                <GiBattleAxe size={12} />
                <span>Battle in progress</span>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0f1222] border border-[#1e2a4a] rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] rounded-t-2xl" />
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#ff3b5c]/20 flex items-center justify-center">
                  <FaExclamationTriangle className="text-[#ff6b8a] text-2xl" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Exit Battle?</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Are you sure you want to exit? Your progress will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1e1e2f] text-white font-medium hover:bg-[#2a2a3e] transition"
                  >
                    Continue Playing
                  </button>
                  <button
                    onClick={ExitGame}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] text-white font-medium hover:shadow-lg transition"
                  >
                    Yes, Exit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}