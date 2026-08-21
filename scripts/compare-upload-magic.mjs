import https from "node:https";

function get(u) {
  return new Promise((resolve, reject) => {
    https
      .get(u, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }),
        );
      })
      .on("error", reject);
  });
}

function inspect(name, buf) {
  const hex = [...buf.subarray(0, 16)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  const isRiff = buf.toString("ascii", 0, 4) === "RIFF";
  const isWebp = buf.toString("ascii", 8, 12) === "WEBP";
  const hasFffd = hex.includes("ef bf bd");
  console.log(
    JSON.stringify({ name, bytes: buf.length, isRiff, isWebp, hasFffd, hex }),
  );
}

const broken =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-story-legacy-large/homepage-landmarks-scroll-nile-ship-photo-mrv6la7z.webp";
const signedOk =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/room-royal/luxury-rooms-royal-suite-aboard-hathor-dahabiya-mrv665t7.webp";
const nodeJpg =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/cruises-hero/homepage-cruises-luxury-dahabiya-cruise-on-the-nile-mrv3tc06.jpg";

inspect("broken-node-webp", (await get(broken)).buf);
inspect("ok-signed-webp", (await get(signedOk)).buf.subarray(0, 64));
inspect("ok-cruises-jpg", (await get(nodeJpg)).buf.subarray(0, 16));
