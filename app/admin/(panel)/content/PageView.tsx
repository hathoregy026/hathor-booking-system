"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ImageIcon, Loader2, Save, Search } from "lucide-react";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { SiteImageSlotCard } from "@/components/admin/SiteImageSlotCard";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  getSiteImageAdminGroups,
  getSiteImageGroupHeading,
  type SiteImageAdminGroup,
  type SiteImageAdminItem,
} from "@/lib/site-image-admin";
import { getSiteImageSlot } from "@/lib/site-image-slots";
import {
  publicSiteImageSrc,
} from "@/lib/site-image-url";
import {
  DEFAULT_WHEEL_STAGE_SETTINGS,
  isWheelStageSettingsEqual,
  parseWheelStageSettings,
  type WheelStageSettings,
} from "@/lib/wheel-stage-settings-shared";

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

/** The hash a page tab writes, e.g. #wellness or #rooms-royal-suite. */
function groupSlug(pagePath: string): string {
  return (
    pagePath.replace(/^\//, "").replace(/\//g, "-").toLowerCase() || "home"
  );
}

/** A page’s photos split into the parts of the page they belong to. */
function sectionsOf(group: SiteImageAdminGroup): {
  name: string;
  items: SiteImageAdminItem[];
}[] {
  const sections: { name: string; items: SiteImageAdminItem[] }[] = [];
  for (const item of group.items) {
    const last = sections.find((section) => section.name === item.section);
    if (last) last.items.push(item);
    else sections.push({ name: item.section, items: [item] });
  }
  return sections;
}

function matchesQuery(item: SiteImageAdminItem, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.label,
    item.name,
    item.section,
    item.usedOnLabel,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function buildSiteImageForm(
  records: SiteImageRecord[],
): Record<string, SiteImageFormItem> {
  const byName = new Map(records.map((record) => [record.name, record]));
  const form: Record<string, SiteImageFormItem> = {};

  for (const group of SITE_IMAGE_GROUPS) {
    for (const item of group.items) {
      const record = byName.get(item.name);
      const slot = getSiteImageSlot(item.name);
      const effectiveRecord =
        record ?? (slot?.sourceName ? byName.get(slot.sourceName) : undefined);
      form[item.name] = {
        name: item.name,
        label: item.label,
        url: effectiveRecord
          ? publicSiteImageSrc(item.name, effectiveRecord.url)
          : (slot?.url ?? ""),
        altText: effectiveRecord?.altText ?? slot?.altText ?? item.defaultAlt,
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
  const [opacitySaving, setOpacitySaving] = useState(false);
  const [wheelStage, setWheelStage] = useState<WheelStageSettings>(
    DEFAULT_WHEEL_STAGE_SETTINGS,
  );
  const [savedWheelStage, setSavedWheelStage] = useState<WheelStageSettings>(
    DEFAULT_WHEEL_STAGE_SETTINGS,
  );
  const [openImageGroup, setOpenImageGroup] = useState<string>(
    SITE_IMAGE_GROUPS[0]?.pagePath ?? "/",
  );
  const [imageQuery, setImageQuery] = useState("");

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "").toLowerCase();
      if (!raw) return;

      if (raw === "website-text" || raw === "text") {
        window.location.replace("/admin/website-text");
        return;
      }

      const match = SITE_IMAGE_GROUPS.find(
        (group) =>
          raw === groupSlug(group.pagePath) ||
          raw === group.pagePath.toLowerCase() ||
          raw === group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      );
      if (raw === "site-images" || raw === "website-images" || raw === "images") {
        document
          .getElementById("site-images")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (match) {
        setOpenImageGroup(match.pagePath);
        window.requestAnimationFrame(() => {
          document
            .getElementById("site-images")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      const [imagesRes, wheelRes] = await Promise.all([
        adminFetch("/api/admin/images"),
        adminFetch("/api/admin/wheel-stage"),
      ]);
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
      if (wheelRes.ok) {
        const wheelData = (await wheelRes.json()) as { settings?: unknown };
        const settings = parseWheelStageSettings(wheelData.settings);
        setWheelStage(settings);
        setSavedWheelStage(settings);
      } else {
        setWheelStage(DEFAULT_WHEEL_STAGE_SETTINGS);
        setSavedWheelStage(DEFAULT_WHEEL_STAGE_SETTINGS);
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

  const persistWheelStage = useCallback(
    async (settings: WheelStageSettings) => {
      setOpacitySaving(true);
      try {
        const response = await adminFetch("/api/admin/wheel-stage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
        });
        if (!response.ok) {
          throw new Error(
            await readAdminError(response, "Failed to save wheel opacity"),
          );
        }
        const data = (await response.json()) as { settings?: unknown };
        const saved = parseWheelStageSettings(data.settings);
        setWheelStage(saved);
        setSavedWheelStage(saved);
        showToast("success", "Wheel background opacity saved.");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : "Failed to save wheel opacity",
        );
        setWheelStage(savedWheelStage);
      } finally {
        setOpacitySaving(false);
      }
    },
    [savedWheelStage, showToast],
  );

  const handleWheelOpacityCommit = useCallback(() => {
    if (isWheelStageSettingsEqual(wheelStage, savedWheelStage)) return;
    void persistWheelStage(wheelStage);
  }, [persistWheelStage, savedWheelStage, wheelStage]);

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

  const query = imageQuery.trim().toLowerCase();

  /* Searching narrows both the page tabs and the photos inside them. */
  const visibleGroups = useMemo(() => {
    if (!query) return SITE_IMAGE_GROUPS;
    return SITE_IMAGE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => matchesQuery(item, query)),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const matchCount = useMemo(
    () => visibleGroups.reduce((total, group) => total + group.items.length, 0),
    [visibleGroups],
  );

  const activeGroup = useMemo(
    () =>
      visibleGroups.find((group) => group.pagePath === openImageGroup) ??
      visibleGroups[0] ??
      null,
    [visibleGroups, openImageGroup],
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
      <CmsPageHeader
        title="Website Images"
        description="Named photo slots the public site reads. Uploads publish to the live site immediately. Page wording is edited under Website Text."
        icon={ImageIcon}
      />
      <div id="site-images" className="site-images-cms space-y-5">
        <div className="site-images-filter">
          <label className="site-images-search">
            <Search className="site-images-search__icon" aria-hidden />
            <input
              value={imageQuery}
              onChange={(event) => setImageQuery(event.target.value)}
              placeholder="Search a photo by name, page or slot"
              className="site-images-search__input"
              aria-label="Search website images"
            />
          </label>
          <p className="site-images-filter__hint">
            {query
              ? `${matchCount} photo${matchCount === 1 ? "" : "s"} match “${imageQuery.trim()}” across ${visibleGroups.length} page${visibleGroups.length === 1 ? "" : "s"}.`
              : "Pick a page to see every photo on it, in the order guests meet them."}
          </p>
        </div>

        <div className="site-images-tabs" role="tablist" aria-label="Choose a page">
          {visibleGroups.map((group) => {
            const isActive = activeGroup?.pagePath === group.pagePath;
            return (
              <button
                key={group.pagePath}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`site-images-tab${isActive ? " is-active" : ""}`}
                onClick={() => {
                  setOpenImageGroup(group.pagePath);
                  window.history.replaceState(
                    null,
                    "",
                    `#${groupSlug(group.pagePath)}`,
                  );
                }}
              >
                {group.title}
                <span className="site-images-tab__count">{group.items.length}</span>
              </button>
            );
          })}
        </div>

        {visibleGroups.length === 0 ? (
          <p className="site-images-empty">
            No photo matches “{imageQuery.trim()}”.
          </p>
        ) : null}

        {visibleGroups.map((group) => {
          const isOpen = activeGroup?.pagePath === group.pagePath;
          const assignedCount = group.items.filter(
            (item) => siteImages[item.name]?.url?.trim(),
          ).length;
          const headingId = `site-images-${groupSlug(group.pagePath)}`;

          return (
            <section
              key={group.pagePath}
              className={`site-image-group card overflow-hidden${isOpen ? " is-open" : ""}`}
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
                    {group.livePath ? (
                      <span className="site-image-group__path">{group.livePath}</span>
                    ) : null}
                  </h3>
                  {group.description ? (
                    <p className="site-image-group__meta">{group.description}</p>
                  ) : null}
                  <p className="site-image-group__meta">
                    {assignedCount} of {group.items.length} photos set
                  </p>
                </div>
                <ChevronDown
                  className={`site-image-group__chevron${isOpen ? " is-open" : ""}`}
                  aria-hidden
                />
              </button>

              {isOpen
                ? sectionsOf(group).map((section) => (
                    <div key={section.name} className="site-image-section">
                      {sectionsOf(group).length > 1 ? (
                        <h4 className="site-image-section__title">
                          {section.name}
                          <span className="site-image-section__count">
                            {section.items.length}
                          </span>
                        </h4>
                      ) : null}
                      <div className="site-image-group__grid">
                        {section.items.map((item) => {
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
                              {...(item.name === "home-wheel-stage"
                                ? {
                                    opacity: wheelStage.opacity,
                                    onOpacityChange: (opacity: number) =>
                                      setWheelStage({ opacity }),
                                    onOpacityCommit: handleWheelOpacityCommit,
                                    opacitySaving,
                                  }
                                : {})}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))
                : null}
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
