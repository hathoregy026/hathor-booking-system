"use client";

import { TestScrollTransition } from "@/components/pages/TestScrollTransition";

export default function TestScrollRevealPage() {
  return (
    <TestScrollTransition
      title="Test Scroll Reveal"
      subtitle="Testing continuous creamy background"
      breadcrumb="Test"
      imageName="cruises-hero"
    >
      <section className="test-scroll-reveal__section">
        <div className="test-scroll-reveal__inner">
          <h2 className="test-scroll-reveal__heading">Section 1: Cream continues</h2>
          <p className="test-scroll-reveal__text">
            After the gold stripes and dome reveal, this creamy background should run
            seamlessly from the half-circle sheet all the way down the page.
          </p>
          <p className="test-scroll-reveal__text">Keep scrolling — no gaps, no other colors.</p>
        </div>
      </section>
      <section className="test-scroll-reveal__section">
        <div className="test-scroll-reveal__inner">
          <h2 className="test-scroll-reveal__heading">Section 2: Still cream</h2>
          <p className="test-scroll-reveal__text">
            The hero image stays fixed at the top during the reveal. Once the cream sheet
            rises, only #ece8df should remain as the page background.
          </p>
        </div>
      </section>
      <section className="test-scroll-reveal__section test-scroll-reveal__section--tail">
        <div className="test-scroll-reveal__inner">
          <h2 className="test-scroll-reveal__heading">Section 3: End of page</h2>
          <p className="test-scroll-reveal__text">
            Cream to the very bottom — one continuous surface from the dome transition
            through here.
          </p>
        </div>
      </section>
    </TestScrollTransition>
  );
}
