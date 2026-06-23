import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DATA_PATH = path.join(__dirname, "../assets/RAW_DATA.md");

const SITE_SECTIONS = [
  "HERO",
  "ABOUT",
  "WELLNESS",
  "GASTRONOMY",
  "CHARTER",
  "CONTACT",
];

function getConnectionString() {
  return (
    process.env.DATABASE_URL ??
    process.env.DATABASE_DIRECT_URL ??
    process.env.DIRECT_URL
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function query(sql, params = []) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const client = new pg.Client({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 60_000,
      application_name: "hathor-seed-raw-content",
    });
    client.on("error", () => {});
    try {
      await client.connect();
      const result = await client.query(sql, params);
      await client.end();
      return result;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      if (attempt < 3) {
        await sleep(attempt * 1000);
      }
    }
  }
  throw lastError;
}

function createId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 25);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractPage(markdown, pageTitle) {
  const pattern = new RegExp(
    `# 🌐 PAGE: ${escapeRegex(pageTitle)}([\\s\\S]*?)(?=\\n# 🌐 PAGE:|\\n# 📋 GLOBAL|$)`,
  );
  return markdown.match(pattern)?.[1] ?? "";
}

function extractSection(pageMarkdown, sectionTitle) {
  const pattern = new RegExp(
    `## 📍 SECTION: ${escapeRegex(sectionTitle)}([\\s\\S]*?)(?=\\n## 📍 SECTION:|\\n# 🌐 PAGE:|\\n# 📋 GLOBAL|$)`,
  );
  return pageMarkdown.match(pattern)?.[1] ?? "";
}

function extractContentLines(block) {
  return [...block.matchAll(/- \*\*Content:\*\* (.+)/g)].map((match) =>
    match[1].trim(),
  );
}

function joinBody(lines) {
  return lines.join("\n\n");
}

function firstContent(block) {
  return extractContentLines(block)[0] ?? "";
}

function secondContent(block) {
  return extractContentLines(block)[1] ?? null;
}

function buildSiteContentFromRaw(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const homepage = extractPage(normalized, "Homepage");
  const heroBlock = extractSection(
    homepage,
    "Hero Section (Slider — Slide 1 & 2)",
  );

  const aboutPage = extractPage(normalized, "About Us");
  const wellnessPage = extractPage(normalized, "Wellness");
  const gastronomyPage = extractPage(normalized, "Gastronomy");
  const charterPage = extractPage(normalized, "Charter Dahabiya Cruise");
  const contactPage = extractPage(normalized, "Contact Us");

  const wellnessBody = joinBody([
    ...extractContentLines(extractSection(wellnessPage, "Hero Section — Seneb Spa")),
    ...extractContentLines(
      extractSection(wellnessPage, "Historia Fitness Center"),
    ),
  ]);

  const gastronomyBody = joinBody([
    ...extractContentLines(extractSection(gastronomyPage, "Hero Section")),
    ...extractContentLines(
      extractSection(gastronomyPage, "Hathor Dahabiya Restaurant"),
    ),
  ]);

  const charterOverview = extractSection(charterPage, "Charter Overview");
  const charterBody = joinBody(extractContentLines(charterOverview));

  const contactBody = joinBody([
    ...extractContentLines(extractSection(contactPage, "Hero Section")),
    ...extractContentLines(extractSection(contactPage, "Contact Information")),
    ...extractContentLines(extractSection(contactPage, "Contact Form")),
  ]);

  const aboutIntro = extractSection(aboutPage, "Hero / Introduction");
  const aboutAccommodations = extractSection(aboutPage, "Our Accommodations");
  const aboutCabin = extractSection(aboutPage, "Cabin Experience");
  const aboutSuite = extractSection(aboutPage, "Suite Experience");
  const aboutRoyal = extractSection(aboutPage, "Royal Suite Experience");
  const aboutDining = extractSection(aboutPage, "Dining & Entertainment");

  const aboutBody = joinBody([
    ...extractContentLines(aboutIntro),
    ...extractContentLines(aboutAccommodations),
    ...extractContentLines(aboutCabin),
    ...extractContentLines(aboutSuite),
    ...extractContentLines(aboutRoyal),
    ...extractContentLines(aboutDining),
  ]);

  return {
    HERO: {
      title: firstContent(heroBlock),
      subtitle: secondContent(heroBlock),
      bodyText: joinBody(extractContentLines(heroBlock).slice(2)),
      imageUrl: null,
    },
    ABOUT: {
      title: firstContent(aboutIntro) || "Welcome Aboard Hathor Dahabiya Cruise",
      subtitle: "Dahabiya Nile Cruise Egypt | Luxury Sailing on the Nile",
      bodyText: aboutBody,
      imageUrl: null,
    },
    WELLNESS: {
      title: "A Floating Oasis of Wellness: Seneb Spa on the Nile",
      subtitle: "Renew Your Soul",
      bodyText: wellnessBody,
      imageUrl: null,
    },
    GASTRONOMY: {
      title: firstContent(extractSection(gastronomyPage, "Hero Section")),
      subtitle: "Hathor Flavors",
      bodyText: gastronomyBody,
      imageUrl: null,
    },
    CHARTER: {
      title: firstContent(extractSection(charterPage, "Hero Section")),
      subtitle: "Charter Your Own Luxury Dahabiya",
      bodyText: charterBody,
      imageUrl: null,
    },
    CONTACT: {
      title: firstContent(extractSection(contactPage, "Hero Section")),
      subtitle: "We would love to Hear from You",
      bodyText: contactBody,
      imageUrl: null,
    },
  };
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePublishedAt(dateLabel) {
  const parsed = new Date(`${dateLabel.trim()} UTC`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid blog date: ${dateLabel}`);
  }
  return parsed.toISOString();
}

function parseBlogPosts(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const blogSection = extractSection(
    extractPage(normalized, "Blog"),
    "Blog Post Grid",
  );

  const cardPattern =
    /### 🧩 COMPONENT: Blog Card — Post \d+\n- \*\*Content:\*\* (.+)\n- \*\*Context\/Notes:\*\* .+?\| Date: ([^|]+) \| .+?\| Excerpt: (.+?) \| CTA:/g;

  const posts = [];
  for (const match of blogSection.matchAll(cardPattern)) {
    const title = match[1].trim();
    const publishedAt = parsePublishedAt(match[2]);
    const excerpt = match[3].trim();
    const slug = slugify(title);

    posts.push({
      title,
      slug,
      excerpt,
      publishedAt,
    });
  }

  return posts;
}

async function ensureContentSections() {
  const existing = await query(
    `SELECT e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     WHERE t.typname = 'ContentSection'`,
  );
  const labels = new Set(existing.rows.map((row) => row.enumlabel));

  for (const value of SITE_SECTIONS) {
    if (!labels.has(value)) {
      await query(
        `ALTER TYPE "ContentSection" ADD VALUE IF NOT EXISTS '${value}'`,
      );
    }
  }
}

async function upsertSiteContent(section, content) {
  const existing = await query(
    `SELECT id FROM "SiteContent" WHERE section = $1::"ContentSection" LIMIT 1`,
    [section],
  );

  if (existing.rows[0]?.id) {
    await query(
      `UPDATE "SiteContent"
       SET title = $2,
           subtitle = $3,
           "bodyText" = $4,
           "imageUrl" = $5,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [
        existing.rows[0].id,
        content.title,
        content.subtitle,
        content.bodyText,
        content.imageUrl,
      ],
    );
  } else {
    await query(
      `INSERT INTO "SiteContent"
        (id, section, title, subtitle, "bodyText", "imageUrl", "createdAt", "updatedAt")
       VALUES ($1, $2::"ContentSection", $3, $4, $5, $6, NOW(), NOW())`,
      [
        createId(),
        section,
        content.title,
        content.subtitle,
        content.bodyText,
        content.imageUrl,
      ],
    );
  }
}

async function upsertBlogPost(post) {
  const existing = await query(
    `SELECT id FROM "BlogPost" WHERE slug = $1 LIMIT 1`,
    [post.slug],
  );

  if (existing.rows[0]?.id) {
    await query(
      `UPDATE "BlogPost"
       SET title = $2,
           excerpt = $3,
           content = $4,
           "publishedAt" = $5,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [existing.rows[0].id, post.title, post.excerpt, "", post.publishedAt],
    );
  } else {
    await query(
      `INSERT INTO "BlogPost"
        (id, slug, title, excerpt, content, "publishedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        createId(),
        post.slug,
        post.title,
        post.excerpt,
        "",
        post.publishedAt,
      ],
    );
  }
}

try {
  const markdown = fs.readFileSync(RAW_DATA_PATH, "utf8");
  const siteContent = buildSiteContentFromRaw(markdown);
  const blogPosts = parseBlogPosts(markdown);

  if (blogPosts.length !== 44) {
    throw new Error(`Expected 44 blog posts, parsed ${blogPosts.length}`);
  }

  const slugSet = new Set();
  for (const post of blogPosts) {
    if (slugSet.has(post.slug)) {
      throw new Error(`Duplicate blog slug: ${post.slug}`);
    }
    slugSet.add(post.slug);
  }

  console.log("Ensuring ContentSection enum values...");
  await ensureContentSections();

  console.log("Seeding SiteContent from RAW_DATA.md...");
  for (const section of SITE_SECTIONS) {
    await upsertSiteContent(section, siteContent[section]);
    console.log(`  ✓ ${section}`);
  }

  console.log("Seeding BlogPost records...");
  for (const post of blogPosts) {
    await upsertBlogPost(post);
  }
  console.log(`  ✓ ${blogPosts.length} blog posts`);

  console.log("RAW_DATA content seed completed successfully.");
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
