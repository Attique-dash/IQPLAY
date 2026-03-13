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
import Image from "next/image";
import Footer from "@/components/footer";
import BrowserGame from "@/components/BrowserGame";

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
import bgvs from "../../../public/images/bgvs.png";
import ftvs from "../../../public/images/ftvs.jpg";

export default function Dashboard() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<{ title: string; image: any }[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showBroGame, setShowBroGame] = useState(true);
  const [gameData, setGameData] = useState({ gameName: "", playerOne: "", playerTwo: "" });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
      else router.push("/login");
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
              docToUpdate = doc.ref; currentPackageValue = data.package; hasValidPackage = true; break;
            }
          }
        }
      }

      if (!hasValidPackage) { toast.error("Please buy a game package first"); router.push("/?showCards=true"); return; }

      const docRef = await addDoc(userGameCollection, { ...gameData, selectedCards, createdAt: Timestamp.now() });

      if (docToUpdate && currentPackageValue) {
        const match = currentPackageValue.match(/\d+/);
        if (match) {
          await updateDoc(docToUpdate, { package: `${parseInt(match[0], 10) - 1} Games` });
        }
      }

      toast.success("Game created! Let's play!");
      router.push(`/creategame?gameId=${docRef.id}`);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: #070709; color: #e8eaf0; }

        .dash-root { min-height: 100vh; background: #070709; }

        .setup-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .setup-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4f6ef7;
          margin-bottom: 0.75rem;
          text-align: center;
        }

        .setup-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          text-align: center;
          margin-bottom: 3rem;
        }

        .setup-title span { color: #4f6ef7; }

        .players-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          margin-bottom: 3rem;
        }

        @media (max-width: 700px) {
          .players-grid { grid-template-columns: 1fr; }
          .vs-center { display: none; }
        }

        .input-section {}

        .input-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 8px;
          display: block;
        }

        .input-label.yellow { color: #f7c948; }
        .input-label.blue { color: #4f6ef7; }

        .player-input {
          width: 100%;
          padding: 15px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          font-size: 1.05rem;
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
          transition: all 0.2s;
          outline: none;
        }

        .player-input:focus {
          border-color: rgba(79,110,247,0.5);
          background: rgba(79,110,247,0.04);
          box-shadow: 0 0 0 3px rgba(79,110,247,0.1);
        }

        .player-input::placeholder { color: #374151; }
        .player-input.yellow:focus { border-color: rgba(247,201,72,0.5); box-shadow: 0 0 0 3px rgba(247,201,72,0.08); }

        .vs-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .vs-badge {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f7c948, #f75c4f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gamename-wrap {
          max-width: 500px;
          margin: 0 auto 3rem;
          text-align: center;
        }

        .game-name-input {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          font-size: 1.1rem;
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
          text-align: center;
          transition: all 0.2s;
          outline: none;
          letter-spacing: 0.02em;
        }

        .game-name-input:focus {
          border-color: rgba(247,201,72,0.5);
          background: rgba(247,201,72,0.03);
          box-shadow: 0 0 0 3px rgba(247,201,72,0.08);
        }

        .game-name-input::placeholder { color: #374151; }

        .categories-section {
          padding: 3rem 2rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .cat-header {
          max-width: 1100px;
          margin: 0 auto 1.5rem;
        }

        .cat-info {
          max-width: 1100px;
          margin: 0 auto 2.5rem;
        }

        .cat-info-inner {
          background: rgba(79,110,247,0.06);
          border: 1px solid rgba(79,110,247,0.15);
          border-radius: 16px;
          padding: 20px 24px;
          font-size: 0.95rem;
          color: #9ca3af;
          line-height: 1.7;
        }

        .cat-info-inner strong { color: #c7d2fe; }

        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
        }

        .progress-bar-bg {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f6ef7, #7c5cfc);
          border-radius: 100px;
          transition: width 0.3s ease;
        }

        .progress-count {
          font-size: 12px;
          font-weight: 700;
          color: #4f6ef7;
          min-width: 40px;
          text-align: right;
        }

        .cards-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1000px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 750px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 500px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }

        .game-card {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .game-card:hover:not(.disabled) {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.12);
        }

        .game-card.selected {
          border-color: #f7c948;
          box-shadow: 0 0 0 1px #f7c948, 0 8px 30px rgba(247,201,72,0.15);
        }

        .game-card.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .card-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
          margin: 0;
          transition: transform 0.3s ease;
        }

        .game-card:hover:not(.disabled) .card-img { transform: scale(1.05); }

        .card-img-wrap { overflow: hidden; position: relative; }

        .selected-overlay {
          position: absolute;
          inset: 0;
          background: rgba(247,201,72,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selected-check {
          width: 28px; height: 28px;
          background: #f7c948;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #000;
        }

        .card-name {
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #9ca3af;
          text-align: center;
        }

        .game-card.selected .card-name { color: #f7c948; }

        .start-btn-wrap {
          text-align: center;
          padding: 3rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .start-btn {
          padding: 16px 48px;
          background: linear-gradient(135deg, #4f6ef7, #7c5cfc);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.01em;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(79,110,247,0.4);
        }

        .start-btn:active { transform: translateY(0); }

        .tab-bar {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 4px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 2rem;
        }

        .tab-btn {
          padding: 14px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }

        .tab-btn.active { color: #4f6ef7; border-bottom-color: #4f6ef7; }
        .tab-btn:hover:not(.active) { color: #9ca3af; }
      `}</style>

      <Header />
      <ToastContainer position="top-center" />

      <div className="dash-root">
        {showBroGame ? (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
            <BrowserGame
              onShowDashboard={() => setShowBroGame(false)}
              onShowBrowserGame={() => setShowBroGame(true)}
            />
          </div>
        ) : (
          <>
            <div className="setup-section">
              <div className="setup-eyebrow">New Game Setup</div>
              <h1 className="setup-title">Who's Playing<br/><span>Today?</span></h1>

              <div className="gamename-wrap">
                <label className="input-label" style={{ textAlign: 'center', color: '#f7c948' }}>Game Name</label>
                <input
                  className="game-name-input"
                  type="text"
                  name="gameName"
                  value={gameData.gameName}
                  onChange={handleChange}
                  placeholder="Enter a name for this game..."
                />
              </div>

              <div className="players-grid">
                <div className="input-section">
                  <label className="input-label yellow">⚡ Player One</label>
                  <input
                    className="player-input yellow"
                    type="text"
                    name="playerOne"
                    value={gameData.playerOne}
                    onChange={handleChange}
                    placeholder="First player's name..."
                  />
                </div>

                <div className="vs-center">
                  <div className="vs-badge">VS</div>
                </div>

                <div className="input-section">
                  <label className="input-label blue">🎯 Player Two</label>
                  <input
                    className="player-input"
                    type="text"
                    name="playerTwo"
                    value={gameData.playerTwo}
                    onChange={handleChange}
                    placeholder="Second player's name..."
                  />
                </div>
              </div>
            </div>

            <div className="categories-section">
              <div className="cat-header">
                <div className="setup-eyebrow" style={{ textAlign: 'left' }}>Step 2 of 2</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  Choose Your <span style={{ color: '#4f6ef7' }}>6 Categories</span>
                </h2>
                <div className="progress-indicator">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(selectedCards.length / 6) * 100}%` }} />
                  </div>
                  <div className="progress-count">{selectedCards.length}/6</div>
                </div>
              </div>

              <div className="cat-info">
                <div className="cat-info-inner">
                  Each player gets <strong>3 categories</strong> — choose wisely! Each category has <strong>6 questions</strong> per player, for a total of <strong>36 unique questions</strong>. Pick your strongest categories to maximize your winning chances.
                </div>
              </div>

              <div className="cards-grid">
                {cards.map((card, i) => {
                  const isSelected = selectedCards.some(s => s.title === card.title);
                  const isDisabled = selectedCards.length >= 6 && !isSelected;
                  return (
                    <div
                      key={i}
                      className={`game-card${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}
                      onClick={() => !isDisabled && handleSelectCard(card)}
                    >
                      <div className="card-img-wrap">
                        <img src={card.image.src} alt={card.title} className="card-img" />
                        {isSelected && (
                          <div className="selected-overlay">
                            <div className="selected-check">✓</div>
                          </div>
                        )}
                      </div>
                      <div className="card-name">{card.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="start-btn-wrap">
              <button className="start-btn" onClick={handleSubmit}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                </svg>
                Launch Game
              </button>
              {selectedCards.length > 0 && selectedCards.length < 6 && (
                <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  {6 - selectedCards.length} more {6 - selectedCards.length === 1 ? 'category' : 'categories'} needed
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}