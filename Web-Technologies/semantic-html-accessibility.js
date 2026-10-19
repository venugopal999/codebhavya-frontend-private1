"use strict";
const wt10TeachingScenarios = {
  "good": {
    "markup": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><base href=\"about:srcdoc\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Workshop practice preview</title><style>body{font:18px/1.7 Arial,sans-serif;padding:18px;margin:0;color:#173451;background:#fff}header,main,footer{border:1px solid #bdd5e6;border-radius:10px;padding:14px;margin:14px 0}h1{font-size:26px}h2,h3{font-size:22px}a{color:#075a83}input{display:block;padding:10px;font:inherit;max-width:90%;border:1px solid #66839a;border-radius:6px}summary,.fake-button{cursor:pointer;padding:10px 14px;background:#e8f3fb;border:1px solid #9fc6df;border-radius:8px;margin:14px 0}:focus-visible{outline:3px solid #126d96;outline-offset:3px}</style></head><body><a href=\"#main-content\">Skip to main content</a>\n<header><p>CodeBhavya Workshop</p><nav aria-label=\"Workshop\"><a href=\"#preparation\">Preparation</a></nav></header>\n<main id=\"main-content\" tabindex=\"-1\">\n<h1>Semantic HTML Workshop</h1>\n<section id=\"preparation\"><h2>Preparation</h2><p>Bring a code editor and your HTML notes.</p></section>\n<section><h2>Practice</h2><label for=\"learner\">Learner name</label><input id=\"learner\" name=\"student\" placeholder=\"Fictional name\">\n<details><summary>Show task hint</summary><p>Find the page landmarks and heading hierarchy.</p></details></section>\n</main>\n<footer><p>Workshop learning example.</p></footer></body></html>",
    "findings": [
      "CHECK: one main region surrounds the page-specific content.",
      "CHECK: h1 is followed by h2 topic headings.",
      "CHECK: the Learner name label matches the input id.",
      "CHECK: native links and the disclosure summary provide keyboard entry points.",
      "MANUAL: test the skip target, focus indicator, disclosure and reading order; these checks do not certify the entire page."
    ]
  },
  "headings": {
    "markup": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><base href=\"about:srcdoc\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Workshop practice preview</title><style>body{font:18px/1.7 Arial,sans-serif;padding:18px;margin:0;color:#173451;background:#fff}header,main,footer{border:1px solid #bdd5e6;border-radius:10px;padding:14px;margin:14px 0}h1{font-size:26px}h2,h3{font-size:22px}a{color:#075a83}input{display:block;padding:10px;font:inherit;max-width:90%;border:1px solid #66839a;border-radius:6px}summary,.fake-button{cursor:pointer;padding:10px 14px;background:#e8f3fb;border:1px solid #9fc6df;border-radius:8px;margin:14px 0}:focus-visible{outline:3px solid #126d96;outline-offset:3px}</style></head><body><a href=\"#main-content\">Skip to main content</a>\n<header><p>CodeBhavya Workshop</p><nav aria-label=\"Workshop\"><a href=\"#preparation\">Preparation</a></nav></header>\n<main id=\"main-content\" tabindex=\"-1\">\n<h1>Semantic HTML Workshop</h1>\n<section id=\"preparation\"><h3>Preparation</h3><p>Bring a code editor and your HTML notes.</p></section>\n<section><h2>Practice</h2><label for=\"learner\">Learner name</label><input id=\"learner\" name=\"student\" placeholder=\"Fictional name\">\n<details><summary>Show task hint</summary><p>Find the page landmarks and heading hierarchy.</p></details></section>\n</main>\n<footer><p>Workshop learning example.</p></footer></body></html>",
    "findings": [
      "REPAIR: Preparation uses h3 directly under h1. It is a major topic and should be h2 in this example.",
      "CHECK: the main region and label association remain present.",
      "MANUAL: inspect the outline; visual size alone does not reveal the hierarchy."
    ]
  },
  "label": {
    "markup": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><base href=\"about:srcdoc\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Workshop practice preview</title><style>body{font:18px/1.7 Arial,sans-serif;padding:18px;margin:0;color:#173451;background:#fff}header,main,footer{border:1px solid #bdd5e6;border-radius:10px;padding:14px;margin:14px 0}h1{font-size:26px}h2,h3{font-size:22px}a{color:#075a83}input{display:block;padding:10px;font:inherit;max-width:90%;border:1px solid #66839a;border-radius:6px}summary,.fake-button{cursor:pointer;padding:10px 14px;background:#e8f3fb;border:1px solid #9fc6df;border-radius:8px;margin:14px 0}:focus-visible{outline:3px solid #126d96;outline-offset:3px}</style></head><body><a href=\"#main-content\">Skip to main content</a>\n<header><p>CodeBhavya Workshop</p><nav aria-label=\"Workshop\"><a href=\"#preparation\">Preparation</a></nav></header>\n<main id=\"main-content\" tabindex=\"-1\">\n<h1>Semantic HTML Workshop</h1>\n<section id=\"preparation\"><h2>Preparation</h2><p>Bring a code editor and your HTML notes.</p></section>\n<section><h2>Practice</h2><input id=\"learner\" name=\"student\" placeholder=\"Fictional name\">\n<details><summary>Show task hint</summary><p>Find the page landmarks and heading hierarchy.</p></details></section>\n</main>\n<footer><p>Workshop learning example.</p></footer></body></html>",
    "findings": [
      "REPAIR: the input has a placeholder but no persistent associated visible label. Restore label for=\"learner\".",
      "CHECK: the heading hierarchy and main region remain present.",
      "MANUAL: enter a value and observe that the placeholder disappears; inspect the input name in browser accessibility tools."
    ]
  },
  "button": {
    "markup": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><base href=\"about:srcdoc\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Workshop practice preview</title><style>body{font:18px/1.7 Arial,sans-serif;padding:18px;margin:0;color:#173451;background:#fff}header,main,footer{border:1px solid #bdd5e6;border-radius:10px;padding:14px;margin:14px 0}h1{font-size:26px}h2,h3{font-size:22px}a{color:#075a83}input{display:block;padding:10px;font:inherit;max-width:90%;border:1px solid #66839a;border-radius:6px}summary,.fake-button{cursor:pointer;padding:10px 14px;background:#e8f3fb;border:1px solid #9fc6df;border-radius:8px;margin:14px 0}:focus-visible{outline:3px solid #126d96;outline-offset:3px}</style></head><body><a href=\"#main-content\">Skip to main content</a>\n<header><p>CodeBhavya Workshop</p><nav aria-label=\"Workshop\"><a href=\"#preparation\">Preparation</a></nav></header>\n<main id=\"main-content\" tabindex=\"-1\">\n<h1>Semantic HTML Workshop</h1>\n<section id=\"preparation\"><h2>Preparation</h2><p>Bring a code editor and your HTML notes.</p></section>\n<section><h2>Practice</h2><label for=\"learner\">Learner name</label><input id=\"learner\" name=\"student\" placeholder=\"Fictional name\">\n<div class=\"fake-button\">Show task hint</div></section>\n</main>\n<footer><p>Workshop learning example.</p></footer></body></html>",
    "findings": [
      "REPAIR: the styled div has neither native disclosure behavior nor ordinary keyboard focus. Restore the native details/summary example.",
      "CHECK: the page regions and label association remain present.",
      "MANUAL: Tab through the preview. The div is skipped and does not reveal a hint. Styling alone has not supplied an action."
    ]
  }
};
function wt10GetScenario(name) {
    return Object.prototype.hasOwnProperty.call(wt10TeachingScenarios, name)
        ? wt10TeachingScenarios[name] : wt10TeachingScenarios.good;
}
document.addEventListener("DOMContentLoaded", () => {
    const choice = document.getElementById("wt10Scenario");
    const preview = document.getElementById("wt10Preview");
    const markup = document.getElementById("wt10Markup");
    const findings = document.getElementById("wt10Findings");
    const status = document.getElementById("wt10LabStatus");
    const showScenario = announce => {
        const scenario = wt10GetScenario(choice.value);
        // Only fixed teaching markup is rendered. No user-supplied HTML is accepted.
        preview.srcdoc = scenario.markup;
        markup.textContent = scenario.markup;
        findings.replaceChildren();
        scenario.findings.forEach(text => {
            const item = document.createElement("li");
            item.textContent = text;
            findings.append(item);
        });
        if (announce) status.textContent = "Scenario updated. Read the teaching checks and test the preview with your keyboard.";
    };
    document.getElementById("wt10Inspect").addEventListener("click", () => showScenario(true));
    choice.addEventListener("change", () => showScenario(true));
    document.getElementById("wt10Reset").addEventListener("click", () => {
        choice.value = "good";
        showScenario(false);
        status.textContent = "Lab reset to the semantic workshop page.";
    });
    showScenario(false);
    const skip = document.querySelector('.wt10-skip-link');
    if (skip) skip.addEventListener('click', () => {
        const main = document.getElementById('wt10Main');
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
    document.getElementById("wt10QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-10-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 10 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 10 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
