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
  HERO_PAGE_KEYS,
  HERO_PAGE_LABELS,
  parseTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings-shared";

type TabId = "heroes" | (typeof WEBSITE_TEXT_NAV)[number]["id"];

const TABS: { id: TabId; label: string; href: string }[] = [
  { id: "heroes", label: "Hero titles", href: "/" },
  ...WEBSITE_TEXT_NAV.map((item) => ({
    id: item.id as TabId,
    label: item.label,
    href: item.href,
  })),
];

const HOME_SECTIONS = [
  { id: "about", label: "About band" },
  { id: "carousel", label: "Itineraries" },
  { id: "stack", label: "Landmark slides" },
  { id: "blocks", label: "Text + image" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Testimonials" },
  { id: "campaign", label: "Campaign & CTA" },
  { id: "marquee", label: "Marquee" },
  { id: "voyages", label: "Our Voyages" },
] as const;

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
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
      <span className="wt-field__label">{label}</span>
      {hint ? <span className="wt-field__hint">{hint}</span> : null}
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
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="wt-section admin-card">
      <header className="wt-section__head">
        <h3 className="wt-section__title">{title}</h3>
        {description ? (
          <p className="wt-section__desc">{description}</p>
        ) : null}
      </header>
      <div className="wt-section__body">{children}</div>
    </section>
  );
}

function ViewOnSite({ href }: { href: string }) {
  return (
    <a
      className="wt-view-btn"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      Preview page
    </a>
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
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [homeSection, setHomeSection] = useState<string>("about");

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
      const match = TABS.find(
        (tab) =>
          tab.id === raw ||
          tab.label.toLowerCase().replace(/\s+/g, "-") === raw,
      );
      if (match) setActiveTab(match.id);
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

  const selectTab = (id: TabId) => {
    setActiveTab(id);
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
      const parsedText = parseWebsiteText(textData.settings);
      const parsedTypo = parseTypographySettings(typoData.settings);
      setText(parsedText);
      setSavedText(parsedText);
      setTypo(parsedTypo);
      setSavedTypo(parsedTypo);
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

  const activeMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[1];

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
      <div className="wt-panel__header">
        <div>
          <h1 className="admin-heading text-xl">Website Text</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Pick a page tab, edit the wording, then save. Images are managed
            separately under Website Images. Fonts &amp; colours stay in
            Typography &amp; Styles.
          </p>
        </div>
        <div className="wt-panel__actions">
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
      </div>

      <div className="wt-tabs" role="tablist" aria-label="Choose a page">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`wt-tab${isActive ? " is-active" : ""}`}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="wt-workspace">
        <div className="wt-workspace__toolbar">
          <div>
            <p className="wt-workspace__eyebrow">Editing</p>
            <h2 className="wt-workspace__title">{activeMeta.label}</h2>
          </div>
          <ViewOnSite href={activeMeta.href} />
        </div>

        {activeTab === "heroes" ? (
          <Section
            title="Hero titles"
            description="First line and second script line on each page hero. Change one page at a time."
          >
            <div className="wt-grid wt-grid--heroes">
              {HERO_PAGE_KEYS.map((key) => {
                const copy = typo.hero_pages[key];
                return (
                  <div key={key} className="wt-card">
                    <div className="wt-card__title">{HERO_PAGE_LABELS[key]}</div>
                    <Field
                      label="First line"
                      value={copy.main}
                      hint="Large hero headline"
                      onChange={(main) =>
                        setTypo((prev) => ({
                          ...prev,
                          hero_pages: {
                            ...prev.hero_pages,
                            [key]: { ...prev.hero_pages[key], main },
                          },
                        }))
                      }
                    />
                    <Field
                      label="Second line"
                      value={copy.second}
                      hint="Script / secondary title"
                      onChange={(second) =>
                        setTypo((prev) => ({
                          ...prev,
                          hero_pages: {
                            ...prev.hero_pages,
                            [key]: { ...prev.hero_pages[key], second },
                          },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        ) : null}

        {activeTab === "home" ? (
          <>
            <div className="wt-subnav" aria-label="Homepage sections">
              {HOME_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`wt-subnav__chip${homeSection === section.id ? " is-active" : ""}`}
                  onClick={() => {
                    setHomeSection(section.id);
                    document
                      .getElementById(`home-${section.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <Section
              id="home-about"
              title="About band"
              description="Opening story block under the homepage hero."
            >
              <Field
                label="Heading"
                value={text.home.about.heading}
                multiline
                rows={2}
                hint="Use a line break for two lines"
                onChange={(heading) =>
                  patchHome("about", { ...text.home.about, heading })
                }
              />
              <div className="wt-grid wt-grid--2">
                <Field
                  label="Small label"
                  value={text.home.about.eyebrow}
                  hint="Short line above or beside the heading"
                  onChange={(eyebrow) =>
                    patchHome("about", { ...text.home.about, eyebrow })
                  }
                />
                <Field
                  label="Button label"
                  value={text.home.about.cta}
                  onChange={(cta) =>
                    patchHome("about", { ...text.home.about, cta })
                  }
                />
              </div>
              <Field
                label="Body"
                value={text.home.about.body}
                multiline
                rows={5}
                onChange={(body) =>
                  patchHome("about", { ...text.home.about, body })
                }
              />
            </Section>

            <Section
              id="home-carousel"
              title="Itineraries carousel"
              description="Heading above the voyage cards."
            >
              <div className="wt-grid wt-grid--2">
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
                    patchHome("carousel", { ...text.home.carousel, subtitle })
                  }
                />
              </div>
              <Field
                label="Button label"
                value={text.home.carousel.exploreCta}
                onChange={(exploreCta) =>
                  patchHome("carousel", { ...text.home.carousel, exploreCta })
                }
              />
            </Section>

            <Section
              id="home-stack"
              title="Landmark stack slides"
              description="Four stacked story cards. Slide 1 also syncs with the on-image copy."
            >
              <div className="wt-grid wt-grid--2">
                {text.home.stackSlides.map((slide, index) => (
                  <div key={index} className="wt-card">
                    <div className="wt-card__title">Slide {index + 1}</div>
                    <Field
                      label="Title"
                      value={slide.title}
                      multiline
                      rows={2}
                      onChange={(title) => {
                        const stackSlides = text.home.stackSlides.map((s, i) =>
                          i === index ? { ...s, title } : s,
                        );
                        patchHome("stackSlides", stackSlides);
                      }}
                    />
                    <Field
                      label="Small label"
                      value={slide.indication}
                      onChange={(indication) => {
                        const stackSlides = text.home.stackSlides.map((s, i) =>
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
                        const stackSlides = text.home.stackSlides.map((s, i) =>
                          i === index ? { ...s, body } : s,
                        );
                        patchHome("stackSlides", stackSlides);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="home-blocks"
              title="Text + image blocks"
              description="Lifestyle and dining story bands."
            >
              <div className="wt-grid wt-grid--2">
                {text.home.textBlocks.map((block, index) => (
                  <div key={index} className="wt-card">
                    <div className="wt-card__title">
                      {index === 0 ? "Lifestyle" : "Dining"}
                    </div>
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
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="home-gallery"
              title="Gallery"
              description="Photo strip heading and Instagram follow line."
            >
              <Field
                label="Title"
                value={text.home.gallery.title}
                onChange={(title) =>
                  patchHome("gallery", { ...text.home.gallery, title })
                }
              />
              <div className="wt-grid wt-grid--2">
                <Field
                  label="Instagram handle"
                  value={text.home.gallery.indication}
                  placeholder="@hathor…"
                  onChange={(indication) =>
                    patchHome("gallery", { ...text.home.gallery, indication })
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
              </div>
            </Section>

            <Section
              id="home-reviews"
              title="Testimonials"
              description="Guest quotes shown on the homepage."
            >
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
              <div className="wt-grid wt-grid--2">
                {text.home.testimonials.cards.map((card, index) => (
                  <div key={index} className="wt-card">
                    <div className="wt-card__title">Guest {index + 1}</div>
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
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="home-campaign"
              title="Campaign & bottom CTA"
              description="Closing call-to-action band."
            >
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
                onChange={(body) => patchHome("cta", { ...text.home.cta, body })}
              />
            </Section>

            <Section
              id="home-marquee"
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

            <Section
              id="home-voyages"
              title="Our Voyages header"
              description="Title above the voyage accordion."
            >
              <div className="wt-grid wt-grid--2">
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
              </div>
            </Section>
          </>
        ) : null}

        {activeTab === "about" ? (
          <>
            <Section title="Introduction" description="Opening paragraphs.">
              <Field
                label="Intro"
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
            <Section title="Accommodations">
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
            <Section title="Dining">
              <Field
                label="Title"
                value={text.pages.about.diningTitle}
                onChange={(diningTitle) =>
                  patchPage("about", { ...text.pages.about, diningTitle })
                }
              />
              <Field
                label="Intro"
                value={text.pages.about.diningIntro}
                multiline
                rows={3}
                onChange={(diningIntro) =>
                  patchPage("about", { ...text.pages.about, diningIntro })
                }
              />
              <Field
                label="Outro"
                value={text.pages.about.diningOutro}
                multiline
                rows={3}
                onChange={(diningOutro) =>
                  patchPage("about", { ...text.pages.about, diningOutro })
                }
              />
            </Section>
            <Section title="Welcome">
              <Field
                label="Title"
                value={text.pages.about.welcomeTitle}
                onChange={(welcomeTitle) =>
                  patchPage("about", { ...text.pages.about, welcomeTitle })
                }
              />
              <Field
                label="Body"
                value={text.pages.about.welcomeBody}
                multiline
                rows={4}
                onChange={(welcomeBody) =>
                  patchPage("about", { ...text.pages.about, welcomeBody })
                }
              />
            </Section>
          </>
        ) : null}

        {activeTab === "cruises" ? (
          <Section
            title="Cruises page copy"
            description="Section heading and continue-exploring band."
          >
            <Field
              label="Section title"
              value={text.pages.cruises.sectionTitle}
              onChange={(sectionTitle) =>
                patchPage("cruises", { ...text.pages.cruises, sectionTitle })
              }
            />
            <Field
              label="Continue exploring — title"
              value={text.pages.cruises.continueTitle}
              onChange={(continueTitle) =>
                patchPage("cruises", { ...text.pages.cruises, continueTitle })
              }
            />
            <Field
              label="Continue exploring — body"
              value={text.pages.cruises.continueBody}
              multiline
              rows={4}
              onChange={(continueBody) =>
                patchPage("cruises", { ...text.pages.cruises, continueBody })
              }
            />
          </Section>
        ) : null}

        {activeTab === "highlights" ? (
          <>
            <Section title="Introduction">
              <Field
                label="Intro"
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
            <Section title="Landmarks">
              <div className="wt-grid wt-grid--2">
                {text.pages.highlights.landmarks.map((item, index) => (
                  <div key={index} className="wt-card">
                    <div className="wt-card__title">Landmark {index + 1}</div>
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
                  </div>
                ))}
              </div>
            </Section>
          </>
        ) : null}

        {activeTab === "gastronomy" ? (
          <>
            <Section title="Introduction">
              <Field
                label="Intro"
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
            <Section title="Restaurant">
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
            <Section title="Atmosphere & closing">
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
            <Section title="Venues">
              <div className="wt-grid wt-grid--2">
                {text.pages.gastronomy.venues.map((venue, index) => (
                  <div key={index} className="wt-card">
                    <div className="wt-card__title">Venue {index + 1}</div>
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
                          (v, i) => (i === index ? { ...v, description } : v),
                        );
                        patchPage("gastronomy", {
                          ...text.pages.gastronomy,
                          venues,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </>
        ) : null}

        {activeTab === "wellness" ? (
          <>
            <Section title="Spa">
              <Field
                label="Title"
                value={text.pages.wellness.spaTitle}
                onChange={(spaTitle) =>
                  patchPage("wellness", { ...text.pages.wellness, spaTitle })
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
            <Section title="Fitness">
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

        {activeTab === "charter" ? (
          <Section title="Private charter">
            <Field
              label="Overview title"
              value={text.pages.charter.overviewTitle}
              onChange={(overviewTitle) =>
                patchPage("charter", { ...text.pages.charter, overviewTitle })
              }
            />
            <Field
              label="Overview intro"
              value={text.pages.charter.overviewIntro}
              multiline
              rows={4}
              onChange={(overviewIntro) =>
                patchPage("charter", { ...text.pages.charter, overviewIntro })
              }
            />
            <Field
              label="Benefits intro"
              value={text.pages.charter.benefitsIntro}
              onChange={(benefitsIntro) =>
                patchPage("charter", { ...text.pages.charter, benefitsIntro })
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

        {activeTab === "contact" ? (
          <Section title="Contact form">
            <Field
              label="Form title"
              value={text.pages.contact.formTitle}
              onChange={(formTitle) =>
                patchPage("contact", { ...text.pages.contact, formTitle })
              }
            />
            <Field
              label="Form intro"
              value={text.pages.contact.formIntro}
              multiline
              rows={4}
              onChange={(formIntro) =>
                patchPage("contact", { ...text.pages.contact, formIntro })
              }
            />
          </Section>
        ) : null}

        {activeTab === "blog" ? (
          <Section title="Blog">
            <Field
              label="Intro"
              value={text.pages.blog.intro}
              multiline
              rows={6}
              onChange={(intro) => patchPage("blog", { intro })}
            />
          </Section>
        ) : null}

        {activeTab === "partners" ? (
          <Section title="Partners">
            <Field
              label="Title"
              value={text.pages.partners.title}
              onChange={(title) =>
                patchPage("partners", { ...text.pages.partners, title })
              }
            />
            <Field
              label="Chapter"
              value={text.pages.partners.chapter}
              onChange={(chapter) =>
                patchPage("partners", { ...text.pages.partners, chapter })
              }
            />
            <Field
              label="Lead"
              value={text.pages.partners.lead}
              multiline
              rows={4}
              onChange={(lead) =>
                patchPage("partners", { ...text.pages.partners, lead })
              }
            />
          </Section>
        ) : null}

        {activeTab === "rooms" ? (
          <Section title="Rooms & suites overview">
            <Field
              label="Title"
              value={text.pages.rooms.overviewTitle}
              onChange={(overviewTitle) =>
                patchPage("rooms", { ...text.pages.rooms, overviewTitle })
              }
            />
            <Field
              label="Intro"
              value={text.pages.rooms.overviewIntro}
              multiline
              rows={6}
              onChange={(overviewIntro) =>
                patchPage("rooms", { ...text.pages.rooms, overviewIntro })
              }
            />
          </Section>
        ) : null}

        {activeTab === "cabins" ? (
          <Section title="Luxury cabins overview">
            <Field
              label="Title"
              value={text.pages.cabins.overviewTitle}
              onChange={(overviewTitle) =>
                patchPage("cabins", { ...text.pages.cabins, overviewTitle })
              }
            />
            <Field
              label="Intro"
              value={text.pages.cabins.overviewIntro}
              multiline
              rows={6}
              onChange={(overviewIntro) =>
                patchPage("cabins", { ...text.pages.cabins, overviewIntro })
              }
            />
          </Section>
        ) : null}

        {activeTab === "royal" ? (
          <Section title="Royal suites overview">
            <Field
              label="Title"
              value={text.pages.royal.overviewTitle}
              onChange={(overviewTitle) =>
                patchPage("royal", { ...text.pages.royal, overviewTitle })
              }
            />
            <Field
              label="Intro"
              value={text.pages.royal.overviewIntro}
              multiline
              rows={6}
              onChange={(overviewIntro) =>
                patchPage("royal", { ...text.pages.royal, overviewIntro })
              }
            />
          </Section>
        ) : null}
      </div>

      <div className={`wt-savebar${dirty ? " wt-savebar--dirty" : ""}`}>
        <p className="wt-savebar__status">
          {dirty
            ? "Unsaved changes — Save text to update the live site."
            : "All text saved — live site matches this editor."}
        </p>
        <div className="wt-panel__actions">
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
