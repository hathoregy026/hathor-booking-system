import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const testPath = path.join(
  process.cwd(),
  "public",
  "uploads",
  "admin-profile",
  "test-write.webp",
);

try {
  await mkdir(path.dirname(testPath), { recursive: true });
  await writeFile(testPath, Buffer.from("test"));
  console.log("local write ok:", testPath);
} catch (error) {
  console.error("local write failed:", error);
  process.exit(1);
}
