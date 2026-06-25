import Link from "next/link";
import { CruisesListing } from "@/components/public/CruisesListing";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

export const revalidate = 3600;

export default function CruisesPage() {
  return (
    <>
      <div className="lux-page-hero">
        <div className="lux-page-hero__pattern" aria-hidden />
        <div className="lux-container relative">
          <nav className="lux-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Cruises</span>
          </nav>
          <h1 className="lux-page-hero__title">Our Fleet</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-light text-[var(--public-muted)]">
            Discover Hathor&apos;s exclusive Dahabiya itineraries — intimate
            sailings, legendary ports, and uncompromising luxury.
          </p>
          <div className="lux-gold-line" />
        </div>
      </div>

      <div className="py-10">
        <CruisesListing cruises={HATHOR_CRUISES} />
      </div>
    </>
  );
}
