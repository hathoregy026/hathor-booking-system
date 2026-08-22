import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Native flat config from eslint-config-next (ESLint 9+).
 * Avoids @eslint/eslintrc FlatCompat, which threw:
 *   TypeError: Converting circular structure to JSON
 * when validating the react plugin graph.
 */
const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "_local/**",
      // Scratch/probe files kept at the repo root during design work.
      ".tmp-*",
      ".tmp-*/**",
      "_tmp_*",
      "archive/**",
      "OLD DASHBOARD BACK UP/**",
      "redesign/**",
      "scripts/_tmp-*/**",
      "scripts/_tmp-*.mjs",
      "scripts/_tmp-*.json",
      // Captured Springs runtimes — not project source
      "public/gastronomy-springs/**",
      "public/suites-springs/**",
      "assets/CLONE. httpssprings.estate/**",
      "assets/GPT SITE RESTORE/**",
    ],
  },
];

export default eslintConfig;
