/**
 * Theme toggle — injects a sun/moon button into the masthead nav
 * and swaps between two alternate stylesheets (light/dark).
 * Preference is stored in sessionStorage.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.themeToggleInjected && document.getElementById('theme-light')) {
    const nav = document.querySelector('.visible-links');
    if (nav) {
      const li = document.createElement('li');
      li.className = 'masthead__menu-item';

      const a = document.createElement('a');
      a.href = '#';
      a.title = 'Toggle light and dark modes';
      a.innerHTML = '<i class="fa-solid fa-sun"></i> / <i class="fa-solid fa-moon"></i>';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const light = document.getElementById('theme-light');
        const dark = document.getElementById('theme-dark');
        if (light.getAttribute('rel') === 'stylesheet') {
          light.setAttribute('rel', 'alternate stylesheet');
          dark.setAttribute('rel', 'stylesheet');
          sessionStorage.setItem('theme', 'dark');
          document.documentElement.classList.add('theme-dark');
        } else {
          dark.setAttribute('rel', 'alternate stylesheet');
          light.setAttribute('rel', 'stylesheet');
          sessionStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('theme-dark');
        }
      });

      li.appendChild(a);
      nav.appendChild(li);
      window.themeToggleInjected = true;
    }
  }
});
