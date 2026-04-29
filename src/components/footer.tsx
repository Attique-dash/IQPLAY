"use client";
import { useRouter } from "next/navigation";
import { FaTwitter, FaFacebook, FaLinkedin, FaYoutube, FaGamepad, FaHeart, FaShieldAlt, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const router = useRouter();

  const footerLinks = {
    platform: [
      { name: "About IQPLAY", path: "/" },
      { name: "How to Play", path: "/" },
      { name: "Browse Games", path: "/dashboard" },
      { name: "Buy Packages", path: "/?showCards=true" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "Report an Issue", path: "/contact" },
      { name: "FAQs", path: "/" },
      { name: "Game Guides", path: "/" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/" },
      { name: "Terms of Service", path: "/" },
      { name: "Game Rules", path: "/?showCards=true" },
      { name: "Cookie Policy", path: "/" },
    ],
  };

  const socialIcons = [
    { icon: FaTwitter, color: "#1DA1F2", label: "Twitter" },
    { icon: FaFacebook, color: "#4267B2", label: "Facebook" },
    { icon: FaLinkedin, color: "#0077B5", label: "LinkedIn" },
    { icon: FaYoutube, color: "#FF0000", label: "YouTube" },
  ];

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .footer-gradient {
          background: linear-gradient(180deg, rgba(10,12,21,0) 0%, rgba(10,12,21,0.8) 100%);
        }
      `}</style>

      <footer className="relative bg-[var(--bg)] border-t border-[var(--border)]">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 cursor-pointer group mb-4"
                onClick={() => router.push("/")}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#7c3aed] rounded-xl blur-md opacity-50 group-hover:opacity-75 transition" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                    <FaGamepad className="text-white text-lg" />
                  </div>
                </div>
                <span className="font-display font-bold text-xl bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent">
                  IQ<span className="text-[var(--accent)]">PLAY</span>
                </span>
              </motion.div>
              
              <p className="text-[var(--text2)] text-sm leading-relaxed mb-6 max-w-sm">
                The ultimate multiplayer quiz platform. Design custom games, battle friends in real-time, and prove you're the smartest player in the arena.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3 mb-6">
                {socialIcons.map((social, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] transition-colors cursor-pointer"
                    style={{ '--hover-color': social.color } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = social.color;
                      e.currentTarget.style.color = social.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <social.icon size={14} />
                  </motion.a>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="hidden lg:flex items-center gap-2 p-3 rounded-xl bg-[var(--card2)] border border-[var(--border)]">
                <FaShieldAlt className="text-[var(--accent4)] text-sm" />
                <span className="text-[var(--text2)] text-xs">Secure & Verified Platform</span>
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="font-display font-bold text-[var(--text)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
                Platform
              </h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => router.push(link.path)}
                      className="text-[var(--text2)] text-sm hover:text-[var(--accent)] transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display font-bold text-[var(--text)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[var(--accent)]" />
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => router.push(link.path)}
                      className="text-[var(--text2)] text-sm hover:text-[var(--accent)] transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display font-bold text-[var(--text)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[var(--accent2)]" />
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => router.push(link.path)}
                      className="text-[var(--text2)] text-sm hover:text-[var(--accent)] transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[var(--text2)] text-xs">
              © 2026 IQPLAY. All rights reserved. Built with{" "}
              <FaHeart className="inline text-[var(--accent3)] text-xs mx-1" />
              for quiz enthusiasts worldwide.
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card2)] border border-[var(--border)]">
                <div className="w-2 h-2 rounded-full bg-[var(--accent4)] animate-pulse" />
                <span className="text-[var(--text2)] text-xs">All systems operational</span>
              </div>
              
              {/* Support Link */}
              <button
                onClick={() => router.push("/contact")}
                className="flex items-center gap-1 text-[var(--text2)] text-xs hover:text-[var(--accent)] transition"
              >
                <FaHeadset size={12} />
                Need Help?
              </button>
            </div>
          </div>

          {/* Version Badge */}
          <div className="text-center mt-6">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--card2)] text-[var(--muted)] text-[10px] font-mono">
              v2.0.0
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}