import assert from "node:assert/strict";
import { chromium, type Locator } from "playwright";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "../lib/admin-auth";
import { readBulkRecord, suppressedBulkEmails } from "../lib/bulk-email-store";
import type { BulkCampaign } from "../lib/bulk-email-types";
import sharp from "sharp";

const testOrigin = process.env.BULK_TEST_ORIGIN || "http://127.0.0.1:3010";

async function imageLoaded(image: Locator) {
  // Sandbox disables script event callbacks. Poll from Node instead of
  // installing load handlers or timers inside the protected frame.
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await image.evaluate((img: HTMLImageElement) => img.complete)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Preview image did not finish loading.");
}

async function main() {
  if (!process.env.ADMIN_SESSION_SECRET) throw new Error("Use the isolated bulk-editor QA runner.");
  Object.assign(process.env, { BULK_EMAIL_STORAGE: "local", BULK_EMAIL_MODE: "preview" });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  await mkdir("output/bulk-emails", { recursive: true });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 960 } });
      await context.addCookies([{ name: ADMIN_SESSION_COOKIE, value: createSessionToken(), domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      let cmsCalls = 0;
      const campaignImage = `https://bulk-test.supabase.co/storage/v1/object/public/email-images/bulk-campaigns/${randomUUID()}/${randomUUID()}.jpg`;
      const banner = await sharp({ create: { width: 960, height: 480, channels: 3, background: "#b69f64" } }).jpeg().toBuffer();
      // Only bulk endpoints go to the real local server. Other dashboard data is synthetic.
      await page.route("**/api/admin/**", route => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname.startsWith("/api/admin/email-templates")) cmsCalls++;
        if (pathname === "/api/admin/bulk-emails/images") return route.fulfill({ json: { url: campaignImage } });
        if (pathname.startsWith("/api/admin/bulk-emails")) return route.continue();
        return route.fulfill({ json: { displayName: "Preview admin", avatarUrl: null, profile: { displayName: "Preview admin", avatarUrl: null }, unreadCount: 0, bookings: [], notifications: [], items: [] } });
      });
      await page.route("https://bulk-test.supabase.co/**", route => route.fulfill({ contentType: "image/jpeg", body: banner }));
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(testOrigin + "/admin/bulk-emails", { waitUntil: "domcontentloaded", timeout: 180000 });
      await page.getByRole("heading", { name: "Bulk emails", exact: true }).waitFor();
      try { await page.getByText("0 recipients", { exact: true }).waitFor({ timeout: 30000 }); }
      catch (error) { console.log("Initial bulk page:", await page.locator("body").innerText(), errors); await page.screenshot({ path: `output/bulk-emails/${width}-initial-failure.png` }); throw error; }
      const showTemplate = async (sample = false) => {
        await page.getByRole("button", { name: "Preview email template", exact: true }).click();
        try { await page.getByRole("dialog").waitFor({ timeout: 45000 }); }
        catch (error) { await page.screenshot({ path: `output/bulk-emails/${width}-template-failure.png` }); console.log("Template preview error:", await page.getByRole("alert").allTextContents(), errors); throw error; }
        const modalFrame = page.frameLocator('iframe[title="Email template modal preview"]');
        await modalFrame.getByText(sample ? "Your message will appear here, with the Hathor logo, banner and footer." : "We look forward to welcoming you aboard Hathor.", { exact: true }).waitFor();
        assert.equal(await modalFrame.locator("script").count(), 0);
        await page.getByRole("button", { name: "Close email preview", exact: true }).click();
      };
      await showTemplate(true);
      await page.getByRole("button", { name: "Edit email", exact: true }).click();
      await page.getByLabel("Email subject", { exact: true }).fill(`Early draft ${width}`);
      await page.getByLabel("Message", { exact: true }).fill("A draft written before adding recipients.");
      assert.equal(await page.getByLabel("Email title", { exact: true }).count(), 0, "Subject is the only email title field");
      await page.getByLabel("Footer reply note", { exact: true }).fill("A footer for this bulk email only.");
      await page.getByLabel("Signature", { exact: true }).fill("Warm regards,\nThe bulk correspondence team");
      await page.getByText("Bulk preview up to date", { exact: true }).waitFor({ timeout: 45000 });
      const liveFrame = page.frameLocator('iframe[title="Branded bulk email preview"]');
      await liveFrame.getByText("The bulk correspondence team", { exact: false }).waitFor();
      assert.ok(await liveFrame.getByText("The bulk correspondence team", { exact: false }).evaluate(element => { const r = element.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }), "The edited signature is visible in the live preview");
      await page.getByLabel("Banner image for this email", { exact: true }).setInputFiles({ name: "campaign-banner.jpg", mimeType: "image/jpeg", buffer: banner });
      await page.getByText("Bulk preview up to date", { exact: true }).waitFor({ timeout: 45000 });
      await liveFrame.locator(`img[src="${campaignImage}"]`).waitFor();
      assert.equal(await page.getByLabel("Message", { exact: true }).inputValue(), "A draft written before adding recipients.");
      await page.getByRole("button", { name: "Phone bulk email preview", exact: true }).click();
      assert.ok(await page.getByTitle("Branded bulk email preview").evaluate(element => element.getBoundingClientRect().width <= 375));
      await page.getByRole("button", { name: "Desktop bulk email preview", exact: true }).click();
      await page.getByLabel("Show Hathor banner", { exact: true }).uncheck();
      await page.getByRole("button", { name: "Preview email template", exact: true }).click();
      const editedFrame = page.frameLocator('iframe[title="Email template modal preview"]');
      await editedFrame.locator(".email-heading").filter({ hasText: `Early draft ${width}` }).waitFor();
      await editedFrame.getByText("A footer for this bulk email only.", { exact: true }).waitFor();
      assert.equal(await editedFrame.locator('img[alt="Luxury Hathor Dahabiya cruise on the Nile"]').count(), 0);
      await page.getByRole("button", { name: "Edit this email", exact: true }).click();
      assert.equal(await page.getByRole("dialog").isVisible(), false);
      assert.equal(await page.getByLabel("Email subject", { exact: true }).inputValue(), `Early draft ${width}`);
      await page.getByRole("button", { name: "Reset template to Hathor defaults", exact: true }).click();
      assert.equal(await page.getByLabel("Show Hathor banner", { exact: true }).isChecked(), true);
      await page.getByRole("button", { name: "Add recipients", exact: true }).click();
      const corners = await page.locator(".bulk-emails__panel").first().evaluate(el => { const style = getComputedStyle(el); return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius]; });
      assert.deepEqual(corners, ["10px", "10px", "10px", "10px"]);
      await page.screenshot({ path: `output/bulk-emails/${width}-recipients.png`, fullPage: true });
      if (width === 1440) {
        await page.getByLabel("Upload recipient list").setInputFiles("output/bulk-emails/sample-recipients.xlsx");
        await page.getByText("2 recipients", { exact: true }).waitFor();
        await page.getByLabel("Enter an email address", { exact: true }).fill("guest@example.com");
        await page.getByRole("button", { name: "Add email", exact: true }).click();
        await page.getByLabel("Enter an email address", { exact: true }).fill("manual@example.com");
        await page.getByRole("button", { name: "Add email", exact: true }).click();
        await page.getByText("3 recipients", { exact: true }).waitFor();
        await page.getByRole("button", { name: "Remove file sample-recipients.xlsx", exact: true }).click();
        await page.getByText("2 recipients", { exact: true }).waitFor();
        assert.equal(await page.getByRole("button", { name: "Remove guest@example.com", exact: true }).count(), 1);
        assert.equal(await page.getByRole("button", { name: "Remove second@example.com", exact: true }).count(), 0);
        await page.getByRole("button", { name: "Remove manual@example.com", exact: true }).click();
        await page.getByLabel("Upload recipient list").setInputFiles("output/bulk-emails/sample-recipients.xlsx");
        await page.getByText("2 recipients", { exact: true }).waitFor();
        await page.getByLabel("Upload recipient list").setInputFiles("output/bulk-emails/sample-recipients.pdf");
        await page.getByText("3 recipients", { exact: true }).waitFor();
        await page.getByRole("button", { name: "Remove file sample-recipients.pdf", exact: true }).click();
        await page.getByText("2 recipients", { exact: true }).waitFor();
        await page.getByLabel("Upload recipient list").setInputFiles("output/bulk-emails/sample-recipients.pdf");
        await page.getByText("3 recipients", { exact: true }).waitFor();
        await page.getByLabel("Or paste email addresses").fill(Array.from({ length: 97 }, (_, i) => `preview${i}@example.com`).join("\n"));
        await page.getByRole("button", { name: "Add addresses", exact: true }).click();
        await page.getByText("100 recipients", { exact: true }).waitFor();
        await page.getByLabel("Or paste email addresses").fill("extra@example.com");
        await page.getByRole("button", { name: "Add addresses", exact: true }).click();
        await page.getByText("101 recipients", { exact: true }).waitFor();
        assert.equal(await page.getByRole("button", { name: "Write your message", exact: true }).isDisabled(), true);
        await page.getByRole("button", { name: "Remove extra@example.com", exact: true }).click();
      } else {
        await page.getByLabel("Or paste email addresses").fill("phone@example.com; PHONE@example.com; secondphone@example.com; invalid@");
        await page.getByRole("button", { name: "Add addresses", exact: true }).click();
        await page.getByText("2 recipients", { exact: true }).waitFor();
      }
      await page.getByRole("button", { name: "Write your message", exact: true }).click();
      await page.getByLabel("Email subject", { exact: true }).fill(`Hathor preview ${width}`);
      await page.getByLabel("Message", { exact: true }).fill('Dear guest,\n\nWe look forward to welcoming you aboard Hathor.\n\n<script>parent.bulkInjected=true</script>\n\nWarm regards,\nThe Hathor team');
      await page.getByLabel("Footer reply note", { exact: true }).fill(`A saved bulk footer ${width}`);
      await showTemplate();
      await page.getByText("Bulk preview up to date", { exact: true }).waitFor({ timeout: 45000 });
      await page.getByTitle("Branded bulk email preview").waitFor({ timeout: 45000 });
      const frame = page.frameLocator('iframe[title="Branded bulk email preview"]');
      await frame.getByText("We look forward to welcoming you aboard Hathor.", { exact: true }).waitFor();
      await frame.locator(".email-heading").filter({ hasText: `Hathor preview ${width}` }).waitFor();
      await imageLoaded(frame.locator('img[alt="Hathor"]'));
      assert.equal(await frame.locator('img[alt="Hathor"]').evaluate((img: HTMLImageElement) => img.naturalWidth > 0), true, "Logo loads inside the sandboxed preview");
      assert.equal(await frame.locator("script").count(), 0);
      assert.equal(await frame.getByText("<script>parent.bulkInjected=true</script>", { exact: true }).count(), 1);
      assert.equal(await page.evaluate(() => Boolean((window as unknown as Record<string, unknown>).bulkInjected)), false);
      await page.evaluate(() => window.scrollTo(0, 0));
      // Keep this capture within the viewport: Edge's full-page capture can
      // leave pointer hit testing in a sandboxed iframe at the old scroll offset.
      await page.screenshot({ path: `output/bulk-emails/${width}-message.png` });
      const reviewButton = page.getByRole("button", { name: "Review email", exact: true });
      await reviewButton.scrollIntoViewIfNeeded();
      await reviewButton.click();
      try { await page.getByRole("heading", { name: "Try your send.", exact: true }).waitFor({ timeout: 45000 }); }
      catch (error) { await page.screenshot({ path: `output/bulk-emails/${width}-failure.png` }); throw error; }
      const count = width === 1440 ? 100 : 2;
      await showTemplate();
      const run = page.getByRole("button", { name: `Run preview for ${count} recipients`, exact: true });
      assert.equal(await run.isDisabled(), true);
      await page.getByLabel("I have reviewed this list and have permission to email these recipients.").check();
      const finalFrame = page.frameLocator('iframe[title="Final branded email preview"]');
      await finalFrame.getByText("We look forward to welcoming you aboard Hathor.", { exact: true }).waitFor();
      await imageLoaded(finalFrame.locator('img[alt="Hathor"]'));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `output/bulk-emails/${width}-review.png` });
      await run.click();
      await page.getByRole("heading", { name: "Preview completed", exact: true }).waitFor({ timeout: 45000 });
      await showTemplate();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `output/bulk-emails/${width}-result.png` });
      assert.equal(await page.locator("html").evaluate(el => el.scrollWidth <= window.innerWidth + 1), true, `No horizontal overflow at ${width}px`);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Real sends", exact: true }).click();
      await page.getByText("No real sending campaigns yet.", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Previews", exact: true }).click();
      try { await page.getByRole("button", { name: new RegExp(`Hathor preview ${width}`) }).first().click({ timeout: 60000 }); }
      catch (error) { await page.screenshot({ path: `output/bulk-emails/${width}-reload-failure.png`, fullPage: true }); console.log("Reload failure", await page.locator("body").innerText()); throw error; }
      await page.getByRole("heading", { name: "Preview completed", exact: true }).waitFor();
      await showTemplate();
      assert.equal(errors.length, 0, errors.join("\n"));
      assert.equal(cmsCalls, 0, "Editing a bulk message never calls CMS template APIs");
      const result = await page.request.get(testOrigin + "/api/admin/bulk-emails");
      const data = await result.json(); assert.equal(data.settings.mode, "preview");
      const campaign = data.campaigns.find((row: { subject: string }) => row.subject === `Hathor preview ${width}`);
      assert.equal(campaign.recipients.filter((row: { status: string }) => row.status === "simulated").length, count);
      assert.equal("payload" in campaign, false);
      const snapshot = await page.request.post(`${testOrigin}/api/admin/bulk-emails/${campaign.id}/preview`, { headers: { Origin: testOrigin } });
      const snapshotBody = await snapshot.json(); assert.ok(snapshotBody.html.includes(`Hathor preview ${width}`)); assert.ok(snapshotBody.html.includes(`A saved bulk footer ${width}`));
      await page.getByRole("button", { name: "Use as new email", exact: true }).click();
      assert.equal(await page.getByLabel("Email title", { exact: true }).count(), 0);
      assert.equal(await page.getByLabel("Email subject", { exact: true }).inputValue(), `Hathor preview ${width}`);
      await page.getByLabel("Email subject", { exact: true }).fill("A new draft copied from history");
      const unchanged = await page.request.get(`${testOrigin}/api/admin/bulk-emails/${campaign.id}`);
      assert.equal((await unchanged.json()).campaign.subject, `Hathor preview ${width}`, "Editing a copied campaign cannot rewrite sending history");
      console.log(`PASS ${width}px: dashboard import, branded preview, HTML escaping, review, ${count}-recipient simulation, persistence, no overflow or browser errors.`);
      await context.close();
    }
    const unauthenticated = await browser.newContext();
    assert.equal((await unauthenticated.request.get(testOrigin + "/api/admin/bulk-emails")).status(), 401);
    await unauthenticated.close();
    const confirmation = await browser.newContext();
    await confirmation.addCookies([{ name: ADMIN_SESSION_COOKIE, value: createSessionToken(), domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const id = randomUUID(); const email = `unsubscribe-${id}@example.com`;
    const created = await confirmation.request.post(testOrigin + "/api/admin/bulk-emails", { headers: { Origin: testOrigin }, data: { id, emails: [email, "keep-subscribed@example.com"], subject: "Unsubscribe confirmation check", message: "Synthetic local preview only.", confirmed: true } });
    assert.equal(created.status(), 200);
    const saved = await readBulkRecord<BulkCampaign>(`campaign:${id}`); assert.ok(saved);
    const link = saved.payload[0].headers["List-Unsubscribe"].slice(1, -1);
    const confirmationPage = await confirmation.newPage();
    await confirmationPage.goto(link, { waitUntil: "domcontentloaded" });
    await confirmationPage.getByRole("button", { name: "Confirm unsubscribe", exact: true }).waitFor();
    assert.equal((await suppressedBulkEmails([email])).size, 0, "Opening the link alone does not opt out");
    await confirmationPage.getByRole("button", { name: "Confirm unsubscribe", exact: true }).click();
    await confirmationPage.getByRole("heading", { name: "You are unsubscribed.", exact: true }).waitFor();
    assert.equal((await suppressedBulkEmails([email])).size, 1);
    const processed = await confirmation.request.post(`${testOrigin}/api/admin/bulk-emails/${id}`, { headers: { Origin: testOrigin }, data: { action: "send" } });
    assert.equal(processed.status(), 200);
    const result = await processed.json();
    assert.equal(result.campaign.recipients.find((row: { email: string }) => row.email === email).status, "skipped");
    assert.equal(result.campaign.recipients.filter((row: { status: string }) => row.status === "simulated").length, 1);
    await confirmation.close();
    console.log("PASS: real local confirmation page, scanner-safe GET, explicit opt-out POST, and suppressed recipient skipped in the simulated batch.");
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
