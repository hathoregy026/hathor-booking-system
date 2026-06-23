import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";

const baseUrl = "http://localhost:3000";
const password = process.env.ADMIN_PASSWORD ?? "";

const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});

const cookie = loginRes.headers.get("set-cookie")?.split(";")[0] ?? "";
console.log("login:", loginRes.status);

const webp = readFileSync(
  path.join(process.cwd(), "public", "uploads", "admin-profile", "test-write.webp"),
);
const dataUrl = `data:image/webp;base64,${webp.toString("base64")}`;

const profileRes = await fetch(`${baseUrl}/api/admin/profile`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookie,
  },
  body: JSON.stringify({
    displayName: "Admin",
    avatarUrl: dataUrl,
  }),
});

console.log("profile:", profileRes.status, (await profileRes.text()).slice(0, 120));
