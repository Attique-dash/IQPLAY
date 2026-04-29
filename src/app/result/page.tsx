"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes, FaTrophy, FaMedal, FaChartLine, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaGamepad, FaFire, FaStar } from "react-icons/fa";
import { GiSwordClash, GiCrown, GiBattleAxe, GiLaurelCrown } from "react-icons/gi";
import { MdScoreboard, MdQuiz, MdEmojiEvents } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function Result() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [playerOneCorrect, setPlayerOneCorrect] = useState(0);
  const [playerTwoCorrect, setPlayerTwoCorrect] = useState(0);
  const [winner, setWinner] = useState<string>("");
  const [winnerName, setWinnerName] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const docRef = doc(db, "games", gameId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameData(data);

        const playerOneAnswers = data.responses?.filter(
          (resp: any) =>
            resp.player === data.player1 &&
            resp.selectedOption === resp.correctAnswer
        ).length;

        const playerTwoAnswers = data.responses?.filter(
          (resp: any) =>
            resp.player === data.player2 &&
            resp.selectedOption === resp.correctAnswer
        ).length;

        setPlayerOneCorrect(playerOneAnswers || 0);
        setPlayerTwoCorrect(playerTwoAnswers || 0);

        if (data.playerOneScore > data.playerTwoScore) {
          setWinner(`${data.player1} Wins!`);
          setWinnerName(data.player1);
        } else if (data.playerOneScore < data.playerTwoScore) {
          setWinner(`${data.player2} Wins!`);
          setWinnerName(data.player2);
        } else {
          setWinner("It's a Draw!");
          setWinnerName("");
        }
      }
      setLoading(false);
    };

    fetchResults();
  }, [gameId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getWinnerIcon = () => {
    if (winner.includes("Draw")) return <GiSwordClash className="text-[#fbbf24] text-5xl" />;
    return <GiCrown className="text-[#fbbf24] text-5xl" />;
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
            Loading results...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] to-[#12152a] flex items-center justify-center">
        <div className="text-center bg-[#1e1e2f]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1e2a4a]">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-[#94a3b8] text-lg">No game data found.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-6 py-2 bg-[#7c3aed] rounded-xl text-white font-medium hover:bg-[#6d28d9] transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .glow-text {
          text-shadow: 0 0 20px rgba(124,58,237,0.5);
        }
        
        .winner-glow {
          animation: winnerPulse 2s ease-in-out infinite;
        }
        
        @keyframes winnerPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { text-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
        }
        
        .confetti-bg {
          background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%);
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
                    <p className="text-white font-semibold truncate">{gameData.gameName}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard`)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <FaArrowLeft size={14} />
                    Dashboard
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
            Battle Results
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="md:hidden w-9 h-9 rounded-xl bg-[#1e1e2f]/80 border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
            >
              <FaBars size={18} />
            </button>
            <button
              onClick={() => router.push(`/dashboard`)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#1e1e2f] border border-[#7c3aed]/30 text-[#c084fc] text-sm font-medium hover:bg-[#7c3aed]/10 transition"
            >
              <FaArrowLeft size={14} />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 confetti-bg rounded-3xl pointer-events-none" />

          {/* Main Result Card */}
          <div className="relative bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#c084fc] to-[#fbbf24]" />

            {/* VS Section with Winner Highlight */}
            <div className="p-6 md:p-8 border-b border-[#1e2a4a]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                {/* Player One */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`text-center p-6 rounded-2xl transition-all ${
                    winnerName === gameData.player1
                      ? "bg-gradient-to-br from-[#fbbf24]/20 to-transparent border-2 border-[#fbbf24]/50 shadow-lg shadow-[#fbbf24]/20"
                      : "bg-[#1e1e2f]/50 border border-[#1e2a4a]"
                  }`}
                >
                  {winnerName === gameData.player1 && (
                    <div className="mb-2 flex justify-center">
                      <GiLaurelCrown className="text-[#fbbf24] text-2xl" />
                    </div>
                  )}
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {gameData.player1?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{gameData.player1}</h3>
                  <p className="text-[#94a3b8] text-sm mt-1">Challenger</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <FaStar className="text-[#fbbf24] text-xs" />
                    <span className="text-[#c084fc] font-bold text-2xl">{gameData.playerOneScore}</span>
                    <span className="text-[#94a3b8] text-sm">pts</span>
                  </div>
                </motion.div>

                {/* VS Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full blur-md opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center shadow-lg">
                    <span className="font-display font-bold text-white text-xl tracking-wider">VS</span>
                  </div>
                </div>

                {/* Player Two */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-center p-6 rounded-2xl transition-all ${
                    winnerName === gameData.player2
                      ? "bg-gradient-to-br from-[#fbbf24]/20 to-transparent border-2 border-[#fbbf24]/50 shadow-lg shadow-[#fbbf24]/20"
                      : "bg-[#1e1e2f]/50 border border-[#1e2a4a]"
                  }`}
                >
                  {winnerName === gameData.player2 && (
                    <div className="mb-2 flex justify-center">
                      <GiLaurelCrown className="text-[#fbbf24] text-2xl" />
                    </div>
                  )}
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {gameData.player2?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{gameData.player2}</h3>
                  <p className="text-[#94a3b8] text-sm mt-1">Defender</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <FaStar className="text-[#fbbf24] text-xs" />
                    <span className="text-[#c084fc] font-bold text-2xl">{gameData.playerTwoScore}</span>
                    <span className="text-[#94a3b8] text-sm">pts</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Winner Announcement */}
            <div className="py-8 text-center border-b border-[#1e2a4a] bg-gradient-to-r from-transparent via-[#7c3aed]/5 to-transparent">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1e1e2f] border border-[#fbbf24]/30"
              >
                {getWinnerIcon()}
                <span className={`font-display text-2xl md:text-3xl font-bold winner-glow ${
                  winner.includes("Wins") ? "text-[#fbbf24]" : "text-[#94a3b8]"
                }`}>
                  {winner}
                </span>
                {winner.includes("Wins") && <FaFire className="text-[#ff6b8a] text-2xl" />}
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Questions Card */}
              <div className="bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-5 border border-[#1e2a4a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                    <MdQuiz className="text-[#7c3aed] text-xl" />
                  </div>
                  <h4 className="font-display font-bold text-white text-lg">Game Stats</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">Game Name</span>
                    <span className="text-white font-medium">{gameData.gameName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">Total Questions</span>
                    <span className="text-white font-medium">10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">Total Points</span>
                    <span className="text-white font-medium">25</span>
                  </div>
                </div>
              </div>

              {/* Correct Answers Card */}
              <div className="bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-5 border border-[#1e2a4a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
                    <FaCheckCircle className="text-[#10b981] text-xl" />
                  </div>
                  <h4 className="font-display font-bold text-white text-lg">Correct Answers</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                      <span className="text-[#94a3b8]">{gameData.player1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xl">{playerOneCorrect}</span>
                      <span className="text-[#94a3b8] text-sm">/ 10</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#1e2a4a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(playerOneCorrect / 10) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#c084fc]" />
                      <span className="text-[#94a3b8]">{gameData.player2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xl">{playerTwoCorrect}</span>
                      <span className="text-[#94a3b8] text-sm">/ 10</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#1e2a4a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(playerTwoCorrect / 10) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[#c084fc] to-[#7c3aed] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 md:p-8 border-t border-[#1e2a4a] flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/review?gameId=${gameId}`)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all"
              >
                <MdScoreboard size={18} />
                Review Answers
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard`)}
                className="px-6 py-3 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] text-[#94a3b8] font-semibold flex items-center justify-center gap-2 hover:bg-[#2a2a3e] hover:text-white transition-all"
              >
                <FaGamepad size={16} />
                Play More Games
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}