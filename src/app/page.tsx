"use client";
import Link from "next/link";
import StatsDashboard from "./stats/StatsDashboard";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// --- Reusable SpaceCard ---
function SpaceCard({
  name,
  path,
  icon,
  stat,
  color,
}: {
  name: string;
  path: string;
  icon: string;
  stat?: string;
  color: string;
}) {
  // Option 1: stronger background + border colors
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700",
    green: "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700",
    pink: "bg-pink-100 dark:bg-pink-900/40 border border-pink-300 dark:border-pink-700",
    purple: "bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700",
    yellow: "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700",
    red: "bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700",
    gray: "bg-silver-100 dark:bg-slate-700/60 border border-silver-300 dark:border-slate-600",
  };

  // Option 2: text/icon accent colors
  const textColorClasses: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    pink: "text-pink-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    gray: "text-slate-600",
  };

  return (
    <Link href={path}>
      <div
        className={`${colorClasses[color]} 
        p-5 rounded-xl shadow-sm transform transition hover:scale-105 hover:shadow-md`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-3xl ${textColorClasses[color]}`}>{icon}</span>
          <div>
            <h2 className="font-semibold text-lg">{name}</h2>
            {stat && (
              <p className="text-sm text-slate-600 dark:text-silver-400">
                {stat}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- Rewards Preview Widget ---
type Reward = {
  id: string;
  title: string;
  cost: number;
};

function RewardsPreview() {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data } = await supabase
        .from("rewards")
        .select("*")
        .order("cost")
        .limit(3);
      if (data) setRewards(data);
    };
    fetchRewards();
  }, []);

  return (
    <div className="bg-silver-50 dark:bg-slate-700/60 p-4 rounded shadow-sm">
      <h2 className="font-semibold mb-2">🏆 Rewards Preview</h2>
      {rewards.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-silver-400">
          No rewards available yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {rewards.map((r) => (
            <li key={r.id} className="flex justify-between text-sm">
              <span>{r.title}</span>
              <span>{r.cost} pts</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/rewards"
        className="block mt-2 text-purple-600 dark:text-purple-400 hover:underline text-sm"
      >
        View all →
      </Link>
    </div>
  );
}

// --- Dashboard Page ---
export default function Dashboard() {
  const spaces = [
    { name: "Plan", path: "/home", icon: "📝", stat: "Add tasks", color: "blue" },
    { name: "Learn", path: "/school", icon: "📖", stat: "Track study sessions", color: "green" },
    { name: "Romance", path: "/romance", icon: "💖", stat: "Connections & dates", color: "pink" },
    { name: "Mental", path: "/mental", icon: "🧠", stat: "Mood & reflections", color: "purple" },
    { name: "Physical", path: "/physical", icon: "💪", stat: "Workouts & habits", color: "yellow" },
    { name: "Entertainment", path: "/entertainment", icon: "🎮", stat: "Movies, games, books", color: "red" },
    { name: "Daily Goals", path: "/goals", icon: "🎯", stat: "Set goals and earn rewards", color: "green" },
    { name: "Rewards Shop", path: "/rewards", icon: "🏆", stat: "Redeem your points", color: "blue" },
    { name: "Settings", path: "/settings", icon: "⚙️", stat: "Profile & theme", color: "purple" },
  ];

  return (
    <main
      id="top"
      className="pt-24 p-6 space-y-10 text-slate-900 dark:text-white"
    >
      {/* Navigation cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <SpaceCard
            key={s.name}
            name={s.name}
            path={s.path}
            icon={s.icon}
            stat={s.stat}
            color={s.color}
          />
        ))}
      </section>

      {/* Rewards Preview */}
      <section>
        <RewardsPreview />
      </section>

      {/* Stats section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}





