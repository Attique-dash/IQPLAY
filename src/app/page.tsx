"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import Header from "@/components/header";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/footer";
import coll from "../../public/images/collgame.png";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showCardsOnly, setShowCardsOnly] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const categories = ["Sports", "Mobile", "Board", "Strategy"];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setShowCardsOnly(params.get("showCards") === "true");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else {
        setUserId(null);
        if (pathname !== "/") router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const Games = [
    { rs: "300 Rs", info: "Perfect starter pack for new challengers", pac: "2 Games", popular: false },
    { rs: "500 Rs", info: "Most popular choice for regular players", pac: "5 Games", popular: true },
    { rs: "800 Rs", info: "Level up your game collection", pac: "10 Games", popular: false },
    { rs: "1200 Rs", info: "Ultimate bundle for hardcore champions", pac: "15 Games", popular: false },
  ];

  const handleNavigation = (path: string) => {
    if (userId) router.push(path);
    else router.push("/login");
  };

  const BuyGame = (game: { rs: string; pac: string }) => {
    if (userId) {
      router.push(`/buygame?rs=${encodeURIComponent(game.rs)}&pac=${encodeURIComponent(game.pac)}&userId=${userId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --ink: #0a0a0f;
          --surface: #0f1117;
          --card: #161b27;
          --border: rgba(255,255,255,0.07);
          --accent: #4f6ef7;
          --accent2: #f7c948;
          --accent3: #f75c4f;
          --text: #e8eaf0;
          --muted: #6b7280;
          --glow: rgba(79, 110, 247, 0.15);
        }

        * { box-sizing: border-box; }
        body { background: var(--ink) !important; font-family: 'Outfit', sans-serif; color: var(--text); }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          min-height: 85vh;
          padding: 4rem 6rem;
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; padding: 3rem 2rem; min-height: auto; gap: 2rem; }
          .hero-visual { display: none; }
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(79,110,247,0.12);
          border: 1px solid rgba(79,110,247,0.3);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #7d9aff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .hero-eyebrow::before {
          content: '';
          width: 6px; height: 6px;
          background: #4f6ef7;
          border-radius: 50%;
          box-shadow: 0 0 8px #4f6ef7;
          animation: blink 1.5s ease infinite;
        }

        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.05;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }

        .hero-title .line-accent { color: var(--accent); }
        .hero-title .line-gold { color: var(--accent2); }

        .hero-desc {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--muted);
          margin-bottom: 2.5rem;
          max-width: 480px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 0 0 rgba(79,110,247,0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(79,110,247,0.4);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
        }

        .hero-visual {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          position: relative;
        }

        .video-card {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          position: relative;
          background: var(--card);
          transition: transform 0.3s ease;
        }

        .video-card:hover { transform: translateY(-4px); }
        .video-card:nth-child(1) { margin-top: 30px; }
        .video-card:nth-child(4) { margin-top: 30px; }

        .video-card video { width: 100%; height: 160px; object-fit: cover; display: block; }

        .video-label {
          position: absolute;
          bottom: 10px;
          left: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1rem;
        }

        .section-tag::after {
          content: '';
          width: 40px;
          height: 1px;
          background: var(--accent);
          opacity: 0.4;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 3rem;
        }

        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        .feature-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover { border-color: rgba(79,110,247,0.2); transform: translateY(-4px); }

        .feature-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 1rem;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .feature-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.6; }

        .packages-section {
          padding: 6rem 2rem;
          background: linear-gradient(180deg, var(--ink) 0%, var(--surface) 50%, var(--ink) 100%);
          position: relative;
        }

        .packages-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(79,110,247,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 3rem;
        }

        @media (max-width: 1000px) {
          .packages-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .packages-grid { grid-template-columns: 1fr; }
        }

        .package-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .package-card:hover {
          transform: translateY(-8px);
          border-color: rgba(79,110,247,0.3);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .package-card.popular {
          border-color: var(--accent);
          box-shadow: 0 0 30px rgba(79,110,247,0.15);
        }

        .popular-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: var(--accent);
          color: white;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .package-img {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .package-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.5) saturate(1.3);
          margin: 0;
          display: block;
        }

        .package-img-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
        }

        .package-count {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .package-count span {
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.8;
          display: block;
          margin-top: 2px;
        }

        .package-body { padding: 20px; }

        .package-price {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--accent2);
          margin-bottom: 6px;
        }

        .package-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }

        .btn-buy {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-buy-primary {
          background: var(--accent);
          color: white;
        }

        .btn-buy-primary:hover {
          background: #3d58e0;
          transform: translateY(-1px);
        }

        .btn-buy-secondary {
          background: rgba(255,255,255,0.06);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-buy-secondary:hover {
          background: rgba(255,255,255,0.1);
        }

        .divider-section {
          padding: 6rem 2rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--border);
          border-radius: 20px;
          overflow: hidden;
          margin-top: 3rem;
        }

        @media (max-width: 600px) {
          .stats-row { grid-template-columns: 1fr; }
        }

        .stat-item {
          background: var(--card);
          padding: 2.5rem;
          text-align: center;
        }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label { font-size: 0.9rem; color: var(--muted); font-weight: 500; }

        .section-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }

        .section-sub {
          font-size: 1.05rem;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.7;
        }

        .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-section { background: var(--ink); position: relative; overflow: hidden; }
        .hero-bg-glow {
          position: absolute;
          top: -200px; right: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(79,110,247,0.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-bg-glow2 {
          position: absolute;
          bottom: -300px; left: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(247,201,72,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        .mid-section {
          padding: 6rem 2rem;
          background: var(--surface);
        }

        .mid-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        @media (max-width: 800px) {
          .mid-inner { grid-template-columns: 1fr; gap: 2rem; }
          .mid-visual { display: none; }
        }

        .mid-visual {
          position: relative;
        }

        .mid-visual-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
        }

        .mid-visual-card video {
          width: 100%;
          height: 300px;
          object-fit: cover;
          display: block;
          margin: 0;
        }

        .floating-badge {
          position: absolute;
          bottom: -16px; left: 30px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }

        .badge-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--accent), #7c5cfc);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .badge-text .t1 { font-size: 0.8rem; color: var(--muted); }
        .badge-text .t2 { font-size: 1rem; font-weight: 700; color: var(--text); }

        .pill-tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid var(--border);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted);
          background: rgba(255,255,255,0.03);
        }

        .pill .dot { width: 6px; height: 6px; border-radius: 50%; }

        .ticker {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .ticker-inner {
          display: inline-flex;
          gap: 40px;
          animation: ticker 20s linear infinite;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .ticker-inner span { color: var(--accent2); }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .cta-section {
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-inner {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 800px; height: 400px;
          background: radial-gradient(ellipse, rgba(79,110,247,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .inline-accent { color: var(--accent); }
        .inline-gold { color: var(--accent2); }
        .inline-red { color: var(--accent3); }
      `}</style>

      <Header />

      {!showCardsOnly && (
        <>
          {/* HERO */}
          <section className="hero-section">
            <div className="hero-bg-glow" />
            <div className="hero-bg-glow2" />
            <div className="hero-grid">
              <div>
                <div className="hero-eyebrow">Live Multiplayer Quiz Platform</div>
                <h1 className="hero-title">
                  Challenge Your<br/>
                  <span className="line-accent">Friends.</span>{" "}
                  <span className="line-gold">Prove</span><br/>
                  Your Genius.
                </h1>
                <p className="hero-desc">
                  Design custom quiz games, pick your categories, and go head-to-head with anyone. The smartest player wins — do you have what it takes?
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => handleNavigation("/dashboard")}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                    </svg>
                    Create a Game
                  </button>
                  <button className="btn-secondary" onClick={() => handleNavigation("/dashboard")}>
                    Browse Games
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="hero-visual">
                {[
                  { src: "/video/sport.mp4", label: "Sports" },
                  { src: "/video/mobile.mp4", label: "Mobile Games" },
                  { src: "/video/board.mp4", label: "Board Games" },
                  { src: "/video/win.mp4", label: "Win Prizes" },
                ].map((item, i) => (
                  <div key={i} className="video-card">
                    <video src={item.src} loop muted autoPlay playsInline />
                    <div className="video-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TICKER */}
          <div className="ticker">
            <div className="ticker-inner">
              {Array(4).fill(["🏏 Cricket", "⚽ Football", "🏀 Basketball", "🎯 Chess", "🎱 Snooker", "🏆 Win Big", "🧠 IQ Test", "⚡ Fast Rounds"]).flat().map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          <section className="mid-section">
            <div className="section-container">
              <div className="section-tag">How it works</div>
              <h2 className="section-heading">
                Build. Battle.<br/>
                <span className="inline-accent">Become a Legend.</span>
              </h2>
              <p className="section-sub">
                Three steps to the ultimate quiz showdown. No complicated setup, just pure competitive fun.
              </p>
              <div className="feature-grid">
                {[
                  { icon: "🎮", bg: "rgba(79,110,247,0.15)", title: "Design Your Game", desc: "Choose 6 categories from 20+ options. Mix sports, mobile games, board games and more for the perfect challenge." },
                  { icon: "⚔️", bg: "rgba(247,201,72,0.12)", title: "Battle Head-to-Head", desc: "Two players compete across 36 unique questions. Each player gets 3 dedicated categories — strategy matters." },
                  { icon: "🏆", bg: "rgba(247,92,79,0.12)", title: "Claim Your Victory", desc: "Earn points based on speed and accuracy. The smartest and fastest player wins the ultimate bragging rights." },
                ].map((f, i) => (
                  <div key={i} className="feature-card">
                    <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="stats-row" style={{ marginTop: '4rem' }}>
                {[
                  { num: "20+", label: "Game Categories" },
                  { num: "36", label: "Questions Per Game" },
                  { num: "4", label: "Difficulty Levels" },
                ].map((s, i) => (
                  <div key={i} className="stat-item">
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* MID SECTION */}
          <section className="divider-section">
            <div className="mid-inner">
              <div>
                <div className="section-tag">Game Mode</div>
                <h2 className="section-heading">
                  15 Seconds.<br/>
                  <span className="inline-gold">One Answer.</span><br/>
                  No Second Chances.
                </h2>
                <p className="section-sub" style={{ marginBottom: '1.5rem' }}>
                  The clock is ticking. Each question gives you 15 seconds to prove you know your stuff. Mess up? Your opponent gains the edge.
                </p>
                <div className="pill-tags">
                  {["⏱ 15s Timer", "💡 3 Lifelines", "🎯 MCQ Format", "📊 Live Scoring", "🔁 New Questions Each Round"].map((p, i) => (
                    <div key={i} className="pill">
                      <div className="dot" style={{ background: ['#4f6ef7','#f7c948','#f75c4f','#4ade80','#a78bfa'][i] }} />
                      {p}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn-primary" onClick={() => handleNavigation("/dashboard")}>
                    Start Playing Now →
                  </button>
                </div>
              </div>

              <div className="mid-visual">
                <div className="mid-visual-card">
                  <video src="/video/sport.mp4" loop muted autoPlay playsInline />
                </div>
                <div className="floating-badge">
                  <div className="badge-icon">🏆</div>
                  <div className="badge-text">
                    <div className="t1">Last Winner</div>
                    <div className="t2">600 Points Scored!</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* PACKAGES */}
      <section className="packages-section">
        <div className="section-container">
          {showCardsOnly && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(247,92,79,0.12)',
                border: '1px solid rgba(247,92,79,0.3)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#f75c4f',
                fontWeight: 600,
                marginBottom: '2rem',
                fontSize: '1rem'
              }}>
                ⚡ Purchase a package to start creating games
              </div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>Game Packages</div>
            <h2 className="section-heading">
              Choose Your <span className="inline-accent">Battle Pass</span>
            </h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Each package gives you a set of games to create and play. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="packages-grid">
            {Games.map((game, index) => (
              <div key={index} className={`package-card ${game.popular ? 'popular' : ''}`}>
                {game.popular && <div className="popular-badge">Most Popular</div>}
                <div className="package-img">
                  <img src={coll.src} alt="Package" />
                  <div className="package-img-overlay">
                    <div className="package-count">
                      {game.pac.split(' ')[0]}
                      <span>{game.pac.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="package-body">
                  <div className="package-price">{game.rs}</div>
                  <div className="package-desc">{game.info}</div>
                  <button
                    className={`btn-buy ${game.popular ? 'btn-buy-primary' : 'btn-buy-secondary'}`}
                    onClick={() => BuyGame(game)}
                  >
                    <svg width="14" height="14" viewBox="0 0 18 21" fill="currentColor">
                      <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z"/>
                    </svg>
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!showCardsOnly && (
        <section className="cta-section">
          <div className="cta-glow" />
          <div className="cta-inner">
            <div className="section-tag" style={{ justifyContent: 'center' }}>Ready to Play?</div>
            <h2 className="section-heading">
              Your Next <span className="inline-accent">Victory</span> Awaits
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join thousands of players who've proven their knowledge. Create your first game in under a minute.
            </p>
            <button className="btn-primary" style={{ margin: '0 auto', fontSize: '1.1rem', padding: '16px 36px' }} onClick={() => handleNavigation("/dashboard")}>
              Create Your Game Now →
            </button>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}