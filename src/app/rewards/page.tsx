"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost: number;
};

type Redemption = {
  id: string;
  reward_id: string;
  redeemed_at: string;
  rewards: Reward;
};

export default function RewardsShop() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    fetchRewards();
    fetchPoints();
    fetchRedemptions();
  }, []);

  const fetchRewards = async () => {
    const { data } = await supabase.from("rewards").select("*").order("cost");
    if (data) setRewards(data);
  };

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

  const fetchRedemptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("redemptions")
      .select("id, reward_id, redeemed_at, rewards(*)")
      .eq("user_id", user.id)
      .order("redeemed_at", { ascending: false });

    if (data) setRedemptions(data as Redemption[]);
  };

  const redeemReward = async (reward: Reward) => {
    if (points < reward.cost) {
      alert("Not enough points!");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("redemptions").insert([
      { user_id: user.id, reward_id: reward.id },
    ]);

    if (!error) {
      alert(`Redeemed: ${reward.title}`);
      setPoints(points - reward.cost);
      fetchRedemptions();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🏆 Rewards Shop</h1>

      {/* Points */}
      <div className="bg-silver-100 text-slate-900 p-4 rounded flex justify-between items-center">
        <span className="font-semibold">Your Points</span>
        <span className="text-2xl font-bold">{points}</span>
      </div>

      {/* Shop */}
      <ul className="space-y-3">
        {rewards.map((r) => (
          <li
            key={r.id}
            className="bg-silver-100 text-slate-900 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{r.title}</p>
              {r.description && (
                <p className="text-sm text-silver-600">{r.description}</p>
              )}
              <p className="text-xs">Cost: {r.cost} pts</p>
            </div>
            <button
              onClick={() => redeemReward(r)}
              className="px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600 transition"
            >
              Redeem
            </button>
          </li>
        ))}
      </ul>

      {/* Redemptions History */}
      <div className="bg-silver-100 text-slate-900 p-4 rounded">
        <h2 className="font-semibold mb-3">📜 My Redemptions</h2>
        {redemptions.length === 0 ? (
          <p className="text-silver-600 text-sm">No rewards redeemed yet.</p>
        ) : (
          <ul className="space-y-2">
            {redemptions.map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center border-b border-silver-300/40 pb-1"
              >
                <span>{r.rewards?.title || "Unknown Reward"}</span>
                <span className="text-xs text-silver-600">
                  {new Date(r.redeemed_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
