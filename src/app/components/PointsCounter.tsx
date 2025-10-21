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

    const { data, error } = await supabase
      .from("user_points")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!error && data) setPoints(data.balance);
  };

  fetchPoints();

  // 👇 subscribe to user_points, not daily_goals
  const channel = supabase
    .channel("points-balance-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_points" },
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

