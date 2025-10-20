"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient"; // adjust path if needed

type Task = {
  id: string;
  text: string;
  done: boolean;
  category: string;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Supabase fetch error:", error.message);
      } else if (data) {
        setTasks(data);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !input.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ text: input.trim(), done: false, category, user_id: user.id }])
      .select()
      .single();

    if (!error && data) setTasks([...tasks, data]);
    setInput("");
  };

  const toggleTask = async (task: Task) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id)
      .select()
      .single();

    if (!error && data) {
      setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
    }
  };

  const removeTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Tasks</h2>

      {loading ? (
        <p className="text-silver-400">Loading tasks...</p>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 rounded bg-silver-300 text-slate-900"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2 py-2 rounded bg-silver-300 text-slate-900"
            >
              <option value="daily">Daily</option>
              <option value="project">Project</option>
            </select>
            <button
              onClick={addTask}
              className="px-4 py-2 rounded bg-green-400 text-white"
            >
              Add
            </button>
          </div>

          <h3 className="font-semibold mt-4">Daily</h3>
          <ul className="space-y-2">
            {tasks.filter((t) => t.category === "daily").map((task) => (
              <li key={task.id} className="flex justify-between items-center bg-silver-100 text-slate-900 px-3 py-2 rounded">
                <span
                  onClick={() => toggleTask(task)}
                  className={`cursor-pointer ${task.done ? "line-through text-silver-500" : ""}`}
                >
                  {task.text}
                </span>
                <button onClick={() => removeTask(task.id)} className="text-red-500 hover:text-red-700">✕</button>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mt-6">Projects</h3>
          <ul className="space-y-2">
            {tasks.filter((t) => t.category === "project").map((task) => (
              <li key={task.id} className="flex justify-between items-center bg-silver-100 text-slate-900 px-3 py-2 rounded">
                <span
                  onClick={() => toggleTask(task)}
                  className={`cursor-pointer ${task.done ? "line-through text-silver-500" : ""}`}
                >
                  {task.text}
                </span>
                <button onClick={() => removeTask(task.id)} className="text-red-500 hover:text-red-700">✕</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
