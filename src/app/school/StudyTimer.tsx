"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient"; // adjust path if needed

type Session = {
  id: string;
  type: string;
  duration: number;
  ended_at: string;
};

export default function StudyTimer() {
  const [studyLength, setStudyLength] = useState(25); // minutes
  const [breakLength, setBreakLength] = useState(5);  // minutes
  const [timeLeft, setTimeLeft] = useState(studyLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isStudy, setIsStudy] = useState(true);
  const [history, setHistory] = useState<Session[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ask for notification permission once
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) return prev - 1;
          handleSessionEnd();
          return 0;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Notify helper
  const notify = (message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  };

// Handle session end
const handleSessionEnd = async () => {
  setIsRunning(false);

  // Log session to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Insert into study_sessions
    await supabase.from("study_sessions").insert([
      {
        user_id: user.id,
        type: isStudy ? "study" : "break",
        duration: isStudy ? studyLength : breakLength,
        ended_at: new Date().toISOString(),
      },
    ]);

    // ✅ Also insert into life_events
    await supabase.from("life_events").insert([
      {
        user_id: user.id,
        space: "school",
        type: "study_session",
        details: {
          sessionType: isStudy ? "study" : "break",
          duration: isStudy ? studyLength : breakLength,
        },
      },
    ]);

    fetchHistory(); // refresh history after logging
  }

  // Notify
  notify(isStudy ? "Study session complete! Time for a break." : "Break over! Back to studying.");

  // Switch to next session
  if (isStudy) {
    setIsStudy(false);
    setTimeLeft(breakLength * 60);
  } else {
    setIsStudy(true);
    setTimeLeft(studyLength * 60);
  }
};


  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setIsStudy(true);
    setTimeLeft(studyLength * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Fetch history
  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("ended_at", { ascending: false })
      .limit(10);

    if (data) setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="mt-6 flex flex-col items-center">
      {/* Controls for custom lengths */}
      <div className="flex gap-4 mb-4">
        <label>
          Study:
          <input
            type="number"
            value={studyLength}
            onChange={(e) => setStudyLength(Number(e.target.value))}
            className="ml-2 w-16 px-2 py-1 rounded bg-silver-300 text-slate-900"
          />
        </label>
        <label>
          Break:
          <input
            type="number"
            value={breakLength}
            onChange={(e) => setBreakLength(Number(e.target.value))}
            className="ml-2 w-16 px-2 py-1 rounded bg-silver-300 text-slate-900"
          />
        </label>
      </div>

      {/* Timer display */}
      <div className="text-5xl font-mono mb-4">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
      <p className="mb-4 text-silver-400">
        {isStudy ? "Study Session" : "Break Time"}
      </p>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="px-4 py-2 rounded bg-green-400 text-white"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 rounded bg-red-400 text-white"
        >
          Reset
        </button>
      </div>

      {/* History */}
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Recent Sessions</h2>
        <ul className="space-y-2">
          {history.map((s) => (
            <li
              key={s.id}
              className="bg-silver-100 text-slate-900 px-3 py-2 rounded"
            >
              {s.type === "study" ? "📖 Study" : "☕ Break"} — {s.duration} min —{" "}
              {new Date(s.ended_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
