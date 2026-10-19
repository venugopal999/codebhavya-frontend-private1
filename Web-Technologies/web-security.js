// Fictional policy model: no network, real authentication, cookies or secure token generation.
function wt28Fresh(){return {notes:[{id:1,owner:'A',text:'Review trust boundaries'},{id:2,owner:'B',text:'Practise <tags> & safe text'}],sessions:{'demo-A':{user:'A',active:true,revision:1,token:'demo-A-1'},'demo-B':{user:'B',active:true,revision:1,token:'demo-B-1'},'expired-A':{user:'A',active:false,revision:1,token:''}}};}
function wt28Handle(store,r){
 const trace=[],deny=(code,message)=>({decision:'deny',code,message,trace:[...trace,'Denied: '+code]});
 if(!/^\/notes\/(1|2|99)$/.test(r.path))return deny('route','Unknown toy route.');
 if(!['GET','POST'].includes(r.method))return deny('method','Only GET and POST are supported.');
 trace.push('Accepted route and method.');
 const session=Object.prototype.hasOwnProperty.call(store.sessions,r.session)?store.sessions[r.session]:null;
 if(!session||!session.active)return deny('session','An active session is required.');
 trace.push('Resolved active trusted fixture identity.');
 const note=store.notes.find(n=>'/notes/'+n.id===r.path);
 if(!note||note.owner!==session.user)return deny('access','This note is not available to this caller.');
 trace.push('Authorized owned note.');
 if(r.method==='POST'){
  if(r.origin!=='https://learn.example')return deny('origin','Write origin is not accepted.');
  if(r.token!==session.token)return deny('csrf','Current session token is required.');
  trace.push('Accepted origin and current demo CSRF token.');
  if(typeof r.body!=='string'||r.body.length>1000)return deny('body','Raw body exceeds the toy input contract.');
  let value;try{value=JSON.parse(r.body);}catch(e){return deny('json','Invalid JSON syntax.');}
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).join('|')!=='text'||typeof value.text!=='string')return deny('fields','Require exactly a text string.');
  const text=value.text.trim(),points=Array.from(text);
  if(points.length<1||points.length>120||/[\u0000-\u001f\u007f-\u009f]/.test(value.text)||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return deny('text','Text must meet the bounded Unicode contract.');
  trace.push('Accepted writable text; apply owned update.');note.text=text;
 }
 return {decision:'allow',code:r.method==='GET'?'read':'updated',message:'Owned note operation accepted.',note:{id:note.id,text:note.text},trace};
}
document.addEventListener('DOMContentLoaded',()=>{
 const byId=n=>document.getElementById('wt28'+n);let store=wt28Fresh();
 const refresh=()=>byId('State').textContent=JSON.stringify(store,null,2);
 const clear=()=>{byId('Request').textContent='No request yet.';byId('Trace').textContent='No trace yet.';byId('Response').textContent='No response yet.';byId('Source').textContent='No returned note.';byId('Preview').replaceChildren();};
 refresh();
 byId('Process').addEventListener('click',()=>{
  const r={method:byId('Method').value,path:byId('Path').value,session:byId('Session').value,origin:byId('Origin').value,token:byId('Token').value,body:byId('Body').value};
  const result=wt28Handle(store,r);byId('Request').textContent=JSON.stringify(r,null,2);byId('Trace').textContent=result.trace.join('\n');byId('Response').textContent=JSON.stringify({decision:result.decision,code:result.code,message:result.message},null,2);byId('Source').textContent=result.note?JSON.stringify(result.note,null,2):'No returned note.';byId('Preview').replaceChildren();const p=document.createElement('p');p.textContent=result.note?result.note.text:result.message;byId('Preview').append(p);byId('Status').textContent='Local policy: '+result.decision+' · '+result.code+'.';refresh();
 });
 for(const action of ['Rotate','Expire'])byId(action).addEventListener('click',()=>{
  clear();const key=byId('Session').value,session=Object.prototype.hasOwnProperty.call(store.sessions,key)?store.sessions[key]:null;
  if(session&&session.active){if(action==='Rotate'){session.revision++;session.token=key+'-'+session.revision;}else{session.active=false;session.token='';}byId('Status').textContent='Selected fictional session '+(action==='Rotate'?'token rotated.':'expired.');}
  else byId('Status').textContent='Choose an active session fixture.';refresh();
 });
 byId('Reset').addEventListener('click',()=>{store=wt28Fresh();byId('Method').value='GET';byId('Path').value='/notes/1';byId('Session').value='demo-A';byId('Origin').value='https://learn.example';byId('Token').value='demo-A-1';byId('Body').value='{"text":"Review trust boundaries"}';clear();refresh();byId('Status').textContent='Fictional fixtures reset.';});
 const skip=document.querySelector('.wt28-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt28Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt28QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-28-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 28 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 28 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
