/* Regression for the shared Next image loader. No network or database access. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded.require = id => id === './fresh-media-src'
    ? load('lib/fresh-media-src.ts')
    : module.require(id);
  loaded._compile(source, filename);
  return loaded.exports;
}

const loader = load('lib/image-loader.ts').default;
const dark = '/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg';
const golden = '/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-golden.svg';
assert.equal(loader({ src: dark, width: 48, quality: 75 }), dark);
assert.equal(loader({ src: golden, width: 32, quality: 75 }), golden);
assert.equal(loader({ src: dark, width: 1080, quality: 90 }), dark, 'Responsive widths still use the same vector');
assert.ok(fs.existsSync(path.resolve(__dirname, '..', 'public' + dark)));
assert.ok(fs.existsSync(path.resolve(__dirname, '..', 'public' + golden)));
assert.match(loader({ src: '/media/hathor/optimized/room-luxury.webp', width: 640 }), /^\/media\/hathor\/optimized\/room-luxury\.webp\?v=\d+&w=640$/);
assert.match(loader({ src: 'https://images.unsplash.com/photo-1', width: 640, quality: 90 }), /^\/_next\/image\?/);
console.log('PASS: branding SVGs bypass the optimizer; photos keep their existing delivery paths.');
