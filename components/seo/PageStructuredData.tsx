import { JsonLd } from "@/components/seo/JsonLd";
import { organizationNode, websiteNode } from "@/components/seo/SiteStructuredData";
import { seoAbsoluteUrl } from "@/lib/seo/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type PageStructuredDataProps = {
  path: string;
  name: string;
  description: string;
  breadcrumbs: readonly BreadcrumbItem[];
  image?: string;
  extra?: readonly Record<string, unknown>[];
};

export function breadcrumbList(path: string, items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${seoAbsoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: seoAbsoluteUrl(item.path),
    })),
  };
}

export function PageStructuredData({
  path,
  name,
  description,
  breadcrumbs,
  image,
  extra = [],
}: PageStructuredDataProps) {
  const pageUrl = seoAbsoluteUrl(path);
  const origin = seoAbsoluteUrl("/");

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${origin}#website` },
      about: { "@id": `${origin}#organization` },
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      primaryImageOfPage: image
        ? { "@type": "ImageObject", url: seoAbsoluteUrl(image) }
        : undefined,
    },
    breadcrumbList(path, breadcrumbs),
    ...extra,
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": graph,
      }}
    />
  );
}

export function boatTripNode(input: {
  path: string;
  name: string;
  description: string;
  departure: string;
  arrival: string;
}) {
  const origin = seoAbsoluteUrl("/");
  return {
    "@type": "BoatTrip",
    "@id": `${seoAbsoluteUrl(input.path)}#trip`,
    name: input.name,
    description: input.description,
    provider: { "@id": `${origin}#organization` },
    departureBoatTerminal: { "@type": "BoatTerminal", name: input.departure },
    arrivalBoatTerminal: { "@type": "BoatTerminal", name: input.arrival },
  };
}

export function serviceNode(input: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
}) {
  const origin = seoAbsoluteUrl("/");
  return {
    "@type": "Service",
    "@id": `${seoAbsoluteUrl(input.path)}#service`,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    provider: { "@id": `${origin}#organization` },
    areaServed: { "@type": "Country", name: "Egypt" },
  };
}

export function hotelRoomNode(input: {
  path: string;
  name: string;
  description: string;
  occupancy: number;
  floorSizeSqm: number;
}) {
  const origin = seoAbsoluteUrl("/");
  return {
    "@type": "HotelRoom",
    "@id": `${seoAbsoluteUrl(input.path)}#room`,
    name: input.name,
    description: input.description,
    occupancy: { "@type": "QuantitativeValue", value: input.occupancy },
    floorSize: {
      "@type": "QuantitativeValue",
      value: input.floorSizeSqm,
      unitCode: "MTK",
    },
    containedInPlace: { "@id": `${origin}#organization` },
  };
}

export { organizationNode, websiteNode };
