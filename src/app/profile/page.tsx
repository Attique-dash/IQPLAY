"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaSignOutAlt, FaGamepad, FaTrophy, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { MdEmail, MdVerified, MdSecurity } from "react-icons/md";
import { GiSwordClash } from "react-icons/gi";

export default function Profile() {
  interface UserInfo { firstName: string; lastName: string; email: string; phoneNo: string; }
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const [changepass, setChangepass] = useState({ PrevPass: "", confPass: "" });
  const [changingPass, setChangingPass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const d = await getDoc(doc(db, "users", user.uid));
          if (d.exists()) setUserInfo(d.data() as UserInfo);
        } catch {}
      } else router.push("/login");
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangepass({ ...changepass, [e.target.name]: e.target.value });
  };

  const changePassword = async () => {
    if (!auth.currentUser) return;
    if (!changepass.PrevPass || changepass.PrevPass.length < 6) { 
      toast.error("New password must be at least 6 characters"); 
      return; 
    }
    if (changepass.PrevPass !== changepass.confPass) { 
      toast.error("Passwords do not match!"); 
      return; 
    }
    const currentPassword = prompt("Enter your current password to confirm:");
    if (!currentPassword) return;
    setChangingPass(true);
    try {
      const user = auth.currentUser!;
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, changepass.PrevPass);
      toast.success("Password updated! Please sign in again.");
      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
    setChangingPass(false);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#0a0c15] via-[#12152a] to-[#0a0c15]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-3 border-[#1e2a4a] border-t-[#7c3aed] rounded-full mx-auto mb-6"
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[#94a3b8] font-medium text-lg"
            >
              Loading profile...
            </motion.p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!userInfo) return null;

  const initials = `${userInfo.firstName[0]}${userInfo.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/20 via-transparent to-[#c084fc]/20 rounded-2xl blur-2xl" />
          <div className="relative bg-[#0f1222]/60 backdrop-blur-xl rounded-2xl border border-[#1e2a4a] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#c084fc] to-[#7c3aed]" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] to-[#c084fc] rounded-2xl blur-lg opacity-50" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-white">{initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10b981] border-2 border-[#0f1222] flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{fullName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[#94a3b8] text-sm mt-1">
                  <MdEmail size={14} />
                  <span>{userInfo.email}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                  <div className="px-3 py-1 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[#c084fc] text-xs font-medium flex items-center gap-1">
                    <FaGamepad size={10} />
                    IQPLAY Member
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] text-xs font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    Active
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center bg-[#1e1e2f]/50 rounded-xl px-4 py-2 border border-[#1e2a4a]">
                  <div className="flex items-center gap-1 text-[#fbbf24] justify-center">
                    <FaTrophy size={12} />
                    <span className="text-xs font-medium">Games Played</span>
                  </div>
                  <div className="font-display text-xl font-bold text-white">0</div>
                </div>
                <div className="text-center bg-[#1e1e2f]/50 rounded-xl px-4 py-2 border border-[#1e2a4a]">
                  <div className="flex items-center gap-1 text-[#7c3aed] justify-center">
                    <GiSwordClash size={12} />
                    <span className="text-xs font-medium">Win Rate</span>
                  </div>
                  <div className="font-display text-xl font-bold text-white">0%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1e2a4a]">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "info"
                ? "bg-[#7c3aed]/20 text-[#7c3aed] border-b-2 border-[#7c3aed]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            <FaUser size={14} />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "security"
                ? "bg-[#7c3aed]/20 text-[#7c3aed] border-b-2 border-[#7c3aed]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            <FaLock size={14} />
            Security
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaUser className="text-[#7c3aed]" />
                Account Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#1e1e2f]/50 rounded-xl p-4 border border-[#1e2a4a]">
                  <div className="flex items-center gap-2 text-[#94a3b8] text-xs uppercase tracking-wider mb-2">
                    <FaUser size={12} />
                    First Name
                  </div>
                  <div className="text-white font-medium text-lg">{userInfo.firstName || "—"}</div>
                </div>
                <div className="bg-[#1e1e2f]/50 rounded-xl p-4 border border-[#1e2a4a]">
                  <div className="flex items-center gap-2 text-[#94a3b8] text-xs uppercase tracking-wider mb-2">
                    <FaUser size={12} />
                    Last Name
                  </div>
                  <div className="text-white font-medium text-lg">{userInfo.lastName || "—"}</div>
                </div>
                <div className="bg-[#1e1e2f]/50 rounded-xl p-4 border border-[#1e2a4a]">
                  <div className="flex items-center gap-2 text-[#94a3b8] text-xs uppercase tracking-wider mb-2">
                    <MdEmail size={12} />
                    Email Address
                  </div>
                  <div className="text-white font-medium text-lg">{userInfo.email}</div>
                </div>
                <div className="bg-[#1e1e2f]/50 rounded-xl p-4 border border-[#1e2a4a]">
                  <div className="flex items-center gap-2 text-[#94a3b8] text-xs uppercase tracking-wider mb-2">
                    <FaPhone size={12} />
                    Phone Number
                  </div>
                  <div className="text-white font-medium text-lg">{userInfo.phoneNo || "Not provided"}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-[#1e2a4a]">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center gap-2 hover:shadow-lg transition"
                >
                  <FaGamepad size={14} />
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-6 py-2 rounded-xl bg-[#1e1e2f] border border-[#ff3b5c]/30 text-[#ff6b8a] font-semibold flex items-center gap-2 hover:bg-[#ff3b5c]/10 transition"
                >
                  <FaSignOutAlt size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                <MdSecurity className="text-[#7c3aed]" />
                Password & Security
              </h2>
              <p className="text-[#94a3b8] text-sm mb-6">
                You'll be asked to confirm your current password before making changes.
              </p>

              <div className="max-w-md space-y-5">
                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                      <FaLock size={14} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="PrevPass"
                      value={changepass.PrevPass}
                      onChange={handleInputChange}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-12 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition"
                    >
                      {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                      <FaShieldAlt size={14} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confPass"
                      value={changepass.confPass}
                      onChange={handleInputChange}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-4 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition"
                    />
                  </div>
                </div>

                <button
                  onClick={changePassword}
                  disabled={changingPass}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50"
                >
                  {changingPass ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaLock size={14} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0f1222] border border-[#1e2a4a] rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] rounded-t-2xl" />
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#ff3b5c]/20 flex items-center justify-center">
                  <FaSignOutAlt className="text-[#ff6b8a] text-2xl" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Sign Out?</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Are you sure you want to sign out of your account?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1e1e2f] text-white font-medium hover:bg-[#2a2a3e] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff3b5c] to-[#ff6b8a] text-white font-medium hover:shadow-lg transition"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}