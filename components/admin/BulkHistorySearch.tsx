"use client";

import { ArrowRight, Search } from "lucide-react";
import type { BulkCampaignView, BulkRecipient } from "@/lib/bulk-email-types";

export type BulkHistoryQuery = { text: string; from: string; to: string };
export type BulkHistoryHit = { campaign: BulkCampaignView; recipient?: BulkRecipient };

/** When the batch went out; campaigns never attempted fall back to their creation time. */
export const bulkSentAt = (campaign: BulkCampaignView) => campaign.firstAttemptAt || campaign.createdAt;
export const bulkExactDate = (value: string) => new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
/** The sender's own calendar day, matching the date inputs. */
const localDay = (value: string) => { const day = new Date(value); return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`; };
const RECIPIENT_STATUS: Record<BulkRecipient["status"], string> = { accepted: "Accepted", simulated: "Simulated", skipped: "Skipped · unsubscribed", pending: "Not confirmed" };

export const bulkHistoryActive = (query: BulkHistoryQuery) => Boolean(query.text.trim() || query.from || query.to);

/** Address search matches recipients; it also matches subjects so a whole send can be found. */
export function searchBulkHistory(campaigns: BulkCampaignView[], query: BulkHistoryQuery) {
  const text = query.text.trim().toLowerCase();
  const hits: BulkHistoryHit[] = [];
  const matched: BulkCampaignView[] = [];
  for (const campaign of campaigns) {
    const day = localDay(bulkSentAt(campaign));
    if ((query.from && day < query.from) || (query.to && day > query.to)) continue;
    const recipients = text ? campaign.recipients.filter(row => row.email.includes(text)) : [];
    const subject = !text || campaign.subject.toLowerCase().includes(text);
    if (!recipients.length && !subject) continue;
    matched.push(campaign);
    if (recipients.length) hits.push(...recipients.map(recipient => ({ campaign, recipient })));
    else hits.push({ campaign });
  }
  hits.sort((a, b) => bulkSentAt(b.campaign).localeCompare(bulkSentAt(a.campaign)));
  return { campaigns: matched, hits };
}

export function BulkHistorySearchResults({ query, hits, campaignCount, onOpen }: { query: BulkHistoryQuery; hits: BulkHistoryHit[]; campaignCount: number; onOpen: (campaign: BulkCampaignView) => void }) {
  const text = query.text.trim();
  const range = query.from || query.to ? ` between ${query.from || "the first send"} and ${query.to || "today"}` : "";
  if (!bulkHistoryActive(query)) return <section className="bulk-emails__panel bulk-emails__result bulk-emails__history-search" aria-labelledby="bulk-history-search-title">
    <p className="bulk-emails__eyebrow">Find a sent email</p><h2 id="bulk-history-search-title">Who received what, and when</h2>
    <div className="bulk-emails__empty"><Search size={30} /><p>Search an address or subject, or choose dates.</p><span>Each match shows the exact time its email was sent and what happened to it. Open any email on the left to see its full results.</span></div>
  </section>;
  return <section className="bulk-emails__panel bulk-emails__result bulk-emails__history-search" aria-labelledby="bulk-history-search-title" aria-live="polite">
    <p className="bulk-emails__eyebrow">Search results</p>
    <h2 id="bulk-history-search-title">{hits.length ? `${hits.length} ${hits.length === 1 ? "match" : "matches"}` : "No matches"}</h2>
    <p className="bulk-emails__muted">{hits.length
      ? `${text ? `“${text}”` : "Emails"}${range} · ${campaignCount} ${campaignCount === 1 ? "email" : "emails"}`
      : `No bulk email in this history matches ${text ? `“${text}”` : "these dates"}${range}.`}</p>
    {hits.length > 0 && <ul className="bulk-emails__search-hits">{hits.map(({ campaign, recipient }) => <li key={`${campaign.id}-${recipient?.email ?? "all"}`}>
      <button type="button" onClick={() => onOpen(campaign)}>
        <span className="bulk-emails__search-when"><strong>{bulkExactDate(bulkSentAt(campaign))}</strong>{campaign.mode === "preview" ? "Preview · no email sent" : campaign.firstAttemptAt ? "Sent" : "Not sent yet"}</span>
        <span className="bulk-emails__search-what"><strong>{recipient ? recipient.email : `All ${campaign.recipients.length} recipients`}</strong>{campaign.subject}</span>
        {recipient && <span className="bulk-emails__search-status" data-recipient-status={recipient.status}>{RECIPIENT_STATUS[recipient.status]}</span>}
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </li>)}</ul>}
    <p className="bulk-emails__hint">Searches the emails listed in this history. Emails deleted from history no longer keep their recipients, so they cannot be found.</p>
  </section>;
}
