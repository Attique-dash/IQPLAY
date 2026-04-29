"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection, addDoc, Timestamp, query, where,
  getDocs, updateDoc, DocumentReference, deleteDoc,
} from "firebase/firestore";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BrowserGame from "@/components/BrowserGame";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaPlus, FaTrophy, FaStar, FaFire, FaPlay, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { GiSwordClash, GiBattleAxe, GiCrown, GiLaurelCrown } from "react-icons/gi";
import { MdEmojiEvents, MdCategory } from "react-icons/md";

// image imports
import circ from "../../../public/images/Cricket.jpg";
import foot from "../../../public/images/Football.jpg";
import bask from "../../../public/images/Basketball.jpeg";
import tenn from "../../../public/images/Tennis.jpg";
import hock from "../../../public/images/Hockey.jpg";
import boxi from "../../../public/images/Boxing.jpg";
import cycl from "../../../public/images/Cycling.jpg";
import swim from "../../../public/images/Swimming.jpg";
import wres from "../../../public/images/Wrestling.jpg";
import raci from "../../../public/images/Racing.jpg";
import ludo from "../../../public/images/Ludo.jpg";
import subw from "../../../public/images/Subway Surfers.jpg";
import pubg from "../../../public/images/PUBG Mobile.jpg";
import ches from "../../../public/images/Chess.jpeg";
import carr from "../../../public/images/Carrom Board.jpg";
import tict from "../../../public/images/Tic-tac-toe.jpg";
import cube from "../../../public/images/rubik's cube.jpg";
import skat from "../../../public/images/Skating.jpg";
import base from "../../../public/images/Baseball.jpg";
import snoo from "../../../public/images/Snooker.jpg";

export default function Dashboard() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<{ title: string; image: any }[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [view, setView] = useState<"browser" | "create">("browser");
  const [gameData, setGameData] = useState({ gameName: "", playerOne: "", playerTwo: "" });
  const [hasGames, setHasGames] = useState(false);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        try {
          const email = user.email!;
          const sanitizedEmail = email.replace(/\./g, "_");
          const gamesSnap = await getDocs(collection(db, sanitizedEmail));
          setHasGames(!gamesSnap.empty);

          const paymentsQuery = query(collection(db, "payments"), where("userEmail", "==", email));
          const paymentsSnap = await getDocs(paymentsQuery);
          let totalGames = 0;
          paymentsSnap.forEach(d => {
            const match = String(d.data().package).match(/\d+/);
            if (match) totalGames += parseInt(match[0]);
          });
          setHasPurchase(totalGames > 0);
        } catch {}
        setCheckingStatus(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  const cards = [
    { image: circ, title: "Cricket" }, { image: foot, title: "Football" },
    { image: bask, title: "Basketball" }, { image: tenn, title: "Tennis" },
    { image: hock, title: "Hockey" }, { image: boxi, title: "Boxing" },
    { image: cycl, title: "Cycling" }, { image: swim, title: "Swimming" },
    { image: wres, title: "Wrestling" }, { image: raci, title: "Racing" },
    { image: ludo, title: "Ludo" }, { image: subw, title: "Subway Surfers" },
    { image: pubg, title: "PUBG Mobile" }, { image: ches, title: "Chess" },
    { image: carr, title: "Carrom Board" }, { image: tict, title: "Tic-tac-toe" },
    { image: cube, title: "Rubik's Cube" }, { image: skat, title: "Skating" },
    { image: base, title: "Baseball" }, { image: snoo, title: "Snooker" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameData({ ...gameData, [e.target.name]: e.target.value });
  };

  const handleSelectCard = (card: { title: string; image: any }) => {
    setSelectedCards(prev => {
      const exists = prev.some(c => c.title === card.title);
      if (exists) return prev.filter(c => c.title !== card.title);
      if (prev.length < 6) return [...prev, card];
      toast.warning("Maximum 6 categories allowed");
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!gameData.gameName.trim()) { toast.error("Please enter a game name"); return; }
    if (!gameData.playerOne.trim()) { toast.error("Please enter Player 1 name"); return; }
    if (!gameData.playerTwo.trim()) { toast.error("Please enter Player 2 name"); return; }
    if (selectedCards.length !== 6) { toast.error(`Select exactly 6 categories (${selectedCards.length} selected)`); return; }
    if (!userEmail) { toast.error("Authentication error. Please login again."); return; }

    try {
      const sanitizedEmail = userEmail.replace(/\./g, "_");
      const userGameCollection = collection(db, sanitizedEmail);
      const querySnapshot = await getDocs(userGameCollection);
      const existingGame = querySnapshot.docs.some(d => d.data().gameName.toLowerCase() === gameData.gameName.toLowerCase());
      if (existingGame) { toast.error("Game name already exists"); return; }

      const correctEmail = userEmail.replace(/_/g, ".");
      const paymentsRef = collection(db, "payments");
      const paymentsQuery = query(paymentsRef, where("userEmail", "==", correctEmail));
      const paymentsSnap = await getDocs(paymentsQuery);

      let hasValidPackage = false;
      let docToUpdate: DocumentReference | null = null;
      let currentPackageValue: string | null = null;
      let docsToDelete: DocumentReference[] = [];

      if (!paymentsSnap.empty) {
        for (const doc of paymentsSnap.docs) {
          const data = doc.data();
          if (data.userEmail === correctEmail && typeof data.package === "string") {
            const match = data.package.match(/\d+/);
            if (match && parseInt(match[0], 10) === 0) docsToDelete.push(doc.ref);
          }
        }
        if (docsToDelete.length > 0) await Promise.all(docsToDelete.map(d => deleteDoc(d)));
        const updatedSnap = await getDocs(paymentsQuery);
        for (const doc of updatedSnap.docs) {
          const data = doc.data();
          if (data.userEmail === correctEmail && typeof data.package === "string") {
            const match = data.package.match(/\d+/);
            if (match && parseInt(match[0], 10) > 0) {
              docToUpdate = doc.ref;
              currentPackageValue = data.package;
              hasValidPackage = true;
              break;
            }
          }
        }
      }

      if (!hasValidPackage) {
        toast.error("Please buy a game package first");
        router.push("/?showCards=true");
        return;
      }

      const docRef = await addDoc(userGameCollection, { ...gameData, selectedCards, createdAt: Timestamp.now() });

      if (docToUpdate && currentPackageValue) {
        const match = currentPackageValue.match(/\d+/);
        if (match) await updateDoc(docToUpdate, { package: `${parseInt(match[0], 10) - 1} Games` });
      }

      toast.success("Game created successfully!");
      setTimeout(() => {
        router.push(`/usergame?gameId=${docRef.id}`);
      }, 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (checkingStatus) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#0a0c15] via-[#12152a] to-[#0a0c15]">
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
              Loading your dashboard...
            </motion.p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isNewUser = !hasGames && !hasPurchase;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
        }
      `}</style>

      <Header />
      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "#1e1e2f",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #1e2a4a",
        }}
      />
      
      <div className="dashboard-container">
        {isNewUser ? (
          // New User Onboarding
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[70vh] flex items-center justify-center"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center shadow-2xl"
              >
                <FaGamepad className="text-white text-4xl" />
              </motion.div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent mb-4">
                Welcome to IQPLAY
              </h1>
              <p className="text-[#94a3b8] text-lg mb-8 max-w-2xl mx-auto">
                Your ultimate quiz battle platform! Challenge friends, test your knowledge, and climb the leaderboard.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { icon: "💰", title: "Buy Package", desc: "Choose a game bundle that fits your needs", color: "from-[#fbbf24] to-[#f59e0b]" },
                  { icon: "⚙️", title: "Create Game", desc: "Set up your quiz and choose 6 categories", color: "from-[#7c3aed] to-[#c084fc]" },
                  { icon: "🏆", title: "Battle & Win", desc: "Answer questions and claim victory", color: "from-[#10b981] to-[#34d399]" },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-[#0f1222]/80 backdrop-blur-sm rounded-xl p-6 border border-[#1e2a4a] hover:border-[#7c3aed]/50 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 mx-auto`}>
                      <span className="text-white text-xl">{step.icon}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-[#94a3b8] text-sm">{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/?showCards=true")}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-lg flex items-center justify-center gap-2 mx-auto hover:shadow-lg transition-all"
              >
                Get Started
                <FaArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Existing User Dashboard
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Header */}
            <div className="mb-8 mt-[50px]">
              <div className="flex items-center gap-2 text-[#7c3aed] text-sm font-semibold uppercase tracking-wider mb-2">
                <FaTrophy size={14} />
                <span>Dashboard</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
                Ready to Battle?
              </h1>
              <p className="text-[#94a3b8] mt-2">Create a new game or continue an existing one</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-[#1e2a4a]">
              <button
                onClick={() => setView("browser")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all flex items-center gap-2 ${
                  view === "browser"
                    ? "bg-[#7c3aed]/20 text-[#7c3aed] border-b-2 border-[#7c3aed]"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                <FaGamepad size={16} />
                My Games
              </button>
              <button
                onClick={() => setView("create")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all flex items-center gap-2 ${
                  view === "create"
                    ? "bg-[#7c3aed]/20 text-[#7c3aed] border-b-2 border-[#7c3aed]"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                <FaPlus size={16} />
                Create Game
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {view === "browser" ? (
                <motion.div
                  key="browser"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BrowserGame
                    onShowDashboard={() => setView("create")}
                    onShowBrowserGame={() => setView("browser")}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Create Game Form */}
                  <div className="bg-[#0f1222]/60 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8">
                    <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <GiSwordClash className="text-[#7c3aed]" />
                      Game Setup
                    </h2>

                    {/* Game Name */}
                    <div className="mb-6">
                      <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                        Game Name
                      </label>
                      <input
                        type="text"
                        name="gameName"
                        value={gameData.gameName}
                        onChange={handleChange}
                        placeholder="Enter a memorable name for your battle..."
                        className="w-full px-4 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
                      />
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                          Player One
                        </label>
                        <input
                          type="text"
                          name="playerOne"
                          value={gameData.playerOne}
                          onChange={handleChange}
                          placeholder="Enter first player's name"
                          className="w-full px-4 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                          Player Two
                        </label>
                        <input
                          type="text"
                          name="playerTwo"
                          value={gameData.playerTwo}
                          onChange={handleChange}
                          placeholder="Enter second player's name"
                          className="w-full px-4 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
                        />
                      </div>
                    </div>

                    {/* Categories Selection */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MdCategory className="text-[#7c3aed] text-xl" />
                          <h3 className="font-display font-bold text-white text-lg">
                            Select 6 Categories
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-[#1e2a4a] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full transition-all"
                              style={{ width: `${(selectedCards.length / 6) * 100}%` }}
                            />
                          </div>
                          <span className="text-[#c084fc] font-bold text-sm">
                            {selectedCards.length}/6
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a] mb-6">
                        <p className="text-[#94a3b8] text-sm flex items-center gap-2">
                          <FaFire className="text-[#fbbf24]" />
                          Each player gets <strong className="text-white">3 categories</strong> with <strong className="text-white">6 questions each</strong> — <strong className="text-white">36 questions</strong> total battle!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {cards.map((card, idx) => {
                          const isSelected = selectedCards.some(s => s.title === card.title);
                          const isDisabled = selectedCards.length >= 6 && !isSelected;
                          return (
                            <motion.div
                              key={idx}
                              whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                              onHoverStart={() => setHoveredCard(idx)}
                              onHoverEnd={() => setHoveredCard(null)}
                              className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                                isSelected
                                  ? "ring-2 ring-[#c084fc] ring-offset-2 ring-offset-[#0a0c15]"
                                  : isDisabled
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:ring-1 hover:ring-[#1e2a4a]"
                              }`}
                              onClick={() => !isDisabled && handleSelectCard(card)}
                            >
                              <div className="relative h-28 overflow-hidden bg-[#1e1e2f]">
                                <img
                                  src={card.image.src}
                                  alt={card.title}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-[#7c3aed]/40 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-[#c084fc] flex items-center justify-center">
                                      <FaCheckCircle className="text-white text-sm" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2 text-center">
                                <p className={`text-xs font-medium truncate ${
                                  isSelected ? "text-[#c084fc]" : "text-[#94a3b8]"
                                }`}>
                                  {card.title}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-lg flex items-center justify-center gap-2 mx-auto hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all"
                      >
                        <FaPlay size={14} />
                        Launch Game
                      </motion.button>
                      {selectedCards.length > 0 && selectedCards.length < 6 && (
                        <p className="mt-3 text-[#94a3b8] text-sm">
                          {6 - selectedCards.length} more {6 - selectedCards.length === 1 ? "category" : "categories"} needed
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}