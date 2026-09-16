"use client";

import { HathorBrandMark } from "@/components/booking/HathorBrandMark";
import { money } from "./model";

export type JourneyStep = 1 | 2 | 3 | 4;

const STEPS: { id: JourneyStep; name: string }[] = [
  { id: 1, name: "Journey" },
  { id: 2, name: "Cabin" },
  { id: 3, name: "Guest details" },
  { id: 4, name: "Deposit" },
];

/** The gold summary band. Completed steps are tappable to go back. */
export function JourneyBand({
  step,
  guests,
  dates,
  cabin,
  totalCents,
  onJump,
}: {
  step: JourneyStep;
  guests: string;
  dates: string;
  cabin: string;
  totalCents: number | null;
  onJump?: (step: JourneyStep) => void;
}) {
  const cell = (
    target: JourneyStep,
    label: string,
    value: string,
    options: { secondary?: boolean } = {},
  ) => {
    const canJump = Boolean(onJump) && target < step;
    const className = [
      "hj-band__cell",
      options.secondary ? "hj-band__cell--secondary" : "",
      step === target ? "hj-band__cell--active" : "",
    ].filter(Boolean).join(" ");

    const content = (
      <>
        <span className="hj-band__label">{label}</span>
        <span className="hj-band__value">{value}</span>
        {canJump ? <span className="hj-band__chev" aria-hidden>⌄</span> : null}
      </>
    );

    return canJump ? (
      <button type="button" className={className} onClick={() => onJump?.(target)}>{content}</button>
    ) : (
      <div className={className}>{content}</div>
    );
  };

  const payment = totalCents === null ? "—" : money(totalCents);

  return (
    <div className="hj-band" id="hj-band-top">
      {cell(1, "Step 1: Guests & dates", guests, { secondary: true })}
      {cell(1, "Dates", dates)}
      <div className="hj-band__mark">
        <HathorBrandMark variant="on-dark" className="hj-band__logo" />
      </div>
      {cell(2, "Step 2: Cabin selection", cabin)}
      {cell(step >= 4 ? 4 : 3, "Step 3: Details & payment", payment, { secondary: true })}
    </div>
  );
}

/** The four-step rail, mirrored from the approved layout. */
export function JourneyProgress({ step }: { step: JourneyStep | 5 }) {
  return (
    <nav className="hj-progress" aria-label="Booking progress">
      {STEPS.map((entry, index) => (
        <div key={entry.id} style={{ display: "contents" }}>
          {index > 0 ? <span className="hj-progress__line" aria-hidden /> : null}
          <div
            className={`hj-progress__step${step === entry.id ? " hj-progress__step--on" : ""}${step > entry.id ? " hj-progress__step--done" : ""}`}
            aria-current={step === entry.id ? "step" : undefined}
          >
            <span className="hj-progress__dot">{step > entry.id ? "✓" : String(entry.id).padStart(2, "0")}</span>
            <span className="hj-progress__name">{entry.name}</span>
          </div>
        </div>
      ))}
    </nav>
  );
}

export function PanelHead({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="hj-panel__head">
      <h1>{title}</h1>
      <p>{lede}</p>
      <div className="hj-ornament" aria-hidden><span>◆</span></div>
    </header>
  );
}

/** The same title treatment, used on the screens whose cards float free. */
export function PageHead({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="hj-panel__head" style={{ marginBottom: "1.1rem" }}>
      <h1>{title}</h1>
      <p>{lede}</p>
      <div className="hj-ornament" aria-hidden><span>◆</span></div>
    </header>
  );
}
