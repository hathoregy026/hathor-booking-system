/* Regression for the shared Next image loader. No network or database access. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { createHash } = require('node:crypto');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded.require = id => id === './fresh-media-src'
    ? load('lib/fresh-media-src.ts')
    : id === './responsive-media'
      ? load('lib/responsive-media.ts')
      : id === './responsive-media-manifest.json'
        ? require(path.resolve(__dirname, '..', 'lib/responsive-media-manifest.json'))
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
const optimized = loader({ src: '/media/hathor/r2/landmark-valley-kings.webp', width: 256 });
assert.match(optimized, /^\/media\/hathor\/responsive\/r2\/landmark-valley-kings-384\.webp\?v=[a-f0-9]{12}$/);
assert.ok(fs.existsSync(path.resolve(__dirname, '..', 'public' + optimized.split('?')[0])));
assert.match(loader({ src: '/media/hathor/r2/landmark-valley-kings.webp', width: 1920 }), /^\/media\/hathor\/r2\/landmark-valley-kings\.webp\?v=\d+&w=1920$/);
assert.match(loader({ src: '/media/hathor/ship/main-deck.webp', width: 640 }), /^\/media\/hathor\/ship\/main-deck\.webp\?v=\d+&w=640$/);
assert.match(loader({ src: 'https://images.unsplash.com/photo-1', width: 640, quality: 90 }), /^\/_next\/image\?/);
for (const [source, entry] of Object.entries(require('../lib/responsive-media-manifest.json'))) {
  const sourceFile = path.resolve(__dirname, '..', 'public' + source);
  assert.equal(createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex').slice(0, 12), entry.version, `stale derivatives for ${source}`);
  for (const width of entry.widths) {
    const result = loader({ src: source, width });
    assert.ok(fs.existsSync(path.resolve(__dirname, '..', 'public' + result.split('?')[0])), `missing ${result}`);
  }
}
console.log('PASS: SVGs and CMS URLs retain their paths; all responsive photo URLs exist; full-size and ship plans fall back to originals.');
