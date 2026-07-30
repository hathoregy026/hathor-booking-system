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
      "scripts/_tmp-*/**",
      "scripts/_tmp-*.mjs",
      "scripts/_tmp-*.json",
    ],
  },
];

export default eslintConfig;
