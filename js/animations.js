/* ===== Beauty MAMA — Animations (GSAP + ScrollTrigger) ===== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- Hero content stagger (the signature "from bottom" reveal) ---
  const heroContent = document.querySelector('.hero__content');
  const heroImage = document.querySelector('.hero__image');

  if (heroContent) {
    gsap.fromTo(heroContent.children,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2
      }
    );
  }

  if (heroImage) {
    gsap.fromTo(heroImage,
      { opacity: 0, scale: 1.03 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        delay: 0.1
      }
    );
  }

  // --- Universal "from bottom" text reveal for ALL section text elements ---
  const textReveals = document.querySelectorAll(
    '.section-header, .section-header__label, .heading-lg, ' +
    '.about__heading, .about__story, .about__features, ' +
    '.contact__heading, .contact__item, .contact .cta-btn, ' +
    '.footer__tagline, .footer__links, .footer__social, .footer__copy, ' +
    '.blog__swipe-hint'
  );

  textReveals.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  // --- Service rows — image slides in from side, text from bottom ---
  const serviceRows = document.querySelectorAll('.service-row');

  serviceRows.forEach((row) => {
    const image = row.querySelector('.service-row__image');
    const content = row.querySelector('.service-row__content');
    const isReverse = row.classList.contains('service-row--reverse');

    if (image) {
      gsap.fromTo(image,
        { opacity: 0, x: isReverse ? 30 : -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    if (content) {
      // Content children reveal from bottom like hero
      gsap.fromTo(content.children,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  });

  // --- Portfolio items — quick scale reveal ---
  const portfolioItems = document.querySelectorAll('.portfolio__item');

  portfolioItems.forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, scale: 0.97 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        delay: i * 0.04,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  // --- About section text — from bottom stagger ---
  const aboutText = document.querySelector('.about__text');
  if (aboutText) {
    gsap.fromTo(aboutText.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutText,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // --- About image reveal ---
  const aboutImage = document.querySelector('.about__image-wrap');
  if (aboutImage) {
    gsap.fromTo(aboutImage,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutImage,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // --- Blog cards — from bottom ---
  const blogCards = document.querySelectorAll('.blog__card');

  blogCards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  // --- Footer brand ---
  const footerBrand = document.querySelector('.footer__brand');
  if (footerBrand) {
    gsap.fromTo(footerBrand,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 0.08,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerBrand,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // --- Hero image: no parallax (prevents height shift on scroll back) ---

  // --- Nav hide on scroll down, show on scroll up (DISABLED — nav stays visible) ---
  // const nav = document.querySelector('.nav');
});
