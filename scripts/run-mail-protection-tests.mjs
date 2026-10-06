import ts from "typescript";
import Module, { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Repository-only loader: no package downloads or live service calls. Tests
// inject fake database/email providers. Next dev remains the actual UI runtime.
const require = createRequire(import.meta.url);
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  return resolve.call(this, id.startsWith("@/") ? path.resolve(process.cwd(), id.slice(2)) : id, ...args);
}
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    let source = readFileSync(filename, "utf8").replaceAll("import.meta.url", JSON.stringify(pathToFileURL(filename).href));
    // Test scripts may use an ESM-scoped createRequire; avoid shadowing the
    // CommonJS wrapper's require after transpilation.
    if (/const require = createRequire/.test(source)) source = source.replace(/\brequire\b/g, "fixtureRequire").replace(/fixtureRequire:\s*\(/g, "require: (");
    const code = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText;
    module._compile(code, filename);
  };
}
const tests = process.argv.slice(2);
if (!tests.length) throw new Error("Pass explicit fixture test filenames.");
for (const test of tests) require(path.resolve(`scripts/${test}`));
