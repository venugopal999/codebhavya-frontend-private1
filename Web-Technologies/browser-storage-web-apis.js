"use strict";
const WT19_STORAGE_KEY = 'codebhavya-wt19-storage-lab-v1';
function wt19ValidatePreference(record) {
    const fail=message=>{const error=new Error(message);error.name='PreferenceError';throw error;};
    if(!record||typeof record!=='object'||Array.isArray(record))fail('Expected a preference object.');
    if(Object.keys(record).sort().join(',')!=='minutes,note,topic,version')fail('Expected exactly version, topic, minutes and note.');
    if(record.version!==1)fail('Unsupported record version; expected numeric 1.');
    if(!['html','css','javascript'].includes(record.topic))fail('Topic must be html, css or javascript.');
    if(![15,30,45].includes(record.minutes))fail('Duration must be numeric 15, 30 or 45.');
    if(typeof record.note!=='string'||record.note.trim().length>160)fail('Note must be text with at most 160 characters after trimming.');
    return {version:1,topic:record.topic,minutes:record.minutes,note:record.note.trim()};
}
function wt19ParsePreference(raw) {
    if(typeof raw!=='string'||raw.length>4096){const error=new Error('Expected JSON text of at most 4096 characters.');error.name='PreferenceError';throw error;}
    return wt19ValidatePreference(JSON.parse(raw));
}
document.addEventListener('DOMContentLoaded', () => {
    const byId=id=>document.getElementById('wt19'+id);
    const mode=byId('Mode'),fault=byId('Fault'),topic=byId('Topic'),minutes=byId('Minutes'),note=byId('Note');
    const status=byId('Status'),output=byId('Output'),json=byId('JSON'),validation=byId('Validation'),validated=byId('Validated');
    const memory=new Map();
    const modeName=()=>mode.value==='memory'?'Memory':mode.value==='local'?'localStorage':mode.value==='session'?'sessionStorage':'Unknown backend';
    const labMessage=(state,text)=>{output.dataset.state=state;status.textContent=text;};
    const backend=operation=>{
        if(!['normal','blocked','quota'].includes(fault.value))throw new Error('Unknown failure demonstration.');
        if(fault.value==='blocked')throw new DOMException('Simulated blocked access.','SecurityError');
        if(fault.value==='quota'&&operation==='save')throw new DOMException('Simulated quota failure.','QuotaExceededError');
        if(mode.value==='memory')return {getItem:key=>memory.has(key)?memory.get(key):null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
        if(mode.value==='local')return window.localStorage;
        if(mode.value==='session')return window.sessionStorage;
        throw new Error('Unknown storage backend.');
    };
    const failed=(operation,error)=>{
        const detail=error.name==='SyntaxError'?'Malformed JSON.':error.name==='PreferenceError'?error.message:error.name==='SecurityError'?'Access denied (SecurityError).':error.name==='QuotaExceededError'?'Write unavailable (QuotaExceededError).':'Storage operation unavailable.';
        output.textContent='No accepted result from this operation.';
        labMessage('error',modeName()+' · '+operation+' failed. '+detail+' Editor fields were preserved.');
    };
    byId('Save').addEventListener('click',()=>{
        try{
            const accepted=wt19ValidatePreference({version:1,topic:topic.value,minutes:Number(minutes.value),note:note.value});
            const raw=JSON.stringify(accepted);backend('save').setItem(WT19_STORAGE_KEY,raw);
            output.textContent=JSON.stringify(accepted,null,2);labMessage('saved',modeName()+' · Saved this lab preference under '+WT19_STORAGE_KEY+'.');
        }catch(error){failed('Save',error);}
    });
    byId('Load').addEventListener('click',()=>{
        try{
            const raw=backend('load').getItem(WT19_STORAGE_KEY);
            if(raw===null){output.textContent='The selected area has no lab record.';labMessage('missing',modeName()+' · No saved preference. Editor fields were preserved.');return;}
            const accepted=wt19ParsePreference(raw);
            topic.value=accepted.topic;minutes.value=String(accepted.minutes);note.value=accepted.note;
            output.textContent=JSON.stringify(accepted,null,2);labMessage('loaded',modeName()+' · Loaded a validated version 1 preference.');
        }catch(error){failed('Load',error);}
    });
    byId('Inspect').addEventListener('click',()=>{
        try{
            const raw=backend('inspect').getItem(WT19_STORAGE_KEY);
            if(raw===null){output.textContent='No lab key in the selected area.';labMessage('missing',modeName()+' · Inspect found no lab record.');return;}
            output.textContent=raw.slice(0,4096)+(raw.length>4096?'\n[Display truncated at 4096 characters]':'');
            labMessage('inspected',modeName()+' · Raw saved text displayed literally; it has not been loaded into the editor.');
        }catch(error){failed('Inspect',error);}
    });
    byId('Delete').addEventListener('click',()=>{
        try{backend('delete').removeItem(WT19_STORAGE_KEY);output.textContent='Only '+WT19_STORAGE_KEY+' was targeted.';labMessage('deleted',modeName()+' · This lab key is absent after Delete. Other keys and editor fields were preserved.');}
        catch(error){failed('Delete',error);}
    });
    const resetFields=()=>{
        topic.value='html';minutes.value='15';note.value='';output.textContent='No operation yet.';
        json.value='{"version":1,"topic":"html","minutes":15,"note":"Review forms"}';validated.textContent='No JSON checked yet.';
        validation.textContent='Try the sample, an unknown version, a string duration or malformed JSON.';
        labMessage('reset',modeName()+' · Editor fields reset. Saved data was kept; failure demonstration selection was kept.');
    };
    byId('Reset').addEventListener('click',resetFields);
    for(const control of [mode,fault])control.addEventListener('change',()=>{
        output.textContent='No operation yet.';labMessage('selected',modeName()+' · '+(fault.value==='blocked'?'Simulated access denial selected.':fault.value==='quota'?'Simulated quota failure selected.':'Normal access selected.')+' No record was read or written; editor fields were kept.');
    });
    byId('Validate').addEventListener('click',()=>{
        try{const accepted=wt19ParsePreference(json.value);validated.textContent=JSON.stringify(accepted,null,2);validation.textContent='Valid version 1 record. This checker did not write storage or replace editor fields.';}
        catch(error){validated.textContent='No accepted record.';validation.textContent='Rejected. '+(error.name==='SyntaxError'?'Malformed JSON.':error.message)+' Storage and editor fields were kept.';}
    });
    window.addEventListener('storage',event=>{
        if(mode.value!=='local'||fault.value!=='normal'||(event.key!==WT19_STORAGE_KEY&&event.key!==null))return;
        try{if(event.storageArea!==window.localStorage)return;}
        catch{return;}
        output.textContent='Saved local data changed elsewhere. Current editor fields were kept.';
        labMessage('external','localStorage · Saved data changed in another document. Choose Load to inspect the current record; your draft was preserved.');
    });
    output.dataset.state='idle';
    const skip=document.querySelector('.wt19-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt19Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt19QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-19-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 19 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 19 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
