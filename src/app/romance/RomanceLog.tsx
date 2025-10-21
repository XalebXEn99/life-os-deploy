"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Entry = {
  id: string;
  title: string;
  notes: string;
  date: string;
};

export default function RomanceLog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("romance_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (data) setEntries(data);
    };
    fetchEntries();
  }, []);

const addEntry = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !title.trim()) return;

  const { data, error } = await supabase
    .from("romance_entries")
    .insert([{ title, notes, date, user_id: user.id }])
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "romance",
        type: "date",
        details: { title, notes, date },
      },
    ]);

    setEntries([data, ...entries]);
    setTitle("");
    setNotes("");
    setDate("");
  }
};

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Date & Memory Log</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Title (e.g. Dinner at Luna Café)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <textarea
          placeholder="Notes or reflections..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addEntry}
          className="px-4 py-2 rounded bg-pink-400 text-white"
        >
          Add Entry
        </button>
      </div>

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="bg-silver-100 text-slate-900 px-3 py-2 rounded"
          >
            <h3 className="font-semibold">{entry.title}</h3>
            <p className="text-sm text-silver-600">
              {entry.date ? new Date(entry.date).toLocaleDateString() : ""}
            </p>
            <p className="mt-1">{entry.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
