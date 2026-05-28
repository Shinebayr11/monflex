"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <div className="text-center space-y-3">
        <p className="text-white/80">Could not load this title.</p>
        <p className="text-xs text-white/40">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded bg-primary px-4 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
