"use strict";
function wt18MockFetch(scenario, options={}) {
    scenario=['success','empty','http','network','json','schema'].includes(scenario)?scenario:'success';
    const delay=[500,1500].includes(Number(options.delay))?Number(options.delay):500;
    const signal=options.signal;
    return new Promise((resolve,reject)=>{
        let timer;
        const canceled=()=>{window.clearTimeout(timer);signal?.removeEventListener('abort',canceled);reject(new DOMException('Local response canceled.','AbortError'));};
        if(signal?.aborted){canceled();return;}
        signal?.addEventListener('abort',canceled,{once:true});
        timer=window.setTimeout(()=>{
            signal?.removeEventListener('abort',canceled);
            if(scenario==='network'){reject(new TypeError('Simulated transport failure.'));return;}
            const records=[{id:'w1',title:'HTML',capacity:30,reserved:12},{id:'w2',title:'CSS',capacity:20,reserved:20},{id:'w3',title:'JavaScript',capacity:40,reserved:10},{id:'w4',title:'Accessibility',capacity:12,reserved:0}];
            const body=scenario==='empty'?'[]':scenario==='http'?'{"message":"Not found"}':scenario==='json'?'{"workshops":':scenario==='schema'?'[{"id":"bad","title":"Overbooked","capacity":2,"reserved":3}]':JSON.stringify(records);
            resolve(new Response(body,{status:scenario==='http'?404:200,headers:{'Content-Type':'application/json'}}));
        },delay);
    });
}
function wt18ValidateCatalog(data) {
    const fail=()=>{const error=new Error('Payload does not meet the workshop record contract.');error.name='SchemaError';throw error;};
    if(!Array.isArray(data)||data.length>20)fail();
    const seen=new Set(),accepted=[];
    for(let index=0;index<data.length;index++){
        if(!Object.prototype.hasOwnProperty.call(data,index))fail();
        const w=data[index];
        if(!w||typeof w!=='object'||Array.isArray(w)||typeof w.id!=='string'||typeof w.title!=='string')fail();
        const id=w.id.trim(),title=w.title.trim();
        if(!id||id.length>40||seen.has(id)||!title||title.length>80||!Number.isInteger(w.capacity)||!Number.isInteger(w.reserved)||w.capacity<0||w.capacity>1000||w.reserved<0||w.reserved>w.capacity)fail();
        seen.add(id);accepted.push({id,title,capacity:w.capacity,reserved:w.reserved,remaining:w.capacity-w.reserved});
    }
    return accepted;
}
document.addEventListener('DOMContentLoaded', () => {
    const scenario=document.getElementById('wt18Scenario'),delay=document.getElementById('wt18Delay'),cancel=document.getElementById('wt18Cancel');
    const status=document.getElementById('wt18Status'),output=document.getElementById('wt18Output'),cards=document.getElementById('wt18Cards'),payload=document.getElementById('wt18Payload'),logNode=document.getElementById('wt18Log');
    let sequence=0,latest=0,generation=0,log=[];const pending=new Map();
    const record=(request,stage,message)=>{log.push({request,stage,message});if(log.length>30)log.shift();logNode.textContent=JSON.stringify(log,null,2);};
    const state=(name,message)=>{output.dataset.state=name;status.textContent=message;};
    const clearResult=()=>{cards.replaceChildren();payload.textContent='No accepted payload yet.';};
    const render=accepted=>{
        cards.replaceChildren();
        for(const w of accepted){
            const item=document.createElement('li'),card=document.createElement('article'),title=document.createElement('h4'),note=document.createElement('p');
            card.className='wt18-card';title.textContent=w.title;note.textContent='Capacity '+w.capacity+' · reserved '+w.reserved+' · remaining '+w.remaining;
            card.append(title,note);item.append(card);cards.append(item);
        }
        payload.textContent=JSON.stringify(accepted,null,2);
    };
    const load=async()=>{
        const id=++sequence;latest=id;const epoch=generation;const controller=new AbortController();pending.set(id,controller);
        const chosen=['success','empty','http','network','json','schema'].includes(scenario.value)?scenario.value:'success';
        const milliseconds=[500,1500].includes(Number(delay.value))?Number(delay.value):500;
        clearResult();output.setAttribute('aria-busy','true');cancel.disabled=false;
        state('loading','Loading local simulation. Request '+id+' owns the current result.');record(id,'start',chosen+' response scheduled at '+milliseconds+'ms.');
        const owns=()=>epoch===generation&&id===latest;
        try{
            const response=await wt18MockFetch(chosen,{delay:milliseconds,signal:controller.signal});
            if(controller.signal.aborted)throw new DOMException('Canceled.','AbortError');
            if(epoch!==generation)return;
            record(id,'response','Received HTTP '+response.status+'.');
            if(!response.ok){const error=new Error('HTTP '+response.status);error.name='HttpError';throw error;}
            const data=await response.json();
            if(controller.signal.aborted)throw new DOMException('Canceled.','AbortError');
            if(epoch!==generation)return;
            record(id,'parse','JSON parsed.');const accepted=wt18ValidateCatalog(data);record(id,'validate',accepted.length+' records accepted.');
            if(!owns()){record(id,'ignored','Obsolete successful result ignored.');return;}
            render(accepted);
            if(accepted.length){const total=accepted.reduce((n,w)=>n+w.remaining,0);state('success','Success. Request '+id+': '+accepted.length+' workshops, '+total+' remaining seats.');}
            else state('empty','Empty result. Request '+id+' returned no workshops.');
            record(id,'render','Newest owned result displayed.');
        }catch(error){
            if(epoch!==generation)return;
            if(!owns()){record(id,'ignored','Obsolete '+(error.name==='AbortError'?'cancellation':'failure')+' ignored.');return;}
            clearResult();
            if(error.name==='AbortError'){state('canceled','Canceled. Request '+id+' produced no accepted result.');record(id,'cancel','Newest request canceled.');}
            else{
                const message=error.name==='HttpError'?error.message:error.name==='SyntaxError'?'JSON parsing failed.':error.name==='SchemaError'?'Workshop record validation failed.':'Simulated transport failure.';
                state('error','Error. Request '+id+': '+message+' Choose a scenario and retry.');record(id,'error',message);
            }
        }finally{
            pending.delete(id);
            if(owns()){output.setAttribute('aria-busy','false');if(document.activeElement===cancel)document.getElementById('wt18Load').focus();cancel.disabled=true;}
        }
    };
    document.getElementById('wt18Load').addEventListener('click',load);
    cancel.addEventListener('click',()=>{pending.get(latest)?.abort();});
    const reset=()=>{
        generation++;latest=++sequence;for(const controller of pending.values())controller.abort();pending.clear();
        log=[];logNode.textContent='[]';clearResult();scenario.value='success';delay.value='500';output.setAttribute('aria-busy','false');cancel.disabled=true;
        state('idle','Idle. Local simulation reset; choose a response and load it.');
    };
    document.getElementById('wt18Reset').addEventListener('click',reset);window.addEventListener('pagehide',reset);
    output.dataset.state='idle';
    const skip=document.querySelector('.wt18-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt18Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt18QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-18-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 18 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 18 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
