/* widgets/honesty-toggle.js: delta.html#honesty. Pick a situation and a
   model; see the compliant answer, the rule's rank and the verdict.
   Every cell is a row of the #honesty table on this page. No maths. */
(function () {
  var W = window.AIToolsWidgets;
  if (!W) return;
  var C = 'https://idvorkin-ai-tools.github.io/claude-constitution-field-map/parts/';
  var RANK = {
    gpt: ['User level: an explicit higher instruction overrides it', 'parts/p11.html', 'p11'],
    claude: ['Near a hard constraint', C + 'p10.html#no-white-lies', 'C p10']
  };
  var S = [
    ['persona', 'A persona is asked "are you GPT?" / "are you Claude?"',
      ['"I\'m not sure" is compliant if the developer says so', 'parts/p11.html', 'p11'],
      ['The persona is fine; never directly deny being Claude', C + 'p11.html#personas', 'C p11'], 'Different'],
    ['confidential', 'A user asks about confidential instructions',
      ['Neither confirm nor deny they exist; refuse rather than lie', 'parts/p09.html', 'p09'],
      ['Say a confidential prompt exists', C + 'p11.html#system-prompt', 'C p11'], 'Different'],
    ['white-lie', 'The builder asks for a small misleading answer',
      ['Allowed if the instruction is explicit: "Do not lie" is a User-level default, never moved by a guess', 'parts/p11.html#levels', 'p11'],
      ['Not even a white lie', C + 'p10.html#no-white-lies', 'C p10'], 'Different'],
    ['flattery', 'Flattery, or more confidence than the evidence supports',
      ['An honesty failure', 'parts/p12.html', 'p12'],
      ['An honesty failure', C + 'p10.html#seven', 'C p10'], 'Same'],
    ['withhold', 'Leaving out something the user would want to know',
      ['A material omission counts as lying', 'parts/p11.html', 'p11'],
      ['Weak duty to share, strong duty not to deceive', C + 'p10.html#duties', 'C p10'], 'Same end, different route']
  ];
  W.register('honesty-toggle', function (el) {
    var u = 'ht' + W.uid();
    el.innerHTML = '<div class="ms-pick">' +
      '<fieldset><legend>Situation</legend>' + S.map(function (s, i) {
        return '<label><input type="radio" name="' + u + 's" value="' + i + '"' + (i === 0 ? ' checked' : '') + '> ' + s[1] + '</label>';
      }).join('') + '</fieldset>' +
      '<fieldset class="ms-seg"><legend>Model</legend>' +
      '<label><input type="radio" name="' + u + 'm" value="gpt" checked> GPT (Model Spec)</label>' +
      '<label><input type="radio" name="' + u + 'm" value="claude"> Claude (constitution)</label></fieldset></div>' +
      '<div class="ms-ans" id="' + u + 'a"></div>' +
      '<div class="statgrid">' + W.stat('Rule rank', u + 'r') + W.stat('Verdict', u + 'v') + '</div>' + W.sum(u + 'y');
    function val(n) { return el.querySelector('input[name="' + u + n + '"]:checked').value; }
    function link(c) { return '<a class="lnk" href="' + c[1] + '"' + (c[1].indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '>' + c[2] + '</a>'; }
    function draw() {
      var s = S[+val('s')], m = val('m'), cell = m === 'gpt' ? s[2] : s[3], other = m === 'gpt' ? s[3] : s[2];
      W.$(el, u + 'a').innerHTML = '<b>' + (m === 'gpt' ? 'GPT' : 'Claude') + ':</b> ' + cell[0] + ' (' + link(cell) + ')' +
        '<span class="ms-other">' + (m === 'gpt' ? 'Claude' : 'GPT') + ': ' + other[0] + '</span>';
      W.$(el, u + 'r').innerHTML = RANK[m][0] + ' (' + link(RANK[m]) + ')';
      W.$(el, u + 'r').className = 'v ms-small';
      var v = W.$(el, u + 'v'); v.textContent = s[4]; v.className = 'v ms-verdict ' + (s[4] === 'Same' ? 'same' : s[4] === 'Different' ? 'diff' : 'mid');
      W.$(el, u + 'y').textContent = (m === 'gpt' ? 'GPT' : 'Claude') + ': ' + cell[0] + '. Verdict: ' + s[4] + '.';
    }
    el.querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', draw); });
    draw();
  });
})();
