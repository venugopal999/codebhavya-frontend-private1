"use strict";
function wt14ReadSeatCount(text) {
    const trimmed = text.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const value = Number(trimmed);
    if (!Number.isSafeInteger(value) || value > 1000) return null;
    return value;
}
function wt14RunExample(mode, a, b) {
    const modes = ['concat','add','strict','loose','truthy','seats'];
    mode = modes.includes(mode) ? mode : 'seats';
    a = String(a);
    b = String(b);
    const prefix = 'const A = '+JSON.stringify(a)+';\nconst B = '+JSON.stringify(b)+';\n';
    const fail = (code, explanation) => ({ok:false,mode,code:prefix+code,result:'Input rejected',type:'No accepted result',explanation});
    if (a.length > 64 || b.length > 64) return fail('// Keep each input to 64 characters or fewer.','Each input is limited to 64 characters in this teaching lab. Shorten the text and run again.');
    let value, code, explanation;
    if (mode === 'concat') {
        value = a + b;
        code = 'const result = A + B;';
        explanation = 'A and B are strings. The + operation concatenates their text; it does not add their numeric-looking contents.';
    } else if (mode === 'add') {
        const left = Number(a), right = Number(b);
        code = 'const left = Number(A);\nconst right = Number(B);\n// Require finite operands and a finite sum.\nconst result = left + right;';
        if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(left + right)) return fail(code,'At least one converted operand, or the resulting sum, is not finite. Numeric addition in this lab requires finite Number values.');
        value = left + right;
        explanation = 'Explicit conversion creates Number operands before addition. Number of blank or whitespace-only text is zero; this experiment allows that conversion, while the seat policy rejects blank input.';
    } else if (mode === 'strict') {
        value = a === Number(b);
        code = 'const result = A === Number(B);';
        explanation = 'A remains a string and Number(B) is a Number value. Strict equality does not coerce different types to match, so this comparison is false.';
    } else if (mode === 'loose') {
        value = a == Number(b); // Deliberate teaching example of coercion.
        code = 'const result = A == Number(B);';
        explanation = 'This deliberate loose comparison applies coercion rules. String A is compared with the converted Number(B). Malformed numeric text can produce NaN, which does not compare equal.';
    } else if (mode === 'truthy') {
        value = Boolean(a);
        code = 'const result = Boolean(A); // B is unused in this example.';
        explanation = 'An empty string is falsy. An ordinary non-empty string, including "0", "false" or whitespace, is truthy. B is unused.';
    } else {
        const capacity = wt14ReadSeatCount(a), reserved = wt14ReadSeatCount(b);
        code = 'const capacity = readSeatCount(A);\nconst reserved = readSeatCount(B);\n// readSeatCount is the helper in Section 11.\n// Reject null results and reserved > capacity.\nconst result = capacity - reserved;';
        if (capacity === null || reserved === null) return fail(code,'Enter decimal digits for both counts, with values from 0 through 1000. Leading/trailing whitespace is trimmed. Blank, negative, fractional, exponential and malformed entries are rejected. Zero is valid.');
        if (reserved > capacity) return fail(code,'Reserved seats must not exceed capacity. Correct the relationship before reporting availability.');
        value = capacity - reserved;
        explanation = value === 0 ? 'Workshop full. The remaining count is a valid zero; it must not be treated as missing input.' : value+' seats available. Both counts passed the integer/range checks and reserved did not exceed capacity.';
    }
    return {ok:true,mode,code:prefix+code,result:typeof value === 'string' ? JSON.stringify(value) : String(value),type:typeof value,explanation};
}
document.addEventListener('DOMContentLoaded', () => {
    const mode = document.getElementById('wt14Mode');
    const a = document.getElementById('wt14A');
    const b = document.getElementById('wt14B');
    const status = document.getElementById('wt14Status');
    const show = announce => {
        const example = wt14RunExample(mode.value,a.value,b.value);
        document.getElementById('wt14Code').textContent = example.code;
        document.getElementById('wt14Result').textContent = 'Result: '+example.result+'\nType: '+example.type;
        document.getElementById('wt14Explanation').textContent = example.explanation;
        if (announce) status.textContent = example.ok ? 'Example complete. Result '+example.result+', type '+example.type+'.' : 'Input rejected. '+example.explanation;
    };
    mode.addEventListener('change', () => show(true));
    document.getElementById('wt14Run').addEventListener('click', () => show(true));
    for (const input of [a,b]) input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); show(true); }
    });
    document.getElementById('wt14Reset').addEventListener('click', () => {
        mode.value = 'seats'; a.value = '30'; b.value = '12';
        show(false); status.textContent = 'Lab reset: 30 capacity, 12 reserved and 18 available seats.';
    });
    show(false);
    const skip = document.querySelector('.wt14-skip-link');
    if (skip) skip.addEventListener('click', () => {
        const main = document.getElementById('wt14Main');
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
    document.getElementById("wt14QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-14-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 14 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 14 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
