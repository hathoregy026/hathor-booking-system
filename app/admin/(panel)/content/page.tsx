"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentSection } from "@/app/generated/prisma/enums";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SiteImageSlotCard } from "@/components/admin/SiteImageSlotCard";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  getSiteImageAdminGroups,
  getSiteImageGroupHeading,
} from "@/lib/site-image-admin";
import { getSiteImageSlot } from "@/lib/site-image-slots";

type SiteContentItem = {
  id: string;
  section: ContentSection;
  title: string;
  subtitle: string | null;
  bodyText: string | null;
  imageUrl: string | null;
};

type SiteImageRecord = {
  id: string;
  name: string;
  altText: string;
  url: string;
};

type SiteImageFormItem = {
  name: string;
  label: string;
  url: string;
  altText: string;
};

const SECTION_LABELS: Record<ContentSection, string> = {
  [ContentSection.HERO]: "Hero Section",
  [ContentSection.ABOUT]: "About Hathor",
  [ContentSection.ITINERARIES]: "Itineraries",
  [ContentSection.ROOMS]: "Luxury Rooms & Suites",
  [ContentSection.WELLNESS]: "Wellness",
  [ContentSection.GASTRONOMY]: "Gastronomy / Dining",
  [ContentSection.CHARTER]: "Charter",
  [ContentSection.CONTACT]: "Contact",
};

const SECTION_ORDER: ContentSection[] = [
  ContentSection.HERO,
  ContentSection.ABOUT,
  ContentSection.ITINERARIES,
  ContentSection.ROOMS,
  ContentSection.WELLNESS,
  ContentSection.GASTRONOMY,
];

const SITE_IMAGE_GROUPS = getSiteImageAdminGroups();

function buildSiteImageForm(
  records: SiteImageRecord[],
): Record<string, SiteImageFormItem> {
  const byName = new Map(records.map((record) => [record.name, record]));
  const form: Record<string, SiteImageFormItem> = {};

  for (const group of SITE_IMAGE_GROUPS) {
    for (const item of group.items) {
      const record = byName.get(item.name);
      const slot = getSiteImageSlot(item.name);
      form[item.name] = {
        name: item.name,
        label: item.label,
        url: record?.url ?? slot?.url ?? "",
        altText: record?.altText ?? slot?.altText ?? item.defaultAlt,
      };
    }
  }

  return form;
}

async function readAdminError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; details?: unknown };
    if (data.error) return data.error;
  } catch {
    // Fall through to generic copy if the server did not return JSON.
  }

  return fallback;
}

export default function AdminContentPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<SiteContentItem[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, SiteImageFormItem>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openImageGroup, setOpenImageGroup] = useState<string>(
    SITE_IMAGE_GROUPS[0]?.pagePath ?? "/",
  );

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contentRes, imagesRes] = await Promise.all([
        adminFetch("/api/admin/content"),
        adminFetch("/api/admin/images"),
      ]);

      if (!contentRes.ok) {
        throw new Error("Failed to load website content");
      }

      const contentData = (await contentRes.json()) as {
        content: SiteContentItem[];
      };
      const bySection = new Map(
        contentData.content.map((item) => [item.section, item]),
      );

      setSections(
        SECTION_ORDER.map(
          (section) =>
            bySection.get(section) ?? {
              id: section,
              section,
              title: "",
              subtitle: null,
              bodyText: null,
              imageUrl: null,
            },
        ),
      );

      if (imagesRes.ok) {
        const imagesData = (await imagesRes.json()) as {
          images: SiteImageRecord[];
        };
        setSiteImages(buildSiteImageForm(imagesData.images));
      } else {
        setSiteImages(buildSiteImageForm([]));
      }
    } catch {
      showToast("error", "Failed to load website content");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const siteImageList = useMemo(() => {
    const seen = new Set<string>();
    const items: (typeof SITE_IMAGE_GROUPS)[number]["items"] = [];
    for (const group of SITE_IMAGE_GROUPS) {
      for (const item of group.items) {
        if (seen.has(item.name)) continue;
        seen.add(item.name);
        items.push(item);
      }
    }
    return items;
  }, []);

  const updateSection = (
    section: ContentSection,
    patch: Partial<SiteContentItem>,
  ) => {
    setSections((current) =>
      current.map((item) =>
        item.section === section ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateSiteImage = (name: string, patch: Partial<SiteImageFormItem>) => {
    setSiteImages((current) => {
      const existing = current[name];
      const slot = getSiteImageSlot(name);
      const base: SiteImageFormItem = existing ?? {
        name,
        label: slot?.name ?? name,
        url: slot?.url ?? "",
        altText: slot?.altText ?? "",
      };
      return {
        ...current,
        [name]: { ...base, ...patch, name },
      };
    });
  };

  /** Persist one slot immediately so replace/clear hits DB + storage without waiting for Save. */
  const persistSiteImageSlot = useCallback(
    async (name: string, url: string, altText: string) => {
      const response = await adminFetch("/api/admin/images/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [{ name, url, altText }],
        }),
      });
      if (!response.ok) {
        throw new Error(
          await readAdminError(response, "Failed to save site image"),
        );
      }
    },
    [],
  );

  const handleSiteImageUrlChange = useCallback(
    async (name: string, url: string | null, altText: string) => {
      const nextUrl = url ?? "";
      const nextAlt = altText.trim();

      updateSiteImage(name, {
        url: nextUrl,
        altText: nextAlt,
      });

      try {
        await persistSiteImageSlot(name, nextUrl, nextAlt);
        showToast(
          "success",
          nextUrl
            ? "Image updated on the live site"
            : "Image cleared — live site uses the default again",
        );
      } catch (error) {
        showToast(
          "error",
          error instanceof Error ? error.message : "Failed to update image",
        );
        await loadContent();
      }
    },
    [loadContent, persistSiteImageSlot, showToast],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const contentResponse = await adminFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((item) => ({
            section: item.section,
            title: item.title,
            subtitle: item.subtitle,
            bodyText: item.bodyText,
            imageUrl: item.imageUrl,
          })),
        }),
      });

      if (!contentResponse.ok) {
        throw new Error(
          await readAdminError(contentResponse, "Failed to save website content"),
        );
      }

      /* Include empty URLs so clears reset slots (and delete prior uploads). */
      const imagePayload = siteImageList
        .map((item) => siteImages[item.name])
        .filter((item): item is SiteImageFormItem => Boolean(item));

      if (imagePayload.length > 0) {
        const imagesResponse = await adminFetch("/api/admin/images/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: imagePayload.map((item) => ({
              name: item.name,
              url: item.url?.trim() ?? "",
              altText: item.altText?.trim() || item.label,
            })),
          }),
        });

        if (!imagesResponse.ok) {
          throw new Error(
            await readAdminError(imagesResponse, "Failed to save site images"),
          );
        }
      }

      showToast("success", "Website content and images saved");
      await loadContent();
    } catch (saveError) {
      showToast(
        "error",
        saveError instanceof Error ? saveError.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || sections.length === 0) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-16"
        style={{ color: "var(--text-secondary)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading content...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
      <div>
        <h2 className="admin-heading text-xl">Page Content</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Edit headlines and copy for each public page section.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {sections.map((item) => (
            <section key={item.section} className="admin-card p-4 sm:p-6">
              <h3 className="admin-heading text-lg">
                {SECTION_LABELS[item.section]}
              </h3>
              <div className="mt-4 space-y-4">
                <label className="block text-sm">
                  <span
                    className="mb-1 block font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Title
                  </span>
                  <input
                    value={item.title}
                    onChange={(event) =>
                      updateSection(item.section, { title: event.target.value })
                    }
                    className="admin-input w-full px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span
                    className="mb-1 block font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Subtitle
                  </span>
                  <textarea
                    value={item.subtitle ?? ""}
                    onChange={(event) =>
                      updateSection(item.section, { subtitle: event.target.value })
                    }
                    rows={2}
                    className="admin-input w-full px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span
                    className="mb-1 block font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Text
                  </span>
                  <textarea
                    value={item.bodyText ?? ""}
                    onChange={(event) =>
                      updateSection(item.section, { bodyText: event.target.value })
                    }
                    rows={6}
                    className="admin-input w-full px-3 py-2"
                  />
                </label>
                <ImageUpload
                  label="Section Image"
                  value={item.imageUrl}
                  onChange={(url, meta) =>
                    updateSection(item.section, { imageUrl: url })
                  }
                  pageName={SECTION_LABELS[item.section]}
                  imageTitle={item.title || "Section Image"}
                  folder={item.section.toLowerCase()}
                  variant="admin"
                  helperText="Optional. Uploads directly to Supabase Storage, then click Save Changes."
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <div id="site-images" className="site-images-cms space-y-5">
        <div>
          <h2 className="admin-heading text-xl">Website Images</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Choose a page below, then replace or clear any photo. Replacing
            publishes to the live site immediately and deletes the previous
            upload from storage. Clearing resets the slot to the default image.
          </p>
        </div>

        <div className="site-images-tabs" role="tablist" aria-label="Choose a page">
          {SITE_IMAGE_GROUPS.map((group) => {
            const isActive = openImageGroup === group.pagePath;
            return (
              <button
                key={group.pagePath}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`site-images-tab${isActive ? " is-active" : ""}`}
                onClick={() => setOpenImageGroup(group.pagePath)}
              >
                {group.title}
              </button>
            );
          })}
        </div>

        {SITE_IMAGE_GROUPS.map((group) => {
          const isOpen = openImageGroup === group.pagePath;
          const assignedCount = group.items.filter(
            (item) => siteImages[item.name]?.url?.trim(),
          ).length;
          const headingId = `site-images-${group.pagePath.replace(/\//g, "-") || "home"}`;

          return (
            <section
              key={group.pagePath}
              className={`site-image-group admin-card overflow-hidden${isOpen ? " is-open" : ""}`}
              hidden={!isOpen}
              aria-labelledby={headingId}
            >
              <button
                type="button"
                id={headingId}
                className="site-image-group__header"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenImageGroup((current) =>
                    current === group.pagePath ? "" : group.pagePath,
                  )
                }
              >
                <div className="site-image-group__header-text">
                  <h3 className="site-image-group__title">
                    {getSiteImageGroupHeading(group.title)}
                  </h3>
                  <p className="site-image-group__meta">
                    {assignedCount} of {group.items.length} photos set
                  </p>
                </div>
                <ChevronDown
                  className={`site-image-group__chevron${isOpen ? " is-open" : ""}`}
                  aria-hidden
                />
              </button>

              {isOpen ? (
                <div className="site-image-group__grid">
                  {group.items.map((item) => {
                    const image = siteImages[item.name];
                    const url = image?.url ?? "";
                    const altText = image?.altText ?? item.defaultAlt;

                    return (
                      <SiteImageSlotCard
                        key={`${group.pagePath}:${item.name}`}
                        item={item}
                        pageTitle={group.title}
                        url={url}
                        altText={altText}
                        onAltTextChange={(nextAlt) =>
                          updateSiteImage(item.name, { altText: nextAlt })
                        }
                        onUrlChange={(nextUrl, meta) => {
                          void handleSiteImageUrlChange(
                            item.name,
                            nextUrl,
                            meta?.suggestedAltText ?? altText,
                          );
                        }}
                      />
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="admin-btn-primary flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm disabled:opacity-60 sm:w-auto"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Save className="h-4 w-4" aria-hidden />
        )}
        Save Changes
      </button>
    </div>
  );
}
