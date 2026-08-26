import { Button, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFonts } from "../styles";

const cellReset = { padding: 0, margin: 0 } as const;

/** Contact/About style: italic Playfair in parentheses, gold-deep. */
export function EmailEyebrow({
  children,
  align = "center",
  color = emailColors.goldDark,
}: {
  children: string;
  align?: "left" | "center" | "right";
  color?: string;
}) {
  const label = children.trim().startsWith("(")
    ? children.trim()
    : `(${children.trim()})`;

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 18px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              style={{
                color,
                fontFamily: emailFonts.editorial,
                fontSize: "15px",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: "1.4",
                margin: 0,
              }}
            >
              {label}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Italiana-style uppercase display heading. */
export function EmailHeading({
  children,
  align = "center",
  size = "large",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
  size?: "large" | "medium";
}) {
  const fontSize = size === "large" ? "42px" : "30px";
  const lineHeight = size === "large" ? "0.95" : "1.05";

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 20px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              className="email-heading"
              style={{
                color: emailColors.ink,
                fontFamily: emailFonts.display,
                fontSize,
                fontWeight: 400,
                letterSpacing: "-0.012em",
                lineHeight,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {children}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Plus Jakarta Sans body — light weight like Contact/About. */
export function EmailBodyText({
  children,
  align = "center",
  muted = false,
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
  muted?: boolean;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 22px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              style={{
                color: muted ? emailColors.textMuted : emailColors.textSecondary,
                fontFamily: emailFonts.body,
                fontSize: muted ? "13px" : "15px",
                fontWeight: 300,
                lineHeight: "1.65",
                margin: 0,
                maxWidth: "36em",
              }}
            >
              {children}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Hairline rule — Contact/About editorial, not a thick gold bar. */
export function GoldDivider({ width = "48px" }: { width?: string }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 28px" }}
    >
      <tbody>
        <tr>
          <td align="center" style={cellReset}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: emailColors.gold,
                      fontSize: 0,
                      height: "2px",
                      lineHeight: 0,
                      width,
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Soft sand info card. */
export function EmailInfoCard({
  title,
  children,
  borderColor = emailColors.gold,
}: {
  title: string;
  children: ReactNode;
  borderColor?: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "28px 0 0" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: emailColors.infoBg,
              borderLeft: `3px solid ${borderColor}`,
              padding: "24px 26px",
            }}
          >
            <Text
              style={{
                color: emailColors.ink,
                fontFamily: emailFonts.editorial,
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "1.35",
                margin: "0 0 10px",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.body,
                fontSize: "14px",
                fontWeight: 300,
                lineHeight: "1.65",
                margin: 0,
              }}
            >
              {children}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Pill CTA — ink border, uppercase tracked label (Contact DNA). */
export function EmailCtaButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "36px 0 8px" }}
    >
      <tbody>
        <tr>
          <td align="center" style={cellReset}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{
                      backgroundColor: emailColors.ink,
                      borderRadius: "999px",
                      padding: 0,
                    }}
                  >
                    <Button
                      href={href}
                      style={{
                        backgroundColor: emailColors.ink,
                        border: `1px solid ${emailColors.ink}`,
                        borderRadius: "999px",
                        color: emailColors.copyOnDark,
                        display: "inline-block",
                        fontFamily: emailFonts.body,
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        lineHeight: "1",
                        padding: "16px 34px",
                        textDecoration: "none",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Soft list with gold markers. */
export function EmailBulletList({ items }: { items: readonly string[] }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0" }}
    >
      <tbody>
        {items.map((item) => (
          <tr key={item}>
            <td
              valign="top"
              width="22"
              style={{
                color: emailColors.gold,
                fontFamily: emailFonts.body,
                fontSize: "14px",
                lineHeight: "1.7",
                padding: "0 0 10px",
              }}
            >
              ·
            </td>
            <td
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.body,
                fontSize: "14px",
                fontWeight: 300,
                lineHeight: "1.7",
                padding: "0 0 10px",
              }}
            >
              {item}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
