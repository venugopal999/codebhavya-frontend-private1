"use strict";
function wt22ValidateQuery(query) {
    const fail=message=>{const error=new Error(message);error.name='CatalogInputError';throw error;};
    if(!query||typeof query!=='object'||Array.isArray(query)||Object.keys(query).sort().join(',')!=='available,category,limit,view')fail('Expected exactly category, available, limit and view.');
    if(['category','available','limit','view'].some(key=>typeof query[key]!=='string'))fail('Each query parameter must be one scalar string.');
    if(!['all','web','backend'].includes(query.category))fail('Category must be all, web or backend.');
    if(!['true','false'].includes(query.available))fail('Available must be exactly true or false.');
    if(!['1','2','3'].includes(query.limit))fail('Limit must be exactly 1, 2 or 3.');
    if(!['jsp','json'].includes(query.view))fail('View must be jsp or json.');
    return {category:query.category,availableOnly:query.available==='true',limit:Number(query.limit),view:query.view};
}
function wt22ValidateRows(rows) {
    const fail=()=>{const error=new Error('Repository rows do not meet the catalog model contract.');error.name='CatalogModelError';throw error;};
    if(!Array.isArray(rows)||rows.length>10)fail();
    const accepted=[],ids=new Set();
    for(let i=0;i<rows.length;i++){
        if(!Object.prototype.hasOwnProperty.call(rows,i))fail();
        const row=rows[i];
        if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).sort().join(',')!=='available,category,id,title'||typeof row.id!=='string'||typeof row.title!=='string')fail();
        const id=row.id.trim(),title=row.title.trim();
        if(!id||id.length>20||ids.has(id)||!title||title.length>80||/[\x00-\x1F\x7F]/.test(title)||Array.from(title).some(c=>{const cp=c.codePointAt(0);return cp>=0xD800&&cp<=0xDFFF;})||!['web','backend'].includes(row.category)||!Number.isInteger(row.available)||row.available<0||row.available>1000)fail();
        ids.add(id);accepted.push({id,title,category:row.category,available:row.available});
    }
    return accepted;
}
function wt22EscapeHTML(text) {
    const entities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
    return text.replace(/[&<>"']/g,char=>entities[char]);
}
function wt22CatalogHTML(courses) {
    if(!courses.length)return '<h2>Course catalog</h2><p>No courses match these filters.</p>';
    return '<h2>Course catalog</h2><ul>'+courses.map(c=>'<li>'+wt22EscapeHTML(c.title)+' — '+c.available+' places</li>').join('')+'</ul>';
}
function wt22HandleRequest(request,repository) {
    const trace=[];
    const record=(stage,outcome,detail)=>trace.push({stage,outcome,detail});
    const fail=(status,message,headers={})=>{
        record('response',String(status),message);
        return {response:{status,headers:{'Content-Type':'application/json',...headers},body:{message}},model:null,trace};
    };
    record('mapping','inspect',request.method+' '+request.path);
    if(request.path!=='/catalog')return fail(404,'No mapped catalog route for this path.');
    if(request.method!=='GET')return fail(405,'The simulated catalog route supports GET only.',{Allow:'GET'});
    let filters;
    try{filters=wt22ValidateQuery(request.query);record('controller','accept','Unique scalar query contract accepted; limit and availability normalized.');}
    catch(error){record('controller','reject',error.message);return fail(400,error.message);}
    record('service','start','Coordinate a catalog read using accepted filters.');
    let courses;
    try{
        record('repository','read','Invoke the mock data-access boundary once.');
        const rows=repository({...filters});
        courses=wt22ValidateRows(rows);
        record('model','accept',courses.length+' repository records passed the catalog contract.');
    }catch(error){
        if(error&&error.name==='RepositoryUnavailable'){record('repository','reject','Mock repository unavailable.');return fail(503,'Catalog data is temporarily unavailable in this simulation.');}
        record('model','reject','Repository output or operation did not produce an accepted catalog model.');
        return fail(500,'No accepted catalog model was produced.');
    }
    courses=courses.filter(c=>(filters.category==='all'||c.category===filters.category)&&(!filters.availableOnly||c.available>0)).slice(0,filters.limit);
    record('service','accept','Filter by category and availability before limiting; '+courses.length+' courses selected.');
    const model={filters:{category:filters.category,availableOnly:filters.availableOnly,limit:filters.limit},courses};
    const headers={'Content-Type':filters.view==='jsp'?'text/html; charset=UTF-8':'application/json'};
    let body;
    if(filters.view==='jsp'){
        record('view','forward','Simulated request attribute catalog and internal forward to /WEB-INF/views/catalog.jsp.');body=wt22CatalogHTML(courses);
    }else{record('view','serialize','Serialize the accepted model as JSON without a JSP forward.');body=model;}
    record('response','200',courses.length?'Accepted catalog representation.':'Accepted empty catalog representation.');
    return {response:{status:200,headers,body},model,trace};
}
function wt22MockRows(outcome) {
    if(outcome==='offline'){const error=new Error('Mock offline fixture.');error.name='RepositoryUnavailable';throw error;}
    if(outcome==='empty')return [];
    if(outcome==='invalid')return [{id:'course-1',title:'Wrong availability type',category:'backend',available:'8'}];
    if(outcome!=='normal')throw new Error('Unknown mock repository outcome.');
    return [{id:'course-1',title:'HTML & CSS',category:'web',available:12},{id:'course-2',title:'Java Servlets',category:'backend',available:8},{id:'course-3',title:'JSP <Views>',category:'backend',available:0}];
}
document.addEventListener('DOMContentLoaded', () => {
    const byId=id=>document.getElementById('wt22'+id);
    const method=byId('Method'),path=byId('Path'),category=byId('Category'),available=byId('Available'),limit=byId('Limit'),view=byId('View'),variant=byId('Variant'),outcome=byId('Repository');
    const input=byId('Input'),trace=byId('Trace'),modelNode=byId('Model'),responseNode=byId('Response'),source=byId('Source'),preview=byId('Preview'),status=byId('Status'),calls=byId('Calls');
    let repositoryCalls=0;
    const paragraph=text=>{const node=document.createElement('p');node.textContent=text;preview.append(node);};
    const render=result=>{
        preview.replaceChildren();
        if(!result.model){paragraph(result.response.body.message);return;}
        if(result.response.headers['Content-Type']==='application/json'){
            paragraph('JSON representation. Inspect the accepted model and response body source.');
            if(!result.model.courses.length)paragraph('No courses match these filters.');return;
        }
        const heading=document.createElement('h3');heading.textContent='Course catalog';preview.append(heading);
        if(!result.model.courses.length){paragraph('No courses match these filters.');return;}
        const list=document.createElement('ul');
        for(const c of result.model.courses){const item=document.createElement('li');item.textContent=c.title+' — '+c.available+' places';list.append(item);}
        preview.append(list);
    };
    byId('Process').addEventListener('click',()=>{
        const query={category:category.value,available:available.value,limit:limit.value,view:view.value};
        if(variant.value==='missing')delete query.limit;
        else if(variant.value==='array')query.category=[category.value,category.value];
        else if(variant.value==='extra')query.role='admin';
        else if(variant.value!=='normal')query.unknownVariant='invalid';
        const request={method:method.value,path:path.value,query};input.textContent=JSON.stringify(request,null,2);
        const chosenOutcome=outcome.value;
        const result=wt22HandleRequest(request,()=>{repositoryCalls++;return wt22MockRows(chosenOutcome);});
        calls.textContent='Mock repository calls: '+repositoryCalls;
        trace.textContent=JSON.stringify(result.trace,null,2);modelNode.textContent=result.model?JSON.stringify(result.model,null,2):'No accepted model.';
        responseNode.textContent=JSON.stringify({status:result.response.status,headers:result.response.headers},null,2);
        source.textContent=typeof result.response.body==='string'?result.response.body:JSON.stringify(result.response.body,null,2);render(result);
        responseNode.dataset.state=result.model?(result.model.courses.length?'success':'empty'):'rejected';
        status.textContent='JavaScript layers demonstration · '+result.response.status+' · '+(result.model?result.model.courses.length+' accepted courses.':result.response.body.message)+' Java, JSP and JDBC were not executed.';
    });
    byId('Reset').addEventListener('click',()=>{
        method.value='GET';path.value='/catalog';category.value='all';available.value='false';limit.value='3';view.value='jsp';variant.value='normal';outcome.value='normal';repositoryCalls=0;
        calls.textContent='Mock repository calls: 0';input.textContent='No request processed.';trace.textContent='No trace yet.';modelNode.textContent='No accepted model.';responseNode.textContent='No response yet.';source.textContent='No response body yet.';responseNode.dataset.state='idle';preview.replaceChildren();paragraph('No preview yet.');
        status.textContent='Demonstration reset. JavaScript model; no Java web runtime or database was changed.';
    });
    responseNode.dataset.state='idle';
    const skip=document.querySelector('.wt22-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt22Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt22QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-22-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 22 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 22 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
