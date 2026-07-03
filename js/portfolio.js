// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 45; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.cssText = `
            left: ${Math.random() * 100}vw;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${Math.random() * 25 + 18}s;
            animation-delay: ${Math.random() * 22}s;
        `;
        container.appendChild(p);
    }
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
    });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target) && navLinks?.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
    }
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

const animatedSelectors = [
    '.ai-card', '.edu-card', '.skill-group-block',
    '.career-card', '.portfolio-card', '.contact-card',
    '.section-header', '.ai-banner', '.hero-stats'
];

document.querySelectorAll(animatedSelectors.join(', ')).forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
});

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
const tabItems = document.querySelectorAll('.tab-item');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(a => a.style.color = '');
            const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (active) active.style.color = 'var(--blue-300)';

            tabItems.forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`.tab-item[data-section="${entry.target.id}"]`);
            if (activeTab) activeTab.classList.add('active');
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ===== INIT =====
createParticles();
