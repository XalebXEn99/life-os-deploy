"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import MoodChart from "./MoodChart";

type Mood = {
  id: string;
  mood: string;
  note: string;
  created_at: string;
};

const moodsList = ["😊 Happy", "😐 Neutral", "😔 Sad", "😤 Stressed", "😌 Calm"];

export default function MoodTracker() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchMoods = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("moods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setMoods(data);
    };
    fetchMoods();
  }, []);

const addMood = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !selectedMood) return;

  const { data, error } = await supabase
    .from("moods")
    .insert([{ mood: selectedMood, note, user_id: user.id }])
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "mental",
        type: "mood_log",
        details: { mood: selectedMood, note },
      },
    ]);

    setMoods([data, ...moods]);
    setSelectedMood("");
    setNote("");
  }
};


  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Mood Tracker</h2>
      <div className="flex flex-col gap-2 mb-4">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        >
          <option value="">Select mood...</option>
          {moodsList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Optional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addMood}
          className="px-4 py-2 rounded bg-green-400 text-white"
        >
          Log Mood
        </button>
      </div>

      <ul className="space-y-3">
        {moods.map((m) => (
          <li
            key={m.id}
            className="bg-silver-100 text-slate-900 px-3 py-2 rounded"
          >
            <p className="font-semibold">{m.mood}</p>
            <p className="text-sm text-silver-600">
              {new Date(m.created_at).toLocaleString()}
            </p>
            {m.note && <p className="mt-1">{m.note}</p>}
          </li>
        ))}
      </ul>

      {/* ✅ Chart goes here, inside the component */}
      <MoodChart moods={moods} />
    </div>
  );
}
