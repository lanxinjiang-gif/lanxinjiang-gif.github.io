// Theme toggle
(function() {
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
  updateIcon(theme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  });

  function updateIcon(t) {
    toggle.textContent = t === 'dark' ? '☀️' : '🌙';
  }
})();

// Mobile menu
(function() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav-mobile');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('hidden');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.add('hidden'));
  });
})();
