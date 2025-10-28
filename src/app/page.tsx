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
}: {
  name: string;
  path: string;
  icon: string;
  stat?: string;
}) {
  return (
    <Link href={path} className="block no-underline text-inherit">
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                   p-5 rounded-xl shadow-sm transform transition hover:scale-105 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="font-semibold text-lg text-slate-900 dark:text-white">{name}</h2>
            {stat && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
                    p-4 rounded-xl shadow-sm">
      <h2 className="font-semibold mb-2 text-slate-900 dark:text-white">🏆 Rewards Preview</h2>
      {rewards.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No rewards available yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {rewards.map((r) => (
            <li key={r.id} className="flex justify-between text-sm text-slate-700 dark:text-slate-200">
              <span>{r.title}</span>
              <span>{r.cost} pts</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/rewards"
        className="block mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
      >
        View all →
      </Link>
    </div>
  );
}

// --- Dashboard Page ---
export default function Dashboard() {
  const spaces = [
    { name: "Plan", path: "/home", icon: "📝", stat: "Add tasks" },
    { name: "Learn", path: "/school", icon: "📖", stat: "Track study sessions" },
    { name: "Romance", path: "/romance", icon: "💖", stat: "Connections & dates" },
    { name: "Mental", path: "/mental", icon: "🧠", stat: "Mood & reflections" },
    { name: "Physical", path: "/physical", icon: "💪", stat: "Workouts & habits" },
    { name: "Entertainment", path: "/entertainment", icon: "🎮", stat: "Movies, games, books" },
    { name: "Daily Goals", path: "/goals", icon: "🎯", stat: "Set goals and earn rewards" },
    { name: "Rewards Shop", path: "/rewards", icon: "🏆", stat: "Redeem your points" },
    { name: "Settings", path: "/settings", icon: "⚙️", stat: "Profile & theme" },
  ];

  return (
    <main id="top" className="pt-24 p-6 space-y-10">
      {/* Navigation cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <SpaceCard
            key={s.name}
            name={s.name}
            path={s.path}
            icon={s.icon}
            stat={s.stat}
          />
        ))}
      </section>

      {/* Rewards Preview */}
      <section>
        <RewardsPreview />
      </section>

      {/* Stats section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Your Stats</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}
