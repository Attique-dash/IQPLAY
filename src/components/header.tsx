"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import logo from "../../public/images/logo.png";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { FaGamepad, FaUser, FaSignOutAlt, FaUserCircle, FaShoppingCart, FaHeadset, FaSun, FaMoon, FaBars, FaTimes, FaChevronDown, FaTachometerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  interface UserName { firstName: string; lastName: string; }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [userName, setUserName] = useState<UserName | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const d = await getDoc(doc(db, "users", user.uid));
          if (d.exists()) setUserName(d.data() as UserName);
        } catch {}
      } else setUserName(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    setIsDropOpen(false);
    setIsMenuOpen(false);
    await signOut(auth);
    setUserName(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const nav = (path: string, requireLogin = false) => {
    setIsMenuOpen(false);
    setIsDropOpen(false);
    if (requireLogin && !userName) router.push("/login");
    else router.push(path);
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: FaTachometerAlt, requireLogin: true },
    { name: "Buy Games", path: "/?showCards=true", icon: FaShoppingCart, requireLogin: false },
    { name: "Support", path: "/contact", icon: FaHeadset, requireLogin: false },
  ];

  const getInitials = () => {
    if (!userName) return "?";
    return `${userName.firstName[0]}${userName.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
      `}</style>

      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "var(--card)",
          color: "var(--text)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
        }}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => nav("/")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50 group-hover:opacity-75 transition" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                  <FaGamepad className="text-white text-lg" />
                </div>
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent">
                BRAIN<span className="text-[#7c3aed]">ARENA</span>
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => nav(link.path, link.requireLogin)}
                  className="flex items-center gap-2 text-[var(--text2)] hover:text-[var(--text)] transition-colors text-sm font-medium"
                >
                  <link.icon size={14} />
                  {link.name}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggle}
                className="w-9 h-9 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FaSun size={15} /> : <FaMoon size={15} />}
              </motion.button>

              {!loading && (
                userName ? (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setIsDropOpen(!isDropOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] hover:border-[#7c3aed]/50 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{getInitials()}</span>
                      </div>
                      <span className="text-[var(--text)] text-sm font-medium hidden sm:block">
                        {userName.firstName}
                      </span>
                      <FaChevronDown
                        size={10}
                        className={`text-[var(--text2)] transition-transform duration-200 ${isDropOpen ? "rotate-180" : ""}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isDropOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            <div className="p-2">
                              <div className="px-3 py-2 mb-1 border-b border-[var(--border)]">
                                <p className="text-[var(--text2)] text-xs uppercase tracking-wider">Signed in as</p>
                                <p className="text-[var(--text)] font-medium text-sm">
                                  {userName.firstName} {userName.lastName}
                                </p>
                              </div>
                              <button
                                onClick={() => nav("/profile", true)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition text-sm"
                              >
                                <FaUserCircle size={16} />
                                My Profile
                              </button>
                              <button
                                onClick={() => nav("/dashboard", true)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition text-sm"
                              >
                                <FaTachometerAlt size={14} />
                                Dashboard
                              </button>
                              <div className="h-px bg-[var(--border)] my-1" />
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#ff6b8a] hover:bg-[#ff3b5c]/10 transition text-sm"
                              >
                                <FaSignOutAlt size={14} />
                                Sign Out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/login")}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white text-sm font-semibold hover:shadow-lg transition"
                  >
                    Sign In
                  </motion.button>
                )
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden w-9 h-9 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-[var(--text)]"
              >
                <FaBars size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--card)] border-r border-[var(--border)] z-50 md:hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2" onClick={() => nav("/")}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                      <FaGamepad className="text-white" />
                    </div>
                    <span className="font-display font-bold text-lg bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent">
                      BRAIN<span className="text-[#7c3aed]">ARENA</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-9 h-9 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  {navLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => nav(link.path, link.requireLogin)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition text-sm"
                    >
                      <link.icon size={16} />
                      {link.name}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-[var(--border)] my-4" />

                <div className="space-y-2">
                  <button
                    onClick={toggle}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition text-sm"
                  >
                    {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>

                  {userName ? (
                    <>
                      <button
                        onClick={() => nav("/profile", true)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition text-sm"
                      >
                        <FaUserCircle size={16} />
                        My Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#ff6b8a] hover:bg-[#ff3b5c]/10 transition text-sm"
                      >
                        <FaSignOutAlt size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => nav("/login")}
                      className="w-full px-3 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-sm"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}