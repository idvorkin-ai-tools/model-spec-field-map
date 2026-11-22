/* widgets/tier-sorter.js: p07#tiers. Pick a content type and the context;
   see its tier, its badge, and whether anything opens it.
   Rules: lab/tiers.js (tested). Helpers: hub assets/widgets.js. */
(function () {
  var W = window.AIToolsWidgets, L = window.MSLab && window.MSLab.tiers;
  if (!W || !L) return;
  var TIERS = [['prohibited', 'Prohibited', 'never opens'], ['restricted', 'Restricted', 'transform only'], ['sensitive', 'Sensitive', 'context/transform']];
  var NAME = { root: 'Root', system: 'System', user: 'User' };
  W.register('tier-sorter', function (el) {
    var u = 'ts' + W.uid();
    el.innerHTML = W.presets([['roast', 'Roast me'], ['history', 'Extremism, for a history class'], ['csv', 'Directory PDF to CSV'], ['meth', 'Recipe, "for research"']]) +
      '<div class="ms-pick">' +
      '<label for="' + u + 't">What GPT would output</label><select id="' + u + 't">' +
      L.TYPES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select>' +
      '<label for="' + u + 'm">Who asks to change the rule itself</label><select id="' + u + 'm">' +
      L.MOVERS.map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join('') + '</select>' +
      '<fieldset><legend>Context</legend>' +
      '<label><input type="checkbox" id="' + u + 'c"> Appropriate context: scientific, historical, news, artistic, educational</label>' +
      '<label><input type="checkbox" id="' + u + 'x"> The user pasted the text and asks to translate, summarise or reformat it</label></fieldset></div>' +
      '<svg viewBox="0 0 360 84" role="img" aria-labelledby="' + u + 's" class="ms-tiers"></svg>' +
      '<div class="statgrid">' + W.stat('Tier', u + 'r') + W.stat('Badge', u + 'b') + W.stat('Opens?', u + 'o', true) + '</div>' +
      '<p class="ms-rule" id="' + u + 'w"></p>' + W.sum(u + 's');
    var st = W.$(el, u + 't'), sm = W.$(el, u + 'm'), cc = W.$(el, u + 'c'), cx = W.$(el, u + 'x'), svg = el.querySelector('svg');
    function draw() {
      var r = L.sort({ type: st.value, context: cc.checked, transform: cx.checked, mover: sm.value });
      var h = '';
      TIERS.forEach(function (t, i) {
        var x = 4 + i * 119, on = t[0] === r.tier;
        h += '<g class="ms-tier' + (on ? ' on' + (r.open ? ' open' : ' shut') : '') + '"><rect x="' + x + '" y="6" width="113" height="72" rx="8"/>' +
          W.t(x + 56, 30, t[1], 'ms-tt', 'text-anchor="middle"') + W.t(x + 56, 48, t[2], 'ms-ts', 'text-anchor="middle"') +
          (on ? W.t(x + 56, 68, r.open ? 'OPEN' : 'CLOSED', 'ms-tl', 'text-anchor="middle"') : '') + '</g>';
      });
      svg.innerHTML = h;
      W.$(el, u + 'r').textContent = r.tier;
      W.$(el, u + 'b').innerHTML = '<span class="auth ' + r.badge + '">' + NAME[r.badge] + '</span>';
      var by = r.by.map(function (b) { return b === 'badge' ? 'rule moved' : b; }).join(' + ');
      W.$(el, u + 'o').textContent = r.open ? 'yes' : 'no';
      W.$(el, u + 'o-n').textContent = r.open ? 'by ' + by : 'nothing here opens it';
      var why = r.why;
      if (st.value === 'erotica' && sm.value === 'system') why += ' (The spec says OpenAI is exploring such a "grown-up mode"; it is not a setting developers or users hold.)';
      if (st.value === 'abuse' && sm.value === 'user') why += ' The roast example: refusing it is the violation. It stops at the Root hate rule: no roasting a protected trait.';
      if (r.by.indexOf('transformation') >= 0) why += ' GPT may only work with what the user supplied; it may not add or refine dangerous detail.';
      W.$(el, u + 'w').textContent = why;
      W.$(el, u + 's').textContent = r.tier + ' tier, ' + NAME[r.badge] + ' badge: ' + (r.open ? 'opens by ' + by : 'stays closed') + '.';
    }
    var P = { roast: ['abuse', 'user', 0, 0], history: ['extremist', 'nobody', 1, 0], csv: ['privacy', 'nobody', 0, 1], meth: ['hazard', 'nobody', 1, 0] };
    el.labPreset = function (k) { var p = P[k]; if (!p) return; st.value = p[0]; sm.value = p[1]; cc.checked = !!p[2]; cx.checked = !!p[3]; draw(); };
    el.querySelectorAll('.lab-pre button').forEach(function (bt) { bt.addEventListener('click', function () { el.labPreset(bt.getAttribute('data-p')); }); });
    [st, sm, cc, cx].forEach(function (i) { i.addEventListener('change', draw); });
    el.labPreset('history');
  });
})();
