/**
 * CSS rendered into a server-side <style> element is raw text to the HTML
 * parser: a `</style>` anywhere inside it ends the element and whatever
 * follows is parsed as markup. `</` never occurs in valid CSS outside a
 * string, and `<\/` means the same thing inside one, so escaping it keeps
 * every stylesheet identical while making breakout impossible.
 */
export function safeStyleText(css: string): string {
  return css.replace(/<\//g, "<\\/");
}
