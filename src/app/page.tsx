import Image from "next/image";

import Link from "next/link";

export default function Dashboard() {
  const spaces = [
    { name: "Home", path: "/home" },
    { name: "School", path: "/school" },
    { name: "Romance", path: "/romance" },
    { name: "Mental", path: "/mental" },
    { name: "Physical", path: "/physical" },
    { name: "Entertainment", path: "/entertainment" },
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Life OS</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {spaces.map((s) => (
          <Link key={s.name} href={s.path}>
            <div className="rounded-xl p-4 bg-linear-to-br from-white-100 to-silver-500 text-white shadow-md hover:scale-105 transition">
              <h2 className="font-semibold text-lg">{s.name}</h2>
              <p className="text-sm text-silver-300">Go to {s.name}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}



