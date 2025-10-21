"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

export default function PointsCounter() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().slice(0, 10);

      const { data } = await supabase
        .from("daily_goals")
        .select("reward_points, completed, created_at")
        .eq("user_id", user.id)
        .eq("created_at", today)
        .eq("completed", true);

      if (data) {
        const total = data.reduce((sum, g) => sum + g.reward_points, 0);
        setPoints(total);
      }
    };

    fetchPoints();

    const channel = supabase
      .channel("points-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_goals" },
        () => fetchPoints()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/rewards">
      <div className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-purple-600 transition">
        <span>⭐</span>
        <span>{points}</span>
      </div>
    </Link>
  );
}
