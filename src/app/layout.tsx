"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PointsCounter from "./components/PointsCounter";
import type { User } from "@supabase/supabase-js";

// Simple fallback icons if Heroicons fail
const FallbackIcon = () => <span>📄</span>;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [navExpanded, setNavExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("green");
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple spaces without Heroicons
  const spaces = [
    { name: "Dashboard", path: "/", icon: "🏠" },
    { name: "Plan", path: "/home", icon: "📝" },
    { name: "Learn", path: "/school", icon: "📚" },
    { name: "Romance", path: "/romance", icon: "💖" },
    { name: "Mental", path: "/mental", icon: "🧠" },
    { name: "Physical", path: "/physical", icon: "💪" },
    { name: "Entertainment", path: "/entertainment", icon: "🎮" },
    { name: "Daily Goals", path: "/goals", icon: "🎯" },
    { name: "Rewards Shop", path: "/rewards", icon: "🏆" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  useEffect(() => {
    try {
      setMounted(true);
      // Your existing auth logic
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    } catch (err) {
      setError('Failed to initialize app');
      console.error('Initialization error:', err);
    }
  }, []);

  if (error) {
    return (
      <html lang="en">
        <body className="bg-silver-50 dark:bg-slate-900">
          <div className="flex items-center justify-center min-h-screen flex-col gap-4 p-4">
            <h1 className="text-xl font-bold text-red-600">Error: {error}</h1>
            <p className="text-gray-600">Check the console for details</p>
          </div>
        </body>
      </html>
    );
  }

  if (!mounted) {
    return (
      <html lang="en">
        <body className="bg-silver-50 dark:bg-slate-900">
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${darkMode ? "dark" : ""}`}>
      <body className="bg-silver-50 text-slate-900 dark:bg-slate-900 dark:text-white transition-colors">
        {/* Debug header - always visible */}
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-800/70 backdrop-blur border-b border-silver-200 dark:border-silver-500/20">
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <button className="text-xl font-bold px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition">
                Life OS
              </button>
              <button
                onClick={() => setNavExpanded(!navExpanded)}
                className="px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
              >
                {navExpanded ? "◀ Menu" : "▶ Menu"}
              </button>
            </div>

            {/* Center menu */}
            <div className={`flex items-center gap-3 transition-all duration-300 ${navExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              {navExpanded && spaces.map((s) => (
                <Link
                  key={s.name}
                  href={s.path}
                  className="text-sm px-3 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  {s.name}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <PointsCounter />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              {user ? (
                <button className="px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="px-3 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors">
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center justify-between px-4 py-3">
            <button className="text-lg font-bold px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition">
              Life OS
            </button>
            <div className="flex items-center gap-3">
              <PointsCounter />
              <button 
                onClick={() => setNavExpanded(!navExpanded)}
                className="focus:outline-none p-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {navExpanded ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {navExpanded && (
            <div className="md:hidden absolute top-full left-0 w-full z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-silver-200 dark:border-silver-500/20">
              <div className="flex flex-col px-2 py-3 space-y-1">
                {spaces.map((s) => (
                  <Link
                    key={s.name}
                    href={s.path}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-silver-100 dark:hover:bg-slate-700 transition-colors text-sm"
                    onClick={() => setNavExpanded(false)}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="max-w-5xl mx-auto pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}