import {
  AirQuality,
  CitySuggestion,
  DailyForecastPoint,
  HourlyForecastPoint,
  WeatherSnapshot,
} from "@/types/weather";
import { toCondition } from "@/utils/weatherTheme";

const BASE_URL = "https://api.openweathermap.org";

const defaultAirQuality: AirQuality = {
  aqi: 2,
  pm2_5: 13,
  pm10: 18,
  co: 220,
  no2: 14,
  so2: 3,
  o3: 57,
};

const cityCoordinates: Record<string, { lat: number; lon: number; country: string }> = {
  Dubai: { lat: 25.2048, lon: 55.2708, country: "AE" },
  London: { lat: 51.5072, lon: -0.1276, country: "GB" },
  Tokyo: { lat: 35.6764, lon: 139.65, country: "JP" },
  Paris: { lat: 48.8566, lon: 2.3522, country: "FR" },
};

const withUnits = (unit: "metric" | "imperial", value: number) =>
  unit === "imperial" ? Math.round((value * 9) / 5 + 32) : Math.round(value);

const mockSnapshot = (city: string, unit: "metric" | "imperial"): WeatherSnapshot => {
  const now = new Date();
  const hourly: HourlyForecastPoint[] = Array.from({ length: 24 }).map((_, index) => {
    const hourDate = new Date(now.getTime() + index * 60 * 60 * 1000);
    const base = 30 - index * 0.3;
    return {
      time: hourDate.toISOString(),
      temperature: withUnits(unit, base),
      rainChance: Math.min(90, index * 4),
      icon: "02d",
    };
  });

  const daily: DailyForecastPoint[] = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    const high = 31 - index * 0.7;
    const low = 24 - index * 0.4;

    return {
      date: day.toISOString(),
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      high: withUnits(unit, high),
      low: withUnits(unit, low),
      humidity: 56 + index,
      windSpeed: unit === "imperial" ? 9 + index : 14 + index,
      icon: index % 2 ? "03d" : "02d",
    };
  });

  return {
    location: city,
    timezone: "UTC",
    current: {
      temperature: withUnits(unit, 29),
      feelsLike: withUnits(unit, 31),
      humidity: 58,
      pressure: 1012,
      visibility: 9.3,
      uvIndex: 7.2,
      windSpeed: unit === "imperial" ? 11 : 18,
      windDirection: 178,
      dewPoint: withUnits(unit, 21),
      cloudCover: 42,
      rainChance: 34,
      description: "Partly Cloudy",
      icon: "02d",
      condition: "cloudy",
    },
    hourly,
    daily,
    sunrise: new Date(now.setHours(5, 38, 0, 0)).toISOString(),
    sunset: new Date(now.setHours(18, 49, 0, 0)).toISOString(),
    airQuality: defaultAirQuality,
    updatedAt: new Date().toISOString(),
  };
};

const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

async function request<T>(path: string) {
  const response = await fetch(path, {
    next: { revalidate: 300 },
  });

  if (response.status === 429) {
    throw new Error("Weather provider rate limit reached. Please retry shortly.");
  }

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (!query.trim()) return [];
  if (!apiKey) {
    return Object.entries(cityCoordinates)
      .filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
      .map(([name, value]) => ({ name, country: value.country, lat: value.lat, lon: value.lon }));
  }

  const result = await request<CitySuggestion[]>(
    `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`,
  );

  return result;
}

async function resolveCoordinates(city: string) {
  if (!apiKey) {
    return cityCoordinates[city] ?? cityCoordinates.Dubai;
  }

  const result = await request<CitySuggestion[]>(
    `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`,
  );

  if (!result.length) {
    throw new Error(`No matching location found for ${city}.`);
  }

  return {
    lat: result[0].lat,
    lon: result[0].lon,
    country: result[0].country,
  };
}

export async function fetchWeatherSnapshot(
  city: string,
  unit: "metric" | "imperial",
): Promise<WeatherSnapshot> {
  if (!apiKey) return mockSnapshot(city, unit);

  const coordinates = await resolveCoordinates(city);

  const [oneCall, air] = await Promise.all([
    request<{
      timezone: string;
      current: {
        dt: number;
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
        visibility: number;
        uvi: number;
        wind_speed: number;
        wind_deg: number;
        dew_point: number;
        clouds: number;
        weather: { id: number; description: string; icon: string }[];
      };
      hourly: {
        dt: number;
        temp: number;
        pop: number;
        weather: { icon: string }[];
      }[];
      daily: {
        dt: number;
        temp: { min: number; max: number };
        humidity: number;
        wind_speed: number;
        pop: number;
        sunrise: number;
        sunset: number;
        weather: { icon: string }[];
      }[];
    }>(
      `${BASE_URL}/data/3.0/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=${unit}&exclude=minutely,alerts&appid=${apiKey}`,
    ),
    request<{ list: { main: { aqi: number }; components: AirQuality }[] }>(
      `${BASE_URL}/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`,
    ),
  ]);

  const weather = oneCall.current.weather[0];
  const localCurrentDate = new Date(oneCall.current.dt * 1000);
  const hour = localCurrentDate.getUTCHours();
  const isNight = hour > 19 || hour < 5;

  return {
    location: `${city}, ${coordinates.country}`,
    timezone: oneCall.timezone,
    current: {
      temperature: Math.round(oneCall.current.temp),
      feelsLike: Math.round(oneCall.current.feels_like),
      humidity: oneCall.current.humidity,
      pressure: oneCall.current.pressure,
      visibility: Number((oneCall.current.visibility / 1000).toFixed(1)),
      uvIndex: Number(oneCall.current.uvi.toFixed(1)),
      windSpeed: Number(oneCall.current.wind_speed.toFixed(1)),
      windDirection: oneCall.current.wind_deg,
      dewPoint: Math.round(oneCall.current.dew_point),
      cloudCover: oneCall.current.clouds,
      rainChance: Math.round((oneCall.hourly[0]?.pop ?? 0) * 100),
      description: weather.description,
      icon: weather.icon,
      condition: toCondition(weather.id, isNight),
    },
    hourly: oneCall.hourly.slice(0, 24).map((entry) => ({
      time: new Date(entry.dt * 1000).toISOString(),
      temperature: Math.round(entry.temp),
      rainChance: Math.round(entry.pop * 100),
      icon: entry.weather[0]?.icon ?? "02d",
    })),
    daily: oneCall.daily.slice(0, 7).map((entry) => ({
      date: new Date(entry.dt * 1000).toISOString(),
      label: new Date(entry.dt * 1000).toLocaleDateString(undefined, { weekday: "short" }),
      high: Math.round(entry.temp.max),
      low: Math.round(entry.temp.min),
      humidity: entry.humidity,
      windSpeed: Number(entry.wind_speed.toFixed(1)),
      icon: entry.weather[0]?.icon ?? "03d",
    })),
    sunrise: new Date(oneCall.daily[0].sunrise * 1000).toISOString(),
    sunset: new Date(oneCall.daily[0].sunset * 1000).toISOString(),
    airQuality: air.list[0]?.components
      ? {
          ...air.list[0].components,
          aqi: air.list[0].main.aqi,
        }
      : defaultAirQuality,
    updatedAt: new Date().toISOString(),
  };
}
