/* Optional display preferences only; no accounts or learning history are read. */
(function () {
    'use strict';
    if (window.cbReadingToolsLoaded) return;
    window.cbReadingToolsLoaded = true;
    const base = new URL('.', document.currentScript.src);
    const css = document.createElement('link');
    css.rel = 'stylesheet';css.href = new URL('reading-tools.css?v=1', base).href;
    document.head.appendChild(css);
    const key = 'cb-reading-preferences-v1', scales = [1, 1.125, 1.25, 1.4];
    let prefs = {size: 0, wrap: false}, storageWorks = true;
    try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && Number.isInteger(saved.size) && saved.size >= 0 && saved.size < scales.length && typeof saved.wrap === 'boolean') prefs = {size: saved.size, wrap: saved.wrap};
    } catch (_) { storageWorks = false; }
    const textSelector = 'p,li,h1,h2,h3,h4,h5,h6,td,th,blockquote,summary,pre,code';
    const exclude = '#cb-reading-tools,.cb-learning-paths,.cb-lesson-feedback,nav,button,input,textarea,select,[contenteditable],svg,canvas,[role="dialog"],.CodeMirror,.cm-editor,.monaco-editor,.ace_editor';
    const interactive = /(?:trac(?:e|er|ing)|visual|(?:^|[\s_-])viz(?:[\s_-]|$)|editor|console|terminal|debug|diagram|memory|live[-_ ]?state|call[-_ ]?stack|cb-sv)/i;
    let main, toolbar, sizeLabel, less, more, wrap, note, frame = 0, observer;
    function create(tag, text, cls) {
        const e = document.createElement(tag);if (text !== undefined) e.textContent = text;if (cls) e.className = cls;return e;
    }
    function eligible(el) {
        if (el.closest(exclude)) return false;
        for (let p = el; p && p !== main; p = p.parentElement) {
            if (interactive.test((p.id || '') + ' ' + (typeof p.className === 'string' ? p.className : ''))) return false;
        }
        return true;
    }
    function apply() {
        if (!main) return;
        // Measure the page's own typography before applying one absolute scale.
        // This avoids multiplying sizes in nested lists, code and paragraphs.
        main.classList.remove('cb-reading-adjusted', 'cb-reading-wrap');
        const text = Array.from(main.querySelectorAll(textSelector)).filter(eligible);
        if (prefs.size) {
            const sizes = text.map(el => parseFloat(getComputedStyle(el).fontSize));
            text.forEach(function (el, i) {
                if (!Number.isFinite(sizes[i]) || sizes[i] <= 0) return;
                el.style.setProperty('--cb-reading-original', sizes[i] + 'px');
                el.setAttribute('data-cb-reading-text', '');
            });
            main.style.setProperty('--cb-reading-scale', String(scales[prefs.size]));
            main.classList.add('cb-reading-adjusted');
        }
        main.querySelectorAll('pre').forEach(function (pre) {
            if (eligible(pre)) pre.setAttribute('data-cb-reading-code', '');
        });
        main.classList.toggle('cb-reading-wrap', prefs.wrap);
        if (toolbar) {
            sizeLabel.textContent = Math.round(scales[prefs.size] * 100) + '%';
            less.disabled = prefs.size === 0;more.disabled = prefs.size === scales.length - 1;
            wrap.checked = prefs.wrap;
            note.textContent = storageWorks ? 'Display preferences are saved in this browser.' : 'Display preferences apply to this page.';
        }
    }
    function save() {
        try {
            if (prefs.size === 0 && !prefs.wrap) localStorage.removeItem(key);
            else localStorage.setItem(key, JSON.stringify(prefs));
            storageWorks = true;
        } catch (_) { storageWorks = false; }
        apply();
    }
    function queue() {
        if (frame) return;
        frame = requestAnimationFrame(function () {frame = 0;mount();if (prefs.size || prefs.wrap) apply();});
    }
    function mount() {
        if (!main || document.getElementById('cb-reading-tools')) return;
        toolbar = create('details', undefined, 'cb-reading-tools');
        toolbar.id = 'cb-reading-tools';
        const summary = create('summary', 'Reading options');
        const panel = create('div', undefined, 'cb-reading-tools-panel');
        const group = create('div', undefined, 'cb-reading-size');
        group.setAttribute('role', 'group');group.setAttribute('aria-label', 'Lesson text size');
        group.append(create('span', 'Text size'));
        less = create('button', 'A−');less.type = 'button';less.setAttribute('aria-label', 'Decrease lesson text size');
        sizeLabel = create('output');sizeLabel.setAttribute('aria-label', 'Current text size');sizeLabel.setAttribute('aria-live', 'polite');
        more = create('button', 'A+');more.type = 'button';more.setAttribute('aria-label', 'Increase lesson text size');
        group.append(less, sizeLabel, more);
        const label = create('label', undefined, 'cb-reading-wrap-option');
        wrap = create('input');wrap.type = 'checkbox';label.append(wrap, create('span', 'Wrap long code lines'));
        const reset = create('button', 'Reset');reset.type = 'button';reset.setAttribute('aria-label', 'Reset reading options');
        note = create('p', undefined, 'cb-reading-tools-note');
        panel.append(group, label, reset, note);toolbar.append(summary, panel);
        main.insertBefore(toolbar, main.firstChild);
        less.addEventListener('click', function () {prefs.size = Math.max(0, prefs.size - 1);save();});
        more.addEventListener('click', function () {prefs.size = Math.min(scales.length - 1, prefs.size + 1);save();});
        wrap.addEventListener('change', function () {prefs.wrap = wrap.checked;save();});
        reset.addEventListener('click', function () {prefs = {size: 0, wrap: false};save();});
        apply();
    }
    function init() {
        main = document.querySelector('main');if (!main) return;
        mount();
        observer = new MutationObserver(function (records) {
            // Ignore our own toolbar updates and live tracer/editor panels.
            if (records.some(function (r) {
                if (r.target === main) return true;
                return (prefs.size || prefs.wrap) && eligible(r.target) && Array.from(r.addedNodes).some(n => n.nodeType === 1);
            })) queue();
        });
        observer.observe(main, {childList: true, subtree: true});
        window.addEventListener('resize', queue);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {if (prefs.size) queue();});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});else init();
})();
