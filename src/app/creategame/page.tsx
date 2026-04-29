"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaGamepad, FaFire, FaTrophy, FaStar, FaPlay, FaArrowLeft, FaFlagCheckered } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdScoreboard } from "react-icons/md";
import { GiSwordClash, GiLightningBow, GiBrain, GiRibbonMedal } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

interface GameData {
  id: string;
  gameName: string;
  playerOne: string;
  playerTwo: string;
  selectedCards?: { image: string; title: string }[];
}

export default function UserGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<{
    [key: number]: number | null;
  }>({});
  const [playerScores, setPlayerScores] = useState<{
    [key: string]: number | null;
  }>({});
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [activePointCard, setActivePointCard] = useState<number | null>(null);

  const router = useRouter();
  const pointsList = [100, 250, 450, 600];

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
      try {
        const gameRef = doc(db, userEmail, gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
          setError("Game not found.");
          setLoading(false);
          return;
        }

        setGameData({ id: gameSnap.id, ...gameSnap.data() } as GameData);
      } catch (err) {
        setError("Failed to fetch game data.");
      }
      setLoading(false);
    };

    fetchGameData();
  }, [userEmail, gameId]);

  useEffect(() => {
    if (!gameId || !gameData) return;

    const fetchScores = async () => {
      try {
        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);

        if (scoresSnap.exists()) {
          const scoresData = scoresSnap.data();
          setPlayerScores({
            playerOne: scoresData?.[gameData.playerOne] || 0,
            playerTwo: scoresData?.[gameData.playerTwo] || 0,
          });
        } else {
          setPlayerScores({
            playerOne: 0,
            playerTwo: 0,
          });
        }
      } catch (err) {
        setError("Failed to fetch scores.");
      }
    };

    fetchScores();
  }, [gameId, gameData]);

  const handlePointSelection = (cardIndex: number, point: number) => {
    setSelectedPoints((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === point ? null : point,
    }));
    setActivePointCard(cardIndex);
    setTimeout(() => setActivePointCard(null), 300);
  };

  const handlePlay = (title: string, point: number) => {
    if (!gameData) return;
    router.push(
      `/question?title=${title}&difficulty=${point}&gameId=${gameId}&playerOne=${gameData.playerOne}&playerTwo=${gameData.playerTwo}`
    );
  };

  const ExitGame = () => {
    setShowExitModal(false);
    router.push("/dashboard");
  };

  const EndGame = () => {
    setShowEndModal(false);
    router.push(`/endgame?gameId=${gameId}`);
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
            Loading battlefield...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] to-[#12152a] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-[#1e1e2f]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#ff3b5c]/30"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-[#ff6b8a] font-semibold text-lg">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-2 bg-[#7c3aed] rounded-xl text-white font-medium hover:bg-[#6d28d9] transition"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .glow-text {
          text-shadow: 0 0 20px rgba(124,58,237,0.5);
        }
        
        .score-glow {
          box-shadow: 0 0 0 1px rgba(124,58,237,0.2), 0 0 0 3px rgba(124,58,237,0.1);
        }
        
        .card-glow {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-glow:hover {
          box-shadow: 0 20px 40px -12px rgba(124,58,237,0.25);
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
          animation: pulse-ring 2s infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0c15]/80 border-b border-[#1e2a4a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                <FaGamepad className="text-white text-lg" />
              </div>
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">IQ<span className="text-[#7c3aed]">PLAY</span></span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 font-display font-bold text-base sm:text-lg text-white/80 max-w-[200px] sm:max-w-md truncate"
          >
            {gameData?.gameName}
          </motion.h1>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#1e1e2f]/80 border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
            >
              {isSidebarOpen ? <IoMdClose size={18} /> : <FaBars size={18} />}
            </motion.button>

            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEndModal(true)}
                className="px-4 py-1.5 rounded-xl bg-[#1e1e2f] border border-[#7c3aed]/30 text-[#c084fc] text-sm font-medium hover:bg-[#7c3aed]/10 transition flex items-center gap-2"
              >
                <FaFlagCheckered size={14} />
                End Game
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExitModal(true)}
                className="px-4 py-1.5 rounded-xl bg-[#1e1e2f] border border-[#ff3b5c]/30 text-[#ff6b8a] text-sm font-medium hover:bg-[#ff3b5c]/10 transition flex items-center gap-2"
              >
                <FaArrowLeft size={14} />
                Exit
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed top-0 left-0 h-full w-72 bg-[#0f1222] border-r border-[#1e2a4a] shadow-2xl z-50 md:hidden"
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
                      onClick={() => setSidebarOpen(false)}
                      className="w-9 h-9 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8]"
                    >
                      <IoMdClose size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => { setShowEndModal(true); setSidebarOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl bg-[#1e1e2f] hover:bg-[#7c3aed]/10 transition flex items-center gap-3 text-[#c084fc]"
                    >
                      <FaFlagCheckered size={16} />
                      End Game
                    </button>
                    <button
                      onClick={() => { setShowExitModal(true); setSidebarOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl bg-[#1e1e2f] hover:bg-[#ff3b5c]/10 transition flex items-center gap-3 text-[#ff6b8a]"
                    >
                      <FaArrowLeft size={16} />
                      Exit Game
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Scoreboard */}
        {gameData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/20 via-transparent to-[#c084fc]/20 rounded-2xl blur-2xl" />
            <div className="relative bg-[#0f1222]/60 backdrop-blur-xl rounded-2xl border border-[#1e2a4a] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#c084fc] to-[#7c3aed]" />
              
              <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                {/* Player One */}
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-4 border border-[#7c3aed]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#7c3aed] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <GiSwordClash size={12} /> Champion
                      </span>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-[#fbbf24] text-xs" />
                        <FaStar className="text-[#fbbf24] text-xs" />
                        <FaStar className="text-[#fbbf24] text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">{gameData.playerOne}</h3>
                        <p className="text-[#94a3b8] text-xs mt-1">Player One</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#94a3b8] text-xs">Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-bold text-white">{playerScores.playerOne ?? 0}</span>
                          <span className="text-[#7c3aed] text-sm">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full blur-md opacity-60" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center shadow-lg">
                    <span className="font-display font-bold text-white text-sm tracking-wider">VS</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#fbbf24] flex items-center justify-center">
                    <GiLightningBow className="text-[#0a0c15] text-xs" />
                  </div>
                </div>

                {/* Player Two */}
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-br from-[#1e1e2f] to-[#0f1222] rounded-xl p-4 border border-[#c084fc]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#c084fc] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <GiRibbonMedal size={12} /> Challenger
                      </span>
                      <div className="flex items-center gap-1">
                        <FaFire className="text-[#ff6b8a] text-xs" />
                        <FaFire className="text-[#ff6b8a] text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">{gameData.playerTwo}</h3>
                        <p className="text-[#94a3b8] text-xs mt-1">Player Two</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#94a3b8] text-xs">Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-bold text-white">{playerScores.playerTwo ?? 0}</span>
                          <span className="text-[#c084fc] text-sm">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoreboard Footer */}
              <div className="border-t border-[#1e2a4a] px-6 py-3 flex items-center justify-between bg-[#0a0c15]/40">
                <div className="flex items-center gap-2 text-[#94a3b8] text-xs">
                  <MdScoreboard size={14} />
                  <span>Active Match</span>
                </div>
                <div className="flex items-center gap-2 text-[#94a3b8] text-xs">
                  <GiBrain size={14} />
                  <span>{gameData.selectedCards?.length || 0} Categories Left</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
              <FaTrophy className="text-[#7c3aed] text-sm" />
            </div>
            <h2 className="font-display font-bold text-xl text-white">Battle Categories</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
            <span>Select points to challenge</span>
          </div>
        </div>

        {/* Game Cards Grid */}
        {gameData && gameData.selectedCards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gameData.selectedCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 via-transparent to-[#c084fc]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="relative bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden transition-all duration-300 group-hover:border-[#7c3aed]/50">
                  {/* Card Header with Image */}
                  <div className="relative h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1222] via-transparent to-transparent z-10" />
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={400}
                      height={160}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-[#c084fc] font-medium">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <h3 className="font-display font-bold text-lg text-white drop-shadow-lg truncate">{card.title}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Points Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {pointsList.map((point) => (
                        <motion.button
                          key={point}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            selectedPoints[index] === point
                              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white shadow-lg shadow-[#7c3aed]/30'
                              : 'bg-[#1e1e2f] text-[#94a3b8] hover:bg-[#2a2a3e] hover:text-white border border-[#1e2a4a]'
                          }`}
                          onClick={() => handlePointSelection(index, point)}
                        >
                          {point}
                          {selectedPoints[index] === point && activePointCard === index && (
                            <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping" />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Play Button */}
                    <motion.button
                      whileHover={selectedPoints[index] ? { scale: 1.02 } : {}}
                      whileTap={selectedPoints[index] ? { scale: 0.98 } : {}}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                        selectedPoints[index]
                          ? 'bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white shadow-lg shadow-[#7c3aed]/40 hover:shadow-xl'
                          : 'bg-[#1e1e2f] text-[#4a5568] cursor-not-allowed border border-dashed border-[#1e2a4a]'
                      }`}
                      disabled={!selectedPoints[index]}
                      onClick={() => handlePlay(card.title, selectedPoints[index] as number)}
                    >
                      {selectedPoints[index] ? (
                        <>
                          <FaPlay size={12} />
                          <span>Play Challenge</span>
                          <span className="text-xs opacity-80">{selectedPoints[index]}pts</span>
                        </>
                      ) : (
                        <>
                          <GiSwordClash size={14} />
                          <span>Select Points to Battle</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Hover Effect Border */}
                  {hoveredCard === index && (
                    <motion.div
                      layoutId="cardHover"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ border: '1px solid rgba(124,58,237,0.4)', boxShadow: 'inset 0 0 20px rgba(124,58,237,0.1)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!gameData && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#1e1e2f] flex items-center justify-center">
              <GiBrain className="text-[#94a3b8] text-4xl" />
            </div>
            <p className="text-[#94a3b8] text-lg">No active game found</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-6 py-2 bg-[#7c3aed] rounded-xl text-white font-medium"
            >
              Return to Dashboard
            </button>
          </div>
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
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] rounded-t-2xl" />
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#ff3b5c]/20 flex items-center justify-center">
                  <FaArrowLeft className="text-[#ff6b8a] text-2xl" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Exit Game?</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Are you sure you want to exit? Your current progress will be saved.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1e1e2f] text-white font-medium hover:bg-[#2a2a3e] transition"
                  >
                    Cancel
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

      {/* End Game Confirmation Modal */}
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
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-t-2xl" />
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
                  <FaFlagCheckered className="text-[#c084fc] text-2xl" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">End Game?</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Are you sure you want to end this game? Final scores will be recorded.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEndModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1e1e2f] text-white font-medium hover:bg-[#2a2a3e] transition"
                  >
                    Continue Playing
                  </button>
                  <button
                    onClick={EndGame}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-medium hover:shadow-lg transition"
                  >
                    End Game
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