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
    const uploadInputs = [
      { input: form.querySelector('#reference-images'), list: form.querySelector('#reference-file-list') },
      { input: form.querySelector('#sketch-images'), list: form.querySelector('#sketch-file-list') }
    ];
    const maxTotalSize = 10 * 1024 * 1024;

    const formatSize = (bytes) => {
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    };

    const renderFileLists = () => {
      uploadInputs.forEach(({ input, list }) => {
        if (!input || !list) return;
        list.innerHTML = '';
        Array.from(input.files || []).forEach((file) => {
          const item = document.createElement('li');
          const name = document.createElement('span');
          const size = document.createElement('small');
          name.textContent = file.name;
          size.textContent = formatSize(file.size);
          item.append(name, size);
          list.appendChild(item);
        });
      });
    };

    uploadInputs.forEach(({ input }) => {
      if (input) input.addEventListener('change', renderFileLists);
    });

    // FormSubmit benötigt für Anhänge einen normalen multipart-POST.
    // Nach dem Versand kehrt der Besucher mit ?anfrage=gesendet zur Seite zurück.
    const nextField = form.querySelector('#form-next');
    if (nextField) {
      const returnUrl = new URL(window.location.href);
      returnUrl.search = '';
      returnUrl.hash = 'contact';
      returnUrl.searchParams.set('anfrage', 'gesendet');
      nextField.value = returnUrl.toString();
    }

    const replyToField = form.querySelector('#form-replyto');
    const emailField = form.querySelector('input[name="email"]');
    if (replyToField && emailField) {
      emailField.addEventListener('input', () => {
        replyToField.value = emailField.value.trim();
      });
    }

    const feedback = form.querySelector('.form-feedback');
    const params = new URLSearchParams(window.location.search);
    if (params.get('anfrage') === 'gesendet' && feedback) {
      feedback.textContent = 'Vielen Dank! Deine Anfrage wurde übermittelt. Ich melde mich so bald wie möglich bei dir.';
      feedback.classList.add('success');
      form.reset();
      renderFileLists();
      params.delete('anfrage');
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = params.toString();
      cleanUrl.hash = 'contact';
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }

    form.addEventListener('submit', (event) => {
      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }
      const totalSize = uploadInputs.reduce((total, { input }) => {
        return total + Array.from(input?.files || []).reduce((sum, file) => sum + file.size, 0);
      }, 0);
      if (totalSize > maxTotalSize) {
        event.preventDefault();
        if (feedback) {
          feedback.textContent = 'Die ausgewählten Bilder sind zusammen größer als 10 MB. Bitte wähle weniger oder kleinere Dateien aus.';
          feedback.classList.add('error');
          feedback.classList.remove('success');
        }
        return;
      }
      const action = form.getAttribute('action') || '';
      if (action.includes('DEINE-EMAIL@BEISPIEL.DE')) {
        event.preventDefault();
        if (feedback) {
          feedback.textContent = 'Bitte trage zuerst deine Empfänger-E-Mail-Adresse in der action-Adresse des Formulars ein.';
          feedback.classList.add('error');
        }
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = 'Wird gesendet …';
      }
    });
  }
})();
