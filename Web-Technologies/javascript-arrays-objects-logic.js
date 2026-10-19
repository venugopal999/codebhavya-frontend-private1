"use strict";
function wt15Source(dataset) {
    switch (dataset) {
        case 'empty': return [];
        case 'full': return [{id:'f1',title:'HTML',capacity:20,reserved:20},{id:'f2',title:'CSS',capacity:10,reserved:10}];
        case 'ties': return [{id:'t1',title:'HTML',capacity:20,reserved:10},{id:'t2',title:'CSS',capacity:15,reserved:5},{id:'t3',title:'JavaScript',capacity:10,reserved:0}];
        default: return [{id:'w1',title:'HTML',capacity:30,reserved:12},{id:'w2',title:'CSS',capacity:20,reserved:20},{id:'w3',title:'JavaScript',capacity:40,reserved:10},{id:'w4',title:'Accessibility',capacity:12,reserved:0}];
    }
}
function wt15Query(dataset, search, filter, order) {
    dataset = ['normal','empty','full','ties'].includes(dataset) ? dataset : 'normal';
    filter = ['all','available','full'].includes(filter) ? filter : 'available';
    order = ['source','desc','asc','title'].includes(order) ? order : 'desc';
    search = String(search);
    const source = wt15Source(dataset);
    if (search.length > 64) return {ok:false,source,explanation:'Limit the title search to 64 characters, then run again.'};
    const query = search.trim().toLowerCase();
    const enriched = source.map(w => ({...w,remaining:w.capacity-w.reserved}));
    const selected = enriched.filter(w => w.title.toLowerCase().includes(query) && (filter === 'all' || (filter === 'available' ? w.remaining > 0 : w.remaining === 0)));
    const results = [...selected];
    const compareText = (a,b) => a < b ? -1 : a > b ? 1 : 0;
    if (order !== 'source') results.sort((a,b) => {
        const primary = order === 'desc' ? b.remaining-a.remaining : order === 'asc' ? a.remaining-b.remaining : compareText(a.title.toLowerCase(),b.title.toLowerCase());
        return primary || compareText(a.id,b.id);
    });
    const titles = results.map(w => w.title);
    const summary = {count:results.length,totalRemaining:results.reduce((total,w)=>total+w.remaining,0),anyAvailable:results.some(w=>w.remaining>0),everyFull:results.every(w=>w.remaining===0)};
    const criterion = filter === 'all' ? 'true' : filter === 'available' ? 'w.remaining > 0' : 'w.remaining === 0';
    const sorter = order === 'desc' ? 'b.remaining - a.remaining || compareText(a.id, b.id)' : order === 'asc' ? 'a.remaining - b.remaining || compareText(a.id, b.id)' : 'compareText(a.title.toLowerCase(), b.title.toLowerCase()) || compareText(a.id, b.id)';
    const code = 'const query = '+JSON.stringify(query)+';\nconst enriched = source.map(w => ({\n  ...w, remaining: w.capacity - w.reserved\n}));\nconst selected = enriched.filter(w =>\n  w.title.toLowerCase().includes(query) && ('+criterion+')\n);\nconst results = [...selected];\n'+(order === 'source' ? '// Keep source order.\n' : 'const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;\nresults.sort((a, b) => '+sorter+');\n')+'const titles = results.map(w => w.title);\nconst totalRemaining = results.reduce((total, w) => total + w.remaining, 0);\nconst anyAvailable = results.some(w => w.remaining > 0);\nconst everyFull = results.every(w => w.remaining === 0);';
    const explanation = results.length ? 'Selected '+results.length+' workshop'+(results.length===1?'':'s')+' with '+summary.totalRemaining+' remaining seats. Source fields and order are preserved. Equal sort keys use the ID as a tie rule.' : 'No matching workshops. Count and total are zero; some available is false. Raw every full is true because no item fails its predicate, not because a full workshop exists.';
    return {ok:true,dataset,query,filter,order,source,results,titles,summary,code,explanation};
}
document.addEventListener('DOMContentLoaded', () => {
    const controls = {};
    for (const name of ['Dataset','Search','Filter','Order']) controls[name.toLowerCase()] = document.getElementById('wt15'+name);
    const status = document.getElementById('wt15Status');
    const show = announce => {
        const data = wt15Query(controls.dataset.value,controls.search.value,controls.filter.value,controls.order.value);
        document.getElementById('wt15Source').textContent = JSON.stringify(data.source,null,2);
        document.getElementById('wt15Code').textContent = data.ok ? data.code : 'Query not run: search length exceeds the lab limit.';
        document.getElementById('wt15Result').textContent = data.ok ? JSON.stringify({selectedRecords:data.results,titles:data.titles,summary:data.summary},null,2) : 'Input rejected';
        document.getElementById('wt15Explanation').textContent = data.explanation;
        if (announce) status.textContent = data.ok ? 'Query complete: '+data.summary.count+' records, '+data.summary.totalRemaining+' remaining seats.' : 'Input rejected. '+data.explanation;
    };
    for (const name of ['dataset','filter','order']) controls[name].addEventListener('change', () => show(true));
    controls.search.addEventListener('keydown', event => { if (event.key === 'Enter') {event.preventDefault();show(true);} });
    document.getElementById('wt15Run').addEventListener('click', () => show(true));
    document.getElementById('wt15Reset').addEventListener('click', () => {
        controls.dataset.value='normal';controls.search.value='';controls.filter.value='available';controls.order.value='desc';
        show(false);status.textContent='Lab reset: three available workshops and 60 remaining seats.';
    });
    show(false);
    const skip = document.querySelector('.wt15-skip-link');
    if (skip) skip.addEventListener('click', () => { const main=document.getElementById('wt15Main');if(main)main.focus({preventScroll:true}); });
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
    document.getElementById("wt15QuizReset").addEventListener("click", () => {
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
    const key = "codebhavya-wt-level-15-completed";
    const showCompleted = () => {
        completion.textContent = "✓ Level 15 Completed";
        completion.classList.add("completed");
        message.textContent = "Level 15 marked complete on this device.";
    };
    try { if (localStorage.getItem(key) === "true") showCompleted(); } catch { /* Reading stays available without storage. */ }
    completion.addEventListener("click", () => {
        showCompleted();
        try { localStorage.setItem(key, "true"); }
        catch { message.textContent = "Completed for this visit. Browser storage is unavailable, so this marker cannot be saved."; }
    });
});
