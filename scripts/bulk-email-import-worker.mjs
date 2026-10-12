import { parentPort, workerData } from "node:worker_threads";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const MAX_TEXT = 1_000_000;
const MAX_EXPANDED = 20 * 1024 * 1024;

// Check the ZIP before the spreadsheet parser allocates its XML structures.
async function inspectWorkbook(buffer) {
  const yauzl = require("yauzl");
  await new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true }, (error, zip) => {
      if (error) return reject(error);
      let expanded = 0, entries = 0, workbook = false;
      const fail = () => { zip.close(); reject(new Error("This spreadsheet is too large or unsupported.")); };
      zip.on("error", reject);
      zip.on("entry", entry => {
        expanded += entry.uncompressedSize;
        if (++entries > 1000 || expanded > MAX_EXPANDED || entry.generalPurposeBitFlag & 1 || /vbaProject|externalLinks|embeddings/i.test(entry.fileName)) return fail();
        if (entry.fileName === "xl/workbook.xml") workbook = true;
        if (/\/$/.test(entry.fileName)) return zip.readEntry();
        zip.openReadStream(entry, (error, stream) => {
          if (error) return fail();
          let bytes = 0;
          stream.on("data", chunk => { bytes += chunk.length; if (bytes > entry.uncompressedSize || bytes > MAX_EXPANDED) { stream.destroy(); fail(); } });
          stream.on("error", fail);
          stream.on("end", () => zip.readEntry());
        });
      });
      zip.on("end", () => workbook ? resolve() : reject(new Error("Upload an Excel .xlsx workbook.")));
      zip.readEntry();
    });
  });
}

try {
  const buffer = Buffer.from(workerData.bytes);
  const parts = [];
  let length = 0;
  function add(value) {
    if (typeof value !== "string") return;
    length += value.length;
    if (length > MAX_TEXT || parts.length >= 50000) throw new Error("The file contains too much text. Upload a smaller list.");
    parts.push(value);
  }
  if (workerData.kind === "xlsx") {
    await inspectWorkbook(buffer);
    const { default: readExcelFile } = await import("read-excel-file/node");
    const sheets = await readExcelFile(buffer);
    if (sheets.length > 20) throw new Error("Use a workbook with no more than 20 sheets.");
    for (const sheet of sheets) for (const row of sheet.data) for (const cell of row) add(cell);
  } else if (workerData.kind === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const task = pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true, useSystemFonts: false, verbosity: 0, stopAtErrors: true });
    try {
      const document = await task.promise;
      if (document.numPages > 50) throw new Error("Use a PDF with no more than 50 pages.");
      for (let i = 1; i <= document.numPages; i++) {
        const page = await document.getPage(i);
        const content = await page.getTextContent();
        // PDF glyph runs may split an address; concatenate adjacent runs on the same line.
        let line = "";
        for (const item of content.items) {
          if (!("str" in item)) continue;
          line += item.str;
          if (item.hasEOL) { add(line); line = ""; }
        }
        add(line);
        page.cleanup();
      }
    } finally { await task.destroy(); }
  } else {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    if (text.includes("\0")) throw new Error("Upload a UTF-8 CSV file.");
    add(text);
  }
  parentPort.postMessage({ parts });
} catch (error) {
  // Parser diagnostics may contain file contents. Only controlled messages leave the worker.
  const allowed = ["The list", "This spreadsheet", "Upload an Excel", "The file contains", "Use a workbook", "Use a PDF", "Upload a UTF-8"];
  parentPort.postMessage({ error: allowed.some(prefix => error?.message?.startsWith(prefix)) ? error.message : "Unable to read this file. Use an unprotected Excel .xlsx, UTF-8 CSV, or text-based PDF." });
}
