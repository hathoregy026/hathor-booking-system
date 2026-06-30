/**
 * Scrapes full blog article HTML from hathorcruise.com via Playwright.
 * Preserves headings, lists, images, and internal blog links.
 *
 * Outputs:
 *   scripts/data/blog-posts-content.json
 *   scripts/data/blog-internal-links.json
 *
 * Run: node scripts/scrape-blog-posts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DATA_PATH = path.join(__dirname, "../assets/RAW_DATA.md");
const OUTPUT_PATH = path.join(__dirname, "./data/blog-posts-content.json");
const LINK_MAP_PATH = path.join(__dirname, "./data/blog-internal-links.json");

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(segment);
  } catch {
    return "";
  }
}

function parsePublishedAt(dateLabel) {
  const parsed = new Date(`${dateLabel.trim()} UTC`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid blog date: ${dateLabel}`);
  }
  return parsed.toISOString();
}

function parseBlogMetadata(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const blogSection = normalized.split("# 🌐 PAGE: Blog")[1];
  if (!blogSection) {
    throw new Error("Blog section not found in RAW_DATA.md");
  }

  const cardPattern =
    /### 🧩 COMPONENT: Blog Card — Post \d+\n- \*\*Content:\*\* (.+)\n- \*\*Context\/Notes:\*\* Author: ([^|]+) \| Date: ([^|]+) \| URL: ([^\s|]+) \| Excerpt: (.+?) \| CTA:/g;

  const posts = [];
  for (const match of blogSection.matchAll(cardPattern)) {
    const title = match[1].trim();
    const author = match[2].trim();
    const publishedAt = parsePublishedAt(match[3]);
    const sourceUrl = match[4].trim();
    const excerpt = match[5].trim();

    posts.push({
      slug: slugify(title),
      urlSlug: slugFromUrl(sourceUrl),
      title,
      excerpt,
      author,
      publishedAt,
      sourceUrl,
    });
  }

  if (posts.length !== 44) {
    throw new Error(`Expected 44 blog posts in RAW_DATA.md, parsed ${posts.length}`);
  }

  return posts;
}

function buildSlugMaps(metadata) {
  const urlSlugToAppSlug = new Map();

  for (const post of metadata) {
    const variants = new Set([
      post.urlSlug,
      decodeURIComponent(post.urlSlug),
      post.urlSlug.toLowerCase(),
      decodeURIComponent(post.urlSlug).toLowerCase(),
      slugify(post.urlSlug),
      slugify(decodeURIComponent(post.urlSlug)),
    ]);

    for (const variant of variants) {
      if (variant) {
        urlSlugToAppSlug.set(variant.toLowerCase(), post.slug);
      }
    }
  }

  return urlSlugToAppSlug;
}

function normalizeBlogHref(href, slugMap) {
  if (!href) return href;

  try {
    let pathname = href;
    if (/^https?:\/\//i.test(href)) {
      const url = new URL(href);
      if (!url.hostname.includes("hathorcruise.com")) {
        return href;
      }
      pathname = url.pathname;
    }

    const match = pathname.match(/\/blogs\/([^/?#]+)/i);
    if (!match) {
      return href;
    }

    const sourceSlug = decodeURIComponent(match[1]).toLowerCase();
    const appSlug =
      slugMap.get(sourceSlug) ??
      slugMap.get(slugify(sourceSlug)) ??
      slugify(sourceSlug);

    return `/blogs/${appSlug}`;
  } catch {
    return href;
  }
}

function normalizeImageSrc(src) {
  if (!src) return src;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `https://www.hathorcruise.com${src}`;
  return src;
}

function processArticleHtml(html, slugMap) {
  const $ = cheerio.load(`<div id="blog-root">${html}</div>`, null, false);
  const root = $("#blog-root");

  root.find("script, iframe, style, form, button, noscript").remove();

  root.find("h1").remove();

  root.find("h2, h3, h4").each((_, element) => {
    const $heading = $(element);
    const text = $heading.text().replace(/\u00a0/g, " ").trim();
    const hasImage = $heading.find("img").length > 0;
    if (!text && !hasImage) {
      $heading.remove();
    }
  });

  root.find("h3").each((_, element) => {
    const $heading = $(element);
    const imgs = $heading.find("img");
    if (imgs.length === 1) {
      const img = imgs.first();
      const alt = img.attr("alt") ?? "";
      const src = normalizeImageSrc(img.attr("src") ?? "");
      const caption = $heading
        .clone()
        .find("img")
        .remove()
        .end()
        .text()
        .replace(/\u00a0/g, " ")
        .trim();

      const figure = `<figure class="hathor-blog-figure"><img src="${src}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" />${
        caption ? `<figcaption>${caption}</figcaption>` : ""
      }</figure>`;
      $heading.replaceWith(figure);
    }
  });

  root.find("img").each((_, element) => {
    const $img = $(element);
    const parentTag = $img.parent().get(0)?.tagName?.toLowerCase();
    if (parentTag === "figure") return;

    const src = normalizeImageSrc($img.attr("src") ?? "");
    const alt = $img.attr("alt") ?? "";
    $img.replaceWith(
      `<figure class="hathor-blog-figure"><img src="${src}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" /></figure>`,
    );
  });

  root.find("a").each((_, element) => {
    const $link = $(element);
    const href = $link.attr("href");
    if (!href) return;

    const normalized = normalizeBlogHref(href, slugMap);
    $link.attr("href", normalized);

    if (/^https?:\/\//i.test(normalized)) {
      $link.attr({ target: "_blank", rel: "noopener noreferrer" });
    } else {
      $link.removeAttr("target").removeAttr("rel");
    }
  });

  root.find("span[style]").each((_, element) => {
    const $span = $(element);
    const style = $span.attr("style") ?? "";
    if (/color\s*:\s*#?d35400/i.test(style)) {
      $span.replaceWith(`<span class="hathor-blog-accent">${$span.html() ?? ""}</span>`);
    }
  });

  return root.html()?.trim() ?? "";
}

function extractInternalLinks(html, slugMap) {
  const links = [];
  const $ = cheerio.load(html);
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") ?? "";
    const text = $(element).text().replace(/\s+/g, " ").trim();
    if (href.startsWith("/blogs/")) {
      links.push({ href, text });
    } else if (href.includes("/blogs/")) {
      links.push({
        href: normalizeBlogHref(href, slugMap),
        text,
        sourceHref: href,
      });
    }
  });
  return links;
}

async function extractArticleHtml(page) {
  return page.evaluate(() => {
    const body = document.querySelector(".blog-details-body");
    if (!body) {
      return null;
    }

    const title =
      document.querySelector(".blog-details-head h1")?.textContent?.trim() ??
      document.querySelector("h1")?.textContent?.trim() ??
      document.title;

    const metaDescription =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
        ?.trim() ?? "";

    const published =
      document.querySelector("time")?.getAttribute("datetime") ??
      document.querySelector(".blog-details-li .fa-calendar")?.parentElement
        ?.textContent ??
      "";

    return {
      title,
      metaDescription,
      published: published?.toString().trim() ?? "",
      html: body.innerHTML,
      headingCount: body.querySelectorAll("h2, h3, h4").length,
      imageCount: body.querySelectorAll("img").length,
      linkCount: body.querySelectorAll('a[href*="/blogs/"]').length,
    };
  });
}

async function waitForRealPage(page) {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const title = await page.title();
    if (!/just a moment|attention required|cloudflare/i.test(title)) {
      return;
    }
    await page.waitForTimeout(2_000);
  }

  throw new Error(`Timed out waiting for page: ${await page.title()}`);
}

async function scrapePost(browser, post, index, slugMap) {
  const page = await browser.newPage();
  try {
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setViewportSize({ width: 1366, height: 900 });

    console.log(`[${index + 1}/44] ${post.sourceUrl}`);
    await page.goto(post.sourceUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });

    await waitForRealPage(page);
    await page.waitForSelector(".blog-details-body", { timeout: 60_000 });
    await page.waitForTimeout(1_500);

    const article = await extractArticleHtml(page);
    if (!article?.html) {
      throw new Error("Missing .blog-details-body HTML");
    }

    const contentHtml = processArticleHtml(article.html, slugMap);
    if (!contentHtml || contentHtml.length < 120) {
      throw new Error(`Insufficient HTML content (${contentHtml.length} chars)`);
    }

    const internalLinks = extractInternalLinks(contentHtml, slugMap);

    return {
      ...post,
      scrapedTitle: article.title,
      metaDescription: article.metaDescription || post.excerpt,
      content: contentHtml,
      contentFormat: "html",
      headingCount: article.headingCount,
      imageCount: article.imageCount,
      linkCount: internalLinks.length,
      internalLinks,
      scrapedPublishedAt: article.published || post.publishedAt,
    };
  } finally {
    await page.close();
  }
}

async function main() {
  const markdown = fs.readFileSync(RAW_DATA_PATH, "utf8");
  const metadata = parseBlogMetadata(markdown);
  const slugMap = buildSlugMaps(metadata);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    channel: "msedge",
  });
  const results = [];
  const failures = [];
  const globalLinkMap = {};

  try {
    for (let i = 0; i < metadata.length; i += 1) {
      const post = metadata[i];
      try {
        const scraped = await scrapePost(browser, post, i, slugMap);
        results.push(scraped);
        globalLinkMap[post.slug] = {
          title: post.title,
          urlSlug: post.urlSlug,
          sourceUrl: post.sourceUrl,
          links: scraped.internalLinks,
        };
        console.log(
          `  ✓ ${post.slug} (${scraped.headingCount} headings, ${scraped.imageCount} images, ${scraped.linkCount} internal links)`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ failed: ${message}`);
        failures.push({ slug: post.slug, sourceUrl: post.sourceUrl, error: message });
        const fallbackHtml = `<p>${post.excerpt}</p>`;
        results.push({
          ...post,
          scrapedTitle: post.title,
          metaDescription: post.excerpt,
          content: fallbackHtml,
          contentFormat: "html",
          headingCount: 0,
          imageCount: 0,
          linkCount: 0,
          internalLinks: [],
          scrapedPublishedAt: post.publishedAt,
          fallback: true,
        });
        globalLinkMap[post.slug] = {
          title: post.title,
          urlSlug: post.urlSlug,
          sourceUrl: post.sourceUrl,
          links: [],
          fallback: true,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1_500));
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    LINK_MAP_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        slugMap: Object.fromEntries(slugMap.entries()),
        posts: globalLinkMap,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`\nWrote ${results.length} posts to ${OUTPUT_PATH}`);
  console.log(`Wrote internal link map to ${LINK_MAP_PATH}`);

  if (failures.length) {
    console.log(`Failures (${failures.length}):`);
    for (const failure of failures) {
      console.log(`  - ${failure.slug}: ${failure.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
