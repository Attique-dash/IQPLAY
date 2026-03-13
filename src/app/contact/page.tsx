"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d{0,11}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.split(/\s+/).filter(Boolean);
    if (words.length <= 500) {
      setFormData(prev => ({ ...prev, message: e.target.value }));
      setWordCount(words.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Please enter your name"); return; }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) { toast.error("Please enter a valid email"); return; }
    if (!formData.phone.trim() || formData.phone.length < 10) { toast.error("Phone number must be at least 10 digits"); return; }
    if (!formData.message.trim()) { toast.error("Please enter your message"); return; }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({ name: "", phone: "", email: "", message: "" });
        setWordCount(0);
      } else throw new Error(data.error || 'Failed to send');
    } catch { toast.error("Failed to send. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: #070709; color: #e8eaf0; }

        .contact-root {
          min-height: 100vh;
          background: #070709;
          padding: 5rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .contact-bg-1 {
          position: absolute;
          top: -200px; right: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(79,110,247,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .contact-bg-2 {
          position: absolute;
          bottom: -200px; left: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(247,201,72,0.05) 0%, transparent 60%);
          pointer-events: none;
        }

        .contact-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .contact-eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4f6ef7;
          margin-bottom: 1rem;
        }

        .contact-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .contact-sub {
          color: #6b7280;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 480px;
          margin: 0 auto;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; }
        }

        .info-side {}

        .info-card {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 20px;
        }

        .info-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .info-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }

        .info-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 20px;
        }

        .info-text .t1 { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6b7280; margin-bottom: 2px; }
        .info-text .t2 { font-size: 0.95rem; color: #d1d5db; font-weight: 500; }

        .video-card-contact {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .video-card-contact video {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          margin: 0;
        }

        .form-card {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 40px;
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 500px) { .form-row-2 { grid-template-columns: 1fr; } }

        .field-group { margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 7px;
        }

        .field-wrap { position: relative; }

        .field-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #4f6ef7;
          opacity: 0.7;
          pointer-events: none;
          display: flex;
        }

        .field-icon-top {
          position: absolute;
          left: 14px; top: 14px;
          color: #4f6ef7;
          opacity: 0.7;
          pointer-events: none;
          display: flex;
        }

        .field-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
          transition: all 0.2s;
          outline: none;
        }

        .field-input:focus {
          border-color: rgba(79,110,247,0.4);
          background: rgba(79,110,247,0.03);
          box-shadow: 0 0 0 3px rgba(79,110,247,0.08);
        }

        .field-input::placeholder { color: #374151; }

        .field-textarea {
          width: 100%;
          padding: 13px 14px 13px 44px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: 'Outfit', sans-serif;
          color: #e8eaf0;
          transition: all 0.2s;
          outline: none;
          resize: none;
          line-height: 1.6;
        }

        .field-textarea:focus {
          border-color: rgba(79,110,247,0.4);
          background: rgba(79,110,247,0.03);
          box-shadow: 0 0 0 3px rgba(79,110,247,0.08);
        }

        .field-textarea::placeholder { color: #374151; }

        .word-count {
          text-align: right;
          font-size: 11px;
          color: #4b5563;
          margin-top: 5px;
          font-weight: 500;
        }

        .word-count.near { color: #f7c948; }

        .submit-btn-contact {
          width: 100%;
          padding: 15px;
          background: #4f6ef7;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }

        .submit-btn-contact:hover:not(:disabled) {
          background: #3d58e0;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(79,110,247,0.35);
        }

        .submit-btn-contact:disabled { opacity: 0.6; cursor: not-allowed; }

        .accent-blue { color: #4f6ef7; }
      `}</style>

      <ToastContainer position="top-center" />

      <div className="contact-root">
        <div className="contact-bg-1" />
        <div className="contact-bg-2" />

        <div className="contact-inner">
          <div className="contact-header">
            <div className="contact-eyebrow">Get in Touch</div>
            <h1 className="contact-title">
              We're here to <span className="accent-blue">Help</span>
            </h1>
            <p className="contact-sub">
              Have a question, issue, or just want to say hello? Drop us a message and we'll get back to you shortly.
            </p>
          </div>

          <div className="contact-grid">
            <div className="info-side">
              <div className="info-card">
                <div className="info-card-title">Contact Info</div>
                {[
                  { icon: "📧", bg: "rgba(79,110,247,0.12)", t1: "Email", t2: "support@iqplay.com" },
                  { icon: "📱", bg: "rgba(247,201,72,0.12)", t1: "Response Time", t2: "Within 24 hours" },
                  { icon: "🎮", bg: "rgba(247,92,79,0.12)", t1: "Game Support", t2: "Mon – Fri, 9am–6pm" },
                ].map((item, i) => (
                  <div key={i} className="info-row">
                    <div className="info-icon" style={{ background: item.bg }}>{item.icon}</div>
                    <div className="info-text">
                      <div className="t1">{item.t1}</div>
                      <div className="t2">{item.t2}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="video-card-contact">
                <video src="/video/contact.mp4" loop muted autoPlay playsInline />
              </div>
            </div>

            <div className="form-card">
              <div className="form-title">Send a Message</div>
              <form onSubmit={handleSubmit}>
                <div className="form-row-2">
                  <div className="field-group">
                    <label className="field-label">Your Name *</label>
                    <div className="field-wrap">
                      <div className="field-icon">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <input className="field-input" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ali Khan" required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Phone *</label>
                    <div className="field-wrap">
                      <div className="field-icon">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <input className="field-input" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03001234567" required />
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address *</label>
                  <div className="field-wrap">
                    <div className="field-icon">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <input className="field-input" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Message *</label>
                  <div className="field-wrap">
                    <div className="field-icon-top">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <textarea
                      className="field-textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleMessageChange}
                      placeholder="Describe your issue or question in detail..."
                      rows={6}
                      required
                    />
                  </div>
                  <div className={`word-count${wordCount > 400 ? ' near' : ''}`}>{wordCount} / 500 words</div>
                </div>

                <button className="submit-btn-contact" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }}>
                        <path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}