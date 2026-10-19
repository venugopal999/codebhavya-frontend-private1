// Fixed relational teaching model, not a general SQL parser or database connection.
function wt26Fixture(kind){
    if(kind==='empty')return {learners:[],courses:[],enrollments:[]};
    if(!['normal','invalid'].includes(kind))throw new Error('Unknown fixture.');
    const data={learners:[{learner_id:1,name:'Asha'},{learner_id:2,name:'Ravi'},{learner_id:3,name:'Mina'}],courses:[{course_id:101,title:'HTML'},{course_id:102,title:'JSP <Views>'},{course_id:103,title:'SQL & Data'}],enrollments:[{learner_id:1,course_id:101,status:'completed',grade:88},{learner_id:1,course_id:102,status:'active',grade:null},{learner_id:2,course_id:101,status:'completed',grade:72}]};
    if(kind==='invalid')data.enrollments[0].course_id=999;return data;
}
function wt26Text(value,min,max){
    if(typeof value!=='string'||/[\u0000-\u001f\u007f-\u009f]/.test(value))return null;
    const text=value.trim(),points=Array.from(text);if(points.length<min||points.length>max||points.some(c=>{const n=c.codePointAt(0);return n>=0xd800&&n<=0xdfff;}))return null;return text;
}
function wt26AcceptTables(raw){
    const shape=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');
    const dense=(a,max)=>Array.isArray(a)&&a.length<=max&&Array.from({length:a.length},(_,i)=>Object.prototype.hasOwnProperty.call(a,i)).every(Boolean);
    const id=v=>Number.isInteger(v)&&v>0&&v<=999;
    if(!shape(raw,['learners','courses','enrollments'])||!dense(raw.learners,8)||!dense(raw.courses,8)||!dense(raw.enrollments,32))return null;
    const data={learners:[],courses:[],enrollments:[]},learnerIDs=new Set(),courseIDs=new Set(),pairs=new Set();
    for(const row of raw.learners){if(!shape(row,['learner_id','name'])||!id(row.learner_id)||learnerIDs.has(row.learner_id))return null;const name=wt26Text(row.name,2,40);if(name===null)return null;learnerIDs.add(row.learner_id);data.learners.push({learner_id:row.learner_id,name});}
    for(const row of raw.courses){if(!shape(row,['course_id','title'])||!id(row.course_id)||courseIDs.has(row.course_id))return null;const title=wt26Text(row.title,1,80);if(title===null)return null;courseIDs.add(row.course_id);data.courses.push({course_id:row.course_id,title});}
    for(const row of raw.enrollments){
        if(!shape(row,['learner_id','course_id','status','grade'])||!learnerIDs.has(row.learner_id)||!courseIDs.has(row.course_id)||!['active','completed'].includes(row.status)||(row.grade!==null&&(!Number.isInteger(row.grade)||row.grade<0||row.grade>100)))return null;
        const pair=row.learner_id+':'+row.course_id;if(pairs.has(pair))return null;pairs.add(pair);data.enrollments.push({...row});
    }return data;
}
function wt26Validate(query){
    if(!query||typeof query!=='object'||Array.isArray(query)||Object.keys(query).sort().join('|')!=='count|join|limit|min|placement|status')return null;
    if(!Object.values(query).every(v=>typeof v==='string')||!['left','inner'].includes(query.join)||!['all','active','completed'].includes(query.status)||!['on','where'].includes(query.placement)||!['enrollments','rows'].includes(query.count)||!/^[0-3]$/.test(query.min)||!/^[1-3]$/.test(query.limit))return null;
    return {...query,min:Number(query.min),limit:Number(query.limit)};
}
function wt26SQL(options){
    const count=options.count==='rows'?'COUNT(*)':'COUNT(e.learner_id)',parameters=[];
    let sql='SELECT c.course_id, c.title, '+count+' AS selected_count,\n       AVG(e.grade) AS average_grade\nFROM courses c\n'+(options.join==='left'?'LEFT JOIN':'INNER JOIN')+' enrollments e ON e.course_id = c.course_id';
    if(options.status!=='all'){sql+=options.placement==='on'?' AND e.status = ?':'\nWHERE e.status = ?';parameters.push(options.status);}
    sql+='\nGROUP BY c.course_id, c.title\nHAVING '+count+' >= ?\nORDER BY c.course_id\nLIMIT ?';parameters.push(options.min,options.limit);return {sql,parameters};
}
function wt26Report(data,options){
    const joined=[];
    for(const course of data.courses){
        const matches=data.enrollments.filter(e=>e.course_id===course.course_id&&(options.status==='all'||options.placement!=='on'||e.status===options.status));
        for(const e of matches)joined.push({course_id:course.course_id,title:course.title,learner_id:e.learner_id,status:e.status,grade:e.grade});
        if(!matches.length&&options.join==='left')joined.push({course_id:course.course_id,title:course.title,learner_id:null,status:null,grade:null});
    }
    const filtered=options.status!=='all'&&options.placement==='where'?joined.filter(row=>row.status===options.status):joined;
    const groups=new Map();for(const row of filtered){if(!groups.has(row.course_id))groups.set(row.course_id,[]);groups.get(row.course_id).push(row);}
    const rows=[];
    for(const group of groups.values()){
        const selected_count=options.count==='rows'?group.length:group.filter(row=>row.learner_id!==null).length,grades=group.filter(row=>row.grade!==null).map(row=>row.grade);
        if(selected_count>=options.min)rows.push({course_id:group[0].course_id,title:group[0].title,selected_count,average_grade:grades.length?grades.reduce((sum,n)=>sum+n,0)/grades.length:null});
    }
    rows.sort((a,b)=>a.course_id-b.course_id);
    return {joined:filtered,rows:rows.slice(0,options.limit),trace:['Join produced '+joined.length+' rows before WHERE.','WHERE retained '+filtered.length+' rows.','Group by course ID/title; '+groups.size+' groups.','HAVING retained '+rows.length+' groups using '+options.count+' count.','Order by course ID, then limit '+options.limit+'.']};
}
function wt26Handle(request){
    const fail=(status,message,extra={})=>({response:{status,headers:{'Content-Type':'application/json; charset=UTF-8',...extra},body:{message}},tables:null,plan:null,joined:null,rows:null,trace:[message]});
    if(request.path!=='/course-report')return fail(404,'Unknown toy route.');if(request.method!=='GET')return fail(405,'This toy report accepts GET only.',{Allow:'GET'});
    const options=wt26Validate(request.query);if(!options)return fail(400,'Require six scalar query values with accepted enums and canonical min/limit digits.');
    try{
        const tables=wt26AcceptTables(wt26Fixture(request.fixture));if(!tables)return fail(500,'Local fixture failed its key, reference or value contract.');
        const plan=wt26SQL(options),report=wt26Report(tables,options);return {response:{status:200,headers:{'Content-Type':'application/json; charset=UTF-8'},body:{rows:report.rows}},tables,plan,...report};
    }catch(error){return fail(500,'The fixed local report could not be prepared.');}
}
document.addEventListener('DOMContentLoaded',()=>{
    const byId=name=>document.getElementById('wt26'+name),method=byId('Method'),path=byId('Path'),join=byId('Join'),statusFilter=byId('StatusFilter'),placement=byId('Placement'),count=byId('Count'),minimum=byId('Min'),limit=byId('Limit'),fixture=byId('Fixture'),variant=byId('Variant');
    const tables=byId('Tables'),sql=byId('SQL'),joined=byId('Joined'),trace=byId('Trace'),model=byId('Model'),response=byId('Response'),preview=byId('Preview'),labStatus=byId('Status');tables.textContent=JSON.stringify(wt26Fixture('normal'),null,2);
    const render=result=>{
        preview.replaceChildren();const paragraph=text=>{const node=document.createElement('p');node.textContent=text;preview.append(node);};
        if(!result.rows){paragraph(result.response.body.message);return;}if(!result.rows.length){paragraph('No course groups match this report.');return;}
        paragraph(count.value==='rows'?'Selected count is joined-row count, including unmatched placeholders.':'Selected count is actual matched enrollments.');
        const list=document.createElement('ul');for(const row of result.rows){const item=document.createElement('li');item.textContent=row.course_id+' · '+row.title+' · count '+row.selected_count+' · average '+(row.average_grade===null?'No graded value (NULL)':row.average_grade);list.append(item);}preview.append(list);
    };
    byId('Process').addEventListener('click',()=>{
        const query={join:join.value,status:statusFilter.value,placement:placement.value,count:count.value,min:minimum.value,limit:limit.value};if(variant.value==='missing')delete query.limit;else if(variant.value==='array')query.status=[statusFilter.value,statusFilter.value];else if(variant.value==='extra')query.role='admin';else if(variant.value!=='normal')query.unknownVariant='invalid';
        const result=wt26Handle({method:method.value,path:path.value,query,fixture:fixture.value});tables.textContent=result.tables?JSON.stringify(result.tables,null,2):'No accepted tables.';sql.textContent=result.plan?JSON.stringify(result.plan,null,2):'No accepted query.';joined.textContent=result.joined?JSON.stringify(result.joined,null,2):'No accepted joined rows.';trace.textContent=result.trace.join('\n');model.textContent=result.rows?JSON.stringify(result.rows,null,2):'No accepted report.';response.textContent=JSON.stringify(result.response,null,2);render(result);labStatus.textContent='Local model · '+result.response.status+' · '+(result.rows?result.rows.length+' report groups.':result.response.body.message)+' No database query executed in this page.';
    });
    byId('Reset').addEventListener('click',()=>{
        method.value='GET';path.value='/course-report';join.value='left';statusFilter.value='all';placement.value='on';count.value='enrollments';minimum.value='0';limit.value='3';fixture.value='normal';variant.value='normal';tables.textContent=JSON.stringify(wt26Fixture('normal'),null,2);sql.textContent='No accepted query yet.';joined.textContent='No joined rows yet.';trace.textContent='No trace yet.';model.textContent='No accepted report.';response.textContent='No response yet.';preview.textContent='No report yet.';labStatus.textContent='Local model reset. No database or server was changed.';
    });
    const skip=document.querySelector('.wt26-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt26Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt26QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-26-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 26 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 26 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
