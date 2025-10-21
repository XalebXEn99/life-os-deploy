"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type UserProfile = {
  id: string;
  email: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [themeColor, setThemeColor] = useState("green");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const currentUser = data.user;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email! });

      // fetch settings
      const { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("theme_color")
        .eq("user_id", currentUser.id)
        .single();

      if (settingsError) {
        console.error(settingsError);
      }
      if (settings?.theme_color) {
        setThemeColor(settings.theme_color);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const updateTheme = async (color: string) => {
    if (!user) return;
    setThemeColor(color);

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: user.id, theme_color: color },
        { onConflict: "user_id" }
      );

    if (error) console.error(error);
  };

  if (loading) return <p className="p-6">Loading settings...</p>;

  return (
    <div className="p-6 space-y-8 text-slate-900 dark:text-white">
      <h1 className="text-2xl font-bold">⚙️ Settings</h1>

      {/* Profile Section */}
      <section className="bg-silver-50 dark:bg-slate-700/60 p-4 rounded shadow-sm space-y-2">
        <h2 className="font-semibold mb-2">Profile</h2>
        <p>
          <span className="font-medium">User ID:</span> {user?.id}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user?.email}
        </p>
      </section>

      {/* Theme Section */}
      <section className="bg-silver-50 dark:bg-slate-700/60 p-4 rounded shadow-sm">
        <h2 className="font-semibold mb-3">Theme Color</h2>
        <div className="flex gap-3">
          {["green", "purple", "blue", "orange"].map((color) => (
            <button
              key={color}
              onClick={() => updateTheme(color)}
              className={`w-10 h-10 rounded-full border-2 ${
                themeColor === color ? "border-black dark:border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-silver-400">
          Current theme: <span className="font-medium">{themeColor}</span>
        </p>
      </section>
    </div>
  );
}

