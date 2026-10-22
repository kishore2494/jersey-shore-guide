// Search (window.IDX from search.js) and the picture viewer. Plain JS, no libraries.
(function () {
  var norm = function (s) { return String(s || '').toLowerCase(); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var SYN = { rain: 'move weather', dumpster: 'container', deposit: 'payment schedule', quote: 'estimate', bill: 'invoice', clock: 'time hours', payroll: 'timesheets adp', crew: 'crew phone' };
  function search(q) {
    var words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length || !window.IDX) return [];
    var out = [];
    for (var i = 0; i < IDX.length; i++) {
      var e = IDX[i], t = norm(e.t), hay = t + ' ' + norm(e.a) + ' ' + norm(e.k) + ' ' + norm(e.x), score = 0, ok = true;
      for (var w = 0; w < words.length; w++) {
        var wd = words[w], alt = (SYN[wd] || '').split(' ').filter(Boolean), hit = hay.indexOf(wd) >= 0 || alt.some(function (a) { return hay.indexOf(a) >= 0; });
        if (!hit) { ok = false; break; }
        score += t.indexOf(wd) >= 0 ? 6 : norm(e.k).indexOf(wd) >= 0 ? 4 : 1;
      }
      if (ok) out.push([score + (e.k !== undefined ? 3 : 0) + (e.v ? 1 : 0), e]);
    }
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out.slice(0, 14).map(function (x) { return x[1]; });
  }
  function hl(s, q) {
    var h = esc(s);
    norm(q).split(/\s+/).filter(function (w) { return w.length > 1; }).forEach(function (w) {
      h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return h;
  }
  function wire(input, box) {
    if (!input || !box) return;
    var sel = -1;
    function render() {
      var q = input.value.trim();
      if (!q) { box.hidden = true; return; }
      var r = search(q);
      sel = -1;
      box.innerHTML = r.length ? r.map(function (e) {
        return '<a href="' + e.u + '"><b>' + hl(e.t, q) + (e.v ? '<span class="vd">VIDEO</span>' : '') + '</b><small>' + (e.x ? esc(e.a) + ' · ' + hl(e.x.slice(0, 110), q) : esc(e.a)) + '</small></a>';
      }).join('') : '<div class="none">Nothing matches. Try fewer or simpler words: <i>invoice</i>, <i>crew</i>, <i>schedule</i>.</div>';
      box.hidden = false;
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (ev) {
      var items = box.querySelectorAll('a');
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault(); sel = Math.max(0, Math.min(items.length - 1, sel + (ev.key === 'ArrowDown' ? 1 : -1)));
        items.forEach(function (a, i) { a.classList.toggle('on', i === sel); });
      } else if (ev.key === 'Enter' && items.length) { location.href = items[Math.max(0, sel)].getAttribute('href'); }
      else if (ev.key === 'Escape') { box.hidden = true; input.blur(); }
    });
    document.addEventListener('click', function (ev) { if (!box.contains(ev.target) && ev.target !== input) box.hidden = true; });
  }
  wire(document.getElementById('q'), document.getElementById('hits'));
  wire(document.getElementById('q2'), document.getElementById('hits2'));

  // the picture viewer
  var lb = document.getElementById('lb');
  if (lb) {
    var img = lb.querySelector('img'), cap = lb.querySelector('p');
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a.shot');
      if (!a) return;
      ev.preventDefault(); img.src = a.getAttribute('href'); cap.textContent = a.dataset.cap || ''; lb.hidden = false;
    });
    lb.addEventListener('click', function (ev) { if (ev.target !== img) lb.hidden = true; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') lb.hidden = true; });
  }
})();
