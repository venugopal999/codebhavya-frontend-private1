// Local declared-contract planner only. Checkboxes are self-reports, never inspected evidence.
const wt30Evidence={Ui:'Keyboard/mobile journey',Input:'Valid/invalid input and unchanged state',Contract:'Actual backend request/error contract',DataEvidence:'Database constraints and persistence',Access:'Identity, other-owner denial and protected writes',Tests:'Reproducible positive/negative cases',Release:'Deployed release, smoke checks and rollback',Explain:'Own decisions, contribution and limitations'};
function wt30Clean(raw,min,max,multiline=false){
 if(typeof raw!=='string')return null;const value=raw.trim(),points=Array.from(value);
 const controls=multiline?/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/:/[\u0000-\u001f\u007f-\u009f]/;
 if(points.length<min||points.length>max||controls.test(raw)||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return null;return value;
}
function wt30Plan(input){
 const title=wt30Clean(input.title,1,80),brief=wt30Clean(input.brief,60,600,true);
 if(title===null||brief===null)return {error:'Use a title of1–80 and a feature brief of60–600 Unicode code points; follow the displayed control-character rules.'};
 if(!['static','php','java'].includes(input.stack)||!['memory','shared'].includes(input.data)||!['public','private'].includes(input.audience)||!['local','production'].includes(input.target))return {error:'Unknown project scope option.'};
 const backend=input.stack!=='static',shared=input.data==='shared',privateAccess=input.audience==='private',production=input.target==='production';
 const blockers=[];if(!backend&&(shared||privateAccess))blockers.push('An implemented backend is required for the declared shared/private operations.');
 const keys=['Ui','Input',...(backend||shared||privateAccess?['Contract']:[]),...(shared?['DataEvidence']:[]),...(privateAccess?['Access']:[]),'Tests',...(production?['Release']:[]),'Explain'];
 const evidence=input.evidence&&typeof input.evidence==='object'?input.evidence:{};
 const required=keys.map(key=>({key,item:wt30Evidence[key],selfReported:evidence[key]===true}));const gaps=required.filter(item=>!item.selfReported).map(item=>item.item);
 const architecture={browser:'Semantic keyboard/mobile UI, bounded input and safe text outcomes.',backend:backend?(input.stack==='php'?'Implement PHP request handlers':'Implement Java request handlers')+(privateAccess?' with trusted identity and per-object permission checks.':' with explicit validation and request/error contracts.'):(shared||privateAccess?'Missing required backend boundary.':'No backend required for the declared public local-memory exercise.'),data:shared?'Implement database constraints, bound values and appropriate transaction behavior.':'Temporary memory; document reload loss and avoid durability claims.',release:production?'Verify actual deployed version, smoke behavior and compatible rollback.':'Provide reproducible local setup and observed behavior.'};
 const tests=['Valid task change succeeds once under the stated contract.','Invalid or disallowed change leaves data unchanged.','Keyboard/mobile journey exposes readable outcomes.',...(shared?['Accepted changes persist through the documented database boundary.']:['Reload/reset behavior matches temporary-memory scope.']),...(privateAccess?['Anonymous, expired and other-owner operations are denied without private-data disclosure.']:[]),...(production?['Serving release and real routes/assets/backend contract pass smoke checks.']:[])];
 return {title,brief,scope:{stack:input.stack,data:input.data,audience:input.audience,target:input.target},outcome:blockers.length?'revise architecture':gaps.length?'collect evidence':'ready for self-review',blockers,architecture,tests,required,selfReportedCount:required.filter(item=>item.selfReported).length,applicableCount:required.length,gaps,notice:'Declared plan and self-report only; no code, tests, security, persistence or placement outcome verified.',trace:['Validated bounded title and feature brief.','Mapped declared responsibility boundaries.','Selected evidence reminders applicable to this scope.','Listed blockers and missing self-reports; no actual evidence inspected.']};
}
document.addEventListener('DOMContentLoaded',()=>{
 const byId=n=>document.getElementById('wt30'+n),names=['Title','Brief','Stack','Data','Audience','Target',...Object.keys(wt30Evidence)];
 const clear=()=>{byId('Request').textContent='No plan yet.';byId('Trace').textContent='No review yet.';byId('Response').textContent='No contract yet.';byId('Preview').replaceChildren();};
 for(const name of names){const edit=()=>{clear();byId('Status').textContent='Plan edited; review again. Evidence reminders remain self-reported.';};byId(name).addEventListener('input',edit);byId(name).addEventListener('change',edit);}
 byId('Process').addEventListener('click',()=>{
  clear();const input={title:byId('Title').value,brief:byId('Brief').value,stack:byId('Stack').value,data:byId('Data').value,audience:byId('Audience').value,target:byId('Target').value,evidence:Object.fromEntries(Object.keys(wt30Evidence).map(k=>[k,byId(k).checked===true]))};
  byId('Request').textContent=JSON.stringify(input,null,2);const result=wt30Plan(input);
  if(result.error){byId('Response').textContent=JSON.stringify({error:result.error},null,2);byId('Status').textContent=result.error;return;}
  byId('Trace').textContent=result.trace.join('\n');byId('Response').textContent=JSON.stringify(result,null,2);
  const paragraph=text=>{const p=document.createElement('p');p.textContent=text;byId('Preview').append(p);};paragraph(result.title+' · '+result.outcome);paragraph(result.selfReportedCount+' of '+result.applicableCount+' applicable reminders self-reported.');for(const item of [...result.blockers,...result.gaps])paragraph(item);paragraph(result.notice);byId('Status').textContent='Local planner: '+result.outcome+'. Self-report only.';
 });
 byId('Reset').addEventListener('click',()=>{byId('Title').value='Study Task Tracker';byId('Brief').value='A learner adds a bounded task title and sees it in a local list. Invalid titles create no task and show readable feedback.';byId('Stack').value='static';byId('Data').value='memory';byId('Audience').value='public';byId('Target').value='local';for(const key of Object.keys(wt30Evidence))byId(key).checked=false;clear();byId('Status').textContent='Default planner restored; no project files or completed study markers changed.';});
 const skip=document.querySelector('.wt30-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt30Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt30QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-30-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 30 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 30 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
