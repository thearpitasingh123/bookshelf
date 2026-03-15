"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import ProfilePage from "./profile/page";

import { motion } from "framer-motion";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const pathname = usePathname();

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  /* ---------------- ESC CLOSE PROFILE ---------------- */

  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    window.addEventListener("keydown", escHandler);

    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  /* ---------------- NAV ITEMS ---------------- */

  const navItems = [
    { name: "Library", path: "/library", icon: "📚" },
    { name: "Wishlist", path: "/wishlist", icon: "🔖" },
    { name: "AI Picks", path: "/ai", icon: "✨" },
    { name: "ReadRadar", path: "/readradar", icon: "🔥" },
  ];

  return (
    <html lang="en">
      <body className="bg-black flex text-white">

        {/* ================= SIDEBAR ================= */}

        <div
          className={`h-screen sticky top-0 flex-shrink-0 bg-gradient-to-b from-[#0D0D0D] to-[#111111]
          border-r border-[#ffffff10]
          flex flex-col justify-between
          transition-all duration-500 ease-in-out
          ${collapsed ? "w-20 px-3" : "w-64 px-6"}`}
        >

          {/* ----- Top Section ----- */}

          <div>

            <div className="flex items-center justify-between mb-10 mt-6">

              {!collapsed && (
                <h1 className="text-[#C9A84C] text-2xl font-bold tracking-wide">
                  BookShelf
                </h1>
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-400 hover:text-white transition"
              >
                {collapsed ? "→" : "←"}
              </button>

            </div>

            <nav className="flex flex-col gap-3">

              {navItems.map((item) => {

                const active = pathname === item.path;

                return (

                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl
                    transition-all duration-300
                    ${
                      active
                        ? "bg-[#C9A84C22] border border-[#C9A84C33] text-[#C9A84C]"
                        : "hover:bg-[#ffffff08] text-gray-400"
                    }`}
                  >

                    <span className="text-lg">{item.icon}</span>

                    {!collapsed && (
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    )}

                  </Link>

                );

              })}

            </nav>

          </div>

          {/* ----- Bottom Profile Trigger ----- */}

          <div
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer flex items-center gap-3
              hover:bg-[#ffffff08] p-2 rounded-xl transition mb-6"
          >

            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br
                from-[#C9A84C] to-[#e7c76a]
                flex items-center justify-center text-black font-bold"
            >
              {user?.displayName?.[0] ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>

            {!collapsed && (
              <span className="text-sm text-gray-300">
                {user?.displayName || "Profile"}
              </span>
            )}

          </div>

        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="flex-1 p-10 overflow-y-auto">

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="h-full"
          >
            {children}
          </motion.div>

        </div>

        {/* ================= PROFILE SLIDE PANEL ================= */}

        {profileOpen && (

          <div className="fixed inset-0 z-50 flex">

            {/* Overlay */}

            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setProfileOpen(false)}
            />

            {/* Slide Panel */}

            <div className="relative ml-auto w-[720px] max-w-[90vw] h-full
              bg-[#0D0D0D]
              border-l border-[#ffffff10]
              shadow-[0_0_60px_rgba(0,0,0,0.6)]
              flex flex-col"
            >

              {/* Header */}

              <div className="flex items-center justify-between
                px-10 pt-10 pb-6
                border-b border-[#ffffff10]"
              >

                <h2 className="text-2xl font-bold text-white">
                  Profile & Settings
                </h2>

                <button
                  onClick={() => setProfileOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>

              </div>

              {/* Scrollable Content */}

              <div className="flex-1 overflow-y-auto px-10 py-8">

                <div className="max-w-2xl mx-auto space-y-10">

                  <ProfilePage />

                </div>

              </div>

            </div>

          </div>

        )}

      </body>
    </html>
  );
}