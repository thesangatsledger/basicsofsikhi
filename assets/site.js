// The Sangat's Ledger: page behaviour (no dependencies)
(function () {
  // reading progress bar
  var bar = document.getElementById('progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // count-up numbers: <b data-count="95" data-suffix="%">95%</b>
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduce) return;
    var end = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1100;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(end * eased).toLocaleString('en-CA') + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = pre + '0' + suf;
    requestAnimationFrame(step);
  });

  // column chart: consulting share of Canadian spending, 2018-2024
  var host = document.getElementById('consult-chart');
  if (host) {
    var data = [
      { y: '2018', v: 3, amt: 'C$1,580 of C$45,960' },
      { y: '2019', v: 0, amt: 'C$0 of C$15,590' },
      { y: '2020', v: 0, amt: 'C$0 of C$1,777' },
      { y: '2021', v: 7, amt: 'C$5,619 of C$80,739' },
      { y: '2022', v: 79, amt: 'C$91,200 of C$116,163' },
      { y: '2023', v: 88, amt: 'C$96,000 of C$108,741' },
      { y: '2024', v: 95, amt: 'C$97,021 of C$102,334' }
    ];
    var W = 640, H = 280, L = 40, R = 10, T = 22, B = 30;
    var pw = W - L - R, ph = H - T - B, band = pw / data.length, bw = Math.min(24 * 1.6, band * 0.5);
    var y = function (v) { return T + ph - (v / 100) * ph; };
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Column chart: share of Canadian spending paid as consulting fees, 2018 to 2024. Rises from 7% in 2021 to 95% in 2024.');
    var g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'grid'); svg.appendChild(g);
    [0, 25, 50, 75, 100].forEach(function (t) {
      var ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', L); ln.setAttribute('x2', W - R); ln.setAttribute('y1', y(t)); ln.setAttribute('y2', y(t));
      g.appendChild(ln);
      var tx = document.createElementNS(ns, 'text');
      tx.setAttribute('x', L - 8); tx.setAttribute('y', y(t) + 4); tx.setAttribute('text-anchor', 'end'); tx.setAttribute('font-size', '12');
      tx.textContent = t + '%'; svg.appendChild(tx);
    });
    var tip = document.createElement('div'); tip.className = 'tip'; host.appendChild(tip);
    data.forEach(function (d, i) {
      var cx = L + band * i + band / 2, x = cx - bw / 2, top = y(d.v), h = Math.max(0, y(0) - top), r = Math.min(4, h);
      if (h > 0) {
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', 'M' + x + ',' + y(0) + 'V' + (top + r) + 'Q' + x + ',' + top + ' ' + (x + r) + ',' + top +
          'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + top + ' ' + (x + bw) + ',' + (top + r) + 'V' + y(0) + 'Z');
        p.setAttribute('fill', 'var(--s-consult)');
        svg.appendChild(p);
      }
      var xl = document.createElementNS(ns, 'text');
      xl.setAttribute('x', cx); xl.setAttribute('y', H - 8); xl.setAttribute('text-anchor', 'middle'); xl.setAttribute('font-size', '12');
      xl.textContent = d.y; svg.appendChild(xl);
      if (d.y === '2021' || d.y === '2024') {
        var vl = document.createElementNS(ns, 'text');
        vl.setAttribute('x', cx); vl.setAttribute('y', top - 7); vl.setAttribute('text-anchor', 'middle'); vl.setAttribute('font-size', '13'); vl.setAttribute('class', 'lbl');
        vl.textContent = d.v + '%'; svg.appendChild(vl);
      }
      var hit = document.createElementNS(ns, 'rect');
      hit.setAttribute('class', 'hit'); hit.setAttribute('x', L + band * i); hit.setAttribute('y', T); hit.setAttribute('width', band); hit.setAttribute('height', ph);
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('aria-label', d.y + ': ' + d.v + '% to consultants, ' + d.amt);
      var show = function () {
        tip.innerHTML = '<b>' + d.y + '</b>: ' + d.v + '% to consultants<br>' + d.amt;
        var box = host.getBoundingClientRect(), sb = svg.getBoundingClientRect(), k = sb.width / W;
        tip.style.left = Math.min(box.width - 180, Math.max(4, (sb.left - box.left) + cx * k - 80)) + 'px';
        tip.style.top = ((sb.top - box.top) + top * k - 58) + 'px';
        tip.classList.add('on');
      };
      var hide = function () { tip.classList.remove('on'); };
      hit.addEventListener('mouseenter', show); hit.addEventListener('focus', show);
      hit.addEventListener('mouseleave', hide); hit.addEventListener('blur', hide);
      svg.appendChild(hit);
    });
    host.insertBefore(svg, host.querySelector('details'));
  }
})();
