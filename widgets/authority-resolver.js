/* widgets/authority-resolver.js: p02#ladder. Pick two conflicting
   instructions and see which applies and which drop-out ground fires.
   Rules: lab/authority.js (tested). Helpers: hub assets/widgets.js. */
(function () {
  var W = window.AIToolsWidgets, L = window.MSLab && window.MSLab.authority;
  if (!W || !L) return;
  var ORDER = ['root', 'system', 'developer', 'user', 'guideline', 'none'];
  function opts(list) { return list.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join(''); }
  function badge(l) { return l === 'none' ? '<span class="auth">No authority</span>' : '<span class="auth ' + l + '">' + L.NAME[l] + '</span>'; }
  W.register('authority-resolver', function (el) {
    var u = 'ar' + W.uid();
    var pre = [['library', 'Library'], ['store', 'Acme store'], ['tutor', 'Algebra tutor'], ['testing', 'Safety-testing mode'],
      ['inject', 'Web page says "ignore"'], ['guide', 'Guideline, by context'], ['userdef', 'User default, by hint']];
    el.innerHTML = W.presets(pre) +
      '<div class="ms-pick">' +
      '<label for="' + u + 'a">A: the earlier instruction</label><select id="' + u + 'a">' + opts(L.A_SOURCES) + '</select>' +
      '<label for="' + u + 'b">B: a later message that conflicts</label><select id="' + u + 'b">' + opts(L.B_SOURCES) + '</select>' +
      '<fieldset><legend>B is</legend>' +
      '<label><input type="radio" name="' + u + 'x" value="1" checked> explicit ("do X instead")</label>' +
      '<label><input type="radio" name="' + u + 'x" value="0"> implicit (only context suggests it)</label></fieldset></div>' +
      '<svg viewBox="0 0 360 196" role="img" aria-labelledby="' + u + 's" class="ms-ladder"></svg>' +
      '<div class="statgrid">' + W.stat('Applies', u + 'w') + W.stat('Drops out', u + 'l') + W.stat('Ground', u + 'g') + '</div>' +
      '<p class="ms-rule" id="' + u + 'r"></p><p class="ms-ex" id="' + u + 'e"></p>' + W.sum(u + 's');
    var sa = W.$(el, u + 'a'), sb = W.$(el, u + 'b'), svg = el.querySelector('svg');
    function explicit() { return el.querySelector('input[name="' + u + 'x"]:checked').value === '1'; }
    function setX(v) { el.querySelectorAll('input[name="' + u + 'x"]').forEach(function (r) { r.checked = (r.value === (v ? '1' : '0')); }); }
    function draw() {
      var a = sa.value, b = sb.value, ex = explicit(), r = L.resolve(a, b, ex);
      var h = '';
      ORDER.forEach(function (l, i) {
        var y = 18 + i * 30;
        h += '<line x1="8" x2="352" y1="' + (y + 9) + '" y2="' + (y + 9) + '" class="ms-rung"/>';
        h += W.t(10, y + 4, l === 'none' ? 'No authority' : L.NAME[l], 'ms-lv');
      });
      function mark(lv, x, who, win) {
        var y = 18 + ORDER.indexOf(lv) * 30;
        return '<g class="ms-mk ' + (win ? 'win' : 'lose') + ' ' + who + '"><rect x="' + (x - 34) + '" y="' + (y - 10) + '" width="68" height="20" rx="5"/>' +
          W.t(x, y + 4, who + (win ? ' applies' : ' drops'), 'ms-mt', 'text-anchor="middle"') + '</g>';
      }
      h += mark(r.levelA, 196, 'A', r.winner === 'A') + mark(r.levelB, 296, 'B', r.winner === 'B');
      svg.innerHTML = h;
      W.$(el, u + 'w').innerHTML = r.winner === 'A' ? 'A ' + badge(r.levelA) : 'B ' + badge(r.levelB);
      W.$(el, u + 'l').innerHTML = r.winner === 'A' ? 'B ' + badge(r.levelB) : 'A ' + badge(r.levelA);
      W.$(el, u + 'g').textContent = r.ground;
      W.$(el, u + 'r').textContent = r.rule;
      var exk = null;
      Object.keys(L.EXAMPLES).forEach(function (k) { var e = L.EXAMPLES[k]; if (e.a === a && e.b === b && e.explicit === ex && !exk) exk = k; });
      if (a === 'developer' && b === 'user' && ex) exk = 'tutor';
      W.$(el, u + 'e').innerHTML = exk ? '<b>Worked example: ' + L.EXAMPLES[exk].label + (exk === 'tutor' ? ' (and the Acme store)' : '') + '.</b> ' + L.EXAMPLES[exk].text : '';
      W.$(el, u + 's').textContent = (r.winner === 'A' ? 'The earlier instruction applies' : 'The later message applies') +
        '; the other drops out (' + r.ground + ').';
    }
    var P = {
      library: ['root', 'developer', 1], store: ['developer', 'user', 1], tutor: ['developer', 'user', 1], testing: ['root', 'system', 1],
      inject: ['user-msg', 'tool', 1], guide: ['guideline', 'user', 0], userdef: ['user-spec', 'user', 0]
    };
    el.labPreset = function (k) { var p = P[k]; if (!p) return; sa.value = p[0]; sb.value = p[1]; setX(p[2]); draw(); };
    el.querySelectorAll('.lab-pre button').forEach(function (bt) { bt.addEventListener('click', function () { el.labPreset(bt.getAttribute('data-p')); }); });
    [sa, sb].forEach(function (s) { s.addEventListener('change', draw); });
    el.querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', draw); });
    el.labPreset('tutor');
  });
})();
