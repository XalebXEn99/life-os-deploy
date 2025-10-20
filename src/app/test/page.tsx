"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function TestPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) {
        console.error("Supabase error:", error.message);
      } else {
        setData(data);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Supabase Test</h1>
      <pre className="mt-4 bg-silver-100 text-slate-900 p-3 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
