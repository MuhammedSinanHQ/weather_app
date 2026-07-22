"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCitySuggestions, fetchWeatherSnapshot } from "@/services/weatherApi";

export const useWeatherQuery = (city: string, unit: "metric" | "imperial") =>
  useQuery({
    queryKey: ["weather", city, unit],
    queryFn: () => fetchWeatherSnapshot(city, unit),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

export const useCitySuggestions = (query: string) =>
  useQuery({
    queryKey: ["city-suggestions", query],
    queryFn: () => fetchCitySuggestions(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 60,
  });
