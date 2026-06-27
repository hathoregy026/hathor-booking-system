"use client";

export type HistoriaBookingStep = 1 | 2 | 3 | 4;

const STEPS: { number: HistoriaBookingStep; label: string }[] = [
  { number: 1, label: "Adults & Children" },
  { number: 2, label: "Dates" },
  { number: 3, label: "Cabin & Suite Selection" },
  { number: 4, label: "Confirmation Details" },
];

type BookingProgressBarProps = {
  currentStep: HistoriaBookingStep;
};

export function BookingProgressBar({ currentStep }: BookingProgressBarProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav className="hathor-booking-progress" aria-label="Booking progress">
      <div className="hathor-booking-progress__track" aria-hidden>
        <div
          className="hathor-booking-progress__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="hathor-booking-progress__steps">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <li
              key={step.number}
              className={`hathor-booking-progress__step${
                isActive ? " hathor-booking-progress__step--active" : ""
              }${isComplete ? " hathor-booking-progress__step--complete" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="hathor-booking-progress__marker" aria-hidden>
                {isComplete ? "✓" : step.number}
              </span>
              <span className="hathor-booking-progress__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
