import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { NextRequest } from "next/server";
import { cleanEmailDisplayText, emailDisplayPreview, splitEmailDisplayText } from "../lib/email-display";
import { buildEmailHtmlDocument, emailFrameHeaders, receivedEmailHtmlDocument } from "../lib/email-html-view";
import { EmailMessageBody } from "../components/admin/EmailMessageBody";
import { GET } from "../app/api/admin/inbox/[source]/[id]/formatted/route";
import type { bookingQuery } from "../lib/booking-database";

async function main() {
  const padding = "\u200c\u200b\u200d\u200e\u200f\ufeff ".repeat(100);
  const reply = `I have a question.\r\n\r\nOn Fri, 2 Oct 2026 at 14:45, Hathor <team@example.com>\r\nwrote:\r\n> ${padding}\r\n> Your previous invoice\r\n> [image: Logo]\r\n> Previous details`;
  const parts = splitEmailDisplayText(reply);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].text, "I have a question.");
  assert.equal(parts[1].history, true);
  assert.ok(!parts[1].text.includes("\ufeff"));
  assert.equal(emailDisplayPreview(reply), "I have a question.");
  const inline = splitEmailDisplayText("> Which date?\nSaturday.\n\n> Which cabin?\nKing cabin.");
  assert.deepEqual(inline.filter(part => part.kind === "message").map(part => part.text), ["Saturday.", "King cabin."]);
  assert.equal(splitEmailDisplayText("On our next trip we wrote:\nPlease arrange a transfer.").length, 1);
  assert.equal(cleanEmailDisplayText("مرحبا بكم\nمی\u200cخواهم\n👩\u200d💻"), "مرحبا بكم\nمی\u200cخواهم\n👩\u200d💻");
  assert.equal(cleanEmailDisplayText("Hello\u00a0world\u200b"), "Hello world");
  const markup = renderToStaticMarkup(<EmailMessageBody bodyText={reply} formattedUrl="/api/admin/inbox/general/test/formatted" />);
  const ui = load(markup);
  assert.equal(ui("details").first().attr("open"), undefined);
  assert.equal(ui("details").last().attr("open"), undefined);
  assert.equal(ui("iframe").length, 0, "Formatted HTML must never load automatically");
  assert.ok(ui.text().includes("Show previous messages"));
  const escaped = renderToStaticMarkup(<EmailMessageBody bodyText='<script>alert("unsafe")</script>' />);
  assert.equal(load(escaped)("script").length, 0);
  assert.ok(escaped.includes("&lt;script&gt;"));

  const hostile = `<head><style>@import 'https://evil.example.com/track';</style><meta http-equiv="refresh" content="0;url=https://evil.example.com"></head>
    <div style="display:none">Hidden preheader</div><div aria-hidden="true">Hidden signature padding</div>
    <script>parent.inboxInjected=true</script><svg onload="alert(1)"></svg><iframe src="https://evil.example.com"></iframe>
    <form action="https://evil.example.com"><input name="secret"></form>
    <table style="background-color:#b69f64;color:#ffffff;width:600px"><tr><td>Company signature</td></tr></table>
    <p id="admin_session" onclick="alert(1)" style="position:fixed;background-image:url(https://evil.example.com/track);color:#123456">Safe text</p>
    <a href="javascript:alert(1)">Bad link</a><a href="/api/admin/logout">Relative link</a><a href="https://www.company.com" ping="https://evil.example.com">Company website</a>
    <img src="https://images.company.com/logo.png" alt="Company logo" onerror="alert(1)"><img src="cid:logo" alt="Attached logo"><img src="https://localhost/secret"><img src="https://127.0.0.1/private">`;
  const blocked = load(buildEmailHtmlDocument(hostile));
  assert.equal(blocked("script, iframe, form, input, svg, [onclick], [onerror], [id], [ping]").length, 0);
  assert.equal(blocked("img[src]").length, 0);
  assert.ok(!blocked.text().includes("Hidden preheader"));
  assert.ok(!blocked.html().includes("background-image"));
  assert.ok(!blocked.html().includes("position:fixed"));
  assert.equal(blocked("table").attr("style"), "background-color:#b69f64;color:#ffffff;width:600px");
  assert.deepEqual(blocked("a[href]").map((_, element) => blocked(element).attr("href")).get(), ["https://www.company.com/"]);
  assert.equal(blocked("a[href]").attr("rel"), "noopener noreferrer");
  const enabled = load(buildEmailHtmlDocument(hostile, true, new Map([["logo", "https://inbound-cdn.resend.com/logo.png"]])));
  assert.equal(enabled("img[src]").length, 2);
  assert.ok(enabled("img[src]").toArray().every(element => enabled(element).attr("referrerpolicy") === "no-referrer"));
  assert.match(emailFrameHeaders(false)["Content-Security-Policy"], /img-src 'none'/);
  assert.match(emailFrameHeaders(true)["Content-Security-Policy"], /img-src https:/);
  assert.ok(!emailFrameHeaders(true)["Content-Security-Policy"].includes("allow-scripts"));
  assert.ok(!emailFrameHeaders(true)["Content-Security-Policy"].includes("allow-same-origin"));
  assert.throws(() => buildEmailHtmlDocument("x".repeat(512 * 1024 + 1)));

  const emailId = randomUUID();
  const attachmentId = randomUUID();
  const requests: string[] = [];
  const query = (async (sql: string, values: unknown[]) => { assert.match(sql, /FROM "BookingMessage".*direction = 'INBOUND'/); assert.equal(values.length, 1); return [{ resendEmailId: emailId }]; }) as typeof bookingQuery;
  const request = async (url: string) => {
    requests.push(url);
    if (url.endsWith("/attachments")) return { data: [{ id: attachmentId, content_id: "logo", content_type: "image/png", download_url: "https://inbound-cdn.resend.com/logo.png" }] };
    return { id: emailId, html: '<p>Company</p><img src="cid:logo" alt="Attached logo">', attachments: [{ id: attachmentId }] };
  };
  await receivedEmailHtmlDocument("booking", randomUUID(), false, { query, request });
  assert.equal(requests.length, 1, "Blocked view must not fetch inline image links");
  const branded = await receivedEmailHtmlDocument("booking", randomUUID(), true, { query, request });
  assert.match(branded, /src="https:\/\/inbound-cdn.resend.com\/logo.png"/);
  assert.equal(requests.length, 3);
  await assert.rejects(receivedEmailHtmlDocument("booking", randomUUID(), false, { query, request: async () => ({ id: randomUUID(), html: "<p>Mismatch</p>", attachments: [] }) }));
  await assert.rejects(receivedEmailHtmlDocument("general", randomUUID(), false, { query: (async () => []) as typeof bookingQuery, request }));
  const response = await GET(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/general/id/formatted"), { params: Promise.resolve({ source: "general", id: randomUUID() }) });
  assert.equal(response.status, 401);
  assert.match(response.headers.get("Content-Security-Policy") ?? "", /sandbox/);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  console.log("Email display tests passed: quote cleanup, inline replies, Unicode, original preservation, HTML sanitization, image opt-in, message binding and authorization.");
}

main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : "Email display tests failed"); process.exitCode = 1; });
