import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombinedPrompt } from '../prompts.js';

test('combined prompt keeps POM, spec, and JSON generation independent', () => {
  const prompt = getCombinedPrompt(
    [{ id: 'name', elementOuterHTML: '<input name="name" />' }],
    'https://example.com/form',
    'TypeScript',
    'sample',
    'Enter name and submit the form',
    '',
    ''
  );

  assert.match(prompt, /STAGE 1 — GENERATE THE POM CLASS/);
  assert.match(prompt, /STAGE 2 — GENERATE THE SPEC \(TEST\) FILE/);
  assert.match(prompt, /STAGE 3 — GENERATE THE TEST DATA \(JSON\) FILE/);
  assert.match(prompt, /POM generation must be based only on the captured DOM and selected elements/);
  assert.match(prompt, /Spec generation must be based only on the test case steps/);
  assert.match(prompt, /JSON generation must be based only on values explicitly present in the test case steps/);
});
