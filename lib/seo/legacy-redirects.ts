/**
 * Permanent redirects from the live www.hathorcruise.com URLs (recorded in
 * assets/RAW_DATA.md) to their pages in this rebuild, so the old site's
 * search rankings and inbound links carry over when the domain moves here.
 * Without them these addresses answer 404 and their rankings are lost.
 *
 * Never list a source that differs from its destination only by letter case:
 * redirect matching is case-insensitive in development, so it would loop. The
 * blog route sends mixed-case slugs to the post's own address instead.
 * `:` is escaped because it marks a parameter in `source`.
 * Kept free of path aliases: next.config.ts imports this file directly.
 */
export const LEGACY_HATHORCRUISE_REDIRECTS: ReadonlyArray<readonly [source: string, destination: string]> = [
  /* Old blog slugs → the rewritten posts on the same subject. */
  ["/blogs/Luxury-Travel-in-Egypt\\:-What-to-Expect-on-a-Dahabiya-Cruise", "/blogs/luxury-travel-in-egypt-what-to-expect-on-a-dahabiya-cruise"],
  ["/blogs/Sailing%20from%20Aswan%20to%20Luxor%20on%20a%20Dahabiya%20Nile%20Cruise", "/blogs/sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise"],
  ["/blogs/The-Difference-Between-a-Nile-Cruise-and-a-Dahabiya-Cruise", "/blogs/nile-cruise-or-luxury-dahabiya-which-one-to-choose"],
  ["/blogs/When-Is-the-Best-Time-to-Take-a-Dahabiya-Cruisein-Egypt", "/blogs/best-time-for-dahabiya-nile-cruise"],
  ["/blogs/aswan-high-dam-visit", "/blogs/aswan-high-dam"],
  ["/blogs/best-clothes-nile-cruise-weather-egypt", "/blogs/best-clothes-for-nile-cruise-weather-in-egypt"],
  ["/blogs/colossi-of-memnon-luxor", "/blogs/colossi-of-memnon"],
  ["/blogs/dahabiya-cruise-cost-explained", "/blogs/dahabiya-cruise-cost-explained-whats-included"],
  ["/blogs/dahabiya-hatshepsut-temple-experience", "/blogs/where-history-lives-the-temple-of-hatshepsut"],
  ["/blogs/dahabiya-nile-cruise-complete-beginner-guide", "/blogs/what-is-a-dahabiya-nile-cruise-complete-beginner-guide"],
  ["/blogs/east-bank-ancient-wonders-luxor", "/blogs/luxors-sacred-east-bank"],
  ["/blogs/egypt-greatest-landmarks-dahabiya", "/blogs/best-places-to-visit-along-the-nile-with-a-dahabiya-cruise"],
  ["/blogs/esna-nile-dahabiya-journey", "/blogs/exploring-esna-temples-history-nile-charm"],
  ["/blogs/explore-edfu-temple", "/blogs/discover-edfu-temple"],
  ["/blogs/explore-luxor-by-dahabiya", "/blogs/explore-luxor-in-luxury"],
  ["/blogs/exploring-luxor-aswan-luxury-dahabiya", "/blogs/exploring-luxor-and-aswan-on-a-luxury-dahabiya"],
  ["/blogs/hidden-gems-along-luxor-aswan", "/blogs/niles-hidden-gems-by-dahabiya"],
  ["/blogs/hidden-islands-nile-dahabiya-cruise", "/blogs/hidden-islands-you-can-only-see-on-a-dahabiya"],
  ["/blogs/history-of-dahabiya-boats-egypt", "/blogs/history-of-dahabiya-boats-in-egypt"],
  ["/blogs/how-dahabiya-different-from-nile-cruise", "/blogs/how-is-a-dahabiya-different-from-a-nile-cruise"],
  ["/blogs/how-to-choose-dahabiya-cabin", "/blogs/how-to-choose-the-right-cabin-on-a-dahabiya"],
  ["/blogs/is-it-safe-to-sail-the-nile", "/blogs/is-the-nile-safe-for-sailing-today"],
  ["/blogs/karnak-temple-guide-dahabiya-cruise", "/blogs/sailing-to-karnak-temple"],
  ["/blogs/kom-ombo-temple-hathor-dahabiya", "/blogs/kom-ombo-temple"],
  ["/blogs/luxor-temple-history", "/blogs/luxor-temple-facts"],
  ["/blogs/luxor-west-bank", "/blogs/discover-the-timeless-luxor-west-bank"],
  ["/blogs/nile-river-ancient-egypt-trade-route", "/blogs/why-the-nile-was-the-most-important-trade-route-in-ancient-egypt"],
  ["/blogs/nile-river-cruise-tips-first-time-travelers", "/blogs/tips-for-first-time-travelers-on-the-nile"],
  ["/blogs/philae-temple-aswan-attractions", "/blogs/discovering-the-secrets-of-philae-temple"],
  ["/blogs/relaxing-nile-cruise-egypt", "/blogs/the-most-relaxing-way-to-explore-egypt-sailing-the-nile"],
  ["/blogs/romantic-honeymoon-nile-cruise", "/blogs/5-quiet-nile-spots-for-stunning-honeymoon-captures"],
  ["/blogs/secret-spots-luxor-aswan-nile-cruise", "/blogs/secret-spots-between-luxor-and-aswan"],
  ["/blogs/sleeping-on-the-nile-river-experience", "/blogs/the-magic-of-sleeping-on-the-nile-river"],
  ["/blogs/slow-travel-egypt-nile-cruise", "/blogs/why-travelers-love-slow-travel-on-the-nile"],
  ["/blogs/top-attractions-in-aswan-egypt", "/blogs/golden-gems-of-aswan"],
  ["/blogs/unplugged-dahabiya-nile-cruise-egypt", "/blogs/unplugged-travel-no-wifi-experience-on-a-dahabiya"],
  ["/blogs/valley-of-the-kings-tour", "/blogs/discover-the-valley-of-the-kings"],
  ["/blogs/what-to-pack-for-dahabiya-nile-cruise", "/blogs/what-to-pack-for-a-dahabiya-nile-cruise"],

  /* New-build slugs found only in Search Console, not the old sitemap or archive. */
  ["/blogs/dahabiya-nile-cruise-itinerary", "/voyages"],
  ["/blogs/dahabiya-nile-cruise-luxor-to-aswan-vs-aswan-to-luxor", "/voyages"],
  ["/blogs/best-dahabiya-nile-cruise-for-families", "/blogs/what-is-the-best-dahabiya-nile-cruise"],
  ["/blogs/dahabiya-nile-cruise-price", "/blogs/dahabiya-cruise-cost-explained-whats-included"],
  ["/blogs/dahabiya-nile-cruise-inclusions-exclusions", "/blogs/dahabiya-cruise-cost-explained-whats-included"],

  /*
   * Old room-and-itinerary product pages → the page for that room type, or
   * the matching voyage. Route by what Google's indexed title leads with:
   * a route/duration-led title goes to the voyage; a room-class-led title
   * goes to the room page.
   */
  ["/rooms/Luxury-nile-sailing-Dahabiya", "/voyages/luxor-aswan-luxor"], // "7 night, 8 day ... Luxury King Bed"
  ["/rooms/dahabiya-sailing-cruise-from-Luxor-to-Aswan", "/voyages/luxor-aswan-luxor"], // "7-Night Dahabiya from Luxor to Aswan"
  ["/rooms/Luxury-nile-cruise-Luxor-Aswan-Luxor", "/voyages/luxor-aswan-luxor"], // "Luxury Suite : Luxor / Aswan / Luxor"
  ["/rooms/Luxury-King-Bed-Cabin-7-nights-8-days-Luxor-Aswan-Luxor", "/voyages/luxor-aswan-luxor"],
  ["/rooms/Luxury-Suite-7-N-8-D-Luxor-Aswan-Luxor", "/voyages/luxor-aswan-luxor"],
  ["/rooms/Luxury-Twin-Bed-7-N-8-D-Luxor-Aswan-Luxor", "/voyages/luxor-aswan-luxor"],
  ["/rooms/Luxury-small-boat-Nile-cruise", "/royal-suites"], // "Royal Nile Cruise | Panoramic Views | 3 Nights Aswan–Luxor"
  ["/rooms/Best-Dahabiya-Nile-cruise", "/royal-suites"], // "7 Nights 8 Days ... Dahabiya Royal Suite"
  ["/rooms/Best-nile-luxury-cruise", "/royal-suites"],
  ["/rooms/luxury-royal-suite-3nights-4days-Aswan-Luxor", "/royal-suites"],
  ["/rooms/luxury-royal-suite-7night-8-Days-Luxor-Aswan-Luxor", "/royal-suites"],
  ["/rooms/Luxury-small-boat-nile-cruise-price", "/voyages/aswan-to-luxor"], // "4-Day Dahabiya from Aswan to Luxor"
  ["/rooms/Dahabiya-Nile-cruise-Cairo-to-Aswan", "/voyages/aswan-to-luxor"],
  ["/rooms/Luxury-King-Bed-3-N-4-D-Aswan-Luxor", "/voyages/aswan-to-luxor"],
  ["/rooms/Luxury-Twin-Bed-3-N-4-D-Aswan-Luxor", "/voyages/aswan-to-luxor"],
  ["/rooms/Dahabiya-nile", "/voyages/luxor-to-aswan"], // "Hathor Luxury King Bed : Luxor / Aswan"
  ["/rooms/Luxury-Nile-Cruise-Cairo-to-Aswan", "/voyages/luxor-to-aswan"],
  ["/rooms/Luxury-King-Bed-4-N-5-D-Luxor-Aswan", "/voyages/luxor-to-aswan"],
  ["/rooms/Luxury-Suite-4-N-5-D-Luxor-Aswan", "/voyages/luxor-to-aswan"],
  ["/rooms/nile-sailing-cruise", "/luxury-cabins-Nile-Cruise"],
  ["/rooms/luxury-king-bed-cabin", "/luxury-cabins-Nile-Cruise"],
  ["/rooms/luxury-suite-3-nights-4-days-Luxor-Aswan", "/rooms"],
  ["/rooms/Traditional-Nile-River-boat", "/rooms"],

  /* Leftover WooCommerce product URL, still getting Search Console impressions. */
  ["/product/3-nights-itinerary-aswan-to-luxor-copy-copy-2", "/voyages/aswan-to-luxor"],

  /* Indexed on the old site with no same-slug post (the rest of that list is above). */
  ["/blogs/book-luxury-nile-cruise-room", "/blogs/how-to-choose-the-right-cabin-on-a-dahabiya"],

  /* Renamed pages. */
  ["/luxury-cabins", "/luxury-cabins-Nile-Cruise"], // the old site's own canonical for this page
  ["/luxury-royal-suites", "/royal-suites"],
  ["/page/dahabiya-hathor-deck%20plans", "/suites"], // no deck-plans page yet; repoint once one exists
  ["/our-partners", "/partners"],
  ["/page/terms-conditions", "/terms-and-conditions"],
  ["/checkout", "/cruises-list"], // not /booking — that path is blocked in robots.txt

  /* Old locale prefix duplicating the whole site in Search Console; strip it. */
  ["/en/:path*", "/:path*"],
];
