"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNo: "", email: "", password: "" });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const PhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    if (value.length > 4) value = value.replace(/^(\d{4})(\d{0,7})$/, "$1-$2");
    setFormData(p => ({ ...p, phoneNo: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firstName, lastName, phoneNo, email, password } = formData;

    try {
      if (isRegistering) {
        if (!firstName || !email || !password) { toast.error("Please fill in all required fields"); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), { firstName, lastName, phoneNo, email });
        toast.success("Account created!");
        router.push("/dashboard");
      } else {
        if (!email || !password) { toast.error("Please enter email and password"); return; }
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msgs: Record<string, string> = {
        "auth/wrong-password": "Incorrect email or password",
        "auth/user-not-found": "Incorrect email or password",
        "auth/invalid-credential": "Incorrect email or password",
        "auth/invalid-email": "Invalid email format",
        "auth/email-already-in-use": "Email already registered",
        "auth/weak-password": "Password too weak (min 6 chars)",
      };
      toast.error(msgs[err.code] || err.message);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: #070709; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          background: #070709;
          color: #e8eaf0;
          position: relative;
          overflow: hidden;
        }

        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 5rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 900px) {
          .auth-left { padding: 2.5rem 1.5rem; }
          .auth-right { display: none; }
        }

        .auth-right {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .auth-right-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: #0f1117;
          border-left: 1px solid rgba(255,255,255,0.05);
        }

        .auth-right-video {
          width: 100%;
          max-width: 420px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
        }

        .auth-right-video video {
          width: 100%; height: 300px;
          object-fit: cover; display: block;
          margin: 0;
        }

        .auth-right-text {
          margin-top: 2.5rem;
          text-align: center;
        }

        .auth-right-text h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }

        .auth-right-text p {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.7;
          max-width: 320px;
          margin: 0 auto;
        }

        .stat-chips {
          display: flex;
          gap: 12px;
          margin-top: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat-chip {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 13px;
          font-weight: 600;
          color: #9ca3af;
          background: rgba(255,255,255,0.03);
        }

        .stat-chip span { color: #4f6ef7; }

        .brand-link {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 3rem;
          cursor: pointer;
          text-decoration: none;
        }

        .brand-badge {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f6ef7, #7c5cfc);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .brand-name span { color: #4f6ef7; }

        .auth-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4f6ef7;
          margin-bottom: 0.75rem;
        }

        .auth-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }

        .auth-sub {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .field-group { margin-bottom: 16px; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .field-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #4f6ef7;
          opacity: 0.7;
          pointer-events: none;
          display: flex;
        }

        .field-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
          transition: all 0.2s;
          outline: none;
        }

        .field-input:focus {
          border-color: rgba(79,110,247,0.5);
          background: rgba(79,110,247,0.04);
          box-shadow: 0 0 0 3px rgba(79,110,247,0.1);
        }

        .field-input::placeholder { color: #4b5563; }

        .field-input.has-right { padding-right: 44px; }

        .field-right-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.2s;
        }

        .field-right-btn:hover { color: #9ca3af; }

        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 400px) { .row-2 { grid-template-columns: 1fr; } }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #4f6ef7;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover {
          background: #3d58e0;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(79,110,247,0.35);
        }

        .switch-row {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .switch-btn {
          color: #4f6ef7;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          padding: 0;
          transition: color 0.2s;
        }

        .switch-btn:hover { color: #818cf8; text-decoration: underline; }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.5rem 0;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .bg-orb-1 {
          width: 400px; height: 400px;
          top: -150px; left: -100px;
          background: radial-gradient(ellipse, rgba(79,110,247,0.08) 0%, transparent 65%);
        }

        .bg-orb-2 {
          width: 300px; height: 300px;
          bottom: -100px; right: -50px;
          background: radial-gradient(ellipse, rgba(124,92,252,0.08) 0%, transparent 65%);
        }

        .form-container {
          max-width: 420px;
          position: relative;
          z-index: 1;
        }
      `}</style>

      <ToastContainer position="top-center" />

      <div className="auth-root">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <div className="auth-left">
          <div className="form-container">
            <div className="brand-link" onClick={() => router.push("/")}>
              <div className="brand-badge">🎮</div>
              <span className="brand-name">IQ<span>PLAY</span></span>
            </div>

            <div className="auth-eyebrow">{isRegistering ? "Get Started" : "Welcome back"}</div>
            <h1 className="auth-title">
              {isRegistering ? "Create your account" : "Sign in to play"}
            </h1>
            <p className="auth-sub">
              {isRegistering
                ? "Join thousands of players in the ultimate quiz battle."
                : "Good to see you again. Your games are waiting."}
            </p>

            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <div className="row-2">
                    <div className="field-group">
                      <label className="field-label">First Name *</label>
                      <div className="field-wrap">
                        <div className="field-icon">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <input className="field-input" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ali" required />
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Last Name</label>
                      <div className="field-wrap">
                        <div className="field-icon">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                        <input className="field-input" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Khan" />
                      </div>
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Phone Number</label>
                    <div className="field-wrap">
                      <div className="field-icon">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <input className="field-input" type="tel" name="phoneNo" value={formData.phoneNo} onChange={PhoneInputChange} placeholder="0300-0000000" />
                    </div>
                  </div>
                </>
              )}

              <div className="field-group">
                <label className="field-label">Email Address *</label>
                <div className="field-wrap">
                  <div className="field-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input className="field-input" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password *</label>
                <div className="field-wrap">
                  <div className="field-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    className="field-input has-right"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" className="field-right-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button className="submit-btn" type="submit">
                {isRegistering ? "Create Account" : "Sign In"}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
            </form>

            <div className="switch-row">
              {isRegistering ? (
                <>Already have an account? <button className="switch-btn" onClick={() => setIsRegistering(false)}>Sign in here</button></>
              ) : (
                <>New to IQPLAY? <button className="switch-btn" onClick={() => setIsRegistering(true)}>Create an account</button></>
              )}
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-right-video">
              <video src="/video/login.mp4" loop muted autoPlay playsInline />
            </div>
            <div className="auth-right-text">
              <h2>The Ultimate Quiz<br/><span style={{ color: '#4f6ef7' }}>Battle Platform</span></h2>
              <p>Challenge anyone, anywhere. Design your own game, pick categories, and prove you're the smartest in the room.</p>
              <div className="stat-chips">
                <div className="stat-chip"><span>20+</span> Categories</div>
                <div className="stat-chip"><span>36</span> Questions</div>
                <div className="stat-chip"><span>15s</span> Per Question</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}