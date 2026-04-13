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
});
