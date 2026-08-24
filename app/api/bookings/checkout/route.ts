import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This checkout has been retired. Please use /booking." },
    { status: 410 },
  );
}
