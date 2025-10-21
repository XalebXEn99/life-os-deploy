"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    ArcElement,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    ArcElement
);

// Define a flexible but type-safe details type
type LifeEventDetails = {
    duration?: number;
    status?: string;
    mood_score?: number;
    [key: string]: unknown; // allow extra keys without using `any`
};

type LifeEvent = {
    id: string;
    space: string;
    type: string;
    details: LifeEventDetails | null;
    created_at: string;
};

export default function StatsDashboard() {
    const [events, setEvents] = useState<LifeEvent[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("life_events")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (data) setEvents(data as LifeEvent[]);
        };
        fetchEvents();
    }, []);

    // --- Aggregations ---
    const studySessions = events.filter((e) => e.type === "study_session").length;
    const workouts = events.filter((e) => e.type === "workout").length;
    const moods = events.filter((e) => e.type === "mood_log");
    const dates = events.filter((e) => e.type === "date").length;
    const mediaCompleted = events.filter(
        (e) => e.type === "media" && e.details?.status === "completed"
    ).length;

    // --- Study Chart Data ---
    const studyData = events
        .filter((e) => e.type === "study_session")
        .reduce((acc: Record<string, number>, e) => {
            const day = new Date(e.created_at).toLocaleDateString();
            acc[day] = (acc[day] || 0) + (e.details?.duration ?? 0);
            return acc;
        }, {});

    const studyChart = {
        labels: Object.keys(studyData),
        datasets: [
            {
                label: "Study Minutes",
                data: Object.values(studyData),
                borderColor: "rgba(34,197,94,1)",
                backgroundColor: "rgba(34,197,94,0.3)",
                tension: 0.3,
            },
        ],
    };

    // --- Mood Trend Chart ---
    const moodData = moods.map((m) => ({
        x: new Date(m.created_at).toLocaleDateString(),
        y: m.details?.mood_score ?? 0,
    }));

    const moodChart = {
        labels: moodData.map((d) => d.x),
        datasets: [
            {
                label: "Mood Trend",
                data: moodData.map((d) => d.y),
                borderColor: "rgba(59,130,246,1)",
                backgroundColor: "rgba(59,130,246,0.3)",
                tension: 0.3,
            },
        ],
    };

    // --- Donut Chart (events by space) ---
    const spaceCounts = events.reduce((acc: Record<string, number>, e) => {
        acc[e.space] = (acc[e.space] || 0) + 1;
        return acc;
    }, {});

    const donutChart = {
        labels: Object.keys(spaceCounts),
        datasets: [
            {
                data: Object.values(spaceCounts),
                backgroundColor: [
                    "#34d399", // green
                    "#60a5fa", // blue
                    "#f472b6", // pink
                    "#facc15", // yellow
                    "#a78bfa", // purple
                    "#f87171", // red
                ],
            },
        ],
    };

    return (
        <div className="space-y-8">
            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Study Sessions" value={studySessions} />
                <StatCard title="Workouts" value={workouts} />
                <StatCard title="Moods Logged" value={moods.length} />
                <StatCard title="Dates" value={dates} />
                <StatCard title="Media Completed" value={mediaCompleted} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-silver-100 text-slate-900 p-4 rounded">
                    <h2 className="font-semibold mb-2">📖 Study Trend</h2>
                    <Line data={studyChart} />
                </div>

                <div className="bg-silver-100 text-slate-900 p-4 rounded">
                    <h2 className="font-semibold mb-2">🧠 Mood Trend</h2>
                    <Line data={moodChart} />
                </div>

                <div className="bg-silver-100 text-slate-900 p-4 rounded md:col-span-2">
                    <h2 className="font-semibold mb-2">📊 Activity by Space</h2>
                    <Doughnut data={donutChart} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="bg-silver-100 text-slate-900 p-4 rounded text-center shadow-sm">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-2xl">{value}</p>
        </div>
    );
}

