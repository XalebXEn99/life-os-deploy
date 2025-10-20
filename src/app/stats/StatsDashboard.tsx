"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = { id: string; done: boolean };
type Session = { id: string; type: string; duration: number; ended_at: string };

export default function StatsDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch tasks
      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, done")
        .eq("user_id", user.id);

      // Fetch study sessions
      const { data: sessionData } = await supabase
        .from("study_sessions")
        .select("id, type, duration, ended_at")
        .eq("user_id", user.id);

      if (taskData) setTasks(taskData);
      if (sessionData) setSessions(sessionData);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-silver-400">Loading stats...</p>;

  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const totalStudyMinutes = sessions
    .filter((s) => s.type === "study")
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-silver-100 text-slate-900 p-4 rounded">
        <h2 className="font-semibold">Tasks</h2>
        <p>
          {completedTasks} / {totalTasks} completed
        </p>
      </div>

      <div className="bg-silver-100 text-slate-900 p-4 rounded">
        <h2 className="font-semibold">Study Time</h2>
        <p>{totalStudyMinutes} minutes logged</p>
      </div>

      {/* Placeholder for charts */}
      <div className="bg-silver-100 text-slate-900 p-4 rounded">
        <h2 className="font-semibold">Charts</h2>
        <p>Coming soon: visual breakdown of study sessions and tasks.</p>
      </div>
    </div>
  );
}
