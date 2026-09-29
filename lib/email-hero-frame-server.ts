import sharp from "sharp";
import {
  buildEmailImagesPublicUrl,
  emailImagesObjectPathFromUrl,
} from "@/lib/email-branding-shared";
import { HATHOR_EMAIL_HERO_URL } from "@/lib/email-branding-urls";
import {
  emailHeroCropRect,
  EMAIL_HERO_OUTPUT_HEIGHT,
  EMAIL_HERO_OUTPUT_WIDTH,
  parseEmailHeroFrame,
  type EmailHeroFrame,
} from "@/lib/email-hero-frame";
import {
  loadSharedEmailBranding,
  propagateEmailHeroAndCleanup,
} from "@/lib/email-template-image-db";
import { EMAIL_IMAGE_BUCKET, STORAGE_CACHE_CONTROL } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

/**
 * Email banner framing, server side. Saving a frame renders the banner as a
 * finished 1280×640 JPEG from the untouched original and points every
 * template at it — emails then show that picture as-is, so every client
 * displays the same framing. The original is kept as `source-*` in the
 * email-images bucket: the hero clean-up only removes `hero-*` files, so the
 * full picture is always there to re-frame from.
 */

const SETTING_KEY = "email-hero-frame";

type StoredHeroFrame = {
  /** the full original the banner is cut from */
  sourceUrl: string;
  /** the banner this frame produced; if emails point elsewhere, a new image was uploaded */
  heroUrl: string;
  frame: EmailHeroFrame;
};

export type EmailHeroFrameState = {
  sourceUrl: string;
  frame: EmailHeroFrame;
};

async function readStored(): Promise<StoredHeroFrame | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.value) as Partial<StoredHeroFrame>;
    if (typeof parsed.sourceUrl !== "string" || typeof parsed.heroUrl !== "string") {
      return null;
    }
    return {
      sourceUrl: parsed.sourceUrl,
      heroUrl: parsed.heroUrl,
      frame: parseEmailHeroFrame(parsed.frame),
    };
  } catch {
    return null;
  }
}

async function currentHeroUrl(): Promise<string> {
  const { heroImageUrl } = await loadSharedEmailBranding();
  return heroImageUrl?.trim() || HATHOR_EMAIL_HERO_URL;
}

/**
 * What the editor should frame: the kept original and its saved frame — or,
 * when a new banner has been uploaded since, that upload, centred.
 */
export async function getEmailHeroFrameState(): Promise<EmailHeroFrameState> {
  const [stored, hero] = await Promise.all([readStored(), currentHeroUrl()]);
  if (stored && stored.heroUrl === hero) {
    return { sourceUrl: stored.sourceUrl, frame: stored.frame };
  }
  return { sourceUrl: hero, frame: parseEmailHeroFrame(null) };
}

async function readImageBytes(url: string): Promise<Buffer> {
  const path = emailImagesObjectPathFromUrl(url);
  if (path) {
    const { data, error } = await createSupabaseStorageAdminClient()
      .storage.from(EMAIL_IMAGE_BUCKET)
      .download(path);
    if (error || !data) throw new Error(`Could not read the banner original (${error?.message ?? "missing"})`);
    return Buffer.from(await data.arrayBuffer());
  }
  const absolute = toAbsolutePublicUrl(url) ?? url;
  const response = await fetch(absolute, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read the banner original (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToEmailImages(
  objectPath: string,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  const storage = createSupabaseStorageAdminClient().storage.from(EMAIL_IMAGE_BUCKET);
  const { data: signed, error: signError } = await storage.createSignedUploadUrl(objectPath);
  if (signError || !signed?.token) {
    throw new Error(signError?.message ?? "Failed to create signed upload URL");
  }
  const { error } = await storage.uploadToSignedUrl(objectPath, signed.token, new Uint8Array(bytes), {
    contentType,
    cacheControl: STORAGE_CACHE_CONTROL,
  });
  if (error) throw new Error(error.message || "Storage upload failed");
  const url = buildEmailImagesPublicUrl(objectPath);
  if (!url) {
    await storage.remove([objectPath]);
    throw new Error("Supabase URL is not configured");
  }
  return url;
}

/** Remove kept originals other than the one in use. */
async function removeOtherSources(keepPath: string): Promise<void> {
  const storage = createSupabaseStorageAdminClient().storage.from(EMAIL_IMAGE_BUCKET);
  const { data, error } = await storage.list("", { limit: 200 });
  if (error) return;
  const stale = (data ?? [])
    .map((entry) => entry.name?.trim())
    .filter((name): name is string => Boolean(name) && /^source-/i.test(name!) && name !== keepPath);
  if (stale.length > 0) await storage.remove(stale);
}

/** Render the banner for a frame (no storage or database writes). */
export async function renderEmailHeroFromSource(
  source: Buffer,
  frame: EmailHeroFrame,
): Promise<Buffer> {
  /* rotate() applies EXIF orientation first, as browsers do in the editor */
  const { data: upright, info } = await sharp(source).rotate().toBuffer({ resolveWithObject: true });
  const rect = emailHeroCropRect(info.width, info.height, frame);
  const left = Math.max(0, Math.round(rect.left));
  const top = Math.max(0, Math.round(rect.top));
  const width = Math.min(info.width - left, Math.round(rect.width));
  const height = Math.min(info.height - top, Math.round(rect.height));
  return sharp(upright)
    .extract({ left, top, width, height })
    .resize(EMAIL_HERO_OUTPUT_WIDTH, EMAIL_HERO_OUTPUT_HEIGHT, { fit: "fill" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
}

/**
 * Save a frame: keep the original, render and upload the banner, point every
 * template at it (the old banner file is removed), and remember the frame.
 */
export async function saveEmailHeroFrame(input: unknown): Promise<{ heroUrl: string }> {
  const frame = parseEmailHeroFrame(input);
  const state = await getEmailHeroFrameState();
  const source = await readImageBytes(state.sourceUrl);
  const stamp = Date.now();

  /* The first frame of a banner cuts from the uploaded hero-* file, which the
     clean-up below would delete — keep a copy as the original first. */
  let sourceUrl = state.sourceUrl;
  let sourcePath = emailImagesObjectPathFromUrl(sourceUrl);
  if (!sourcePath || !/^source-/i.test(sourcePath)) {
    const meta = await sharp(source).metadata();
    const ext = meta.format === "png" ? "png" : meta.format === "webp" ? "webp" : "jpg";
    sourcePath = `source-${stamp}.${ext}`;
    sourceUrl = await uploadToEmailImages(sourcePath, source, `image/${ext === "jpg" ? "jpeg" : ext}`);
  }

  const banner = await renderEmailHeroFromSource(source, frame);
  const heroPath = `hero-${stamp}.jpg`;
  const heroUrl = await uploadToEmailImages(heroPath, banner, "image/jpeg");
  await propagateEmailHeroAndCleanup(heroUrl, heroPath);

  const stored: StoredHeroFrame = { sourceUrl, heroUrl, frame };
  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(stored) },
    update: { value: JSON.stringify(stored) },
  });
  await removeOtherSources(sourcePath);

  return { heroUrl };
}
