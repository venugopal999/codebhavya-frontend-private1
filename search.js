(function(){
    'use strict';
    const $=id=>document.getElementById(id),form=$('cb-search-form'),input=$('cb-query'),course=$('cb-course'),type=$('cb-type'),results=$('cb-results'),status=$('cb-search-status'),more=$('cb-show-more');
    let rows=[],matches=[],shown=0,timer=0;
    const pageSize=20;
    function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
    function addResults(){
        const batch=matches.slice(shown,shown+pageSize);
        batch.forEach(r=>{
            const card=el('article',undefined,'cb-search-card'),meta=el('div',undefined,'cb-search-meta');
            meta.append(el('span',r.course),el('span',r.type));
            const h=el('h3'),a=el('a',r.title);a.href=r.url;h.append(a);
            card.append(meta,h,el('p',r.description));results.append(card);
        });
        shown+=batch.length;more.hidden=shown>=matches.length;
        status.textContent=matches.length+' result'+(matches.length===1?'':'s')+' · showing '+shown;
    }
    function render(syncUrl){
        matches=window.CodeBhavyaSearch.search(rows,input.value,course.value,type.value);shown=0;results.replaceChildren();
        $('cb-results-heading').textContent=input.value.trim()?'Search results':'Explore the library';
        if(syncUrl){
            const params=new URLSearchParams();if(input.value.trim())params.set('q',input.value.trim());if(course.value)params.set('course',course.value);if(type.value)params.set('type',type.value);
            // Replace one entry; never build a search history in browser storage.
            try{history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}catch(_){}
        }
        addResults();
        if(!matches.length){const empty=el('div',undefined,'cb-search-empty');empty.append(el('h3','No matching topics yet'),el('p','Try a shorter topic, check the spelling, or choose All courses and languages. Search matches lesson titles, descriptions and topic headings.'));
            const a=el('a','Browse Lab Programs');a.href='Labs/index.html';empty.append(a);results.append(empty);}
        results.setAttribute('aria-busy','false');
    }
    function readUrl(){const p=new URLSearchParams(location.search);input.value=(p.get('q')||'').slice(0,160);course.value=p.get('course')||'';type.value=p.get('type')||'';render(false);}
    function reset(){clearTimeout(timer);form.reset();render(true);input.focus();}
    form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);render(true);});
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(true),180);});
    [course,type].forEach(s=>s.addEventListener('change',()=>render(true)));
    $('cb-clear').addEventListener('click',reset);
    document.querySelectorAll('[data-topic]').forEach(b=>b.addEventListener('click',()=>{clearTimeout(timer);input.value=b.dataset.topic;course.value='';type.value='';render(true);input.focus();}));
    more.addEventListener('click',()=>{const previous=shown;addResults();const next=results.children[previous]?.querySelector('a');if(next)next.focus();});
    window.addEventListener('popstate',readUrl);
    fetch('search-index.json?v=1',{credentials:'omit'}).then(r=>{if(!r.ok)throw Error('index unavailable');return r.json();}).then(data=>{
        if(!Array.isArray(data.pages)||!window.CodeBhavyaSearch)throw Error('index format');
        rows=window.CodeBhavyaSearch.prepare(data.pages.filter(r=>typeof r.url==='string'&&r.url.startsWith('/')&&!r.url.startsWith('//')&&typeof r.title==='string'));
        [...new Set(rows.map(r=>r.course))].sort().forEach(c=>{const o=el('option',c);o.value=c;course.append(o);});
        readUrl();
    }).catch(()=>{
        results.setAttribute('aria-busy','false');status.textContent='Search could not load. Refresh the page to try again.';
        const p=el('p',undefined,'cb-search-empty'),a=el('a','Browse the course menu or open Lab Programs');a.href='Labs/index.html';p.append(a);results.replaceChildren(p);more.hidden=true;
    });
})();
