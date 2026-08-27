import type { GaAdminFunnelStep, GaAdminRankedItem, GaAdminReport } from "@/lib/ga-admin-report";

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csvBlock(title: string, rows: Array<[string, string | number]>): string[] {
  return [csvCell(title), ...rows.map((row) => row.map(csvCell).join(","))];
}

function rankedCsv(title: string, items: GaAdminRankedItem[]): string[] {
  if (items.length === 0) return [csvCell(title), csvCell("None")];
  return [
    csvCell(title),
    ["Label", "Value"].map(csvCell).join(","),
    ...items.map((item) => [item.label, item.value].map(csvCell).join(",")),
  ];
}

function funnelCsv(steps: GaAdminFunnelStep[]): string[] {
  return [
    csvCell("Booking funnel"),
    ["Step", "Count"].map(csvCell).join(","),
    ...steps.map((step) => [step.label, step.count].map(csvCell).join(",")),
  ];
}

/** Public-path CSV only. No emails, names, or other PII. */
export function buildAnalyticsCsv(report: GaAdminReport): string {
  const lines = [
    ...csvBlock("Summary", [
      ["Range", report.range.label],
      ["Start", report.range.startIso],
      ["End", report.range.endIso],
      ["Generated at", report.generatedAt],
      ["Visitors", report.totals.visitors],
      ["Page views", report.totals.pageViews],
      ["Sessions", report.totals.sessions],
      ["Bounce rate", report.totals.bounceRate.toFixed(1)],
      ["Avg session seconds", Math.round(report.totals.averageSessionDurationSeconds)],
      ["New users", report.totals.newUsers],
      ["Returning users", report.totals.returningUsers],
      ["Bookings", report.conversions.bookings],
      ["Checkout starts", report.conversions.checkoutStarts],
      ["Abandoned checkouts", report.conversions.abandonedCheckouts],
      ["Purchases", report.conversions.purchases],
      ["Leads", report.conversions.leads],
      ["Conversion rate", report.conversions.rate.toFixed(2)],
      ["Revenue cents", report.conversions.revenueCents],
      ["Average booking cents", report.conversions.averageBookingCents],
      ["Revenue per visitor cents", report.conversions.revenuePerVisitorCents],
    ]),
    "",
    ...funnelCsv(report.funnel),
    "",
    rankedCsv("Top pages", report.topPages.map((page) => ({ label: page.path, value: page.pageViews }))),
    "",
    rankedCsv("Landing pages", report.landingPages),
    "",
    rankedCsv("Sources", report.sources),
    "",
    rankedCsv("Campaigns", report.campaigns),
    "",
    rankedCsv("Paid-trip sources", report.bookingSources),
    "",
    rankedCsv("Countries", report.countries),
    "",
    rankedCsv("Cities", report.cities),
    "",
    rankedCsv(
      "Devices",
      report.devices.map((device) => ({ label: device.label, value: device.value })),
    ),
    "",
    rankedCsv("Hour of day", report.hours),
  ];
  return `${lines.join("\n")}\n`;
}

export function buildAnalyticsDigestText(report: GaAdminReport): string {
  const alertBlock =
    report.alerts.length > 0
      ? report.alerts.map((alert) => `- ${alert.message}`).join("\n")
      : "- No traffic or booking alerts this week.";
  const funnelBlock = report.funnel
    .map((step) => `- ${step.label}: ${step.count}`)
    .join("\n");

  return [
    `Hathor weekly analytics (${report.range.startIso} to ${report.range.endIso})`,
    "",
    `Visitors: ${report.totals.visitors} (${report.compare.label})`,
    `Page views: ${report.totals.pageViews}`,
    `Bounce rate: ${report.totals.bounceRate.toFixed(1)}%`,
    `Bookings: ${report.conversions.bookings}`,
    `Revenue (USD cents): ${report.conversions.revenueCents}`,
    `Conversion rate: ${report.conversions.rate.toFixed(1)}%`,
    `Leads: ${report.conversions.leads}`,
    `Abandoned checkouts: ${report.conversions.abandonedCheckouts}`,
    "",
    "Funnel",
    funnelBlock,
    "",
    "Alerts",
    alertBlock,
    "",
    "Open /admin/analytics for charts and CSV export.",
  ].join("\n");
}

export function buildAnalyticsDigestHtml(report: GaAdminReport): string {
  const rows = [
    ["Visitors", String(report.totals.visitors)],
    ["Page views", String(report.totals.pageViews)],
    ["Bounce rate", `${report.totals.bounceRate.toFixed(1)}%`],
    ["Bookings", String(report.conversions.bookings)],
    ["Conversion", `${report.conversions.rate.toFixed(1)}%`],
    ["Leads", String(report.conversions.leads)],
    ["Abandoned checkouts", String(report.conversions.abandonedCheckouts)],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#6e6450">${label}</td><td style="padding:8px 0;text-align:right;font-weight:600">${value}</td></tr>`,
    )
    .join("");
  const alerts =
    report.alerts.length > 0
      ? report.alerts
          .map((alert) => `<li>${alert.message}</li>`)
          .join("")
      : "<li>No traffic or booking alerts this week.</li>";
  const funnel = report.funnel
    .map((step) => `<li>${step.label}: ${step.count}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html><body style="margin:0;background:#f4efe6;font-family:Georgia,serif;color:#1c1914">
  <div style="max-width:560px;margin:32px auto;padding:28px 32px;background:#fffdf8;border:1px solid #e6dcc8">
    <p style="letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#b69f64;margin:0 0 8px">Hathor</p>
    <h1 style="font-size:24px;margin:0 0 6px">Weekly analytics</h1>
    <p style="margin:0 0 20px;color:#6e6450">${report.range.startIso} – ${report.range.endIso}</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <h2 style="font-size:16px;margin:24px 0 8px">Funnel</h2>
    <ul style="padding-left:18px;color:#3d3830">${funnel}</ul>
    <h2 style="font-size:16px;margin:24px 0 8px">Alerts</h2>
    <ul style="padding-left:18px;color:#3d3830">${alerts}</ul>
    <p style="margin:24px 0 0;font-size:13px;color:#6e6450">Open /admin/analytics for the full dashboard.</p>
  </div>
</body></html>`;
}
