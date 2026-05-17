(function() {
  'use strict';
  const KEY = 'beautyMama_palette';
  const DEFAULT = 'ivory';

  function get() {
    try { return localStorage.getItem(KEY) || DEFAULT; }
    catch(e) { return DEFAULT; }
  }

  function set(p) {
    try { localStorage.setItem(KEY, p); } catch(e) {}
  }

  function apply(palette) {
    document.documentElement.setAttribute('data-palette', palette);
    document.querySelectorAll('.palette-switcher__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.palette === palette);
    });
    set(palette);
  }

  // Apply saved palette immediately
  apply(get());

  document.addEventListener('DOMContentLoaded', () => {
    // Attach click handlers
    document.querySelectorAll('.palette-switcher__btn').forEach(btn => {
      btn.addEventListener('click', () => apply(btn.dataset.palette));
    });
  });

  // Press 'c' to toggle visibility (visible by default, 'c' hides)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      const switcher = document.querySelector('.palette-switcher');
      if (switcher) {
        switcher.style.display = switcher.style.display === 'none' ? 'flex' : 'none';
      }
    }
  });

  // Console helper
  window.togglePalette = function() {
    const switcher = document.querySelector('.palette-switcher');
    if (switcher) {
      switcher.style.display = switcher.style.display === 'none' ? 'flex' : 'none';
    }
  };
})();
