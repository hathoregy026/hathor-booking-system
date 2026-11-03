/**
 * Russian number, money and plural forms: a no-break space groups thousands,
 * the comma marks decimals and the currency follows the amount ("7 000 $"),
 * joined by a no-break space so a line never starts with the symbol.
 */
export const NBSP = " ";

const PLURAL = new Intl.PluralRules("ru-RU");

/**
 * The noun form for a count: `[one, few, many]`, as in
 * `pluralRu(n, NIGHTS_RU)` → 1 ночь, 2 ночи, 5 ночей, 21 ночь.
 */
export function pluralRu(count: number, forms: readonly [string, string, string]): string {
  const rule = PLURAL.select(count);
  return rule === "one" ? forms[0] : rule === "few" ? forms[1] : forms[2];
}

/** A count with its noun: `countRu(4, NIGHTS_RU)` → "4 ночи". */
export const countRu = (count: number, forms: readonly [string, string, string]) =>
  `${count}${NBSP}${pluralRu(count, forms)}`;

/** The counts every page repeats. */
export const NIGHTS_RU = ["ночь", "ночи", "ночей"] as const;
export const DAYS_RU = ["день", "дня", "дней"] as const;
export const GUESTS_RU = ["гость", "гостя", "гостей"] as const;
export const CABINS_RU = ["каюта", "каюты", "кают"] as const;

/** "до 2 гостей": after «до» the noun takes the genitive (до 1 гостя, до 2 гостей, до 21 гостя). */
export const upToGuestsRu = (count: number) =>
  `до${NBSP}${count}${NBSP}${count % 10 === 1 && count % 100 !== 11 ? "гостя" : "гостей"}`;

const groupRu = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 }).replace(/,/g, NBSP);

/** Whole dollars from cents: "7 000 $". */
export const usdRu = (cents: number) => `${groupRu(Math.round(cents / 100))}${NBSP}$`;

/** A US-written dollar amount ("$7,000", "USD 3,000.00") in Russian form ("7 000 $", "3 000,00 USD"). */
export function usdTextRu(formatted: string): string {
  return formatted
    .replace(/[,.]/g, (mark) => (mark === "," ? NBSP : ","))
    .replace(/(\$|USD\s)\s*([\d ,]*\d)/g, (_, unit: string, amount: string) =>
      `${amount}${NBSP}${unit.trim()}`,
    );
}
