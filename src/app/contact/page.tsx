"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaUser, FaComment, FaCheckCircle } from "react-icons/fa";
import { MdEmail, MdMessage } from "react-icons/md";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    } catch { 
      toast.error("Failed to send. Please try again."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
            <span className="text-xs font-medium text-[#c084fc] uppercase tracking-wider">Get in Touch</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent mb-4">
            We're here to <span className="text-[#7c3aed]">Help</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Have a question, issue, or just want to say hello? Drop us a message and we'll get back to you shortly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Info Cards */}
            <div className="bg-[#0f1222]/60 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                  <FaEnvelope className="text-[#7c3aed] text-sm" />
                </div>
                Contact Information
              </h2>
              <div className="space-y-4">
                {[
                  { icon: <FaEnvelope />, bg: "rgba(124,58,237,0.15)", title: "Email", value: "support@iqplay.com", color: "#7c3aed" },
                  { icon: <FaPhone />, bg: "rgba(16,185,129,0.15)", title: "Response Time", value: "Within 24 hours", color: "#10b981" },
                  { icon: <FaClock />, bg: "rgba(245,158,11,0.15)", title: "Support Hours", value: "Mon – Fri, 9am – 6pm", color: "#f59e0b" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                      <div style={{ color: item.color }} className="text-lg">{item.icon}</div>
                    </div>
                    <div>
                      <p className="text-[#94a3b8] text-xs uppercase tracking-wider">{item.title}</p>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Video Card */}
            <div className="bg-[#0f1222]/60 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <video 
                  src="/video/contact.mp4" 
                  loop 
                  muted 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1222] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-white text-lg mb-2">Need Help?</h3>
                <p className="text-[#94a3b8] text-sm">
                  Check out our FAQ section for quick answers to common questions about games, scoring, and account management.
                </p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#c084fc]/10 rounded-xl p-4 border border-[#7c3aed]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-[#10b981]" />
                  <span className="text-white text-sm font-medium">24/7 Support Available</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                  <MdMessage className="text-white text-xl" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Send a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                      <FaUser size={14} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 bg-[#1e1e2f] border rounded-xl text-white placeholder-[#4a5568] transition-all outline-none ${
                        focusedField === "name" ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20" : "border-[#1e2a4a]"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                        <FaPhone size={14} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="03001234567"
                        className={`w-full pl-10 pr-4 py-3 bg-[#1e1e2f] border rounded-xl text-white placeholder-[#4a5568] transition-all outline-none ${
                          focusedField === "phone" ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20" : "border-[#1e2a4a]"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                        <MdEmail size={14} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-[#1e1e2f] border rounded-xl text-white placeholder-[#4a5568] transition-all outline-none ${
                          focusedField === "email" ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20" : "border-[#1e2a4a]"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-[#7c3aed]">
                      <FaComment size={14} />
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleMessageChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Describe your issue or question in detail..."
                      rows={5}
                      className={`w-full pl-10 pr-4 py-3 bg-[#1e1e2f] border rounded-xl text-white placeholder-[#4a5568] transition-all outline-none resize-none ${
                        focusedField === "message" ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20" : "border-[#1e2a4a]"
                      }`}
                      required
                    />
                  </div>
                  <div className={`text-right text-xs mt-2 ${wordCount > 400 ? 'text-[#fbbf24]' : 'text-[#4a5568]'}`}>
                    {wordCount} / 500 words
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="animate-spin">
                        <path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <FaPaperPlane size={14} />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[#4a5568] text-xs">
                  By submitting, you agree to our{" "}
                  <a href="#" className="text-[#7c3aed] hover:underline">Terms of Service</a> and{" "}
                  <a href="#" className="text-[#7c3aed] hover:underline">Privacy Policy</a>
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-[#0f1222]/40 rounded-xl p-6 border border-[#1e2a4a]">
            <h3 className="font-display text-lg font-bold text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-[#94a3b8] text-sm mb-4">
              Can't find what you're looking for? Check our FAQ page for quick answers.
            </p>
            <button
              onClick={() => window.location.href = "/faq"}
              className="px-6 py-2 rounded-lg bg-[#1e1e2f] text-[#c084fc] font-medium hover:bg-[#2a2a3e] transition"
            >
              View FAQ
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}