type SupabaseStorageConfig = {
  baseUrl: string;
  serviceRoleKey: string;
};

function getSupabaseStorageConfig(): SupabaseStorageConfig {
  const baseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!baseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage uploads.",
    );
  }

  return { baseUrl, serviceRoleKey };
}

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildObjectUrl(bucket: string, objectPath: string): string {
  const { baseUrl } = getSupabaseStorageConfig();
  return `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeObjectPath(objectPath)}`;
}

function storageAuthHeaders(): Record<string, string> {
  const { serviceRoleKey } = getSupabaseStorageConfig();
  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
  };
}

/** Contiguous binary copy for fetch body (avoids shared-buffer / encoding issues). */
export function copyToBinaryBody(buffer: Buffer): Blob {
  const bytes = new Uint8Array(buffer.length);
  bytes.set(buffer);
  return new Blob([bytes], { type: "application/octet-stream" });
}

/** Upload raw bytes via Supabase Storage REST API (binary-safe on serverless). */
export async function uploadObjectBytes(
  bucket: string,
  objectPath: string,
  buffer: Buffer,
  contentType: string,
  upsert = false,
): Promise<void> {
  const response = await fetch(buildObjectUrl(bucket, objectPath), {
    method: "POST",
    headers: {
      ...storageAuthHeaders(),
      "Content-Type": contentType,
      "x-upsert": upsert ? "true" : "false",
      "cache-control": "max-age=3600",
    },
    body: copyToBinaryBody(buffer),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const message = detail.toLowerCase();

    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error(
        `Storage bucket "${bucket}" was not found in Supabase. Run: node scripts/setup-supabase-storage.mjs`,
      );
    }

    throw new Error(
      `Supabase storage upload failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
}

/** Download object bytes via Supabase Storage REST API. */
export async function downloadObjectBytes(
  bucket: string,
  objectPath: string,
): Promise<Buffer> {
  const response = await fetch(buildObjectUrl(bucket, objectPath), {
    headers: storageAuthHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase storage download failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export function getStoragePublicUrl(bucket: string, objectPath: string): string {
  const { baseUrl } = getSupabaseStorageConfig();
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeObjectPath(objectPath)}`;
}
