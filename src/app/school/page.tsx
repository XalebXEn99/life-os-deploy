import StudyTimer from "./StudyTimer";

export default function SchoolSpace() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📚 Learn</h1>
      <p className="mt-2 text-silver-300">
        Focused study sessions with a Pomodoro timer.
      </p>
      <StudyTimer />
    </div>
  );
}
