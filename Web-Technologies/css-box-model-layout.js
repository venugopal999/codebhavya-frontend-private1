"use strict";
function wt12CalculateBox(values) {
    const pick = (value, allowed, fallback) => allowed.includes(Number(value)) ? Number(value) : fallback;
    const mode = values.mode === 'border-box' ? 'border-box' : 'content-box';
    const width = pick(values.width, [160,200,240], 200);
    const padding = pick(values.padding, [0,10,20], 20);
    const border = pick(values.border, [0,2,4], 4);
    const margin = pick(values.margin, [0,10,20], 10);
    const contentWidth = mode === 'content-box' ? width : width - 2 * padding - 2 * border;
    const borderBoxWidth = mode === 'content-box' ? width + 2 * padding + 2 * border : width;
    return {mode,width,padding,border,margin,contentWidth,borderBoxWidth,totalWidth:borderBoxWidth + 2 * margin};
}
function wt12BuildPreview(values) {
    const box = wt12CalculateBox(values);
    const rules = '.sample {\n  box-sizing: ' + box.mode + ';\n  width: ' + box.width + 'px;\n  padding: ' + box.padding + 'px;\n  border: ' + box.border + 'px solid #173451;\n  margin: ' + box.margin + 'px;\n}';
    const markup = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><base href="about:srcdoc"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Box model preview</title><style>body {margin:0;padding:14px;background:#fff;color:#173451;font:18px/1.6 Arial,sans-serif}h1{font-size:22px;margin:0 0 12px}.canvas{overflow:auto;padding:16px;background:#f3f8fd;border:1px solid #bdd5e6;border-radius:10px}.canvas:focus-visible{outline:3px solid #126d96;outline-offset:2px}.margin-zone{display:inline-block;background:#fff5d9;outline:1px dashed #93630e}.sample{background:#d8f4f5}.content{background:#dceafb;min-height:80px;overflow-wrap:anywhere}p{margin:0}'+rules+'</style></head><body><h1>Workshop card</h1><div class="canvas" tabindex="0" aria-label="Scrollable box example"><div class="margin-zone"><div class="sample"><div class="content"><p>Content area: workshop notes.</p></div></div></div></div><p>Blue: content · cyan: padding · dark line: border · pale outer guide: margin.</p></body></html>';
    return {markup,rules};
}
document.addEventListener('DOMContentLoaded', () => {
    const controls = {};
    for (const name of ['Mode','Width','Padding','Border','Margin']) controls[name.toLowerCase()] = document.getElementById('wt12'+name);
    const status = document.getElementById('wt12Status');
    const show = announce => {
        const values = {};
        for (const name of Object.keys(controls)) values[name] = controls[name].value;
        const box = wt12CalculateBox(values);
        const preview = wt12BuildPreview(box);
        document.getElementById('wt12Preview').srcdoc = preview.markup;
        document.getElementById('wt12Rules').textContent = preview.rules;
        document.getElementById('wt12Metrics').textContent = 'Mode: '+box.mode+'\nDeclared width: '+box.width+'px\nContent width: '+box.contentWidth+'px\nBorder-box width: '+box.borderBoxWidth+'px\nBorder box + horizontal margins: '+box.totalWidth+'px\n\nFixed block-box example; no min/max constraints or layout shrinking.';
        if (announce) status.textContent = 'Box updated. Content '+box.contentWidth+'px, border box '+box.borderBoxWidth+'px, including horizontal margins '+box.totalWidth+'px.';
    };
    Object.values(controls).forEach(control => control.addEventListener('change', () => show(true)));
    document.getElementById('wt12Apply').addEventListener('click', () => show(true));
    document.getElementById('wt12Reset').addEventListener('click', () => {
        const defaults = {mode:'content-box',width:'200',padding:'20',border:'4',margin:'10'};
        for (const name of Object.keys(controls)) controls[name].value = defaults[name];
        show(true);
        status.textContent = 'Lab reset: 200px content, 248px border box and 268px including horizontal margins.';
    });
    show(false);
    const skip = document.querySelector('.wt12-skip-link');
    if (skip) skip.addEventListener('click', () => {
        const main = document.getElementById('wt12Main');
        if (main) main.focus({preventScroll:true});
    });
    const progress = document.getElementById("readingProgress");
    const updateProgress = () => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.width = (height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0) + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, {passive: true});
    window.addEventListener("resize", updateProgress, {passive: true});

    const questions = document.querySelectorAll(".wt8-mcq");
    questions.forEach(question => {
        const correct = Number(question.dataset.answer);
        const options = question.querySelectorAll(".wt8-option");
        const feedback = question.querySelector(".wt8-feedback");
        options.forEach((option, index) => {
            option.addEventListener("click", () => {
                options[correct].classList.add("correct");
                if (index !== correct) option.classList.add("wrong");
                feedback.textContent = (index === correct ? "✓ Correct. " : "Not quite. ") + question.dataset.explanation;
                options.forEach(item => { item.disabled = true; });
            });
        });
    });
    document.getElementById("wt12QuizReset").addEventListener("click", () => {
        questions.forEach(question => {
            question.querySelectorAll(".wt8-option").forEach(option => {
                option.disabled = false;
                option.classList.remove("correct", "wrong");
            });
            question.querySelector(".wt8-feedback").textContent = "";
        });
    });

    const completion = document.getElementById("completeLesson");
    const message = document.getElementById("completionMessage");
    const key = "codebhavya-wt-level-12-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 12 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 12 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
