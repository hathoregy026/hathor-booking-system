import { NextResponse } from "next/server";
import { getCabinPriceTable } from "@/lib/cabin-prices";

/** Public cabin prices (Dashboard → Prices) for the cart and favourites, which live outside the page layouts. */
export async function GET() {
  const prices = await getCabinPriceTable();
  return NextResponse.json(
    { prices },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
  );
}
