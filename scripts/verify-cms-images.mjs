import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

const html = await get(
  `https://hathor-booking-system.vercel.app/?t=${Date.now()}`,
);
const nextImgSupabase = (
  html.match(/_next\/image\?url=[^"']*supabase[^"']*/g) || []
).length;
const directSupabase = (
  html.match(/https:\/\/jgkmiettciwacrpcubil\.supabase\.co[^"'\s>]*/g) || []
).slice(0, 4);
const pageId = (html.match(/pageId=\\"([^\\"]+)\\"/) ||
  html.match(/pageId="([^"]+)"/) ||
  [])[1];

console.log(
  JSON.stringify(
    {
      pageId,
      nextImgSupabase,
      directCount: (
        html.match(/https:\/\/jgkmiettciwacrpcubil\.supabase\.co/g) || []
      ).length,
      directSample: directSupabase,
    },
    null,
    2,
  ),
);
