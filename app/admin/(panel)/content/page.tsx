"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentSection } from "@/app/generated/prisma/enums";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import { getSiteImageAdminGroups } from "@/lib/site-image-admin";
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

export default function AdminContentPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<SiteContentItem[]>([]);
  const [siteImages, setSiteImages] = useState<Record<string, SiteImageFormItem>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const siteImageList = useMemo(
    () => SITE_IMAGE_GROUPS.flatMap((group) => group.items),
    [],
  );

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
    setSiteImages((current) => ({
      ...current,
      [name]: { ...current[name], ...patch },
    }));
  };

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
        throw new Error("Failed to save website content");
      }

      const imagePayload = siteImageList
        .map((item) => siteImages[item.name])
        .filter((item): item is SiteImageFormItem => Boolean(item?.url && item.altText));

      if (imagePayload.length > 0) {
        const imagesResponse = await adminFetch("/api/admin/images/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: imagePayload.map((item) => ({
              name: item.name,
              url: item.url,
              altText: item.altText,
            })),
          }),
        });

        if (!imagesResponse.ok) {
          throw new Error("Failed to save site images");
        }
      }

      showToast("success", "Website content and images saved");
      await loadContent();
    } catch {
      showToast("error", "Failed to save changes");
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
    <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
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
                  onChange={(url) =>
                    updateSection(item.section, { imageUrl: url })
                  }
                  folder={item.section.toLowerCase()}
                  variant="admin"
                  helperText="Optional. Uploads directly to Supabase Storage, then click Save Changes."
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <div id="site-images">
        <h2 className="admin-heading text-xl">Site Images</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Manage every homepage and page image by section. Uploads go directly
          to Supabase Storage; image URLs are saved when you click Save Changes.
        </p>

        {SITE_IMAGE_GROUPS.map((group) => (
          <div key={group.pagePath} className="mt-6">
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--accent)" }}
            >
              {group.title}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {group.items.map((item) => {
                const image = siteImages[item.name];
                if (!image) return null;

                return (
                  <section key={item.name} className="admin-card p-4 sm:p-6">
                    <h4 className="admin-heading text-lg">{item.label}</h4>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.name}
                    </p>
                    <div className="mt-4 space-y-4">
                      <label className="block text-sm">
                        <span
                          className="mb-1 block font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Alt Text
                        </span>
                        <input
                          value={image.altText}
                          onChange={(event) =>
                            updateSiteImage(item.name, {
                              altText: event.target.value,
                            })
                          }
                          className="admin-input w-full px-3 py-2"
                        />
                      </label>
                      <ImageUpload
                        label="Section Image"
                        value={image.url || null}
                        onChange={(url) =>
                          updateSiteImage(item.name, { url: url ?? "" })
                        }
                        folder={`site-images/${item.name}`}
                        variant="admin"
                        helperText="Uploads directly to Supabase Storage. Click Save Changes to apply on the live site."
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ))}
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
