"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Workout = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  notes: string;
  date: string;
};

export default function WorkoutLog() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (data) setWorkouts(data);
    };
    fetchWorkouts();
  }, []);
const addWorkout = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !exercise.trim()) return;

  const { data, error } = await supabase
    .from("workouts")
    .insert([{ exercise, sets, reps, notes, user_id: user.id }])
    .select()
    .single();

  if (!error && data) {
    // ✅ also log to life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "physical",
        type: "workout",
        details: { exercise, sets, reps, notes },
      },
    ]);

    setWorkouts([data, ...workouts]);
    setExercise("");
    setSets("");
    setReps("");
    setNotes("");
  }
};


  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Workout Log</h2>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Exercise"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Sets"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            className="px-3 py-2 rounded bg-silver-300 text-slate-900 w-1/2"
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="px-3 py-2 rounded bg-silver-300 text-slate-900 w-1/2"
          />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded bg-silver-300 text-slate-900"
        />
        <button
          onClick={addWorkout}
          className="px-4 py-2 rounded bg-green-400 text-white"
        >
          Add Workout
        </button>
      </div>

      <ul className="space-y-3">
        {workouts.map((w) => (
          <li
            key={w.id}
            className="bg-silver-100 text-slate-900 px-3 py-2 rounded"
          >
            <h3 className="font-semibold">{w.exercise}</h3>
            <p className="text-sm text-silver-600">
              {w.sets} sets × {w.reps} reps — {new Date(w.date).toLocaleDateString()}
            </p>
            {w.notes && <p className="mt-1">{w.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
