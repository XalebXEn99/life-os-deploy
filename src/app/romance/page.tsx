import RomanceLog from "./RomanceLog";
import ConnectionTracker from "./ConnectionTracker";

export default function RomanceSpace() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">💖 Romance</h1>
        <p className="mt-2 text-silver-300">
          Keep track of dates, memories, and connections.
        </p>
      </div>
      <RomanceLog />
      <ConnectionTracker />
    </div>
  );
}

