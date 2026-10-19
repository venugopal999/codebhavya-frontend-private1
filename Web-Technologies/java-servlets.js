// Teaching model only: synchronous JavaScript, no Java, network, cookies or authentication.
function wt23CreateModel() {
    return {generation:1,phase:'new',initCount:0,serviceCount:0,destroyCount:0,nextSession:1,clients:{A:null,B:null},sessions:new Map(),log:['Created mock servlet instance 1.']};
}
function wt23Log(model,line){model.log.push(line);if(model.log.length>30)model.log.splice(0,model.log.length-30);}
function wt23Snapshot(model){
    return {generation:model.generation,phase:model.phase,initCount:model.initCount,serviceCount:model.serviceCount,destroyCount:model.destroyCount,clients:{...model.clients},sessions:Array.from(model.sessions,([id,preference])=>({id,preference:{...preference}}))};
}
function wt23Validate(form){
    if(!form||typeof form!=='object'||Array.isArray(form))return null;
    const keys=Object.keys(form).sort();if(keys.length!==2||keys[0]!=='learner'||keys[1]!=='topic')return null;
    if(typeof form.learner!=='string'||typeof form.topic!=='string')return null;
    // Reject control characters before trimming; reject unpaired surrogate code points.
    if(/[\u0000-\u001f\u007f-\u009f]/.test(form.learner))return null;
    const learner=form.learner.trim(),points=Array.from(learner);
    if(points.length<2||points.length>40||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return null;
    if(!['html','servlets','jsp'].includes(form.topic))return null;
    return {learner,topic:form.topic};
}
function wt23Handle(model,request){
    const trace=[],record=text=>trace.push(text);
    const respond=(status,body,extra={})=>{record('Response '+status+'.');wt23Log(model,request.client+' '+request.method+' '+request.path+' → '+status);return {status,headers:{'Content-Type':'application/json; charset=UTF-8',...extra},body,trace};};
    if(!Object.prototype.hasOwnProperty.call(model.clients,request.client))return respond(400,{message:'Unknown mock client.'});
    if(!['/study','/logout'].includes(request.path)){record('No mapped route; no lifecycle or session change.');return respond(404,{message:'Unknown application-relative path.'});}
    record('Mapped '+request.path+'.');
    if(model.phase==='destroyed'){record('Destroyed instance cannot service this request.');return respond(503,{message:'Create a new mock instance before processing mapped requests.'});}
    if(model.phase==='new'){model.phase='active';model.initCount++;wt23Log(model,'init() for instance '+model.generation+'.');record('init() once for instance '+model.generation+'.');}
    model.serviceCount++;record('service() call '+model.serviceCount+' for instance '+model.generation+'.');
    const allowed=request.path==='/study'?['GET','POST']:['POST'];
    if(!allowed.includes(request.method))return respond(405,{message:'Unsupported method for this toy route.'},{Allow:allowed.join(', ')});
    const associated=model.clients[request.client];
    if(request.path==='/logout'){
        if(associated&&model.sessions.has(associated)){model.sessions.delete(associated);record('Invalidate current valid mock session.');}
        else record('No valid mock session to invalidate.');
        model.clients[request.client]=null;record('Clear selected mock client association; do not create a session.');
        return respond(200,{message:'Mock client logged out; no new session created.',preference:null});
    }
    if(request.method==='GET'){
        const preference=associated?model.sessions.get(associated):null;
        record('Read current valid session only; do not create or update.');
        return respond(200,{message:preference?'Current mock study preference.':'Anonymous: no current valid mock session.',sessionId:preference?associated:null,preference:preference?{...preference}:null});
    }
    if(request.mediaType!=='application/x-www-form-urlencoded')return respond(415,{message:'This toy submission requires application/x-www-form-urlencoded.'});
    const accepted=wt23Validate(request.form);
    if(!accepted){record('Reject parameter shape or values before creating/changing a session.');return respond(400,{message:'Use exactly one learner (2–40 Unicode code points; no controls or lone surrogates) and one allowed topic.'});}
    record('Accepted all submission values.');
    let id=associated;
    if(!id||!model.sessions.has(id)){id='demo-'+model.nextSession++;model.clients[request.client]=id;record('Create fresh public mock session '+id+'.');}
    else record('Reuse current valid mock session '+id+'.');
    model.sessions.set(id,{...accepted});record('Store the bounded accepted preference.');
    return respond(200,{message:'Mock preference saved.',sessionId:id,preference:{...accepted}});
}
function wt23Destroy(model){
    if(model.phase==='active'){model.phase='destroyed';model.destroyCount++;wt23Log(model,'destroy() once for instance '+model.generation+'.');return 'Instance destroyed. Mapped requests now return simulated 503.';}
    if(model.phase==='new'){model.phase='destroyed';wt23Log(model,'Discarded uninitialized instance '+model.generation+'; no destroy callback modeled.');return 'Uninitialized instance discarded; no init or destroy callback ran.';}
    return 'Instance already stopped; no repeated destroy callback.';
}
function wt23NewInstance(model){
    if(model.phase!=='destroyed')return 'Stop the current instance before creating its replacement.';
    model.generation++;model.phase='new';model.initCount=0;model.serviceCount=0;model.destroyCount=0;
    wt23Log(model,'Created replacement instance '+model.generation+'; mock sessions preserved.');return 'New instance created. Its next mapped request initializes it; mock sessions remain.';
}
function wt23Expire(model,client){
    if(!Object.prototype.hasOwnProperty.call(model.clients,client))return 'Unknown mock client.';
    const id=model.clients[client];
    if(id&&model.sessions.has(id)){model.sessions.delete(id);wt23Log(model,'Manually expired '+id+' for client '+client+'; stale association retained.');return 'Selected mock session expired manually. Its association is stale; no timer ran.';}
    return 'No valid mock session to expire; no session was created.';
}
document.addEventListener('DOMContentLoaded',()=>{
    const byId=id=>document.getElementById('wt23'+id),client=byId('Client'),method=byId('Method'),path=byId('Path'),learner=byId('Learner'),topic=byId('Topic'),type=byId('Type'),variant=byId('Variant');
    const labStatus=byId('Status'),state=byId('State'),trace=byId('Trace'),response=byId('Response'),preview=byId('Preview'),log=byId('Log');let model=wt23CreateModel();
    const refresh=()=>{state.textContent=JSON.stringify(wt23Snapshot(model),null,2);log.textContent=model.log.join('\n');};
    const clearOutcome=()=>{trace.textContent='No request yet.';response.textContent='No response yet.';preview.textContent='No preview yet.';};
    byId('Process').addEventListener('click',()=>{
        const form={learner:learner.value,topic:topic.value};
        if(variant.value==='missing')delete form.learner;
        else if(variant.value==='array')form.learner=[learner.value,learner.value];
        else if(variant.value==='extra')form.role='admin';
        else if(variant.value!=='normal')form.invalidVariant=true;
        const result=wt23Handle(model,{client:client.value,method:method.value,path:path.value,mediaType:type.value,form});
        trace.textContent=result.trace.join('\n');response.textContent=JSON.stringify({status:result.status,headers:result.headers,body:result.body},null,2);
        preview.replaceChildren();const paragraph=document.createElement('p');paragraph.textContent=result.body.preference?result.body.preference.learner+' · '+result.body.preference.topic:result.body.message;preview.append(paragraph);
        labStatus.textContent='Local JavaScript model · '+result.status+' · '+result.body.message;refresh();
    });
    for(const [id,action] of [['Destroy',()=>wt23Destroy(model)],['New',()=>wt23NewInstance(model)],['Expire',()=>wt23Expire(model,client.value)]])byId(id).addEventListener('click',()=>{labStatus.textContent=action();clearOutcome();refresh();});
    byId('Reset').addEventListener('click',()=>{
        model=wt23CreateModel();client.value='A';method.value='GET';path.value='/study';learner.value='Demo learner';topic.value='html';type.value='application/x-www-form-urlencoded';variant.value='normal';clearOutcome();refresh();labStatus.textContent='Entire local demonstration reset. No Java runtime or real session was changed.';
    });refresh();
    const skip=document.querySelector('.wt23-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt23Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt23QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-23-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 23 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 23 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
