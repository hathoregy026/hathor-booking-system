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

type OpenId = string | null;

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="wt-field">
      <span className="wt-field__label">{label}</span>
      {multiline ? (
        <textarea
          className="admin-input wt-field__input"
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="admin-input wt-field__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ViewOnSite({ href }: { href: string }) {
  const url = href.startsWith("http") ? href : href;
  return (
    <a
      className="wt-view-btn"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      View on site
    </a>
  );
}

function Accordion({
  id,
  openId,
  setOpenId,
  title,
  href,
  children,
}: {
  id: string;
  openId: OpenId;
  setOpenId: (id: OpenId) => void;
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  const open = openId === id;
  return (
    <section className={`wt-acc admin-card${open ? " is-open" : ""}`}>
      <div className="wt-acc__bar">
        <button
          type="button"
          className="wt-acc__toggle"
          aria-expanded={open}
          onClick={() => setOpenId(open ? null : id)}
        >
          <span>{title}</span>
          <span className="wt-acc__chevron" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
        </button>
        {href ? <ViewOnSite href={href} /> : null}
      </div>
      {open ? <div className="wt-acc__body">{children}</div> : null}
    </section>
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
  const [openId, setOpenId] = useState<OpenId>("home");

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextTypo: TypographySettings = {
        ...typo,
        // Keep stack slide 0 in sync with homepage stack editor when present
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

  if (loading) {
    return (
      <div className="wt-panel wt-panel--loading">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading website text…
      </div>
    );
  }

  const navHref = (id: string) =>
    WEBSITE_TEXT_NAV.find((item) => item.id === id)?.href ?? "/";

  return (
    <div id="website-text" className="wt-panel space-y-5">
      <div className="wt-panel__header">
        <div>
          <h2 className="admin-heading text-xl">Website Text</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Edit live site copy by page. Hero titles, marquee, and Our Voyages
            headers save with this panel. Fonts and colours stay in Typography
            &amp; Styles.
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

      <Accordion
        id="heroes"
        openId={openId}
        setOpenId={setOpenId}
        title="Hero titles (all pages)"
        href="/"
      >
        <p className="wt-hint">
          First line + second script line shown on each page hero.
        </p>
        <div className="wt-grid">
          {HERO_PAGE_KEYS.map((key) => {
            const copy = typo.hero_pages[key];
            return (
              <div key={key} className="wt-card">
                <div className="wt-card__title">
                  <span>{HERO_PAGE_LABELS[key]}</span>
                </div>
                <Field
                  label="First line"
                  value={copy.main}
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
                  label="Second title"
                  value={copy.second}
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
      </Accordion>

      <Accordion
        id="home"
        openId={openId}
        setOpenId={setOpenId}
        title="Homepage"
        href={navHref("home")}
      >
        <div className="wt-stack">
          <h4 className="wt-subhead">About band</h4>
          <Field
            label="Heading"
            value={text.home.about.heading}
            multiline
            rows={2}
            onChange={(heading) =>
              patchHome("about", { ...text.home.about, heading })
            }
          />
          <Field
            label="Indication"
            value={text.home.about.eyebrow}
            onChange={(eyebrow) =>
              patchHome("about", { ...text.home.about, eyebrow })
            }
          />
          <Field
            label="Body"
            value={text.home.about.body}
            multiline
            rows={4}
            onChange={(body) => patchHome("about", { ...text.home.about, body })}
          />
          <Field
            label="Button"
            value={text.home.about.cta}
            onChange={(cta) => patchHome("about", { ...text.home.about, cta })}
          />

          <h4 className="wt-subhead">Itineraries carousel</h4>
          <Field
            label="Title"
            value={text.home.carousel.title}
            onChange={(title) =>
              patchHome("carousel", { ...text.home.carousel, title })
            }
          />
          <Field
            label="Indication"
            value={text.home.carousel.subtitle}
            onChange={(subtitle) =>
              patchHome("carousel", { ...text.home.carousel, subtitle })
            }
          />
          <Field
            label="Button"
            value={text.home.carousel.exploreCta}
            onChange={(exploreCta) =>
              patchHome("carousel", { ...text.home.carousel, exploreCta })
            }
          />

          <h4 className="wt-subhead">Landmark stack slides</h4>
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
                label="Indication"
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
                rows={3}
                onChange={(body) => {
                  const stackSlides = text.home.stackSlides.map((s, i) =>
                    i === index ? { ...s, body } : s,
                  );
                  patchHome("stackSlides", stackSlides);
                }}
              />
            </div>
          ))}

          <h4 className="wt-subhead">Text + image blocks</h4>
          {text.home.textBlocks.map((block, index) => (
            <div key={index} className="wt-card">
              <div className="wt-card__title">Block {index + 1}</div>
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
                rows={4}
                onChange={(body) => {
                  const textBlocks = text.home.textBlocks.map((b, i) =>
                    i === index ? { ...b, body } : b,
                  );
                  patchHome("textBlocks", textBlocks);
                }}
              />
              <Field
                label="Button"
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

          <h4 className="wt-subhead">Gallery</h4>
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
            onChange={(indication) =>
              patchHome("gallery", { ...text.home.gallery, indication })
            }
          />
          <Field
            label="Follow eyebrow"
            value={text.home.gallery.followEyebrow}
            onChange={(followEyebrow) =>
              patchHome("gallery", { ...text.home.gallery, followEyebrow })
            }
          />

          <h4 className="wt-subhead">Testimonials</h4>
          <Field
            label="Section title"
            value={text.home.testimonials.title}
            onChange={(title) =>
              patchHome("testimonials", { ...text.home.testimonials, title })
            }
          />
          {text.home.testimonials.cards.map((card, index) => (
            <div key={index} className="wt-card">
              <div className="wt-card__title">Guest {index + 1}</div>
              <Field
                label="Name"
                value={card.name}
                onChange={(name) => {
                  const cards = text.home.testimonials.cards.map((c, i) =>
                    i === index ? { ...c, name } : c,
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
                rows={3}
                onChange={(quote) => {
                  const cards = text.home.testimonials.cards.map((c, i) =>
                    i === index ? { ...c, quote } : c,
                  );
                  patchHome("testimonials", {
                    ...text.home.testimonials,
                    cards,
                  });
                }}
              />
            </div>
          ))}

          <h4 className="wt-subhead">Campaign &amp; bottom CTA</h4>
          <Field
            label="Campaign title"
            value={text.home.campaign.title}
            onChange={(title) => patchHome("campaign", { title })}
          />
          <Field
            label="CTA title"
            value={text.home.cta.title}
            onChange={(title) => patchHome("cta", { ...text.home.cta, title })}
          />
          <Field
            label="CTA body"
            value={text.home.cta.body}
            multiline
            rows={3}
            onChange={(body) => patchHome("cta", { ...text.home.cta, body })}
          />

          <h4 className="wt-subhead">Luxury marquee</h4>
          <Field
            label="Phrases (one per line)"
            value={typo.marquee_copy.text}
            multiline
            rows={6}
            onChange={(value) =>
              setTypo((prev) => ({
                ...prev,
                marquee_copy: { text: value },
              }))
            }
          />

          <h4 className="wt-subhead">Our Voyages header</h4>
          <Field
            label="Title"
            value={typo.our_voyages_copy.title}
            onChange={(title) =>
              setTypo((prev) => ({
                ...prev,
                our_voyages_copy: { ...prev.our_voyages_copy, title },
              }))
            }
          />
          <Field
            label="Indication"
            value={typo.our_voyages_copy.indication}
            onChange={(indication) =>
              setTypo((prev) => ({
                ...prev,
                our_voyages_copy: { ...prev.our_voyages_copy, indication },
              }))
            }
          />
        </div>
      </Accordion>

      <Accordion
        id="about"
        openId={openId}
        setOpenId={setOpenId}
        title="About"
        href={navHref("about")}
      >
        <Field
          label="Intro paragraphs"
          value={paragraphsToText(text.pages.about.intro)}
          multiline
          rows={8}
          onChange={(v) =>
            patchPage("about", {
              ...text.pages.about,
              intro: textToParagraphs(v),
            })
          }
        />
        <Field
          label="Accommodations title"
          value={text.pages.about.accommodationsTitle}
          onChange={(accommodationsTitle) =>
            patchPage("about", { ...text.pages.about, accommodationsTitle })
          }
        />
        <Field
          label="Accommodations intro"
          value={text.pages.about.accommodationsIntro}
          multiline
          rows={3}
          onChange={(accommodationsIntro) =>
            patchPage("about", { ...text.pages.about, accommodationsIntro })
          }
        />
        <Field
          label="Accommodations outro"
          value={text.pages.about.accommodationsOutro}
          multiline
          rows={3}
          onChange={(accommodationsOutro) =>
            patchPage("about", { ...text.pages.about, accommodationsOutro })
          }
        />
        <Field
          label="Dining title"
          value={text.pages.about.diningTitle}
          onChange={(diningTitle) =>
            patchPage("about", { ...text.pages.about, diningTitle })
          }
        />
        <Field
          label="Dining intro"
          value={text.pages.about.diningIntro}
          multiline
          rows={3}
          onChange={(diningIntro) =>
            patchPage("about", { ...text.pages.about, diningIntro })
          }
        />
        <Field
          label="Dining outro"
          value={text.pages.about.diningOutro}
          multiline
          rows={3}
          onChange={(diningOutro) =>
            patchPage("about", { ...text.pages.about, diningOutro })
          }
        />
        <Field
          label="Welcome title"
          value={text.pages.about.welcomeTitle}
          onChange={(welcomeTitle) =>
            patchPage("about", { ...text.pages.about, welcomeTitle })
          }
        />
        <Field
          label="Welcome body"
          value={text.pages.about.welcomeBody}
          multiline
          rows={4}
          onChange={(welcomeBody) =>
            patchPage("about", { ...text.pages.about, welcomeBody })
          }
        />
      </Accordion>

      <Accordion
        id="cruises"
        openId={openId}
        setOpenId={setOpenId}
        title="Cruises"
        href={navHref("cruises")}
      >
        <Field
          label="Section title"
          value={text.pages.cruises.sectionTitle}
          onChange={(sectionTitle) =>
            patchPage("cruises", { ...text.pages.cruises, sectionTitle })
          }
        />
        <Field
          label="Continue exploring title"
          value={text.pages.cruises.continueTitle}
          onChange={(continueTitle) =>
            patchPage("cruises", { ...text.pages.cruises, continueTitle })
          }
        />
        <Field
          label="Continue exploring body"
          value={text.pages.cruises.continueBody}
          multiline
          rows={3}
          onChange={(continueBody) =>
            patchPage("cruises", { ...text.pages.cruises, continueBody })
          }
        />
      </Accordion>

      <Accordion
        id="highlights"
        openId={openId}
        setOpenId={setOpenId}
        title="Highlights"
        href={navHref("highlights")}
      >
        <Field
          label="Intro paragraphs"
          value={paragraphsToText(text.pages.highlights.intro)}
          multiline
          rows={6}
          onChange={(v) =>
            patchPage("highlights", {
              ...text.pages.highlights,
              intro: textToParagraphs(v),
            })
          }
        />
        {text.pages.highlights.landmarks.map((item, index) => (
          <div key={index} className="wt-card">
            <div className="wt-card__title">Landmark {index + 1}</div>
            <Field
              label="Title"
              value={item.title}
              onChange={(title) => {
                const landmarks = text.pages.highlights.landmarks.map((l, i) =>
                  i === index ? { ...l, title } : l,
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
                const landmarks = text.pages.highlights.landmarks.map((l, i) =>
                  i === index ? { ...l, body } : l,
                );
                patchPage("highlights", {
                  ...text.pages.highlights,
                  landmarks,
                });
              }}
            />
          </div>
        ))}
      </Accordion>

      <Accordion
        id="gastronomy"
        openId={openId}
        setOpenId={setOpenId}
        title="Gastronomy"
        href={navHref("gastronomy")}
      >
        <Field
          label="Intro paragraphs"
          value={paragraphsToText(text.pages.gastronomy.intro)}
          multiline
          rows={6}
          onChange={(v) =>
            patchPage("gastronomy", {
              ...text.pages.gastronomy,
              intro: textToParagraphs(v),
            })
          }
        />
        <Field
          label="Restaurant title"
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
            patchPage("gastronomy", { ...text.pages.gastronomy, atmosphere })
          }
        />
        <Field
          label="Closing"
          value={text.pages.gastronomy.closing}
          multiline
          rows={3}
          onChange={(closing) =>
            patchPage("gastronomy", { ...text.pages.gastronomy, closing })
          }
        />
        {text.pages.gastronomy.venues.map((venue, index) => (
          <div key={index} className="wt-card">
            <div className="wt-card__title">Venue {index + 1}</div>
            <Field
              label="Title"
              value={venue.title}
              onChange={(title) => {
                const venues = text.pages.gastronomy.venues.map((v, i) =>
                  i === index ? { ...v, title } : v,
                );
                patchPage("gastronomy", { ...text.pages.gastronomy, venues });
              }}
            />
            <Field
              label="Description"
              value={venue.description}
              multiline
              rows={2}
              onChange={(description) => {
                const venues = text.pages.gastronomy.venues.map((v, i) =>
                  i === index ? { ...v, description } : v,
                );
                patchPage("gastronomy", { ...text.pages.gastronomy, venues });
              }}
            />
          </div>
        ))}
      </Accordion>

      <Accordion
        id="wellness"
        openId={openId}
        setOpenId={setOpenId}
        title="Wellness"
        href={navHref("wellness")}
      >
        <Field
          label="Spa title"
          value={text.pages.wellness.spaTitle}
          onChange={(spaTitle) =>
            patchPage("wellness", { ...text.pages.wellness, spaTitle })
          }
        />
        <Field
          label="Spa paragraphs"
          value={paragraphsToText(text.pages.wellness.spaParagraphs)}
          multiline
          rows={8}
          onChange={(v) =>
            patchPage("wellness", {
              ...text.pages.wellness,
              spaParagraphs: textToParagraphs(v),
            })
          }
        />
        <Field
          label="Fitness title"
          value={text.pages.wellness.fitnessTitle}
          onChange={(fitnessTitle) =>
            patchPage("wellness", { ...text.pages.wellness, fitnessTitle })
          }
        />
        <Field
          label="Fitness body"
          value={text.pages.wellness.fitnessBody}
          multiline
          rows={4}
          onChange={(fitnessBody) =>
            patchPage("wellness", { ...text.pages.wellness, fitnessBody })
          }
        />
      </Accordion>

      <Accordion
        id="charter"
        openId={openId}
        setOpenId={setOpenId}
        title="Charter"
        href={navHref("charter")}
      >
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
          rows={3}
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
          label="Benefits (one per line)"
          value={text.pages.charter.benefits.join("\n")}
          multiline
          rows={5}
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
      </Accordion>

      <Accordion
        id="contact"
        openId={openId}
        setOpenId={setOpenId}
        title="Contact"
        href={navHref("contact")}
      >
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
          rows={3}
          onChange={(formIntro) =>
            patchPage("contact", { ...text.pages.contact, formIntro })
          }
        />
      </Accordion>

      <Accordion
        id="blog"
        openId={openId}
        setOpenId={setOpenId}
        title="Blog"
        href={navHref("blog")}
      >
        <Field
          label="Intro"
          value={text.pages.blog.intro}
          multiline
          rows={5}
          onChange={(intro) => patchPage("blog", { intro })}
        />
      </Accordion>

      <Accordion
        id="partners"
        openId={openId}
        setOpenId={setOpenId}
        title="Partners"
        href={navHref("partners")}
      >
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
          rows={3}
          onChange={(lead) =>
            patchPage("partners", { ...text.pages.partners, lead })
          }
        />
      </Accordion>

      <Accordion
        id="rooms"
        openId={openId}
        setOpenId={setOpenId}
        title="Rooms & Suites"
        href={navHref("rooms")}
      >
        <Field
          label="Overview title"
          value={text.pages.rooms.overviewTitle}
          onChange={(overviewTitle) =>
            patchPage("rooms", { ...text.pages.rooms, overviewTitle })
          }
        />
        <Field
          label="Overview intro"
          value={text.pages.rooms.overviewIntro}
          multiline
          rows={5}
          onChange={(overviewIntro) =>
            patchPage("rooms", { ...text.pages.rooms, overviewIntro })
          }
        />
      </Accordion>

      <Accordion
        id="cabins"
        openId={openId}
        setOpenId={setOpenId}
        title="Luxury Cabins"
        href={navHref("cabins")}
      >
        <Field
          label="Overview title"
          value={text.pages.cabins.overviewTitle}
          onChange={(overviewTitle) =>
            patchPage("cabins", { ...text.pages.cabins, overviewTitle })
          }
        />
        <Field
          label="Overview intro"
          value={text.pages.cabins.overviewIntro}
          multiline
          rows={5}
          onChange={(overviewIntro) =>
            patchPage("cabins", { ...text.pages.cabins, overviewIntro })
          }
        />
      </Accordion>

      <Accordion
        id="royal"
        openId={openId}
        setOpenId={setOpenId}
        title="Royal Suites"
        href={navHref("royal")}
      >
        <Field
          label="Overview title"
          value={text.pages.royal.overviewTitle}
          onChange={(overviewTitle) =>
            patchPage("royal", { ...text.pages.royal, overviewTitle })
          }
        />
        <Field
          label="Overview intro"
          value={text.pages.royal.overviewIntro}
          multiline
          rows={5}
          onChange={(overviewIntro) =>
            patchPage("royal", { ...text.pages.royal, overviewIntro })
          }
        />
      </Accordion>

      <div
        className={`wt-savebar${dirty ? " wt-savebar--dirty" : ""}`}
      >
        <p className="wt-savebar__status">
          {dirty
            ? "Unsaved text changes — click Save text to update the live site."
            : "Saved — live site matches this text."}
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
