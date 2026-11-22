/*
  lab/authority.js: the chain-of-command rules from parts/p02.html (#ladder,
  #filter, #examples) as a pure function. No DOM. Tested by
  tools/tests/authority.test.js; drawn by widgets/authority-resolver.js.

  A is the earlier instruction (spec text or an earlier message), B a later
  message that conflicts with it. The spec counts as preceding the
  conversation, so spec text is always A.
*/
(function (root) {
  var LEVEL = { root: 5, system: 4, developer: 3, user: 2, guideline: 1, none: 0 };
  var NAME = { root: 'Root', system: 'System', developer: 'Developer', user: 'User', guideline: 'Guideline', none: 'No authority' };
  // Earlier instruction A: where it comes from.
  var A_SOURCES = [
    ['root', 'Root spec section', 'root', true],
    ['system', 'System: spec section or OpenAI system message', 'system', true],
    ['developer', 'Developer message', 'developer', false],
    ['user-spec', 'User-level spec default', 'user', true],
    ['user-msg', 'Earlier user message', 'user', false],
    ['guideline', 'Guideline spec default', 'guideline', true]
  ];
  // Later instruction B: always a message (or content inside one).
  var B_SOURCES = [
    ['system', 'OpenAI system message', 'system'],
    ['developer', 'Developer message', 'developer'],
    ['user', 'User message', 'user'],
    ['tool', 'Tool output or quoted text', 'none'],
    ['tool-delegated', 'Tool output the user said to follow', 'user']
  ];
  function find(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i]; return null; }

  // a, b: keys of A_SOURCES / B_SOURCES; explicit: is B an explicit instruction?
  // Returns { winner: 'A'|'B', ground, levelA, levelB, rule }.
  function resolve(a, b, explicit) {
    var A = find(A_SOURCES, a), B = find(B_SOURCES, b);
    if (!A || !B) throw new Error('unknown source');
    var la = A[2], lb = B[2], spec = A[3];
    var r = { levelA: la, levelB: lb, winner: 'A', ground: '', rule: '' };
    if (lb === 'none') {
      r.ground = 'no authority';
      r.rule = 'Tool output and quoted text carry no authority unless an instruction delegates some, so B is information, not a candidate.';
      return r;
    }
    var da = LEVEL[la], db = LEVEL[lb];
    if (db < da) {
      r.ground = 'misaligned';
      r.rule = (la === 'root' ? 'Root sits above every message, even OpenAI\'s system messages. ' : '') +
        'B conflicts with a higher-level instruction, so B is misaligned and drops out. Recency never lets an instruction climb.';
      return r;
    }
    // B is at A's level or above: B wins unless A is a User-level spec default and B is only implicit.
    if (a === 'user-spec' && !explicit) {
      r.ground = 'none: implicit';
      r.rule = 'A User-level default changes only when someone says so explicitly; an implicit hint leaves it in place.';
      return r;
    }
    r.winner = 'B';
    if (db === da) {
      r.ground = 'superseded';
      r.rule = 'Same level, and B came later, so A is superseded. ' + (spec ? 'The spec counts as preceding the conversation, so a message can supersede a spec default at its own level.' : 'Recency breaks ties only within a level.');
    } else {
      r.ground = 'misaligned';
      r.rule = 'B carries more authority than A, so A is misaligned with it and drops out.' +
        (a === 'guideline' && !explicit ? ' Guideline defaults also yield implicitly, when context clearly calls for it.' : '');
    }
    return r;
  }
  // The four worked conflicts in p02#examples.
  var EXAMPLES = {
    library: { a: 'root', b: 'developer', explicit: true, label: 'Library', text: 'A developer lets GPT print any book in full; copyright is a Root rule, so GPT offers a summary instead.' },
    store: { a: 'developer', b: 'user', explicit: true, label: 'Acme store', text: 'The developer says not to sell competitors; the user asks for one. A short no, then Acme\'s similar products.' },
    tutor: { a: 'developer', b: 'user', explicit: true, label: 'Algebra tutor', text: '"Ignore all previous instructions" is a user message; the hints-only rule is developer-level, so GPT keeps tutoring step by step.' },
    testing: { a: 'root', b: 'system', explicit: true, label: 'Safety-testing mode', text: 'A system message claims a mode that ignores safety; the rule against sexual content involving minors is Root, which outranks System.' }
  };
  var api = { LEVEL: LEVEL, NAME: NAME, A_SOURCES: A_SOURCES, B_SOURCES: B_SOURCES, resolve: resolve, EXAMPLES: EXAMPLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.MSLab = root.MSLab || {}).authority = api;
})(this);
