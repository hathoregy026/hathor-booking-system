"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { SiteImageSlotCard } from "@/components/admin/SiteImageSlotCard";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  getSiteImageAdminGroups,
  getSiteImageGroupHeading,
} from "@/lib/site-image-admin";
import { getSiteImageSlot } from "@/lib/site-image-slots";

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
    // Fall through
  }
  return fallback;
}

export default function AdminContentPage() {
  const { showToast } = useToast();
  const [siteImages, setSiteImages] = useState<Record<string, SiteImageFormItem>>(
    {},
  );
  const [savedSiteImages, setSavedSiteImages] = useState<
    Record<string, SiteImageFormItem>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openImageGroup, setOpenImageGroup] = useState<string>(
    SITE_IMAGE_GROUPS[0]?.pagePath ?? "/",
  );

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "").toLowerCase();
      if (!raw) return;

      if (raw === "website-text" || raw === "text") {
        window.location.replace("/admin/website-text");
        return;
      }

      const match = SITE_IMAGE_GROUPS.find((group) => {
        const path = group.pagePath.toLowerCase();
        const slug = path.replace(/^\/#?/, "").replace(/\//g, "-") || "home";
        return (
          raw === "site-images" ||
          raw === "website-images" ||
          raw === "images" ||
          raw === slug ||
          raw === path ||
          path.endsWith(raw) ||
          (raw === "floating-ig" && path.includes("floating-ig")) ||
          (raw === "our-voyages" && path.includes("our-voyages"))
        );
      });

      if (match) {
        setOpenImageGroup(match.pagePath);
        window.requestAnimationFrame(() => {
          const main = document.querySelector(".admin-main");
          const target = document.getElementById("site-images");
          if (main instanceof HTMLElement && target) {
            const top =
              target.getBoundingClientRect().top -
              main.getBoundingClientRect().top +
              main.scrollTop;
            main.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
            return;
          }
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const imagesRes = await adminFetch("/api/admin/images");
      if (imagesRes.ok) {
        const imagesData = (await imagesRes.json()) as {
          images: SiteImageRecord[];
        };
        const form = buildSiteImageForm(imagesData.images);
        setSiteImages(form);
        setSavedSiteImages(form);
      } else {
        const form = buildSiteImageForm([]);
        setSiteImages(form);
        setSavedSiteImages(form);
      }
    } catch {
      showToast("error", "Failed to load website images");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Admin dashboard mount fetch (images form). Cascading loading state is intentional.
    void loadContent(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [loadContent]);

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
        setSavedSiteImages((current) => ({
          ...current,
          [name]: {
            ...(current[name] ?? {
              name,
              label: name,
              url: nextUrl,
              altText: nextAlt,
            }),
            url: nextUrl,
            altText: nextAlt,
          },
        }));
        showToast("success", nextUrl ? "Image uploaded." : "Image removed.");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error ? error.message : "Failed to save site image",
        );
        await loadContent();
      }
    },
    [loadContent, persistSiteImageSlot, showToast],
  );

  const imagesDirty = useMemo(() => {
    return JSON.stringify(siteImages) !== JSON.stringify(savedSiteImages);
  }, [siteImages, savedSiteImages]);

  const handleSaveImages = async () => {
    setIsSaving(true);
    try {
      const images = Object.values(siteImages).map((item) => ({
        name: item.name,
        url: item.url,
        altText: item.altText,
      }));
      const imagesResponse = await adminFetch("/api/admin/images/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!imagesResponse.ok) {
        throw new Error(
          await readAdminError(imagesResponse, "Failed to save site images"),
        );
      }
      setSavedSiteImages(siteImages);
      showToast("success", "Website images saved");
    } catch (saveError) {
      showToast(
        "error",
        saveError instanceof Error ? saveError.message : "Failed to save images",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-16"
        style={{ color: "var(--text-secondary)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading website images…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
      <div id="site-images" className="site-images-cms space-y-5">
        <div>
          <h1 className="admin-heading text-xl">Website Images</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Choose a tab below, then replace any photo. Uploads publish to the
            live site immediately. Page wording is edited separately under{" "}
            <a href="/admin/website-text" className="admin-inline-link">
              Website Text
            </a>
            .
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
                onClick={() => {
                  setOpenImageGroup(group.pagePath);
                  const slug =
                    group.pagePath.replace(/^\/#?/, "").replace(/\//g, "-") ||
                    "home";
                  window.history.replaceState(
                    null,
                    "",
                    `#${slug === "" || slug === "home" ? "site-images" : slug}`,
                  );
                }}
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
                    {group.description
                      ? group.description
                      : `${assignedCount} of ${group.items.length} photos set`}
                  </p>
                  {group.description ? (
                    <p className="site-image-group__meta">
                      {assignedCount} of {group.items.length} photos set
                    </p>
                  ) : null}
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
                          const nextAlt =
                            !altText.trim() ||
                            /^(homepage-)+/.test(altText.trim())
                              ? meta?.suggestedAltText ??
                                item.label ??
                                altText
                              : altText;
                          void handleSiteImageUrlChange(
                            item.name,
                            nextUrl,
                            nextAlt,
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

        {imagesDirty ? (
          <button
            type="button"
            onClick={() => void handleSaveImages()}
            disabled={isSaving}
            className="admin-btn-primary flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Save image alt text
          </button>
        ) : null}
      </div>
    </div>
  );
}
