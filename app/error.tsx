"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 text-white">
      <section className="glass-card max-w-lg rounded-3xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Weather system hiccup</h1>
        <p className="mt-3 text-sm text-white/75">{error.message}</p>
        <button onClick={reset} className="button-liquid mt-6 rounded-full px-6 py-2">
          Retry
        </button>
      </section>
    </main>
  );
}
