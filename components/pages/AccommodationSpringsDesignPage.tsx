import { PublicNavbar } from "@/components/layout/PublicNavbar";

type AccommodationSpringsDesignPageProps = {
  frameSrc: string;
  title: string;
};

/**
 * Isolated Springs Design document for accommodation storytelling.
 *
 * Springs owns its own document, scroll container and script lifecycle; the
 * Hathor public shell only supplies the shared navbar above the iframe.
 */
export function AccommodationSpringsDesignPage({
  frameSrc,
  title,
}: AccommodationSpringsDesignPageProps) {
  return (
    <>
      <div className="public-site">
        <PublicNavbar />
      </div>
      <iframe
        className="accommodation-springs-frame"
        src={frameSrc}
        title={title}
        scrolling="auto"
        data-public-nav-scroll-root=""
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
