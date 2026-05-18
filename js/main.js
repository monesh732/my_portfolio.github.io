document.addEventListener('DOMContentLoaded', () => {

  /* --- Scroll Progress Bar & Nav (single listener) --- */
  const scrollProgress = document.getElementById('scrollProgress');
  const nav = document.querySelector('.nav');
  let ticking = false;
  const onScroll = () => {
    const scrollTop = window.scrollY;
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      scrollProgress.style.setProperty('--scroll', scrollPercent);
    }
    if (nav) {
      nav.classList.toggle('scrolled', scrollTop > 20);
    }
    ticking = false;
  };

  if (scrollProgress || nav) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
    onScroll();
  }

  /* --- Mobile Nav Toggle --- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    /* Close mobile nav on link click */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Scroll Reveal --- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* --- Active Nav Highlighting --- */
  const sections = document.querySelectorAll('section[id], article[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)');

  if (sections.length > 0 && navAnchors.length > 0) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(s => navObserver.observe(s));
  }

  /* --- Contact Form Drafting --- */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  if (contactForm && contactStatus) {
    const setStatus = (message, type = '') => {
      contactStatus.classList.remove('is-error', 'is-success');
      if (type) contactStatus.classList.add(type);
      contactStatus.textContent = message;
    };

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const companyField = contactForm.querySelector('#company');
      if (companyField && companyField.value.trim()) {
        return;
      }

      if (!contactForm.checkValidity()) {
        setStatus('Please complete the required fields before sending.', 'is-error');
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const subjectValue = String(formData.get('subject') || '').trim();
      const message = String(formData.get('message') || '').trim();
      const payload = {
        name,
        email,
        subject: subjectValue || `Portfolio inquiry from ${name}`,
        message,
        _captcha: 'false',
        _template: 'table',
        _subject: 'New portfolio inquiry',
        _replyto: email
      };

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      setStatus('Sending your message...', '');

      fetch(contactForm.action, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          let data = {};

          try {
            data = await response.json();
          } catch {
            data = {};
          }

          if (!response.ok) {
            throw new Error(data.message || 'Something went wrong while sending your message.');
          }

          contactForm.reset();
          setStatus('Message sent successfully. I will reply by email soon.', 'is-success');
        })
        .catch(() => {
          setStatus('Could not send the message right now. Please try again or email me directly.', 'is-error');
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText || 'Send Message';
          }
        });
    });
  }

  const canUseHeavyMotion =
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.matchMedia('(pointer: coarse)').matches;

  /* --- Tilt Interactions for Cards --- */
  const tiltTargets = document.querySelectorAll(
    '.service-card, .project-card, .step, .blog-item, .contact-card, .hero-stat, .result-box'
  );
  if (canUseHeavyMotion) {
    tiltTargets.forEach((card) => {
      card.classList.add('tilt-card');
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let rafId = null;
      let active = false;

      const animateTilt = () => {
        if (!active) return;
        cx += (tx - cx) * 0.16;
        cy += (ty - cy) * 0.16;
        card.style.transform = `perspective(1000px) rotateX(${-cy * 8}deg) rotateY(${cx * 10}deg) translateY(-6px)`;
        rafId = window.requestAnimationFrame(animateTilt);
      };

      card.addEventListener('mouseenter', () => {
        active = true;
        if (!rafId) rafId = window.requestAnimationFrame(animateTilt);
      });
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        tx = (event.clientX - rect.left) / rect.width - 0.5;
        ty = (event.clientY - rect.top) / rect.height - 0.5;
      });
      card.addEventListener('mouseleave', () => {
        active = false;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        tx = 0;
        ty = 0;
        cx = 0;
        cy = 0;
        card.style.transform = '';
      });
    });
  }
});
