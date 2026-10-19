"use strict";
function wt13BuildPreview(layout, width, content) {
    const layouts = ['flex-wrap','flex-nowrap','grid-fixed','grid-responsive'];
    layout = layouts.includes(layout) ? layout : 'grid-responsive';
    width = [240,420,640].includes(Number(width)) ? Number(width) : 640;
    content = content === 'long' ? 'long' : 'normal';
    let rules, explanation;
    if (layout === 'flex-wrap') {
        rules = '.cards { display: flex; flex-wrap: wrap; gap: 12px; }\n.card { flex: 1 1 140px; min-width: 0; }';
        explanation = 'Wrapping Flexbox: items move onto new lines as space runs out. Each line distributes its remaining space independently.';
    } else if (layout === 'flex-nowrap') {
        rules = '.cards { display: flex; flex-wrap: nowrap; gap: 12px; overflow-x: auto; }\n.card { flex: 0 0 140px; min-width: 0; }';
        explanation = 'Non-wrapping comparison: six fixed-width cards stay in one row. Scroll inside the card region to reach the remaining cards; shrinking is deliberately disabled.';
    } else if (layout === 'grid-fixed') {
        rules = '.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }';
        explanation = 'Fixed three-column Grid: all three tracks remain even at 240px. Long content can become crowded; the column count does not adapt.';
    } else {
        rules = '.cards { display: grid; grid-template-columns: 1fr; gap: 12px; }\n@media (min-width: 341px) {\n  .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}\n@media (min-width: 521px) {\n  .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n}';
        const count = width >= 521 ? 3 : width >= 341 ? 2 : 1;
        explanation = 'Expected for this fixed example: '+count+' column'+(count === 1 ? '' : 's')+' at a '+width+'px iframe viewport. The media queries use the iframe width, not the surrounding browser width.';
    }
    const titles = ['HTML structure','CSS selectors','Box model','Flexbox rows','Grid tracks','Responsive review'];
    const cards = titles.map((title,index) => '<article class="card"><h2>'+ (index+1) +'. '+title+'</h2><p>'+ (content === 'long' ? 'Explain the layout in your own words, then check a longer resource name: <span class="token">CodeBhavyaResponsiveLayoutWorkshopResource</span>.' : 'Read the example and practise one change.') +'</p><details><summary>Review '+(index+1)+'</summary><p>Keep reading and keyboard order consistent with the HTML source.</p></details></article>').join('');
    const markup = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><base href="about:srcdoc"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Responsive layout preview</title><style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#fff;color:#173451;font:18px/1.6 Arial,sans-serif}h1{font-size:22px;margin:0 0 16px}.card{min-width:0;padding:12px;border:1px solid #a9c5da;border-radius:10px;background:#edf6fc;overflow-wrap:anywhere}.card h2{font-size:18px;line-height:1.4;margin:0 0 10px}.card p{margin:0 0 12px}summary{cursor:pointer;color:#12556f;font-weight:bold}summary:focus-visible,.cards:focus-visible{outline:3px solid #126d96;outline-offset:2px}.token{overflow-wrap:anywhere}'+rules+'</style></head><body><h1>Six learning cards</h1><div class="cards" tabindex="0" aria-label="Learning cards; horizontally scrollable in the non-wrapping comparison">'+cards+'</div></body></html>';
    return {layout,width,content,rules,explanation,markup};
}
document.addEventListener('DOMContentLoaded', () => {
    const controls = {};
    for (const name of ['Layout','Width','Content']) controls[name.toLowerCase()] = document.getElementById('wt13'+name);
    const status = document.getElementById('wt13Status');
    const show = announce => {
        const preview = wt13BuildPreview(controls.layout.value,controls.width.value,controls.content.value);
        const frame = document.getElementById('wt13Preview');
        frame.style.width = preview.width+'px';
        frame.srcdoc = preview.markup;
        document.getElementById('wt13Rules').textContent = preview.rules;
        document.getElementById('wt13Expected').textContent = preview.explanation;
        if (announce) status.textContent = 'Preview updated: '+preview.layout+', '+preview.width+'px viewport, '+preview.content+' content.';
    };
    Object.values(controls).forEach(control => control.addEventListener('change', () => show(true)));
    document.getElementById('wt13Apply').addEventListener('click', () => show(true));
    document.getElementById('wt13Reset').addEventListener('click', () => {
        controls.layout.value = 'grid-responsive';
        controls.width.value = '640';
        controls.content.value = 'normal';
        show(true);
        status.textContent = 'Lab reset: responsive Grid, 640px viewport and normal content.';
    });
    show(false);
    const skip = document.querySelector('.wt13-skip-link');
    if (skip) skip.addEventListener('click', () => {
        const main = document.getElementById('wt13Main');
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
    document.getElementById("wt13QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-13-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 13 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 13 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
