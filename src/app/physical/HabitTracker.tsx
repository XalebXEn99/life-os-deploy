"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Habit = {
  id: string;
  name: string;
  completed: boolean;
  date: string;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchHabits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0]); // today only

      if (data) setHabits(data);
    };
    fetchHabits();
  }, []);

const addHabit = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !name.trim()) return;

  const { data, error } = await supabase
    .from("habits")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "physical",
        type: "habit",
        details: { name, completed: false },
      },
    ]);

    setHabits([...habits, data]);
    setName("");
  }
};

const toggleHabit = async (habit: Habit) => {
  const { data, error } = await supabase
    .from("habits")
    .update({ completed: !habit.completed })
    .eq("id", habit.id)
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: data.user_id,
        space: "physical",
        type: "habit_toggle",
        details: { name: habit.name, completed: !habit.completed },
      },
    ]);

    setHabits(habits.map((h) => (h.id === habit.id ? data : h)));
  }
};


  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Habit Tracker</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New habit (e.g. Drink water)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 rounded bg-blue-400 text-white"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex justify-between items-center bg-silver-100 text-slate-900 px-3 py-2 rounded"
          >
            <span
              onClick={() => toggleHabit(h)}
              className={`cursor-pointer ${h.completed ? "line-through text-silver-500" : ""}`}
            >
              {h.name}
            </span>
            <input
              type="checkbox"
              checked={h.completed}
              onChange={() => toggleHabit(h)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
