"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import logo from "../../public/images/logo.png";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

export default function Header() {
  interface UserName { firstName: string; lastName: string; }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [userName, setUserName] = useState<UserName | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const doc_ = await getDoc(doc(db, "users", user.uid));
          if (doc_.exists()) setUserName(doc_.data() as UserName);
        } catch {}
      } else setUserName(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserName(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const nav = (path: string, requireLogin = false) => {
    setIsMenuOpen(false);
    if (requireLogin && !userName) router.push("/login");
    else router.push(path);
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600&display=swap');

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .nav-root.scrolled {
          background: rgba(10,10,15,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-root:not(.scrolled) {
          background: #0a0a0f;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .nav-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
        }

        .logo-img-wrap {
          width: 36px; height: 36px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .logo-name span { color: #4f6ef7; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
          margin: 0; padding: 0;
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }

        .nav-link:hover { color: #fff; }

        .nav-right { display: flex; align-items: center; gap: 12px; }

        .avatar-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(79,110,247,0.1);
          border: 1px solid rgba(79,110,247,0.25);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s;
          color: #c7d2fe;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .avatar-btn:hover {
          background: rgba(79,110,247,0.18);
          border-color: rgba(79,110,247,0.5);
        }

        .avatar-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f6ef7, #7c5cfc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .chevron {
          width: 14px; height: 14px;
          transition: transform 0.2s;
          opacity: 0.6;
        }

        .chevron.open { transform: rotate(180deg); }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #161b27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 6px;
          min-width: 180px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font-family: 'Outfit', sans-serif;
        }

        .drop-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .drop-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        .drop-sep {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }

        .login-btn {
          padding: 9px 22px;
          background: #4f6ef7;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
        }

        .login-btn:hover {
          background: #3d58e0;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79,110,247,0.35);
        }

        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          color: #fff;
          transition: background 0.2s;
        }

        .mobile-toggle:hover { background: rgba(255,255,255,0.1); }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-right .avatar-btn span { display: none; }
          .mobile-toggle { display: flex; }
        }

        .mobile-menu {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          background: #0f1117;
          border-right: 1px solid rgba(255,255,255,0.06);
          z-index: 200;
          padding: 24px;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .mobile-menu.open { transform: translateX(0); }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 199;
          backdrop-filter: blur(4px);
        }

        .mobile-close {
          position: absolute;
          top: 20px; right: 20px;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          cursor: pointer;
          color: #fff;
          border: none;
        }

        .mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 2rem; }

        .mobile-nav-link {
          display: block;
          padding: 12px 16px;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 4px;
        }

        .mobile-nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; }

        .mobile-actions { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 10px; }

        .mobile-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: 'Outfit', sans-serif;
        }

        .avatar-relative { position: relative; }
      `}</style>
      <ToastContainer position="top-center" />

      <nav className={`nav-root${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => router.push("/")}>
            <div className="logo-img-wrap">
              <Image src={logo} alt="IQPLAY" width={36} height={36} style={{ margin: 0 }} />
            </div>
            <span className="logo-name">IQ<span>PLAY</span></span>
          </div>

          <ul className="nav-links">
            <li className="nav-link" onClick={() => nav("/dashboard", true)}>My Playtime</li>
            <li className="nav-link" onClick={() => nav("/contact")}>Contact Support</li>
            <li className="nav-link" onClick={() => nav("/?showCards=true")}>Buy Games</li>
          </ul>

          <div className="nav-right">
            {!loading && (
              userName ? (
                <div className="avatar-relative">
                  <button className="avatar-btn" onClick={() => setIsDropOpen(!isDropOpen)}>
                    <div className="avatar-circle">{userName.firstName[0]}</div>
                    <span>{userName.firstName} {userName.lastName}</span>
                    <svg className={`chevron${isDropOpen ? ' open' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {isDropOpen && (
                    <div className="dropdown">
                      <a href="/profile" className="drop-item">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Profile
                      </a>
                      <div className="drop-sep" />
                      <button className="drop-item danger" onClick={handleLogout}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="login-btn" onClick={() => router.push("/login")}>Login</button>
              )
            )}
            <button className="mobile-toggle" onClick={() => setIsMenuOpen(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />}
      <div className={`mobile-menu${isMenuOpen ? ' open' : ''}`}>
        <button className="mobile-close" onClick={() => setIsMenuOpen(false)}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div className="mobile-logo">
          <div className="logo-img-wrap">
            <Image src={logo} alt="IQPLAY" width={36} height={36} style={{ margin: 0 }} />
          </div>
          <span className="logo-name">IQ<span>PLAY</span></span>
        </div>
        <div className="mobile-nav-link" onClick={() => nav("/dashboard", true)}>My Playtime</div>
        <div className="mobile-nav-link" onClick={() => nav("/contact")}>Contact Support</div>
        <div className="mobile-nav-link" onClick={() => nav("/?showCards=true")}>Buy Games</div>
        <div className="mobile-actions">
          {userName ? (
            <>
              <button className="mobile-btn" style={{ background: 'rgba(79,110,247,0.15)', color: '#818cf8', border: '1px solid rgba(79,110,247,0.25)' }} onClick={() => nav("/profile")}>Profile</button>
              <button className="mobile-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="mobile-btn" style={{ background: '#4f6ef7', color: 'white' }} onClick={() => nav("/login")}>Login</button>
          )}
        </div>
      </div>
    </>
  );
}