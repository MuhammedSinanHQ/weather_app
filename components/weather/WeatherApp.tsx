"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Lottie from "lottie-react";
import {
  Cloud,
  Droplets,
  Gauge,
  Heart,
  LoaderCircle,
  LocateFixed,
  Moon,
  Search,
  Settings,
  Sparkles,
  Wind,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCitySuggestions, useWeatherQuery } from "@/hooks/useWeatherQuery";
import { pageTransition, springPreset, staggerDelay } from "@/animations/motion";
import { useWeatherStore } from "@/store/useWeatherStore";
import { weatherThemeMap } from "@/utils/weatherTheme";
import sunPulse from "@/animations/sunPulse.json";

const detailIconMap = {
  humidity: Droplets,
  wind: Wind,
  pressure: Gauge,
  clouds: Cloud,
  uv: Sparkles,
};

function formatLocalDateTime(dateString: string, timezone: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return formatter.format(new Date(dateString));
}

export default function WeatherApp() {
  const {
    city,
    favorites,
    recent,
    unit,
    animationsEnabled,
    effectsEnabled,
    setCity,
    toggleFavorite,
    setUnit,
    setAnimationsEnabled,
    setEffectsEnabled,
  } = useWeatherStore();

  const [searchInput, setSearchInput] = useState(city);
  const [showSettings, setShowSettings] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const bgRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, error, isFetching } = useWeatherQuery(city, unit);
  const { data: suggestions = [] } = useCitySuggestions(searchInput);

  useEffect(() => {
    if (!bgRef.current || !animationsEnabled) return;
    const animation = gsap.to(bgRef.current, {
      backgroundPosition: "200% 50%",
      duration: 14,
      ease: "none",
      repeat: -1,
    });

    return () => {
      animation.kill();
    };
  }, [animationsEnabled]);

  useEffect(() => {
    const tick = window.setInterval(() => setClock(new Date()), 1000);
    setOnline(navigator.onLine);

    const goOnline = () => {
      setOnline(true);
      setJustReconnected(true);
      window.setTimeout(() => setJustReconnected(false), 2500);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const theme = useMemo(
    () => weatherThemeMap[data?.current.condition ?? "sunny"],
    [data],
  );

  const chartData = useMemo(
    () =>
      (data?.hourly ?? []).slice(0, 12).map((entry) => ({
        time: new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temp: entry.temperature,
        rain: entry.rainChance,
      })),
    [data?.hourly],
  );

  const details = useMemo(() => {
    if (!data) return [];
    const unitWind = unit === "metric" ? "km/h" : "mph";
    return [
      { key: "humidity", label: "Humidity", value: `${data.current.humidity}%` },
      { key: "wind", label: "Wind", value: `${data.current.windSpeed} ${unitWind}` },
      { key: "pressure", label: "Pressure", value: `${data.current.pressure} hPa` },
      { key: "clouds", label: "Cloud Cover", value: `${data.current.cloudCover}%` },
      { key: "uv", label: "UV Index", value: `${data.current.uvIndex}` },
      { key: "feels", label: "Feels Like", value: `${data.current.feelsLike}°` },
      { key: "visibility", label: "Visibility", value: `${data.current.visibility} km` },
      { key: "rain", label: "Rain Chance", value: `${data.current.rainChance}%` },
      { key: "dew", label: "Dew Point", value: `${data.current.dewPoint}°` },
    ];
  }, [data, unit]);

  const submitSearch = (value: string) => {
    if (!value.trim()) return;
    setCity(value.trim());
    setSearchInput(value.trim());
  };

  const greeting =
    clock.getHours() < 12
      ? "Good Morning"
      : clock.getHours() < 18
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <main className="color-cycle relative min-h-screen overflow-hidden text-white">
      <div
        ref={bgRef}
        className={`absolute inset-0 -z-20 bg-[length:200%_200%] bg-gradient-to-br ${theme.gradient}`}
      />
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: theme.overlay }} />
      {effectsEnabled && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(circle_at_center,black_35%,transparent_100%)]">
          <div className="absolute left-[8%] top-[10%] h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[12%] top-[30%] h-80 w-80 animate-pulse rounded-full bg-cyan-300/15 blur-3xl [animation-delay:1.2s]" />
        </div>
      )}

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:py-8 md:px-8">
        {!online && (
          <div className="glass-card rounded-2xl border-rose-300/30 bg-rose-500/20 px-4 py-2 text-sm">
            You are offline. Cached weather view is active.
          </div>
        )}
        {justReconnected && (
          <div className="glass-card rounded-2xl border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm">
            Connection restored. Data is syncing now.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          className="glass-card flex flex-col items-stretch gap-4 rounded-[30px] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative w-full min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-white/70" />
            <input
              aria-label="Search city"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitSearch(searchInput)}
              className="w-full rounded-full border border-white/20 bg-black/25 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
              placeholder="Search any city worldwide"
            />
            <AnimatePresence>
              {searchInput.length > 1 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950/70 backdrop-blur-xl"
                >
                  {suggestions.map((entry) => (
                    <button
                      key={`${entry.name}-${entry.lat}`}
                      className="block w-full border-b border-white/10 px-4 py-2 text-left text-sm last:border-none hover:bg-white/10"
                      onClick={() => submitSearch(entry.name)}
                    >
                      {entry.name}, {entry.country}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button
              onClick={() => submitSearch(city)}
              className="button-liquid rounded-full px-4 py-2 text-sm"
              aria-label="Use current location"
            >
              <span className="inline-flex items-center gap-2"><LocateFixed className="h-4 w-4" />GPS</span>
            </button>
            <button
              onClick={() => setShowSettings((value) => !value)}
              className="rounded-full border border-white/20 bg-white/10 p-2 transition hover:scale-105"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {showSettings && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card grid gap-4 rounded-[30px] p-5 md:grid-cols-2"
          >
            <label className="flex items-center justify-between gap-4 text-sm">
              Temperature Unit
              <select
                className="rounded-full border border-white/20 bg-black/30 px-3 py-2"
                value={unit}
                onChange={(event) => setUnit(event.target.value as "metric" | "imperial")}
              >
                <option value="metric">°C</option>
                <option value="imperial">°F</option>
              </select>
            </label>
            <label className="flex items-center justify-between text-sm">
              Animations
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={(event) => setAnimationsEnabled(event.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              Background Effects
              <input
                type="checkbox"
                checked={effectsEnabled}
                onChange={(event) => setEffectsEnabled(event.target.checked)}
              />
            </label>
          </motion.section>
        )}

        {isLoading ? (
          <section className="glass-card flex h-[320px] items-center justify-center rounded-[30px] p-6 text-white/80 sm:h-[360px] sm:p-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </section>
        ) : isError || !data ? (
          <section className="glass-card rounded-[30px] p-6 text-red-100 sm:p-8">
            {(error as Error)?.message ?? "Unable to fetch weather data."}
          </section>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: staggerDelay },
              },
            }}
            className="grid gap-6"
          >
            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={springPreset}
              className="glass-card rounded-[30px] p-4 sm:p-6"
            >
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-white/80">{formatLocalDateTime(new Date().toISOString(), data.timezone)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">{greeting}</p>
                  <p className="mt-1 text-sm text-white/70">{clock.toLocaleTimeString()}</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">{data.location}</h1>
                  <p className="mt-2 text-white/85 capitalize">{data.current.description}</p>
                  <p className="mt-4 text-sm text-white/70">Last updated {new Date(data.updatedAt).toLocaleTimeString()}</p>
                </div>
                <div className="w-full text-left sm:w-auto sm:text-right">
                  <motion.div
                    animate={animationsEnabled ? { y: [0, -6, 0] } : undefined}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/15"
                  >
                    {data.current.condition === "night" ? (
                      <Moon />
                    ) : (
                      <Lottie animationData={sunPulse} loop className="h-12 w-12" />
                    )}
                  </motion.div>
                  <motion.p
                    key={data.current.temperature}
                    initial={{ opacity: 0.2, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl font-bold leading-none sm:text-6xl"
                  >
                    {data.current.temperature}°
                  </motion.p>
                </div>
              </div>
            </motion.section>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <motion.section
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="glass-card rounded-[30px] p-4 sm:p-6"
              >
                <header className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Weather Details</h2>
                  {isFetching && <span className="text-xs text-white/80">Refreshing…</span>}
                </header>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {details.map((item) => {
                    const Icon = detailIconMap[item.key as keyof typeof detailIconMap] ?? Sparkles;
                    return (
                      <motion.article
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                        key={item.key}
                        className="rounded-2xl border border-white/20 bg-white/8 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                          <Icon className="h-4 w-4" /> {item.label}
                        </div>
                        <p className="text-xl font-semibold">{item.value}</p>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.section>

              <motion.section
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="glass-card rounded-[30px] p-6"
              >
                <h2 className="mb-4 text-lg font-semibold">Air Quality</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(data.airQuality).map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-white/20 bg-black/20 p-3 text-sm">
                      <p className="uppercase text-white/60">{key.replace("_", ".")}</p>
                      <p className="mt-1 text-lg font-semibold">{typeof value === "number" ? value.toFixed(1) : value}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="glass-card rounded-[30px] p-4 sm:p-6"
            >
              <h2 className="mb-4 text-lg font-semibold">24-Hour Forecast</h2>
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
                {data.hourly.slice(0, 24).map((entry) => (
                  <motion.article
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    key={entry.time}
                    className="min-w-[115px] rounded-2xl border border-white/20 bg-white/8 p-3 sm:min-w-[130px]"
                  >
                    <p className="text-sm text-white/80">
                      {new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-2 text-xl font-semibold">{entry.temperature}°</p>
                    <p className="mt-2 text-xs text-white/70">Rain {entry.rainChance}%</p>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            <div className="grid gap-6 xl:grid-cols-2">
              <motion.section
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="glass-card rounded-[30px] p-4 sm:p-6"
              >
                <h2 className="mb-4 text-lg font-semibold">7-Day Forecast</h2>
                <div className="space-y-3">
                  {data.daily.map((entry) => (
                    <details key={entry.date} className="group rounded-2xl border border-white/20 bg-black/20 p-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                        <span>{entry.label}</span>
                        <span className="text-sm text-white/80">
                          {entry.high}° / {entry.low}°
                        </span>
                      </summary>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/80">
                        <span>Wind: {entry.windSpeed}</span>
                        <span>Humidity: {entry.humidity}%</span>
                      </div>
                    </details>
                  ))}
                </div>
              </motion.section>

              <motion.section
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="glass-card rounded-[30px] p-4 sm:p-6"
              >
                <h2 className="mb-4 text-lg font-semibold">Weather Trends</h2>
                <div className="h-52 sm:h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      <XAxis dataKey="time" stroke="#dbeafe" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#dbeafe" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172ab3", border: "1px solid #ffffff30" }} />
                      <Line type="monotone" dataKey="temp" stroke="#facc15" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5 h-36 sm:h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="time" stroke="#dbeafe" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#dbeafe" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172ab3", border: "1px solid #ffffff30" }} />
                      <Area type="monotone" dataKey="rain" stroke="#38bdf8" fill="#38bdf840" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>
            </div>

            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="grid gap-6 xl:grid-cols-2"
            >
              <article className="glass-card rounded-[30px] p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold">Interactive Weather Map</h2>
                <div className="relative h-56 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-tr from-cyan-900/50 to-slate-900/60">
                  <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(96,165,250,0.2),transparent_40%)]" />
                  <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 text-xs">
                    {['Temperature', 'Clouds', 'Rain', 'Wind', 'Satellite'].map((layer) => (
                      <span key={layer} className="rounded-full border border-white/20 bg-black/35 px-3 py-1">{layer}</span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="glass-card rounded-[30px] p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold">Sunrise / Sunset</h2>
                <div className="relative flex h-48 items-end justify-center rounded-2xl border border-white/20 bg-black/25 pb-8 sm:h-56">
                  <div className="absolute bottom-8 h-28 w-[min(18rem,85vw)] rounded-t-full border-t-2 border-dashed border-amber-300/70 sm:w-72" />
                  <motion.div
                    animate={animationsEnabled ? { x: [0, 36, 0], y: [0, -18, 0] } : undefined}
                    transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
                    className="mb-24 h-8 w-8 rounded-full bg-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.85)]"
                  />
                  <div className="absolute bottom-2 left-3 text-[11px] text-white/75 sm:left-6 sm:text-xs">
                    Sunrise {new Date(data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="absolute bottom-2 right-3 text-[11px] text-white/75 sm:right-6 sm:text-xs">
                    Sunset {new Date(data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </article>
            </motion.section>

            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="glass-card rounded-[30px] p-4 sm:p-6"
            >
              <h2 className="mb-4 text-lg font-semibold">Weather Alerts</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  "Storm Watch in effect",
                  "Heavy rain expected after 18:00",
                  "Air quality warning for sensitive groups",
                ].map((alert) => (
                  <motion.article
                    key={alert}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-2xl border border-rose-300/40 bg-rose-600/20 p-3"
                  >
                    <p className="text-sm text-rose-50">{alert}</p>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            <footer className="glass-card flex flex-col items-start gap-4 rounded-[30px] p-4 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Heart className={`h-4 w-4 ${favorites.includes(city) ? "fill-white" : ""}`} />
                <button onClick={() => toggleFavorite(city)} className="underline-offset-2 hover:underline">
                  {favorites.includes(city) ? "Remove from favorites" : "Save to favorites"}
                </button>
              </div>
              <p className="max-w-full truncate sm:max-w-none">Recent: {recent.join(" • ")}</p>
            </footer>
          </motion.div>
        )}
      </section>
    </main>
  );
}
