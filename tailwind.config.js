/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        silver: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
    },
  },
  safelist: [
    // existing safelist
    "w-48",
    "w-56",
    "space-y-1",
    "space-y-2",
    "text-sm",
    "rounded-md",
    "shadow-lg",

    // 👇 added for mobile dropdown animation and visibility
    "max-h-[500px]",
    "max-h-0",
    "opacity-0",
    "opacity-100",
    "pointer-events-none",
    "pointer-events-auto",
    "z-40",
    "z-50",
    "bg-white/80",
    "dark:bg-slate-800/80",
    "border-t",
    "border-silver-200",
    "dark:border-silver-500/20",
    "backdrop-blur",
    "transition-all",
    "duration-300",
  ],
  plugins: [],
};
