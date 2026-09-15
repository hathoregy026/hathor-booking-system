const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const original = Module._resolveFilename;
Module._resolveFilename = function(name, parent, ...rest) { return original.call(this, name.startsWith('@/') ? path.resolve(name.slice(2)) : name, parent, ...rest); };
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8').replaceAll('import.meta.url', JSON.stringify(require('url').pathToFileURL(filename).href)), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
require(path.resolve(process.argv[2]));
