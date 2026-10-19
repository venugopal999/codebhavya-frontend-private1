"use strict";

// This lesson inspects form values locally; it makes no submission request.
function wt9DescribeSubmission(entries, method) {
    const pairs = Array.from(entries, ([name, value]) => [String(name), String(value)]);
    const encoded = new URLSearchParams(pairs).toString();
    const listing = pairs.map(([name, value]) => name + " = " + value).join("\n");
    const request = method === "get"
        ? "GET /workshop-register?" + encoded + "\nBody: no form body"
        : "POST /workshop-register\nContent-Type: application/x-www-form-urlencoded\nBody: " + encoded;
    return "Named fields:\n" + listing + "\n\nIllustrative request (not sent):\n" + request
        + "\n\nDisabled internalNote is omitted. Unchecked updates is omitted. Readonly course is included.";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("wt9Form");
    // Keep the lab local even if another initialization step fails.
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const output = document.getElementById("wt9Payload");
            const method = document.getElementById("wt9Method").value;
            output.textContent = wt9DescribeSubmission(new FormData(form).entries(), method);
        });
        form.addEventListener("reset", () => {
            document.getElementById("wt9Payload").textContent = "Defaults restored. Inspect again to see the new payload.";
        });
        document.getElementById("wt9Inspect").disabled = false;
    }
    if (typeof window.loadCommonComponents === "function") {
        window.loadCommonComponents();
    }
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
    document.getElementById("wt9QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-09-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 09 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 09 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
