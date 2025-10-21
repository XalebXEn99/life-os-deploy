"use client";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PointsCounter from "./components/PointsCounter";
import type { User } from "@supabase/supabase-js";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [themeColor, setThemeColor] = useState("green"); // default accent

    useEffect(() => {
        // Auth
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Fetch theme color if logged in
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

    const spaces = [
        { name: "Dashboard", path: "/" },
        { name: "Home", path: "/home" },
        { name: "School", path: "/school" },
        { name: "Romance", path: "/romance" },
        { name: "Mental", path: "/mental" },
        { name: "Physical", path: "/physical" },
        { name: "Entertainment", path: "/entertainment" },
        { name: "Daily Goals", path: "/goals" },
        { name: "Rewards Shop", path: "/rewards" },
        { name: "Settings", path: "/settings" },
    ];

    return (
        <html lang="en" className={`${darkMode ? "dark" : ""} theme-${themeColor}`}>
            <body className="bg-silver-50 text-slate-900 dark:bg-slate-900 dark:text-silver-100 transition-colors">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-silver-200 dark:border-silver-500/20">
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center justify-between px-6 py-3">
                        <h1 className="text-xl font-bold">Life OS</h1>

                        <div className="flex gap-6">
                            {spaces.map((s) => (
                                <Link
                                    key={s.name}
                                    href={s.path}
                                    className="transition hover:opacity-80"
                                    style={{ color: `var(--${themeColor})` }}
                                >
                                    {s.name}
                                </Link>
                            ))}
                        </div>

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
                                <Link
                                    href="/login"
                                    className="transition hover:opacity-80"
                                    style={{ color: `var(--${themeColor})` }}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Mobile Nav */}
                    <div className="flex md:hidden items-center justify-between px-4 py-3">
                        <h1 className="text-lg font-bold">Life OS</h1>
                        <div className="flex items-center gap-3">
                            <PointsCounter />
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="focus:outline-none"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {menuOpen ? (
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

                    {/* Mobile Dropdown */}
                    {menuOpen && (
                        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-silver-200 dark:border-silver-500/20 px-4 py-3 space-y-3">
                            {spaces.map((s) => (
                                <Link
                                    key={s.name}
                                    href={s.path}
                                    className="block transition hover:opacity-80"
                                    style={{ color: `var(--${themeColor})` }}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {s.name}
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
                                        onClick={() => setMenuOpen(false)}
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
