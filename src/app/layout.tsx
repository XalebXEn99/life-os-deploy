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
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("green");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  return (
    <html lang="en" className={`${darkMode ? "dark" : ""} theme-${themeColor}`}>
      <body className="bg-silver-50 text-slate-900 dark:bg-slate-900 dark:text-white transition-colors">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-silver-200 dark:border-silver-500/20">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-between px-6 py-3">
            {/* Left: Life OS + toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollToTop}
                className="text-xl font-bold px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
              >
                Life OS
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-2 py-1 rounded hover:bg-silver-200 dark:hover:bg-slate-700 transition"
              >
                {expanded ? "<" : ">"}
              </button>
            </div>

{/* Center: animated inline nav */}
<div
  className={`flex items-center gap-4 transition-all duration-500 ${
    expanded ? "opacity-100" : "opacity-0 pointer-events-none"
  }`}
>
  {spaces.map((s, i) => (
    <Link
      key={s.name}
      href={s.path}
      className={`flex items-center gap-1 text-sm transform transition-all duration-300 ${
        expanded
          ? `opacity-100 translate-x-0 delay-[${i * 75}ms]`
          : "opacity-0 -translate-x-4"
      }`}
      onClick={() => setExpanded(false)}
    >
      <s.icon className="w-4 h-4 shrink-0" />
      <span>{s.name}</span>
    </Link>
  ))}
</div>


            {/* Right: points + controls */}
            <div className="flex items-center gap-4">
              <PointsCounter />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-2 py-1 rounded bg-silver-200 dark:bg-slate-700 text-sm"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hover:text-red-500 transition"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Nav (unchanged) */}
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
                onClick={() => setExpanded(!expanded)}
                className="focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {expanded ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown (unchanged) */}
          {expanded && (
            <div className="md:hidden bg-white dark:bg-slate-800 border-t border-silver-200 dark:border-silver-500/20 px-4 py-3 space-y-2">
              {spaces.map((s) => (
                <Link
                  key={s.name}
                  href={s.path}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-silver-100 dark:hover:bg-slate-700 transition"
                  onClick={() => setExpanded(false)}
                >
                  <s.icon className="w-4 h-4 shrink-0" />
                  <span>{s.name}</span>
                </Link>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-silver-200 dark:border-silver-500/20">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-2 py-1 rounded bg-silver-200 dark:bg-slate-700 text-sm"
                >
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-500 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="transition hover:opacity-80"
                    style={{ color: `var(--${themeColor})` }}
                    onClick={() => setExpanded(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="max-w-5xl mx-auto pb-16">{children}</main>
      </body>
    </html>
  );
}
