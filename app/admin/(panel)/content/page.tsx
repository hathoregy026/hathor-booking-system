"use client";

import { useCallback, useEffect, useState } from "react";
import { ContentSection } from "@/app/generated/prisma/enums";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";

type SiteContentItem = {
  id: string;
  section: ContentSection;
  title: string;
  subtitle: string | null;
  bodyText: string | null;
  imageUrl: string | null;
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

export default function AdminContentPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<SiteContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/content");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to load");
      }
      const data = await response.json();
      const bySection = new Map(
        (data.content as SiteContentItem[]).map((item) => [item.section, item]),
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
    } catch {
      showToast("error", "Failed to load website content");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
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

      if (!response.ok) throw new Error("Save failed");
      showToast("success", "Website content saved");
      await loadContent();
    } catch {
      showToast("error", "Failed to save website content");
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
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {sections.map((item) => (
          <section key={item.section} className="admin-card p-4 sm:p-6">
          <h2 className="admin-heading text-lg">
            {SECTION_LABELS[item.section]}
          </h2>
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
              onChange={(url) => updateSection(item.section, { imageUrl: url })}
              folder={item.section.toLowerCase()}
              helperText="Optional. Upload the image, then click Save Changes."
            />
          </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
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
