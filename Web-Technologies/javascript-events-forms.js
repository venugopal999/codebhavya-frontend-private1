"use strict";
function wt17Validate(values) {
    const name=String(values.name).trim(),email=String(values.email).trim(),placesText=String(values.places).trim();
    const errors={};
    if(name.length<2||name.length>60)errors.Name='Enter a display name containing 2–60 characters after trimming.';
    if(!email||email.length>100||values.emailTypeMismatch)errors.Email='Enter one syntactically valid email address of at most 100 characters.';
    const session=['html','javascript'].includes(values.session)?values.session:null;
    if(!session)errors.Session='Choose one of the two available sessions.';
    const places=/^\d+$/.test(placesText)?Number(placesText):NaN;
    if(!Number.isSafeInteger(places)||places<1||places>4)errors.Places='Enter decimal digits for a whole count from 1 through 4.';
    else if(session&&places>(session==='html'?3:2))errors.Places='This session has only '+(session==='html'?3:2)+' places available.';
    if(values.confirm!==true)errors.Confirm='Confirm that you understand this is a local teaching preview.';
    return {ok:Object.keys(errors).length===0,errors,normalized:{displayName:name,email,session,places}};
}
document.addEventListener('DOMContentLoaded', () => {
    const outer=document.getElementById('wt17Outer'),inner=document.getElementById('wt17Inner'),link=document.getElementById('wt17EventLink'),mode=document.getElementById('wt17Mode');
    const eventLog=document.getElementById('wt17EventLog'),eventStatus=document.getElementById('wt17EventStatus');
    let path=[],serial=0;
    const isPlaygroundEvent=event=>link.contains(event.target);
    const record=(event,label)=>{
        path.push({listener:label,target:event.target.id||event.target.tagName,currentTarget:event.currentTarget.id,phase:event.eventPhase===1?'capture':event.eventPhase===2?'at target':'bubble',defaultPrevented:event.defaultPrevented});
        eventLog.textContent=JSON.stringify(path,null,2);
    };
    outer.addEventListener('click',event=>{
        if(!isPlaygroundEvent(event))return;
        path=[];const token=++serial;record(event,'Outer capture');
        window.setTimeout(()=>{if(token===serial)eventStatus.textContent=path.length+' observed listeners. Default canceled: '+Boolean(path[path.length-1]?.defaultPrevented)+'.';},0);
    },{capture:true});
    inner.addEventListener('click',event=>{if(isPlaygroundEvent(event))record(event,'Inner capture');},{capture:true});
    link.addEventListener('click',event=>{
        if(mode.value==='prevent')event.preventDefault();
        if(mode.value==='stop')event.stopPropagation();
        record(event,'Link listener');
    });
    inner.addEventListener('click',event=>{if(isPlaygroundEvent(event))record(event,'Inner bubble');});
    outer.addEventListener('click',event=>{if(isPlaygroundEvent(event))record(event,'Outer bubble');});
    const clearLog=()=>{serial++;path=[];eventLog.textContent='[]';eventStatus.textContent='Event log cleared. Activate the nested link to observe the selected mode.';};
    mode.addEventListener('change',clearLog);document.getElementById('wt17ClearLog').addEventListener('click',clearLog);

    const form=document.getElementById('wt17Form'),formStatus=document.getElementById('wt17FormStatus'),result=document.getElementById('wt17Result');
    const names=['Name','Email','Session','Places','Confirm'];const fields={},errors={};
    for(const name of names){fields[name]=document.getElementById('wt17'+name);errors[name]=document.getElementById('wt17'+name+'Error');}
    let attempts=0;
    const clearField=name=>{fields[name].setCustomValidity('');fields[name].removeAttribute('aria-invalid');errors[name].textContent='';};
    const clearAll=()=>names.forEach(clearField);
    const edited=name=>{
        clearField(name);if(name==='Session')clearField('Places');
        result.textContent='Values changed. Submit again to create a current preview.';
        formStatus.textContent='Values edited; the complete form will be rechecked on submission.';
    };
    for(const name of names)fields[name].addEventListener(name==='Session'||name==='Confirm'?'change':'input',()=>edited(name));
    document.getElementById('wt17Updates').addEventListener('change',()=>{result.textContent='Optional field changed. Submit again to inspect current form data.';});
    form.addEventListener('submit',event=>{
        event.preventDefault();attempts++;clearAll();
        fields.Name.value=fields.Name.value.trim();fields.Email.value=fields.Email.value.trim();
        const checked=wt17Validate({name:fields.Name.value,email:fields.Email.value,emailTypeMismatch:fields.Email.validity.typeMismatch,session:fields.Session.value,places:fields.Places.value,confirm:fields.Confirm.checked});
        for(const name of names){
            if(!fields[name].validity.valid&&!checked.errors[name])checked.errors[name]=fields[name].validationMessage||'Check this field’s value.';
            if(checked.errors[name]){fields[name].setCustomValidity(checked.errors[name]);fields[name].setAttribute('aria-invalid','true');errors[name].textContent=checked.errors[name];}
        }
        const nativeValid=form.checkValidity();const rejected=names.filter(name=>checked.errors[name]);
        if(!nativeValid||rejected.length){
            formStatus.textContent='Attempt '+attempts+' rejected. Correct '+(rejected.length||1)+' field'+(rejected.length===1?'':'s')+' and retry.';
            result.textContent=JSON.stringify({attempt:attempts,outcome:'rejected',errors:checked.errors},null,2);
            if(rejected.length)fields[rejected[0]].focus();return;
        }
        const entries=Array.from(new FormData(form).entries());
        result.textContent=JSON.stringify({attempt:attempts,outcome:'local preview accepted',formDataEntries:entries,normalized:checked.normalized},null,2);
        formStatus.textContent='Attempt '+attempts+' accepted as a local preview. '+checked.normalized.places+' place'+(checked.normalized.places===1?'':'s')+' requested.';
    });
    document.getElementById('wt17Reset').addEventListener('click',()=>{
        form.reset();clearAll();attempts=0;result.textContent='No accepted preview yet.';formStatus.textContent='Form reset to its defaults. Use fictional values for the local preview.';fields.Name.focus();
    });
    document.getElementById('wt17Submit').disabled=false;
    formStatus.textContent='Local form handler ready. Use fictional values, then preview a request.';
    const skip=document.querySelector('.wt17-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt17Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt17QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-17-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 17 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 17 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
