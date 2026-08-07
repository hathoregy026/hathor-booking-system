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
      <style>{`
        html, body { background: #ece8df !important; }
        .suites-springs-frame { background: #ece8df; }
      `}</style>
      <div
        className="public-site suites-public-nav"
        style={{ position: "relative", zIndex: 1500 }}
      >
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
          background: "#ece8df",
        }}
      />
    </>
  );
}
