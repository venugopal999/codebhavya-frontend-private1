// In-memory HTTP contract model only: no network, server, authentication or database.
function wt27Fresh(){return {nextID:3,tasks:[{id:1,title:'Review HTTP methods',completed:false,version:1},{id:2,title:'Practise JSON <objects>',completed:false,version:1}]};}
function wt27Public(task){return {id:task.id,title:task.title,completed:task.completed};}
function wt27Tag(task){return '"task-'+task.id+'-v'+task.version+'"';}
function wt27Text(value){
    if(typeof value!=='string'||/[\u0000-\u001f\u007f-\u009f]/.test(value))return null;
    const title=value.trim(),points=Array.from(title);if(points.length<1||points.length>80||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return null;return title;
}
function wt27Accept(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).sort().join('|')!=='completed|title'||typeof raw.completed!=='boolean')return null;
    const title=wt27Text(raw.title);return title===null?null:{title,completed:raw.completed};
}
function wt27ValidStore(store){
    if(!store||!Array.isArray(store.tasks)||store.tasks.length>5||!Number.isInteger(store.nextID)||store.nextID<1||store.nextID>10)return false;
    const ids=new Set();for(let i=0;i<store.tasks.length;i++){if(!Object.prototype.hasOwnProperty.call(store.tasks,i))return false;const task=store.tasks[i];if(!task||Object.keys(task).sort().join('|')!=='completed|id|title|version'||!Number.isInteger(task.id)||task.id<1||task.id>9||task.id>=store.nextID||ids.has(task.id)||!Number.isSafeInteger(task.version)||task.version<1||wt27Text(task.title)!==task.title||typeof task.completed!=='boolean')return false;ids.add(task.id);}return true;
}
function wt27Handle(store,request){
    const trace=[];
    const respond=(status,body,extra={})=>{trace.push('Response '+status+'.');return {status,headers:{'Cache-Control':'no-store',...(status===204?{}:{'Content-Type':'application/json'}),...extra},body,trace};};
    const fail=(status,code,message,extra={})=>respond(status,{error:{code,message}},extra);
    if(!wt27ValidStore(store))return fail(500,'invalid_store','Internal mock store did not meet its contract.');
    const collection=request.path==='/api/tasks',match=typeof request.path==='string'?/^\/api\/tasks\/([1-9])$/.exec(request.path):null;
    if(!collection&&!match)return fail(404,'not_found','Unknown toy resource path.');
    trace.push(collection?'Route task collection.':'Route task item '+match[1]+'.');
    const allowed=collection?['GET','POST']:['GET','PUT','DELETE'];if(!allowed.includes(request.method))return fail(405,'method_not_allowed','Unsupported method for this route.',{Allow:allowed.join(', ')});
    const task=collection?null:store.tasks.find(item=>item.id===Number(match[1]));
    if(!collection&&!task)return fail(404,'not_found','Task does not exist.');
    if(request.method==='GET'){trace.push('Read copied public representation; no mutation.');return collection?respond(200,{items:store.tasks.slice().sort((a,b)=>a.id-b.id).map(wt27Public)}):respond(200,wt27Public(task),{ETag:wt27Tag(task)});}
    let accepted=null;
    if(request.method==='POST'||request.method==='PUT'){
        if(request.mediaType!=='application/json')return fail(415,'unsupported_media','This toy write requires exact application/json.');
        if(typeof request.body!=='string'||request.body.length>1000)return fail(400,'invalid_body','Raw JSON body must be a string of at most 1000 JavaScript code units.');
        let parsed;try{parsed=JSON.parse(request.body);}catch(error){return fail(400,'invalid_json','Body is not accepted JSON syntax.');}
        accepted=wt27Accept(parsed);if(!accepted)return fail(400,'invalid_fields','Require exactly title (1–80 Unicode code points, no controls/lone surrogates) and completed (boolean).');trace.push('Accepted complete title/completed representation.');
    }
    if(request.method==='POST'){
        if(store.tasks.length>=5||store.nextID>9)return fail(409,'store_limit','Mock task capacity or ID range exhausted.');
        const created={id:store.nextID,title:accepted.title,completed:accepted.completed,version:1};store.tasks.push(created);store.nextID++;trace.push('Create new mock resource; next ID advances once.');return respond(201,wt27Public(created),{Location:'/api/tasks/'+created.id,ETag:wt27Tag(created)});
    }
    if(request.ifMatch===undefined||request.ifMatch===null||request.ifMatch==='')return fail(428,'condition_required','Read the item and send its quoted ETag as If-Match.');
    if(typeof request.ifMatch!=='string'||!/^"task-[1-9]-v[1-9][0-9]*"$/.test(request.ifMatch))return fail(400,'invalid_condition','This toy API accepts one exact quoted task-version tag; no weak tags, lists or wildcard.');
    if(request.ifMatch!==wt27Tag(task))return fail(412,'stale_version','Read the task again before changing it.');trace.push('Accepted current mock representation condition.');
    if(request.method==='DELETE'){store.tasks=store.tasks.filter(item=>item.id!==task.id);trace.push('Delete mock task; no response content.');return respond(204,null);}
    if(task.title!==accepted.title||task.completed!==accepted.completed){if(task.version===Number.MAX_SAFE_INTEGER)return fail(409,'version_limit','Mock version counter exhausted.');task.title=accepted.title;task.completed=accepted.completed;task.version++;trace.push('Replace accepted fields; advance changed representation version.');}
    else trace.push('Same accepted representation; no state/version change.');
    trace.push('Normalized PUT returns no ETag; GET again for current validator.');return respond(200,wt27Public(task));
}
document.addEventListener('DOMContentLoaded',()=>{
    const byId=name=>document.getElementById('wt27'+name),method=byId('Method'),path=byId('Path'),type=byId('Type'),ifMatch=byId('IfMatch'),body=byId('Body');
    const state=byId('State'),input=byId('Request'),trace=byId('Trace'),response=byId('Response'),source=byId('Source'),preview=byId('Preview'),labStatus=byId('Status');let store=wt27Fresh();
    const refresh=()=>{state.textContent=JSON.stringify(store,null,2);};refresh();
    const render=result=>{
        preview.replaceChildren();const paragraph=text=>{const node=document.createElement('p');node.textContent=text;preview.append(node);};
        if(result.status===204){paragraph('Deleted. 204 has no response body; no JSON parsing required.');return;}
        if(result.body.error){paragraph(result.body.error.code+': '+result.body.error.message);return;}
        const items=result.body.items||[result.body];if(!items.length){paragraph('Task collection is empty.');return;}
        const list=document.createElement('ul');for(const task of items){const item=document.createElement('li');item.textContent=task.id+' · '+task.title+' · '+(task.completed?'Complete':'Pending');list.append(item);}preview.append(list);
    };
    byId('Process').addEventListener('click',()=>{
        const request={method:method.value,path:path.value,mediaType:type.value,ifMatch:ifMatch.value,body:body.value};input.textContent=JSON.stringify(request,null,2);const result=wt27Handle(store,request);refresh();trace.textContent=result.trace.join('\n');response.textContent=JSON.stringify({status:result.status,headers:result.headers},null,2);source.textContent=result.status===204?'No response body (204).':JSON.stringify(result.body,null,2);render(result);labStatus.textContent='Local model · '+result.status+' · '+(result.body?.error?result.body.error.code:result.status===204?'deleted':result.status===201?'created':'accepted')+'. No HTTP request sent.';
    });
    byId('Reset').addEventListener('click',()=>{
        store=wt27Fresh();method.value='GET';path.value='/api/tasks';type.value='application/json';ifMatch.value='"task-1-v1"';body.value='{"title":"Review HTTP methods","completed":false}';refresh();input.textContent='No request yet.';trace.textContent='No trace yet.';response.textContent='No response yet.';source.textContent='No response body yet.';preview.textContent='No result yet.';labStatus.textContent='Local task API reset. No server, database or account changed.';
    });
    const skip=document.querySelector('.wt27-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt27Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt27QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-27-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 27 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 27 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
