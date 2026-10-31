// The Sangat's Ledger: interactive pieces for the "What it means" page.
// React 18 + htm (no build step). Libraries are bundled in assets/vendor.
(function () {
  var h = React.createElement;
  var html = htm.bind(h);
  var useState = React.useState;

  // Canadian T3010 figures, Basics of Sikhi Society (BN 752991695RR0001)
  var CA = {
    2018: { total: 45960, consult: 1580, program: 44380 },
    2019: { total: 15590, consult: 0, program: 15590 },
    2020: { total: 1777, consult: 0, program: 958 },
    2021: { total: 80739, consult: 5619, program: null },
    2022: { total: 116163, consult: 91200, program: null },
    2023: { total: 108741, consult: 96000, program: null },
    2024: { total: 102334, consult: 97021, program: null }
  };
  var fmt = function (n) { return n.toLocaleString('en-CA'); };

  // 1. A dollar, split into 100 cents
  function HundredCents() {
    var s = useState('2024'); var year = s[0], setYear = s[1];
    var d = CA[year];
    var c = Math.round((d.consult / d.total) * 100);
    var cells = [];
    for (var i = 0; i < 100; i++) cells.push(html`<i key=${i} class=${i < c ? 'c' : (d.program === null ? 'n' : '')}></i>`);
    return html`<section class="widget" aria-labelledby="w1">
      <h3 id="w1">Where each dollar went</h3>
      <p class="sub">Each square is one cent of every dollar the Canadian charity spent. Pick a year.</p>
      <div class="yearpick" role="group" aria-label="Year">
        ${Object.keys(CA).map(function (y) {
          return html`<button key=${y} aria-pressed=${y === year} onClick=${function () { setYear(y); }}>${y}</button>`;
        })}
      </div>
      <div class="legend">
        <span><i style=${{ background: 'var(--s-consult)' }}></i>Unnamed consultants</span>
        ${d.program === null
          ? html`<span><i style=${{ background: 'repeating-linear-gradient(135deg, var(--grid) 0 3px, var(--rule) 3px 6px)' }}></i>Everything else (the charity did not say what)</span>`
          : html`<span><i style=${{ background: 'var(--s-other)' }}></i>Everything else</span>`}
      </div>
      <div class="waffle" role="img" aria-label=${year + ': ' + c + ' of every 100 cents went to unnamed consultants.'}>${cells}</div>
      <p class="readout">In ${year}, <b>${c} cents</b> of every dollar went to consultants nobody is told about.
        ${d.program === null
          ? ' The charity did not say how much reached its programs.'
          : ' The charity said C$' + fmt(d.program) + ' went to its programs.'}</p>
      <p class="sub" style=${{ marginTop: '.5rem' }}>C$${fmt(d.consult)} of C$${fmt(d.total)} spent. Source: CRA T3010, lines 4860, 5000, 5100.</p>
    </section>`;
  }

  // 2. Follow your gift (2024 split)
  function FollowYourGift() {
    var s = useState(50); var amt = s[0], setAmt = s[1];
    var share = 97021 / 102334;
    var toConsult = amt * share;
    var rest = amt - toConsult;
    return html`<section class="widget" aria-labelledby="w2">
      <h3 id="w2">Follow your gift</h3>
      <p class="sub">Say you gave this much to the Canadian charity. If it was spent the way 2024's money was spent, here is where it went.</p>
      <div class="giftrow">
        <label for="gift" style=${{ fontWeight: 600 }}>Your gift</label>
        <input id="gift" type="range" min="5" max="500" step="5" value=${amt} onInput=${function (e) { setAmt(+e.target.value); }} />
        <output for="gift">$${amt}</output>
      </div>
      <div class="split" role="img" aria-label=${'$' + toConsult.toFixed(2) + ' to unnamed consultants, $' + rest.toFixed(2) + ' to everything else'}>
        <div style=${{ flexBasis: (share * 100) + '%', background: 'var(--s-consult)' }}></div>
        <div style=${{ flexBasis: ((1 - share) * 100) + '%', background: 'var(--s-other)' }}></div>
      </div>
      <div class="legend" style=${{ marginTop: '.6rem' }}>
        <span><i style=${{ background: 'var(--s-consult)' }}></i>Unnamed consultants: <b>$${toConsult.toFixed(2)}</b></span>
        <span><i style=${{ background: 'var(--s-other)' }}></i>Everything else: <b>$${rest.toFixed(2)}</b></span>
      </div>
      <p class="readout">Amount the 2024 return shows for programs: <b>not reported</b>.</p>
    </section>`;
  }

  // 3. US: donations vs wages (one axis, two series)
  function WagesVsDonations() {
    var rows = [
      { y: '2023', don: 77349, wag: 16737 },
      { y: '2024', don: 230176, wag: 81105, note: 'all but $4 recorded as "government grants"' },
      { y: '2025', don: 120559, wag: 130794 }
    ];
    var s = useState(null); var hov = s[0], setHov = s[1];
    var W = 560, H = 260, L = 56, R = 10, T = 20, B = 30, max = 250000;
    var pw = W - L - R, ph = H - T - B, band = pw / rows.length, bw = 22, gap = 2;
    var y = function (v) { return T + ph - (v / max) * ph; };
    var bar = function (x, v, color, key) {
      var top = y(v), hgt = y(0) - top, r = Math.min(4, hgt);
      var d = 'M' + x + ',' + y(0) + 'V' + (top + r) + 'Q' + x + ',' + top + ' ' + (x + r) + ',' + top + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + top + ' ' + (x + bw) + ',' + (top + r) + 'V' + y(0) + 'Z';
      return html`<path key=${key} d=${d} fill=${color} />`;
    };
    var cur = hov === null ? null : rows[hov];
    return html`<section class="widget" aria-labelledby="w3">
      <h3 id="w3">US charity: donations in, wages out</h3>
      <p class="sub">Everythings 13 (US), from its IRS returns. Hover or tap a year.</p>
      <div class="legend">
        <span><i style=${{ background: 'var(--s-other)' }}></i>Money in</span>
        <span><i style=${{ background: 'var(--s-consult)' }}></i>Wages and pay costs</span>
      </div>
      <div class="chart" style=${{ boxShadow: 'none', margin: 0 }}>
        <svg viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label="Grouped columns. 2023: donated $77,349, wages $16,737. 2024: $230,176 in, wages $81,105. 2025: donated $120,559, wages $130,794.">
          <g class="grid">${[0, 50000, 100000, 150000, 200000, 250000].map(function (t) {
            return html`<line key=${t} x1=${L} x2=${W - R} y1=${y(t)} y2=${y(t)} />`;
          })}</g>
          ${[0, 50000, 100000, 150000, 200000, 250000].map(function (t) {
            return html`<text key=${'t' + t} x=${L - 8} y=${y(t) + 4} text-anchor="end" font-size="12">${t === 0 ? '0' : (t / 1000) + 'K'}</text>`;
          })}
          ${rows.map(function (r, i) {
            var cx = L + band * i + band / 2;
            return html`<g key=${r.y}>
              ${bar(cx - bw - gap / 2, r.don, 'var(--s-other)', 'd')}
              ${bar(cx + gap / 2, r.wag, 'var(--s-consult)', 'w')}
              <text x=${cx} y=${H - 8} text-anchor="middle" font-size="12">${r.y}</text>
              ${r.y === '2025' ? html`<text class="lbl" x=${cx + gap / 2 + bw / 2} y=${y(r.wag) - 8} text-anchor="middle" font-size="12">108%</text>` : null}
              <rect class="hit" x=${L + band * i} y=${T} width=${band} height=${ph} tabindex="0"
                aria-label=${r.y + ': donated $' + fmt(r.don) + ', wages $' + fmt(r.wag)}
                onMouseEnter=${function () { setHov(i); }} onFocus=${function () { setHov(i); }}
                onMouseLeave=${function () { setHov(null); }} onBlur=${function () { setHov(null); }} />
            </g>`;
          })}
        </svg>
      </div>
      <p class="readout" aria-live="polite">${cur
        ? html`<span><b>${cur.y}</b>: $${fmt(cur.don)} came in${cur.note ? ' (' + cur.note + ')' : ''}. $${fmt(cur.wag)} went to wages.${cur.wag > cur.don ? ' Wages were bigger than donations.' : ''}</span>`
        : html`<span>In 2025, wages ($130,794) were <b>108%</b> of all donations ($120,559). Officers' pay: $0.</span>`}</p>
      <p class="sub">2023 shows contributions only ($77,349); total 2023 revenue was $101,205. Source: IRS Form 990-EZ (2023, 2025) and 990 (2024).</p>
    </section>`;
  }

  // 4. WE Charity comparison
  var CMP = [
    { k: 'A loved name', bos: 'Built by Jagraj Singh. People still give in his memory.', we: 'Built by two brothers who became famous for youth activism. Schools and families trusted the name.' },
    { k: 'More than one body', bos: 'One brand, three charities: Canada, UK and US.', we: 'A charity (WE Charity) and a for-profit business (ME to WE) that shared the brand.' },
    { k: 'Hard to follow the money', bos: 'Canadian filings do not name who got 95% of the spending, and stopped saying what went to programs.', we: 'Reporters found it hard to tell where the charity ended and the business began.' },
    { k: 'Who asked the questions', bos: 'Donors and readers of public filings. Posts asking were deleted.', we: 'Journalists, then Parliament.' }
  ];
  var DIFF = [
    { k: 'Size', bos: 'About C$100,000 a year spent in Canada. About £600,000 a year in the UK.', we: 'Tens of millions of dollars a year.' },
    { k: 'Government', bos: 'No government contract found. No link to any politician.', we: 'Picked in 2020 to run a federal student grant program, with up to $43.5 million in fees. Had paid members of the Prime Minister’s family for speaking.' },
    { k: 'For-profit arm', bos: 'None found in the filings.', we: 'Yes: ME to WE sold trips and products.' },
    { k: 'Official review', bos: 'None we know of.', we: 'Parliamentary committees and the federal Ethics Commissioner looked into the contract.' },
    { k: 'What happened', bos: 'Questions are open. The charities have not answered.', we: 'WE pulled out of the contract and wound down its Canadian operations in 2020.' }
  ];
  function CompareWE() {
    var s = useState('same'); var tab = s[0], setTab = s[1];
    var list = tab === 'same' ? CMP : DIFF;
    return html`<section class="widget" aria-labelledby="w4">
      <h3 id="w4">Basics of Sikhi and WE Charity</h3>
      <p class="sub">WE Charity is the best-known Canadian lesson about charity trust. This is a comparison of the warning signs, not of wrongdoing.</p>
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected=${tab === 'same'} onClick=${function () { setTab('same'); }}>What looks alike</button>
        <button role="tab" aria-selected=${tab === 'diff'} onClick=${function () { setTab('diff'); }}>What is different</button>
      </div>
      <div class="scroll" style=${{ boxShadow: 'none' }}>
        <table class="cmp" role="tabpanel">
          <thead><tr><th></th><th>Basics of Sikhi charities</th><th>WE Charity / ME to WE</th></tr></thead>
          <tbody>${list.map(function (r) {
            return html`<tr key=${r.k}><td><b>${r.k}</b></td><td>${r.bos}</td><td>${r.we}</td></tr>`;
          })}</tbody>
        </table>
      </div>
      <p class="readout">${tab === 'same'
        ? 'The lesson from WE: when a trusted name runs through several bodies and the money is hard to follow, donors should ask early.'
        : 'The differences are big. WE involved a federal contract and far more money. Nothing here shows anything like that.'}</p>
    </section>`;
  }

  var mount = function (id, C) { var el = document.getElementById(id); if (el) ReactDOM.createRoot(el).render(h(C)); };
  mount('w-cents', HundredCents);
  mount('w-gift', FollowYourGift);
  mount('w-us', WagesVsDonations);
  mount('w-we', CompareWE);
})();
