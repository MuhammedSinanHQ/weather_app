export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="glass-card w-[320px] rounded-3xl p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        <p className="text-sm text-white/75">Preparing cinematic weather experience...</p>
      </div>
    </main>
  );
}
