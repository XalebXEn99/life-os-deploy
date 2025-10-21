"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Item = {
  id: string;
  title: string;
  type: string;
  status: string;
  rating: number | null;
  notes: string | null;
};

export default function EntertainmentLog() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [status, setStatus] = useState("planned");
  const [rating, setRating] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("entertainment_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setItems(data);
    };
    fetchItems();
  }, []);

const addItem = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !title.trim()) return;

  const { data, error } = await supabase
    .from("entertainment_items")
    .insert([{ title, type, status, rating: rating || null, notes, user_id: user.id }])
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "entertainment",
        type: "media",
        details: { title, type, status, rating, notes },
      },
    ]);

    setItems([data, ...items]);
    setTitle("");
    setType("movie");
    setStatus("planned");
    setRating("");
    setNotes("");
  }
};


  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Watchlist / Playlist</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Title (e.g. Inception, Zelda, Dune)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 px-2 py-2 rounded bg-silver-300 text-slate-900"
          >
            <option value="movie">Movie</option>
            <option value="show">Show</option>
            <option value="game">Game</option>
            <option value="book">Book</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 px-2 py-2 rounded bg-silver-300 text-slate-900"
          >
            <option value="planned">Planned</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <input
          type="number"
          placeholder="Rating (1-10)"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 rounded bg-purple-400 text-white"
        >
          Add Item
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((i) => (
          <li
            key={i.id}
            className="bg-silver-100 text-slate-900 px-3 py-2 rounded"
          >
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-sm text-silver-600">
              {i.type} — {i.status}
            </p>
            {i.rating && <p>⭐ {i.rating}/10</p>}
            {i.notes && <p className="mt-1">{i.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
