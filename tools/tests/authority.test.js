// node --test tools/tests/authority.test.js
// Checks lab/authority.js against the rules printed in parts/p02.html.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../../lab/authority.js');

test('four worked examples in p02#examples: the higher instruction wins', () => {
  for (const k of ['library', 'store', 'tutor', 'testing']) {
    const e = L.EXAMPLES[k];
    const r = L.resolve(e.a, e.b, e.explicit);
    assert.strictEqual(r.winner, 'A', k);
    assert.strictEqual(r.ground, 'misaligned', k);
  }
});

test('p02#ladder: Root is overridden by nothing, not even a system message', () => {
  for (const b of ['system', 'developer', 'user', 'tool-delegated'])
    for (const ex of [true, false]) assert.strictEqual(L.resolve('root', b, ex).winner, 'A');
});

test('p02#ladder: User-level spec defaults change only explicitly', () => {
  assert.strictEqual(L.resolve('user-spec', 'user', true).winner, 'B');
  assert.strictEqual(L.resolve('user-spec', 'user', true).ground, 'superseded');
  assert.strictEqual(L.resolve('user-spec', 'user', false).winner, 'A');
  assert.strictEqual(L.resolve('user-spec', 'developer', false).winner, 'A');
});

test('p02#ladder: Guideline defaults yield to developer or user, implicitly too', () => {
  for (const b of ['developer', 'user']) {
    assert.strictEqual(L.resolve('guideline', b, true).winner, 'B');
    assert.strictEqual(L.resolve('guideline', b, false).winner, 'B');
  }
});

test('p02#filter: supersession is same-level only; recency never climbs', () => {
  assert.strictEqual(L.resolve('user-msg', 'user', true).ground, 'superseded');
  assert.strictEqual(L.resolve('developer', 'developer', true).ground, 'superseded');
  assert.strictEqual(L.resolve('developer', 'user', true).winner, 'A');
  assert.strictEqual(L.resolve('system', 'developer', true).winner, 'A');
});

test('p02#ladder: tool output has no authority unless delegated', () => {
  const r = L.resolve('user-msg', 'tool', true);
  assert.strictEqual(r.winner, 'A');
  assert.strictEqual(r.ground, 'no authority');
  assert.strictEqual(L.resolve('user-msg', 'tool-delegated', true).winner, 'B');
  assert.strictEqual(L.resolve('developer', 'tool-delegated', true).winner, 'A');
});
