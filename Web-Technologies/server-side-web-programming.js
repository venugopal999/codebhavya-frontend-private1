"use strict";
function wt20CreateState() {
    return {workshops:[{id:'html',title:'HTML Forms',remaining:3},{id:'css',title:'CSS Layout',remaining:2},{id:'javascript',title:'JavaScript Events',remaining:0}],bookings:[],nextId:1};
}
function wt20ValidateBooking(record) {
    const fail=message=>{const error=new Error(message);error.name='BookingValidationError';throw error;};
    if(!record||typeof record!=='object'||Array.isArray(record)||Object.keys(record).sort().join(',')!=='seats,workshopId')fail('Expected exactly workshopId and seats in a booking object.');
    if(!['html','css','javascript'].includes(record.workshopId))fail('Workshop must be html, css or javascript.');
    if(!Number.isInteger(record.seats)||record.seats<1||record.seats>3)fail('Seats must be a numeric integer from 1 to 3.');
    return {workshopId:record.workshopId,seats:record.seats};
}
function wt20HandleRequest(request,state,fault='normal') {
    const trace=[];
    const record=(stage,outcome,detail)=>trace.push({stage,outcome,detail});
    const reply=(status,body,headers={})=>{
        record('response',String(status),body.message||'JSON result returned.');
        return {response:{status,headers:{'Content-Type':'application/json',...headers},body},trace};
    };
    const routes={'/workshops':['GET'],'/profile':['GET'],'/bookings':['GET','POST'],'/admin/report':['GET']};
    record('route','inspect',request.method+' '+request.path);
    if(!Object.prototype.hasOwnProperty.call(routes,request.path)){record('route','reject','Unknown path.');return reply(404,{message:'No route for this path.'});}
    if(!routes[request.path].includes(request.method)){record('method','reject','Method unsupported for the known path.');return reply(405,{message:'Method not allowed for this path.'},{Allow:routes[request.path].join(', ')});}
    record('method','accept','Known route and allowed method.');
    if(request.path==='/workshops'){
        record('access','public','The catalog is public; no recognized identity is required.');
        return reply(200,{message:'Public workshop catalog.',workshops:state.workshops.map(w=>({...w}))});
    }
    const fixtures={'Bearer fixture-learner':{id:'user-1',role:'learner',name:'Demo Learner'},'Bearer fixture-admin':{id:'user-2',role:'admin',name:'Demo Administrator'}};
    const credential=request.headers?.Authorization;
    const user=typeof credential==='string'&&Object.prototype.hasOwnProperty.call(fixtures,credential)?fixtures[credential]:null;
    if(!user){record('identity','reject','No recognized fixture credential.');return reply(401,{message:'A recognized identity fixture is required.'},{'WWW-Authenticate':'Bearer realm="local-lab"'});}
    record('identity','accept',user.id+' recognized as '+user.role+'.');
    if(request.path==='/admin/report'){
        if(user.role!=='admin'){record('permission','reject','Administrator role required.');return reply(403,{message:'This recognized identity cannot view the administrator report.'});}
        record('permission','accept','Administrator role accepted.');
        return reply(200,{message:'Administrator aggregate report.',bookingCount:state.bookings.length,reservedSeats:state.bookings.reduce((n,b)=>n+b.seats,0),remainingSeats:state.workshops.reduce((n,w)=>n+w.remaining,0)});
    }
    if(request.path==='/profile')return reply(200,{message:'Recognized identity profile.',profile:{...user}});
    if(request.method==='GET'){
        record('ownership','filter','Return only records owned by '+user.id+'.');
        return reply(200,{message:'Own bookings for '+user.id+'.',bookings:state.bookings.filter(b=>b.ownerId===user.id).map(b=>({...b}))});
    }
    const mediaType=request.headers?.['Content-Type'];
    if(typeof mediaType!=='string'||mediaType.split(';')[0].trim().toLowerCase()!=='application/json'){
        record('body','reject','Booking create requires application/json.');return reply(415,{message:'Booking create requires application/json.'});
    }
    if(typeof request.body!=='string'||request.body.length>2048){record('body','reject','Body is absent or exceeds the local 2048-character bound.');return reply(400,{message:'Expected JSON text of at most 2048 characters.'});}
    let parsed;
    try{parsed=JSON.parse(request.body);record('parse','accept','JSON syntax accepted.');}
    catch{record('parse','reject','Malformed JSON.');return reply(400,{message:'Malformed JSON body.'});}
    let accepted;
    try{accepted=wt20ValidateBooking(parsed);record('validation','accept','Exact shape, workshop enum and numeric seats accepted.');}
    catch(error){record('validation','reject',error.message);return reply(400,{message:error.message});}
    const workshop=state.workshops.find(w=>w.id===accepted.workshopId);
    if(accepted.seats>workshop.remaining){record('capacity','reject','Requested '+accepted.seats+'; remaining '+workshop.remaining+'.');return reply(409,{message:'Not enough places remain.',remaining:workshop.remaining});}
    record('capacity','accept','Requested seats fit the current remaining count.');
    if(fault==='server'){record('commit','reject','Simulated server failure occurred before mutation.');return reply(500,{message:'Simulated operation failed before commit. No booking was created.'});}
    if(fault!=='normal'){record('commit','reject','Unknown simulation mode; no mutation.');return reply(500,{message:'Unknown simulation mode. No booking was created.'});}
    const booking={id:'booking-'+state.nextId,ownerId:user.id,workshopId:accepted.workshopId,seats:accepted.seats};
    // A synchronous local teaching commit, not a database transaction.
    workshop.remaining-=accepted.seats;state.bookings.push(booking);state.nextId++;
    record('commit','accept','Created '+booking.id+' for '+user.id+'; remaining '+workshop.remaining+'.');
    return reply(201,{message:'Mock booking created.',booking:{...booking}});
}
document.addEventListener('DOMContentLoaded', () => {
    const byId=id=>document.getElementById('wt20'+id);
    const method=byId('Method'),path=byId('Path'),identity=byId('Identity'),type=byId('Type'),body=byId('Body'),fault=byId('Fault');
    const requestNode=byId('Request'),traceNode=byId('Trace'),responseNode=byId('Response'),stateNode=byId('State'),status=byId('Status');
    let state=wt20CreateState();
    const displayState=()=>{stateNode.textContent=JSON.stringify({workshops:state.workshops,bookings:state.bookings},null,2);};
    const process=()=>{
        const tokens={guest:null,learner:'fixture-learner',admin:'fixture-admin',expired:'fixture-expired'};
        const token=Object.prototype.hasOwnProperty.call(tokens,identity.value)?tokens[identity.value]:'fixture-unrecognized';
        const headers={};if(token)headers.Authorization='Bearer '+token;if(method.value==='POST')headers['Content-Type']=type.value;
        const request={method:method.value,path:path.value,headers,body:method.value==='POST'?body.value:null};
        requestNode.textContent=JSON.stringify(request,null,2);
        const result=wt20HandleRequest(request,state,fault.value);
        traceNode.textContent=JSON.stringify(result.trace,null,2);responseNode.textContent=JSON.stringify(result.response,null,2);displayState();
        responseNode.dataset.state=result.response.status<400?'success':'rejected';
        status.textContent='Simulated response '+result.response.status+' · '+result.response.body.message+(result.response.status===201?' Mock records changed.':' Mock records were not changed by this request.');
    };
    byId('Send').addEventListener('click',process);
    byId('Reset').addEventListener('click',()=>{
        state=wt20CreateState();method.value='GET';path.value='/workshops';identity.value='guest';type.value='application/json';body.value='{"workshopId":"html","seats":1}';fault.value='normal';
        requestNode.textContent='No request yet.';traceNode.textContent='No trace yet.';responseNode.textContent='No response yet.';responseNode.dataset.state='idle';displayState();
        status.textContent='Simulator reset. Starting places restored and all mock bookings cleared. No real records were affected.';
    });
    displayState();responseNode.dataset.state='idle';
    const skip=document.querySelector('.wt20-skip-link');if(skip)skip.addEventListener('click',()=>{const main=document.getElementById('wt20Main');if(main)main.focus({preventScroll:true});});
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
    document.getElementById("wt20QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-20-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 20 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 20 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
