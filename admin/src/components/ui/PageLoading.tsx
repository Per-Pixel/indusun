export default function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
