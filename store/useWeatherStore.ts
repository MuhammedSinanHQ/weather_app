import { create } from "zustand";
import { UnitSystem } from "@/types/weather";

interface WeatherStore {
  city: string;
  favorites: string[];
  recent: string[];
  unit: UnitSystem;
  animationsEnabled: boolean;
  effectsEnabled: boolean;
  setCity: (city: string) => void;
  toggleFavorite: (city: string) => void;
  setUnit: (unit: UnitSystem) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setEffectsEnabled: (enabled: boolean) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  city: "Dubai",
  favorites: [],
  recent: ["Dubai", "London", "Tokyo"],
  unit: "metric",
  animationsEnabled: true,
  effectsEnabled: true,
  setCity: (city) =>
    set((state) => ({
      city,
      recent: [city, ...state.recent.filter((entry) => entry !== city)].slice(0, 6),
    })),
  toggleFavorite: (city) =>
    set((state) => ({
      favorites: state.favorites.includes(city)
        ? state.favorites.filter((entry) => entry !== city)
        : [...state.favorites, city],
    })),
  setUnit: (unit) => set({ unit }),
  setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
  setEffectsEnabled: (effectsEnabled) => set({ effectsEnabled }),
}));
