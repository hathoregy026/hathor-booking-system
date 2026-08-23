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
    /**
     * React Compiler lint rules (new in eslint-plugin-react-hooks v6).
     *
     * `set-state-in-effect` and `immutability` flag patterns this codebase uses
     * deliberately — chiefly client components that fetch on mount, which is
     * the documented trade-off of a client-side admin panel. As errors they
     * block every commit; as warnings they stay visible without gating work.
     *
     * The classic correctness rules (rules-of-hooks, exhaustive-deps) stay at
     * error — those catch genuine bugs, not stylistic disagreements.
     *
     * Revisit if/when the admin panel moves to server components or a data
     * library, at which point these should go back to "error".
     */
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
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
      // Captured third-party runtimes — vendored bundles, not project source.
      "public/gastronomy-springs/**",
      "public/suites-springs/**",
      "public/suites-normal/**",
      "public/accommodation-springs/**",
      "public/springs-layout/**",
      "assets/CLONE. httpssprings.estate/**",
      "assets/GPT SITE RESTORE/**",
      "assets/NORMAL IS DEF BORING/**",
      // Minified and vendored JS anywhere: linting a bundle reports the
      // bundler's output style, never a defect we can act on.
      "**/vendor/**",
      "**/*.min.js",
    ],
  },
];

export default eslintConfig;
