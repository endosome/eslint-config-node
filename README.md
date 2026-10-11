# @endosome/eslint-config-node

A shared [ESLint](https://eslint.org) flat config for Node.js and TypeScript projects. It carries over the rules of
an earlier ESLint 8 shared config (eslintrc format) and supports **ESLint 10 only**.

It lints JavaScript, TypeScript and the scripts inside HTML files with:
[typescript-eslint](https://typescript-eslint.io), [unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn),
[import-x](https://github.com/un-ts/eslint-plugin-import-x), [n](https://github.com/eslint-community/eslint-plugin-n),
[promise](https://github.com/eslint-community/eslint-plugin-promise),
[security](https://github.com/eslint-community/eslint-plugin-security),
[tsdoc](https://tsdoc.org), [sort-destructure-keys](https://github.com/mthadley/eslint-plugin-sort-destructure-keys),
[@cspell](https://cspell.org) and [@stylistic](https://eslint.style).

## Requirements

- ESLint `^10.0.0`
- Node.js `>=22.18.0`
- TypeScript `>=4.8.4 <6.1.0`. typescript-eslint does not support TypeScript 7 yet, so a project that uses TypeScript 7
  for building still needs TypeScript 6 installed for linting.

## Usage

```sh
npm install --save-dev eslint typescript @endosome/eslint-config-node
```

```js
// eslint.config.js
export { default } from '@endosome/eslint-config-node';
```

The export is an array of flat config objects, so project rules go after it:

```js
import config from '@endosome/eslint-config-node';

export default [
  ...config,
  { ignores: ['dist/**'] },
  {
    files: ['**/*.test.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];
```

Rules that need type information use the nearest `tsconfig.json` (`parserOptions.projectService: true`) and only run on
TypeScript files. A TypeScript file that is not part of any tsconfig is an error; add it to a tsconfig or list it in
`parserOptions.projectService.allowDefaultProject`. JavaScript and HTML files are linted without type information.
`build/**` is ignored.

## Differences from the earlier ESLint 8 config

"The same rules" holds for the rule set; the plugins underneath moved from ESLint 8 and typescript-eslint 6 to ESLint 10
and typescript-eslint 8, and that changes some names. The rules that the earlier config had active (compared with
`eslint --print-config`) are all active here with the same severity and options, except the three listed under "Rules
that are gone"; renamed rules are listed below.

**Format**

- A flat config for ESLint 10 (`eslint.config.js`) instead of `eslintConfig`/`.eslintrc`. The earlier config was
  a base config with a Node.js config on top; they are merged into this one package.
- `parserOptions.projectService: true` replaces `project: './tsconfig.json'`, and `ecmaVersion` is `latest` (was 2020).
- Type-aware rules only run on TypeScript files (the old config also applied them to JavaScript, where they fail
  unless the file is in a tsconfig).

**Plugins that were replaced**

| Before | Now |
|---|---|
| `eslint-plugin-import` (`import/*` rules) | `eslint-plugin-import-x` (`import-x/*`) |
| `eslint-plugin-deprecation` (`deprecation/deprecation`) | `@typescript-eslint/no-deprecated` |
| `@typescript-eslint/quotes`, `member-delimiter-style`, `lines-between-class-members` | `@stylistic/quotes` (`allowTemplateLiterals: 'never'`), `@stylistic/member-delimiter-style`, `@stylistic/lines-between-class-members`, with the same options |

**Rules that were renamed**

| Before | Now |
|---|---|
| `@typescript-eslint/no-throw-literal` | `@typescript-eslint/only-throw-error` |
| `@typescript-eslint/no-empty-interface` | `@typescript-eslint/no-empty-object-type` |
| `@typescript-eslint/no-loss-of-precision`, `@typescript-eslint/no-loop-func` | `no-loss-of-precision`, `no-loop-func` (ESLint core) |
| `unicorn/prevent-abbreviations` | `unicorn/name-replacements` |
| `unicorn/prefer-dom-node-dataset` | `unicorn/dom-node-dataset` |
| `unicorn/no-array-push-push` | `unicorn/prefer-single-call` |
| `unicorn/no-array-for-each` | `unicorn/no-for-each` |
| `unicorn/no-instanceof-array` | `unicorn/no-instanceof-builtins` |
| `unicorn/prefer-object-has-own` | `prefer-object-has-own` (ESLint core) |
| `unicorn/no-hex-escape` | `unicorn/prefer-literal-ascii` and `unicorn/prefer-unicode-code-point-escapes` |
| `n/shebang` | `n/hashbang` |

**Rules that are gone**

- `@typescript-eslint/no-var-requires`: deprecated, and `@typescript-eslint/no-require-imports` (also an error) covers it.
- `unicorn/better-regex`: deprecated by unicorn without a replacement (it recommends `eslint-plugin-regexp`).
- `unicorn/no-unsafe-regex`: removed from unicorn; `security/detect-unsafe-regex` stays on as a warning.
- Every `off` entry for a rule that no longer exists, for example the formatting rules typescript-eslint moved out.

**Rules that are new**

- `@typescript-eslint/no-unsafe-function-type` and `@typescript-eslint/no-wrapper-object-types`, from the
  typescript-eslint 8 `recommended` preset. They replace `@typescript-eslint/ban-types`, which was removed (the old
  config had it off).
- `security/detect-invisible-characters` (warning), new in eslint-plugin-security.

**Other**

- unicorn's own `recommended` preset is **not** extended: unicorn 77 turns on about 235 rules that unicorn 50 did not.
  Exactly the rules the old config had active are listed instead.
- `@typescript-eslint/sort-type-constituents` is kept although typescript-eslint deprecated it; it will go when
  typescript-eslint removes it.
- The spell-check word list (`custom_words.txt`) only has the generic words; company names were left out.
- `eslint-plugin-playwright` was a dependency of the old config but never used, and is not included.
- The resolved rule options look longer than before because ESLint 10 prints the default options of a rule.

## Migrating a project

1. Remove the earlier shared config, `@typescript-eslint/*`, `eslint-plugin-*` and `eslint@8` from the project's
   dependencies; install `eslint@10`, `@endosome/eslint-config-node` and a TypeScript below 6.1.
2. Move `eslintConfig` (or `.eslintrc.*`) to `eslint.config.js` as shown above. `ignorePatterns` become `ignores`,
   `overrides` become objects with `files`.
3. Rename the rules the project overrides, as listed above, and `import/*` to `import-x/*`. A rule that no longer
   exists is an error when it is set to `error` or `warn` ("Could not find ... in plugin"); setting it to `off` is
   harmless but does nothing.
4. `eslint . --ext .ts` can become `eslint .`: `.ts` files are linted by default now.

## License

MIT.
