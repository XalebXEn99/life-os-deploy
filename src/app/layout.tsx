"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PointsCounter from "./components/PointsCounter";
import type { User } from "@supabase/supabase-js";
import {
  HomeIcon,
  PencilSquareIcon,
  AcademicCapIcon,
  HeartIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  StarIcon,
  FilmIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [navExpanded, setNavExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("green");
  const [mounted, setMounted] = useState(false);

  // Fix: Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const fetchTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_settings")
        .select("theme_color")
        .eq("user_id", user.id)
        .single();
      if (data?.theme_color) setThemeColor(data.theme_color);
    };
    fetchTheme();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => await supabase.auth.signOut();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Fix: Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navExpanded && !(event.target as Element).closest('header')) {
        setNavExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [navExpanded]);

  const spaces = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "Plan", path: "/home", icon: PencilSquareIcon },
    { name: "Learn", path: "/school", icon: AcademicCapIcon },
    { name: "Romance", path: "/romance", icon: HeartIcon },
    { name: "Mental", path: "/mental", icon: UserCircleIcon },
    { name: "Physical", path: "/physical", icon: BoltIcon },
    { name: "Entertainment", path: "/entertainment", icon: FilmIcon },
    { name: "Daily Goals", path: "/goals", icon: ChartBarIcon },
    { name: "Rewards Shop", path: "/rewards", icon: StarIcon },
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
  ];

  // Fix: Prevent hydration issues by not rendering until mounted
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
    <html lang="en" className={`${darkMode ? "dark" : ""} theme-${themeColor}`}>
      <body className="bg-silver-50 text-slate-900 dark:bg-slate-900 dark:text-white transition-colors">
        {/* ===== Header ===== */}
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-800/70 backdrop-blur border-b border-silver-200 dark:border-silver-500/20">

          {/* === Desktop Nav === */}
          <nav className="hidden md:flex items-center justify-between px-6 py-3">
            {/* Left: Brand + toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollToTop}
                className="text-xl font-bold px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
              >
                Life OS
              </button>
              <button
                onClick={() => setNavExpanded(!navExpanded)}
                className="px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
              >
                {navExpanded ? "◀ Menu" : "▶ Menu"}
              </button>
            </div>

            {/* Center: expanding menu - FIXED: Simple toggle with proper width handling */}
            <div className={`flex items-center gap-3 transition-all duration-300 ${navExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              {navExpanded && spaces.map((s) => (
                <Link
                  key={s.name}
                  href={s.path}
                  className="text-sm px-3 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                  onClick={() => setNavExpanded(false)}
                >
                  {s.name}
                </Link>
              ))}
            </div>

            {/* Right: points + darkmode + login/logout */}
            <div className="flex items-center gap-4">
              <PointsCounter />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-1 rounded bg-blur dark:bg-blur text-sm hover:bg-silver-300 dark:hover:bg-slate-600 transition-colors"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="px-3 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* === Mobile Nav (hamburger header) === */}
          <div className="flex md:hidden items-center justify-between px-4 py-3">
            <button
              onClick={scrollToTop}
              className="text-lg font-bold px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
            >
              Life OS
            </button>
            <div className="flex items-center gap-3">
              <PointsCounter />
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Fix: Prevent event bubbling
                  setNavExpanded((prev) => !prev);
                }} 
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

          {/* === Mobile Dropdown - FIXED === */}
          {navExpanded && (
            <div
              className="md:hidden absolute top-full left-0 w-full z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-silver-200 dark:border-silver-500/20"
              onClick={() => setNavExpanded(false)} // Fix: Close when clicking anywhere in dropdown
            >
              <div className="flex flex-col px-2 py-3 space-y-1">
                {spaces.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.name}
                      href={s.path}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-silver-100 dark:hover:bg-slate-700 transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()} // Fix: Prevent closing when clicking link
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{s.name}</span>
                    </Link>
                  );
                })}

                <div className="flex items-center justify-between pt-2 border-t border-silver-200 dark:border-silver-500/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDarkMode(!darkMode);
                    }}
                    className="px-3 py-1 rounded bg-accent text-white text-sm hover:bg-accent-hover transition-colors"
                  >
                    {darkMode ? "☀️ Light" : "🌙 Dark"}
                  </button>
                  {user ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }} 
                      className="px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="px-3 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ===== Main Content ===== */}
        <main className="max-w-5xl mx-auto pb-16">{children}</main>
      </body>
    </html>
  );
}