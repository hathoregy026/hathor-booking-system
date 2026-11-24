import { GUIDE_FAQ, GUIDE_INTRO, GUIDE_VOYAGES, guideUsd } from "@/lib/home-guide-content";
import { SEO_CONTACT, seoAbsoluteUrl } from "@/lib/seo/site";

/*
 * /llms.txt — a plain summary of Hathor for answer engines and assistants
 * that read a site before quoting it. Every line comes from the same modules
 * as the homepage guide and its FAQ structured data, so it can never state a
 * price, route or fact the site itself does not show.
 */
export const dynamic = "force-static";

function body(): string {
  const voyages = GUIDE_VOYAGES.map(
    (voyage) =>
      `- [${voyage.nightsLabel}, ${voyage.route}](${seoAbsoluteUrl(voyage.href)}): ${voyage.nights} nights / ${voyage.days} days, departs ${voyage.departureDay}s, from ${guideUsd(voyage.fromCents)} per cabin for the whole voyage`,
  ).join("\n");
  const faq = GUIDE_FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n");
  return `# Hathor Dahabiya

> Luxury dahabiya Nile cruise between Luxor and Aswan: 32 guests in twelve cabins and suites, three-, four- and seven-night voyages, booked directly with Hathor.

${GUIDE_INTRO}

## Voyages and prices

${voyages}

Prices are in US dollars, per cabin for the whole voyage, with taxes and service charges included. Suites and Royal Suites are priced above the cabins.

## Key pages

- [Sailing dates and prices](${seoAbsoluteUrl("/cruises-list")})
- [All voyages](${seoAbsoluteUrl("/voyages")})
- [Cabins and suites](${seoAbsoluteUrl("/luxury-cabins-Nile-Cruise")})
- [Private charter of the whole dahabiya](${seoAbsoluteUrl("/charter")})
- [Contact and reservations](${seoAbsoluteUrl("/contact")})

## Questions guests ask

${faq}

## Contact

- Email: ${SEO_CONTACT.email}
- Phone and WhatsApp: ${SEO_CONTACT.telephoneDisplay}
- Office: ${SEO_CONTACT.streetAddress}, ${SEO_CONTACT.addressLocality}, Egypt
`;
}

export function GET(): Response {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
