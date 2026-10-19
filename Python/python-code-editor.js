/* Shared Python practice editor. Lessons and the arena retain their own
   execution, scoring, storage, and reset logic. */
(function () {
    "use strict";

    const editors = new WeakMap();
    const pending = new WeakMap();
    const cdn = "https://cdn.jsdelivr.net/npm/codemirror@5.65.16/";
    let assets;

    const lastActivityKey = "codebhavya.python.practice.last-active";
    const idleLimitMs = 5 * 60 * 1000;
    let lastActivityWrite = 0;

    function isPracticeKey(key) {
        return key.startsWith("codebhavya.pythonpractice.") ||
            /^codebhavya\.python\.level\d+\.practice\.v\d+$/.test(key);
    }

    function clearPracticeStorage(storage) {
        try {
            for (let index = storage.length - 1; index >= 0; index--) {
                const key = storage.key(index);
                if (key && isPracticeKey(key)) storage.removeItem(key);
            }
        } catch {}
    }

    // Old saved practice work might belong to another user of this device.
    try { clearPracticeStorage(localStorage); } catch {}
    try {
        const last = Number(sessionStorage.getItem(lastActivityKey));
        if (!last || Date.now() - last >= idleLimitMs || last > Date.now())
            clearPracticeStorage(sessionStorage);
        sessionStorage.setItem(lastActivityKey, String(Date.now()));
    } catch {}

    function clearForNextStudent() {
        try { clearPracticeStorage(sessionStorage); } catch {}
        try { clearPracticeStorage(localStorage); } catch {}
        try { sessionStorage.setItem(lastActivityKey, String(Date.now())); } catch {}
        window.location.reload();
    }

    function checkIdle() {
        try {
            const last = Number(sessionStorage.getItem(lastActivityKey));
            if (last && (Date.now() - last >= idleLimitMs || last > Date.now())) {
                clearForNextStudent();
                return true;
            }
        } catch {}
        return false;
    }

    function markActivity() {
        if (checkIdle()) return;
        const now = Date.now();
        if (now - lastActivityWrite < 2000) return;
        lastActivityWrite = now;
        try { sessionStorage.setItem(lastActivityKey, String(now)); } catch {}
    }

    function addNewStudentControl() {
        if (!document.body) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cb-python-new-student";
        button.textContent = "New Student / Clear Practice";
        button.title = "Clear Python practice for the next student";
        button.setAttribute("aria-label", "Clear Python practice code and progress for the next student");
        button.addEventListener("click", () => {
            if (window.confirm("Clear all Python practice progress and code for the next student?"))
                clearForNextStudent();
        });
        document.body.appendChild(button);
        ["pointerdown", "keydown", "input", "scroll", "touchstart"].forEach(type =>
            window.addEventListener(type, markActivity, {passive: true})
        );
        window.addEventListener("pageshow", checkIdle);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) checkIdle();
        });
        window.setInterval(checkIdle, 10000);
    }

    if (document.body) addNewStudentControl();
    else document.addEventListener("DOMContentLoaded", addNewStudentControl, {once: true});

    function addScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = cdn + path;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function addStyle() {
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cdn + "lib/codemirror.min.css";
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    function ensureAssets() {
        if (!assets) {
            assets = (async () => {
                await addStyle();
                if (!window.CodeMirror)
                    await addScript("lib/codemirror.min.js");
                await addScript("mode/python/python.min.js");
                await addScript("addon/edit/matchbrackets.min.js");
                await addScript("addon/edit/closebrackets.min.js");
                return window.CodeMirror;
            })().catch(() => {
                // The original textarea works when editor assets are unavailable.
                assets = null;
                return null;
            });
        }
        return assets;
    }

    function workspaceFor(textarea) {
        return textarea.closest("[data-problem-workspace], .cb-c-practice-workspace");
    }

    function enhance(textarea) {
        if (!textarea) return Promise.resolve(null);
        const existing = editors.get(textarea);
        if (existing) {
            requestAnimationFrame(() => existing.refresh());
            return Promise.resolve(existing);
        }
        if (pending.has(textarea)) return pending.get(textarea);

        const job = ensureAssets().then(CodeMirror => {
            const workspace = workspaceFor(textarea);
            if (!CodeMirror || !textarea.isConnected || workspace?.hidden)
                return null;

            const editor = CodeMirror.fromTextArea(textarea, {
                mode: "python",
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                indentUnit: 4,
                tabSize: 4,
                indentWithTabs: false,
                lineWrapping: false,
                inputStyle: "textarea"
            });
            textarea.dataset.cbPythonEditorEnhanced = "true";
            editor.getInputField().setAttribute(
                "aria-label",
                textarea.getAttribute("aria-label") || "Python code editor"
            );
            editor.on("change", () => {
                editor.save();
                // Existing lesson progress listeners observe normal input events.
                textarea.dispatchEvent(new Event("input", {bubbles: true}));
            });
            editors.set(textarea, editor);
            requestAnimationFrame(() => editor.refresh());
            return editor;
        }).finally(() => pending.delete(textarea));

        pending.set(textarea, job);
        return job;
    }

    function setValue(textarea, code) {
        if (!textarea) return;
        const editor = editors.get(textarea);
        if (editor) {
            editor.setValue(code);
            editor.save();
        } else {
            textarea.value = code;
        }
    }

    function getValue(textarea) {
        return editors.get(textarea)?.getValue() ?? textarea?.value ?? "";
    }

    document.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        const lessonCard = button.closest("[data-python-problem]");
        const arenaWorkspace = button.closest(".cb-challenge-card, .cb-c-practice-workspace");

        if (button.matches('[data-problem-action="toggle"]')) {
            const textarea = lessonCard?.querySelector("textarea[data-problem-code]");
            if (textarea) window.setTimeout(() => enhance(textarea), 0);
        } else if (button.matches(".cb-practice-start-button")) {
            const textarea = arenaWorkspace?.querySelector("textarea.cb-c-code-editor");
            if (textarea) window.setTimeout(() => enhance(textarea), 0);
        } else if (button.matches('[data-problem-action="reset"], .cb-c-reset-btn')) {
            const textarea = lessonCard?.querySelector("textarea[data-problem-code]") ||
                arenaWorkspace?.querySelector("textarea.cb-c-code-editor");
            if (textarea) {
                // Existing reset handlers have updated the original textarea.
                // Copy that starter program into the visible CodeMirror instance.
                queueMicrotask(() => {
                    if (editors.has(textarea) && getValue(textarea) !== textarea.value)
                        setValue(textarea, textarea.value);
                });
            }
        }
    });

    window.CodeBhavyaPythonEditor = {enhance, getValue, setValue};
})();
