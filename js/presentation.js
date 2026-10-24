(() => {
    const dialog = document.getElementById('presentation');
    const stage = document.getElementById('deckStage');
    const jump = document.getElementById('deckJump');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const projects = [...document.querySelectorAll('.project-card')].map(card => {
        let images = [];
        try { images = JSON.parse(card.dataset.images || '[]'); } catch { /* Thumbnail remains available. */ }
        const cover = card.querySelector('img')?.getAttribute('src');
        return {
            title: card.querySelector('h2')?.textContent.trim() || 'Project',
            subtitle: card.querySelector('h3')?.textContent.trim() || '',
            description: card.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '',
            company: card.querySelector('.project-company')?.textContent.trim() || 'Selected project',
            tags: [...card.querySelectorAll('.proj-tech-badge')].map(el => el.textContent.replace(/\s+/g, ' ').trim()),
            images: [...new Set([cover, ...images].filter(Boolean))],
            caseStudyUrl: card.dataset.caseStudy || '',
            aiDemoUrl: card.dataset.aiDemo || '',
            liveUrl: card.dataset.liveUrl || '',
            aiAccuracy: card.dataset.aiAccuracy || ''
        };
    });
    const slides = [{ title: 'Introduction' }, ...projects, { title: 'Let’s build what’s next' }];
    let current = 0, imageIndex = 0, lastFocus, previousOverflow;
    let motionPaused = reduced.matches || document.body.classList.contains('motion-paused');
    let openedFullscreen = false;
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    slides.forEach((slide, index) => {
        const option = el('option', '', `${String(index + 1).padStart(2, '0')} / ${slide.title}`);
        option.value = index; jump.append(option);
    });
    function action(text, onClick, className = 'deck-action') {
        const button = el('button', className, text); button.type = 'button';
        button.addEventListener('click', onClick); return button;
    }
    function updateMotion() {
        dialog.classList.toggle('deck-motion-paused', motionPaused);
        const button = document.getElementById('deckMotion');
        button.setAttribute('aria-pressed', String(motionPaused));
        button.textContent = motionPaused ? '▷ Motion off' : 'Ⅱ Motion';
    }
    function render() {
        stage.replaceChildren();
        stage.classList.toggle('is-bookend', current === 0 || current === slides.length - 1);
        stage.classList.remove('image-expanded');
        const content = el('div', 'deck-copy');
        const title = el('h2', 'deck-title'); title.id = 'deckTitle';
        if (current === 0 || current === slides.length - 1) {
            const intro = current === 0;
            content.append(el('p', 'deck-eyebrow', intro ? 'THE DEVELOPER BEHIND THE WORK' : 'THANK YOU FOR YOUR TIME'));
            title.append(document.createTextNode(intro ? 'Built with purpose.' : 'Let’s build'), el('span', '', intro ? 'Made to matter.' : 'what’s next.'));
            content.append(title, el('p', 'deck-intro-name', 'Suprakron Maprachum'), el('p', 'deck-description', intro ? 'Full-Stack Developer · AI Enthusiast · M.Ed. Student in AI' : 'จากแนวคิดสู่ระบบที่ใช้งานจริง — พร้อมพูดคุยถึงโอกาสและความท้าทายใหม่'));
            const actions = el('div', 'deck-actions');
            if (intro) {
                actions.append(action('Explore the projects ↗', () => go(1)));
                content.append(el('p', 'deck-intro-meta', `${projects.length} PROJECTS / WEB · MOBILE · AI`));
            } else {
                const mail = el('a', 'deck-action', 'suprakron15@gmail.com ↗'); mail.href = 'mailto:suprakron15@gmail.com';
                const cv = el('a', 'deck-text-link', 'Download CV ↓'); cv.href = './cv/Resume_personal.pdf'; cv.download = '';
                actions.append(mail, cv, action('เริ่มใหม่ ↺', () => go(0), 'deck-text-link'));
            }
            content.append(actions);
            const sculpture = el('div', 'deck-sculpture'); sculpture.setAttribute('aria-hidden', 'true');
            sculpture.append(el('div', 'sculpture-ring ring-a'), el('div', 'sculpture-ring ring-b'), el('div', 'sculpture-ring ring-c'), el('div', 'sculpture-core', intro ? 'S.' : '↗'));
            stage.append(content, sculpture);
        } else {
            const project = projects[current - 1];
            content.append(el('p', 'deck-eyebrow', `PROJECT ${String(current).padStart(2, '0')} / ${project.company}`));
            title.textContent = project.title;
            content.append(title, el('p', 'deck-subtitle', project.subtitle), el('p', 'deck-description', project.description));
            const tags = el('div', 'deck-tags'); project.tags.forEach(tag => tags.append(el('span', '', tag))); content.append(tags);
            if (project.caseStudyUrl) {
                const evidence = el('div', 'deck-metrics');
                evidence.append(el('strong', '', project.aiAccuracy), el('span', '', '1,600 HELD-OUT CROPS / OPENCV RUNTIME'));
                content.append(evidence);
                const actions = el('div', 'deck-actions deck-project-actions');
                for (const [label, href, primary] of [
                    ['นำเสนอโปรเจคนี้ ↗', project.caseStudyUrl, true],
                    ['ลอง AI อ่านรอยฝน ↗', project.aiDemoUrl, false],
                    ['เปิดระบบในเครื่อง ↗', project.liveUrl, false]
                ]) {
                    if (!href) continue;
                    const link = el('a', primary ? 'deck-action' : 'deck-text-link', label);
                    link.href = href; link.target = '_blank'; link.rel = 'noopener'; actions.append(link);
                }
                content.append(actions);
            }
            const visual = el('div', 'deck-visual');
            if (project.images.length) {
                const frame = el('div', 'deck-browser');
                frame.append(el('div', 'deck-browser-top', '● ● ●     / PROJECT PREVIEW'));
                const image = el('img', 'deck-project-image'); image.alt = `${project.title} — image ${imageIndex + 1}`;
                image.src = project.images[imageIndex]; image.loading = 'eager'; image.decoding = 'async';
                image.addEventListener('error', () => {
                    image.hidden = true; frame.append(el('p', 'deck-image-error', 'ไม่สามารถโหลดภาพนี้ได้ กรุณาเลือกรูปถัดไป'));
                });
                frame.append(image); visual.append(frame);
                const controls = el('div', 'deck-image-controls');
                const prevImage = action('←', () => changeImage(-1), 'deck-small-button'); prevImage.setAttribute('aria-label', 'รูปก่อนหน้า');
                const nextImage = action('→', () => changeImage(1), 'deck-small-button'); nextImage.setAttribute('aria-label', 'รูปถัดไป');
                prevImage.disabled = nextImage.disabled = project.images.length < 2;
                const expand = action('⤢ ขยายภาพ', () => {
                    const expanded = stage.classList.toggle('image-expanded');
                    expand.textContent = expanded ? '⤡ กลับสู่สไลด์' : '⤢ ขยายภาพ';
                    expand.setAttribute('aria-pressed', String(expanded));
                }, 'deck-small-button'); expand.setAttribute('aria-pressed', 'false');
                controls.append(prevImage, el('span', '', `${imageIndex + 1} / ${project.images.length}`), nextImage, expand);
                visual.append(controls);
            } else {
                const placeholder = el('div', 'deck-no-image');
                placeholder.append(el('span', '', '▦'), el('h3', '', project.title), el('p', '', 'Enterprise system / ไม่มีภาพตัวอย่าง'));
                visual.append(placeholder);
            }
            stage.append(content, visual);
        }
        jump.value = current;
        document.getElementById('deckCounter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        document.getElementById('deckProgress').style.width = `${(current + 1) / slides.length * 100}%`;
        document.getElementById('deckPrev').disabled = current === 0;
        document.getElementById('deckNext').disabled = current === slides.length - 1;
        document.getElementById('deckAnnouncement').textContent = `สไลด์ ${current + 1} จาก ${slides.length}: ${slides[current].title}`;
        stage.scrollTop = 0;
    }
    function go(index) {
        if (index < 0 || index >= slides.length) return;
        const focusedInStage = stage.contains(document.activeElement);
        current = index; imageIndex = 0; render();
        if (focusedInStage) document.getElementById('deckNext').focus();
    }
    function changeImage(direction) {
        if (current < 1 || current > projects.length) return;
        const count = projects[current - 1].images.length;
        if (count < 2) return;
        const expanded = stage.classList.contains('image-expanded');
        const focusedInStage = stage.contains(document.activeElement);
        imageIndex = (imageIndex + direction + count) % count; render();
        if (expanded) {
            stage.classList.add('image-expanded');
            const expand = stage.querySelector('[aria-pressed]');
            expand.textContent = '⤡ กลับสู่สไลด์'; expand.setAttribute('aria-pressed', 'true');
        }
        if (focusedInStage) stage.querySelector('.deck-image-controls button')?.focus();
    }
    async function fullscreen() {
        try {
            if (document.fullscreenElement === dialog) await document.exitFullscreen();
            else if (dialog.requestFullscreen) { await dialog.requestFullscreen(); openedFullscreen = true; }
        } catch { /* The viewport presentation remains usable when fullscreen is unavailable. */ }
    }
    function open() {
        if (dialog.open) return;
        lastFocus = document.activeElement; previousOverflow = document.body.style.overflow;
        current = 0; imageIndex = 0; render(); updateMotion();
        dialog.showModal(); document.body.style.overflow = 'hidden';
        document.getElementById('deckNext').focus();
    }
    document.getElementById('presentLaunch').addEventListener('click', open);
    document.getElementById('presentStart').addEventListener('click', open);
    document.getElementById('deckClose').addEventListener('click', () => dialog.close());
    document.getElementById('deckPrev').addEventListener('click', () => go(current - 1));
    document.getElementById('deckNext').addEventListener('click', () => go(current + 1));
    jump.addEventListener('change', () => go(Number(jump.value)));
    document.getElementById('deckFullscreen').addEventListener('click', fullscreen);
    if (!dialog.requestFullscreen) document.getElementById('deckFullscreen').hidden = true;
    document.getElementById('deckMotion').addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
    reduced.addEventListener('change', event => { motionPaused = event.matches; updateMotion(); });
    dialog.addEventListener('close', () => {
        if (openedFullscreen && document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
        openedFullscreen = false;
        document.body.style.overflow = previousOverflow;
        lastFocus?.focus();
    });
    dialog.addEventListener('keydown', event => {
        if (event.target.matches('select,input,textarea') || event.altKey || event.ctrlKey || event.metaKey) return;
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageDown', 'PageUp', 'Home', 'End', 'f', 'F'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        if (['ArrowRight', 'PageDown'].includes(event.key)) go(current + 1);
        if (['ArrowLeft', 'PageUp'].includes(event.key)) go(current - 1);
        if (event.key === 'ArrowUp') changeImage(-1);
        if (event.key === 'ArrowDown') changeImage(1);
        if (event.key === 'Home') go(0);
        if (event.key === 'End') go(slides.length - 1);
        if (event.key.toLowerCase() === 'f') fullscreen();
    });
})();
