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

  // Kleine, dezente Scroll-Reveals; bei reduzierter Bewegung bleibt alles sichtbar.
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

  // Netlify Forms: AJAX-Versand mit sichtbarer Rückmeldung.
  // Netlify erkennt das Formular anhand von data-netlify und form-name beim Deploy.
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const feedback = form.querySelector('.form-feedback');
      if (!form.reportValidity()) return;

      const originalButton = button.innerHTML;
      button.disabled = true;
      button.innerHTML = 'Wird gesendet …';
      feedback.textContent = '';
      feedback.classList.remove('error');

      try {
        const formData = new FormData(form);
        const body = new URLSearchParams();
        for (const [key, value] of formData.entries()) body.append(key, value);

        const response = await fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        if (!response.ok) throw new Error('Formular konnte nicht gesendet werden.');
        form.reset();
        feedback.textContent = 'Vielen Dank! Deine Anfrage wurde erfolgreich gesendet.';
        button.innerHTML = 'Anfrage gesendet ✓';
      } catch (error) {
        feedback.textContent = 'Das hat leider nicht funktioniert. Bitte versuche es erneut oder schreibe direkt über Instagram.';
        feedback.classList.add('error');
        button.innerHTML = originalButton;
        button.disabled = false;
      }
    });
  }
})();
