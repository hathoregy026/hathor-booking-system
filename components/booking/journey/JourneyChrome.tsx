"use client";

export type JourneyStep = 1 | 2 | 3 | 4;

const STEPS: { id: JourneyStep | 5; name: string }[] = [
  { id: 1, name: "Journey" },
  { id: 2, name: "Guests" },
  { id: 3, name: "Suites" },
  { id: 4, name: "Details & Payment" },
  { id: 5, name: "Request sent" },
];

/** Fine numbered stepper shared by every booking screen. */
export function JourneyProgress({
  step,
  onJump,
}: {
  step: JourneyStep | 5;
  onJump?: (step: JourneyStep) => void;
}) {
  return (
    <nav className="hj-progress" aria-label="Booking progress">
      {STEPS.map((entry, index) => {
        const canJump = Boolean(onJump) && entry.id < step && entry.id !== 5;
        const className = [
          "hj-progress__step",
          step === entry.id ? "hj-progress__step--on" : "",
          step > entry.id ? "hj-progress__step--done" : "",
        ].filter(Boolean).join(" ");
        const inner = (
          <>
            <span className="hj-progress__dot">{step > entry.id ? "✓" : entry.id}</span>
            <span className="hj-progress__name">{entry.name}</span>
          </>
        );
        return (
          <div key={entry.id} style={{ display: "contents" }}>
            {index > 0 ? <span className="hj-progress__line" aria-hidden /> : null}
            {canJump ? (
              <button
                type="button"
                className={className}
                aria-current={step === entry.id ? "step" : undefined}
                onClick={() => onJump?.(entry.id as JourneyStep)}
              >
                {inner}
              </button>
            ) : (
              <div className={className} aria-current={step === entry.id ? "step" : undefined}>
                {inner}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function PanelHead({
  step,
  of = 5,
  title,
  lede,
}: {
  step: number;
  of?: number;
  title: string;
  lede: string;
}) {
  return (
    <header className="hj-panel__head">
      <p className="hj-panel__kicker">Step {step} of {of}</p>
      <h1>{title}</h1>
      <p>{lede}</p>
    </header>
  );
}
