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
    <Link href={path}>
      <div className="bg-gradient-to-br from-silver-200 to-silver-400 text-slate-900 p-5 rounded-xl shadow-md transform transition hover:scale-105 hover:shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="font-semibold text-lg">{name}</h2>
            {stat && <p className="text-sm text-silver-700">{stat}</p>}
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
    <div className="bg-silver-100 text-slate-900 p-4 rounded">
      <h2 className="font-semibold mb-2">🏆 Rewards Preview</h2>
      {rewards.length === 0 ? (
        <p className="text-sm text-silver-600">No rewards available yet.</p>
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
        className="block mt-2 text-purple-600 hover:underline text-sm"
      >
        View all →
      </Link>
    </div>
  );
}

// --- Dashboard Page ---
export default function Dashboard() {
const spaces = [
  { name: "Home", path: "/home", icon: "🏠", stat: "Welcome hub" },
  { name: "School", path: "/school", icon: "📖", stat: "Track study sessions" },
  { name: "Romance", path: "/romance", icon: "💖", stat: "Connections & dates" },
  { name: "Mental", path: "/mental", icon: "🧠", stat: "Mood & reflections" },
  { name: "Physical", path: "/physical", icon: "💪", stat: "Workouts & habits" },
  { name: "Entertainment", path: "/entertainment", icon: "🎮", stat: "Movies, games, books" },
  { name: "Daily Goals", path: "/goals", icon: "🎯", stat: "Earn rewards" },
  { name: "Rewards Shop", path: "/rewards", icon: "🏆", stat: "Redeem your points" },
  // ✅ New Settings card
  { name: "Settings", path: "/settings", icon: "⚙️", stat: "Profile & theme" },
];

  return (
    <main className="p-6 space-y-10">

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
            {/* Rewards Preview */}
      <section>
        <RewardsPreview />
      </section>
      </section>

      {/* Stats section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
        <StatsDashboard />
      </section>

  
    </main>
  );
}
