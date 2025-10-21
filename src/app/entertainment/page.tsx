import EntertainmentLog from "./EntertainmentLog";

export default function EntertainmentSpace() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🎮 Entertainment</h1>
      <p className="mt-2 text-silver-300">
        Track your movies, shows, games, and books.
      </p>
      <EntertainmentLog />
    </div>
  );
}

