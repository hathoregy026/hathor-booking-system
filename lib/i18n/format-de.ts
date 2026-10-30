/**
 * German number and money formats: the dot groups thousands, the comma marks
 * decimals and the currency follows the amount ("7.000 $"), joined by a
 * no-break space so a line never starts with the symbol.
 */
export const NBSP = " ";

/** Whole dollars from cents: "7.000 $". */
export const usdDe = (cents: number) =>
  `${(cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })}${NBSP}$`;

/** A US-written dollar amount ("$7,000", "USD 3,000.00") in German form. */
export function usdTextDe(formatted: string): string {
  return formatted
    .replace(/[,.]/g, (mark) => (mark === "," ? "." : ","))
    .replace(/(\$|USD\s)\s*([\d.,]*\d)/g, (_, unit: string, amount: string) =>
      `${amount}${NBSP}${unit.trim()}`,
    );
}
