import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // docs/ holds the committed GitHub Pages build output, not source.
    "docs/**",
    // .netlify/ is the Netlify CLI's scratch dir for bundling the functions in
    // netlify/functions/. Flat config does not read .gitignore, so without this
    // a single `netlify dev` run makes `npm run lint` report thousands of
    // problems in generated, minified code.
    ".netlify/**",
  ]),
]);

export default eslintConfig;
