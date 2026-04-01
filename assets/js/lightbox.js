(function () {
  'use strict';

  /* ── Styles ─────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.lb-overlay {',
    '  display: none;',
    '  position: fixed;',
    '  inset: 0;',
    '  background: rgba(0,0,0,0.92);',
    '  z-index: 9999;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 1rem;',
    '  box-sizing: border-box;',
    '}',
    '.lb-overlay.lb-active { display: flex; }',

    '.lb-img {',
    '  max-width: 100%;',
    '  max-height: 90vh;',
    '  object-fit: contain;',
    '  box-shadow: 0 8px 48px rgba(0,0,0,0.7);',
    '  border-radius: 2px;',
    '  display: block;',
    '  cursor: default;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    /* Fade-in when loaded */
    '  opacity: 0;',
    '  transition: opacity 0.2s ease;',
    '}',
    '.lb-img.lb-loaded { opacity: 1; }',

    /* Spinner shown while image loads */
    '.lb-spinner {',
    '  position: absolute;',
    '  width: 2.5rem;',
    '  height: 2.5rem;',
    '  border: 3px solid rgba(255,255,255,0.2);',
    '  border-top-color: #fff;',
    '  border-radius: 50%;',
    '  animation: lb-spin 0.7s linear infinite;',
    '}',
    '@keyframes lb-spin { to { transform: rotate(360deg); } }',

    '.lb-close {',
    '  position: fixed;',
    '  top: 0.75rem;',
    '  right: 1rem;',
    '  width: 2.75rem;',
    '  height: 2.75rem;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 1.5rem;',
    '  line-height: 1;',
    '  color: #fff;',
    '  background: rgba(0,0,0,0.55);',
    '  border: 1px solid rgba(255,255,255,0.2);',
    '  border-radius: 4px;',
    '  cursor: pointer;',
    '  opacity: 1;',
    '  z-index: 10000;',
    '  transition: background 0.15s, border-color 0.15s;',
    '  -webkit-tap-highlight-color: transparent;',
    '  /* Ensure minimum tap target on mobile */',
    '  min-width: 44px;',
    '  min-height: 44px;',
    '}',
    '.lb-close:hover, .lb-close:focus {',
    '  background: rgba(0,0,0,0.8);',
    '  border-color: rgba(255,255,255,0.5);',
    '  outline: none;',
    '}',

    /* Give clickable images a zoom cursor */
    'img[data-lightbox] {',
    '  cursor: zoom-in;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── DOM ─────────────────────────────────────────────────────────────── */
  var overlay  = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'lb-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close image viewer');

  var spinner  = document.createElement('div');
  spinner.className = 'lb-spinner';

  var img = document.createElement('img');
  img.className = 'lb-img';

  overlay.appendChild(closeBtn);
  overlay.appendChild(spinner);
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  /* ── State ───────────────────────────────────────────────────────────── */
  var previousFocus = null;

  /* ── Open / close ────────────────────────────────────────────────────── */
  function open(src, alt) {
    previousFocus = document.activeElement;

    img.classList.remove('lb-loaded');
    img.alt = alt || '';
    img.src = '';           // reset so load event fires even for same src
    spinner.style.display = 'block';

    overlay.classList.add('lb-active');
    document.body.style.overflow = 'hidden';

    img.src = src;
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('lb-active');
    document.body.style.overflow = '';
    img.src = '';
    img.classList.remove('lb-loaded');
    if (previousFocus) previousFocus.focus();
  }

  /* ── Image load ──────────────────────────────────────────────────────── */
  img.addEventListener('load', function () {
    spinner.style.display = 'none';
    img.classList.add('lb-loaded');
  });

  img.addEventListener('error', function () {
    spinner.style.display = 'none';
  });

  /* ── Event listeners ─────────────────────────────────────────────────── */
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });

  // Click on backdrop (not the image) closes
  overlay.addEventListener('click', function (e) {
    if (e.target !== img) close();
  });

  // Keyboard: Escape to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('lb-active')) close();
  });

  /* ── Init ────────────────────────────────────────────────────────────── */
  function init() {
    var images = document.querySelectorAll('img');
    images.forEach(function (el) {
      var src = el.getAttribute('src') || '';
      // Exclude the profile / avatar image
      if (src.indexOf('pic01.jpg') !== -1) return;
      // Skip images that have no real src (icons, SVGs with no path, etc.)
      if (!src || src.indexOf('.') === -1) return;

      el.setAttribute('data-lightbox', '');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (el.alt ? el.alt + ' — ' : '') + 'Click to enlarge');

      el.addEventListener('click', function () {
        open(el.src, el.alt);
      });

      // Keyboard: Enter or Space activates
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(el.src, el.alt);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
