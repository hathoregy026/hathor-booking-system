import { PublicNavbar } from "@/components/layout/PublicNavbar";

/**
 * Exact isolated Springs Homepage document, content-swapped for Hathor Suites.
 *
 * Springs owns its own document, scroll container and script lifecycle; mounting
 * the original markup inside the Hathor React page mutates all three and breaks
 * the source experience.
 */
export function SuitesSpringsHomepagePage() {
  return (
    <>
      {/*
        Match gastronomy iframe shell: do NOT raise z-index on .public-site.
        That class is min-height 100vh + cream background; a stacking context
        above the iframe paints a solid cream sheet over the Suites document.
        Header keeps z-index 1200 and stays above the fixed iframe (1000).
      */}
      <div className="public-site suites-public-nav">
        <PublicNavbar />
      </div>
      <iframe
        className="suites-springs-frame"
        src="/suites-springs/index.html"
        title="Hathor Suites"
        scrolling="auto"
        style={{
          border: 0,
          display: "block",
          height: "100dvh",
          inset: 0,
          position: "fixed",
          width: "100vw",
          zIndex: 1000,
        }}
      />
    </>
  );
}
