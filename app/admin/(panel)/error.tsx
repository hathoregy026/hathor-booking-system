"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <AlertCircle className="mb-3 h-10 w-10 text-red-400" aria-hidden />
      <h2 className="text-lg font-semibold text-slate-900">
        Dashboard unavailable
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        We couldn&apos;t load this page. This is usually temporary — try
        refreshing or come back in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#162d4a]"
      >
        Try Again
      </button>
    </div>
  );
}
