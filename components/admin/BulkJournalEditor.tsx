"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";
import type { BulkEmailTemplate, BulkJournalTemplate } from "@/lib/bulk-email-types";
import { BULK_JOURNAL_DEFAULTS, BULK_JOURNAL_IMAGE_PATHS } from "@/lib/bulk-email-journal";
import { bulkBannerPreviewSrc } from "@/lib/bulk-email-images";

export type BulkJournalImageSlot = "hero" | "introImage" | "galleryMainImage" | "galleryUpperImage" | "galleryLowerImage";

/** Grow with both the text and the available width, without clipping long copy. */
export function BulkGrowingTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    function resize() {
      if (!element) return;
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
    }
    resize();
    let previousWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== previousWidth) { previousWidth = element.clientWidth; resize(); }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [props.value]);
  return <textarea {...props} ref={field} className={`input bulk-emails__growing-field ${props.className || ""}`} />;
}

export type BulkFieldIssues = Record<string, string>;
export const bulkInvalidProps = (issues: BulkFieldIssues, id: string) => issues[id] ? { "aria-invalid": true, "aria-describedby": `${id}-issue` } : {};
export function BulkFieldMessage({ issues, id }: { issues: BulkFieldIssues; id: string }) {
  return issues[id] ? <p className="bulk-emails__field-issue" id={`${id}-issue`}>{issues[id]}</p> : null;
}

export function BulkJournalEditor({ template, message, disabled, issues, onTemplate, onMessage, onUpload, onReset }: {
  template: BulkEmailTemplate & { journal: BulkJournalTemplate };
  message: string;
  disabled: boolean;
  issues: BulkFieldIssues;
  onTemplate: (changes: Partial<BulkEmailTemplate>) => void;
  onMessage: (value: string) => void;
  onUpload: (file: File, slot: BulkJournalImageSlot) => void;
  onReset: () => void;
}) {
  const journal = template.journal;
  function update(changes: Partial<BulkJournalTemplate>) { onTemplate({ journal: { ...journal, ...changes } }); }
  function text(id: string, label: string, value: string, maximum: number, onChange: (value: string) => void, rows = 1, required = false) {
    return <div key={id}><label className={`bulk-emails__label${required ? " bulk-emails__label--required" : ""}`} htmlFor={id}>{label}</label><BulkGrowingTextarea id={id} rows={rows} maxLength={maximum} value={value} disabled={disabled} required={required} {...bulkInvalidProps(issues, id)} onChange={event => onChange(event.target.value)} /><BulkFieldMessage issues={issues} id={id} /></div>;
  }
  function image(slot: BulkJournalImageSlot, label: string) {
    const hero = slot === "hero";
    const settings = hero ? { show: template.showBanner, url: template.heroImageUrl, alt: "Hathor — a journey through Egypt" } : journal[slot];
    const defaultUrl = BULK_JOURNAL_IMAGE_PATHS[slot];
    const source = bulkBannerPreviewSrc(settings.url || defaultUrl);
    return <fieldset className="bulk-emails__journal-image" key={slot}>
      <legend>{label}</legend>
      <label className="bulk-emails__confirmation"><input type="checkbox" checked={settings.show} disabled={disabled} onChange={event => hero ? onTemplate({ showBanner: event.target.checked }) : update({ [slot]: { ...settings, show: event.target.checked } })} /><span>Show {label.toLowerCase()}</span></label>
      <div className="bulk-emails__banner">{settings.show && source ? <img src={source} alt={settings.alt} /> : <p className="bulk-emails__hint">This image is turned off.</p>}
        <div className="bulk-emails__banner-change"><label className="btn-outline" htmlFor={`bulk-image-${slot}`}>Replace image</label><input id={`bulk-image-${slot}`} aria-label={`Replace ${label.toLowerCase()}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file, slot); event.target.value = ""; }} /></div>
      </div>
      <p className="bulk-emails__hint">JPG, PNG or WebP, up to 2 MB.{hero && " The banner includes its title artwork. Replace the image to change it."}</p>
      {!hero && text(`bulk-image-alt-${slot}`, "Image description", settings.alt, 500, value => update({ [slot]: { ...settings, alt: value } }))}
      <button className="bulk-emails__text-button" type="button" disabled={disabled} onClick={() => hero ? onTemplate({ heroImageUrl: undefined, showBanner: true }) : update({ [slot]: { ...BULK_JOURNAL_DEFAULTS[slot], show: true } })}>Use reference image</button>
    </fieldset>;
  }
  function button(key: "discoverButton" | "journeyButton", title: string) {
    const button = journal[key];
    return <fieldset className="bulk-emails__journal-button"><legend>{title}</legend>
      {text(`bulk-${key}-label`, "Button label", button.label, 500, label => update({ [key]: { ...button, label } }))}
      <label className="bulk-emails__label" htmlFor={`bulk-${key}-url`}>Button destination</label><input id={`bulk-${key}-url`} className="input" type="url" maxLength={4096} value={button.url} placeholder="https://hathorcruise.com/" disabled={disabled} {...bulkInvalidProps(issues, `bulk-${key}-url`)} onChange={event => update({ [key]: { ...button, url: event.target.value } })} /><BulkFieldMessage issues={issues} id={`bulk-${key}-url`} />
      <p className="bulk-emails__hint">Enter a full HTTPS link. Leave the destination empty to hide this button.</p>
    </fieldset>;
  }
  return <details className="bulk-emails__template-editor" open><summary>Customize this email template</summary>
    <p className="bulk-emails__hint">Edit the journal in the same order as the email. Each image can be replaced or turned off. Text fields grow as you write.</p>
    <section className="bulk-emails__journal-section" data-bulk-focus="hero"><h3>Journal masthead and banner</h3>
      {text("bulk-masthead-label", "Journal label", journal.mastheadLabel, 500, mastheadLabel => update({ mastheadLabel }))}
      {text("bulk-masthead-location", "Location line", journal.mastheadLocation, 500, mastheadLocation => update({ mastheadLocation }))}
      {image("hero", "Hero banner")}
    </section>
    <section className="bulk-emails__journal-section" data-bulk-focus="intro"><h3>The Nile, in private</h3>
      {text("bulk-eyebrow", "Small introduction line", template.eyebrow, 500, eyebrow => onTemplate({ eyebrow }))}
      {text("bulk-heading", "Introduction heading", template.heading, 500, heading => onTemplate({ heading }), 2)}
      {text("bulk-message", "Introduction message", message, 12000, onMessage, 5, true)}
      <p className="bulk-emails__hint">{message.length.toLocaleString()} / 12,000 characters · Your line breaks are preserved.</p>
      {button("discoverButton", "Discover button")}
      {image("introImage", "Dining image")}
    </section>
    <section className="bulk-emails__journal-section" data-bulk-focus="features"><h3>Four moments aboard</h3>
      {journal.features.map((feature, index) => <fieldset className="bulk-emails__journal-feature" key={index}><legend>0{index + 1}</legend>
        {text(`bulk-feature-${index}-title`, "Title", feature.title, 500, title => update({ features: journal.features.map((item, i) => i === index ? { ...item, title } : item) as BulkJournalTemplate["features"] }))}
        {text(`bulk-feature-${index}-body`, "Description", feature.body, 12000, body => update({ features: journal.features.map((item, i) => i === index ? { ...item, body } : item) as BulkJournalTemplate["features"] }), 2)}
      </fieldset>)}
    </section>
    <section className="bulk-emails__journal-section" data-bulk-focus="gallery"><h3>The art of being here</h3>
      {text("bulk-gallery-heading", "Gallery heading", journal.galleryHeading, 500, galleryHeading => update({ galleryHeading }), 2)}
      {text("bulk-gallery-body", "Gallery description", journal.galleryBody, 12000, galleryBody => update({ galleryBody }), 3)}
      {image("galleryMainImage", "Suite image")}
      {image("galleryUpperImage", "Sailing image")}
      {image("galleryLowerImage", "Bar image")}
      {text("bulk-gallery-caption", "Gallery caption", journal.galleryCaption, 500, galleryCaption => update({ galleryCaption }))}
    </section>
    <section className="bulk-emails__journal-section" data-bulk-focus="journey"><h3>Make it your journey</h3>
      {text("bulk-journey-heading", "Journey heading", journal.journeyHeading, 500, journeyHeading => update({ journeyHeading }), 2)}
      {text("bulk-journey-body", "Journey description", journal.journeyBody, 12000, journeyBody => update({ journeyBody }), 3)}
      {button("journeyButton", "Voyages button")}
    </section>
    <section className="bulk-emails__journal-section" data-bulk-focus="footer"><h3>Signature and footer</h3>
      {text("bulk-signature", "Signature", template.signature || "", 2000, signature => onTemplate({ signature }), 3)}
      <p className="bulk-emails__hint">Optional. An empty field hides its line.</p>
      {([ ["tagline", "Footer tagline", 120], ["email", "Footer email address", 120], ["phone", "Footer phone", 60], ["replyNote", "Footer reply note", 300], ["copyright", "Footer copyright", 120] ] as const).map(([key, label, maximum]) => text(`bulk-footer-${key}`, label, template.footer[key], maximum, value => onTemplate({ footer: { ...template.footer, [key]: value } })))}
      {text("bulk-footer-address", "Postal address", journal.address, 2000, address => update({ address }), 3)}
      {text("bulk-preferences-label", "Email preferences label", journal.preferencesLabel, 500, preferencesLabel => update({ preferencesLabel }))}
      <label className="bulk-emails__label" htmlFor="bulk-preferences-url">Email preferences destination</label><input id="bulk-preferences-url" className="input" type="url" maxLength={4096} value={journal.preferencesUrl} disabled={disabled} placeholder="https://hathorcruise.com/" {...bulkInvalidProps(issues, "bulk-preferences-url")} onChange={event => update({ preferencesUrl: event.target.value })} /><BulkFieldMessage issues={issues} id="bulk-preferences-url" />
      <p className="bulk-emails__hint">Enter a full HTTPS link, or leave empty to hide preferences. The unsubscribe link remains available. Use {"{year}"} for the current year.</p>
    </section>
    <button className="bulk-emails__text-button" type="button" disabled={disabled} onClick={onReset}>Reset template to Hathor defaults</button>
  </details>;
}
