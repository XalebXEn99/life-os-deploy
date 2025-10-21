"use client";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    ChartOptions,
    Tick,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

type Mood = {
    id: string;
    mood: string;
    created_at: string;
};

const moodColors: Record<string, string> = {
    "😊 Happy": "rgba(34,197,94,0.7)",   // green
    "😐 Neutral": "rgba(156,163,175,0.7)", // gray
    "😔 Sad": "rgba(59,130,246,0.7)",    // blue
    "😤 Stressed": "rgba(239,68,68,0.7)", // red
    "😌 Calm": "rgba(168,85,247,0.7)",   // purple
};

export default function MoodChart({ moods }: { moods: Mood[] }) {
    const labels = moods.map((m) =>
        new Date(m.created_at).toLocaleDateString()
    );

    const data = {
        labels,
        datasets: [
            {
                label: "Mood Trend",
                data: moods.map((m) => Object.keys(moodColors).indexOf(m.mood) + 1),
                borderColor: "rgba(34,197,94,1)",
                backgroundColor: moods.map(
                    (m) => moodColors[m.mood] || "rgba(0,0,0,0.3)"
                ),
                tension: 0.3,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ctx) => moods[ctx.dataIndex].mood,
                },
            },
        },
        scales: {
            x: {
                type: "category",
            },
            y: {
                type: "linear",
                ticks: {
                    callback: (tickValue: string | number, _index: number, _ticks: Tick[]) => {
                        const v = Number(tickValue);
                        return Object.keys(moodColors)[v - 1] || "";
                    },
                },
            },
        },
    };

    return (
        <div className="mt-6 bg-silver-100 text-slate-900 p-4 rounded">
            <h2 className="font-semibold mb-2">Mood Trend</h2>
            <Line data={data} options={options} />
        </div>
    );
}

