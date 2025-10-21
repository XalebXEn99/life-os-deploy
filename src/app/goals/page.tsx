"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

// Types
type Goal = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  reward_points: number;
};

// --- UI Components ---
function ProgressBar({ current, target }: { current: number; target: number }) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="w-full bg-silver-300 rounded-full h-4 overflow-hidden">
      <div
        className="bg-green-400 h-4 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;
  return (
    <div className="flex items-center gap-2 bg-orange-400 text-white px-3 py-1 rounded-full w-fit">
      🔥 <span>{streak}-day streak</span>
    </div>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) return;

    let increment = end > start ? 1 : -1;
    const timer = setInterval(() => {
      start += increment;
      setDisplay(start);
      if (start === end) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="text-3xl font-bold">{display}</span>;
}

// --- Main Component ---
export default function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(10);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchGoals();
    fetchStreak();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("created_at", new Date().toISOString().slice(0, 10));

    if (data) setGoals(data);
  };

  const fetchStreak = async () => {
    // Simplified streak logic: count consecutive days with at least 1 completed goal
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("daily_goals")
      .select("created_at, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(14);

    if (data) {
      let streakCount = 0;
      let currentDate = new Date();
      for (let i = 0; i < data.length; i++) {
        const goalDate = new Date(data[i].created_at);
        const sameDay =
          goalDate.toISOString().slice(0, 10) ===
          currentDate.toISOString().slice(0, 10);

        if (sameDay && data[i].completed) {
          streakCount++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }
      setStreak(streakCount);
    }
  };

  const addGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !title.trim()) return;

    const { data, error } = await supabase
      .from("daily_goals")
      .insert([{ user_id: user.id, title, description, reward_points: points }])
      .select()
      .single();

    if (!error && data) {
      setGoals([...goals, data]);
      setTitle("");
      setDescription("");
      setPoints(10);
    }
  };

  const toggleGoal = async (goal: Goal) => {
    const { data, error } = await supabase
      .from("daily_goals")
      .update({ completed: !goal.completed })
      .eq("id", goal.id)
      .select()
      .single();

    if (!error && data) {
      setGoals(goals.map((g) => (g.id === goal.id ? data : g)));
    }
  };

  const totalPoints = goals
    .filter((g) => g.completed)
    .reduce((sum, g) => sum + g.reward_points, 0);

  const targetPoints = 100; // Example daily target

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎯 Daily Goals</h1>

      {/* Streak */}
      <StreakBadge streak={streak} />

      {/* Add Goal */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <input
          type="number"
          placeholder="Points"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addGoal}
          className="px-4 py-2 rounded bg-green-400 text-white"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <ul className="space-y-3">
        {goals.map((g) => (
          <li
            key={g.id}
            className={`px-3 py-2 rounded flex justify-between items-center ${
              g.completed ? "bg-green-200" : "bg-silver-100"
            }`}
          >
            <div>
              <p className="font-semibold">{g.title}</p>
              {g.description && (
                <p className="text-sm text-silver-600">{g.description}</p>
              )}
              <p className="text-xs">Reward: {g.reward_points} pts</p>
            </div>
            <button
              onClick={() => toggleGoal(g)}
              className="px-3 py-1 rounded bg-blue-400 text-white"
            >
              {g.completed ? "Undo" : "Complete"}
            </button>
          </li>
        ))}
      </ul>

      {/* Rewards Summary */}
      <div className="bg-silver-100 text-slate-900 p-4 rounded space-y-2">
        <h2 className="font-semibold">⭐ Points Earned Today</h2>
        <AnimatedCounter value={totalPoints} />
        <ProgressBar current={totalPoints} target={targetPoints} />
        <p className="text-sm text-silver-600">
          Target: {targetPoints} pts
        </p>
      </div>
    </div>
  );
}

