"use client";
import Link from "next/link";
import StatsDashboard from "./stats/StatsDashboard";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
      <div className="card">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="font-semibold text-lg">{name}</h2>
            {stat && <p className="text-sm text-neutral-dark dark:text-neutral-light">{stat}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

type Reward = {
  id: string;
  title: string;
  cost: number;
};

function RewardsPreview() {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data } = await supabase.from("rewards").select("*").order("cost").limit(3);
      if (data) setRewards(data);
    };
    fetchRewards();
  }, []);

  return (
    <div className="card">
      <h2 className="font-semibold mb-2">🏆 Rewards Preview</h2>
      {rewards.length === 0 ? (
        <p className="text-sm text-neutral-dark dark:text-neutral-light">No rewards yet.</p>
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
      <Link href="/rewards" className="mt-2 block text-accent hover:underline">
        View all →
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const spaces = [
    { name: "Plan", path: "/home", icon: "📝", stat: "Add tasks" },
    { name: "Learn", path: "/school", icon: "📖", stat: "Track study sessions" },
    { name: "Romance", path: "/romance", icon: "💖", stat: "Connections & dates" },
    { name: "Mental", path: "/mental", icon: "🧠", stat: "Mood & reflections" },
    { name: "Physical", path: "/physical", icon: "💪", stat: "Workouts & habits" },
    { name: "Entertainment", path: "/entertainment", icon: "🎮", stat: "Movies, games, books" },
    { name: "Daily Goals", path: "/goals", icon: "🎯", stat: "Set goals & earn rewards" },
    { name: "Rewards Shop", path: "/rewards", icon: "🏆", stat: "Redeem points" },
    { name: "Settings", path: "/settings", icon: "⚙️", stat: "Profile & theme" },
  ];

  return (
    <main className="pt-24 p-6 space-y-10">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <SpaceCard key={s.name} name={s.name} path={s.path} icon={s.icon} stat={s.stat} />
        ))}
      </section>

      <section>
        <RewardsPreview />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}
