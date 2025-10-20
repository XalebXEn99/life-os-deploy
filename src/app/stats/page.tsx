import StatsDashboard from "./StatsDashboard";

export default function StatsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📈 Overall Stats</h1>
      <p className="mt-2 text-silver-300">
        A summary of your productivity across all spaces.
      </p>
      <StatsDashboard />
    </div>
  );
}
