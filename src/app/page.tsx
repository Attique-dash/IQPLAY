"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import Header from "@/components/header";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/footer";
import coll from "../../public/images/collgame.png";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaTrophy, FaBolt, FaStar, FaArrowRight, FaCheckCircle, FaFire, FaUsers, FaClock } from "react-icons/fa";
import { GiSwordClash, GiCrown, GiBrain, GiBattleAxe } from "react-icons/gi";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [showCardsOnly, setShowCardsOnly] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setShowCardsOnly(params.get("showCards") === "true");
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else {
        setUserId(null);
        if (pathname !== "/") router.push("/login");
      }
    });
    return () => unsub();
  }, [pathname, router]);

  const Games = [
    { rs: "299 PKR", info: "Perfect for newcomers", pac: "2 Games", popular: false },
    { rs: "499 PKR", info: "Most popular choice", pac: "5 Games", popular: true },
    { rs: "799 PKR", info: "Best value bundle", pac: "10 Games", popular: false },
    { rs: "1199 PKR", info: "Ultimate champion pack", pac: "15 Games", popular: false },
  ];

  const handleNavigation = (path: string) => {
    if (userId) router.push(path);
    else router.push("/login");
  };

  const BuyGame = (game: { rs: string; pac: string }) => {
    if (userId) router.push(`/buygame?rs=${encodeURIComponent(game.rs)}&pac=${encodeURIComponent(game.pac)}&userId=${userId}`);
    else router.push("/login");
  };

  const features = [
    { icon: <FaGamepad />, bg: "rgba(124,58,237,0.15)", title: "Design Your Game", desc: "Pick 6 categories from 20+ options. Mix sports, gaming, and more for the perfect challenge." },
    { icon: <GiSwordClash />, bg: "rgba(245,158,11,0.15)", title: "Battle Head-to-Head", desc: "Two players compete across 36 unique questions. Strategy meets knowledge." },
    { icon: <GiCrown />, bg: "rgba(16,185,129,0.15)", title: "Claim Victory", desc: "Earn points based on accuracy and speed. Prove you're the champion." },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>

      <Header />

      {!showCardsOnly && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 pointer-events-none" />
            <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--accent)] rounded-full blur-[100px] opacity-20 animate-float" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px] opacity-10 animate-float" style={{ animationDelay: "2s" }} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 mb-6">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">Live Multiplayer Battles</span>
                  </div>
                  
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight mb-6">
                    Challenge Your
                    <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] bg-clip-text text-transparent"> Friends.</span>
                    <br />
                    <span className="bg-gradient-to-r from-[var(--accent2)] to-[var(--accent2)] bg-clip-text text-transparent">Prove</span> Your Genius.
                  </h1>
                  
                  <p className="text-[var(--text2)] text-lg mb-8 max-w-lg">
                    Design custom quiz games, pick your categories, and go head-to-head with anyone. 
                    The smartest player wins — do you have what it takes?
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation("/dashboard")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] text-white font-semibold flex items-center gap-2 hover:shadow-lg transition"
                    >
                      <FaGamepad size={16} />
                      Create a Game
                      <FaArrowRight size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation("/dashboard")}
                      className="px-6 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] font-semibold flex items-center gap-2 hover:bg-[var(--card2)] transition"
                    >
                      Browse Games
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { src: "/video/sport.mp4", label: "Sports", delay: 0 },
                      { src: "/video/mobile.mp4", label: "Mobile Games", delay: 0.1 },
                      { src: "/video/board.mp4", label: "Board Games", delay: 0.2 },
                      { src: "/video/win.mp4", label: "Win Prizes", delay: 0.3 },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="relative rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] group cursor-pointer"
                      >
                        <video src={item.src} loop muted autoPlay playsInline className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[var(--bg)]/60 backdrop-blur-sm text-[var(--text)] text-xs font-medium">
                          {item.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Marquee Ticker */}
          <div className="bg-[var(--surface)] border-y border-[var(--border)] py-3 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-8 px-4">
                  {["🏏 Cricket", "⚽ Football", "🏀 Basketball", "🎯 Chess", "🎱 Snooker", "🏆 Win Big", "🧠 IQ Test", "⚡ Fast Rounds", "🎮 Gaming", "📚 General Knowledge"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[var(--accent)] text-sm">✦</span>
                      <span className="text-[var(--text2)] text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 mb-4">
                  <GiBrain size={12} className="text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">How It Works</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                  Build. Battle.
                  <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] bg-clip-text text-transparent"> Become a Legend.</span>
                </h2>
                <p className="text-[var(--text2)] text-lg max-w-2xl mx-auto">
                  Three simple steps to the ultimate quiz showdown. No complicated setup — just pure competitive fun.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-[var(--card)]/60 backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--accent)', opacity: 0.15 }}>
                      <div className="text-[var(--accent)] text-xl">{feature.icon}</div>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--text)] mb-2">{feature.title}</h3>
                    <p className="text-[var(--text2)] text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)] rounded-xl overflow-hidden">
                {[
                  { num: "20+", label: "Game Categories", icon: <FaGamepad /> },
                  { num: "36", label: "Questions Per Game", icon: <GiBrain /> },
                  { num: "15s", label: "Per Round", icon: <FaClock /> },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[var(--card)] p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-[var(--accent)]">{stat.icon}</div>
                      <div className="font-display text-3xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] bg-clip-text text-transparent">
                        {stat.num}
                      </div>
                    </div>
                    <div className="text-[var(--text2)] text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Game Mode Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--surface)]/40">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent2)]/20 border border-[var(--accent2)]/30 mb-4">
                    <FaBolt size={10} className="text-[var(--accent2)]" />
                    <span className="text-xs font-medium text-[var(--accent2)] uppercase tracking-wider">Game Mode</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                    15 Seconds.
                    <span className="text-[var(--accent2)]"> One Answer.</span>
                    <br />
                    No Second Chances.
                  </h2>
                  <p className="text-[var(--text2)] text-lg mb-6">
                    Each question gives you 15 seconds to prove you know your stuff. Miss it and your opponent gains the edge.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {["⏱ 15s Timer", "🎯 MCQ Format", "📊 Live Scoring", "🔁 Unique Questions"].map((tag, i) => (
                      <div key={i} className="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text2)] text-sm">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigation("/dashboard")}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] text-white font-semibold flex items-center gap-2"
                  >
                    Start Playing Now
                    <FaArrowRight size={14} />
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
                    <video src="/video/sport.mp4" loop muted autoPlay playsInline className="w-full" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Packages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {showCardsOnly && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 p-4 rounded-xl bg-[var(--accent2)]/10 border border-[var(--accent2)]/30"
            >
              <p className="text-[var(--accent2)] font-medium">⚡ Purchase a package to start creating games</p>
            </motion.div>
          )}

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 mb-4">
              <FaTrophy size={12} className="text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">Game Packages</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
              Choose Your
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] bg-clip-text text-transparent"> Battle Pass</span>
            </h2>
            <p className="text-[var(--text2)] text-lg max-w-2xl mx-auto">
              Each package gives you a set of games to create and play. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Games.map((game, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative bg-[var(--card)]/80 backdrop-blur-sm rounded-xl border overflow-hidden transition-all ${
                  game.popular ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20" : "border-[var(--border)]"
                }`}
              >
                {game.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="px-3 py-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] text-white text-xs font-bold rounded-bl-lg flex items-center gap-1">
                      <FaFire size={10} />
                      Popular
                    </div>
                  </div>
                )}
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-h)] flex items-center justify-center">
                    <FaGamepad className="text-white text-2xl" />
                  </div>
                  <div className="font-display text-3xl font-bold text-[var(--text)] mb-1">
                    {game.pac.split(" ")[0]}
                    <span className="text-sm text-[var(--text2)]"> {game.pac.split(" ").slice(1).join(" ")}</span>
                  </div>
                  <div className="font-display text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] bg-clip-text text-transparent mb-2">
                    {game.rs}
                  </div>
                  <p className="text-[var(--text2)] text-sm mb-6">{game.info}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => BuyGame(game)}
                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      game.popular
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] text-white hover:shadow-lg"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--text2)] hover:text-[var(--text)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    Buy Now
                    <FaArrowRight size={12} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!showCardsOnly && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-h)]/10 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-h)] flex items-center justify-center animate-float">
                <FaTrophy className="text-white text-3xl" />
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
              Your Next
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] bg-clip-text text-transparent"> Victory</span>
              <br />
              Awaits
            </h2>
            <p className="text-[var(--text2)] text-lg mb-8">
              Join thousands of players who've proved their knowledge. Create your first game in under a minute.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation("/dashboard")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-h)] text-white font-semibold text-lg flex items-center justify-center gap-2 mx-auto hover:shadow-lg transition"
            >
              Create Your Game Now
              <FaArrowRight size={16} />
            </motion.button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}