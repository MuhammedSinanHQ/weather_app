import { WeatherCondition } from "@/types/weather";

export interface WeatherTheme {
  gradient: string;
  accent: string;
  overlay: string;
}

export const weatherThemeMap: Record<WeatherCondition, WeatherTheme> = {
  sunny: {
    gradient: "from-amber-300 via-orange-300 to-rose-400",
    accent: "#f59e0b",
    overlay: "radial-gradient(circle at 20% 20%, rgba(255,226,143,0.35), transparent 45%)",
  },
  cloudy: {
    gradient: "from-slate-500 via-slate-400 to-blue-500",
    accent: "#94a3b8",
    overlay: "radial-gradient(circle at 80% 15%, rgba(203,213,225,0.3), transparent 45%)",
  },
  rain: {
    gradient: "from-slate-700 via-blue-700 to-indigo-800",
    accent: "#38bdf8",
    overlay: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.25), transparent 50%)",
  },
  storm: {
    gradient: "from-zinc-800 via-slate-900 to-indigo-950",
    accent: "#a78bfa",
    overlay: "radial-gradient(circle at 10% 15%, rgba(99,102,241,0.3), transparent 40%)",
  },
  snow: {
    gradient: "from-cyan-100 via-slate-200 to-blue-100",
    accent: "#67e8f9",
    overlay: "radial-gradient(circle at 40% 5%, rgba(255,255,255,0.6), transparent 45%)",
  },
  night: {
    gradient: "from-slate-950 via-indigo-950 to-violet-900",
    accent: "#c4b5fd",
    overlay: "radial-gradient(circle at 65% 10%, rgba(167,139,250,0.25), transparent 45%)",
  },
};

export const toCondition = (weatherCode: number, isNight: boolean): WeatherCondition => {
  if (isNight) return "night";
  if (weatherCode >= 200 && weatherCode < 300) return "storm";
  if (weatherCode >= 300 && weatherCode < 700) return "rain";
  if (weatherCode >= 700 && weatherCode < 800) return "cloudy";
  if (weatherCode === 800) return "sunny";
  if (weatherCode > 800) return "cloudy";
  return "sunny";
};
