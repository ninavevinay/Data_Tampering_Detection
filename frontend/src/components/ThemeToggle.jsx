import { MoonStar, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100"
        style={{ left: theme === "dark" ? "2.35rem" : "0.2rem" }}
      />
      <span className="relative z-10 grid w-full grid-cols-2 text-xs">
        <SunMedium className="mx-auto h-4 w-4 text-amber-500" />
        <MoonStar className="mx-auto h-4 w-4 text-cyan-400" />
      </span>
    </button>
  );
}
