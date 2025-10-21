"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Entry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("mental_journal")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setEntries(data);
    };
    fetchEntries();
  }, []);

  const addEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !content.trim()) return;

    const { data, error } = await supabase
      .from("mental_journal")
      .insert([{ title, content, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setEntries([data, ...entries]);
      setTitle("");
      setContent("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Journal</h2>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addEntry}
          className="px-4 py-2 rounded bg-blue-400 text-white"
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
            <h3 className="font-semibold">{entry.title || "Untitled"}</h3>
            <p className="text-sm text-silver-600">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            <p className="mt-1">{entry.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
