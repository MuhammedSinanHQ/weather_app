export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "night";

export type UnitSystem = "metric" | "imperial";

export interface WeatherCore {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: number;
  dewPoint: number;
  cloudCover: number;
  rainChance: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
}

export interface AirQuality {
  aqi: number;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  rainChance: number;
  icon: string;
}

export interface DailyForecastPoint {
  date: string;
  label: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface WeatherSnapshot {
  location: string;
  timezone: string;
  current: WeatherCore;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  sunrise: string;
  sunset: string;
  airQuality: AirQuality;
  updatedAt: string;
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}
