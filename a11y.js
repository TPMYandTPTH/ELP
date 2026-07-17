/* =========================================================
   TP Careers — shared accessibility layer
   Included on every page: <script src="a11y.js" defer></script>

   1. Baseline fixes (always on):
      - visible :focus-visible outline for keyboard users
      - global prefers-reduced-motion support
      - keyboard support + ARIA state for click-only accordions
   2. "Accessibility options" widget (bottom-left), persisted
      in localStorage across all pages:
      - Dyslexia-friendly text (Atkinson Hyperlegible, wider
        spacing, taller line-height, no italics)
      - Text size (default / large / extra large)
      - High contrast (darker text, stronger borders,
        WCAG-AA brand colors — also helps low vision and
        every type of color-vision deficiency)
      - Highlight links (underlines — interactive elements no
        longer identified by color alone)
      - Reduce motion (stops animations, parallax, smooth scroll)
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'tp-a11y-prefs';
  var root = document.documentElement;

  var prefs = { dyslexic: false, text: 0, contrast: false, links: false, motion: false };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) for (var k in prefs) if (Object.prototype.hasOwnProperty.call(saved, k)) prefs[k] = saved[k];
  } catch (e) { /* private mode etc. — run with defaults */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* non-fatal */ }
  }

  /* Atkinson Hyperlegible is loaded only when the user enables the mode */
  var fontLoaded = false;
  function loadFont() {
    if (fontLoaded) return;
    fontLoaded = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    document.head.appendChild(l);
  }

  function applyPrefs() {
    root.classList.toggle('a11y-dyslexic', prefs.dyslexic);
    root.classList.toggle('a11y-text1', prefs.text === 1);
    root.classList.toggle('a11y-text2', prefs.text === 2);
    root.classList.toggle('a11y-contrast', prefs.contrast);
    root.classList.toggle('a11y-links', prefs.links);
    root.classList.toggle('a11y-motion', prefs.motion);
    if (prefs.dyslexic) loadFont();
  }
  applyPrefs();

  /* ---------- injected CSS: baseline + opt-in modes + widget ---------- */
  var css = [
    /* keyboard focus must always be visible; blue reads for all CVD types */
    ':where(a,button,input,select,textarea,summary,iframe,[tabindex]):focus-visible{outline:3px solid #1849C6!important;outline-offset:2px;border-radius:4px}',

    /* OS-level reduced-motion preference */
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}',

    /* manual reduce-motion toggle (same effect, any OS) */
    'html.a11y-motion *,html.a11y-motion *::before,html.a11y-motion *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}',

    /* dyslexia-friendly reading: hyperlegible font everywhere except icon fonts */
    'html.a11y-dyslexic *:not(.ms):not(.material-symbols-outlined):not(.fa):not(.fas):not(.far):not(.fab):not(.fal):not([class*="fa-"]):not(svg):not(path):not(code):not(pre){font-family:"Atkinson Hyperlegible",Verdana,Tahoma,sans-serif!important}',
    'html.a11y-dyslexic body{letter-spacing:.02em;word-spacing:.08em}',
    'html.a11y-dyslexic :where(p,li,dd,blockquote){line-height:1.8!important;letter-spacing:.03em!important;word-spacing:.12em!important;hyphens:none!important}',
    'html.a11y-dyslexic :where(em,i):not(.ms):not(.fa):not(.fas):not(.far):not(.fab):not([class*="fa-"]){font-style:normal!important;font-weight:700}',

    /* text size — pages use px sizing, so scale with zoom */
    'html.a11y-text1 body{zoom:1.12}',
    'html.a11y-text2 body{zoom:1.25}',

    /* high contrast: retune shared palette variables (both page designs use them) */
    'html.a11y-contrast{--ink:#14151F;--muted:#3E3F55;--slate-2:#43445F;--line:rgba(20,21,31,.35);--line-2:rgba(20,21,31,.5);--pink:#C4006B;--pink-2:#A80059;--teal:#00776A;--teal-ink:#065A50;--tp-dark:#000;--tp-gray-dark:#2d2d2d;--tp-gray:#3d3d3d;--tp-gray-light:#4d4d4d;--tp-silver:#6b6b6b;--gold-primary:#8a6a00;--gold-light:#8a6a00;--gold-dark:#6f5500}',
    'html.a11y-contrast body{color:#14151F}',
    'html.a11y-contrast :where(p,section,main,article,li,td) a[href]{text-decoration:underline;text-underline-offset:.15em}',

    /* highlight links: never rely on color alone to spot a link */
    'html.a11y-links a[href]{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:.18em!important}',

    /* ---------- widget ---------- */
    '#tpA11y{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
    '#tpA11yBtn{width:52px;height:52px;border-radius:50%;border:2px solid #2A2B3D;background:#fff;color:#2A2B3D;cursor:pointer;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.22);padding:0}',
    '#tpA11yBtn:hover{background:#F2F2F7}',
    '#tpA11yBtn svg{width:30px;height:30px;fill:currentColor}',
    '#tpA11yPanel{position:absolute;left:0;bottom:64px;width:min(320px,calc(100vw - 32px));background:#fff;color:#1a1a2e;border:1px solid rgba(0,0,0,.18);border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.25);padding:16px;display:none}',
    '#tpA11yPanel.open{display:block}',
    '#tpA11yPanel h2{font-size:15px;font-weight:700;margin:0 0 4px;color:#1a1a2e}',
    '#tpA11yPanel .tpa-hint{font-size:12px;color:#4a4a5e;margin:0 0 12px;line-height:1.45}',
    '.tpa-row{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;background:none;border:0;border-top:1px solid rgba(0,0,0,.09);padding:11px 2px;cursor:pointer;font-size:13.5px;font-weight:600;color:#1a1a2e;text-align:left;min-height:44px}',
    '.tpa-row small{display:block;font-size:11px;font-weight:400;color:#4a4a5e;margin-top:2px;line-height:1.35}',
    '.tpa-track{flex-shrink:0;width:40px;height:22px;border-radius:100px;background:#B9BAC9;position:relative;transition:background .15s}',
    '.tpa-track::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s}',
    '.tpa-row[aria-checked="true"] .tpa-track{background:#0B7A5C}',
    '.tpa-row[aria-checked="true"] .tpa-track::after{transform:translateX(18px)}',
    '.tpa-row[aria-checked="true"] .tpa-track::before{content:"✓";position:absolute;left:6px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;color:#fff;font-weight:700}',
    '.tpa-size{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(0,0,0,.09);padding:11px 2px}',
    '.tpa-size>span{font-size:13.5px;font-weight:600}',
    '.tpa-size-group{display:flex;gap:4px}',
    '.tpa-size-group button{border:1.5px solid #9C9DAF;background:#fff;color:#1a1a2e;border-radius:8px;cursor:pointer;min-width:38px;min-height:38px;font-weight:700;padding:0 6px}',
    '.tpa-size-group button[aria-pressed="true"]{background:#2A2B3D;border-color:#2A2B3D;color:#fff}',
    '.tpa-size-group button:nth-child(1){font-size:13px}',
    '.tpa-size-group button:nth-child(2){font-size:15px}',
    '.tpa-size-group button:nth-child(3){font-size:18px}',
    '#tpA11yReset{margin-top:10px;width:100%;border:1.5px solid #9C9DAF;background:#fff;color:#1a1a2e;border-radius:10px;padding:9px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px}',
    '#tpA11yReset:hover{background:#F2F2F7}',
    '@media print{#tpA11y{display:none}}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'tpA11yStyles';
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- widget markup ---------- */
  function buildWidget() {
    var wrap = document.createElement('div');
    wrap.id = 'tpA11y';
    wrap.innerHTML =
      '<button id="tpA11yBtn" type="button" aria-expanded="false" aria-controls="tpA11yPanel" aria-label="Accessibility options">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 5h-6v13a1 1 0 0 1-2 0v-6h-2v6a1 1 0 0 1-2 0V7H3a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2z"/></svg>' +
      '</button>' +
      '<div id="tpA11yPanel" role="dialog" aria-label="Accessibility options">' +
        '<h2>Accessibility options</h2>' +
        '<p class="tpa-hint">Your choices are saved and apply to every page of this site.</p>' +
        '<button class="tpa-row" type="button" role="switch" data-pref="dyslexic" aria-checked="false"><span>Dyslexia-friendly text<small>Clearer letters, wider spacing, no italics</small></span><span class="tpa-track" aria-hidden="true"></span></button>' +
        '<div class="tpa-size"><span id="tpA11ySizeLabel">Text size</span><span class="tpa-size-group" role="group" aria-labelledby="tpA11ySizeLabel">' +
          '<button type="button" data-size="0" aria-pressed="true" aria-label="Default text size">A</button>' +
          '<button type="button" data-size="1" aria-pressed="false" aria-label="Large text">A</button>' +
          '<button type="button" data-size="2" aria-pressed="false" aria-label="Extra large text">A</button>' +
        '</span></div>' +
        '<button class="tpa-row" type="button" role="switch" data-pref="contrast" aria-checked="false"><span>High contrast<small>Darker text and stronger colors</small></span><span class="tpa-track" aria-hidden="true"></span></button>' +
        '<button class="tpa-row" type="button" role="switch" data-pref="links" aria-checked="false"><span>Highlight links<small>Underline every link</small></span><span class="tpa-track" aria-hidden="true"></span></button>' +
        '<button class="tpa-row" type="button" role="switch" data-pref="motion" aria-checked="false"><span>Reduce motion<small>Stop animations and moving effects</small></span><span class="tpa-track" aria-hidden="true"></span></button>' +
        '<button id="tpA11yReset" type="button">Reset to defaults</button>' +
      '</div>';
    document.body.appendChild(wrap);

    var btn = wrap.querySelector('#tpA11yBtn');
    var panel = wrap.querySelector('#tpA11yPanel');
    var switches = [].slice.call(wrap.querySelectorAll('.tpa-row[data-pref]'));
    var sizeBtns = [].slice.call(wrap.querySelectorAll('.tpa-size-group button'));

    function syncUI() {
      switches.forEach(function (s) {
        s.setAttribute('aria-checked', prefs[s.dataset.pref] ? 'true' : 'false');
      });
      sizeBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', prefs.text === Number(b.dataset.size) ? 'true' : 'false');
      });
    }
    syncUI();

    function openPanel(open) {
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var first = panel.querySelector('.tpa-row');
        if (first) first.focus();
      }
    }

    btn.addEventListener('click', function () {
      openPanel(!panel.classList.contains('open'));
    });

    switches.forEach(function (s) {
      s.addEventListener('click', function () {
        prefs[s.dataset.pref] = !prefs[s.dataset.pref];
        applyPrefs(); save(); syncUI();
      });
    });

    sizeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        prefs.text = Number(b.dataset.size);
        applyPrefs(); save(); syncUI();
      });
    });

    wrap.querySelector('#tpA11yReset').addEventListener('click', function () {
      prefs = { dyslexic: false, text: 0, contrast: false, links: false, motion: false };
      applyPrefs(); save(); syncUI();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        openPanel(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !wrap.contains(e.target)) openPanel(false);
    });
  }

  /* ---------- keyboard support for click-only accordions ----------
     .role-top (open roles) and .qa .q (FAQ) are divs with click
     handlers; give them button semantics and Enter/Space activation. */
  function enhanceAccordions() {
    var toggles = [].slice.call(document.querySelectorAll('.role-top, .qa .q'));
    if (!toggles.length) return;

    function syncAll() {
      toggles.forEach(function (el) {
        var box = el.closest('.role, .qa');
        el.setAttribute('aria-expanded', box && box.classList.contains('open') ? 'true' : 'false');
      });
    }

    toggles.forEach(function (el) {
      if (el.closest('a,button') || el.hasAttribute('data-a11y-toggle')) return;
      el.setAttribute('data-a11y-toggle', '1');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          el.click();
        }
      });
      /* opening one item closes the others, so resync the whole group */
      el.addEventListener('click', function () { setTimeout(syncAll, 0); });
    });
    syncAll();
  }

  function init() {
    buildWidget();
    enhanceAccordions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
