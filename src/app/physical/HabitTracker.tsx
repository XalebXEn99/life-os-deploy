"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type HabitInstance = {
  id: string;
  date: string;
  completed: boolean;
  habit_templates: {
    id: string;
    name: string;
    active: boolean;
  };
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<HabitInstance[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    // 1. Get all active templates
    const { data: templates } = await supabase
      .from("habit_templates")
      .select("id, name, active")
      .eq("user_id", user.id)
      .eq("active", true);

    if (!templates) return;

    // 2. For each template, ensure today's instance exists
    for (const t of templates) {
      const { data: existingRows } = await supabase
        .from("habit_instances")
        .select("id")
        .eq("template_id", t.id)
        .eq("date", today)
        .limit(1);

      const existing = existingRows?.[0];
      if (!existing) {
        await supabase.from("habit_instances").insert([
          { template_id: t.id, date: today, completed: false },
        ]);
      }
    }

    // 3. Fetch today's instances joined with template info
    const { data: instances } = await supabase
      .from("habit_instances")
      .select("id, date, completed, habit_templates(id, name, active)")
      .eq("date", today)
      .eq("habit_templates.user_id", user.id)
      .eq("habit_templates.active", true);

    if (instances) setHabits(instances as unknown as HabitInstance[]);
  };

  const addHabit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;

    // 1. Create template
    const { data: template } = await supabase
      .from("habit_templates")
      .insert([{ user_id: user.id, name, active: true }])
      .select()
      .single();

    if (!template) return;

    // 2. Create today's instance
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("habit_instances").insert([
      { template_id: template.id, date: today, completed: false },
    ]);

    setName("");
    fetchHabits();
  };

  const toggleHabit = async (habit: HabitInstance) => {
    await supabase
      .from("habit_instances")
      .update({ completed: !habit.completed })
      .eq("id", habit.id);

    fetchHabits();
  };

  const cancelHabit = async (templateId: string) => {
    await supabase
      .from("habit_templates")
      .update({ active: false })
      .eq("id", templateId);

    fetchHabits();
  };

  return (
    <div className="p-4 space-y-4 text-slate-900 dark:text-white">
      <h2 className="text-xl font-semibold">Habit Tracker</h2>

      {/* Add Habit */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New habit (e.g. Drink water)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-silver-200 dark:bg-slate-700"
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      {/* Habits List */}
      <ul className="space-y-2">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex justify-between items-center bg-silver-50 dark:bg-slate-700/60 px-3 py-2 rounded shadow-sm"
          >
            <span
              onClick={() => toggleHabit(h)}
              className={`cursor-pointer ${
                h.completed ? "line-through text-silver-500" : ""
              }`}
            >
              {h.habit_templates.name}
            </span>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={h.completed}
                onChange={() => toggleHabit(h)}
              />
              <button
                onClick={() => cancelHabit(h.habit_templates.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
