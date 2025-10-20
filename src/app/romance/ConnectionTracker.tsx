"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Connection = {
  id: string;
  name: string;
  last_contact: string | null;
  reminder_interval: number;
};

export default function ConnectionTracker() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [name, setName] = useState("");
  const [lastContact, setLastContact] = useState("");
  const [interval, setInterval] = useState(7); // default 7 days

  useEffect(() => {
    const fetchConnections = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("connections")
        .select("*")
        .eq("user_id", user.id)
        .order("last_contact", { ascending: false });

      if (data) setConnections(data);
    };
    fetchConnections();
  }, []);

  const addConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;

    const { data, error } = await supabase
      .from("connections")
      .insert([{ name, last_contact: lastContact, reminder_interval: interval, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setConnections([data, ...connections]);
      setName("");
      setLastContact("");
      setInterval(7);
    }
  };

  const daysSince = (date: string | null) => {
    if (!date) return "Never";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return `${diff} days ago`;
  };

  const isDue = (c: Connection) => {
    if (!c.last_contact) return true;
    const diff = Math.floor((Date.now() - new Date(c.last_contact).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= c.reminder_interval;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Connection Tracker</h2>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Name (e.g. Alex)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <input
          type="date"
          value={lastContact}
          onChange={(e) => setLastContact(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addConnection}
          className="px-4 py-2 rounded bg-purple-400 text-white"
        >
          Add Connection
        </button>
      </div>

      <ul className="space-y-3">
        {connections.map((c) => (
          <li
            key={c.id}
            className={`px-3 py-2 rounded ${
              isDue(c) ? "bg-red-200 text-red-900" : "bg-silver-100 text-slate-900"
            }`}
          >
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm">Last contact: {daysSince(c.last_contact)}</p>
            <p className="text-sm">Reminder every {c.reminder_interval} days</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
