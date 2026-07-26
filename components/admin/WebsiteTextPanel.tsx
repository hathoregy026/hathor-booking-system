"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
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
          className="admin-input wt-field__input"
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="admin-input wt-field__input"
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
  const [text, setText] = useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [savedText, setSavedText] = useState<WebsiteText>(DEFAULT_WEBSITE_TEXT);
  const [typo, setTypo] = useState<TypographySettings>(DEFAULT_TYPOGRAPHY_SETTINGS);
  const [savedTypo, setSavedTypo] = useState<TypographySettings>(
    DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [activePage, setActivePage] = useState<PageId>("home");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [textRes, typoRes] = await Promise.all([
        adminFetch("/api/admin/website-text"),
        adminFetch("/api/admin/typography"),
      ]);
      if (textRes.ok) {
        const data = (await textRes.json()) as { settings?: unknown };
        const parsed = parseWebsiteText(data.settings);
        setText(parsed);
        setSavedText(parsed);
      }
      if (typoRes.ok) {
        const data = (await typoRes.json()) as { settings?: unknown };
        const parsed = parseTypographySettings(data.settings);
        setTypo(parsed);
        setSavedTypo(parsed);
      }
    } catch {
      showToast("error", "Failed to load website text");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
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
          body: JSON.stringify({ settings: text }),
        }),
        adminFetch("/api/admin/typography", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: nextTypo }),
        }),
      ]);

      if (!textRes.ok) throw new Error("Failed to save website text");
      if (!typoRes.ok) throw new Error("Failed to save hero / marquee text");

      const textData = (await textRes.json()) as { settings?: unknown };
      const typoData = (await typoRes.json()) as { settings?: unknown };
      setText(parseWebsiteText(textData.settings));
      setSavedText(parseWebsiteText(textData.settings));
      setTypo(parseTypographySettings(typoData.settings));
      setSavedTypo(parseTypographySettings(typoData.settings));
      showToast("success", "Website text saved to live site");
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
            Edit copy page by page, in site order. Images stay under Website
            Images.
          </p>
        </div>
        <div className="wt-topbar__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={!dirty || saving}
            onClick={handleDiscard}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Discard
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
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
              Preview
            </a>
          </div>

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
                  title="Landmark stack slides"
                  description="Four stacked story cards, in order."
                >
                  {text.home.stackSlides.map((slide, index) => (
                    <ItemCard key={index} title={`Slide ${index + 1}`}>
                      <Field
                        label="Title"
                        value={slide.title}
                        multiline
                        rows={2}
                        onChange={(title) => {
                          const stackSlides = text.home.stackSlides.map(
                            (s, i) => (i === index ? { ...s, title } : s),
                          );
                          patchHome("stackSlides", stackSlides);
                        }}
                      />
                      <Field
                        label="Small label"
                        value={slide.indication}
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

                <Section step={5} title="Text + image blocks">
                  {text.home.textBlocks.map((block, index) => (
                    <ItemCard
                      key={index}
                      title={index === 0 ? "Lifestyle" : "Dining"}
                    >
                      <Field
                        label="Title"
                        value={block.title}
                        multiline
                        rows={2}
                        onChange={(title) => {
                          const textBlocks = text.home.textBlocks.map((b, i) =>
                            i === index ? { ...b, title } : b,
                          );
                          patchHome("textBlocks", textBlocks);
                        }}
                      />
                      <Field
                        label="Body"
                        value={block.body}
                        multiline
                        rows={5}
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

                <Section step={8} title="Campaign & bottom CTA">
                  <Field
                    label="Campaign title"
                    value={text.home.campaign.title}
                    onChange={(title) => patchHome("campaign", { title })}
                  />
                  <Field
                    label="CTA title"
                    value={text.home.cta.title}
                    onChange={(title) =>
                      patchHome("cta", { ...text.home.cta, title })
                    }
                  />
                  <Field
                    label="CTA body"
                    value={text.home.cta.body}
                    multiline
                    rows={3}
                    onChange={(body) =>
                      patchHome("cta", { ...text.home.cta, body })
                    }
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
              <Section step={2} title="Page copy">
                <Field
                  label="Section title"
                  value={text.pages.cruises.sectionTitle}
                  onChange={(sectionTitle) =>
                    patchPage("cruises", {
                      ...text.pages.cruises,
                      sectionTitle,
                    })
                  }
                />
                <Field
                  label="Continue exploring — title"
                  value={text.pages.cruises.continueTitle}
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
              <Section step={2} title="Overview">
                <Field
                  label="Title"
                  value={text.pages.rooms.overviewTitle}
                  onChange={(overviewTitle) =>
                    patchPage("rooms", {
                      ...text.pages.rooms,
                      overviewTitle,
                    })
                  }
                />
                <Field
                  label="Intro"
                  value={text.pages.rooms.overviewIntro}
                  multiline
                  rows={6}
                  onChange={(overviewIntro) =>
                    patchPage("rooms", {
                      ...text.pages.rooms,
                      overviewIntro,
                    })
                  }
                />
              </Section>
            ) : null}

            {activePage === "cabins" ? (
              <Section step={2} title="Overview">
                <Field
                  label="Title"
                  value={text.pages.cabins.overviewTitle}
                  onChange={(overviewTitle) =>
                    patchPage("cabins", {
                      ...text.pages.cabins,
                      overviewTitle,
                    })
                  }
                />
                <Field
                  label="Intro"
                  value={text.pages.cabins.overviewIntro}
                  multiline
                  rows={6}
                  onChange={(overviewIntro) =>
                    patchPage("cabins", {
                      ...text.pages.cabins,
                      overviewIntro,
                    })
                  }
                />
              </Section>
            ) : null}

            {activePage === "royal" ? (
              <Section step={2} title="Overview">
                <Field
                  label="Title"
                  value={text.pages.royal.overviewTitle}
                  onChange={(overviewTitle) =>
                    patchPage("royal", {
                      ...text.pages.royal,
                      overviewTitle,
                    })
                  }
                />
                <Field
                  label="Intro"
                  value={text.pages.royal.overviewIntro}
                  multiline
                  rows={6}
                  onChange={(overviewIntro) =>
                    patchPage("royal", {
                      ...text.pages.royal,
                      overviewIntro,
                    })
                  }
                />
              </Section>
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
              <Section step={2} title="Partners">
                <Field
                  label="Title"
                  value={text.pages.partners.title}
                  onChange={(title) =>
                    patchPage("partners", {
                      ...text.pages.partners,
                      title,
                    })
                  }
                />
                <Field
                  label="Chapter"
                  value={text.pages.partners.chapter}
                  onChange={(chapter) =>
                    patchPage("partners", {
                      ...text.pages.partners,
                      chapter,
                    })
                  }
                />
                <Field
                  label="Lead"
                  value={text.pages.partners.lead}
                  multiline
                  rows={4}
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
            className="admin-btn admin-btn--ghost"
            disabled={!dirty || saving}
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
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
