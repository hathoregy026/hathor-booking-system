"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Film,
  HardDrive,
  ImageIcon,
  Loader2,
  Music,
  RefreshCw,
  Search,
  Shapes,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { StatCard } from "@/components/admin/StatCard";
import { adminFetch } from "@/lib/admin-fetch";
import {
  STORAGE_CATEGORIES,
  formatStorageBytes,
  type StorageAnalyzeReport,
  type StorageCategory,
  type StorageFileEntry,
} from "@/lib/storage-analyze-shared";

type FilterKey = "all" | StorageCategory;

const FILTERS: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All", icon: HardDrive },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "videos", label: "Videos", icon: Film },
  { key: "text", label: "Text", icon: Type },
  { key: "icons", label: "Icons", icon: Shapes },
  { key: "fonts", label: "Fonts", icon: Type },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "audio", label: "Audio", icon: Music },
  { key: "other", label: "Other", icon: HardDrive },
];

function sourceLabel(source: StorageFileEntry["source"]): string {
  if (source === "cloud") return "Cloud";
  if (source === "database") return "Database";
  return "Local";
}

export function StorageAnalyzePanel() {
  const [report, setReport] = useState<StorageAnalyzeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/storage-analyze");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze storage");
      }
      setReport(data as StorageAnalyzeReport);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze storage.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredFiles = useMemo(() => {
    if (!report) return [];
    const q = query.trim().toLowerCase();
    return report.files.filter((file) => {
      if (filter !== "all" && file.category !== filter) return false;
      if (!q) return true;
      return (
        file.name.toLowerCase().includes(q) ||
        file.path.toLowerCase().includes(q) ||
        file.extension.toLowerCase().includes(q) ||
        file.category.toLowerCase().includes(q)
      );
    });
  }, [report, filter, query]);

  const filteredBytes = useMemo(
    () => filteredFiles.reduce((sum, file) => sum + file.bytes, 0),
    [filteredFiles],
  );

  const categoryStats = useMemo(() => {
    const map = new Map(
      (report?.categories ?? []).map((item) => [item.category, item]),
    );
    return STORAGE_CATEGORIES.map((category) => {
      const item = map.get(category);
      return {
        category,
        label:
          FILTERS.find((entry) => entry.key === category)?.label ?? category,
        count: item?.count ?? 0,
        bytes: item?.bytes ?? 0,
      };
    }).filter((item) => item.count > 0 || item.bytes > 0);
  }, [report]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-section-label">Analyze</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Storage
          </h1>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>
            Read-only inventory of local public assets, cloud uploads, and
            website text payload sizes. Filtering never changes or deletes
            files.
          </p>
        </div>
        <ActionButton
          variant="outline"
          icon={isLoading ? Loader2 : RefreshCw}
          onClick={() => void load()}
          disabled={isLoading}
          className={isLoading ? "[&_svg]:animate-spin" : undefined}
        >
          Refresh
        </ActionButton>
      </div>

      {error ? (
        <div
          className="admin-card px-4 py-3 text-sm"
          style={{
            borderColor: "rgba(248, 113, 113, 0.35)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      ) : null}

      {report?.warnings?.length ? (
        <div className="admin-card space-y-1 px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
          {report.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total files"
          value={report ? report.totalCount.toLocaleString() : "—"}
          icon={HardDrive}
          isLoading={isLoading && !report}
        />
        <StatCard
          label="Total size"
          value={report ? formatStorageBytes(report.totalBytes) : "—"}
          icon={HardDrive}
          isLoading={isLoading && !report}
        />
        <StatCard
          label="Filtered files"
          value={filteredFiles.length.toLocaleString()}
          icon={Search}
          isLoading={isLoading && !report}
        />
        <StatCard
          label="Filtered size"
          value={formatStorageBytes(filteredBytes)}
          icon={ImageIcon}
          isLoading={isLoading && !report}
        />
      </div>

      <div className="admin-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              const Icon = item.icon;
              const count =
                item.key === "all"
                  ? report?.totalCount ?? 0
                  : report?.categories.find((c) => c.category === item.key)
                      ?.count ?? 0;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "admin-nav-item--active" : ""
                  }`}
                  style={{
                    border: "1px solid var(--border)",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                      : "transparent",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {item.label}
                  <span className="tabular-nums opacity-80">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search path, name, extension…"
              className="admin-input w-full py-2 pl-10 pr-3 text-sm"
              aria-label="Search storage files"
            />
          </div>
        </div>

        {categoryStats.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {categoryStats.map((item) => (
              <button
                key={item.category}
                type="button"
                onClick={() => setFilter(item.category)}
                className="rounded-xl px-3 py-2 text-left transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  background:
                    filter === item.category
                      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                      : "var(--surface-2, transparent)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatStorageBytes(item.bytes)}
                  <span className="ml-2 font-normal" style={{ color: "var(--text-muted)" }}>
                    · {item.count}
                  </span>
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Path</th>
                <th className="px-4 py-3 font-semibold text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !report ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center" style={{ color: "var(--text-muted)" }}>
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Analyzing storage…
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center" style={{ color: "var(--text-muted)" }}>
                    No files match this filter.
                  </td>
                </tr>
              ) : (
                filteredFiles.slice(0, 500).map((file) => (
                  <tr
                    key={file.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-4 py-2.5 font-medium">{file.name}</td>
                    <td className="px-4 py-2.5 capitalize" style={{ color: "var(--text-muted)" }}>
                      {file.category}
                      <span className="ml-1 uppercase opacity-70">
                        .{file.extension}
                      </span>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "var(--text-muted)" }}>
                      {sourceLabel(file.source)}
                    </td>
                    <td
                      className="max-w-[28rem] truncate px-4 py-2.5 font-mono text-xs"
                      style={{ color: "var(--text-muted)" }}
                      title={file.path}
                    >
                      {file.path}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                      {formatStorageBytes(file.bytes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredFiles.length > 500 ? (
          <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Showing top 500 of {filteredFiles.length.toLocaleString()} matching
            files (largest first).
          </p>
        ) : null}
      </div>
    </div>
  );
}
