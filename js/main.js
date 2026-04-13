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

  /* --- Mouse Parallax (hero scene) --- */
  const parallaxLayers = document.querySelectorAll('[data-parallax-depth]');
  const canUseHeavyMotion =
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.matchMedia('(pointer: coarse)').matches;

  if (parallaxLayers.length > 0 && canUseHeavyMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let parallaxRafId = null;

    const animateParallax = () => {
      // Lerp for smoother, less jittery motion
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      parallaxLayers.forEach((layer) => {
        const depth = Number(layer.getAttribute('data-parallax-depth')) || 0.2;
        layer.style.transform = `translate3d(${currentX * 18 * depth}px, ${currentY * 18 * depth}px, 0)`;
      });

      parallaxRafId = window.requestAnimationFrame(animateParallax);
    };

    window.addEventListener('mousemove', (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    animateParallax();
    window.addEventListener('beforeunload', () => {
      if (parallaxRafId) window.cancelAnimationFrame(parallaxRafId);
    });
  }

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
