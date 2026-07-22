import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="glass-card max-w-lg rounded-3xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Forecast Not Found</h1>
        <p className="mt-3 text-sm text-white/75">The requested weather destination drifted out of orbit.</p>
        <Link href="/" className="button-liquid mt-6 inline-block rounded-full px-6 py-2">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
