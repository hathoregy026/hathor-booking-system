import fs from "node:fs";
import path from "node:path";
import { EMAIL_IMAGE_BUCKET, IMAGE_BUCKET } from "@/lib/image-upload";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import {
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
} from "@/lib/website-text-shared";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import {
  STORAGE_CATEGORIES,
  STORAGE_CATEGORY_LABELS,
  type StorageAnalyzeReport,
  type StorageCategory,
  type StorageCategorySummary,
  type StorageFileEntry,
} from "@/lib/storage-analyze-shared";

export {
  STORAGE_CATEGORIES,
  formatStorageBytes,
  storageCategoryLabel,
  type StorageAnalyzeReport,
  type StorageCategory,
  type StorageCategorySummary,
  type StorageFileEntry,
  type StorageSource,
} from "@/lib/storage-analyze-shared";

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "bmp",
  "tif",
  "tiff",
]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "avi", "mkv"]);
const ICON_EXT = new Set(["svg", "ico"]);
const FONT_EXT = new Set(["woff", "woff2", "ttf", "otf", "eot"]);
const TEXT_EXT = new Set([
  "txt",
  "json",
  "html",
  "htm",
  "css",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "md",
  "csv",
  "xml",
  "map",
]);
const DOC_EXT = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac"]);

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "CLONE. httpssprings.estate",
]);

function extensionOf(filePath: string): string {
  const base = path.basename(filePath);
  const idx = base.lastIndexOf(".");
  if (idx <= 0) return "";
  return base.slice(idx + 1).toLowerCase();
}

export function categorizeStoragePath(
  filePath: string,
  extension = extensionOf(filePath),
): StorageCategory {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();

  if (ICON_EXT.has(extension) || normalized.includes("favicon")) {
    return "icons";
  }
  if (
    normalized.includes("/branding/") &&
    (IMAGE_EXT.has(extension) || extension === "svg")
  ) {
    return "icons";
  }
  if (IMAGE_EXT.has(extension)) return "images";
  if (VIDEO_EXT.has(extension)) return "videos";
  if (FONT_EXT.has(extension)) return "fonts";
  if (TEXT_EXT.has(extension)) return "text";
  if (DOC_EXT.has(extension)) return "documents";
  if (AUDIO_EXT.has(extension)) return "audio";
  return "other";
}

function walkLocalFiles(
  absDir: string,
  relBase: string,
  out: StorageFileEntry[],
): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;

    const absPath = path.join(absDir, entry.name);
    const relPath = path.posix.join(relBase, entry.name.replace(/\\/g, "/"));

    if (entry.isDirectory()) {
      walkLocalFiles(absPath, relPath, out);
      continue;
    }
    if (!entry.isFile()) continue;

    let bytes = 0;
    try {
      bytes = fs.statSync(absPath).size;
    } catch {
      continue;
    }

    const extension = extensionOf(entry.name);
    out.push({
      id: `local:${relPath}`,
      name: entry.name,
      path: `/${relPath}`,
      category: categorizeStoragePath(relPath, extension),
      source: "local",
      bytes,
      extension: extension || "none",
      // Live-site filter never counts local files.
      usedOnLive: false,
    });
  }
}

/**
 * Collect cloud object keys (`bucket/object/path`) referenced by live CMS image URLs.
 * Local `/media/...` defaults are intentionally ignored.
 */
function collectLiveCloudObjectKeys(
  urls: Iterable<string>,
): Set<string> {
  const keys = new Set<string>();
  for (const url of urls) {
    const trimmed = url?.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) continue;

    try {
      const parsed = new URL(trimmed);
      const marker = "/storage/v1/object/public/";
      const idx = parsed.pathname.indexOf(marker);
      if (idx === -1) continue;
      const rest = parsed.pathname.slice(idx + marker.length);
      const slash = rest.indexOf("/");
      if (slash <= 0) continue;
      const bucket = decodeURIComponent(rest.slice(0, slash));
      const objectPath = decodeURIComponent(
        rest.slice(slash + 1).split("?")[0] ?? "",
      );
      if (
        !objectPath ||
        (bucket !== IMAGE_BUCKET && bucket !== EMAIL_IMAGE_BUCKET)
      ) {
        continue;
      }
      keys.add(`${bucket}/${objectPath}`);
    } catch {
      // ignore malformed URLs
    }
  }
  return keys;
}

async function collectLiveSiteCloudKeys(
  warnings: string[],
): Promise<Set<string>> {
  try {
    const map = await resolveSiteImageMap();
    return collectLiveCloudObjectKeys(
      Object.values(map).map((entry) => entry.src),
    );
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Live CMS image map unavailable: ${error.message}`
        : "Live CMS image map unavailable.",
    );
    return new Set();
  }
}

async function listCloudBucket(
  bucket: string,
  warnings: string[],
): Promise<StorageFileEntry[]> {
  const files: StorageFileEntry[] = [];
  let supabase;
  try {
    supabase = createSupabaseStorageAdminClient();
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Cloud storage unavailable (${bucket}): ${error.message}`
        : `Cloud storage unavailable (${bucket}).`,
    );
    return files;
  }

  const queue = [""];
  const seenDirs = new Set<string>();
  let safety = 0;

  while (queue.length > 0 && safety < 400) {
    safety += 1;
    const prefix = queue.shift() ?? "";
    if (seenDirs.has(prefix)) continue;
    seenDirs.add(prefix);

    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        warnings.push(
          `Cloud list failed (${bucket}/${prefix || "."}): ${error.message}`,
        );
        break;
      }
      if (!data?.length) break;

      for (const item of data) {
        const childPath = prefix ? `${prefix}/${item.name}` : item.name;
        const hasSize = typeof item.metadata?.size === "number";
        const looksLikeFolder = !hasSize && !item.metadata?.mimetype;

        if (looksLikeFolder) {
          queue.push(childPath);
          continue;
        }

        const extension = extensionOf(item.name);
        files.push({
          id: `cloud:${bucket}:${childPath}`,
          name: item.name,
          path: `${bucket}/${childPath}`,
          category: categorizeStoragePath(childPath, extension),
          source: "cloud",
          bytes: hasSize ? Number(item.metadata?.size) : 0,
          extension: extension || "none",
          usedOnLive: false,
        });
      }

      if (data.length < 100) break;
      offset += 100;
    }
  }

  return files;
}

async function collectDatabaseTextEntries(
  warnings: string[],
): Promise<StorageFileEntry[]> {
  const entries: StorageFileEntry[] = [];
  try {
    const rows = await withDb(() =>
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [WEBSITE_TEXT_KEY, WEBSITE_TEXT_MOBILE_KEY],
          },
        },
        select: { key: true, value: true },
      }),
    );

    for (const row of rows) {
      const bytes = Buffer.byteLength(row.value ?? "", "utf8");
      entries.push({
        id: `database:${row.key}`,
        name: row.key,
        path: `SiteSetting/${row.key}`,
        category: "text",
        source: "database",
        bytes,
        extension: "json",
        usedOnLive: true,
      });
    }
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Website text size unavailable: ${error.message}`
        : "Website text size unavailable.",
    );
  }
  return entries;
}

function summarize(files: StorageFileEntry[]): StorageCategorySummary[] {
  const map = new Map<StorageCategory, { count: number; bytes: number }>();
  for (const category of STORAGE_CATEGORIES) {
    map.set(category, { count: 0, bytes: 0 });
  }
  for (const file of files) {
    const bucket = map.get(file.category) ?? { count: 0, bytes: 0 };
    bucket.count += 1;
    bucket.bytes += file.bytes;
    map.set(file.category, bucket);
  }
  return STORAGE_CATEGORIES.map((category) => {
    const stats = map.get(category)!;
    return {
      category,
      label: STORAGE_CATEGORY_LABELS[category],
      count: stats.count,
      bytes: stats.bytes,
    };
  });
}

/** Build a read-only storage inventory for the admin Analyze → Storage page. */
export async function buildStorageAnalyzeReport(): Promise<StorageAnalyzeReport> {
  const warnings: string[] = [];
  const files: StorageFileEntry[] = [];

  const publicRoot = path.join(process.cwd(), "public");
  if (fs.existsSync(publicRoot)) {
    walkLocalFiles(publicRoot, "", files);
  } else {
    warnings.push("Local public/ folder not found on this server.");
  }

  const [cloudWebsite, cloudEmail, dbText, liveCloudKeys] = await Promise.all([
    listCloudBucket(IMAGE_BUCKET, warnings),
    listCloudBucket(EMAIL_IMAGE_BUCKET, warnings),
    collectDatabaseTextEntries(warnings),
    collectLiveSiteCloudKeys(warnings),
  ]);

  for (const file of [...cloudWebsite, ...cloudEmail]) {
    file.usedOnLive = liveCloudKeys.has(file.path);
    files.push(file);
  }
  files.push(...dbText);
  files.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path));

  const categories = summarize(files);
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const liveFiles = files.filter((file) => file.usedOnLive);
  const liveSiteBytes = liveFiles.reduce((sum, file) => sum + file.bytes, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalCount: files.length,
    totalBytes,
    liveSiteCount: liveFiles.length,
    liveSiteBytes,
    categories,
    files,
    warnings,
  };
}
