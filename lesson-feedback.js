/* Public learning pages only. Opens an email draft; sends nothing automatically. */
(function () {
    'use strict';
    const courses = /\/(?:C-Programming|Data-Structures|Python|Java|Full-Stack|Computer-Networks|Labs|Programs|AI-ML|DBMS|Maths|Operating-Systems|Web-Technologies|Advanced-Data-Structures)\//;
    if (!courses.test(location.pathname) || document.getElementById('cb-lesson-feedback')) return;
    const assetBase = new URL('.', document.currentScript.src);
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('lesson-feedback.css', assetBase).href;
    document.head.appendChild(style);
    if (!document.querySelector('script[data-cb-learning-paths]')) {
        const paths = document.createElement('script');
        paths.src = new URL('learning-paths.js?v=1', assetBase).href;
        paths.dataset.cbLearningPaths = 'true';
        paths.defer = true;
        document.head.appendChild(paths);
    }
    function mount() {
        const main = document.querySelector('main');
        if (!main || document.getElementById('cb-lesson-feedback')) return;
        const page = new URL(location.pathname, location.origin);
        const level = new URLSearchParams(location.search).get('level');
        if (/\/(Java|Full-Stack)\/lesson(?:\.html)?$/.test(page.pathname) && /^\d{1,2}$/.test(level || '')) {
            const max = page.pathname.includes('/Java/') ? 24 : 30;
            if (Number(level) >= 1 && Number(level) <= max) page.searchParams.set('level', String(Number(level)));
        }
        const box = document.createElement('aside');
        box.id = 'cb-lesson-feedback';
        box.className = 'cb-lesson-feedback';
        box.setAttribute('aria-label', 'Report a learning content issue');
        const text = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = 'Spotted an issue in this lesson?';
        const hint = document.createElement('p');
        hint.textContent = 'Help improve the explanation, code or output. Your email draft includes this page’s address.';
        text.append(title, hint);
        const actions = document.createElement('div');
        actions.className = 'cb-lesson-feedback-actions';
        const report = document.createElement('a');
        report.className = 'cb-lesson-feedback-report';
        report.textContent = 'Report an issue';
        report.addEventListener('click', function () {
            const subject = 'Learning content issue: ' + document.title.slice(0, 140);
            const body = 'Page: ' + page.href + '\n\nIssue / section:\n\nInput or steps (if relevant):\n\nExpected result:\n\nActual result:\n\nPlease do not include passwords, payment details or other sensitive information.\n';
            report.href = 'mailto:support@codebhavya.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        });
        report.href = 'mailto:support@codebhavya.com';
        const contact = document.createElement('a');
        contact.href = new URL('contact.html', assetBase).href;
        contact.textContent = 'Contact options';
        const search = document.createElement('a');
        search.href = new URL('search.html', assetBase).href;
        search.textContent = 'Search learning topics';
        actions.append(report, contact, search);
        box.append(text, actions);
        main.appendChild(box);
        // Only direct main replacements are observed; tracer updates are ignored.
        if (!main.dataset.cbFeedbackObserved) {
            main.dataset.cbFeedbackObserved = 'true';
            new MutationObserver(function () {
                if (!document.getElementById('cb-lesson-feedback')) mount();
            }).observe(main, { childList: true });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
})();
