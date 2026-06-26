import { Button, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFonts } from "../styles";

const cellReset = { padding: 0, margin: 0 } as const;

/** Small gold uppercase label above headings. */
export function EmailEyebrow({
  children,
  align = "center",
  color = emailColors.gold,
}: {
  children: string;
  align?: "left" | "center" | "right";
  color?: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 12px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              style={{
                color,
                fontFamily: emailFonts.body,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                lineHeight: "1.4",
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

/** Playfair Display heading — h1 style. */
export function EmailHeading({
  children,
  align = "center",
  size = "large",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
  size?: "large" | "medium";
}) {
  const fontSize = size === "large" ? "32px" : "24px";
  const lineHeight = size === "large" ? "1.25" : "1.35";

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 16px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              style={{
                color: emailColors.dark,
                fontFamily: emailFonts.display,
                fontSize,
                fontWeight: 500,
                lineHeight,
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

/** Inter body copy. */
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
      style={{ borderCollapse: "collapse", margin: "0 0 24px" }}
    >
      <tbody>
        <tr>
          <td align={align} style={cellReset}>
            <Text
              style={{
                color: muted ? emailColors.textSecondary : emailColors.textPrimary,
                fontFamily: emailFonts.body,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "1.7",
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

/** Gold horizontal rule accent. */
export function GoldDivider({ width = "80px" }: { width?: string }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 24px" }}
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

/** Highlight card with gold left border. */
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
      style={{ borderCollapse: "collapse", margin: "32px 0 0" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: emailColors.infoBg,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "24px 28px",
            }}
          >
            <Text
              style={{
                color: emailColors.dark,
                fontFamily: emailFonts.display,
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "1.4",
                margin: "0 0 10px",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.body,
                fontSize: "15px",
                fontWeight: 400,
                lineHeight: "1.7",
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

/** Gold CTA button — table-based for Outlook. */
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
      style={{ borderCollapse: "collapse", margin: "32px 0 8px" }}
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
                      backgroundColor: emailColors.gold,
                      borderRadius: "2px",
                      padding: 0,
                    }}
                  >
                    <Button
                      href={href}
                      style={{
                        backgroundColor: emailColors.gold,
                        border: "none",
                        borderRadius: "2px",
                        color: emailColors.dark,
                        display: "inline-block",
                        fontFamily: emailFonts.body,
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "2px",
                        lineHeight: "1",
                        padding: "16px 36px",
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

/** Bullet list with gold markers. */
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
              width="24"
              style={{
                color: emailColors.gold,
                fontFamily: emailFonts.body,
                fontSize: "16px",
                lineHeight: "1.7",
                padding: "0 0 10px",
              }}
            >
              ◆
            </td>
            <td
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.body,
                fontSize: "15px",
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
