import { Link, Text } from "@react-email/components";
import type { EmailPaymentStage } from "@/lib/email-types";
import { emailColors, emailFonts, SITE_URL } from "../styles";
import { GoldSectionTitle } from "./EmailLayout";

const reset = { padding: 0, margin: 0 } as const;

/** The booking code, large, with how to track the booking with it. */
export function BookingCodeCard({ code, trackUrl }: { code: string; trackUrl?: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: "collapse", margin: "8px 0 0" }}>
      <tbody>
        <tr>
          <td align="center" style={{ border: `1px solid ${emailColors.borderGold}`, backgroundColor: emailColors.paperWarm, padding: "24px 20px" }}>
            <Text style={{ color: emailColors.goldDark, fontFamily: emailFonts.body, fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", lineHeight: "1.4", margin: "0 0 8px", textTransform: "uppercase" }}>
              Your booking code
            </Text>
            <Text style={{ color: emailColors.ink, fontFamily: emailFonts.body, fontSize: "28px", fontWeight: 500, fontVariantNumeric: "lining-nums tabular-nums", letterSpacing: "0.12em", lineHeight: "1.2", margin: "0 0 10px" }}>
              {code}
            </Text>
            <Text style={{ color: emailColors.textSecondary, fontFamily: emailFonts.body, fontSize: "13px", fontWeight: 300, lineHeight: "1.6", margin: 0 }}>
              Track your booking any time at{" "}
              <Link href={trackUrl ?? `${SITE_URL}/booking/lookup`} style={{ color: emailColors.goldDark, textDecoration: "underline" }}>
                {`${SITE_URL.replace(/^https?:\/\//, "")}/booking/lookup`}
              </Link>{" "}
              with this code and your email.
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const STATE_LABEL: Record<EmailPaymentStage["state"], string> = { paid: "Received", due: "Due now", upcoming: "Upcoming" };

/** Each payment stage with its amount and whether it is received, due or still to come. */
export function PaymentPlanTable({ stages, title = "Payment Schedule" }: { stages: EmailPaymentStage[]; title?: string }) {
  if (stages.length === 0) return null;
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: "collapse", margin: "32px 0 0" }}>
      <tbody>
        <tr>
          <td style={reset}>
            <GoldSectionTitle>{title}</GoldSectionTitle>
            <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ border: `1px solid ${emailColors.borderSolid}`, borderCollapse: "collapse" }}>
              <tbody>
                {stages.map((stage, index) => {
                  const highlight = stage.state === "due";
                  const background = highlight ? emailColors.goldLight : index % 2 ? emailColors.rowAlt : emailColors.paperWarm;
                  return (
                    <tr key={`${stage.title}-${index}`}>
                      <td style={{ backgroundColor: background, borderBottom: `1px solid ${emailColors.borderSolid}`, padding: "14px 16px", verticalAlign: "top" }}>
                        <Text style={{ color: emailColors.ink, fontFamily: emailFonts.body, fontSize: "14px", fontWeight: 500, lineHeight: "1.4", margin: "0 0 2px" }}>{stage.percent ? `${stage.title} · ${stage.percent}%` : stage.title}</Text>
                        <Text style={{ color: emailColors.textMuted, fontFamily: emailFonts.body, fontSize: "12px", fontWeight: 300, lineHeight: "1.5", margin: 0 }}>{stage.when}</Text>
                      </td>
                      <td align="right" style={{ backgroundColor: background, borderBottom: `1px solid ${emailColors.borderSolid}`, padding: "14px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        <Text style={{ color: highlight ? emailColors.ink : emailColors.goldDark, fontFamily: emailFonts.editorial, fontSize: "17px", fontWeight: 500, lineHeight: "1.3", margin: "0 0 2px" }}>{stage.amount}</Text>
                        <Text style={{ color: stage.state === "paid" ? emailColors.goldDark : emailColors.textMuted, fontFamily: emailFonts.body, fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", lineHeight: "1.4", margin: 0, textTransform: "uppercase" }}>
                          {STATE_LABEL[stage.state]}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** A large amount with a label, e.g. the deposit due now or the amount received. */
export function AmountCallout({ label, amount, note }: { label: string; amount: string; note?: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: "collapse", margin: "28px 0 0" }}>
      <tbody>
        <tr>
          <td align="center" style={{ backgroundColor: emailColors.ink, padding: "26px 20px" }}>
            <Text style={{ color: emailColors.gold, fontFamily: emailFonts.body, fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", lineHeight: "1.4", margin: "0 0 8px", textTransform: "uppercase" }}>{label}</Text>
            <Text style={{ color: emailColors.copyOnDark, fontFamily: emailFonts.editorial, fontSize: "32px", fontWeight: 500, lineHeight: "1.2", margin: note ? "0 0 8px" : 0 }}>{amount}</Text>
            {note ? (
              <Text style={{ color: "rgba(246, 239, 223, 0.72)", fontFamily: emailFonts.body, fontSize: "13px", fontWeight: 300, lineHeight: "1.6", margin: 0 }}>{note}</Text>
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Free text written by the team, kept as they typed it (line breaks included). */
export function TeamMessage({ title, text, spaceAfter = false }: { title?: string; text: string; spaceAfter?: boolean }) {
  const paragraphs = text.split(/\n{2,}/).map(part => part.trim()).filter(Boolean);
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: "collapse", margin: spaceAfter ? "28px 0 28px" : "28px 0 0" }}>
      <tbody>
        <tr>
          <td style={{ backgroundColor: emailColors.paperWarm, borderLeft: `3px solid ${emailColors.gold}`, padding: "24px 26px" }}>
            {title ? (
              <Text style={{ color: emailColors.ink, fontFamily: emailFonts.editorial, fontSize: "19px", fontWeight: 500, lineHeight: "1.35", margin: "0 0 12px" }}>{title}</Text>
            ) : null}
            {paragraphs.map((paragraph, index) => (
              <Text key={index} style={{ color: emailColors.textSecondary, fontFamily: emailFonts.body, fontSize: "14px", fontWeight: 300, lineHeight: "1.7", margin: index === paragraphs.length - 1 ? 0 : "0 0 14px", whiteSpace: "pre-line" }}>
                {paragraph}
              </Text>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
