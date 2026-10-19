/* Optional learning navigation. It reads only public route metadata. */
(function () {
    'use strict';
    if (window.cbLearningPathsLoaded) return;
    window.cbLearningPathsLoaded = true;
    const base = new URL('.', document.currentScript.src);
    const url = new URL(location.pathname, location.origin);
    // Cloudflare may expose extensionless lesson routes.
    let path = url.pathname;
    if (/\/(Java|Full-Stack)\/lesson(?:\.html)?$/.test(path)) {
        const max = path.includes('/Java/') ? 24 : 30;
        const raw = new URLSearchParams(location.search).get('level');
        const value = raw === null ? 1 : Number(raw);
        if (!Number.isInteger(value) || value < 1 || value > max) return;
        path = path.replace(/\/lesson$/, '/lesson.html') + '?level=' + value;
    } else if (!path.endsWith('.html')) {
        path = path.replace(/\/$/, '') + '.html';
    }
    function create(tag, text, cls) {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        if (cls) el.className = cls;
        return el;
    }
    function safeLink(item) {
        if (!item || typeof item.url !== 'string' || typeof item.label !== 'string') return null;
        let target;
        try { target = new URL(item.url, base); } catch (_) { return null; }
        if (target.origin !== base.origin || !/^\/(C-Programming|Data-Structures|Advanced-Data-Structures|Python|Java|Full-Stack|Computer-Networks|DBMS|Operating-Systems|AI-ML|Maths|Web-Technologies|Labs)\//.test(target.pathname)) return null;
        const a = create('a', item.label);
        a.href = target.href;
        return a;
    }
    function start(data) {
        const entry = data.pages && data.pages[path];
        if (!entry) return;
        if (!document.querySelector('script[data-cb-reading-tools]')) {
            const tools = document.createElement('script');
            tools.src = new URL('reading-tools.js?v=1', base).href;
            tools.dataset.cbReadingTools = 'true';tools.defer = true;
            document.head.appendChild(tools);
        }
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = new URL('learning-paths.css?v=1', base).href;
        document.head.appendChild(css);
        function mount() {
            const main = document.querySelector('main');
            if (!main || document.getElementById('cb-learning-paths')) return;
            const panel = create('section', undefined, 'cb-learning-paths');
            panel.id = 'cb-learning-paths';
            panel.setAttribute('aria-labelledby', 'cb-learning-paths-title');
            panel.append(create('p', 'CONNECT YOUR LEARNING', 'cb-learning-paths-kicker'));
            const h2 = create('h2', 'Where to go from here');
            h2.id = 'cb-learning-paths-title';
            panel.append(h2, create('p', 'Review helpful background, continue the course, or apply the concept.', 'cb-learning-paths-intro'));
            const grid = create('div', undefined, 'cb-learning-paths-grid');
            const practice = (entry.practice || []).slice();
            // Link actual existing exercises rather than inventing new tasks.
            const local = main.querySelector('.practice-section') || main.querySelector('#practice') || main.querySelector('.cn-check');
            if (local && !practice.length) {
                if (!local.id) local.id = 'cb-current-lesson-practice';
                practice.push({url: path + '#' + local.id, label: local.classList.contains('cn-check') ? 'Check your understanding in this lesson' : 'Try this lesson’s practice tasks'});
            }
            const groups = [
                ['before', 'Before you start', 'Helpful background to review when needed.', entry.before || []],
                ['next', 'Learn next', 'Continue with a connected topic.', entry.next || []],
                ['practice', 'Practise this', 'Use the concept in an exercise or example.', practice]
            ];
            groups.forEach(function (group) {
                const list = create('ul');
                group[3].forEach(function (item) {
                    const a = safeLink(item);
                    if (!a) return;
                    const li = create('li');li.append(a);list.append(li);
                });
                if (!list.children.length) return;
                const card = create('div', undefined, 'cb-learning-paths-card cb-learning-paths-' + group[0]);
                card.append(create('h3', group[1]), create('p', group[2]), list);
                grid.append(card);
            });
            if (!grid.children.length) return;
            panel.append(grid);
            const feedback = document.getElementById('cb-lesson-feedback');
            if (feedback && feedback.parentElement === main) main.insertBefore(panel, feedback);
            else main.appendChild(panel);
        }
        function observe() {
            const main = document.querySelector('main');
            if (!main) return;
            mount();
            new MutationObserver(function () {
                if (!document.getElementById('cb-learning-paths')) mount();
            }).observe(main, {childList: true});
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, {once: true});
        else observe();
    }
    fetch(new URL('learning-paths-data.json?v=1', base), {credentials: 'omit'})
        .then(function (response) {if (!response.ok) throw new Error('Unavailable');return response.json();})
        .then(start).catch(function () {/* Lessons remain usable if this optional navigation cannot load. */});
})();
