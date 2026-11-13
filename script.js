(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      nav.classList.toggle('open', open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Menü öffnen');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Menü öffnen');
      }
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const form = document.querySelector('.contact-form');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');
      const feedback = form.querySelector('.form-feedback');

      if (!form.reportValidity()) return;

      const originalButton = button.innerHTML;

      button.disabled = true;
      button.textContent = 'Wird gesendet …';

      feedback.textContent = '';
      feedback.classList.remove('error');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          const message = result.errors
            ? result.errors.map(error => error.message).join(', ')
            : 'Formular konnte nicht gesendet werden.';

          throw new Error(message);
        }

        form.reset();

        feedback.textContent =
          'Vielen Dank! Deine Anfrage wurde erfolgreich gesendet.';

        button.textContent = 'Anfrage gesendet ✓';

      } catch (error) {
        console.error('Formspree-Fehler:', error);

        feedback.textContent =
          'Das hat leider nicht funktioniert. Bitte versuche es erneut oder schreibe direkt über Instagram.';

        feedback.classList.add('error');

        button.innerHTML = originalButton;
        button.disabled = false;
      }
    });
  }

})();
