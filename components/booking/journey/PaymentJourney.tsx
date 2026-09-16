/** The request-to-confirmation journey, shared by the review and result screens. */

export type JourneyStage = 1 | 2 | 3 | 4 | 5 | 6;

const STAGES: { title: string; detail: string }[] = [
  { title: "Voyage selected", detail: "Journey, dates, guests and cabin chosen." },
  { title: "Request sent to Hathor", detail: "Your cabin is held while the team reviews it." },
  { title: "Hathor reviews and accepts", detail: "We verify the cabin and confirm the final quote." },
  { title: "Invoice and payment instructions", detail: "Sent by email for your preferred method." },
  { title: "Booking confirmed", detail: "Once Hathor has accepted and your payment is recorded." },
  { title: "Balance paid", detail: "Following the payment plan before departure." },
];

export function PaymentJourney({ current }: { current: JourneyStage }) {
  return (
    <ol className="hj-timeline">
      {STAGES.map((stage, index) => {
        const position = index + 1;
        const state = position < current ? "done" : position === current ? "now" : "next";
        return (
          <li key={stage.title} data-state={state}>
            <span className="hj-timeline__dot">{state === "done" ? "✓" : position}</span>
            <span>
              <strong>{stage.title}</strong>
              <span>{stage.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
