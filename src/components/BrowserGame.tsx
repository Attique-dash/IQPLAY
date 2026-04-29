// components/BrowserGame.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaSearch, FaGamepad, FaPlus, FaShoppingCart, FaPlay, FaCalendarAlt, FaStar } from "react-icons/fa";
import { GiSwordClash, GiBattleAxe } from "react-icons/gi";
import { MdGames, MdCategory } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BrowserGameProps {
  onShowDashboard: () => void;
  onShowBrowserGame: () => void;
}

export default function BrowserGame({ onShowDashboard, onShowBrowserGame }: BrowserGameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalGames, setTotalGames] = useState<number>(0);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const router = useRouter();

  const getQueryParams = () => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  };

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        auth.onAuthStateChanged(async (user) => {
          if (!user || !user.email) {
            router.push("/login");
            return;
          }

          const userEmail = user.email.replace(/\./g, "_");
          const userCollection = collection(db, userEmail);
          const querySnapshot = await getDocs(userCollection);

          if (querySnapshot.empty) {
            setError("No games found. Create your first game!");
            setGames([]);
            setFilteredGames([]);
          } else {
            const gamesData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setGames(gamesData);
            setFilteredGames(gamesData);
            setError(null);
          }

          await fetchTotalGames(user.email);
        });
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to fetch game data.");
      }
      setLoading(false);
    };

    fetchGames();
  }, [router]);

  const fetchTotalGames = async (email: string) => {
    try {
      const paymentsCollection = collection(db, "payments");
      const paymentsSnapshot = await getDocs(paymentsCollection);
      let total = 0;

      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userEmail === email) {
          const matches = String(data.package).match(/\d+/g);
          if (matches) {
            total += matches.reduce((sum, num) => sum + parseInt(num, 10), 0);
          }
        }
      });

      setTotalGames(total);
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setTotalGames(0);
    }
  };

  const handlePlayNow = (gameId: string) => {
    if (totalGames > 0) {
      router.push(`/usergame?gameId=${gameId}`);
    } else {
      setError("Please buy games first to play.");
    }
  };

  const handleCreateGame = () => {
    onShowDashboard();
  };

  const handleBuyGame = () => {
    const params = new URLSearchParams();
    params.set('showCards', 'true');
    router.push(`/?${params.toString()}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredGames(games);
      setError(null);
    } else {
      const filtered = games.filter((game) =>
        game.gameName.toLowerCase().includes(query)
      );
      setFilteredGames(filtered);

      if (filtered.length === 0) {
        setError("No matching game found.");
      } else {
        setError(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-[#1e2a4a] border-t-[#7c3aed] rounded-full mx-auto mb-4"
          />
          <p className="text-[#94a3b8]">Loading your games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-[#1e1e2f] to-[#0f1222] rounded-xl p-4 border border-[#1e2a4a]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
              <MdGames className="text-[#7c3aed] text-xl" />
            </div>
            <div>
              <p className="text-[#94a3b8] text-xs uppercase tracking-wider">Total Games Available</p>
              <p className="font-display text-2xl font-bold text-white">{totalGames}</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm" />
            <input
              type="text"
              placeholder="Search your game..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onHoverStart={() => setHoveredGame(game.id)}
              onHoverEnd={() => setHoveredGame(null)}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 via-transparent to-[#c084fc]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              
              <div className="relative bg-[#0f1222]/80 backdrop-blur-sm rounded-xl border border-[#1e2a4a] overflow-hidden transition-all duration-300 group-hover:border-[#7c3aed]/50">
                {/* Game Header */}
                <div className="bg-gradient-to-r from-[#1e1e2f] to-[#0f1222] p-4 border-b border-[#1e2a4a]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-white truncate">{game.gameName}</h3>
                    <div className="flex items-center gap-1 text-[#fbbf24] text-xs">
                      <FaStar size={10} />
                      <FaStar size={10} />
                      <FaStar size={10} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#94a3b8]">
                    <FaCalendarAlt size={10} />
                    <span>Created {new Date(game.createdAt?.toDate()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Game Categories Preview */}
                <div className="p-4">
                  <div className="flex items-center gap-1 text-[#94a3b8] text-xs mb-3">
                    <MdCategory size={12} />
                    <span>{game.selectedCards?.length || 0} Categories</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {game.selectedCards?.slice(0, 3).map((card: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <div className="relative h-16 rounded-lg overflow-hidden bg-[#1e1e2f]">
                          <img
                            src={card.image?.src || card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-[#94a3b8] mt-1 truncate">{card.title}</p>
                      </div>
                    ))}
                    {game.selectedCards?.length > 3 && (
                      <div className="flex items-center justify-center h-16 rounded-lg bg-[#1e1e2f] border border-dashed border-[#1e2a4a]">
                        <span className="text-[#c084fc] text-xs font-medium">
                          +{game.selectedCards.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Players Info */}
                <div className="px-4 pb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <GiSwordClash className="text-[#7c3aed]" />
                    <span className="text-[#94a3b8]">{game.playerOne}</span>
                  </div>
                  <span className="text-[#1e2a4a]">VS</span>
                  <div className="flex items-center gap-1">
                    <GiBattleAxe className="text-[#c084fc]" />
                    <span className="text-[#94a3b8]">{game.playerTwo}</span>
                  </div>
                </div>

                {/* Play Button */}
                <div className="p-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlayNow(game.id)}
                    disabled={totalGames === 0}
                    className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      totalGames > 0
                        ? "bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white hover:shadow-lg hover:shadow-[#7c3aed]/30"
                        : "bg-[#1e1e2f] text-[#4a5568] cursor-not-allowed border border-dashed border-[#1e2a4a]"
                    }`}
                  >
                    {totalGames > 0 ? (
                      <>
                        <FaPlay size={12} />
                        Play Game
                      </>
                    ) : (
                      <>
                        <FaShoppingCart size={12} />
                        Buy Games to Play
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Hover Effect Border */}
                {hoveredGame === game.id && (
                  <motion.div
                    layoutId="gameHover"
                    className="absolute inset-0 rounded-xl pointer-events-none"
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
      ) : (
        !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1e1e2f] flex items-center justify-center">
              <FaGamepad className="text-[#94a3b8] text-3xl" />
            </div>
            <p className="text-[#94a3b8] text-lg">No games found</p>
            <p className="text-[#4a5568] text-sm mt-1">Create your first game to get started</p>
          </div>
        )
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateGame}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
        >
          <FaPlus size={14} />
          Create New Game
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBuyGame}
          className="flex-1 py-3 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] text-[#c084fc] font-semibold flex items-center justify-center gap-2 hover:bg-[#2a2a3e] transition"
        >
          <FaShoppingCart size={14} />
          Buy More Games
        </motion.button>
      </div>
    </div>
  );
}