import { PublicNavbar } from "@/components/layout/PublicNavbar";

/**
 * Exact isolated Springs Design document.
 *
 * Springs owns its own document, scroll container and script lifecycle; mounting
 * the original markup inside the Hathor React page mutates all three and breaks
 * the source experience.
 */
export function GastronomySpringsDesignPage() {
  return (
    <>
      <div className="public-site gastronomy-public-nav">
        <PublicNavbar />
      </div>
      <iframe
        className="gastronomy-springs-frame"
        src="/gastronomy-springs/design/index.html"
        title="Private Dining"
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
