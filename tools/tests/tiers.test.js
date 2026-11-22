// node --test tools/tests/tiers.test.js
// Checks lab/tiers.js against the table in parts/p07.html#tiers.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../../lab/tiers.js');
const all = (type) => {
  const out = [];
  for (const context of [false, true]) for (const transform of [false, true])
    for (const [mover] of L.MOVERS) out.push(L.sort({ type, context, transform, mover }));
  return out;
};

test('p07#tiers table: tiers and badges', () => {
  const want = { minors: 'prohibited/root', hazard: 'restricted/root', political: 'restricted/root', creators: 'restricted/root',
    privacy: 'restricted/root', erotica: 'sensitive/system', extremist: 'sensitive/root', hateful: 'sensitive/root', abuse: 'sensitive/user' };
  for (const [k, v] of Object.entries(want)) {
    const r = L.sort({ type: k, context: false, transform: false, mover: 'nobody' });
    assert.strictEqual(r.tier + '/' + r.badge, v, k);
  }
});

test('prohibited: nothing opens it', () => {
  for (const r of all('minors')) assert.strictEqual(r.open, false);
});

test('restricted: only transformation opens it, never context', () => {
  for (const t of ['hazard', 'political', 'creators', 'privacy']) {
    assert.strictEqual(L.sort({ type: t, context: true, transform: false, mover: 'system' }).open, false, t);
    assert.strictEqual(L.sort({ type: t, context: false, transform: true, mover: 'nobody' }).open, true, t);
  }
});

test('sensitive: context or transformation opens it', () => {
  for (const t of ['erotica', 'extremist', 'hateful', 'abuse']) {
    assert.strictEqual(L.sort({ type: t, context: false, transform: false, mover: 'nobody' }).open, false, t);
    assert.strictEqual(L.sort({ type: t, context: true, transform: false, mover: 'nobody' }).open, true, t);
    assert.strictEqual(L.sort({ type: t, context: false, transform: true, mover: 'nobody' }).open, true, t);
  }
});

test('badge says who can move it: System only by OpenAI, User by an explicit user (the roast)', () => {
  const base = { context: false, transform: false };
  assert.strictEqual(L.sort({ ...base, type: 'erotica', mover: 'developer' }).open, false);
  assert.strictEqual(L.sort({ ...base, type: 'erotica', mover: 'system' }).open, true);
  assert.strictEqual(L.sort({ ...base, type: 'abuse', mover: 'user' }).open, true);
  assert.strictEqual(L.sort({ ...base, type: 'hateful', mover: 'system' }).open, false);
});
