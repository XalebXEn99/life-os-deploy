import Tasks from "./Tasks";

export default function HomeSpace() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🏠 Home</h1>
      <p className="mt-2 text-silver-300">
        Manage your daily and project tasks here.
      </p>
      <Tasks />
    </div>
  );
}
