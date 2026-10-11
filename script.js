const menuButton = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.main-nav');
const siteHeader = document.querySelector('.site-header');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '×' : '☰';
});

const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const contactLink = document.querySelector('.header-contact[href^="#"]');
const sectionLinks = [...navLinks, contactLink].filter(Boolean);
const navSections = sectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setActiveNav(sectionId) {
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  if (contactLink) {
    const isContactActive = sectionId === 'contact';
    contactLink.classList.toggle('active', isContactActive);
    if (isContactActive) contactLink.setAttribute('aria-current', 'location');
    else contactLink.removeAttribute('aria-current');
  }
}

function sectionAnchorElement(target) {
  if (!target) return null;
  if (target.id === 'contact') return target.querySelector('.contact-card') || target;
  return target.querySelector('.section-heading') || target.querySelector('.projects-head') || target;
}

function scrollToSection(sectionId, behavior = 'smooth') {
  if (!sectionId || sectionId === 'top') {
    window.scrollTo({ top: 0, behavior });
    setActiveNav('');
    return;
  }

  const target = document.getElementById(sectionId);
  if (!target) return;
  const anchor = sectionAnchorElement(target);
  const headerHeight = siteHeader?.offsetHeight ?? 72;
  const top = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - headerHeight - 18);
  window.scrollTo({ top, behavior });
  setActiveNav(sectionId);
}

function closeMobileNav() {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = '☰';
}

const inPageLinks = [
  ...document.querySelectorAll('.main-nav a[href^="#"], .header-contact[href^="#"], .quick-nav a[href^="#"], .hero-actions a[href^="#"], .brand[href^="#"]')
];

inPageLinks.forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const sectionId = hash.slice(1);
    event.preventDefault();
    if (sectionId === 'top') {
      history.pushState(null, '', '#top');
      scrollToSection('top');
    } else {
      history.pushState(null, '', hash);
      scrollToSection(sectionId);
    }
    closeMobileNav();
  });
});

function updateActiveNavFromScroll() {
  if (!navSections.length) return;
  if (window.scrollY <= 8) {
    setActiveNav('');
    return;
  }

  const headerHeight = siteHeader?.offsetHeight ?? 72;
  const marker = window.scrollY + headerHeight + 80;
  let currentSection = null;
  navSections.forEach(section => {
    if (marker >= section.offsetTop) currentSection = section;
  });
  if (currentSection) setActiveNav(currentSection.id);
}

let navScrollTicking = false;
window.addEventListener('scroll', () => {
  if (navScrollTicking) return;
  navScrollTicking = true;
  window.requestAnimationFrame(() => {
    updateActiveNavFromScroll();
    navScrollTicking = false;
  });
}, { passive: true });
window.addEventListener('resize', updateActiveNavFromScroll);

const chips = [...document.querySelectorAll('.filter-chip')];
const cards = [...document.querySelectorAll('.project-card')];
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    cards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      const show = filter === 'all' || categories.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

const backToTopButton = document.getElementById('backToTop');
backToTopButton?.addEventListener('click', event => {
  event.preventDefault();
  history.pushState(null, '', '#top');
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  setActiveNav('');
});

// Reposition a deep link with the same visual offset used by menu navigation.
const initialHash = window.location.hash.slice(1);
if (initialHash) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => scrollToSection(initialHash, 'auto'), 0);
  });
} else {
  updateActiveNavFromScroll();
}
