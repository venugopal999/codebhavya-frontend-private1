// In-memory teaching model only. No Java, JDBC driver, SQL engine or network access.
function wt25Fresh(){return {A:12,B:4};}
function wt25Validate(form){
    if(!form||typeof form!=='object'||Array.isArray(form)||Object.keys(form).sort().join('|')!=='amount|from|to')return null;
    if(typeof form.from!=='string'||typeof form.to!=='string'||!['A','B'].includes(form.from)||!['A','B'].includes(form.to)||form.from===form.to||typeof form.amount!=='string'||! /^[1-9]$/.test(form.amount))return null;
    return {from:form.from,to:form.to,amount:Number(form.amount)};
}
function wt25ValidDB(db){return db&&typeof db==='object'&&!Array.isArray(db)&&Object.keys(db).sort().join('|')==='A|B'&&['A','B'].every(id=>Number.isInteger(db[id])&&db[id]>=0&&db[id]<=16)&&db.A+db.B<=16;}
function wt25Bindings(values){return [
    {sql:'UPDATE practice_tokens SET tokens = tokens - ? WHERE learner_id = ? AND tokens >= ?',parameters:[{index:1,type:'int',value:values.amount},{index:2,type:'string',value:values.from},{index:3,type:'int',value:values.amount}]},
    {sql:'UPDATE practice_tokens SET tokens = tokens + ? WHERE learner_id = ?',parameters:[{index:1,type:'int',value:values.amount},{index:2,type:'string',value:values.to}]}
];}
function wt25Run(db,request){
    const trace=[],resources={connectionsOpened:0,connectionsClosed:0,statementsOpened:0,statementsClosed:0},affected={debit:null,credit:null};
    const before=wt25ValidDB(db)?{...db}:null;let working=before?{...before}:null,bindings=null;
    const finish=(status,outcome,message,extra={})=>({response:{status,headers:{'Content-Type':'application/json; charset=UTF-8',...extra},body:{outcome,message}},before,working:working?{...working}:null,after:before?{...db}:null,bindings,affected,resources,trace});
    if(!before){trace.push('Reject invalid internal fixture before resources.');return finish(500,'rejected','Internal mock token fixture is invalid.');}
    if(request.path!=='/transfer'){trace.push('No mapped route.');return finish(404,'rejected','Unknown toy route.');}
    if(request.method!=='POST'){trace.push('Reject method before resources.');return finish(405,'rejected','This toy route accepts POST only.',{Allow:'POST'});}
    const values=wt25Validate(request.form);
    if(!values){trace.push('Reject submission shape/values before connection acquisition.');return finish(400,'rejected','Use exactly from/to (distinct A/B) and amount (one digit 1–9), each a scalar string.');}
    if(!['manual','auto'].includes(request.mode)||!['none','creditError','creditZero','offline'].includes(request.failure)){trace.push('Reject unsupported teaching configuration.');return finish(400,'rejected','Choose a known transaction mode and fixture.');}
    bindings=wt25Bindings(values);trace.push('Accepted values; fixed SQL structure with separate typed bindings.');
    if(request.failure==='offline'){trace.push('Unavailable fixture; no connection acquired.');return finish(503,'unavailable','Mock database unavailable; no tokens changed.');}
    const owned=[];
    const open=name=>{owned.push(name);if(name==='connection')resources.connectionsOpened++;else resources.statementsOpened++;trace.push('Open mock '+name+'.');};
    try{
        open('connection');trace.push(request.mode==='manual'?'Begin manual transaction; changes stay in working copy.':'Auto-commit: each accepted statement publishes independently.');
        open('debit statement');
        if(working[values.from]<values.amount){affected.debit=0;trace.push('Debit affected 0 rows; do not execute credit.');if(request.mode==='manual')trace.push('Rollback empty staged operation.');return finish(409,'not-accepted','Insufficient source tokens; no credit executed.');}
        working[values.from]-=values.amount;affected.debit=1;trace.push('Debit affected 1 row.');
        if(request.mode==='auto'){db[values.from]=working[values.from];trace.push('Debit auto-committed; it cannot be rolled back by a later failure.');}
        open('credit statement');
        if(request.failure==='creditError'||request.failure==='creditZero'){
            affected.credit=request.failure==='creditZero'?0:null;trace.push(request.failure==='creditZero'?'Credit affected 0 rows; contract rejected.':'Known credit execution failure before applying credit.');
            if(request.mode==='manual'){trace.push('Rollback staged debit; committed snapshot unchanged.');return finish(500,'rolled-back','Known credit failure; manual transaction rolled back.');}
            trace.push('Partial operation: already committed debit remains.');return finish(500,'partial','Known credit failure; earlier auto-committed debit remains.');
        }
        working[values.to]+=values.amount;affected.credit=1;trace.push('Credit affected 1 row.');
        if(request.mode==='manual'){db.A=working.A;db.B=working.B;trace.push('Commit both staged updates together.');}
        else {db[values.to]=working[values.to];trace.push('Credit auto-committed separately.');}
        return finish(200,'committed','Paired transfer completed; operation token total preserved.');
    }finally{
        for(const name of owned.reverse()){if(name==='connection')resources.connectionsClosed++;else resources.statementsClosed++;trace.push('Close mock '+name+'.');}
    }
}
document.addEventListener('DOMContentLoaded',()=>{
    const byId=name=>document.getElementById('wt25'+name),method=byId('Method'),path=byId('Path'),from=byId('From'),to=byId('To'),amount=byId('Amount'),mode=byId('Mode'),failure=byId('Failure'),variant=byId('Variant');
    const balances=byId('Balances'),bindings=byId('Bindings'),trace=byId('Trace'),snapshots=byId('Snapshots'),resources=byId('Resources'),response=byId('Response'),preview=byId('Preview'),labStatus=byId('Status');let db=wt25Fresh();
    const refresh=()=>{balances.textContent=JSON.stringify({tokens:{...db},total:db.A+db.B},null,2);};refresh();
    byId('Process').addEventListener('click',()=>{
        const form={from:from.value,to:to.value,amount:amount.value};if(variant.value==='missing')delete form.amount;else if(variant.value==='array')form.amount=[amount.value,amount.value];else if(variant.value==='extra')form.role='admin';else if(variant.value!=='normal')form.unknownVariant='invalid';
        const result=wt25Run(db,{method:method.value,path:path.value,form,mode:mode.value,failure:failure.value});
        refresh();bindings.textContent=result.bindings?JSON.stringify(result.bindings,null,2):'No accepted bindings.';trace.textContent=result.trace.join('\n');snapshots.textContent=JSON.stringify({before:result.before,attemptedWorking:result.working,committedAfter:result.after},null,2);resources.textContent=JSON.stringify({mockResources:result.resources,affectedRows:result.affected},null,2);response.textContent=JSON.stringify(result.response,null,2);
        preview.replaceChildren();const paragraph=document.createElement('p');paragraph.textContent=result.response.body.message;preview.append(paragraph);const state=document.createElement('p');state.textContent='Committed mock tokens: A '+db.A+' · B '+db.B+' · total '+(db.A+db.B)+'.';preview.append(state);
        labStatus.textContent='JavaScript model · '+result.response.status+' · '+result.response.body.outcome+'. No JDBC or database executed.';
    });
    byId('Reset').addEventListener('click',()=>{
        db=wt25Fresh();method.value='POST';path.value='/transfer';from.value='A';to.value='B';amount.value='3';mode.value='manual';failure.value='none';variant.value='normal';refresh();bindings.textContent='No accepted bindings yet.';trace.textContent='No operation yet.';snapshots.textContent='No transfer attempted.';resources.textContent='No resources opened.';response.textContent='No response yet.';preview.textContent='No result yet.';labStatus.textContent='Mock tokens and demonstration reset. No real database was changed.';
    });
    const skip=document.querySelector('.wt25-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt25Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt25QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-25-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 25 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 25 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
