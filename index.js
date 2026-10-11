/* cspell:words endosome */
import { fileURLToPath } from 'node:url';

// a CommonJS module with __esModule interop: the default export exists at runtime, import-x cannot see it
// eslint-disable-next-line import-x/default
import cspell from '@cspell/eslint-plugin/recommended';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import html from 'eslint-plugin-html';
import { createNodeResolver, flatConfigs as importFlatConfigs } from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import tsdoc from 'eslint-plugin-tsdoc';
import unicorn from 'eslint-plugin-unicorn';
import { configs as tsConfigs, parser as tsParser } from 'typescript-eslint';

import coreRules from './rules/core.js';
import nodeRules from './rules/node.js';
import otherRules from './rules/other.js';
import stylisticRules from './rules/stylistic.js';
import typescriptRules from './rules/typescript.js';
import unicornRules from './rules/unicorn.js';

const javaScriptFiles = ['**/*.{js,jsx,mjs,cjs}'];
const typeScriptFiles = ['**/*.{ts,tsx,mts,cts}'];
const htmlFiles = ['**/*.html'];
const sourceFiles = [...javaScriptFiles, ...typeScriptFiles];
// eslint-plugin-html lints the scripts of an HTML file with the config of the HTML file itself
const lintedFiles = [...sourceFiles, ...htmlFiles];

// every eslint-plugin-security rule is a warning, as in its former "recommended-legacy" preset
const securityRules = Object.fromEntries(Object.keys(security.rules).map(rule => [`security/${rule}`, 'warn']));

export default defineConfig([
  globalIgnores(['build/**']),

  tsConfigs.recommended,
  importFlatConfigs.recommended,
  importFlatConfigs.typescript,
  promise.configs['flat/recommended'],
  cspell,
  n.configs['flat/recommended'],

  {
    name: 'endosome/node',
    files: lintedFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // type information comes from the nearest tsconfig.json
        projectService: true,
        extraFileExtensions: ['.html'],
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'sort-destructure-keys': sortDestructureKeys,
      tsdoc,
      unicorn,
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver(), createNodeResolver()],
    },
    rules: {
      ...securityRules,
      ...coreRules,
      ...typescriptRules,
      ...stylisticRules,
      ...unicornRules,
      ...nodeRules,
      ...otherRules,
      '@cspell/spellchecker': [
        'warn',
        { customWordListFile: { path: fileURLToPath(new URL('custom_words.txt', import.meta.url)) } },
      ],
    },
  },
  { name: 'endosome/security', files: lintedFiles, plugins: { security }, rules: securityRules },

  // plain JavaScript is not part of a tsconfig.json, so it gets no rules that need type information
  { name: 'endosome/javascript', files: javaScriptFiles, extends: [tsConfigs.disableTypeChecked] },

  // scripts inside HTML files: no type information there either
  {
    name: 'endosome/html',
    files: htmlFiles,
    extends: [tsConfigs.disableTypeChecked],
    plugins: { html },
    settings: { 'html/indent': '+2', 'html/report-bad-indent': 'error' },
  },
]);
