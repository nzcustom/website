(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';

      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute(
        'aria-label',
        open ? 'Menü schließen' : 'Menü öffnen'
      );

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

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const revealItems = document.querySelectorAll('.reveal');

  if (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });
  }

  const form = document.querySelector('#contact-form');

  if (form) {
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

    const maxFileSize = 100 * 1024 * 1024;

    const feedback = form.querySelector('.form-feedback');
    const submitButton = form.querySelector('button[type="submit"]');

    const originalButtonHTML = submitButton
      ? submitButton.innerHTML
      : '';

    const formatSize = (bytes) => {
      if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }

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
      if (input) {
        input.addEventListener('change', renderFileLists);
      }
    });

    const showFeedback = (message, type) => {
      if (!feedback) return;

      feedback.textContent = message;
      feedback.classList.remove('success', 'error');
      feedback.classList.add(type);
    };

    form.addEventListener('submit', (event) => {
      const files = uploadInputs.flatMap(({ input }) =>
        Array.from(input?.files || [])
      );

      const oversizedFile = files.find(
        (file) => file.size > maxFileSize
      );

      if (oversizedFile) {
        event.preventDefault();

        showFeedback(
          `Die Datei "${oversizedFile.name}" ist größer als 100 MB. Bitte wähle eine kleinere Datei aus.`,
          'error'
        );

        return;
      }

      if (feedback) {
        feedback.textContent = '';
        feedback.classList.remove('success', 'error');
      }
    });

    document.addEventListener('basinjsFormSubmitted', (event) => {
      if (event.detail?.form !== form) return;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Wird gesendet …';
      }
    });

    document.addEventListener('basinjsFormSuccess', (event) => {
      if (event.detail?.form !== form) return;

      form.reset();
      renderFileLists();

      if (feedback) {
        feedback.textContent = '';
        feedback.classList.remove('success', 'error');
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    });

    document.addEventListener('basinjsFormError', (event) => {
      if (event.detail?.form !== form) return;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }

      showFeedback(
        'Deine Anfrage konnte leider nicht gesendet werden. Bitte versuche es erneut.',
        'error'
      );

      console.error(
        'Basin submission error:',
        event.detail?.error
      );
    });
  }
})();
