"use strict";
function wt21PHPTrim(text) {
    // PHP trim's default ASCII character set; not JavaScript's broader trim.
    return text.replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g,'');
}
function wt21EscapeHTML(text) {
    const entities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return text.replace(/[&<>"']/g,char=>entities[char]);
}
function wt21ProcessPlan(post,method,mediaType) {
    const trace=[];
    const record=(stage,outcome,detail)=>trace.push({stage,outcome,detail});
    const reply=(status,body,extraHeaders={})=>{
        record('response',String(status),body.message);
        return {response:{status,headers:{'Content-Type':'text/html; charset=UTF-8',...extraHeaders},body},trace};
    };
    record('method','inspect',method);
    if(method==='GET')return reply(200,{message:'Form ready. Submit a fictional study plan.'});
    if(method!=='POST')return reply(405,{message:'Only GET and POST are supported.'},{Allow:'GET, POST'});
    const media=typeof mediaType==='string'?wt21PHPTrim(mediaType.split(';')[0]).toLowerCase():'';
    if(media!=='application/x-www-form-urlencoded'){record('media','reject','This form processor expects URL-encoded input.');return reply(415,{message:'This example accepts URL-encoded form data.'});}
    record('media','accept','Simulated decoded form values, not a raw-body parser.');
    if(!post||typeof post!=='object'||Array.isArray(post)||Object.keys(post).sort().join(',')!=='course,days,learner'){
        record('shape','reject','Missing or extra fields.');return reply(400,{message:'Expected exactly learner, course and days.'});
    }
    if(['learner','course','days'].some(key=>typeof post[key]!=='string')){
        record('types','reject','All three fields must be strings.');return reply(400,{message:'Each submitted field must be a string.'});
    }
    record('types','accept','Three scalar strings accepted.');
    const learner=wt21PHPTrim(post.learner),points=Array.from(learner),errors=[];
    const invalidUnicode=points.some(char=>{const cp=char.codePointAt(0);return cp>=0xD800&&cp<=0xDFFF;});
    if(points.length<2||points.length>40||invalidUnicode||/[\x00-\x1F\x7F]/.test(learner))errors.push('Learner must contain 2-40 Unicode code points after trim, with no ASCII control characters.');
    const courses={html:{title:'HTML',unitPaise:12550},css:{title:'CSS',unitPaise:15000},php:{title:'PHP',unitPaise:18000}};
    if(!Object.prototype.hasOwnProperty.call(courses,post.course))errors.push('Course must be html, css or php.');
    if(!/^[1-5]$/.test(post.days)||post.days.length!==1)errors.push('Days must be exactly one digit from 1 to 5.');
    if(errors.length){record('validation','reject',errors.join(' '));return reply(400,{message:'Form validation failed.',errors});}
    record('validation','accept','Label, course and exact one-digit days accepted.');
    const days=Number(post.days),course=courses[post.course],totalPaise=course.unitPaise*days;
    const totalINR=String(Math.floor(totalPaise/100))+'.'+String(totalPaise%100).padStart(2,'0');
    const accepted={learner,course:course.title,days,unitPaise:course.unitPaise,totalPaise,totalINR};
    record('normalize','accept','Accepted days string converted to integer '+days+'.');
    record('calculate','accept',course.unitPaise+' paise × '+days+' = '+totalPaise+' paise.');
    return reply(200,{message:'Study quote calculated; nothing was booked or saved.',accepted});
}
function wt21PlanHTML(response) {
    const body=response.body;
    if(!body.accepted)return '<p>'+wt21EscapeHTML(body.message)+'</p>'+(body.errors||[]).map(error=>'<p>'+wt21EscapeHTML(error)+'</p>').join('');
    const plan=body.accepted;
    return '<h2>Study quote</h2><p>Learner: '+wt21EscapeHTML(plan.learner)+'</p><p>Course: '+wt21EscapeHTML(plan.course)+'</p><p>Days: '+plan.days+'</p><p>Total: INR '+wt21EscapeHTML(plan.totalINR)+'</p>';
}
document.addEventListener('DOMContentLoaded', () => {
    const byId=id=>document.getElementById('wt21'+id);
    const method=byId('Method'),type=byId('Type'),learner=byId('Learner'),course=byId('Course'),days=byId('Days'),variant=byId('Variant');
    const inputNode=byId('Input'),traceNode=byId('Trace'),resultNode=byId('Result'),htmlNode=byId('HTML'),preview=byId('Preview'),status=byId('Status');
    const paragraph=text=>{const node=document.createElement('p');node.textContent=text;preview.append(node);};
    const render=response=>{
        preview.replaceChildren();
        const body=response.body;
        if(!body.accepted){paragraph(body.message);for(const error of body.errors||[])paragraph(error);return;}
        const plan=body.accepted,title=document.createElement('h3');title.textContent='Study quote';preview.append(title);
        paragraph('Learner: '+plan.learner);paragraph('Course: '+plan.course);paragraph('Days: '+plan.days);paragraph('Total: INR '+plan.totalINR);
    };
    byId('Process').addEventListener('click',()=>{
        let post={learner:learner.value,course:course.value,days:days.value};
        if(variant.value==='missing')delete post.days;
        else if(variant.value==='array')post.days=[days.value];
        else if(variant.value==='extra')post.price='1';
        else if(variant.value!=='normal')post.unrecognizedVariant='invalid';
        if(method.value!=='POST')post={};
        inputNode.textContent=JSON.stringify({method:method.value,mediaType:method.value==='POST'?type.value:null,post},null,2);
        const result=wt21ProcessPlan(post,method.value,type.value);
        traceNode.textContent=JSON.stringify(result.trace,null,2);resultNode.textContent=JSON.stringify(result.response,null,2);
        htmlNode.textContent=wt21PlanHTML(result.response);render(result.response);
        resultNode.dataset.state=result.response.status<400?'success':'rejected';
        status.textContent='JavaScript demonstration · '+result.response.status+' · '+result.response.body.message+' PHP was not executed; no submitted data was saved.';
    });
    byId('Reset').addEventListener('click',()=>{
        method.value='POST';type.value='application/x-www-form-urlencoded';learner.value='Ada';course.value='html';days.value='2';variant.value='normal';
        inputNode.textContent='No input processed.';traceNode.textContent='No trace yet.';resultNode.textContent='No result yet.';htmlNode.textContent='No generated source yet.';preview.replaceChildren();paragraph('No preview yet.');resultNode.dataset.state='idle';
        status.textContent='Demonstration reset. JavaScript model; PHP is not running in this page.';
    });
    resultNode.dataset.state='idle';
    const skip=document.querySelector('.wt21-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt21Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt21QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-21-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 21 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 21 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
