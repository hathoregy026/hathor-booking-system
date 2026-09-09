import { homeFourPreviewEnabled } from "@/lib/home-four-preview";
export const dynamic = "force-dynamic";
export async function GET() {
  const enabled=await homeFourPreviewEnabled();
  return Response.json({enabled},{status:enabled?200:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"}});
}
