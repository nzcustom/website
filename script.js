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
    // Public Form ID: no API key is needed for a client-side Forminit form.
    const FORM_ID = 'nhborn9zfl9';
    const forminit = typeof window.Forminit === 'function' ? new window.Forminit() : null;
    const button = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('.form-feedback');
    let isSubmitting = false;

    const uploadInputs = [
      {
        input: form.querySelector('#reference-images'),
        list: form.querySelector('#reference-file-list')
      },
      {
        input: form.querySelector('#sketch-images'),
        list: form.querySelector('#sketch-file-list')
      }
    ];

    // Keep below Forminit's 25 MB request limit to leave room for form data.
    const maxTotalSize = 24 * 1024 * 1024;

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

    const FIELD_ERRORS = {
      'sender.firstName': 'Bitte verwende im Vornamen nur Buchstaben, Leerzeichen, Bindestriche, Apostrophe oder Punkte.',
      'sender.lastName': 'Bitte verwende im Nachnamen nur Buchstaben, Leerzeichen, Bindestriche, Apostrophe oder Punkte.',
      'sender.email': 'Bitte gib eine gültige E-Mail-Adresse ein.',
      'date.deadline': 'Bitte gib ein gültiges Datum ein.'
    };

    const getErrorMessage = (error) => {
      const fieldName = error?.fieldName || error?.message?.match(/'([^']+)'/)?.[1];
      if (fieldName && FIELD_ERRORS[fieldName]) return FIELD_ERRORS[fieldName];
      if (error?.code === 'TOO_MANY_REQUESTS' || error?.error === 'TOO_MANY_REQUESTS') {
        return 'Bitte warte einige Sekunden und versuche es anschließend erneut.';
      }
      return 'Deine Anfrage konnte leider nicht gesendet werden. Bitte prüfe deine Angaben und versuche es erneut.';
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      if (!form.reportValidity()) return;

      const totalSize = uploadInputs.reduce((total, { input }) => {
        return total + Array.from(input?.files || []).reduce((sum, file) => sum + file.size, 0);
      }, 0);

      if (totalSize > maxTotalSize) {
        feedback.textContent = 'Die ausgewählten Bilder sind zusammen größer als 24 MB. Bitte wähle weniger oder kleinere Dateien aus.';
        feedback.classList.add('error');
        feedback.classList.remove('success');
        return;
      }

      if (!forminit) {
        feedback.textContent = 'Das Formular konnte gerade nicht geladen werden. Bitte lade die Seite neu und versuche es erneut.';
        feedback.classList.add('error');
        feedback.classList.remove('success');
        return;
      }

      // Build FormData before disabling the button; disabled controls are omitted.
      const fd = new FormData(form);

      // Forminit sender-name validation accepts straight apostrophes only.
      for (const key of ['fi-sender-firstName', 'fi-sender-lastName']) {
        const value = fd.get(key);
        if (typeof value === 'string') fd.set(key, value.replace(/[\u2018\u2019]/g, "'"));
      }

      isSubmitting = true;
      button.disabled = true;
      feedback.textContent = 'Deine Anfrage wird gesendet …';
      feedback.classList.remove('error', 'success');

      try {
        const { data, error } = await forminit.submit(FORM_ID, fd);

        if (error) {
          console.error('Forminit-Fehler:', error);
          feedback.textContent = getErrorMessage(error);
          feedback.classList.add('error');
          return;
        }

        if (typeof data?.hashId !== 'string') {
          console.error('Forminit hat keine gültige Bestätigung zurückgegeben:', data);
          feedback.textContent = 'Deine Anfrage konnte leider nicht bestätigt werden. Bitte versuche es erneut.';
          feedback.classList.add('error');
          return;
        }

        form.reset();
        renderFileLists();
        feedback.textContent = 'Vielen Dank! Deine Anfrage wurde erfolgreich gesendet.';
        feedback.classList.add('success');
      } catch (error) {
        console.error('Formular-Fehler:', error);
        feedback.textContent = 'Das hat leider nicht funktioniert. Bitte versuche es erneut oder schreibe direkt über Instagram.';
        feedback.classList.add('error');
      } finally {
        isSubmitting = false;
        button.disabled = false;
      }
    });
  }
})();
