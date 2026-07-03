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
      <section className="py-20 bg-[#ece8df]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-serif mb-8 text-[#0a0a0a]">Section 1: Cream Background</h2>
          <p className="text-lg mb-4 text-[#0a0a0a]">This is dummy content to test the scroll. The background should be continuous creamy color #ece8df.</p>
          <p className="text-lg mb-4 text-[#0a0a0a]">Keep scrolling to see if there are any gaps.</p>
        </div>
      </section>
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-serif mb-8 text-white">Section 2: Dark Background</h2>
          <p className="text-lg mb-4 text-white">This is a dark section to test contrast and ensure no white gaps appear between sections.</p>
        </div>
      </section>
      <section className="py-20 bg-[#ece8df]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-serif mb-8 text-[#0a0a0a]">Section 3: Back to Cream</h2>
          <p className="text-lg mb-4 text-[#0a0a0a]">More dummy content. The transition between dark and cream should be seamless.</p>
        </div>
      </section>
    </TestScrollTransition>
  );
}
