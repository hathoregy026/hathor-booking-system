export type EmailTextPart = { kind: "message" | "quote"; text: string; history?: boolean };

export function cleanEmailDisplayText(value: string): string {
  return value.replace(/\r\n?/g, "\n").split("\n").map(line => {
    if (/^[\s>\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff\u00ad]*$/.test(line)) return line.match(/^\s*>+/)?.[0].trim() ?? "";
    return line.replace(/[\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff\u00ad]/g, "").replace(/\u00a0/g, " ").trimEnd();
  }).join("\n").replace(/\n{4,}/g, "\n\n\n").trim();
}

export function splitEmailDisplayText(value: string): EmailTextPart[] {
  const lines = cleanEmailDisplayText(value).split("\n");
  const parts: EmailTextPart[] = [];
  let plain: string[] = [];
  function flush() {
    const text = plain.join("\n").trim();
    if (text) parts.push({ kind: "message", text });
    plain = [];
  }
  for (let index = 0; index < lines.length;) {
    let quoteStart = index;
    let history = false;
    if (/^\s*On\s/i.test(lines[index])) {
      for (let end = index; end < Math.min(index + 6, lines.length); end += 1) {
        const header = lines.slice(index, end + 1).join(" ").replace(/\s+/g, " ").trim();
        if (!/^On .{1,900}wrote:$/i.test(header)) continue;
        let next = end + 1;
        while (next < lines.length && !lines[next].trim()) next += 1;
        if (/^\s*>/.test(lines[next] ?? "")) { quoteStart = next; history = true; }
        break;
      }
    }
    if (history || /^\s*>/.test(lines[index])) {
      flush();
      let end = quoteStart;
      while (end < lines.length && (/^\s*>/.test(lines[end]) || !lines[end].trim())) end += 1;
      const text = lines.slice(index, end).map(line => line.replace(/^\s*> ?/, "")).join("\n").trim();
      if (text) parts.push({ kind: "quote", text, history });
      index = end;
    } else { plain.push(lines[index]); index += 1; }
  }
  flush();
  return parts;
}

export function emailDisplayPreview(value: string): string {
  const parts = splitEmailDisplayText(value);
  const messages = parts.filter(part => part.kind === "message");
  return (messages.length ? messages : parts).map(part => part.text).join(" ").replace(/\s+/g, " ").slice(0, 160);
}
