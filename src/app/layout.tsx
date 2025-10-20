"use client";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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
  ];

  return (
    <html lang="en">
      <body className="bg-slateBg text-silver-100">
        <header className="sticky top-0 z-50 bg-slateBg border-b border-silver-500/20">
          <nav className="flex flex-wrap gap-4 p-4 text-sm font-medium">
            {spaces.map((s) => (
              <Link key={s.name} href={s.path} className="hover:text-green-400 transition">
                {s.name}
              </Link>
            ))}
            <div className="ml-auto">
              {user ? (
                <button onClick={handleLogout} className="hover:text-red-400 transition">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="hover:text-green-400 transition">
                  Login
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto pb-16">{children}</main>
      </body>
    </html>
  );
}
