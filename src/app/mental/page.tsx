import Journal from "./Journal";
import MoodTracker from "./MoodTracker";

export default function MentalSpace() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">🧠 Mental</h1>
        <p className="mt-2 text-silver-300">
          Reflect and track your daily moods.
        </p>
      </div>
      <Journal />
      <MoodTracker />
    </div>
  );
}
