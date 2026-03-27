// Theme
(function() {
  const btn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  apply(theme);

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    localStorage.setItem('theme', next);
  });

  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    btn.textContent = t === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  }
})();

// Mobile menu
(function() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav-mobile');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('hidden'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.add('hidden')));
})();
