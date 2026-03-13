"use client";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600&display=swap');

        .footer-root {
          background: #070709;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 800px) {
          .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 450px) {
          .footer-top { grid-template-columns: 1fr; }
        }

        .footer-brand {}

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.2rem;
          cursor: pointer;
        }

        .brand-badge {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f6ef7, #7c5cfc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .brand-name span { color: #4f6ef7; }

        .brand-desc {
          font-size: 0.88rem;
          color: #6b7280;
          line-height: 1.7;
          max-width: 220px;
          margin-bottom: 1.5rem;
        }

        .social-row {
          display: flex;
          gap: 10px;
        }

        .social-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .social-btn:hover {
          background: rgba(79,110,247,0.12);
          border-color: rgba(79,110,247,0.3);
          color: #818cf8;
        }

        .footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 1.2rem;
        }

        .footer-link {
          display: block;
          font-size: 0.88rem;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
          margin-bottom: 10px;
          font-weight: 400;
          background: none;
          border: none;
          text-align: left;
          font-family: 'Outfit', sans-serif;
          padding: 0;
        }

        .footer-link:hover { color: #e8eaf0; }

        .footer-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 1.5rem;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-copy {
          font-size: 0.82rem;
          color: #4b5563;
        }

        .footer-copy a {
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }

        .footer-copy a:hover { color: #9ca3af; }

        .footer-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          background: rgba(79,110,247,0.08);
          border: 1px solid rgba(79,110,247,0.15);
          font-size: 11px;
          font-weight: 600;
          color: #6b7aab;
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4f6ef7;
          box-shadow: 0 0 6px #4f6ef7;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand-logo" onClick={() => router.push("/")}>
                <div className="brand-badge">🎮</div>
                <span className="brand-name">IQ<span>PLAY</span></span>
              </div>
              <p className="brand-desc">
                The ultimate multiplayer quiz platform. Design games, battle friends, and prove you're the smartest in the room.
              </p>
              <div className="social-row">
                {["𝕏", "f", "in", "▶"].map((s, i) => (
                  <div key={i} className="social-btn">{s}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="footer-col-title">Games</div>
              <button className="footer-link" onClick={() => router.push("/")}>About IQPLAY</button>
              <button className="footer-link" onClick={() => router.push("/")}>How to Play</button>
              <button className="footer-link" onClick={() => router.push("/dashboard")}>Browse Games</button>
              <button className="footer-link" onClick={() => router.push("/?showCards=true")}>Buy Packages</button>
            </div>

            <div>
              <div className="footer-col-title">Support</div>
              <button className="footer-link" onClick={() => router.push("/contact")}>Contact Us</button>
              <button className="footer-link" onClick={() => router.push("/contact")}>Report an Issue</button>
              <button className="footer-link" onClick={() => router.push("/")}>FAQs</button>
            </div>

            <div>
              <div className="footer-col-title">Legal</div>
              <button className="footer-link" onClick={() => router.push("/")}>Privacy Policy</button>
              <button className="footer-link" onClick={() => router.push("/")}>Terms of Service</button>
              <button className="footer-link" onClick={() => router.push("/?showCards=true")}>Game Rules</button>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="footer-copy">
              © 2025 <a onClick={() => router.push("/")}>IQPLAY</a>. All rights reserved. Play smarter, win bigger.
            </div>
            <div className="footer-badge">
              <div className="badge-dot" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}