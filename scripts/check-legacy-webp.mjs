import https from "node:https";
import fs from "node:fs";

const url =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-story-legacy-large/homepage-landmarks-scroll-nile-ship-photo-mrv6la7z.webp";

function get(u) {
  return new Promise((resolve, reject) => {
    https
      .get(u, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buf: Buffer.concat(chunks),
          }),
        );
      })
      .on("error", reject);
  });
}

const { status, headers, buf } = await get(url);
const magic = buf.subarray(0, 12).toString("ascii");
const isRiff = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
const isWebp =
  buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
console.log(
  JSON.stringify(
    {
      status,
      contentType: headers["content-type"],
      contentLengthHeader: headers["content-length"],
      bytes: buf.length,
      isRiff,
      isWebp,
      magicHex: [...buf.subarray(0, 16)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
      magicAscii: magic.replace(/[^\x20-\x7e]/g, "."),
    },
    null,
    2,
  ),
);
fs.writeFileSync("scripts/out-legacy-check.webp", buf);
