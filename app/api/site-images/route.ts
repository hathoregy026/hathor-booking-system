import { NextRequest, NextResponse } from "next/server";
import { getActiveSiteImages, getSiteImageByName } from "@/lib/image-management";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const name = searchParams.get("name");
    const pagePath = searchParams.get("pagePath");
    const category = searchParams.get("category") ?? undefined;

    if (name) {
      const image = await getSiteImageByName(name);
      return NextResponse.json({ image });
    }

    if (pagePath) {
      const images = await getActiveSiteImages(pagePath, category);
      return NextResponse.json({ images });
    }

    return NextResponse.json(
      { error: "Provide name or pagePath query parameter" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json({ images: [], image: null }, { status: 200 });
  }
}
