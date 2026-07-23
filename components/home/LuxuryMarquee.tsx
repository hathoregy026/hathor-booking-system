import "./luxury-marquee.css";

const MARQUEE_PHRASES = [
  { text: "HATHOR", tone: "upper" },
  { text: "Ultra Luxury", tone: "italic" },
  { text: "DAHABIYA", tone: "upper" },
  { text: "Private Sailing", tone: "italic" },
  { text: "Luxor to Aswan", tone: "italic" },
  { text: "Fine Dining", tone: "italic" },
  { text: "Exclusive Suites", tone: "italic" },
  { text: "Timeless Elegance", tone: "italic" },
] as const;

function MarqueeGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <span className="luxury-marquee__group" aria-hidden={ariaHidden || undefined}>
      {MARQUEE_PHRASES.map((phrase) => (
        <span
          key={`${phrase.text}-${phrase.tone}`}
          className={`luxury-marquee__item luxury-marquee__item--${phrase.tone}`}
        >
          <span>{phrase.text}</span>
          <span className="luxury-marquee__divider" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </span>
  );
}

export function LuxuryMarquee() {
  return (
    <div className="luxury-marquee" aria-hidden="true">
      <div className="luxury-marquee__track">
        <MarqueeGroup />
        <MarqueeGroup ariaHidden />
      </div>
    </div>
  );
}
