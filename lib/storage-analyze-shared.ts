export const STORAGE_CATEGORIES = [
  "images",
  "videos",
  "icons",
  "fonts",
  "text",
  "documents",
  "audio",
  "other",
] as const;

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

export type StorageSource = "local" | "cloud" | "database";

export type StorageFileEntry = {
  id: string;
  name: string;
  path: string;
  category: StorageCategory;
  source: StorageSource;
  bytes: number;
  extension: string;
};

export type StorageCategorySummary = {
  category: StorageCategory;
  label: string;
  count: number;
  bytes: number;
};

export type StorageAnalyzeReport = {
  generatedAt: string;
  totalCount: number;
  totalBytes: number;
  categories: StorageCategorySummary[];
  files: StorageFileEntry[];
  warnings: string[];
};

export const STORAGE_CATEGORY_LABELS: Record<StorageCategory, string> = {
  images: "Images",
  videos: "Videos",
  icons: "Icons",
  fonts: "Fonts",
  text: "Text",
  documents: "Documents",
  audio: "Audio",
  other: "Other",
};

export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function storageCategoryLabel(category: StorageCategory): string {
  return STORAGE_CATEGORY_LABELS[category];
}
