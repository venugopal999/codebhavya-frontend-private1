/* Measure the shared header so anchors and the course drawer stay below it. */
document.addEventListener('DOMContentLoaded', () => {
    const host = document.querySelector('.top-header');
    const update = () => {
        if (!host) return;
        const height = Math.ceil(host.getBoundingClientRect().height);
        if (height > 0) {
            document.body.style.setProperty('--wt-shell-height', height + 'px');
            document.documentElement.style.setProperty('scroll-padding-top', (height + 18) + 'px', 'important');
        }
    };
    document.querySelectorAll('.wt-term-card,[data-wt-shared-flip]').forEach(card => {
        const front = card.querySelector('.wt-term-front,.wt8-flip-front');
        const back = card.querySelector('.wt-term-back,.wt8-flip-back');
        if (!front || !back || card.dataset.wtFlipReady) return;
        card.dataset.wtFlipReady = 'true';
        const toggle = () => {
            const flipped = card.classList.toggle('is-flipped');
            card.setAttribute('aria-pressed', String(flipped));
            front.setAttribute('aria-hidden', String(flipped));
            back.setAttribute('aria-hidden', String(!flipped));
        };
        back.setAttribute('aria-hidden', 'true');
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();toggle();}
        });
    });
    const urlParts = Array.from(document.querySelectorAll('.wt8-url-part[role="button"]'));
    urlParts.forEach(part => {
        part.addEventListener('click', () => {
            urlParts.forEach(other => {
                const active = other === part;
                other.classList.toggle('is-active', active);
                other.setAttribute('aria-pressed', String(active));
            });
        });
        part.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();part.click();}
        });
    });
    update();
    if (host && 'ResizeObserver' in window) new ResizeObserver(update).observe(host);
    document.addEventListener('codebhavya:headerLoaded', update);
    window.addEventListener('resize', update, {passive:true});
});
