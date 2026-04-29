"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaArrowRight, FaGamepad, FaGoogle, FaGithub, FaSun, FaMoon } from "react-icons/fa";
import { MdEmail, MdLockOutline } from "react-icons/md";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNo: "", email: "", password: "" });
  const { theme, toggle } = useTheme();
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
    setLoading(true);
    const { firstName, lastName, phoneNo, email, password } = formData;
    try {
      if (isRegistering) {
        if (!firstName || !email || !password) { 
          toast.error("Please fill in all required fields"); 
          setLoading(false); 
          return; 
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), { firstName, lastName, phoneNo, email });
        toast.success("Account created! Welcome to IQPLAY 🎮");
        router.push("/dashboard");
      } else {
        if (!email || !password) { 
          toast.error("Please enter email and password"); 
          setLoading(false); 
          return; 
        }
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msgs: Record<string, string> = {
        "auth/wrong-password": "Incorrect email or password",
        "auth/user-not-found": "No account found with this email",
        "auth/invalid-credential": "Incorrect email or password",
        "auth/invalid-email": "Invalid email format",
        "auth/email-already-in-use": "Email already registered",
        "auth/weak-password": "Password too weak (min 6 chars)",
      };
      toast.error(msgs[err.code] || err.message);
    }
    setLoading(false);
  };

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
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "#1e1e2f",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #1e2a4a",
        }}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Branding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex flex-col justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/20 to-[#c084fc]/20 rounded-3xl blur-3xl" />
                <div className="relative bg-[#0f1222]/60 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                        <FaGamepad className="text-white text-2xl" />
                      </div>
                    </div>
                    <span className="font-display font-bold text-2xl bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
                      IQ<span className="text-[#7c3aed]">PLAY</span>
                    </span>
                  </div>

                  <h1 className="font-display text-4xl font-bold text-white mb-4">
                    {isRegistering ? "Join the Battle" : "Welcome Back, Warrior"}
                  </h1>
                  <p className="text-[#94a3b8] text-lg mb-8 leading-relaxed">
                    {isRegistering
                      ? "Create your account and start your journey to become the ultimate quiz champion."
                      : "Sign in to continue your quest for glory and challenge players around the world."}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                      <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                        <FaGamepad className="text-[#7c3aed] text-sm" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">20+ Game Categories</p>
                        <p className="text-[#94a3b8] text-xs">Cricket, Football, Gaming & more</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                      <div className="w-8 h-8 rounded-lg bg-[#c084fc]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Real-time Battles</p>
                        <p className="text-[#94a3b8] text-xs">15-second rounds, head-to-head</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e2f]/50 border border-[#1e2a4a]">
                      <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#fbbf24]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Track Your Progress</p>
                        <p className="text-[#94a3b8] text-xs">Stats, leaderboards, and achievements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-md">
                {/* Theme Toggle */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={toggle}
                    className="w-10 h-10 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
                  >
                    {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
                  </button>
                </div>

                {/* Form Card */}
                <div className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {isRegistering ? "Create Account" : "Sign In"}
                    </h2>
                    <p className="text-[#94a3b8] text-sm">
                      {isRegistering
                        ? "Join the ultimate quiz battle platform"
                        : "Enter your credentials to continue"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#94a3b8] text-xs font-medium mb-1">
                              First Name *
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                                <FaUser size={12} />
                              </div>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Ali"
                                className="w-full pl-9 pr-3 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition text-sm"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#94a3b8] text-xs font-medium mb-1">
                              Last Name
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                                <FaUser size={12} />
                              </div>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Khan"
                                className="w-full pl-9 pr-3 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#94a3b8] text-xs font-medium mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                              <FaPhone size={12} />
                            </div>
                            <input
                              type="tel"
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={PhoneInputChange}
                              placeholder="0300-0000000"
                              className="w-full pl-9 pr-3 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[#94a3b8] text-xs font-medium mb-1">
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
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#94a3b8] text-xs font-medium mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                          <FaLock size={12} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition"
                        >
                          {showPassword ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {isRegistering ? "Create Account" : "Sign In"}
                          <FaArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#1e2a4a]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#0f1222] text-[#4a5568]">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] text-[#94a3b8] hover:text-white hover:border-[#7c3aed]/50 transition text-sm">
                      <FaGoogle size={14} />
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1e1e2f] border border-[#1e2a4a] text-[#94a3b8] hover:text-white hover:border-[#7c3aed]/50 transition text-sm">
                      <FaGithub size={14} />
                      GitHub
                    </button>
                  </div>

                  {/* Switch Auth Mode */}
                  <p className="text-center text-[#94a3b8] text-sm">
                    {isRegistering ? "Already have an account?" : "New to IQPLAY?"}
                    <button
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="ml-1 text-[#7c3aed] hover:text-[#c084fc] transition font-medium"
                    >
                      {isRegistering ? "Sign In" : "Create Account"}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}