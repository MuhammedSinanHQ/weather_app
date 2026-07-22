import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { PwaRegister } from "@/components/providers/PwaRegister";

export const metadata: Metadata = {
  title: "Atmos Premium Weather",
  description:
    "Premium weather dashboard with cinematic glassmorphism, advanced forecasts, air quality insights, and smooth micro-interactions.",
  applicationName: "Atmos",
  openGraph: {
    title: "Atmos Premium Weather",
    description: "Future-grade weather app with world-class UX and motion design.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-white">
        <AppProviders>
          <PwaRegister />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
