import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ESLint } from 'eslint';

const cwd = new URL('fixtures/', import.meta.url).pathname;

const lint = async file => {
  const eslint = new ESLint({ cwd, overrideConfigFile: 'eslint.config.js' });
  const [result] = await eslint.lintFiles([file]);

  return result.messages;
};
const rulesOf = messages => new Set(messages.map(message => message.ruleId));

test('a clean TypeScript file passes without errors', async () => {
  const messages = await lint('clean.ts');

  assert.deepEqual(messages.filter(message => message.severity === 2), []);
});

test('rules from every plugin report in a TypeScript file', async () => {
  const messages = await lint('dirty.ts');

  assert.deepEqual(
    messages.filter(message => message.fatal || message.ruleId === null),
    [],
    'nothing is fatal and no rule is unknown'
  );

  const expected = [
    'no-var', // core
    'curly', // core
    'no-console', // core
    '@typescript-eslint/no-unused-vars',
    '@typescript-eslint/no-explicit-any',
    '@typescript-eslint/consistent-type-definitions',
    '@typescript-eslint/array-type',
    '@typescript-eslint/no-floating-promises', // needs type information
    '@stylistic/quotes',
    'unicorn/no-for-each',
    'unicorn/explicit-length-check',
    'unicorn/no-instanceof-builtins',
  ];
  const reported = rulesOf(messages);
  const missing = expected.filter(rule => !reported.has(rule));

  assert.deepEqual(missing, [], `these rules did not report: ${missing.join(', ')}`);
});

test('plain JavaScript is linted without type information', async () => {
  const messages = await lint('plain.js');

  assert.deepEqual(messages.filter(message => message.fatal), []);
  assert.ok(rulesOf(messages).has('curly'));
  assert.ok(rulesOf(messages).has('no-console'));
});

test('scripts inside HTML are linted', async () => {
  const messages = await lint('page.html');

  assert.deepEqual(messages.filter(message => message.fatal), []);
  assert.ok(rulesOf(messages).has('no-console'));
});
