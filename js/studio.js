(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = document.createElement('button');
    motion.type = 'button';
    motion.className = 'motion-toggle';
    let paused = reduced.matches;
    const carousels = () => document.querySelectorAll('[data-bs-ride="carousel"]');
    function applyMotion() {
        document.body.classList.toggle('motion-paused', paused);
        motion.textContent = paused ? '▷ Motion off' : 'Ⅱ Pause motion';
        motion.setAttribute('aria-pressed', String(paused));
        motion.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
        carousels().forEach(el => {
            const instance = window.bootstrap?.Carousel.getOrCreateInstance(el);
            if (paused) instance?.pause(); else instance?.cycle();
        });
    }
    motion.addEventListener('click', () => { paused = !paused; applyMotion(); });
    document.body.append(motion);
    window.addEventListener('load', applyMotion);
    reduced.addEventListener('change', event => { paused = event.matches; applyMotion(); });
    applyMotion();

    const progress = document.querySelector('.reading-progress');
    let ticking = false;
    function updateProgress() {
        const distance = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
        ticking = false;
    }
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();

    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector('.hero-cinematic');
    if (hero) {
        let sceneFrame;
        const resetScene = () => {
            cancelAnimationFrame(sceneFrame);
            hero.style.removeProperty('--scene-x');
            hero.style.removeProperty('--scene-y');
        };
        hero.addEventListener('pointermove', event => {
            if (paused || !finePointer.matches) return;
            cancelAnimationFrame(sceneFrame);
            sceneFrame = requestAnimationFrame(() => {
                const box = hero.getBoundingClientRect();
                hero.style.setProperty('--scene-x', `${-((event.clientY - box.top) / box.height - .5) * 7}deg`);
                hero.style.setProperty('--scene-y', `${((event.clientX - box.left) / box.width - .5) * 10}deg`);
            });
        });
        hero.addEventListener('pointerleave', resetScene);
        motion.addEventListener('click', resetScene);
        reduced.addEventListener('change', resetScene);
    }
    document.querySelectorAll('.ai-card,.portfolio-card,.work-feature,.cert-card,.gallery-item').forEach(card => {
        let frame;
        card.addEventListener('pointermove', event => {
            if (paused || !finePointer.matches) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const box = card.getBoundingClientRect();
                const x = (event.clientX - box.left) / box.width - .5;
                const y = (event.clientY - box.top) / box.height - .5;
                card.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
            });
        });
        card.addEventListener('pointerleave', () => {
            cancelAnimationFrame(frame);
            card.style.transform = '';
        });
    });
    document.querySelectorAll('.project-card[data-bs-toggle],.cert-card[data-img],.gallery-item[data-img]').forEach(card => {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.classList.add('keyboard-card');
        card.setAttribute('aria-label', card.querySelector('h2')?.textContent?.trim() || card.querySelector('img')?.alt || 'Open image');
        card.addEventListener('keydown', event => {
            if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault(); card.click();
            }
        });
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.getElementById('navLinks')?.classList.remove('open');
            document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
            document.getElementById('langDropdown')?.classList.remove('open');
        }
    });
    document.querySelectorAll('img').forEach(img => {
        if (!img.closest('.hero')) { img.loading = 'lazy'; img.decoding = 'async'; }
    });
})();
