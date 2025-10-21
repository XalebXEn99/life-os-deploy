import WorkoutLog from "./WorkoutLog";
import HabitTracker from "./HabitTracker";

export default function PhysicalSpace() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">💪 Physical</h1>
        <p className="mt-2 text-silver-300">
          Track workouts and daily habits for your body.
        </p>
      </div>
      <WorkoutLog />
      <HabitTracker />
    </div>
  );
}

