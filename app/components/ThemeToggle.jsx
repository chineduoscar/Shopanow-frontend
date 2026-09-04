"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-[#12201A]/[0.06] dark:bg-white/5 rounded-lg p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          suppressHydrationWarning
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            theme === value
              ? "bg-[#22C55E]/20 text-[#22C55E]"
              : "text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white hover:bg-[#12201A]/5 dark:hover:bg-white/5"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
