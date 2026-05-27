// Global loading UI for the admin app.
// Next.js App Router automatically renders this as a Suspense fallback
// during navigation and server work.

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
