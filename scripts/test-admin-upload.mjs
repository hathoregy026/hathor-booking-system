import "dotenv/config";
import { writeFileSync } from "fs";
import path from "path";

const baseUrl = process.env.TEST_URL ?? "http://localhost:3000";
const password = process.env.ADMIN_PASSWORD ?? "hathor@@@khattab00226";

const webpPath = path.join(process.cwd(), "public", "uploads", "admin-profile", "test-write.webp");
const fileBytes = writeFileSync.length ? null : null;

// minimal valid-enough webp header bytes
const webpBuffer = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x20, 0x18, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d,
  0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xa4, 0x00,
  0x03, 0x70, 0x00, 0xfe, 0xfb, 0xfd, 0x50, 0x00,
]);

const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});

const loginCookie = loginRes.headers.get("set-cookie") ?? "";
console.log("login:", loginRes.status, loginCookie ? "cookie ok" : "no cookie");

const form = new FormData();
form.append("folder", "admin-profile");
form.append(
  "file",
  new File([webpBuffer], "New Project.webp", { type: "image/webp" }),
);

const uploadRes = await fetch(`${baseUrl}/api/admin/upload`, {
  method: "POST",
  headers: loginCookie ? { Cookie: loginCookie.split(";")[0] } : {},
  body: form,
});

const uploadText = await uploadRes.text();
console.log("upload:", uploadRes.status, uploadText);

if (uploadRes.ok) {
  const { url } = JSON.parse(uploadText);
  const profileRes = await fetch(`${baseUrl}/api/admin/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: loginCookie.split(";")[0],
    },
    body: JSON.stringify({ avatarUrl: url, displayName: "Admin" }),
  });
  const profileText = await profileRes.text();
  console.log("profile:", profileRes.status, profileText.slice(0, 200));
}
