// Single-resource local cache model; fixed estimated sizes, no actual HTTP or compression.
function wt29Fresh(policy='max-age=60',coding='identity'){return {policy,coding,now:0,originVersion:1,cache:null,networkRequests:0,bodyBytes:0};}
function wt29Text(v){return '<Demo> & release '+v;}
function wt29Tag(v){return '"release-'+v+'"';}
function wt29Valid(s){return s&&['max-age=60','no-cache','no-store'].includes(s.policy)&&['identity','gzip'].includes(s.coding);}
function wt29Request(s){
 if(!wt29Valid(s))return {error:'Unknown experiment configuration.'};
 const trace=[],entry=s.cache;let result;
 if(entry&&s.policy==='max-age=60'&&s.now-entry.storedAt<60){trace.push('Stored entry is fresh: reuse without network.');result={delivery:'fresh-cache',network:false,status:null,version:entry.version,bodyBytes:0,responseBody:null};}
 else{
  s.networkRequests++;trace.push(entry?'Validate stored ETag '+wt29Tag(entry.version)+'.':'No entry: request full representation.');
  if(entry&&entry.version===s.originVersion){entry.storedAt=s.now;trace.push('304 has no body; reuse stored content and refresh teaching timestamp.');result={delivery:'validated',network:true,status:304,version:entry.version,bodyBytes:0,responseBody:null};}
  else{const bytes=s.coding==='gzip'?4000:12000;s.bodyBytes+=bytes;trace.push('200 supplies current fixture body.');
   if(s.policy==='no-store'){s.cache=null;trace.push('No-store: do not retain the response.');}else{s.cache={version:s.originVersion,storedAt:s.now};trace.push('Store current representation for future eligible requests.');}
   result={delivery:'transferred',network:true,status:200,version:s.originVersion,bodyBytes:bytes,responseBody:{text:wt29Text(s.originVersion)}};
  }
 }
 result.text=wt29Text(result.version);result.trace=trace;result.request={url:'/release.txt',method:'GET',...(result.network&&entry?{ifNoneMatch:wt29Tag(entry.version)}:{})};return result;
}
function wt29Advance(s,raw){
 if(typeof raw!=='string'||!/^\d{1,4}$/.test(raw)||Number(raw)>3600||s.now+Number(raw)>86400)return {error:'Use whole0–3600 seconds without exceeding86400 total.'};
 s.now+=Number(raw);return {message:'Toy clock is now '+s.now+' seconds.'};
}
function wt29Publish(s){if(s.originVersion>=20)return {error:'The20-release teaching limit is reached; reset.'};s.originVersion++;return {message:'Published release'+s.originVersion+' at the same URL; existing browser entry retained.'};}
document.addEventListener('DOMContentLoaded',()=>{
 const byId=n=>document.getElementById('wt29'+n);let store=wt29Fresh();
 const refresh=()=>byId('State').textContent=JSON.stringify(store,null,2);
 const clear=()=>{byId('Request').textContent='No request yet.';byId('Trace').textContent='No trace yet.';byId('Response').textContent='No response yet.';byId('Source').textContent='No representation yet.';byId('Preview').replaceChildren();};refresh();
 byId('Process').addEventListener('click',()=>{
  clear();const r=wt29Request(store);refresh();if(r.error){byId('Status').textContent=r.error;return;}
  byId('Request').textContent=JSON.stringify(r.request,null,2);byId('Trace').textContent=r.trace.join('\n');byId('Response').textContent=JSON.stringify({delivery:r.delivery,network:r.network,status:r.status,version:r.version,bodyBytes:r.bodyBytes,responseBody:r.responseBody},null,2);byId('Source').textContent=JSON.stringify({selectedText:r.text,source:r.status===304?'stored body after304':r.network?'200 body':'fresh stored body'},null,2);const p=document.createElement('p');p.textContent=r.text;byId('Preview').append(p);byId('Status').textContent='Local model: '+r.delivery+'; no real request sent.';
 });
 for(const action of ['Advance','Publish'])byId(action).addEventListener('click',()=>{clear();const r=action==='Advance'?wt29Advance(store,byId('Seconds').value):wt29Publish(store);refresh();byId('Status').textContent=r.error||r.message;});
 const configure=()=>{clear();const policy=byId('Policy').value,coding=byId('Coding').value;if(!['max-age=60','no-cache','no-store'].includes(policy)||!['identity','gzip'].includes(coding)){byId('Status').textContent='Unknown experiment configuration.';return;}store=wt29Fresh(policy,coding);refresh();byId('Status').textContent='New fictional experiment; previous fixtures and counters cleared.';};
 for(const name of ['Policy','Coding'])byId(name).addEventListener('change',configure);
 byId('Reset').addEventListener('click',()=>{byId('Policy').value='max-age=60';byId('Coding').value='identity';byId('Seconds').value='60';configure();});
 const skip=document.querySelector('.wt29-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt29Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt29QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-29-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 29 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 29 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
