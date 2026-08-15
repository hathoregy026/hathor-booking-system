"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  ADMIN_PHONE_PREVIEW_WIDTH,
  type AdminDevicePreview,
} from "@/lib/admin-device-preview";
import {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_NAV,
  paragraphsToText,
  parseWebsiteText,
  textToParagraphs,
  type WebsiteText,
} from "@/lib/website-text-shared";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  type HeroPageKey,
  parseTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings-shared";

type PageId = (typeof WEBSITE_TEXT_NAV)[number]["id"];

const PRIMARY_PAGE_IDS: PageId[] = [
  "home",
  "about",
  "cruises",
  "highlights",
  "gastronomy",
  "wellness",
  "charter",
  "contact",
];

const MORE_PAGE_IDS: PageId[] = [
  "rooms",
  "cabins",
  "royal",
  "blog",
  "partners",
];

const PAGE_HERO_KEY: Record<PageId, HeroPageKey> = {
  home: "home",
  about: "about",
  cruises: "cruises",
  highlights: "highlights",
  gastronomy: "gastronomy",
  wellness: "wellness",
  charter: "charter",
  contact: "contact",
  rooms: "suites",
  cabins: "luxury_cabins",
  royal: "royal_suites",
  blog: "blog",
  partners: "partners",
};

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 4,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="wt-field">
      <span className="wt-field__meta">
        <span className="wt-field__label">{label}</span>
        {hint ? <span className="wt-field__hint">{hint}</span> : null}
      </span>
      {multiline ? (
        <textarea
          className="input wt-field__input"
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input wt-field__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="wt-section">
      <header className="wt-section__head">
        {typeof step === "number" ? (
          <span className="wt-section__step">{String(step).padStart(2, "0")}</span>
        ) : null}
        <div className="wt-section__titles">
          <h3 className="wt-section__title">{title}</h3>
          {description ? (
            <p className="wt-section__desc">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="wt-section__body">{children}</div>
    </section>
  );
}

function ItemCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="wt-item">
      <p className="wt-item__title">{title}</p>
      <div className="wt-item__body">{children}</div>
    </div>
  );
}

export function WebsiteTextPanel() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<AdminDevicePreview>("desktop");
  const [desktopText, setDesktopText] = useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [phoneText, setPhoneText] = useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [savedDesktopText, setSavedDesktopText] =
    useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [savedPhoneText, setSavedPhoneText] =
    useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [desktopTypo, setDesktopTypo] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [phoneTypo, setPhoneTypo] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [savedDesktopTypo, setSavedDesktopTypo] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [savedPhoneTypo, setSavedPhoneTypo] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [activePage, setActivePage] = useState<PageId>("home");

  const text = device === "phone" ? phoneText : desktopText;
  const setText = device === "phone" ? setPhoneText : setDesktopText;
  const savedText = device === "phone" ? savedPhoneText : savedDesktopText;
  const typo = device === "phone" ? phoneTypo : desktopTypo;
  const setTypo = device === "phone" ? setPhoneTypo : setDesktopTypo;
  const savedTypo = device === "phone" ? savedPhoneTypo : savedDesktopTypo;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [textRes, typoRes] = await Promise.all([
        adminFetch("/api/admin/website-text"),
        adminFetch("/api/admin/typography"),
      ]);
      if (textRes.ok) {
        const data = (await textRes.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        const parsedDesktop = parseWebsiteText(data.settings);
        const parsedPhone = parseWebsiteText(
          data.settingsMobile ?? data.settings,
        );
        setDesktopText(parsedDesktop);
        setSavedDesktopText(parsedDesktop);
        setPhoneText(parsedPhone);
        setSavedPhoneText(parsedPhone);
      }
      if (typoRes.ok) {
        const data = (await typoRes.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        const parsedDesktop = parseTypographySettings(data.settings);
        const parsedPhone = parseTypographySettings(
          data.settingsMobile ?? data.settings,
        );
        setDesktopTypo(parsedDesktop);
        setSavedDesktopTypo(parsedDesktop);
        setPhoneTypo(parsedPhone);
        setSavedPhoneTypo(parsedPhone);
      }
    } catch {
      showToast("error", "Failed to load website text");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [load]);

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "").toLowerCase();
      if (!raw) return;
      const match = WEBSITE_TEXT_NAV.find(
        (item) =>
          item.id === raw ||
          item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") === raw,
      );
      if (match) setActivePage(match.id as PageId);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const dirty = useMemo(
    () =>
      JSON.stringify(text) !== JSON.stringify(savedText) ||
      JSON.stringify(typo.hero_pages) !== JSON.stringify(savedTypo.hero_pages) ||
      JSON.stringify(typo.marquee_copy) !==
        JSON.stringify(savedTypo.marquee_copy) ||
      JSON.stringify(typo.on_images_copy) !==
        JSON.stringify(savedTypo.on_images_copy) ||
      JSON.stringify(typo.our_voyages_copy) !==
        JSON.stringify(savedTypo.our_voyages_copy),
    [text, savedText, typo, savedTypo],
  );

  const desktopDirty = useMemo(
    () =>
      JSON.stringify(desktopText) !== JSON.stringify(savedDesktopText) ||
      JSON.stringify(desktopTypo.hero_pages) !==
        JSON.stringify(savedDesktopTypo.hero_pages),
    [desktopText, savedDesktopText, desktopTypo, savedDesktopTypo],
  );

  const phoneDirty = useMemo(
    () =>
      JSON.stringify(phoneText) !== JSON.stringify(savedPhoneText) ||
      JSON.stringify(phoneTypo.hero_pages) !==
        JSON.stringify(savedPhoneTypo.hero_pages),
    [phoneText, savedPhoneText, phoneTypo, savedPhoneTypo],
  );

  const patchHome = <K extends keyof WebsiteText["home"]>(
    key: K,
    value: WebsiteText["home"][K],
  ) => {
    setText((prev) => ({ ...prev, home: { ...prev.home, [key]: value } }));
  };

  const patchPage = <K extends keyof WebsiteText["pages"]>(
    key: K,
    value: WebsiteText["pages"][K],
  ) => {
    setText((prev) => ({ ...prev, pages: { ...prev.pages, [key]: value } }));
  };

  const selectPage = (id: PageId) => {
    setActivePage(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextTypo: TypographySettings = {
        ...typo,
        on_images_copy: {
          title: text.home.stackSlides[0]?.title ?? typo.on_images_copy.title,
          indication:
            text.home.stackSlides[0]?.indication ??
            typo.on_images_copy.indication,
          body: text.home.stackSlides[0]?.body ?? typo.on_images_copy.body,
        },
      };

      const [textRes, typoRes] = await Promise.all([
        adminFetch("/api/admin/website-text", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: text, device }),
        }),
        adminFetch("/api/admin/typography", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: nextTypo, device }),
        }),
      ]);

      if (!textRes.ok) throw new Error("Failed to save website text");
      if (!typoRes.ok) throw new Error("Failed to save hero / marquee text");

      const textData = (await textRes.json()) as { settings?: unknown };
      const typoData = (await typoRes.json()) as { settings?: unknown };
      const nextText = parseWebsiteText(textData.settings);
      const nextSavedTypo = parseTypographySettings(typoData.settings);
      setText(nextText);
      setTypo(nextSavedTypo);
      if (device === "phone") {
        setSavedPhoneText(nextText);
        setSavedPhoneTypo(nextSavedTypo);
      } else {
        setSavedDesktopText(nextText);
        setSavedDesktopTypo(nextSavedTypo);
      }
      showToast(
        "success",
        device === "phone"
          ? "Phone text saved — live phones (≤767px) updated."
          : "Website text saved to live site",
      );
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save website text",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setText(savedText);
    setTypo(savedTypo);
  };

  const activeMeta =
    WEBSITE_TEXT_NAV.find((item) => item.id === activePage) ??
    WEBSITE_TEXT_NAV[0];
  const heroKey = PAGE_HERO_KEY[activePage];
  const heroCopy = typo.hero_pages[heroKey];
  const primaryIndex = PRIMARY_PAGE_IDS.indexOf(activePage);

  const setHero = (patch: Partial<{ main: string; second: string }>) => {
    setTypo((prev) => ({
      ...prev,
      hero_pages: {
        ...prev.hero_pages,
        [heroKey]: { ...prev.hero_pages[heroKey], ...patch },
      },
    }));
  };

  const renderNavItems = (ids: PageId[]) =>
    ids.map((id) => {
      const item = WEBSITE_TEXT_NAV.find((nav) => nav.id === id);
      if (!item) return null;
      const active = activePage === id;
      return (
        <button
          key={id}
          type="button"
          className={`wt-nav__item${active ? " is-active" : ""}`}
          aria-current={active ? "page" : undefined}
          onClick={() => selectPage(id)}
        >
          {item.label}
        </button>
      );
    });

  if (loading) {
    return (
      <div className="wt-panel wt-panel--loading">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading website text…
      </div>
    );
  }

  return (
    <div id="website-text" className="wt-panel">
      <header className="wt-topbar">
        <div className="wt-topbar__copy">
          <h1 className="wt-topbar__title">Website Text</h1>
          <p className="wt-topbar__subtitle">
            Switch Desktop / Phone to edit each version. Phone preview shows the
            live page in a {ADMIN_PHONE_PREVIEW_WIDTH}px frame.
          </p>
          <AdminDevicePreviewToggle
            value={device}
            onChange={setDevice}
            desktopDirty={desktopDirty}
            phoneDirty={phoneDirty}
            disabled={saving}
          />
        </div>
        <div className="wt-topbar__actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={!dirty || saving}
            onClick={handleDiscard}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Discard
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {device === "phone" ? "Save phone text" : "Save text"}
          </button>
        </div>
      </header>

      <div className="wt-layout">
        <aside className="wt-nav" aria-label="Website pages">
          <p className="wt-nav__label">Pages</p>
          <div className="wt-nav__list">{renderNavItems(PRIMARY_PAGE_IDS)}</div>
          <p className="wt-nav__label wt-nav__label--spaced">More</p>
          <div className="wt-nav__list">{renderNavItems(MORE_PAGE_IDS)}</div>
        </aside>

        <div className="wt-editor">
          <div className="wt-editor__toolbar">
            <div>
              {primaryIndex >= 0 ? (
                <p className="wt-editor__eyebrow">
                  Page {primaryIndex + 1} of {PRIMARY_PAGE_IDS.length}
                </p>
              ) : (
                <p className="wt-editor__eyebrow">Additional page</p>
              )}
              <h2 className="wt-editor__title">{activeMeta.label}</h2>
            </div>
            <a
              className="wt-preview"
              href={activeMeta.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Open live
            </a>
          </div>

          {device === "phone" ? (
            <div className="admin-phone-iframe-shell">
              <p className="admin-phone-iframe-shell__label">
                Phone live preview · {ADMIN_PHONE_PREVIEW_WIDTH}px — save first
                to see copy changes
              </p>
              <iframe
                key={`${activeMeta.href}-phone`}
                title={`Phone preview · ${activeMeta.label}`}
                src={`${activeMeta.href}${activeMeta.href.includes("?") ? "&" : "?"}adminPhonePreview=1`}
                className="admin-phone-iframe"
                style={{ width: ADMIN_PHONE_PREVIEW_WIDTH }}
              />
            </div>
          ) : null}

          <div className="wt-editor__form">
            <Section
              step={1}
              title="Hero titles"
              description="The large heading pair at the top of this page."
            >
              <Field
                label="First line"
                value={heroCopy.main}
                onChange={(main) => setHero({ main })}
              />
              <Field
                label="Second line"
                value={heroCopy.second}
                onChange={(second) => setHero({ second })}
              />
            </Section>

            {activePage === "home" ? (
              <>
                <Section
                  step={2}
                  title="About band"
                  description="Opening story under the homepage hero."
                >
                  <Field
                    label="Heading"
                    value={text.home.about.heading}
                    multiline
                    rows={2}
                    hint="Use Enter for a second line"
                    onChange={(heading) =>
                      patchHome("about", { ...text.home.about, heading })
                    }
                  />
                  <Field
                    label="Small label"
                    value={text.home.about.eyebrow}
                    onChange={(eyebrow) =>
                      patchHome("about", { ...text.home.about, eyebrow })
                    }
                  />
                  <Field
                    label="Body"
                    value={text.home.about.body}
                    multiline
                    rows={5}
                    onChange={(body) =>
                      patchHome("about", { ...text.home.about, body })
                    }
                  />
                  <Field
                    label="Button label"
                    value={text.home.about.cta}
                    onChange={(cta) =>
                      patchHome("about", { ...text.home.about, cta })
                    }
                  />
                </Section>

                <Section step={3} title="Itineraries carousel">
                  <Field
                    label="Title"
                    value={text.home.carousel.title}
                    onChange={(title) =>
                      patchHome("carousel", { ...text.home.carousel, title })
                    }
                  />
                  <Field
                    label="Small label"
                    value={text.home.carousel.subtitle}
                    onChange={(subtitle) =>
                      patchHome("carousel", {
                        ...text.home.carousel,
                        subtitle,
                      })
                    }
                  />
                  <Field
                    label="Button label"
                    value={text.home.carousel.exploreCta}
                    onChange={(exploreCta) =>
                      patchHome("carousel", {
                        ...text.home.carousel,
                        exploreCta,
                      })
                    }
                  />
                </Section>

                <Section
                  step={4}
                  title="Amenities sequence copy"
                  description="Same four chapters as Homepage media (Amenities sequence 1–4). Slide 1 wording also syncs to Typography → On images."
                >
                  {text.home.stackSlides.map((slide, index) => (
                    <ItemCard
                      key={index}
                      title={
                        [
                          "1 — Fullscreen intro",
                          "2 — Rising full-bleed",
                          "3 — Inset + half/half",
                          "4 — Fixed left + stack",
                        ][index] ?? `Slide ${index + 1}`
                      }
                    >
                      <Field
                        label="Title"
                        value={slide.title}
                        multiline
                        rows={2}
                        hint={
                          index === 0
                            ? "On the intro photo (line breaks = stacked lines)."
                            : index === 1
                              ? "Large title over the rising photo."
                              : index === 2
                                ? "Gold caption card + first slider panel."
                                : "Fourth slider panel title (opening uses stories below)."
                        }
                        onChange={(title) => {
                          const stackSlides = text.home.stackSlides.map(
                            (s, i) => (i === index ? { ...s, title } : s),
                          );
                          patchHome("stackSlides", stackSlides);
                        }}
                      />
                      <Field
                        label="Sub text"
                        value={slide.indication}
                        hint={
                          index === 0
                            ? "Under the intro title. Blank → “Sail The Nile On Hathor” on live."
                            : "Sub text on that chapter / slider panel."
                        }
                        onChange={(indication) => {
                          const stackSlides = text.home.stackSlides.map(
                            (s, i) =>
                              i === index ? { ...s, indication } : s,
                          );
                          patchHome("stackSlides", stackSlides);
                        }}
                      />
                      <Field
                        label="Body"
                        value={slide.body}
                        multiline
                        rows={4}
                        hint={
                          index === 0
                            ? "Cream panel after the intro photo slides."
                            : "Body for that chapter / slider panel."
                        }
                        onChange={(body) => {
                          const stackSlides = text.home.stackSlides.map(
                            (s, i) => (i === index ? { ...s, body } : s),
                          );
                          patchHome("stackSlides", stackSlides);
                        }}
                      />
                    </ItemCard>
                  ))}
                </Section>

                <Section
                  step={5}
                  title="Amenities sequence stories"
                  description="Way of Life & Dining — opening rail, CTAs, cards, and extra slider panels (same slots as Homepage media)."
                >
                  {text.home.textBlocks.map((block, index) => (
                    <ItemCard
                      key={index}
                      title={
                        index === 0
                          ? "Way of Life — opening rail + slider"
                          : "Dining — nature band + slider"
                      }
                    >
                      <Field
                        label="Title"
                        value={block.title}
                        multiline
                        rows={2}
                        hint={
                          index === 0
                            ? "Opening gold rail title (and card / slider)."
                            : "Nature gold band title (and card / slider)."
                        }
                        onChange={(title) => {
                          const textBlocks = text.home.textBlocks.map((b, i) =>
                            i === index ? { ...b, title } : b,
                          );
                          patchHome("textBlocks", textBlocks);
                        }}
                      />
                      <Field
                        label="Sub text"
                        value={block.indication}
                        hint={
                          index === 0
                            ? "Opening rail sub-line (and slider). Blank → “A Way of Life” on live."
                            : "Nature band sub-line (and slider). Blank → “Gastronomy” on live."
                        }
                        onChange={(indication) => {
                          const textBlocks = text.home.textBlocks.map((b, i) =>
                            i === index ? { ...b, indication } : b,
                          );
                          patchHome("textBlocks", textBlocks);
                        }}
                      />
                      <Field
                        label="Body"
                        value={block.body}
                        multiline
                        rows={5}
                        hint={
                          index === 0
                            ? "Opening rail body text."
                            : "Nature band / dining slider body."
                        }
                        onChange={(body) => {
                          const textBlocks = text.home.textBlocks.map((b, i) =>
                            i === index ? { ...b, body } : b,
                          );
                          patchHome("textBlocks", textBlocks);
                        }}
                      />
                      <Field
                        label="Button label"
                        value={block.cta}
                        hint="CTA on the opening rail (story 1) or nature band (story 2). Clear to hide while keeping space."
                        onChange={(cta) => {
                          const textBlocks = text.home.textBlocks.map((b, i) =>
                            i === index ? { ...b, cta } : b,
                          );
                          patchHome("textBlocks", textBlocks);
                        }}
                      />
                    </ItemCard>
                  ))}
                </Section>

                <Section step={6} title="Gallery">
                  <Field
                    label="Title"
                    value={text.home.gallery.title}
                    onChange={(title) =>
                      patchHome("gallery", { ...text.home.gallery, title })
                    }
                  />
                  <Field
                    label="Instagram handle"
                    value={text.home.gallery.indication}
                    placeholder="@hathor…"
                    onChange={(indication) =>
                      patchHome("gallery", {
                        ...text.home.gallery,
                        indication,
                      })
                    }
                  />
                  <Field
                    label="Follow label"
                    value={text.home.gallery.followEyebrow}
                    onChange={(followEyebrow) =>
                      patchHome("gallery", {
                        ...text.home.gallery,
                        followEyebrow,
                      })
                    }
                  />
                </Section>

                <Section step={7} title="Testimonials">
                  <Field
                    label="Section title"
                    value={text.home.testimonials.title}
                    onChange={(title) =>
                      patchHome("testimonials", {
                        ...text.home.testimonials,
                        title,
                      })
                    }
                  />
                  {text.home.testimonials.cards.map((card, index) => (
                    <ItemCard key={index} title={`Guest ${index + 1}`}>
                      <Field
                        label="Name"
                        value={card.name}
                        onChange={(name) => {
                          const cards = text.home.testimonials.cards.map(
                            (c, i) => (i === index ? { ...c, name } : c),
                          );
                          patchHome("testimonials", {
                            ...text.home.testimonials,
                            cards,
                          });
                        }}
                      />
                      <Field
                        label="Quote"
                        value={card.quote}
                        multiline
                        rows={4}
                        onChange={(quote) => {
                          const cards = text.home.testimonials.cards.map(
                            (c, i) => (i === index ? { ...c, quote } : c),
                          );
                          patchHome("testimonials", {
                            ...text.home.testimonials,
                            cards,
                          });
                        }}
                      />
                    </ItemCard>
                  ))}
                </Section>

                <Section
                  step={8}
                  title="Shared marketing CTA"
                  description="Controls the MarketingCtaBand on About, Contact, Blog, and similar pages. Homepage campaign title is separate (below the fog CTA)."
                >
                  <Field
                    label="Campaign title (homepage fog CTA)"
                    value={text.home.campaign.title}
                    onChange={(title) => patchHome("campaign", { title })}
                    hint="HomeCampaignSection on-image title"
                  />
                  <Field
                    label="Marketing CTA title"
                    value={text.home.cta.title}
                    onChange={(title) =>
                      patchHome("cta", { ...text.home.cta, title })
                    }
                    hint="MarketingCtaBand heading on secondary pages"
                  />
                  <Field
                    label="Marketing CTA body"
                    value={text.home.cta.body}
                    multiline
                    rows={3}
                    onChange={(body) =>
                      patchHome("cta", { ...text.home.cta, body })
                    }
                    hint="MarketingCtaBand supporting paragraph"
                  />
                </Section>

                <Section
                  step={9}
                  title="Luxury marquee"
                  description="Scrolling phrases across the homepage."
                >
                  <Field
                    label="Phrases"
                    value={typo.marquee_copy.text}
                    multiline
                    rows={7}
                    hint="One phrase per line"
                    onChange={(value) =>
                      setTypo((prev) => ({
                        ...prev,
                        marquee_copy: { text: value },
                      }))
                    }
                  />
                </Section>

                <Section step={10} title="Our Voyages header">
                  <Field
                    label="Title"
                    value={typo.our_voyages_copy.title}
                    onChange={(title) =>
                      setTypo((prev) => ({
                        ...prev,
                        our_voyages_copy: {
                          ...prev.our_voyages_copy,
                          title,
                        },
                      }))
                    }
                  />
                  <Field
                    label="Small label"
                    value={typo.our_voyages_copy.indication}
                    onChange={(indication) =>
                      setTypo((prev) => ({
                        ...prev,
                        our_voyages_copy: {
                          ...prev.our_voyages_copy,
                          indication,
                        },
                      }))
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "about" ? (
              <>
                <Section step={2} title="Introduction">
                  <Field
                    label="Intro paragraphs"
                    value={paragraphsToText(text.pages.about.intro)}
                    multiline
                    rows={8}
                    hint="Blank line between paragraphs"
                    onChange={(v) =>
                      patchPage("about", {
                        ...text.pages.about,
                        intro: textToParagraphs(v),
                      })
                    }
                  />
                </Section>
                <Section step={3} title="Accommodations">
                  <Field
                    label="Title"
                    value={text.pages.about.accommodationsTitle}
                    onChange={(accommodationsTitle) =>
                      patchPage("about", {
                        ...text.pages.about,
                        accommodationsTitle,
                      })
                    }
                  />
                  <Field
                    label="Intro"
                    value={text.pages.about.accommodationsIntro}
                    multiline
                    rows={3}
                    onChange={(accommodationsIntro) =>
                      patchPage("about", {
                        ...text.pages.about,
                        accommodationsIntro,
                      })
                    }
                  />
                  <Field
                    label="Outro"
                    value={text.pages.about.accommodationsOutro}
                    multiline
                    rows={3}
                    onChange={(accommodationsOutro) =>
                      patchPage("about", {
                        ...text.pages.about,
                        accommodationsOutro,
                      })
                    }
                  />
                </Section>
                <Section step={4} title="Dining">
                  <Field
                    label="Title"
                    value={text.pages.about.diningTitle}
                    onChange={(diningTitle) =>
                      patchPage("about", {
                        ...text.pages.about,
                        diningTitle,
                      })
                    }
                  />
                  <Field
                    label="Intro"
                    value={text.pages.about.diningIntro}
                    multiline
                    rows={3}
                    onChange={(diningIntro) =>
                      patchPage("about", {
                        ...text.pages.about,
                        diningIntro,
                      })
                    }
                  />
                  <Field
                    label="Outro"
                    value={text.pages.about.diningOutro}
                    multiline
                    rows={3}
                    onChange={(diningOutro) =>
                      patchPage("about", {
                        ...text.pages.about,
                        diningOutro,
                      })
                    }
                  />
                </Section>
                <Section step={5} title="Welcome">
                  <Field
                    label="Title"
                    value={text.pages.about.welcomeTitle}
                    onChange={(welcomeTitle) =>
                      patchPage("about", {
                        ...text.pages.about,
                        welcomeTitle,
                      })
                    }
                  />
                  <Field
                    label="Body"
                    value={text.pages.about.welcomeBody}
                    multiline
                    rows={4}
                    onChange={(welcomeBody) =>
                      patchPage("about", {
                        ...text.pages.about,
                        welcomeBody,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "cruises" ? (
              <>
                <Section
                  step={2}
                  title="Introduction"
                  description="Overview block under the hero (not the hero titles — those are Typography → Hero pages)."
                >
                  <Field
                    label="Overview title"
                    value={text.pages.cruises.overviewTitle}
                    hint="H2 in the cruises intro section"
                    onChange={(overviewTitle) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        overviewTitle,
                      })
                    }
                  />
                  <Field
                    label="Overview intro"
                    value={text.pages.cruises.overviewIntro}
                    multiline
                    rows={4}
                    hint="Body under the overview title"
                    onChange={(overviewIntro) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        overviewIntro,
                      })
                    }
                  />
                </Section>
                <Section
                  step={3}
                  title="Continue exploring"
                  description="Onboard experience column beside the cruises image."
                >
                  <Field
                    label="Continue exploring — title"
                    value={text.pages.cruises.continueTitle}
                    hint="Use a line break for stacked title lines"
                    onChange={(continueTitle) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        continueTitle,
                      })
                    }
                  />
                  <Field
                    label="Continue exploring — body"
                    value={text.pages.cruises.continueBody}
                    multiline
                    rows={4}
                    onChange={(continueBody) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        continueBody,
                      })
                    }
                  />
                </Section>
                <Section
                  step={4}
                  title="Reserve CTA"
                  description="Bottom call-to-action before booking actions."
                >
                  <Field
                    label="CTA title"
                    value={text.pages.cruises.ctaTitle}
                    onChange={(ctaTitle) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        ctaTitle,
                      })
                    }
                  />
                  <Field
                    label="CTA body"
                    value={text.pages.cruises.ctaBody}
                    multiline
                    rows={3}
                    onChange={(ctaBody) =>
                      patchPage("cruises", {
                        ...text.pages.cruises,
                        ctaBody,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "suites" ? (
              <>
                <Section
                  step={2}
                  title="Hero"
                  description="Native Suites mosaic hero (/suites-preview). Empty fields fall back to bake-time copy."
                >
                  <Field
                    label="Eyebrow"
                    value={text.pages.suites.heroEyebrow}
                    onChange={(heroEyebrow) =>
                      patchPage("suites", { ...text.pages.suites, heroEyebrow })
                    }
                  />
                  <Field
                    label="Title"
                    value={text.pages.suites.heroTitle}
                    hint="Line break between River / Suites"
                    multiline
                    rows={2}
                    onChange={(heroTitle) =>
                      patchPage("suites", { ...text.pages.suites, heroTitle })
                    }
                  />
                  <Field
                    label="Support"
                    value={text.pages.suites.heroSupport}
                    multiline
                    rows={3}
                    onChange={(heroSupport) =>
                      patchPage("suites", { ...text.pages.suites, heroSupport })
                    }
                  />
                </Section>
                <Section step={3} title="Unrivaled + Step Aboard">
                  <Field
                    label="Unrivaled title"
                    value={text.pages.suites.unrivaledTitle}
                    onChange={(unrivaledTitle) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        unrivaledTitle,
                      })
                    }
                  />
                  <Field
                    label="Unrivaled body"
                    value={text.pages.suites.unrivaledBody}
                    multiline
                    rows={3}
                    onChange={(unrivaledBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        unrivaledBody,
                      })
                    }
                  />
                  <Field
                    label="Step Aboard title"
                    value={text.pages.suites.stepTitle}
                    onChange={(stepTitle) =>
                      patchPage("suites", { ...text.pages.suites, stepTitle })
                    }
                  />
                  <Field
                    label="Step Aboard body"
                    value={text.pages.suites.stepBody}
                    multiline
                    rows={4}
                    onChange={(stepBody) =>
                      patchPage("suites", { ...text.pages.suites, stepBody })
                    }
                  />
                </Section>
                <Section step={4} title="Comfort amenities">
                  <Field
                    label="Comfort title"
                    value={text.pages.suites.comfortTitle}
                    onChange={(comfortTitle) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        comfortTitle,
                      })
                    }
                  />
                  <Field
                    label="Comfort lead"
                    value={text.pages.suites.comfortLead}
                    multiline
                    rows={3}
                    onChange={(comfortLead) =>
                      patchPage("suites", { ...text.pages.suites, comfortLead })
                    }
                  />
                  <Field
                    label="Shower body"
                    value={text.pages.suites.amenityShowerBody}
                    multiline
                    rows={2}
                    onChange={(amenityShowerBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        amenityShowerBody,
                      })
                    }
                  />
                  <Field
                    label="Balcony body"
                    value={text.pages.suites.amenityBalconyBody}
                    multiline
                    rows={2}
                    onChange={(amenityBalconyBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        amenityBalconyBody,
                      })
                    }
                  />
                  <Field
                    label="Smart TV body"
                    value={text.pages.suites.amenitySmartTvBody}
                    multiline
                    rows={2}
                    onChange={(amenitySmartTvBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        amenitySmartTvBody,
                      })
                    }
                  />
                  <Field
                    label="Minibar body"
                    value={text.pages.suites.amenityMinibarBody}
                    multiline
                    rows={2}
                    onChange={(amenityMinibarBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        amenityMinibarBody,
                      })
                    }
                  />
                </Section>
                <Section step={5} title="Nile / Closing">
                  <Field
                    label="Nile title"
                    value={text.pages.suites.nileTitle}
                    onChange={(nileTitle) =>
                      patchPage("suites", { ...text.pages.suites, nileTitle })
                    }
                  />
                  <Field
                    label="Nile body"
                    value={text.pages.suites.nileBody}
                    multiline
                    rows={3}
                    onChange={(nileBody) =>
                      patchPage("suites", { ...text.pages.suites, nileBody })
                    }
                  />
                  <Field
                    label="Closing eyebrow"
                    value={text.pages.suites.closingEyebrow}
                    onChange={(closingEyebrow) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        closingEyebrow,
                      })
                    }
                  />
                  <Field
                    label="Closing title"
                    value={text.pages.suites.closingTitle}
                    onChange={(closingTitle) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        closingTitle,
                      })
                    }
                  />
                  <Field
                    label="Closing body"
                    value={text.pages.suites.closingBody}
                    multiline
                    rows={3}
                    onChange={(closingBody) =>
                      patchPage("suites", {
                        ...text.pages.suites,
                        closingBody,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "highlights" ? (
              <>
                <Section step={2} title="Introduction">
                  <Field
                    label="Intro paragraphs"
                    value={paragraphsToText(text.pages.highlights.intro)}
                    multiline
                    rows={6}
                    hint="Blank line between paragraphs"
                    onChange={(v) =>
                      patchPage("highlights", {
                        ...text.pages.highlights,
                        intro: textToParagraphs(v),
                      })
                    }
                  />
                </Section>
                <Section step={3} title="Landmarks">
                  {text.pages.highlights.landmarks.map((item, index) => (
                    <ItemCard key={index} title={`Landmark ${index + 1}`}>
                      <Field
                        label="Title"
                        value={item.title}
                        onChange={(title) => {
                          const landmarks = text.pages.highlights.landmarks.map(
                            (l, i) => (i === index ? { ...l, title } : l),
                          );
                          patchPage("highlights", {
                            ...text.pages.highlights,
                            landmarks,
                          });
                        }}
                      />
                      <Field
                        label="Body"
                        value={item.body}
                        multiline
                        rows={4}
                        onChange={(body) => {
                          const landmarks = text.pages.highlights.landmarks.map(
                            (l, i) => (i === index ? { ...l, body } : l),
                          );
                          patchPage("highlights", {
                            ...text.pages.highlights,
                            landmarks,
                          });
                        }}
                      />
                    </ItemCard>
                  ))}
                </Section>
              </>
            ) : null}

            {activePage === "gastronomy" ? (
              <>
                <Section step={2} title="Introduction">
                  <Field
                    label="Intro paragraphs"
                    value={paragraphsToText(text.pages.gastronomy.intro)}
                    multiline
                    rows={6}
                    hint="Blank line between paragraphs"
                    onChange={(v) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        intro: textToParagraphs(v),
                      })
                    }
                  />
                </Section>
                <Section step={3} title="Restaurant">
                  <Field
                    label="Title"
                    value={text.pages.gastronomy.restaurantTitle}
                    onChange={(restaurantTitle) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        restaurantTitle,
                      })
                    }
                  />
                  <Field
                    label="Service"
                    value={text.pages.gastronomy.restaurantService}
                    multiline
                    rows={3}
                    onChange={(restaurantService) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        restaurantService,
                      })
                    }
                  />
                </Section>
                <Section step={4} title="Atmosphere & closing">
                  <Field
                    label="Atmosphere title"
                    value={text.pages.gastronomy.atmosphereTitle}
                    onChange={(atmosphereTitle) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        atmosphereTitle,
                      })
                    }
                  />
                  <Field
                    label="Atmosphere"
                    value={text.pages.gastronomy.atmosphere}
                    multiline
                    rows={3}
                    onChange={(atmosphere) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        atmosphere,
                      })
                    }
                  />
                  <Field
                    label="Closing"
                    value={text.pages.gastronomy.closing}
                    multiline
                    rows={3}
                    onChange={(closing) =>
                      patchPage("gastronomy", {
                        ...text.pages.gastronomy,
                        closing,
                      })
                    }
                  />
                </Section>
                <Section step={5} title="Venues">
                  {text.pages.gastronomy.venues.map((venue, index) => (
                    <ItemCard key={index} title={`Venue ${index + 1}`}>
                      <Field
                        label="Title"
                        value={venue.title}
                        onChange={(title) => {
                          const venues = text.pages.gastronomy.venues.map(
                            (v, i) => (i === index ? { ...v, title } : v),
                          );
                          patchPage("gastronomy", {
                            ...text.pages.gastronomy,
                            venues,
                          });
                        }}
                      />
                      <Field
                        label="Description"
                        value={venue.description}
                        multiline
                        rows={3}
                        onChange={(description) => {
                          const venues = text.pages.gastronomy.venues.map(
                            (v, i) =>
                              i === index ? { ...v, description } : v,
                          );
                          patchPage("gastronomy", {
                            ...text.pages.gastronomy,
                            venues,
                          });
                        }}
                      />
                    </ItemCard>
                  ))}
                </Section>
              </>
            ) : null}

            {activePage === "wellness" ? (
              <>
                <Section step={2} title="Spa">
                  <Field
                    label="Title"
                    value={text.pages.wellness.spaTitle}
                    onChange={(spaTitle) =>
                      patchPage("wellness", {
                        ...text.pages.wellness,
                        spaTitle,
                      })
                    }
                  />
                  <Field
                    label="Paragraphs"
                    value={paragraphsToText(text.pages.wellness.spaParagraphs)}
                    multiline
                    rows={8}
                    hint="Blank line between paragraphs"
                    onChange={(v) =>
                      patchPage("wellness", {
                        ...text.pages.wellness,
                        spaParagraphs: textToParagraphs(v),
                      })
                    }
                  />
                </Section>
                <Section step={3} title="Fitness">
                  <Field
                    label="Title"
                    value={text.pages.wellness.fitnessTitle}
                    onChange={(fitnessTitle) =>
                      patchPage("wellness", {
                        ...text.pages.wellness,
                        fitnessTitle,
                      })
                    }
                  />
                  <Field
                    label="Body"
                    value={text.pages.wellness.fitnessBody}
                    multiline
                    rows={4}
                    onChange={(fitnessBody) =>
                      patchPage("wellness", {
                        ...text.pages.wellness,
                        fitnessBody,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "charter" ? (
              <Section step={2} title="Private charter">
                <Field
                  label="Overview title"
                  value={text.pages.charter.overviewTitle}
                  onChange={(overviewTitle) =>
                    patchPage("charter", {
                      ...text.pages.charter,
                      overviewTitle,
                    })
                  }
                />
                <Field
                  label="Overview intro"
                  value={text.pages.charter.overviewIntro}
                  multiline
                  rows={4}
                  onChange={(overviewIntro) =>
                    patchPage("charter", {
                      ...text.pages.charter,
                      overviewIntro,
                    })
                  }
                />
                <Field
                  label="Benefits intro"
                  value={text.pages.charter.benefitsIntro}
                  onChange={(benefitsIntro) =>
                    patchPage("charter", {
                      ...text.pages.charter,
                      benefitsIntro,
                    })
                  }
                />
                <Field
                  label="Benefits"
                  value={text.pages.charter.benefits.join("\n")}
                  multiline
                  rows={6}
                  hint="One benefit per line"
                  onChange={(v) =>
                    patchPage("charter", {
                      ...text.pages.charter,
                      benefits: v
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <Field
                  label="CTA"
                  value={text.pages.charter.cta}
                  multiline
                  rows={2}
                  onChange={(cta) =>
                    patchPage("charter", { ...text.pages.charter, cta })
                  }
                />
              </Section>
            ) : null}

            {activePage === "contact" ? (
              <Section step={2} title="Contact form">
                <Field
                  label="Form title"
                  value={text.pages.contact.formTitle}
                  onChange={(formTitle) =>
                    patchPage("contact", {
                      ...text.pages.contact,
                      formTitle,
                    })
                  }
                />
                <Field
                  label="Form intro"
                  value={text.pages.contact.formIntro}
                  multiline
                  rows={4}
                  onChange={(formIntro) =>
                    patchPage("contact", {
                      ...text.pages.contact,
                      formIntro,
                    })
                  }
                />
              </Section>
            ) : null}

            {activePage === "rooms" ? (
              <>
                <Section
                  step={2}
                  title="Introduction"
                  description="Overview block at the top of the suites page."
                >
                  <Field
                    label="Overview title"
                    value={text.pages.rooms.overviewTitle}
                    hint="Intro section H2"
                    onChange={(overviewTitle) =>
                      patchPage("rooms", {
                        ...text.pages.rooms,
                        overviewTitle,
                      })
                    }
                  />
                  <Field
                    label="Overview intro"
                    value={text.pages.rooms.overviewIntro}
                    multiline
                    rows={6}
                    hint="Intro body paragraphs (blank line between paragraphs)"
                    onChange={(overviewIntro) =>
                      patchPage("rooms", {
                        ...text.pages.rooms,
                        overviewIntro,
                      })
                    }
                  />
                </Section>
                <Section
                  step={3}
                  title="Amenities"
                  description="Amenities section near the bottom of the page."
                >
                  <Field
                    label="Amenities title"
                    value={text.pages.rooms.amenitiesTitle}
                    onChange={(amenitiesTitle) =>
                      patchPage("rooms", {
                        ...text.pages.rooms,
                        amenitiesTitle,
                      })
                    }
                  />
                  <Field
                    label="Amenities intro"
                    value={text.pages.rooms.amenitiesIntro}
                    multiline
                    rows={5}
                    hint="Lead paragraph above the amenity feature cards"
                    onChange={(amenitiesIntro) =>
                      patchPage("rooms", {
                        ...text.pages.rooms,
                        amenitiesIntro,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "cabins" ? (
              <>
                <Section
                  step={2}
                  title="Introduction"
                  description="Overview block at the top of the luxury cabins page."
                >
                  <Field
                    label="Overview title"
                    value={text.pages.cabins.overviewTitle}
                    hint="Intro section H2"
                    onChange={(overviewTitle) =>
                      patchPage("cabins", {
                        ...text.pages.cabins,
                        overviewTitle,
                      })
                    }
                  />
                  <Field
                    label="Overview intro"
                    value={text.pages.cabins.overviewIntro}
                    multiline
                    rows={6}
                    hint="Intro body paragraphs (blank line between paragraphs)"
                    onChange={(overviewIntro) =>
                      patchPage("cabins", {
                        ...text.pages.cabins,
                        overviewIntro,
                      })
                    }
                  />
                </Section>
                <Section
                  step={3}
                  title="Amenities"
                  description="Amenities section near the bottom of the page."
                >
                  <Field
                    label="Amenities title"
                    value={text.pages.cabins.amenitiesTitle}
                    onChange={(amenitiesTitle) =>
                      patchPage("cabins", {
                        ...text.pages.cabins,
                        amenitiesTitle,
                      })
                    }
                  />
                  <Field
                    label="Amenities intro"
                    value={text.pages.cabins.amenitiesIntro}
                    multiline
                    rows={5}
                    hint="Lead paragraph above the amenity feature cards"
                    onChange={(amenitiesIntro) =>
                      patchPage("cabins", {
                        ...text.pages.cabins,
                        amenitiesIntro,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "royal" ? (
              <>
                <Section
                  step={2}
                  title="Introduction"
                  description="Overview block at the top of the royal suites page."
                >
                  <Field
                    label="Overview title"
                    value={text.pages.royal.overviewTitle}
                    hint="Intro section H2"
                    onChange={(overviewTitle) =>
                      patchPage("royal", {
                        ...text.pages.royal,
                        overviewTitle,
                      })
                    }
                  />
                  <Field
                    label="Overview intro"
                    value={text.pages.royal.overviewIntro}
                    multiline
                    rows={6}
                    hint="Intro body paragraphs (blank line between paragraphs)"
                    onChange={(overviewIntro) =>
                      patchPage("royal", {
                        ...text.pages.royal,
                        overviewIntro,
                      })
                    }
                  />
                </Section>
                <Section
                  step={3}
                  title="Amenities"
                  description="Amenities section near the bottom of the page."
                >
                  <Field
                    label="Amenities title"
                    value={text.pages.royal.amenitiesTitle}
                    onChange={(amenitiesTitle) =>
                      patchPage("royal", {
                        ...text.pages.royal,
                        amenitiesTitle,
                      })
                    }
                  />
                  <Field
                    label="Amenities intro"
                    value={text.pages.royal.amenitiesIntro}
                    multiline
                    rows={5}
                    hint="Lead paragraph above the amenity feature cards"
                    onChange={(amenitiesIntro) =>
                      patchPage("royal", {
                        ...text.pages.royal,
                        amenitiesIntro,
                      })
                    }
                  />
                </Section>
              </>
            ) : null}

            {activePage === "blog" ? (
              <Section step={2} title="Blog intro">
                <Field
                  label="Intro"
                  value={text.pages.blog.intro}
                  multiline
                  rows={6}
                  onChange={(intro) => patchPage("blog", { intro })}
                />
              </Section>
            ) : null}

            {activePage === "partners" ? (
              <Section
                step={2}
                title="Partners"
                description="Hero title/chapter come from Website Text; partner names remain curated in code."
              >
                <Field
                  label="Hero title"
                  value={text.pages.partners.title}
                  hint="Primary hero title"
                  onChange={(title) =>
                    patchPage("partners", {
                      ...text.pages.partners,
                      title,
                    })
                  }
                />
                <Field
                  label="Hero secondary title"
                  value={text.pages.partners.chapter}
                  hint="secondTitle under the main hero title"
                  onChange={(chapter) =>
                    patchPage("partners", {
                      ...text.pages.partners,
                      chapter,
                    })
                  }
                />
                <Field
                  label="Section lead"
                  value={text.pages.partners.lead}
                  multiline
                  rows={4}
                  hint="Intro paragraph above the partner grid"
                  onChange={(lead) =>
                    patchPage("partners", {
                      ...text.pages.partners,
                      lead,
                    })
                  }
                />
              </Section>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`wt-savebar${dirty ? " wt-savebar--dirty" : ""}`}>
        <p className="wt-savebar__status">
          {dirty
            ? "Unsaved changes — Save text to update the live site."
            : "All text saved — live site matches this editor."}
        </p>
        <div className="wt-topbar__actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={!dirty || saving}
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Save text
          </button>
        </div>
      </div>
    </div>
  );
}
