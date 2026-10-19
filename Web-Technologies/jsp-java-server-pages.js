// Fixed teaching model: no JSP/EL evaluation, Java, server requests or real sessions.
function wt24Text(value,min,max){
    if(typeof value!=='string'||/[\u0000-\u001f\u007f-\u009f]/.test(value))return null;
    const text=value.trim(),points=Array.from(text);
    if(points.length<min||points.length>max||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return null;
    return text;
}
function wt24AcceptModel(raw){
    const shape=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');
    if(!shape(raw,['learner','courses']))return null;
    const learner=wt24Text(raw.learner,2,40);if(learner===null||!Array.isArray(raw.courses)||raw.courses.length>8)return null;
    const courses=[];
    for(let i=0;i<raw.courses.length;i++){
        if(!Object.prototype.hasOwnProperty.call(raw.courses,i))return null;
        const row=raw.courses[i];if(!shape(row,['title','completed'])||typeof row.completed!=='boolean')return null;
        const title=wt24Text(row.title,1,80);if(title===null)return null;courses.push({title,completed:row.completed});
    }
    const completed=courses.filter(row=>row.completed).length;
    return {learner,courses,summary:{total:courses.length,completed,pending:courses.length-completed}};
}
function wt24RequestModel(kind,learner){
    if(kind==='missing')return null;
    if(kind==='empty')return {learner,courses:[]};
    if(kind==='invalid')return {learner,courses:[{title:'Incorrect boolean',completed:'true'}]};
    if(kind!=='normal')throw new Error('Unknown teaching fixture.');
    return {learner,courses:[{title:'Java Servlets',completed:true},{title:'JSP <Views>',completed:false},{title:'JDBC & SQL',completed:false}]};
}
function wt24ScopeFixtures(kind,learner,page,session){
    if(!['none','normal','invalid'].includes(page)||!['none','normal'].includes(session))throw new Error('Unknown teaching scope fixture.');
    return {
        page:page==='none'?null:{learner:'Page fixture',courses:[{title:'Page-only course',completed:page==='invalid'?'false':false}]},
        request:wt24RequestModel(kind,learner),
        session:session==='none'?null:{learner:'Session fixture',courses:[{title:'Session-only course',completed:true}]},
        application:{learner:'Application fixture',courses:[{title:'Application-only course',completed:false}]}
    };
}
function wt24Resolve(scopes,expression){
    // Only these two fixed expressions are modeled; this is not an EL interpreter.
    if(expression==='qualified')return {scope:scopes.request==null?null:'request',value:scopes.request??null};
    if(expression!=='unqualified')throw new Error('Unknown teaching expression.');
    for(const scope of ['page','request','session','application'])if(scopes[scope]!=null)return {scope,value:scopes[scope]};
    return {scope:null,value:null};
}
function wt24Escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function wt24HTML(model){
    const rows=model.courses.map(row=>'    <li>'+wt24Escape(row.title)+' — '+(row.completed?'Complete':'Pending')+'</li>').join('\n');
    return '<section class="study-report">\n  <h2>Study report</h2>\n  <p>Learner: '+wt24Escape(model.learner)+'</p>\n  <p>'+model.summary.total+' courses · '+model.summary.completed+' complete · '+model.summary.pending+' pending</p>\n'+(rows?'  <ul>\n'+rows+'\n  </ul>':'  <p>No courses in this report.</p>')+'\n</section>';
}
function wt24Template(expression){
    const name=expression==='unqualified'?'lessonReport':'requestScope.lessonReport';
    return '<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" session="'+(expression==='unqualified'?'true':'false')+'" %>\n<%@ taglib prefix="c" uri="jakarta.tags.core" %>\n<section class="study-report">\n  <h2>Study report</h2>\n  <p>Learner: <c:out value="${'+name+'.learner}" /></p>\n  <p>${'+name+'.summary.total} courses · ${'+name+'.summary.completed} complete · ${'+name+'.summary.pending} pending</p>\n  <c:choose>\n    <c:when test="${empty '+name+'.courses}">\n      <p>No courses in this report.</p>\n    </c:when>\n    <c:otherwise>\n      <ul>\n        <c:forEach var="course" items="${'+name+'.courses}">\n          <li><c:out value="${course.title}" /> —\n            <c:choose>\n              <c:when test="${course.completed}">Complete</c:when>\n              <c:otherwise>Pending</c:otherwise>\n            </c:choose>\n          </li>\n        </c:forEach>\n      </ul>\n    </c:otherwise>\n  </c:choose>\n</section>';
}
function wt24Handle(request){
    const trace=[];let scopes=null,scope=null;
    const fail=(status,message,extra={})=>({response:{status,headers:{'Content-Type':'application/json; charset=UTF-8',...extra},body:{message}},model:null,scopes,scope,trace:[...trace,'Reject '+status+': '+message]});
    if(request.path!=='/report')return fail(404,'Unknown toy route.');
    trace.push('Mapped /report.');
    if(request.method!=='GET')return fail(405,'This toy route accepts GET only.',{Allow:'GET'});
    const q=request.query;
    if(!q||typeof q!=='object'||Array.isArray(q)||Object.keys(q).length!==1||!Object.prototype.hasOwnProperty.call(q,'learner'))return fail(400,'Require exactly one learner query value.');
    const learner=wt24Text(q.learner,2,40);if(learner===null)return fail(400,'Learner must be a scalar string of 2–40 Unicode code points with no controls or lone surrogates.');
    trace.push('Accepted bounded learner input; prepare teaching scope fixtures.');
    try{
        scopes=wt24ScopeFixtures(request.fixture,learner,request.page,request.session);
        const selected=wt24Resolve(scopes,request.expression);scope=selected.scope;
        trace.push(request.expression==='qualified'?'Explicit request lookup; no fallback.':'Unqualified lookup: page → request → session → application.');
        trace.push(scope?'Selected '+scope+'-scope lessonReport.':'No model in the required scope.');
        if(selected.value===null)return fail(500,'Required report model is missing; no view rendered.');
        const model=wt24AcceptModel(selected.value);if(!model)return fail(500,'Selected report model failed its application contract; no fallback or view rendering.');
        trace.push('Copy accepted model and derive counts from rows.');
        trace.push(model.courses.length?'Render fixed list/labels with encoded text.':'Render accepted empty-state branch.');
        trace.push('Simulated 200 HTML. No JSP source was executed.');
        return {response:{status:200,headers:{'Content-Type':'text/html; charset=UTF-8'},body:wt24HTML(model)},model,scopes,scope,trace};
    }catch(error){return fail(500,'The fixed teaching model could not prepare a report.');}
}
document.addEventListener('DOMContentLoaded',()=>{
    const byId=name=>document.getElementById('wt24'+name),method=byId('Method'),path=byId('Path'),learner=byId('Learner'),variant=byId('Variant'),fixture=byId('Fixture'),expression=byId('Expression'),page=byId('Page'),session=byId('Session');
    const labStatus=byId('Status'),trace=byId('Trace'),scopes=byId('Scopes'),model=byId('Model'),template=byId('Template'),response=byId('Response'),source=byId('Source'),preview=byId('Preview');
    const render=result=>{
        preview.replaceChildren();const paragraph=text=>{const node=document.createElement('p');node.textContent=text;preview.append(node);};
        if(!result.model){paragraph(result.response.body.message);return;}
        const report=result.model,heading=document.createElement('h3');heading.textContent='Study report';preview.append(heading);paragraph('Learner: '+report.learner);paragraph(report.summary.total+' courses · '+report.summary.completed+' complete · '+report.summary.pending+' pending');
        if(!report.courses.length){paragraph('No courses in this report.');return;}
        const list=document.createElement('ul');for(const row of report.courses){const item=document.createElement('li');item.textContent=row.title+' — '+(row.completed?'Complete':'Pending');list.append(item);}preview.append(list);
    };
    const updateTemplate=()=>{template.textContent=wt24Template(expression.value);};expression.addEventListener('change',updateTemplate);updateTemplate();
    byId('Process').addEventListener('click',()=>{
        const query={learner:learner.value};if(variant.value==='missing')delete query.learner;else if(variant.value==='array')query.learner=[learner.value,learner.value];else if(variant.value==='extra')query.role='admin';else if(variant.value!=='normal')query.unknownVariant='invalid';
        const result=wt24Handle({method:method.value,path:path.value,query,fixture:fixture.value,expression:expression.value,page:page.value,session:session.value});
        trace.textContent=result.trace.join('\n');scopes.textContent=result.scopes?JSON.stringify(result.scopes,null,2):'No scope lookup: request rejected first.';model.textContent=result.model?JSON.stringify(result.model,null,2):'No accepted model.';updateTemplate();response.textContent=JSON.stringify({status:result.response.status,headers:result.response.headers,resolvedScope:result.scope},null,2);source.textContent=typeof result.response.body==='string'?result.response.body:JSON.stringify(result.response.body,null,2);render(result);
        labStatus.textContent='Local model · '+result.response.status+' · '+(result.model?'Selected '+result.scope+' report; '+result.model.summary.total+' courses.':result.response.body.message)+' Java/JSP did not run.';
    });
    byId('Reset').addEventListener('click',()=>{
        method.value='GET';path.value='/report';learner.value='Demo learner';variant.value='normal';fixture.value='normal';expression.value='qualified';page.value='none';session.value='normal';updateTemplate();trace.textContent='No trace yet.';scopes.textContent='No scope lookup yet.';model.textContent='No accepted model.';response.textContent='No response yet.';source.textContent='No response body yet.';preview.textContent='No preview yet.';labStatus.textContent='Local demonstration reset. No server or real session was changed.';
    });
    const skip=document.querySelector('.wt24-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt24Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt24QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-24-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 24 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 24 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
