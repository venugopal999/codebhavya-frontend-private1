"use strict";
const wt11Cases = {
  "order": {
    "css": ".note { color: #663399; }\n.note { color: #075a83; }",
    "explanation": "Expected: blue (#075a83). Both rules are normal author rules in the same layer with equal specificity, so the later rule wins.",
    "winner": "#075a83"
  },
  "specificity": {
    "css": "#lesson-note { color: #663399; }\n.note { color: #075a83; }",
    "explanation": "Expected: purple (#663399). The matching normal ID selector is more specific than the later class selector in this same-layer author example.",
    "winner": "#663399"
  },
  "inherit": {
    "css": ".parent { color: #176343; }\n.note { margin: 0; }",
    "explanation": "Expected: green (#176343), inherited from the parent. The paragraph has no own color declaration; its margin rule does not set color.",
    "winner": "#176343"
  },
  "important": {
    "css": ".note { color: #755000 !important; }\n#lesson-note { color: #663399; }",
    "explanation": "Expected: dark gold (#755000). The important class declaration wins over the normal ID declaration here; importance is not a specificity bonus.",
    "winner": "#755000"
  }
};
function wt11BuildExample(name, requestedSize) {
    const selected = Object.prototype.hasOwnProperty.call(wt11Cases, name) ? wt11Cases[name] : wt11Cases.order;
    const parsed = Number(requestedSize);
    const size = [18,22,26].includes(parsed) ? parsed : 18;
    const base = 'body { margin: 0; padding: 24px; background: #ffffff; font-family: Arial,sans-serif; line-height: 1.7; } h1 { color: #173451; font-size: 24px; } .parent { padding: 20px; border: 1px solid #bdd5e6; border-radius: 12px; } .note { font-size: ' + size + 'px; }';
    const rules = selected.css;
    const markup = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><base href="about:srcdoc"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CSS conflict preview</title><style>' + base + '\n' + rules + '</style></head><body><h1>Workshop notice</h1><div class="parent"><p id="lesson-note" class="note">Bring your HTML notes and a code editor.</p></div></body></html>';
    return {markup, rules, explanation:selected.explanation, size};
}
document.addEventListener('DOMContentLoaded', () => {
    const choice = document.getElementById('wt11Case');
    const size = document.getElementById('wt11Size');
    const status = document.getElementById('wt11Status');
    const show = announce => {
        const example = wt11BuildExample(choice.value, size.value);
        // Render only fixed CSS examples and a whitelisted numeric font size.
        document.getElementById('wt11Preview').srcdoc = example.markup;
        document.getElementById('wt11Rules').textContent = example.rules;
        document.getElementById('wt11Expected').textContent = example.explanation;
        if (announce) status.textContent = 'Example applied at ' + example.size + 'px. Compare the preview with the expected result.';
    };
    document.getElementById('wt11Inspect').addEventListener('click', () => show(true));
    choice.addEventListener('change', () => show(true));
    size.addEventListener('change', () => show(true));
    document.getElementById('wt11Reset').addEventListener('click', () => {
        choice.value = 'order';size.value = '18';show(false);
        status.textContent = 'Lab reset to the equal-specificity example at 18px.';
    });
    show(false);
    const skip = document.querySelector('.wt11-skip-link');
    if (skip) skip.addEventListener('click', () => {
        const main = document.getElementById('wt11Main');
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
    document.getElementById("wt11QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-11-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 11 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 11 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
