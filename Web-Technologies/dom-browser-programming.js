"use strict";
function wt16ValidateText(title, note) {
    title = String(title).trim(); note = String(note).trim();
    if (!title || title.length > 60) return {ok:false,message:'Enter a title containing 1–60 characters after trimming.'};
    if (note.length > 180) return {ok:false,message:'Keep the note to 180 characters or fewer after trimming.'};
    return {ok:true,title,note};
}
document.addEventListener('DOMContentLoaded', () => {
    const preview = document.getElementById('wt16Preview');
    const selector = document.getElementById('wt16Selected');
    const titleInput = document.getElementById('wt16Title');
    const noteInput = document.getElementById('wt16Note');
    const status = document.getElementById('wt16Status');
    const save = document.getElementById('wt16Save');
    const add = document.getElementById('wt16Add');
    const highlight = document.getElementById('wt16Highlight');
    const remove = document.getElementById('wt16Remove');
    let nextId = 1;
    const cards = () => Array.from(preview.querySelectorAll('.wt16-card'));
    const selected = () => cards().find(card => card.dataset.cardId === selector.value) || null;
    const makeCard = (title,note) => {
        const item = document.createElement('li');
        const card = document.createElement('article');
        card.className = 'wt16-card';card.dataset.cardId = 'card-'+nextId++;
        const heading = document.createElement('h4');heading.className='wt16-card-title';heading.textContent=title;
        const paragraph = document.createElement('p');paragraph.className='wt16-card-note';paragraph.textContent=note;
        const badge = document.createElement('span');badge.className='wt16-badge';badge.textContent='Highlighted';badge.hidden=true;
        card.append(heading,paragraph,badge);item.append(card);preview.append(item);
        return card;
    };
    const inspect = (operation,code,announce=true) => {
        const current=cards();const card=selected();
        save.disabled=!card;remove.disabled=!card;highlight.disabled=!card;selector.disabled=current.length===0;add.disabled=current.length>=6;
        highlight.setAttribute('aria-pressed',card?.classList.contains('is-highlighted') ? 'true' : 'false');
        document.getElementById('wt16Empty').hidden=current.length!==0;
        document.getElementById('wt16Snapshot').textContent=JSON.stringify({count:current.length,selectedId:card?.dataset.cardId||null,cards:current.map(node=>({id:node.dataset.cardId,title:node.querySelector('.wt16-card-title').textContent,note:node.querySelector('.wt16-card-note').textContent,highlighted:node.classList.contains('is-highlighted')}))},null,2);
        document.getElementById('wt16Code').textContent=code;
        if(announce)status.textContent=operation+' '+current.length+' card'+(current.length===1?'':'s')+' in the preview.';
    };
    const rebuildOptions = chosen => {
        selector.replaceChildren();
        for(const card of cards()){
            const option=document.createElement('option');option.value=card.dataset.cardId;option.textContent=card.dataset.cardId+' · '+card.querySelector('.wt16-card-title').textContent;selector.append(option);
        }
        selector.value=cards().some(card=>card.dataset.cardId===chosen)?chosen:(cards()[0]?.dataset.cardId||'');
    };
    const loadFields = () => {
        const card=selected();titleInput.value=card?.querySelector('.wt16-card-title').textContent||'';noteInput.value=card?.querySelector('.wt16-card-note').textContent||'';
    };
    const validate = () => {
        const text=wt16ValidateText(titleInput.value,noteInput.value);
        if(!text.ok){status.textContent=text.message;return null;}
        return text;
    };
    selector.addEventListener('change',()=>{loadFields();inspect('Selection changed.','// Match generated data-card-id to the selected option.');});
    save.addEventListener('click',()=>{
        const card=selected();if(!card){status.textContent='Select or add a card before editing.';return;}
        const text=validate();if(!text)return;
        card.querySelector('.wt16-card-title').textContent=text.title;
        card.querySelector('.wt16-card-note').textContent=text.note;
        rebuildOptions(card.dataset.cardId);
        inspect('Text saved.','title.textContent = '+JSON.stringify(text.title)+';\nnote.textContent = '+JSON.stringify(text.note)+';');
    });
    add.addEventListener('click',()=>{
        if(cards().length>=6){status.textContent='The preview limit is six cards. Remove one before adding another.';return;}
        const text=validate();if(!text)return;
        const card=makeCard(text.title,text.note);rebuildOptions(card.dataset.cardId);loadFields();
        inspect('Card added.','// Create li, article, h4, p and a hidden badge.\ntitle.textContent = '+JSON.stringify(text.title)+';\nnote.textContent = '+JSON.stringify(text.note)+';\ncard.dataset.cardId = '+JSON.stringify(card.dataset.cardId)+';\npreview.append(item);');
        if(add.disabled)selector.focus();
    });
    highlight.addEventListener('click',()=>{
        const card=selected();if(!card){status.textContent='Select or add a card before highlighting.';return;}
        const active=card.classList.toggle('is-highlighted');card.querySelector('.wt16-badge').hidden=!active;
        inspect(active?'Highlight enabled.':'Highlight cleared.','card.classList.toggle("is-highlighted", '+active+');\nbadge.hidden = '+(!active)+';');
    });
    remove.addEventListener('click',()=>{
        const current=cards();const card=selected();if(!card){status.textContent='No selected card to remove.';return;}
        const index=current.indexOf(card);card.parentElement.remove();
        const remaining=cards();const chosen=remaining[Math.min(index,remaining.length-1)]?.dataset.cardId||'';
        rebuildOptions(chosen);loadFields();inspect('Card removed.','card.parentElement.remove();\n// Select a surviving card, or show the empty state.');
        if(remaining.length)selector.focus();else titleInput.focus();
    });
    const reset = announce => {
        preview.replaceChildren();nextId=1;
        makeCard('HTML Workshop','Build a meaningful document structure.');
        makeCard('CSS Layout','Arrange readable cards across screen sizes.');
        makeCard('JavaScript Data','Derive and inspect useful collection results.');
        rebuildOptions('card-1');loadFields();inspect('Preview reset.','preview.replaceChildren();\n// Rebuild three starting cards and selection options.',announce);
    };
    document.getElementById('wt16Reset').addEventListener('click',()=>reset(true));
    reset(false);
    const skip=document.querySelector('.wt16-skip-link');
    if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt16Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt16QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-16-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 16 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 16 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
