"use strict";

/*
 * ================================================================
 * CodeBhavya — Web Technologies
 * Level 08 — HTML Text, Links and Media
 * ================================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    loadCommonComponents();

    setupReadingProgress();

    setupFlipCards();

    setupMCQs();

    setupPathExplorer();

    setupURLVisualizer();

    setupMediaBuilder();

    setupCompletion();

});


/* ================================================================
   COMMON COMPONENTS
   ================================================================ */

async function loadCommonComponents() {

    try {

        if (typeof window.loadCommonComponents === "function") {
            window.loadCommonComponents();
            return;
        }

        const headerHost =
            document.getElementById("site-header");

        const footerHost =
            document.getElementById("site-footer");

        if (headerHost) {

            const response =
                await fetch("header.html");

            if (response.ok) {
                headerHost.innerHTML =
                    await response.text();
            }

        }

        if (footerHost) {

            const response =
                await fetch("footer.html");

            if (response.ok) {
                footerHost.innerHTML =
                    await response.text();
            }

        }

    } catch (error) {

        console.warn(
            "CodeBhavya common components could not be loaded:",
            error
        );

    }

}


/* ================================================================
   READING PROGRESS
   ================================================================ */

function setupReadingProgress() {

    const progress =
        document.getElementById("readingProgress");

    if (!progress) return;

    const update = () => {

        const scrollTop =
            window.scrollY || window.pageYOffset;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (documentHeight <= 0) {

            progress.style.width = "0%";
            return;

        }

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (scrollTop / documentHeight) * 100
                )
            );

        progress.style.width =
            percentage + "%";

    };

    update();

    window.addEventListener(
        "scroll",
        update,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        update,
        { passive: true }
    );

}


/* ================================================================
   FLIP CARDS
   ================================================================ */

function setupFlipCards() {

    const cards =
        document.querySelectorAll(
            ".wt8-flip-card, .wt8-glossary-card"
        );

    cards.forEach(card => {

        const toggle = () => {

            const flipped =
                card.classList.toggle("is-flipped");

            card.setAttribute(
                "aria-pressed",
                String(flipped)
            );

        };

        card.addEventListener(
            "click",
            toggle
        );

        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    toggle();

                }

            }
        );

    });

}


/* ================================================================
   MCQ SYSTEM
   ================================================================ */

function setupMCQs() {

    const questions =
        document.querySelectorAll(".wt8-mcq");

    questions.forEach(question => {

        const correctIndex =
            Number(
                question.dataset.answer
            );

        const options =
            question.querySelectorAll(
                ".wt8-option"
            );

        const feedback =
            question.querySelector(
                ".wt8-feedback"
            );

        options.forEach(
            (option, index) => {

                option.addEventListener(
                    "click",
                    () => {

                        options.forEach(
                            item => {

                                item.classList.remove(
                                    "correct",
                                    "wrong"
                                );

                                item.disabled =
                                    false;

                            }
                        );

                        if (
                            index ===
                            correctIndex
                        ) {

                            option.classList.add(
                                "correct"
                            );

                            if (feedback) {

                                feedback.textContent =
                                    "✓ Correct! Good job.";

                                feedback.style.color =
                                    "#67c596";

                            }

                        } else {

                            option.classList.add(
                                "wrong"
                            );

                            options[
                                correctIndex
                            ].classList.add(
                                "correct"
                            );

                            if (feedback) {

                                feedback.textContent =
                                    "✗ Not quite. The highlighted option is correct.";

                                feedback.style.color =
                                    "#e8786d";

                            }

                        }

                        options.forEach(
                            item => {
                                item.disabled = true;
                            }
                        );

                    }
                );

            }
        );

    });

}


/* ================================================================
   PATH EXPLORER
   ================================================================ */

function setupPathExplorer() {

    const buttons =
        document.querySelectorAll(
            ".wt8-path-btn"
        );

    const result =
        document.getElementById(
            "wt8PathResult"
        );

    if (!buttons.length || !result) {
        return;
    }

    const explanations = {

        "about.html":
            "Current directory → about.html",

        "pages/about.html":
            "Current directory → pages folder → about.html",

        "../index.html":
            "Move to parent directory → index.html",

        "/index.html":
            "Website root → index.html",

        "https://example.com":
            "Complete absolute URL → external website"

    };

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );

                const path =
                    button.dataset.path;

                result.innerHTML = `
                    <code>${escapeHTML(path)}</code>
                    <br>
                    ${escapeHTML(
                        explanations[path] || ""
                    )}
                `;

            }
        );

    });

}


/* ================================================================
   URL VISUALIZER
   ================================================================ */

function setupURLVisualizer() {

    const parts =
        document.querySelectorAll(
            ".wt8-url-part"
        );

    const explanation =
        document.getElementById(
            "wt8UrlExplanation"
        );

    if (!parts.length || !explanation) {
        return;
    }

    const messages = [

        {
            title: "Protocol",
            text:
                "https:// identifies the communication protocol."
        },

        {
            title: "Domain",
            text:
                "codebhavya.com identifies the website/domain being requested."
        },

        {
            title: "Path",
            text:
                "/Web-Technologies/html-fundamentals.html identifies the resource path."
        },

        {
            title: "Query",
            text:
                "?mode=learn contains optional query parameters sent as part of the URL."
        },

        {
            title: "Fragment",
            text:
                "#html identifies a location within the current resource."
        }

    ];

    parts.forEach(
        (part, index) => {

            part.style.cursor =
                "pointer";

            part.addEventListener(
                "click",
                () => {

                    const item =
                        messages[index];

                    if (!item) return;

                    explanation.innerHTML = `
                        <strong>${item.title}:</strong>
                        ${item.text}
                    `;

                }
            );

        }
    );

}


/* ================================================================
   MEDIA BUILDER
   ================================================================ */

function setupMediaBuilder() {

    const type =
        document.getElementById(
            "wt8MediaType"
        );

    const source =
        document.getElementById(
            "wt8MediaSource"
        );

    const alt =
        document.getElementById(
            "wt8MediaAlt"
        );

    const build =
        document.getElementById(
            "wt8BuildMedia"
        );

    const reset =
        document.getElementById(
            "wt8ResetMedia"
        );

    const code =
        document.getElementById(
            "wt8GeneratedCode"
        );

    const preview =
        document.getElementById(
            "wt8MediaPreview"
        );

    if (
        !type ||
        !source ||
        !alt ||
        !build ||
        !reset ||
        !code ||
        !preview
    ) {
        return;
    }


    function buildMedia() {

        const mediaType =
            type.value;

        const mediaSource =
            source.value.trim();

        const description =
            alt.value.trim() ||
            "Learning media";


        let generated = "";
        let previewHTML = "";


        if (mediaType === "image") {

            generated =
`<img
    src="${mediaSource}"
    alt="${description}"
    width="500"
>`;

            /*
             * Use a data-generated visual placeholder
             * instead of requesting an external image.
             */

            previewHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    border:1px dashed rgba(101,203,210,.35);
                    border-radius:12px;
                ">
                    🖼️
                    <br><br>
                    <strong>
                        Image Preview
                    </strong>
                    <br>
                    <small>
                        ${escapeHTML(description)}
                    </small>
                </div>
            `;

        }


        if (mediaType === "audio") {

            generated =
`<audio controls>
    <source
        src="${mediaSource}"
        type="audio/mpeg"
    >
    Your browser does not support audio.
</audio>`;

            previewHTML = `
                <audio controls style="width:100%;">
                    <source
                        src="${escapeAttribute(mediaSource)}"
                        type="audio/mpeg"
                    >
                    Your browser does not support audio.
                </audio>
            `;

        }


        if (mediaType === "video") {

            generated =
`<video controls width="640">
    <source
        src="${mediaSource}"
        type="video/mp4"
    >
    Your browser does not support video.
</video>`;

            previewHTML = `
                <video
                    controls
                    style="
                        width:100%;
                        max-height:220px;
                    "
                >
                    <source
                        src="${escapeAttribute(mediaSource)}"
                        type="video/mp4"
                    >
                    Your browser does not support video.
                </video>
            `;

        }


        if (mediaType === "iframe") {

            generated =
`<iframe
    src="${mediaSource}"
    title="${description}"
    width="600"
    height="400"
>
</iframe>`;

            previewHTML = `
                <div style="
                    padding:25px;
                    border:1px dashed rgba(230,167,91,.35);
                    border-radius:12px;
                ">
                    🌐
                    <br><br>
                    <strong>
                        iframe Preview
                    </strong>
                    <br>
                    <small>
                        External sites may prevent embedding.
                    </small>
                </div>
            `;

        }


        code.value =
            generated;

        preview.innerHTML =
            previewHTML;

    }


    build.addEventListener(
        "click",
        buildMedia
    );


    reset.addEventListener(
        "click",
        () => {

            type.value =
                "image";

            source.value =
                "media/sample.mp4";

            alt.value =
                "CodeBhavya learning media";

            buildMedia();

        }
    );


    type.addEventListener(
        "change",
        () => {

            if (type.value === "image") {

                source.value =
                    "images/logo.png";

            }

            if (type.value === "audio") {

                source.value =
                    "audio/lesson.mp3";

            }

            if (type.value === "video") {

                source.value =
                    "videos/lesson.mp4";

            }

            if (type.value === "iframe") {

                source.value =
                    "https://example.com";

            }

            buildMedia();

        }
    );


    buildMedia();

}


/* ================================================================
   COMPLETION
   ================================================================ */

function setupCompletion() {

    const button =
        document.getElementById(
            "completeLesson"
        );

    const message =
        document.getElementById(
            "completionMessage"
        );

    if (!button) return;

    const storageKey =
        "codebhavya-wt-level-08-completed";


    const completed =
        localStorage.getItem(
            storageKey
        ) === "true";


    if (completed) {

        button.textContent =
            "✓ Level 08 Completed";

        button.classList.add(
            "completed"
        );

        if (message) {

            message.textContent =
                "Excellent! You have completed Level 08.";

        }

    }


    button.addEventListener(
        "click",
        () => {

            localStorage.setItem(
                storageKey,
                "true"
            );

            button.textContent =
                "✓ Level 08 Completed";

            button.classList.add(
                "completed"
            );

            if (message) {

                message.textContent =
                    "Excellent! Level 08 has been marked as completed.";

            }

        }
    );

}


/* ================================================================
   SAFETY HELPERS
   ================================================================ */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
