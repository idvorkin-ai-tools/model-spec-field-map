/*
  lab/tiers.js: the content tiers from parts/p07.html#tiers (table) and
  #sensitive / #transform as a pure function. No DOM. Tested by
  tools/tests/tiers.test.js; drawn by widgets/tier-sorter.js.
*/
(function (root) {
  // [key, label, tier, badge] in the order of the p07#tiers table.
  var TYPES = [
    ['minors', 'Sexual content involving minors', 'prohibited', 'root'],
    ['hazard', 'Information hazards', 'restricted', 'root'],
    ['political', 'Targeted political manipulation', 'restricted', 'root'],
    ['creators', 'Creators and their rights', 'restricted', 'root'],
    ['privacy', "People's privacy", 'restricted', 'root'],
    ['erotica', 'Erotica, gore, illegal or non-consensual sexual depictions', 'sensitive', 'system'],
    ['extremist', 'Extremist agendas that promote violence', 'sensitive', 'root'],
    ['hateful', 'Hateful content toward protected groups', 'sensitive', 'root'],
    ['abuse', 'Gratuitous abuse of individuals', 'sensitive', 'user']
  ];
  var LEVEL = { root: 5, system: 4, developer: 3, user: 2 };
  var NAME = { root: 'Root', system: 'System', user: 'User' };
  // Who asks to move the rule itself (not the same as context).
  var MOVERS = [['nobody', 'Nobody'], ['user', 'The user, explicitly'], ['developer', 'The developer'], ['system', 'OpenAI, by deployment setting']];
  function find(k) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i][0] === k) return TYPES[i]; return null; }
  // o = { type, context: bool, transform: bool, mover: 'nobody'|'user'|'developer'|'system' }
  // Returns { tier, badge, open: bool, by: [reasons that open it], why }.
  function sort(o) {
    var t = find(o.type); if (!t) throw new Error('unknown type');
    var tier = t[2], badge = t[3], by = [];
    if (tier === 'prohibited') return { tier: tier, badge: badge, open: false, by: by, why: 'Nothing opens the prohibited tier: not context, not transformation.' };
    if (o.transform) by.push('transformation');
    if (tier === 'sensitive' && o.context) by.push('context');
    var canMove = o.mover !== 'nobody' && LEVEL[o.mover] >= LEVEL[badge];
    if (canMove) by.push('badge');
    var why;
    if (tier === 'restricted') why = o.context && !o.transform ? 'Context does not open the restricted tier; there is no informational or historical exception. Only transforming text the user supplied does.' : 'Restricted: only transforming content the user supplied opens it, without adding new disallowed detail.';
    else why = 'Sensitive: appropriate context (scientific, historical, news, artistic, educational) or transformation opens it.';
    if (o.mover !== 'nobody') why += canMove ? ' The badge is ' + NAME[badge] + ', and this party sits at or above it, so it can move the rule.' :
      ' The badge is ' + NAME[badge] + '; this party sits below it and cannot move the rule.';
    return { tier: tier, badge: badge, open: by.length > 0, by: by, why: why };
  }
  var api = { TYPES: TYPES, MOVERS: MOVERS, sort: sort };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.MSLab = root.MSLab || {}).tiers = api;
})(this);
