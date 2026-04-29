"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes, FaTrophy, FaCrown, FaStar, FaFire, FaArrowLeft, FaGamepad, FaMedal } from "react-icons/fa";
import { GiSwordClash, GiLaurelCrown, GiBattleAxe, GiChampions, GiPartyPopper, GiCrown } from "react-icons/gi";
import { MdEmojiEvents, MdScoreboard } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useConfetti } from "@/app/hooks/useConfetti";

interface GameData {
  gameName: string;
  playerOne: string;
  playerTwo: string;
}

export default function EndGamePage() {
  useConfetti();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerScores, setPlayerScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [winner, setWinner] = useState<{ name: string; score: number; isDraw: boolean } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setGameId(params.get("gameId"));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email) {
        router.push("/login");
      } else {
        setUserEmail(user.email.replace(/\./g, "_"));
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userEmail || !gameId) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const gameRef = doc(db, userEmail, gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
          toast.error("Game data not found");
          await cleanupGameData();
          return;
        }

        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);

        if (!scoresSnap.exists()) {
          toast.error("Scores not found");
          await cleanupGameData();
          return;
        }

        const gameDataSnap = gameSnap.data() as GameData;
        const scores = scoresSnap.data() as { [key: string]: number };
        
        setGameData(gameDataSnap);
        setPlayerScores(scores);

        const playerOneScore = scores[gameDataSnap.playerOne] || 0;
        const playerTwoScore = scores[gameDataSnap.playerTwo] || 0;

        if (playerOneScore > playerTwoScore) {
          setWinner({
            name: gameDataSnap.playerOne,
            score: playerOneScore,
            isDraw: false,
          });
        } else if (playerTwoScore > playerOneScore) {
          setWinner({
            name: gameDataSnap.playerTwo,
            score: playerTwoScore,
            isDraw: false,
          });
        } else {
          setWinner({
            name: "It's a Draw!",
            score: playerOneScore,
            isDraw: true,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load game data");
        await cleanupGameData();
      }
    };

    fetchGameData();
  }, [userEmail, gameId]);

  const cleanupGameData = async () => {
    if (!userEmail || !gameId) return;

    try {
      await deleteDoc(doc(db, userEmail, gameId)).catch(() => {});
      await deleteDoc(doc(db, "games", gameId)).catch(() => {});
      await deleteDoc(doc(db, "playerPoints", gameId)).catch(() => {});
    } catch (error) {
      console.error("Cleanup error:", error);
    }

    router.push("/dashboard");
  };

  const handleEndGame = async () => {
    setShowEndModal(false);
    toast.success("Game Over! Well Played! 🎮");
    setTimeout(async () => {
      await cleanupGameData();
    }, 1500);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            Finalizing results...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] to-[#12152a] flex items-center justify-center">
        <div className="text-center bg-[#1e1e2f]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1e2a4a]">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-[#94a3b8] text-lg">Game data not available.</p>
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
        
        .winner-glow {
          animation: winnerPulse 2s ease-in-out infinite;
        }
        
        @keyframes winnerPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { text-shadow: 0 0 50px rgba(245, 158, 11, 0.8); }
        }
        
        .medal-spin {
          animation: medalSpin 1s ease-out;
        }
        
        @keyframes medalSpin {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        
        .confetti-bg {
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
        }
      `}</style>

      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "#1e1e2f",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #1e2a4a",
        }}
      />

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
                    <p className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Final Game</p>
                    <p className="text-white font-semibold truncate">{gameData.gameName}</p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard")}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                <FaGamepad className="text-white text-lg" />
              </div>
            </div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent hidden sm:block">IQ<span className="text-[#7c3aed]">PLAY</span></span>
          </div>

          <h1 className="font-display font-bold text-base sm:text-lg text-white/80 max-w-[200px] sm:max-w-md truncate">
            {gameData.gameName}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="md:hidden w-9 h-9 rounded-xl bg-[#1e1e2f]/80 border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
            >
              <FaBars size={18} />
            </button>
            <button
              onClick={() => setShowEndModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] text-white text-sm font-medium hover:shadow-lg transition"
            >
              <FaArrowLeft size={14} />
              End Game
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
          <div className="absolute inset-0 confetti-bg rounded-3xl pointer-events-none" />

          {/* Winner Celebration Card */}
          <div className="relative bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden shadow-2xl mb-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24]" />
            
            <div className="p-6 md:p-8 text-center">
              {/* Winner Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center medal-spin">
                    {winner?.isDraw ? (
                      <GiSwordClash className="text-white text-4xl" />
                    ) : (
                      <GiCrown className="text-white text-5xl" />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Winner Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {winner?.isDraw ? (
                  <>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-[#fbbf24] mb-2">It's a Draw! 🤝</h2>
                    <p className="text-[#94a3b8] text-lg">Both players fought valiantly</p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/30 mb-3">
                      <FaStar className="text-[#fbbf24] text-xs" />
                      <span className="text-[#fbbf24] text-xs font-medium">CHAMPION</span>
                      <FaStar className="text-[#fbbf24] text-xs" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold winner-glow text-[#fbbf24] mb-2">
                      {winner?.name}
                    </h2>
                    <p className="text-[#94a3b8] text-lg">is the Ultimate Champion!</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#c084fc]/20">
                      <FaTrophy className="text-[#fbbf24]" />
                      <span className="text-white font-semibold text-xl">{winner?.score} Points</span>
                      <FaFire className="text-[#ff6b8a]" />
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Players Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Player One Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-6 border ${
                !winner?.isDraw && winner?.name === gameData.playerOne
                  ? 'border-[#fbbf24] shadow-lg shadow-[#fbbf24]/20'
                  : 'border-[#1e2a4a]'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center ${
                  !winner?.isDraw && winner?.name === gameData.playerOne ? 'ring-2 ring-[#fbbf24]' : ''
                }`}>
                  <span className="text-white font-bold text-xl">
                    {gameData.playerOne?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[#94a3b8] text-xs uppercase tracking-wider">Player One</p>
                  <h3 className="font-display font-bold text-xl text-white">{gameData.playerOne}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdScoreboard className="text-[#94a3b8]" />
                  <span className="text-[#94a3b8]">Final Score</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-white">{playerScores[gameData.playerOne] || 0}</span>
                  <span className="text-[#94a3b8] text-sm ml-1">pts</span>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-[#1e2a4a] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((playerScores[gameData.playerOne] || 0) / Math.max(...Object.values(playerScores), 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full"
                />
              </div>
            </motion.div>

            {/* Player Two Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-6 border ${
                !winner?.isDraw && winner?.name === gameData.playerTwo
                  ? 'border-[#fbbf24] shadow-lg shadow-[#fbbf24]/20'
                  : 'border-[#1e2a4a]'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] flex items-center justify-center ${
                  !winner?.isDraw && winner?.name === gameData.playerTwo ? 'ring-2 ring-[#fbbf24]' : ''
                }`}>
                  <span className="text-white font-bold text-xl">
                    {gameData.playerTwo?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[#94a3b8] text-xs uppercase tracking-wider">Player Two</p>
                  <h3 className="font-display font-bold text-xl text-white">{gameData.playerTwo}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdScoreboard className="text-[#94a3b8]" />
                  <span className="text-[#94a3b8]">Final Score</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-white">{playerScores[gameData.playerTwo] || 0}</span>
                  <span className="text-[#94a3b8] text-sm ml-1">pts</span>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-[#1e2a4a] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((playerScores[gameData.playerTwo] || 0) / Math.max(...Object.values(playerScores), 1)) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#c084fc] to-[#7c3aed] rounded-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e2f] border border-[#1e2a4a]">
              <GiBattleAxe className="text-[#7c3aed]" />
              <span className="text-[#94a3b8] text-sm">Epic Battle</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e2f] border border-[#1e2a4a]">
              <GiChampions className="text-[#fbbf24]" />
              <span className="text-[#94a3b8] text-sm">Game Completed</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e2f] border border-[#1e2a4a]">
              <GiPartyPopper className="text-[#10b981]" />
              <span className="text-[#94a3b8] text-sm">Well Played</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all"
            >
              <FaGamepad size={16} />
              Play More Games
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEndModal(true)}
              className="px-6 py-3 rounded-xl bg-[#1e1e2f] border border-[#ff3b5c]/30 text-[#ff6b8a] font-semibold flex items-center justify-center gap-2 hover:bg-[#ff3b5c]/10 transition-all"
            >
              <FaArrowLeft size={14} />
              Exit to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEndModal(false)}
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
                  <GiPartyPopper className="text-[#ff6b8a] text-2xl" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">End Game Session?</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  This will save all final scores and end the game session.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEndModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1e1e2f] text-white font-medium hover:bg-[#2a2a3e] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEndGame}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] text-white font-medium hover:shadow-lg transition"
                  >
                    Yes, End Game
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